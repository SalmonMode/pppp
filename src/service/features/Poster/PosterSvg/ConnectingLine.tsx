import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import ConnectedPoints from "../../../../Graphing/ConnectedPoints";
import type { Coordinate } from "../../../../types";
import { theme } from "../../../app/theme";

type ConnectingLineType = "standard" | "stale";

export default function ConnectingLine({
  unitConnectionPoint,
  depConnectionPoint,
  "data-testid": dataTestId,
  variant = "standard",
}: {
  unitConnectionPoint: Coordinate;
  depConnectionPoint: Coordinate;
  "data-testid"?: string;
  variant?: ConnectingLineType;
}): EmotionJSX.Element {
  const connection = new ConnectedPoints(
    depConnectionPoint,
    unitConnectionPoint
  );
  const curveAsPathString = connection.getCubicBezierCurvePathShape();
  return (
    <g
      data-testid={dataTestId}
      css={connectionPathGroupStyles}
      className={variant}
    >
      <path d={curveAsPathString} className={"pathOutline"}></path>
      <path d={curveAsPathString} className={"pathInner"}></path>
    </g>
  );
}

const connectionPathGroupStyles = css({
  "path.pathInner": {
    stroke: theme.connectionPathStrokeColor,
    strokeWidth: "2px",
    fill: "none",
  },
  "&.stale path": {
    opacity: 0.5,
  },
  "&.stale path.pathInner": {
    stroke: theme.staleConnectionPathStrokeColor,
  },
  "path.pathOutline": {
    stroke: theme.connectionPathOutlineStrokeColor,
    strokeWidth: "6px",
    fill: "none",
  },
});
