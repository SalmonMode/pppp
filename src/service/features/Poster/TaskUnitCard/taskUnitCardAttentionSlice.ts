import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TaskUnitCardAttentionState = {
  attentionCardId: string | null;
};

const initialState: TaskUnitCardAttentionState = {
  attentionCardId: null,
};

export const taskUnitCardAttentionSlice = createSlice({
  name: "taskUnitCardAttention",
  initialState,
  reducers: {
    setTaskUnitCardAttention(state, action: PayloadAction<string>) {
      state.attentionCardId = action.payload;
    },
    resetTaskUnitCardAttention(state) {
      state.attentionCardId = null;
    },
  },
});
export const { setTaskUnitCardAttention, resetTaskUnitCardAttention } =
  taskUnitCardAttentionSlice.actions;
export default taskUnitCardAttentionSlice;
