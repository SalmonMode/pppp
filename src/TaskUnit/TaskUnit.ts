import { EventHistoryInvalidError, PrematureTaskStartError } from "@errors";
import type ITaskUnit from "@typing/ITaskUnit";
import type { RelationshipMapping } from "@typing/Mapping";
import {
  EventType,
  type ITaskPrerequisites,
  type ITaskUnitParameters,
  type TaskEvent,
} from "@typing/TaskUnit";
import { add, differenceInSeconds, max } from "date-fns";
import { assertIsObject, isUndefined } from "primitive-predicates";
import { v4 as uuidv4 } from "uuid";

export default class TaskUnit implements ITaskUnit {
  public readonly id: string;
  public anticipatedEndDate: Date;
  public anticipatedStartDate: Date;
  public name: string;
  public explicitEventHistory: TaskEvent[];
  public prerequisitesIterations: ITaskPrerequisites[];
  /**
   * The direct dependencies of this {@link TaskUnit} as provided to the constructor. These may not be the true direct
   * dependencies, but it can be helpful to have this information.
   */
  private _providedDirectDependencies: ITaskUnit[];
  private _directDependencies: Set<ITaskUnit>;
  private _staleDirectDependencies: Set<ITaskUnit>;
  private _allDependencies: Set<ITaskUnit>;
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
  public projectedEventHistory: TaskEvent[] = [];
  constructor({
    now,
    anticipatedEndDate,
    anticipatedStartDate,
    name,
    eventHistory = [],
    prerequisitesIterations = [],
  }: ITaskUnitParameters) {
    this.anticipatedEndDate = anticipatedEndDate;
    this.anticipatedStartDate = anticipatedStartDate;
    this.name = name;
    this.explicitEventHistory = eventHistory;
    this.prerequisitesIterations = prerequisitesIterations;
    this.id = uuidv4();
    const latestPrereqsIteration =
      prerequisitesIterations[prerequisitesIterations.length - 1];
    let parentUnits: ITaskUnit[] | undefined;
    if (latestPrereqsIteration) {
      parentUnits = latestPrereqsIteration.parentUnits;
    }
    this._providedDirectDependencies = parentUnits || [];
    this._directDependencies = this._getTrueDirectDependencies();
    this._staleDirectDependencies = this._getStaleDirectDependencies();
    this._earliestPossibleStartTime = this._getEarliestPossibleStartTime();
    this._validateEventHistory();
    this._apparentStartDate = this._determineApparentStartDate();

    this._buildProjectedHistory(now);
    const lastConceivedEvent = [
      ...this.explicitEventHistory,
      ...this.projectedEventHistory,
    ][this.explicitEventHistory.length + this.projectedEventHistory.length - 1];
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
  get apparentStartDate(): Date {
    return this._apparentStartDate;
  }
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
   * 10. Any TaskIterationStarted event must be associated with a prerequisites iteration that has been approved.
   * 11. Any TaskIterationStarted event that is after a ReviewedAndNeedsRebuild event must be associated with a later
   *     prerequisites iteration than the TaskIterationStarted event that came before it.
   */
  private _validateEventHistory(): void {
    const now = new Date();
    /**
     * Used to track which prereq iteration the TaskIterationStarted events should be pointing to.
     */
    let expectedPrereqIteration = 0;
    this.explicitEventHistory.forEach(
      (event: TaskEvent, index: number): void => {
        // Don't check the next event if it can be helped, because if there is a next event, it'll have its turn to
        // check previous events, and that presents much narrower criteria to check.
        const prevEvent = this.explicitEventHistory[index - 1];
        if (prevEvent) {
          // Make sure the dates are in order.
          if (prevEvent.date >= event.date) {
            throw new EventHistoryInvalidError(
              "Events must be provided in chronological order."
            );
          }
        }
        if (event.date > now) {
          throw new EventHistoryInvalidError("Events cannot be in the future.");
        }
        switch (event.type) {
          case EventType.TaskIterationStarted: {
            const associatedPrereq =
              this.prerequisitesIterations[event.prerequisitesVersion];
            if (isUndefined(associatedPrereq)) {
              // This task was supposedly started without having the necessary prerequisites.
              throw new EventHistoryInvalidError(
                `The prerequisites iteration (${event.prerequisitesVersion}) specified by the TaskIterationStarted ` +
                  `event could not be found.`
              );
            }

            if (event.prerequisitesVersion !== expectedPrereqIteration) {
              // TaskIterationStarted event does not point to the right prereq iteration
              throw new EventHistoryInvalidError(
                `The prerequisites iteration (${event.prerequisitesVersion}) specified by the TaskIterationStarted ` +
                  `was expected to be ${expectedPrereqIteration}. Please keep in mind that old prerequisite ` +
                  `iterations cannot be used after a rebuild.`
              );
            }
            this._assertTaskIterationWasNotStartedPrematurely(
              event.date,
              associatedPrereq
            );
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
              // Nothing was before this event, so it's all good, since this means the task has only started for the
              // first time.
            }
            break;
          }
          case EventType.MinorRevisionComplete:
            if (prevEvent) {
              if (prevEvent.type === EventType.ReviewedAndNeedsMinorRevision) {
                // The previous event was a ReviewedAndNeedsMinorRevision event, so this event means the task should be
                // completely finished.
                break;
              }
            }
            // There either was no previous event, or the previous event was not a ReviewedAndNeedsMinorRevision event,
            // so a MinorRevisionComplete event here doesn't make any sense.
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
                // The previous event was either a TaskIterationStarted or ReviewedAndNeedsMajorRevision event, so this
                // is all good.
                if (event.type === EventType.ReviewedAndNeedsRebuild) {
                  // Event was a ReviewedAndNeedsRebuildEvent, so the prereq iteration must go up for the next
                  // TaskIterationStarted event.
                  expectedPrereqIteration += 1;
                }
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
          const nextEvent = this.explicitEventHistory[index + 1];
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
      }
    );
  }
  /**
   * Makes sure the task iteration was not started prematurely.
   *
   * @throws {PrematureTaskStartError} if the task should not have been started
   */
  private _assertTaskIterationWasNotStartedPrematurely(
    taskIterationStartDate: Date,
    associatedPrerequisites: ITaskPrerequisites
  ): void {
    if (!associatedPrerequisites.approvedDate) {
      // Task was started before associated prerequisites were approved.
      throw new PrematureTaskStartError(
        "Prerequisites are not approved. Must have approved prerequisites to start the task."
      );
    }
    // The prerequisites are approved, so check the prerequisite tasks are complete.
    const prerequisiteTasksAreComplete = [...this.directDependencies].every(
      (unit: ITaskUnit): boolean => unit.isComplete()
    );
    if (!prerequisiteTasksAreComplete) {
      // Not all the prerequisite tasks have been completed
      throw new PrematureTaskStartError(
        "Not all of the task's prerequisite tasks are complete. All prerequisite tasks must be completed before the " +
          "task can start."
      );
    }
    // Prerequisite tasks are complete, but check to make sure this task didn't start before they were completed
    if (taskIterationStartDate.getTime() < this._earliestPossibleStartTime) {
      throw new PrematureTaskStartError(
        "Not all of the task's prerequisite tasks were completed by the time the task started. All " +
          "prerequisite tasks must be completed before the task can start."
      );
    }
    // Prerquisite tasks were completed before this task started, but make sure the prerequisites for this iteration
    // were approved before it started.
    if (associatedPrerequisites.approvedDate > taskIterationStartDate) {
      // The task iteration was started before the prerequisites were approved.
      throw new PrematureTaskStartError(
        "Cannot start the task iteration before the prerequisites are approved."
      );
    }
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
  private _getTrueDirectDependencies(): Set<ITaskUnit> {
    const trueDirect = this._providedDirectDependencies.filter(
      (unit: ITaskUnit): boolean =>
        !this._providedDirectDependencies.some((dep: ITaskUnit): boolean =>
          dep.isDependentOn(unit)
        )
    );
    return new Set(trueDirect);
  }
  /**
   * Gets the dependencies that are no longer relevant because the prerequisites have changed.
   *
   * When prerequisites change, the dependencies can change as well. This provides access to the ones that got left
   * behind (if there are any).
   *
   * @returns a set of former dependencies
   */
  private _getStaleDirectDependencies(): Set<ITaskUnit> {
    const staleDependencies = this.prerequisitesIterations
      .reduce<ITaskUnit[]>(
        (acc, prereqIter) => [...acc, ...(prereqIter.parentUnits || [])],
        []
      )
      .filter((unit) => !this.directDependencies.has(unit));
    return new Set(staleDependencies);
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
    const depApparentEndTimes = [...this.directDependencies].map(
      (unit: ITaskUnit): number => unit.apparentEndDate.getTime()
    );
    // There may be no deps here, and the unit's apparent start date may have been set explicitely. If the apparent
    // start date wasn't set explicitely, it would be the anticipated start date, which also works. We'll consider both
    // to find out how far the unit was pushed into the future.
    const earliestTime = Math.max(...depApparentEndTimes);
    return earliestTime;
  }
  /**
   * Create a simple, projected history of what the task could be based on the last event provided for it.
   *
   * This is to help make both rendering and reasoning about the unit times easier.
   */
  private _buildProjectedHistory(now: Date): void {
    /**
     * The anticipated duration of the task
     */
    const estimatedTaskDuration: Duration = {
      seconds: differenceInSeconds(
        this.anticipatedEndDate,
        this.anticipatedStartDate
      ),
    };
    // If the last event is EventType.ReviewedAndAccepted, then update the apparent end date to that date. Otherwise,
    // estimate the apparent end date relative to the apparent start date.
    const lastEvent =
      this.explicitEventHistory[this.explicitEventHistory.length - 1];
    if (lastEvent) {
      switch (lastEvent.type) {
        case EventType.MinorRevisionComplete:
        case EventType.ReviewedAndAccepted: {
          // nothing to project
          break;
        }
        case EventType.ReviewedAndNeedsRebuild: {
          // needs to start the task (which implies getting new reqs) and then pass review

          const reqFinishedDate = max([now, lastEvent.date]);
          this.projectedEventHistory.push({
            type: EventType.TaskIterationStarted,
            date: reqFinishedDate,
            /**
             * This will point to an index that doens't exist yet if that iteration of the prereqs are not defined yet.
             * This means it can be used to determine if upcoming prereqs are accepted or not.
             */
            prerequisitesVersion: this.prerequisitesIterations.length,
          });
          const taskEndDate = add(reqFinishedDate, estimatedTaskDuration);
          this.projectedEventHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
        }
        case EventType.ReviewedAndNeedsMajorRevision: {
          // needs to start the task (which can be assumed to have started as soon as the review was done) and then pass
          // review
          const lastEventTimePlusBuffer = add(
            lastEvent.date,
            estimatedTaskDuration
          );
          const taskEndDate = max([now, lastEventTimePlusBuffer]);
          this.projectedEventHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
        }
        case EventType.ReviewedAndNeedsMinorRevision: {
          // needs to start the task (which can be assumed to have started as soon as the review was done)
          const lastEventTimePlusBuffer = add(
            lastEvent.date,
            estimatedTaskDuration
          );
          const taskEndDate = max([now, lastEventTimePlusBuffer]);
          this.projectedEventHistory.push({
            type: EventType.MinorRevisionComplete,
            date: taskEndDate,
          });
          break;
        }
        case EventType.TaskIterationStarted: {
          // needs time to complete the task
          const lastEventTimePlusBuffer = add(
            lastEvent.date,
            estimatedTaskDuration
          );
          const taskEndDate = max([now, lastEventTimePlusBuffer]);
          this.projectedEventHistory.push({
            type: EventType.ReviewedAndAccepted,
            date: taskEndDate,
          });
          break;
        }
      }
    } else {
      // literally no history
      // add task started event
      this.projectedEventHistory.push({
        type: EventType.TaskIterationStarted,
        date: this.apparentStartDate,
        /**
         * This should be 0 because there could only be one prerequisites iteration available, if any at all. If there
         * is none at all, then the associated prerequisites should be undefined anyway because it indicates they
         * weren't accepted yet (if they even exist as a draft).
         */
        prerequisitesVersion: 0,
      });
      const taskEndDate = add(this._apparentStartDate, estimatedTaskDuration);
      this.projectedEventHistory.push({
        type: EventType.ReviewedAndAccepted,
        date: taskEndDate,
      });
    }
  }
  get directDependencies(): Set<ITaskUnit> {
    return this._directDependencies;
  }
  get staleDirectDependencies(): Set<ITaskUnit> {
    return this._staleDirectDependencies;
  }
  /**
   * All task units this unit depends on.
   */
  private _getAllDependencies(): Set<ITaskUnit> {
    const deps = new Set<ITaskUnit>(this.directDependencies);
    this.directDependencies.forEach((parentUnit: ITaskUnit): void =>
      parentUnit.getAllDependencies().forEach((depUnit: ITaskUnit): void => {
        deps.add(depUnit);
      })
    );
    return deps;
  }
  getAllDependencies(): Set<ITaskUnit> {
    return this._allDependencies;
  }
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
    for (const dep of this.directDependencies) {
      // This must be the earliest point in the chain that this unit is a direct dependency, so there is only 1 path
      // to this unit from here.
      mapping[dep.id] = 1;
      // Additionally, any paths to its dependencies can be reached from here, so lets add its total paths to those
      // depencies to any other paths to them that we've seen from other dependencies.
      for (const [key, value] of Object.entries(dep.attachmentMap)) {
        // assign it to 0 if it's not already set
        mapping[key] ??= 0;
        mapping[key] += value;
      }
    }
    return mapping;
  }
  getNumberOfPathsToDependency(unit: TaskUnit): number {
    const pathCount = this._attachmentMap[unit.id];
    if (pathCount === undefined) {
      // there must not be a path
      return 0;
    }
    return pathCount;
  }
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
    return [...this.directDependencies].reduce<number>(
      (acc: number, dep: ITaskUnit): number =>
        acc + (dep.attachmentToDependencies || 1),
      0
    );
  }
  isDependentOn(unit: TaskUnit): boolean {
    return this._allDependencies.has(unit);
  }
  isComplete(): boolean {
    const lastEvent =
      this.explicitEventHistory[this.explicitEventHistory.length - 1];
    if (lastEvent && lastEvent.type === EventType.ReviewedAndAccepted) {
      return true;
    }
    return false;
  }
  /**
   * Determine and return the apparent start date.
   *
   * If the first event exists it must be TaskIterationStarted. If that's the case, use that date for the apparent start
   * date. If not, base it off of either the latest dependency apparent end date, or this unit's anticipated start date.
   * Whichever is later.
   *
   */
  private _determineApparentStartDate(): Date {
    const firstEvent = this.explicitEventHistory[0];
    if (firstEvent) {
      return firstEvent.date;
    } else {
      const now = new Date();
      const latestRequiredDate = new Date(
        Math.max(
          this._earliestPossibleStartTime,
          now.getTime(),
          this.anticipatedStartDate.getTime()
        )
      );
      return latestRequiredDate;
    }
  }
}
