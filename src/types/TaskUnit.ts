import type { TaskUnit } from "../Relations";

export interface TaskUnitDetails {
  id: TaskUnit["id"];
  directDependencies: TaskUnit["id"][];
  anticipatedStartTime: number;
  anticipatedEndTime: number;
  trackIndex: number;
  name: string;
}
