import { v4 as uuidv4 } from "uuid";
import { PrematureTaskStartError } from "../Error";
import { assertIsObject } from "../typePredicates";
import {
  EventType,
  InterpolatedTaskEvent,
  RelationshipMapping,
  TaskEvent
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
    const earliestPossibleTime = this._getEarliestPossibleStartTime();
    // If the first event exists and is not EventType.TaskStarted, throw an Error. If it exists but is
    // EventType.TaskStarted, use it as the apparent start date. Otherwise, stick with the initial start date.
    const firstEvent = this.eventHistory[0];
    if (firstEvent) {
      if (firstEvent.type !== EventType.TaskIterationStarted) {
        throw new Error(
          `The first event is always TaskStarted (${EventType.TaskIterationStarted}), not ${firstEvent.type}`
        );
      }
      if (
        !this._shouldBeAbleToStart() ||
        firstEvent.date.getTime() < earliestPossibleTime
      ) {
        throw new PrematureTaskStartError(
          "Task was started before it should have been allowed to."
        );
      }
      this._apparentStartDate = firstEvent.date;
    } else {
      const latestRequiredDate = new Date(
        Math.max(earliestPossibleTime, this.anticipatedStartDate.getTime())
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
