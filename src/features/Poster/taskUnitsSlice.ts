import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TaskUnit } from "../../Relations";
import type { TaskUnitDetails } from "../../types";
import { getSeedData } from "./seedData";
import { turnClusterIntoState } from "./turnClusterIntoState";

export interface TaskUnitMap {
  [key: TaskUnit["id"]]: TaskUnitDetails;
}
export type TrackToUnitMap = TaskUnit["id"][][];

export type TaskUnitsState = {
  loading: boolean;
  units: TaskUnitMap;
  unitTrackMap: TrackToUnitMap;
};

const initialState: TaskUnitsState = {
  loading: true,
  units: {},
  unitTrackMap: [],
};

export const generateCluster = createAsyncThunk("tasks/generate", async () => {
  const seedData = getSeedData();
  return turnClusterIntoState(seedData);
});

export const taskUnitsSlice = createSlice<TaskUnitsState, {}, "tasks">({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(generateCluster.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      generateCluster.fulfilled,
      (state, action: PayloadAction<TaskUnitsState>) => {
        state.loading = false;
        state.unitTrackMap = action.payload.unitTrackMap;
        state.units = action.payload.units;
      }
    );
  },
});
export default taskUnitsSlice;
