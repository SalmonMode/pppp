import { css } from "@emotion/react";
import { formatDuration } from "date-fns";
import type { TaskMetrics } from "../Poster/taskUnitsSlice";
import colorScale from "./colorScale";
import EstimateCoefficientChart from "./EstimateCoefficientChart";

export default function MetricsSummary({ metrics }: { metrics: TaskMetrics }) {
  // If all the anticipated durations are the same, or all the apparent durations are the same, there will be no
  // covariance, and then the formula to determine the coefficient breaksdown because it ends up dividing by 0. When
  // this happens, the coefficient is NaN, and this can make things wonky, so to avoid this, we assume the coefficient
  // is 0, meaning it's effectively random anyway.
  const coefficient = Number.isNaN(metrics.estimatesCoefficient)
    ? 0
    : metrics.estimatesCoefficient;
  const adjustedCoefficient = (coefficient + 1) / 2;

  return (
    <div data-testid={"metrics-panel"} css={styles}>
      <div data-testid={"delays"}>
        Delays: {formatDuration(metrics.cumulativeDelays)}
      </div>
      <div data-testid={"extensions"}>
        Extensions: {formatDuration(metrics.cumulativeExtensions)}
      </div>
      <div data-testid={"process-time"}>
        Average Process Time: {formatDuration(metrics.processTime)}
      </div>
      <div data-testid={"est-coefficient"}>
        <div data-testid={"est-coefficient-label"}>
          Estimates Coefficient: ~{coefficient.toPrecision(5)}
        </div>
        <div
          data-testid={"est-coefficient-color"}
          style={{
            backgroundColor: colorScale(adjustedCoefficient).css(),
            width: 20,
            height: "1em",
            display: "inline-block",
          }}
        ></div>
      </div>
      <EstimateCoefficientChart coefficient={coefficient} />
    </div>
  );
}
const styles = css({
  position: "relative",
  margin: 10,
});
