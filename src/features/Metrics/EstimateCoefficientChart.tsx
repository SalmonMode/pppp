import { css } from "@emotion/react";
import colorScale from "./colorScale";

export default function EstimateCoefficientChart({
  coefficient,
}: {
  coefficient: number;
}) {
  const adjustedCoefficient = (coefficient + 1) / 2;

  return (
    <div
      data-testid="coefficient-chart"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 400,
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <div
          data-testid="coefficient-arrow"
          style={{
            position: "relative",
            left: 400 * adjustedCoefficient,
            transform: "translateX(-50%)",
            textAlign: "center",
          }}
        >
          &#x25BC;
        </div>
      </div>
      <div
        style={{
          backgroundImage: `linear-gradient(to right, ${colorScale
            .colors(4)
            .join(",")})`,
          width: 400,
          height: "1em",
        }}
      ></div>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div>-1</div>
        <div>0</div>
        <div>1</div>
      </div>
    </div>
  );
}
const styles = css({
  position: "relative",
  margin: 10,
});
