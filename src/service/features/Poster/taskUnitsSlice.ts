import {
  createAsyncThunk,
  createSlice,
  type ActionReducerMapBuilder,
} from "@reduxjs/toolkit";
import type { ResourceID } from "@typing/Mapping";
import type { TaskUnitDetails } from "@typing/TaskUnit";
import { getSeedData } from "./seedData";
import { turnClusterIntoState } from "./turnClusterIntoState";

export interface TaskUnitMap {
  [key: ResourceID]: TaskUnitDetails;
}
export interface TaskMetrics {
  cumulativeDelays: Duration;
  cumulativeExtensions: Duration;
  processTime: Duration;
  estimatesCoefficient: number;
}
export type TrackToUnitMap = ResourceID[][];

export type TaskUnitsLoadingState = {
  loading: true;
};
export type TaskUnitsLoadingCompleteState = {
  loading: false;
  units: TaskUnitMap;
  unitTrackMap: TrackToUnitMap;
  metrics: TaskMetrics;
};

export type TaskUnitsState =
  | TaskUnitsLoadingState
  | TaskUnitsLoadingCompleteState;

const initialState: TaskUnitsState = {
  loading: true,
};

export const generateCluster = createAsyncThunk<
  TaskUnitsLoadingCompleteState,
  void
>("tasks/generate", async (): Promise<TaskUnitsLoadingCompleteState> => {
  const seedData = getSeedData();
  return turnClusterIntoState(seedData);
});

export const taskUnitsSlice = createSlice<
  TaskUnitsState,
  Record<string, never>,
  "tasks"
>({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<TaskUnitsState>): void => {
    builder.addCase(generateCluster.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateCluster.fulfilled, (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    });
  },
});
export default taskUnitsSlice;
