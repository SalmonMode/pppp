import MetricsPanel from "./Metrics/MetricsPanel";
import PosterBoard from "./Poster/PosterBoard";

export default function LandingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <MetricsPanel />
      <PosterBoard />
    </div>
  );
}
