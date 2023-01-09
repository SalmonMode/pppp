import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { Client } from "../../apiClient";
// import { RootState } from "../../app/store";
// import { CreateNewSkillArea, SkillAreaSummary } from "../../types";
// import { fetchSkillAreas } from "../selfAssessment/skillAreaSlice";

interface TaskUnit {
  id: number;
  directDependencies: TaskUnit["id"][];
}

export interface TaskUnitMap {
  [key: TaskUnit["id"]]: TaskUnit;
}

export type TaskUnitsState = {
  units: TaskUnitMap;
};

const initialState: TaskUnitsState = {
  units: {},
};

const taskUnitsSlice = createSlice({
  name: "taskUnits",
  initialState,
  reducers: {},
});

export default taskUnitsSlice.reducer;
