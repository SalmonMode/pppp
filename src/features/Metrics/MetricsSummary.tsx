import { css } from "@emotion/react";
import Typography from "@mui/material/Typography";
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
    <div data-testid={"metrics-panel"} css={panelStyles}>
      <Typography data-testid={"delays"}>
        Delays: {formatDuration(metrics.cumulativeDelays)}
      </Typography>
      <Typography data-testid={"extensions"}>
        Extensions: {formatDuration(metrics.cumulativeExtensions)}
      </Typography>
      <Typography data-testid={"process-time"}>
        Average Process Time: {formatDuration(metrics.processTime)}
      </Typography>
      <div data-testid={"est-coefficient"} css={coefficientSummaryStyles}>
        <Typography
          data-testid={"est-coefficient-label"}
          css={coefficientLabelStyles}
        >
          Estimates Coefficient: ~{coefficient.toPrecision(5)}
        </Typography>
        <div
          data-testid={"est-coefficient-color"}
          css={coefficientColorStyles}
          style={{
            backgroundColor: colorScale(adjustedCoefficient).css(),
          }}
        ></div>
      </div>
      <EstimateCoefficientChart coefficient={coefficient} />
    </div>
  );
}
const panelStyles = css({
  position: "relative",
  margin: 10,
});
const coefficientSummaryStyles = css({
  display: "inline-block",
});
const coefficientLabelStyles = css({
  display: "inline-block",
});
const coefficientColorStyles = css({
  width: 20,
  height: "1em",
  display: "inline-block",
  marginLeft: 10,
});
