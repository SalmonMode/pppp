import type { Action, ThunkAction } from "@reduxjs/toolkit";
import type store from "./store";
import type { makeStore } from "./store";

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export type AppState = ReturnType<typeof store.getState>;
export type AppStore = ReturnType<typeof makeStore>;
