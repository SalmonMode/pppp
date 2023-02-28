import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import coefficientHelpModalOpenSlice from "../features/CoefficientModal/coefficientHelpModalOpenSlice";
import taskUnitCardFocusSlice from "../features/Poster/TaskUnitCard/taskUnitCardAttentionSlice";
import taskUnitsSlice from "../features/Poster/taskUnitsSlice";
import type { AppStore } from "./types";

const rootReducer = combineReducers({
  taskUnits: taskUnitsSlice.reducer,
  taskUnitCardFocus: taskUnitCardFocusSlice.reducer,
  coefficientHelpModal: coefficientHelpModalOpenSlice.reducer,
});

// Store must be defined on its own outside of makeStore function, because the typing has to be inferred in order to
// provide a return type for makeStore. Return types are required to optimize compiler performance.
export const store = configureStore({
  reducer: rootReducer,
});

export function makeStore(
  preloadedState?: PreloadedState<RootState>
): AppStore {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });
  return store;
}

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
