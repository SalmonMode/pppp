import type store from "./store";

export type AppStore = typeof store;
export type AppState = ReturnType<typeof store.getState>;
