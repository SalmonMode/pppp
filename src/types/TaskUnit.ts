import type { TaskUnit } from "../Relations";

export interface TaskUnitDetails {
  id: TaskUnit["id"];
  directDependencies: TaskUnit["id"][];
  startTime: number;
  endTime: number;
  trackIndex: number;
  name: string;
}
