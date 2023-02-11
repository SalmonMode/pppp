import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { Action } from "@reduxjs/toolkit";
import { formatDuration } from "date-fns";
import { useAppDispatch } from "../../app/hooks";
import { theme } from "../../../theme/theme";
import CoefficientHelpModal from "../CoefficientModal/CoefficientHelpModal";
import { openCoefficientHelpModal } from "../CoefficientModal/coefficientHelpModalOpenSlice";
import type { TaskMetrics } from "../Poster/taskUnitsSlice";
import colorScale from "./colorScale";
import EstimateCoefficientChart from "./EstimateCoefficientChart";

export default function MetricsSummary({
  metrics,
}: {
  metrics: TaskMetrics;
}): EmotionJSX.Element {
  // If all the anticipated durations are the same, or all the apparent durations are the same, there will be no
  // covariance, and then the formula to determine the coefficient breaksdown because it ends up dividing by 0. When
  // this happens, the coefficient is NaN, and this can make things wonky, so to avoid this, we assume the coefficient
  // is 0, meaning it's effectively random anyway.
  const coefficient = Number.isNaN(metrics.estimatesCoefficient)
    ? 0
    : metrics.estimatesCoefficient;
  const adjustedCoefficient = (coefficient + 1) / 2;
  const dispatch = useAppDispatch();

  return (
    <div data-testid={"metrics-panel"} css={panelStyles}>
      <div data-testid={"process-time-group"} css={colorGuidedSummaryStyles}>
        <div data-testid={"process-time-color"} css={colorGuideStyles}></div>
        <Typography data-testid={"process-time"} css={colorGuidedLabelStyles}>
          Average Process Time: {formatDuration(metrics.processTime)}
        </Typography>
      </div>
      <div data-testid={"delays-group"} css={colorGuidedSummaryStyles}>
        <div data-testid={"delays-color"} css={delaysColorGuideStyles}></div>
        <Typography data-testid={"delays"} css={colorGuidedLabelStyles}>
          Delays: {formatDuration(metrics.cumulativeDelays)}
        </Typography>
      </div>
      <div data-testid={"extensions-group"} css={colorGuidedSummaryStyles}>
        <div
          data-testid={"extensions-color"}
          css={extensionsColorGuideStyles}
        ></div>
        <Typography data-testid={"extensions"} css={colorGuidedLabelStyles}>
          Extensions: {formatDuration(metrics.cumulativeExtensions)}
        </Typography>
      </div>
      <div data-testid={"est-coefficient"} css={colorGuidedSummaryStyles}>
        <div
          data-testid={"est-coefficient-color"}
          css={colorGuideStyles}
          style={{
            backgroundColor: colorScale(adjustedCoefficient).css(),
          }}
        ></div>
        <Typography
          data-testid={"est-coefficient-label"}
          css={colorGuidedLabelStyles}
        >
          Correlation of Estimated to Actual Times: ~
          {coefficient.toPrecision(5)}
        </Typography>

        <Button
          onClick={(event): Action<string> =>
            dispatch(openCoefficientHelpModal(event))
          }
        >
          What's this?
        </Button>
      </div>
      <EstimateCoefficientChart coefficient={coefficient} />
      <CoefficientHelpModal />
    </div>
  );
}
const panelStyles = css({
  position: "relative",
  margin: 10,
});
const colorGuidedSummaryStyles = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
});
const colorGuidedLabelStyles = css({
  display: "inline-block",
});
const colorGuideStyles = css({
  width: 20,
  height: "1em",
  display: "inline-block",
  marginLeft: 10,
});
const delaysColorGuideStyles = css(
  {
    backgroundColor: theme.snailTrailColor,
  },
  colorGuideStyles
);
const extensionsColorGuideStyles = css(
  {
    backgroundColor: theme.extensionColor,
  },
  colorGuideStyles
);
