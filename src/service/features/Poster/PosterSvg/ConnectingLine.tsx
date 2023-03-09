import { css } from "@emotion/react";
import ConnectedPoints from "@graphing/ConnectedPoints";
import { theme } from "@service/app/theme";
import type { Coordinate } from "@typing/ConnectedPoints";

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
}): JSX.Element {
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
