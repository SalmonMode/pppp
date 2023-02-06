import { css } from "@emotion/react";
import { theme } from "../../app/theme";
import colorScale from "./colorScale";

export default function EstimateCoefficientChart({
  coefficient,
}: {
  coefficient: number;
}) {
  const adjustedCoefficient = (coefficient + 1) / 2;

  return (
    <div data-testid="coefficient-chart" css={chartStyles}>
      <div style={{ position: "relative", width: "100%" }}>
        <div
          data-testid="coefficient-arrow"
          css={arrowStyles}
          style={{
            left: theme.gradientChartWidth * adjustedCoefficient,
          }}
        >
          &#x25BC;
        </div>
      </div>
      <div css={gradientStyles}></div>
      <div css={axisStyles}>
        <div>-1</div>
        <div>0</div>
        <div>1</div>
      </div>
    </div>
  );
}
const chartStyles = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: theme.gradientChartWidth,
});
const arrowStyles = css({
  position: "relative",
  transform: "translateX(-50%)",
  textAlign: "center",
});
const gradientStyles = css({
  backgroundImage: `linear-gradient(to right, ${colorScale
    .colors(4)
    .join(",")})`,
  width: theme.gradientChartWidth,
  height: "1em",
});
const axisStyles = css({
  width: "100%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
});
