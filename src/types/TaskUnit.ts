import type { TaskUnit } from "../Relations";

export interface TaskUnitDetails {
  id: TaskUnit["id"];
  directDependencies: TaskUnit["id"][];
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
  eventHistory: SerializableTaskEvent[];
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

export interface TaskEvent {
  type: EventType;
  date: Date;
}
export interface InterpolatedTaskEvent extends TaskEvent {
  projected: boolean;
}
export interface SerializableTaskEvent {
  type: EventType;
  time: number;
  projected: boolean;
}
