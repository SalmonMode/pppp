import type { RelationshipMapping } from "./Mapping";

export interface ITaskUnitParametersWithoutHistory {
  now: Date;
  readonly anticipatedStartDate: Date;
  readonly anticipatedEndDate: Date;
  readonly name: string;
  prerequisitesIterations?: never;
  eventHistory?: never;
}
export interface ITaskUnitParametersWithHistory {
  now: Date;
  readonly anticipatedStartDate: Date;
  readonly anticipatedEndDate: Date;
  readonly name: string;
  eventHistory?: TaskEvent[];
  prerequisitesIterations: ITaskPrerequisites[];
}
export type ITaskUnitParameters =
  | ITaskUnitParametersWithoutHistory
  | ITaskUnitParametersWithHistory;

export interface SerializableTaskPrerequisitesReference {
  readonly id: string;
}
/**
 * The prerequisites that must be in place for the task to be completed, such as:
 * - requirements that serve as the measurement for the review
 * - people who will need to be available to work on the task
 * - necessary work that is supposed to be completed in earlier tasks
 */
export interface ITaskPrerequisites
  extends SerializableTaskPrerequisitesReference {
  parentUnits?: ITaskUnit[];
}

export interface ITaskUnit {
  readonly id: string;
  projectedHistory: TaskEvent[];
  interpolatedEventHistory: TaskEvent[];
  readonly anticipatedStartDate: Date;
  readonly anticipatedEndDate: Date;
  readonly name: string;
  eventHistory: TaskEvent[];
  apparentEndDate: Date;
  apparentStartDate: Date;
  /**
   * An array of the versions of prerequisites for this task. The latest entry represents the latest version of the
   * prerequisites.
   */
  prerequisitesIterations: ITaskPrerequisites[];
  /**
   * The amount of "presence" this unit would have on a graph.
   *
   * "Presence":
   *
   * Every {@link ITaskUnit} will need to be rendered on a graph more or less as a rectangle, with a "snail trail"
   * directly behind (if it's been delayed) it to show how much it has been delayed from its original start date. Each
   * unit must have a horizontal space available on the graph to be placed without overlapping the space needed for
   * other {@link ITaskUnit}s.
   *
   * "Presence" is the horizontal space a {@link ITaskUnit} would take up.
   */
  presenceTime: number;
  /**
   * The direct dependencies of this {@link ITaskUnit}.
   *
   * Sometimes references to units can be provided redundantly. For example, if `A` depends on `B` and `C`, but `B` also
   * depends on `C`, then `A`'s dependency on C is implied my the transitive property. This property provides access to
   * only the direct dependencies that are not redundant in this way.
   */
  directDependencies: Set<ITaskUnit>;
  /**
   * All task units this unit depends on.
   */
  getAllDependencies(): Set<ITaskUnit>;
  /**
   * A map of the IDs of the units this unit is dependent on to the number of paths it has to those units.
   */
  attachmentMap: RelationshipMapping;
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
  getNumberOfPathsToDependency(unit: ITaskUnit): number;
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
  attachmentToDependencies: number;
  /**
   * Check whether or not the passed unit is a dependency of this unit.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is dependent on the passed unit, false, if not
   */
  isDependentOn(unit: ITaskUnit): boolean;
  /**
   * @returns true, if the task has been reviewed and completed, false, if not
   */
  isComplete(): boolean;
}

export interface TaskUnitDetails {
  id: ITaskUnit["id"];
  directDependencies: ITaskUnit["id"][];
  /**
   * The time the task was anticipated to start when it was first made.
   */
  anticipatedStartTime: number;
  /**
   * The time the task seems to be started according to the graph. If the time is in the future, then this is a
   * projected start time based on the tasks it is dependent on. If the start time is in the past, then it means the
   * task was actually started at that time.
   */
  apparentStartTime: number;
  /**
   * The time the task was anticipated to be finished when it was first made.
   */
  anticipatedEndTime: number;
  /**
   * The time the task seems to be finished according to the graph. If the time is in the future, then this is a
   * projected completion time based on the tasks it is dependent on and other factors. If the end time is in the past,
   * then it means the task was actually finished at that time.
   */
  apparentEndTime: number;
  trackIndex: number;
  name: string;
  explicitEventHistory: SerializableTaskEvent[];
  projectedEventHistory: SerializableTaskEvent[];
  prerequisitesIterations: SerializableTaskPrerequisitesReference[];
}

export enum EventType {
  TaskIterationStarted,
  MinorRevisionComplete,
  ReviewedAndAccepted,
  ReviewedAndNeedsMinorRevision,
  ReviewedAndNeedsMajorRevision,
  ReviewedAndNeedsRebuild,
}
export enum ReviewType {
  Pending,
  Accepted,
  NeedsMinorRevision,
  NeedsMajorRevision,
  NeedsRebuild,
}

export interface BaseTaskEvent {
  type: EventType;
  date: Date;
}

