import type ITaskUnit from "./ITaskUnit";
import type { ResourceID } from "./Mapping";

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
  approved: boolean;
  /**
   * IDs of dependencies.
   */
  parentUnits: string[];
}

export interface BaseTaskPrerequisites {
  readonly id: string;
  parentUnits?: ITaskUnit[];
}

/**
 * The prerequisites that must be in place for the task to be completed, such as:
 * - requirements that serve as the measurement for the review
 * - people who will need to be available to work on the task
 * - necessary work that is supposed to be completed in earlier tasks
 */
export interface ITaskPrerequisitesUnapproved extends BaseTaskPrerequisites {
  /**
   * The date and time the prerequisites were approved. If undefined, then they are not approved.
   */
  approvedDate?: never;
}
/**
 * The prerequisites that must be in place for the task to be completed, such as:
 * - requirements that serve as the measurement for the review
 * - people who will need to be available to work on the task
 * - necessary work that is supposed to be completed in earlier tasks
 */
export interface ITaskPrerequisitesApproved extends BaseTaskPrerequisites {
  /**
   * The date and time the prerequisites were approved. If undefined, then they are not approved.
   */
  approvedDate: Date;
}
export type ITaskPrerequisites =
  | ITaskPrerequisitesUnapproved
  | ITaskPrerequisitesApproved;

export interface TaskUnitDetails {
  id: ResourceID;
  staleDirectDependencies: ResourceID[];
  directDependencies: ResourceID[];
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
  /**
   * The index of the track this unit should be placed on.
   */
  trackIndex: number;
  /**
   * A short description of the task.
   */
  name: string;
  /**
   * The series of events that have already happened.
   *
   * This is similar to {@link ITaskUnit.explicitEventHistory}, except it's serializable, so it can be used safely in a
   * redux store.
   */
  explicitEventHistory: SerializableTaskEvent[];
  /**
   * The series of events that are projected to happen in the future using the {@link anticipatedEndDate} and
   * {@link anticipatedStartDate} (which gives the anticipated duration), along with the latest apparent end date of its
   * direct dependencies, to determine a reasonable best case scenario for how how the task will play out.
   *
   * For example, if the task has just had an {@link EventType.ReviewedAndNeedsRebuild} event, the projected history
   * would be an {@link EventType.TaskIterationStarted} event at the current date and time (because it is assuming the
   * new prerequisites will be signed off on at any moment), and then an {@link EventType.ReviewedAndAccepted} event at
   * the date and time after that date that reflects the original anticipated duration of the task.
   *
   * This is similar to {@link ITaskUnit.projectedEventHistory}, except it's serializable, so it can be used safely in a
   * redux store.
   */
  projectedEventHistory: SerializableTaskEvent[];
  /**
   * An array of the versions IDs of prerequisites for this task. The latest entry represents the ID of the latest
   * version of the prerequisites.
   */
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
