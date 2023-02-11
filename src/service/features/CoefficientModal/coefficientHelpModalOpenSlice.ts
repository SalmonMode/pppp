import { createSlice } from "@reduxjs/toolkit";

export interface CoefficientHelpModelOpenState {
  open: boolean;
}

const initialState: CoefficientHelpModelOpenState = {
  open: false,
};

export const coefficientHelpModalOpenSlice = createSlice({
  name: "coefficientHelp",
  initialState,
  reducers: {
    openCoefficientHelpModal(state, _payload) {
      state.open = true;
    },
    closeCoefficientHelpModal(state, _payload) {
      state.open = false;
    },
  },
});

export const { openCoefficientHelpModal, closeCoefficientHelpModal } =
  coefficientHelpModalOpenSlice.actions;
export default coefficientHelpModalOpenSlice;