export interface TaskIterationStartedEvent extends BaseTaskEvent {
  type: EventType.TaskIterationStarted;
  /**
   * The index of the prerequisites object from the task unit that this iteration is using. This number should directly
   * reflect the number of times a complete rebuild was necessary. If this number is 0, then it should be the first
   * iteration. If it is 1, then it should be the first iteration after the first rebuild.
   */
  prerequisitesVersion: number;
}
export interface MinorRevisionCompleteEvent extends BaseTaskEvent {
  type: EventType.MinorRevisionComplete;
}
export interface ReviewedAndAcceptedEvent extends BaseTaskEvent {
  type: EventType.ReviewedAndAccepted;
}
export interface ReviewedAndNeedsMinorRevisionEvent extends BaseTaskEvent {
  type: EventType.ReviewedAndNeedsMinorRevision;
}
export interface ReviewedAndNeedsMajorRevisionEvent extends BaseTaskEvent {
  type: EventType.ReviewedAndNeedsMajorRevision;
}
export interface ReviewedAndNeedsRebuildEvent extends BaseTaskEvent {
  type: EventType.ReviewedAndNeedsRebuild;
}

export type TaskEvent =
  | TaskIterationStartedEvent
  | MinorRevisionCompleteEvent
  | ReviewedAndAcceptedEvent
  | ReviewedAndNeedsMinorRevisionEvent
  | ReviewedAndNeedsMajorRevisionEvent
  | ReviewedAndNeedsRebuildEvent;

// export interface TaskEvent extends TaskEvent {
//   projected: boolean;
// }
export interface BaseSerializableTaskEvent {
  type: EventType;
  time: number;
}

export interface SerializableTaskIterationStartedEvent
  extends BaseSerializableTaskEvent {
  type: EventType.TaskIterationStarted;
  /**
   * The index of the prerequisites object from the task unit that this iteration is using. This number should directly
   * reflect the number of times a complete rebuild was necessary. If this number is 0, then it should be the first
   * iteration. If it is 1, then it should be the first iteration after the first rebuild.
   */
  prerequisitesVersion: number;
}
export interface SerializableMinorRevisionCompleteEvent
  extends BaseSerializableTaskEvent {
  type: EventType.MinorRevisionComplete;
}
export interface SerializableReviewedAndAcceptedEvent
  extends BaseSerializableTaskEvent {
  type: EventType.ReviewedAndAccepted;
}
export interface SerializableReviewedAndNeedsMinorRevisionEvent
  extends BaseSerializableTaskEvent {
  type: EventType.ReviewedAndNeedsMinorRevision;
}
export interface SerializableReviewedAndNeedsMajorRevisionEvent
  extends BaseSerializableTaskEvent {
  type: EventType.ReviewedAndNeedsMajorRevision;
}
export interface SerializableReviewedAndNeedsRebuildEvent
  extends BaseSerializableTaskEvent {
  type: EventType.ReviewedAndNeedsRebuild;
}

export type SerializableTaskEvent =
  | SerializableTaskIterationStartedEvent
  | SerializableMinorRevisionCompleteEvent
  | SerializableReviewedAndAcceptedEvent
  | SerializableReviewedAndNeedsMinorRevisionEvent
  | SerializableReviewedAndNeedsMajorRevisionEvent
  | SerializableReviewedAndNeedsRebuildEvent;

export type SerializableTaskReviewEvent =
  | SerializableMinorRevisionCompleteEvent
  | SerializableReviewedAndAcceptedEvent
  | SerializableReviewedAndNeedsMinorRevisionEvent
  | SerializableReviewedAndNeedsMajorRevisionEvent
  | SerializableReviewedAndNeedsRebuildEvent;

/**
 * Enum flags to help determine if task unit iterations are the first/last/only/middle.
 *
 * @example
 * Here's a simple example:
 *
 * ```
 * let position = IterationRelativePosition.LastKnownIteration | IterationRelativePosition.FirstKnownIteration;
 * if ((position & IterationRelativePosition.LastKnownIteration) === IterationRelativePosition.LastKnownIteration) {
 *   console.log("Is last known iteration, but may not be the only iteration");
 * }
 * if (position === IterationRelativePosition.OnlyKnownIteration) {
 *   console.log("Is only known iteration");
 * }
 * ```
 *
 * @example
 * Here's how to add a flag:
 *
 * ```
 * let position = IterationRelativePosition.Intermediate; // 0
 * position |= IterationRelativePosition.FirstKnownIteration; // 2
 * ```
 *
 * @example
 * Here's how to remove a flag:
 *
 * ```
 * let position = IterationRelativePosition.OnlyKnownIteration; // 3
 * position &= IterationRelativePosition.LastKnownIteration; // 2
 * ```
 *
 * These operations are idempotent so they can be performed any number of times redundantly without risk.
 */
export enum IterationRelativePosition {
  /**
   * This is neither the first nor the last iteration, but there are other iterations.
   */
  IntermediateIteration = 0,
  /**
   * This is the last known iteration, but it is not necessarily the first.
   */
  LastKnownIteration = 1 << 0,
  /**
   * This is the first known iteration, but it is not necessarily the last.
   */
  FirstKnownIteration = 1 << 1,
  /**
   * This is both the first and the last known iteration. It is the only known iteration.
   */
  OnlyKnownIteration = ~(~0 << 2),
}
