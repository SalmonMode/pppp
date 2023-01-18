import {
  combineReducers,
  configureStore,
  PreloadedState,
} from "@reduxjs/toolkit";
import taskUnitsSlice from "../features/Poster/taskUnitsSlice";

const rootReducer = combineReducers({
  taskUnits: taskUnitsSlice.reducer,
});

export function makeStore(preloadedState?: PreloadedState<RootState>) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });
  return store;
}

const store = makeStore();
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
