import { useAppSelector } from "../../app/hooks";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { assertIsObject } from "../../typePredicates";
import type { TaskUnitDetails } from "../../types";
import {
  trackGapHeight,
  trackHeight,
  unitTaskTimeConversion,
} from "../constants";
import getYOfTrackTop from "./getYOfTrackTop";
import TaskTrack from "./TaskUnitCard/TaskTrack";

export default function Poster() {
  const taskUnits = useAppSelector((state) => state.taskUnits);
  if (taskUnits.loading) {
    return <div data-testid={"poster-loading"}>loading...</div>;
  }
  const tracks = taskUnits.unitTrackMap;
  const unitStartTimes = Object.values(taskUnits.units).map(
    (unit) => unit.anticipatedStartTime
  );
  const earliestStartTime = Math.min(...unitStartTimes);
  const unitEndTimes = Object.values(taskUnits.units).map(
    (unit) => unit.apparentEndTime
  );
  const latestTime = Math.max(...unitEndTimes);
  const trackCount =
    Math.max(...Object.values(taskUnits.units).map((u) => u.trackIndex)) + 1;
  const svgHeight = trackCount * trackHeight + trackCount * trackGapHeight;
  const timespan = latestTime - earliestStartTime;
  const svgWidth = Math.round(timespan / unitTaskTimeConversion);
  return (
    <div
      data-testid={"poster-container"}
      style={{ position: "relative", margin: 10 }}
    >
      <svg
        style={{
          zIndex: 10,
          position: "absolute",
          width: svgWidth,
          height: svgHeight,
          left: 0,
          top: 0,
        }}
      >
        {Object.values(taskUnits.units).map((unit) => {
          {
            return [...unit.directDependencies].map((depUnitId) => {
              const depUnitData = taskUnits.units[depUnitId];
              assertIsObject(depUnitData);
              const connection = new ConnectedPoints(
                {
                  x: Math.round(
                    (depUnitData.apparentEndTime - earliestStartTime) /
                      unitTaskTimeConversion
                  ),
                  y: getYOfTrackTop(depUnitData.trackIndex) + trackHeight / 2,
                },
                {
                  x: Math.round(
                    (unit.apparentStartTime - earliestStartTime) /
                      unitTaskTimeConversion
                  ),
                  y: getYOfTrackTop(unit.trackIndex) + trackHeight / 2,
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
                    style={{
                      stroke: "white",
                      strokeWidth: "6px",
                      fill: "none",
                    }}
                  ></path>
                  <path
                    d={curveAsPathString}
                    style={{
                      stroke: "black",
                      strokeWidth: "2px",
                      fill: "none",
                    }}
                  ></path>
                </g>
              );
            });
          }
        })}
      </svg>

      <div
        data-testid={"poster"}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {tracks.map((track, index) => {
          return (
            <TaskTrack
              key={index}
              units={track.map<TaskUnitDetails>((id) => {
                const unitDetails = taskUnits.units[id];
                assertIsObject(unitDetails);
                return unitDetails;
              })}
              trackIndex={index}
              pathStartDate={new Date(earliestStartTime)}
            />
          );
        })}
      </div>
    </div>
  );
}
