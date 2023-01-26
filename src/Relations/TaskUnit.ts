import { v4 as uuidv4 } from "uuid";
import { EventHistoryInvalidError, PrematureTaskStartError } from "../Error";
import { assertIsObject } from "../typePredicates";
import {
  EventType,
  InterpolatedTaskEvent,
  RelationshipMapping,
  TaskEvent,
} from "../types";
import { assumedReqTime } from "./constants";

export default class TaskUnit {
  public readonly id: string;
  /**
   * The direct dependencies of this {@link TaskUnit}.
   */
  private _providedDirectDependencies: TaskUnit[];
  private _directDependencies: Set<TaskUnit>;
  private _allDependencies: Set<TaskUnit>;
  private _attachmentMap: RelationshipMapping;
  private _attachmentToDependencies: number;
  private _presenceTime: number;
  /**
   * The earliest possible time (in milliseconds since epoch) this task is allowed to start according to when its
   * dependencies are pressumed to be finished by. This is the earliest the apparent start time could possibly be.
   */
  private _earliestPossibleStartTime: number;
  private _apparentStartDate: Date;
  private _apparentEndDate: Date;
  public projectedHistory: TaskEvent[] = [];
  public interpolatedEventHistory: InterpolatedTaskEvent[];
  constructor(
    parentUnits: TaskUnit[],
    public readonly anticipatedStartDate: Date,
    public readonly anticipatedEndDate: Date,
    public readonly name: string = "unknown",
    public eventHistory: TaskEvent[] = []
  ) {
    this.id = uuidv4();
    this._providedDirectDependencies = parentUnits;
    this._directDependencies = this._getTrueDirectDependencies();
    this._earliestPossibleStartTime = this._getEarliestPossibleStartTime();
    this._validateEventHistory();
    // Figure out the apparent start date

    // If the first event exists it must be TaskIterationStarted. If that's the case, use that date for the apparent
    // start date. If not, base it off of either the latest dependency apparent end date, or this unit's anticipated
    // start date. Whichever is later.
    const firstEvent = this.eventHistory[0];
    if (firstEvent) {
      this._apparentStartDate = firstEvent.date;
    } else {
      const latestRequiredDate = new Date(
        Math.max(
          this._earliestPossibleStartTime,
          this.anticipatedStartDate.getTime()
        )
      );
      this._apparentStartDate = latestRequiredDate;
    }

    this._buildProjectedHistory();
    this.interpolatedEventHistory = [
      ...this.eventHistory.map((e) => ({
        ...e,
        projected: false,
      })),
      ...this.projectedHistory.map((e) => ({
        ...e,
        projected: true,
      })),
    ];
    const lastConceivedEvent = [...this.eventHistory, ...this.projectedHistory][
      this.eventHistory.length + this.projectedHistory.length - 1
    ];
    assertIsObject(lastConceivedEvent);
    this._apparentEndDate = lastConceivedEvent.date;
    this._presenceTime =
      this._apparentEndDate.getTime() - this.anticipatedStartDate.getTime();
    this._allDependencies = this._getAllDependencies();
    this._attachmentMap = this._buildAttachmentMap();
    this._attachmentToDependencies = this._calculateAttachmentToDependencies();
  }
  get apparentEndDate(): Date {
    return this._apparentEndDate;
  }
  set apparentEndDate(date: Date) {
    this._apparentEndDate = date;
    this._presenceTime =
      this._apparentEndDate.getTime() - this.anticipatedStartDate.getTime();
  }
  get apparentStartDate(): Date {
    return this._apparentStartDate;
  }
  /**
   * The amount of "presence" this unit would have on a graph.
   *
   * "Presence":
   *
   * Every {@link TaskUnit} will need to be rendered on a graph more or less as a rectangle, with a "snail trail"
   * directly behind (if it's been delayed) it to show how much it has been delayed from its original start date. Each
   * unit must have a horizontal space available on the graph to be placed without overlapping the space needed for
   * other {@link TaskUnit}s.
   *
   * "Presence" is the horizontal space a {@link TaskUnit} would take up.
   */
  get presenceTime(): number {
    return this._presenceTime;
  }
  /**
   * Validate that the event history makes sense.
   *
   * The rules for provided events are as follows:
   *
   * 1. Provided events should not be able to be in the future.
   * 2. The first event, if provided, should be a TaskIterationStarted event.
   * 3. Any TaskIterationStarted should only be preceded by nothing (meaning it's the first event), or a
   *    ReviewedAndNeedsRebuild event.
   * 4. Any TaskIterationStarted event should be followed by either nothing (meaning the task is still in progress) or a
   *    review event of some sort.
   * 5. The only review result that is not allowed to have any other event after it is ReviewedAndAccepted (because it
   *    means there should be nothing left to do).
   * 6. The only review result that can have at most one event after it is ReviewedAndNeedsMinorRevision (because the
   *    only possible event).
   * 7. Any ReviewedAndNeedsMinorRevision event should be followed by either nothing (meaning the task is still in
   *    progress) or a MinorRevisionComplete event.
   * 8. Any ReviewedAndNeedsMajorRevision event should be followed by either nothing (meaning the task is still in
   *    progress) or another review result (and possibly other events after that depending on the result).
   * 9. Any ReviewedAndNeedsRebuild event should be followed by either nothing (meaning the new requirements haven't
   *    been accepted yet) or a TaskIterationStarted event (and possibly other events according to the other rules).
   */
  private _validateEventHistory(): void {
    const firstEvent = this.eventHistory[0];
    if (firstEvent) {
      if (
        !this._shouldBeAbleToStart() ||
        firstEvent.date.getTime() < this._earliestPossibleStartTime
      ) {
        throw new PrematureTaskStartError(
          "Task was started before it should have been allowed to."
        );
      } else {
        // It's allowed to start and the first event's date is on or after the earliest possible time it's allowed to
        // start.
      }
    } else {
      // This task hasn't been started yet, so there's no need to check if it was started before it should have.
    }
    const now = new Date();
    this.eventHistory.forEach((event, index) => {
      // Don't check the next event if it can be helped, because if there is a next event, it'll have its turn to check
      // previous events, and that presents much narrower criteria to check.
      const prevEvent = this.eventHistory[index - 1];
      if (prevEvent) {
        // Make sure the dates are in order.
        if (prevEvent.date >= event.date) {
          throw new EventHistoryInvalidError(
            "Events must be provided in chronological order."
          );
        }
      }
      // if (event.date > now) {
      //   throw new EventHistoryInvalidError("Events cannot be in the future.");
      // }
      switch (event.type) {
        case EventType.TaskIterationStarted:
          if (prevEvent) {
            if (prevEvent.type !== EventType.ReviewedAndNeedsRebuild) {
              // The previous event was not a ReviewedAndNeedsRebuild event, so this event doesn't make sense.
              throw new EventHistoryInvalidError(
                "TaskIterationStarted event can only be the first event or follow a ReviewedAndNeedsRebuild event."
              );
            } else {
              // This event follows a ReviewedAndNeedsRebuild event, which means the updated prereqs were accepted and
              // the task has started again, so it's all good.
            }
          } else {
            // Nothing was before this event, so it's all good, since this means the task has only started for the first
            // time.
          }
          break;
        case EventType.MinorRevisionComplete:
          if (prevEvent) {
            if (prevEvent.type === EventType.ReviewedAndNeedsMinorRevision) {
              // The previous event was a ReviewedAndNeedsMinorRevision event, so this event means the task should be
              // completely finished.
              break;
            }
          }
          // There either was no previous event, or the previous event was not a ReviewedAndNeedsMinorRevision event, so
          // a MinorRevisionComplete event here doesn't make any sense.
          throw new EventHistoryInvalidError(
            "MinorRevisionComplete event can only be after a ReviewedAndNeedsMinorRevision event."
          );
        case EventType.ReviewedAndAccepted:
        case EventType.ReviewedAndNeedsMajorRevision:
        case EventType.ReviewedAndNeedsMinorRevision:
        case EventType.ReviewedAndNeedsRebuild:
          // Review results events
          if (prevEvent) {
            if (
              prevEvent.type === EventType.ReviewedAndNeedsMajorRevision ||
              prevEvent.type === EventType.TaskIterationStarted
            ) {
              // The previous event was either a TaskIterationStarted or ReviewedAndNeedsMajorRevision event, so this is
              // all good.
              break;
            }
          }
          // There either was no previous event, or the previous event was not a TaskIterationStarted event nor a
          // ReviewedAndNeedsMajorRevision event, so a review event here doesn't make any sense.
          throw new EventHistoryInvalidError(
            "Review events can only be after a TaskIterationStarted or ReviewedAndNeedsMajorRevision event."
          );
      }
      if (
        event.type === EventType.MinorRevisionComplete ||
        event.type === EventType.ReviewedAndAccepted
      ) {
        // These events signal the absolute end of all work for this task. It should have no events after either of
        // these events if they are present.
        const nextEvent = this.eventHistory[index + 1];
        if (nextEvent) {
          // An event was found after the review was accepted.
          throw new EventHistoryInvalidError(
            "Once the review has been accepted or the minor revision completed, nothing else can happen."
          );
        } else {
          // Nothing exists after this event so it's all good, since this means all work is done with this task.
        }
      } else {
        // There's still more work to be done after this event, so if there are other events, it's sometimes ok, and
        // they'll be evaluated in the next iteration of this loop.
      }
    });
  }
  /**
   * Sometimes, provided dependencies may be redundant. This can occur if a provided direct dependency is provided by
   * another direct dependency. This function strips out those redundancies and returns a set of units without the
   * redundant ones.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ D ┗━━━┛E
   * ```
   *
   * `E` has a redundant dependency on `A`, because it is provided through either `B` or `D`.
   *
   * @returns a set of task units that aren't dependent on each other
   */
  private _getTrueDirectDependencies(): Set<TaskUnit> {
    const trueDirect = this._providedDirectDependencies.filter(
      (unit) =>
        !this._providedDirectDependencies.some((dep) => dep.isDependentOn(unit))
    );
    return new Set(trueDirect);
  }
  /**
   * Get the earliest possible time this unit could possibly start, given it's dependencies.
   *
   * This is used to figure out when the unit's apparent start time is. When tasks haven't been completed, we don't know
   * when they'll be done, and so we can't know when their dependents will start. But when we estimate the completion
   * time, it lets us figure out when the unit could possibly start. This looks at when each of the unit's direct
   * dependencies are apparently ending, and provides the latest time from those.
   *
   * This is also used to determine if the task is allowed to have started when it claims to have been started. If all
   * of the dependencies are completed, this still shouldn't be able to start before they were claimed to have been
   * finished.
   *
   * @returns the time in ms of the apparent end time of the last apparently finished direct dependency
   */
  private _getEarliestPossibleStartTime(): number {
    const depApparentEndDates = [...this.directDependencies].map((unit) =>
      unit.apparentEndDate.getTime()
    );
    // There may be no deps here, and the unit's apparent start date may have been set explicitely. If the apparent
    // start date wasn't set explicitely, it would be the anticipated start date, which also works. We'll consider both
    // to find out how far the unit was pushed into the future.
    const earliestTime = Math.max(...depApparentEndDates);
    return earliestTime;
  }
  /**
   * Create a simple, projected history of what the task could be based on the last event provided for it.
   *
   * This is to help make both rendering and reasoning about the unit times easier.
   */
  private _buildProjectedHistory() {
    const estimatedTaskDuration =
      this.anticipatedEndDate.getTime() - this.anticipatedStartDate.getTime();
    // If the last event is EventType.ReviewedAndAccepted, then update the apparent end date to that date. Otherwise,
    // estimate the apparent end date relative to the apparent start date.
    const lastEvent = this.eventHistory[this.eventHistory.length - 1];
    if (lastEvent) {
      switch (lastEvent.type) {
        case EventType.ReviewedAndAccepted:
          // nothing to project
          break;
        case EventType.ReviewedAndNeedsRebuild:
          // needs to start the task (which implies getting new reqs) and then pass review
          var reqFinishedDate = new Date(
            lastEvent.date.getTime() + assumedReqTime
          );
          this.projectedHistory.push({
            type: EventType.TaskIterationStarted,
            date: reqFinishedDate,
          });
          var taskEndDate = new Date(
            reqFinishedDate.getTime() + estimatedTaskDuration
          );
          this.projectedHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
        case EventType.ReviewedAndNeedsMajorRevision:
          // needs to start the task (which can be assumed to have started as soon as the review was done) and then pass
          // review
          var taskEndDate = new Date(
            lastEvent.date.getTime() + estimatedTaskDuration
          );
          this.projectedHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
        case EventType.ReviewedAndNeedsMinorRevision:
          // needs to start the task (which can be assumed to have started as soon as the review was done)
          var taskEndDate = new Date(
            lastEvent.date.getTime() + estimatedTaskDuration
          );
          this.projectedHistory.push({
            type: EventType.MinorRevisionComplete,
            date: taskEndDate,
          });
          break;
        case EventType.TaskIterationStarted:
          // needs time to complete the task
          var taskEndDate = new Date(
            lastEvent.date.getTime() + estimatedTaskDuration
          );
          this.projectedHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
      }
    } else {
      // literally no history
      // add task started event
      this.projectedHistory.push({
        type: EventType.TaskIterationStarted,
        date: this.apparentStartDate,
      });
      const taskEndDate = new Date(
        this._apparentStartDate.getTime() + estimatedTaskDuration
      );
      this.projectedHistory.push({
        type: EventType.ReviewedAndAccepted,
        date: taskEndDate,
      });
    }
  }
  /**
   * The direct dependencies of this {@link TaskUnit}.
   *
   * Sometimes references to units can be provided redundantly. For example, if `A` depends on `B` and `C`, but `B` also
   * depends on `C`, then `A`'s dependency on C is implied my the transitive property. This property provides access to
   * only the direct dependencies that are not redundant in this way.
   */
  get directDependencies(): Set<TaskUnit> {
    return this._directDependencies;
  }
  /**
   * All task units this unit depends on.
   */
  private _getAllDependencies(): Set<TaskUnit> {
    const deps = new Set<TaskUnit>(this.directDependencies);
    this.directDependencies.forEach((parentUnit) =>
      parentUnit.getAllDependencies().forEach((depUnit) => deps.add(depUnit))
    );
    return deps;
  }
  /**
   * All task units this unit depends on.
   */
  getAllDependencies(): Set<TaskUnit> {
    return this._allDependencies;
  }
  /**
   * A map of the IDs of the units this unit is dependent on to the number of paths it has to those units.
   */
  get attachmentMap(): RelationshipMapping {
    return this._attachmentMap;
  }
  /**
   * Determine the numer of possible paths this unit can take to each of its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * `B` has 1 path to `D`, but none to `C`, even though `C` is dependent on it. Both `E` and `F` also have a single
   * path to `D`. However, because `F` has a path to `B`, `E, and `F`, the number of potential paths it has to `D` is
   * the sum of all its dependencies paths to it. In this case, it has 3 paths to `D`: `F->B->D`; `F->E->D`; and
   * `F->H->D`.
   *
   * In contrast to this, it has 2 paths to `A`: `F->B->A`; and `F->E->A`.
   *
   * Redundant paths can occur, for example, if `F` also had a direct dependency on `A`, like so:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ E ┗━━━┛F
   * ```
   *
   * These redundant paths should be ignored. So in this example, the only accepted paths to `A` from `F` would still
   * be: `F->B->A`; and `F->E->A`.
   */
  private _buildAttachmentMap(): RelationshipMapping {
    const mapping: RelationshipMapping = {};
    for (let dep of this.directDependencies) {
      // This must be the earliest point in the chain that this unit is a direct dependency, so there is only 1 path
      // to this unit from here.
      mapping[dep.id] = 1;
      // Additionally, any paths to its dependencies can be reached from here, so lets add its total paths to those
      // depencies to any other paths to them that we've seen from other dependencies.
      for (let [key, value] of Object.entries(dep.attachmentMap)) {
        // assign it to 0 if it's not already set
        mapping[key] ??= 0;
        mapping[key] += value;
      }
    }
    return mapping;
  }
  /**
   * The number of potential paths to a given unit following the chains of dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * `B` has 1 path to `D`, but none to `C`, even though `C` is dependent on it. Both `E` and `F` also have a single
   * path to `D`. However, because `F` has a path to `B`, `E, and `F`, the number of potential paths it has to `D` is
   * the sum of all its dependencies paths to it. In this case, it has 3 paths to `D`: `F->B->D`; `F->E->D`; and
   * `F->H->D`.
   *
   * In contrast to this, it has 2 paths to `A`: `F->B->A`; and `F->E->A`.
   *
   * Redundant paths can occur, for example, if `F` also had a direct dependency on `A`, like so:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ E ┗━━━┛F
   * ```
   *
   * These redundant paths should be ignored. So in this example, the only accepted paths to `A` from `F` would still
   * be: `F->B->A`; and `F->E->A`.
   *
   * @param unit The unit to get the number of paths to from this unit
   * @returns a number representing the number of potential paths to a given unit
   */
  getNumberOfPathsToDependency(unit: TaskUnit): number {
    const pathCount = this._attachmentMap[unit.id];
    if (pathCount === undefined) {
      // there must not be a path
      return 0;
    }
    return pathCount;
  }
  /**
   * The amount of paths this unit can go through its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B
   *                ╳       ╲
   *          ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *                ╳       ╱
   *          ┏━━━┓╱_╲┏━━━┓╱
   *         G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `F` has a total attachment of 7 to all of its dependents, because that's the number of paths it can take to the
   * ends of each of its available tails. Those paths are:
   *
   * 1. `F->B->A`
   * 2. `F->B->D`
   * 3. `F->E->A`
   * 4. `F->E->D`
   * 5. `F->E->G`
   * 6. `F->H->D`
   * 7. `F->H->G`
   */
  get attachmentToDependencies(): number {
    return this._attachmentToDependencies;
  }
  /**
   * Claculate the amount of paths this unit can go through its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B
   *                ╳       ╲
   *          ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *                ╳       ╱
   *          ┏━━━┓╱_╲┏━━━┓╱
   *         G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `F` has a total attachment of 7 to all of its dependents, because that's the number of paths it can take to the
   * ends of each of its available tails. Those paths are:
   *
   * 1. `F->B->A`
   * 2. `F->B->D`
   * 3. `F->E->A`
   * 4. `F->E->D`
   * 5. `F->E->G`
   * 6. `F->H->D`
   * 7. `F->H->G`
   *
   * Note: This is only used in the constructor to cache the value.
   *
   */
  private _calculateAttachmentToDependencies(): number {
    return [...this.directDependencies].reduce(
      (acc, dep) => acc + (dep.attachmentToDependencies || 1),
      0
    );
  }
  /**
   * Check whether or not the passed unit is a dependency of this unit.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is dependent on the passed unit, false, if not
   */
  isDependentOn(unit: TaskUnit): boolean {
    return this._allDependencies.has(unit);
  }
  /**
   * @returns true, if the task has been reviewed and completed, false, if not
   */
  isComplete(): boolean {
    const lastEvent = this.eventHistory[this.eventHistory.length - 1];
    if (lastEvent && lastEvent.type === EventType.ReviewedAndAccepted) {
      return true;
    }
    return false;
  }
  /**
   *
   * @returns true, if all the direct dependencies are completed, false, if not
   */
  private _shouldBeAbleToStart(): boolean {
    return [...this.directDependencies].every((unit) => unit.isComplete());
  }
}
