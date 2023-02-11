import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";

import store from "./store";

export default function App({
  Component,
  pageProps: { ...pageProps },
}: AppProps): EmotionJSX.Element {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
