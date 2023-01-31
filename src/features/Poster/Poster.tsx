import { add, eachDayOfInterval, sub } from "date-fns";
import { useAppSelector } from "../../app/hooks";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { assertIsObject } from "../../typePredicates";
import type { TaskUnitDetails } from "../../types";
import { svgDateTopPadding, trackGapHeight, trackHeight } from "../constants";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";
import getYOfTrackTop from "./getYOfTrackTop";
import SnailTrailTrack from "./TaskUnitCard/SnailTrailTrack";
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
  const earliestTaskStartTime = Math.min(...unitStartTimes);
  const earliestStartDate = new Date(earliestTaskStartTime);
  const unitEndTimes = Object.values(taskUnits.units).map(
    (unit) => unit.apparentEndTime
  );
  const latestTaskEndTime = Math.max(...unitEndTimes);
  const latestEndDate = new Date(latestTaskEndTime);
  const dateIntervals = eachDayOfInterval({
    start: earliestStartDate,
    end: add(latestEndDate, { days: 1 }),
  });
  const firstDate = dateIntervals[0];
  assertIsObject(firstDate);
  const lastDate = dateIntervals[dateIntervals.length - 1];
  assertIsObject(lastDate);
  const earliestStartTime = sub(firstDate, { hours: 12 }).getTime();
  const trackCount =
    Math.max(...Object.values(taskUnits.units).map((u) => u.trackIndex)) + 1;
  const svgHeight =
    trackCount * trackHeight + trackCount * trackGapHeight + svgDateTopPadding;
  const svgWidth = getPixelGapBetweenTimes(
    add(lastDate, { hours: 12 }).getTime(),
    earliestStartTime
  );
  const now = new Date();
  const nowLeft = getPixelGapBetweenTimes(now.getTime(), earliestStartTime);
  return (
    <div
      data-testid={"poster-container"}
      style={{ position: "relative", margin: 10 }}
    >
      <div
        data-testid={"snailTrailContainer"}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {tracks.map((track, index) => {
          return (
            <SnailTrailTrack
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
      <svg
        data-testid="posterSVG"
        style={{
          position: "absolute",
          width: svgWidth,
          height: svgHeight,
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        {Object.values(taskUnits.units).map((unit) => {
          {
            return [...unit.directDependencies].map((depUnitId) => {
              const depUnitData = taskUnits.units[depUnitId];
              assertIsObject(depUnitData);
              const connection = new ConnectedPoints(
                {
                  x: getPixelGapBetweenTimes(
                    depUnitData.apparentEndTime,
                    earliestStartTime
                  ),
                  y: getYOfTrackTop(depUnitData.trackIndex) + trackHeight / 2,
                },
                {
                  x: getPixelGapBetweenTimes(
                    unit.apparentStartTime,
                    earliestStartTime
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
      <svg
        data-testid="dateLinesSvg"
        style={{
          position: "absolute",
          width: svgWidth,
          height: svgHeight,
          left: 0,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <g
          className="dateLines"
          data-testid="dateLinesGroup"
          style={{
            position: "absolute",
            width: svgWidth,
            height: svgHeight,
            left: 0,
            top: 0,
          }}
        >
          {dateIntervals.map((date, index) => {
            const left = getPixelGapBetweenTimes(
              date.getTime(),
              earliestStartTime
            );
            return (
              <g key={index} className="singleDateLineGroup">
                <text
                  x={left}
                  y={"1em"}
                  style={{
                    fill: "black",
                    fontSize: 20,
                    textAnchor: "middle",
                  }}
                >
                  {date.toLocaleDateString()}
                </text>
                <line
                  x1={left}
                  x2={left}
                  y1={svgDateTopPadding / 2}
                  y2={svgHeight}
                  style={{
                    stroke: "lightgrey",
                    strokeWidth: "1px",
                    fill: "none",
                    strokeDasharray: "10,10",
                  }}
                ></line>
              </g>
            );
          })}
          <g>
            <text
              x={nowLeft}
              y={"3em"}
              style={{
                fill: "black",
                fontSize: 15,
                textAnchor: "middle",
                pointerEvents: "all",
              }}
            >
              Now
            </text>
            <path
              d={`M${nowLeft},${svgDateTopPadding / 2} V ${svgHeight}`}
              style={{
                stroke: "lightgrey",
                strokeWidth: "1px",
                fill: "none",
              }}
            ></path>
          </g>
        </g>
      </svg>
    </div>
  );
}
