import { css } from "@emotion/react";
import MetricsPanel from "./Metrics/MetricsPanel";
import PosterBoard from "./Poster/PosterBoard";

export default function LandingPage() {
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
