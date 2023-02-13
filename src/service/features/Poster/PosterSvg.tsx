import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { theme } from "../../app/theme";
import ConnectedPoints from "../../../Graphing/ConnectedPoints";
import { assertIsObject } from "primitive-predicates";
import type { TaskUnitDetails } from "../../../types";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";
import getYOfTrackTop from "./getYOfTrackTop";
import type { TaskUnitsLoadingCompleteState } from "./taskUnitsSlice";

export default function PosterSvg({
  taskUnits,
  width,
  height,
  earliestStartTime,
}: {
  taskUnits: TaskUnitsLoadingCompleteState;
  width: number;
  height: number;
  earliestStartTime: number;
}): EmotionJSX.Element {
  return (
    <svg data-testid="posterSvg" css={svgStyles} style={{ width, height }}>
      {Object.values(taskUnits.units).map(
        (unit: TaskUnitDetails): EmotionJSX.Element[] => {
          {
            return [...unit.directDependencies].map(
              (depUnitId: string): EmotionJSX.Element => {
                const depUnitData = taskUnits.units[depUnitId];
                assertIsObject(depUnitData);
                const connection = new ConnectedPoints(
                  {
                    x: getPixelGapBetweenTimes(
                      depUnitData.apparentEndTime,
                      earliestStartTime
                    ),
                    y:
                      getYOfTrackTop(depUnitData.trackIndex) +
                      theme.trackHeight / 2,
                  },
                  {
                    x: getPixelGapBetweenTimes(
                      unit.apparentStartTime,
                      earliestStartTime
                    ),
                    y: getYOfTrackTop(unit.trackIndex) + theme.trackHeight / 2,
                  }
                );
                const curveAsPathString =
                  connection.getCubicBezierCurvePathShape();
                return (
                  <g
                    data-testid={`pathGroup-${unit.id}-${depUnitId}`}
                    key={`${unit.id}-${depUnitId}`}
                  >
                    <path
                      d={curveAsPathString}
                      css={connectionPathOutlineStyles}
                    ></path>
                    <path
                      d={curveAsPathString}
                      css={connectionPathStyles}
                    ></path>
                  </g>
                );
              }
            );
          }
        }
      )}
    </svg>
  );
}

const svgStyles = css({
  position: "absolute",
  left: 0,
  top: 0,
  pointerEvents: "none",
});
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
