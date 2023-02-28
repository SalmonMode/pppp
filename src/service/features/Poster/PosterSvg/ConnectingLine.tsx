import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import ConnectedPoints from "../../../../Graphing/ConnectedPoints";
import type { Coordinate } from "../../../../types";
import { theme } from "../../../app/theme";

export default function ConnectingLine({
  unitConnectionPoint,
  depConnectionPoint,
  "data-testid": dataTestId,
}: {
  unitConnectionPoint: Coordinate;
  depConnectionPoint: Coordinate;
  "data-testid"?: string;
}): EmotionJSX.Element {
  const connection = new ConnectedPoints(
    depConnectionPoint,
    unitConnectionPoint
  );
  const curveAsPathString = connection.getCubicBezierCurvePathShape();
  return (
    <g data-testid={dataTestId}>
      <path d={curveAsPathString} css={connectionPathOutlineStyles}></path>
      <path d={curveAsPathString} css={connectionPathStyles}></path>
    </g>
  );
}

const connectionPathStyles = css({
  stroke: theme.connectionPathStrokeColor,
  strokeWidth: "2px",
  fill: "none",
});
const connectionPathOutlineStyles = css({
  stroke: theme.connectionPathOutlineStrokeColor,
  strokeWidth: "6px",
  fill: "none",
});
