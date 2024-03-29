import { css } from "@emotion/react";
import { theme } from "@service/app/theme";
import type { Coordinate } from "@typing/ConnectedPoints";
import type { TaskUnitDetails } from "@typing/TaskUnit";
import { assertIsObject } from "primitive-predicates";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import getYOfTrackTop from "../getYOfTrackTop";
import type { TaskUnitsLoadingCompleteState } from "../taskUnitsSlice";
import ConnectingLine from "./ConnectingLine";

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
}): JSX.Element {
  return (
    <svg data-testid="posterSvg" css={svgStyles} style={{ width, height }}>
      {/* First get the stale connections so they render behind all others */}
      {Object.values(taskUnits.units).map(
        (unit: TaskUnitDetails): JSX.Element[] => {
          {
            return [...unit.staleDirectDependencies].map(
              (depUnitId: string): JSX.Element => {
                const depUnitData = taskUnits.units[depUnitId];
                assertIsObject(depUnitData);
                const depUnitConnPoint: Coordinate = {
                  x: getPixelGapBetweenTimes(
                    depUnitData.apparentEndTime,
                    earliestStartTime
                  ),
                  y:
                    getYOfTrackTop(depUnitData.trackIndex) +
                    theme.trackHeight / 2,
                };
                const unitConnPoint: Coordinate = {
                  x: getPixelGapBetweenTimes(
                    unit.apparentStartTime,
                    earliestStartTime
                  ),
                  y: getYOfTrackTop(unit.trackIndex) + theme.trackHeight / 2,
                };
                return (
                  <ConnectingLine
                    data-testid={`pathGroup-${unit.id}-${depUnitId}`}
                    key={`${unit.id}-${depUnitId}`}
                    variant={"stale"}
                    unitConnectionPoint={unitConnPoint}
                    depConnectionPoint={depUnitConnPoint}
                  />
                );
              }
            );
          }
        }
      )}
      {/* Then get the current connections so they render in front of the stale ones */}
      {Object.values(taskUnits.units).map(
        (unit: TaskUnitDetails): JSX.Element[] => {
          {
            return [...unit.directDependencies].map(
              (depUnitId: string): JSX.Element => {
                const depUnitData = taskUnits.units[depUnitId];
                assertIsObject(depUnitData);
                const depUnitConnPoint: Coordinate = {
                  x: getPixelGapBetweenTimes(
                    depUnitData.apparentEndTime,
                    earliestStartTime
                  ),
                  y:
                    getYOfTrackTop(depUnitData.trackIndex) +
                    theme.trackHeight / 2,
                };
                const unitConnPoint: Coordinate = {
                  x: getPixelGapBetweenTimes(
                    unit.apparentStartTime,
                    earliestStartTime
                  ),
                  y: getYOfTrackTop(unit.trackIndex) + theme.trackHeight / 2,
                };
                return (
                  <ConnectingLine
                    data-testid={`pathGroup-${unit.id}-${depUnitId}`}
                    key={`${unit.id}-${depUnitId}`}
                    unitConnectionPoint={unitConnPoint}
                    depConnectionPoint={depUnitConnPoint}
                  />
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
