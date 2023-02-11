import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import MetricsPanel from "./Metrics/MetricsPanel";
import PosterBoard from "./Poster/PosterBoard";

export default function LandingPage(): EmotionJSX.Element {
  return (
    <div css={styles}>
      <MetricsPanel />
      <PosterBoard />
    </div>
  );
}

const styles = css({
  display: "flex",
  flexDirection: "column",
});
