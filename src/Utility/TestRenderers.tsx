import type { PreloadedState } from "@reduxjs/toolkit";
import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import type React from "react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../app/store";
import type { RootState } from "../app/store";
import type { AppStore } from "../app/types";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

export function renderWithProvider(
  ui: React.ReactElement,
  {
    // Automatically create a store instance if no store was passed in
    preloadedState = {},
    store = makeStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
