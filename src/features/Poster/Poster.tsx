import { useAppSelector } from "../../app/hooks";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { assertIsObject } from "../../typePredicates";
import type { TaskUnitDetails } from "../../types";
import { trackHeight, unitTaskTimeConversion } from "../constants";
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
    (unit) => unit.anticipatedEndTime
  );
  const latestTime = Math.max(...unitEndTimes);
  const trackCount =
    Math.max(...Object.values(taskUnits.units).map((u) => u.trackIndex)) + 1;
  const svgHeight = trackCount * trackHeight;
  const timespan = latestTime - earliestStartTime;
  const svgWidth = timespan / unitTaskTimeConversion;
  return (
    <div style={{ position: "relative", margin: 10 }}>
      <svg
        style={{
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
                  x:
                    (depUnitData.anticipatedEndTime - earliestStartTime) /
                    unitTaskTimeConversion,
                  y: depUnitData.trackIndex * trackHeight + trackHeight / 2,
                },
                {
                  x:
                    (unit.anticipatedStartTime - earliestStartTime) /
                    unitTaskTimeConversion,
                  y: unit.trackIndex * trackHeight + trackHeight / 2,
                }
              );
              const curve = connection.getCubicBezierPathBetweenPoints();
              const curveAsPathString = `M${curve.startPoint.x},${curve.startPoint.y} C${curve.startControlPoint.x},${curve.startControlPoint.y} ${curve.endControlPoint.x},${curve.endControlPoint.y} ${curve.endPoint.x},${curve.endPoint.y}`;
              return (
                <g key={`${unit.id}-${depUnitId}`}>
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
