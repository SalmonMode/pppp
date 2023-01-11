import { useEffect, useState } from "react";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import GraphableChainPath from "../../Graphing/GraphableChainPath";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject } from "../../typePredicates";
import { Coordinate } from "../../types";
import { trackHeight, unitTaskTimeConversion } from "../constants";
import PathTrack from "./ChainPathBox/PathTrack";

export default function Poster() {
  const firstStartDate = new Date();
  const firstEndDate = new Date(firstStartDate.getTime() + 1000);
  const secondStartDate = new Date(firstEndDate.getTime() + 1000);
  const secondEndDate = new Date(secondStartDate.getTime() + 1000);
  const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
  const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
  const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
  const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
  const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
  const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
  const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");

  const unitB = new TaskUnit([unitA], secondStartDate, secondEndDate, "B");

  const unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate, "C");
  const unitD = new TaskUnit([unitA], thirdStartDate, thirdEndDate, "D");
  const unitE = new TaskUnit([unitB], thirdStartDate, thirdEndDate, "E");

  const unitF = new TaskUnit([unitC], fourthStartDate, fourthEndDate, "F");
  const unitG = new TaskUnit([unitC], fourthStartDate, fourthEndDate, "G");
  const unitH = new TaskUnit(
    [unitC, unitD],
    fourthStartDate,
    fourthEndDate,
    "H"
  );
  const unitI = new TaskUnit(
    [unitC, unitD, unitE],
    fourthStartDate,
    fourthEndDate,
    "I"
  );
  const unitJ = new TaskUnit(
    [unitD, unitE],
    fourthStartDate,
    fourthEndDate,
    "J"
  );
  const unitK = new TaskUnit([unitE], fourthStartDate, fourthEndDate, "K");

  const unitL = new TaskUnit(
    [unitH, unitI, unitJ],
    fifthStartDate,
    fifthEndDate,
    "L"
  );

  const cluster = new TaskUnitCluster([unitF, unitG, unitK, unitL]);
  const totalPresence = cluster.paths.reduce(
    (acc: number, path) => acc + path.presenceTime,
    0
  );
  const halfwayPresencePoint = totalPresence / 2;
  const units = cluster.paths.reduce(
    (acc: TaskUnit[], path) => [
      ...acc,
      ...path.chains.reduce(
        (acc: TaskUnit[], chain) => [...acc, ...chain.units],
        []
      ),
    ],
    []
  );

  const earliestUnit = units.reduce((prev, curr) =>
    prev.initialStartDate > curr.initialStartDate ? curr : prev
  );
  const latestUnit = units.reduce((prev, curr) =>
    prev.endDate < curr.endDate ? curr : prev
  );
  assertIsObject(earliestUnit);
  const earliestStartTime = earliestUnit.initialStartDate.getTime();

  let trackCurrentlyBeingBuilt: GraphableChainPath[] = [];
  let pathTracks: GraphableChainPath[][] = [trackCurrentlyBeingBuilt];
  for (let path of cluster.pathsSortedByRanking) {
    const graphablePath = new GraphableChainPath(path);
    let overlapFound = false;
    for (let trackedPath of trackCurrentlyBeingBuilt) {
      if (
        path.initialStartDate <= trackedPath.path.endDate &&
        path.endDate >= trackedPath.path.initialStartDate
      ) {
        // Overlap found, meaning it cannot fit on the same track, so track and break from the innermost loop.
        overlapFound = true;
        break;
      }
    }
    if (overlapFound) {
      // Can't fit on the same track so start building the next
      trackCurrentlyBeingBuilt = [graphablePath];
      pathTracks.push(trackCurrentlyBeingBuilt);
      continue;
    }
    // No overlap, so it can go in the same track
    trackCurrentlyBeingBuilt.push(graphablePath);
  }
  let presenceSoFar = 0;
  let unitTracksSoFar = 0;

  const unitCoords: {
    [key: string]: {
      unit: TaskUnit;
      trackIndex: number;
    };
  } = {};
  pathTracks.forEach((track, index) => {
    const tallestPath = track.reduce((prev, curr) =>
      prev.tracks.length > curr.tracks.length ? prev : curr
    );
    track.forEach((path) => {
      while (path.tracks.length < tallestPath.tracks.length) {
        // fill with empty arrays to make positioning and determining coordinates easier when above the center point.
        // Otherwise, tracks won't be positioned towards the bottom, and we'd have to do more expensive calculations to
        // find the positions of each unit.
        path.tracks.push([]);
      }
      if (presenceSoFar < halfwayPresencePoint) {
        // flip them around because we're above the center point
        path.tracks.reverse();
      }
      path.tracks.forEach((track, unitTrackIndex) => {
        track.forEach((unit) => {
          unitCoords[unit.id] = {
            unit,
            trackIndex: unitTracksSoFar + unitTrackIndex,
          };
        });
      });
      unitTracksSoFar += tallestPath.tracks.length;
      track.forEach((path) => (presenceSoFar += path.path.presenceTime));
    });
  });
  const [stateCluster, setCluster] = useState(false);
  useEffect(() => setCluster(true), []);
  if (!stateCluster) {
    return <div>loading...</div>;
  }
  const svgHeight = unitTracksSoFar * trackHeight;
  const timespan = latestUnit.endDate.getTime() - earliestStartTime;
  const svgWidth = timespan / unitTaskTimeConversion;
  unitTracksSoFar = 0;
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
        {units.map((unit, index) => {
          {
            const unitData = unitCoords[unit.id];
            assertIsObject(unitData);
            return [...unit.directDependencies].map((depUnit, depIndex) => {
              const depUnitData = unitCoords[depUnit.id];
              assertIsObject(depUnitData);
              const connection = new ConnectedPoints(
                {
                  x:
                    (depUnit.endDate.getTime() - earliestStartTime) /
                    unitTaskTimeConversion,
                  y: depUnitData.trackIndex * trackHeight + trackHeight / 2,
                },
                {
                  x:
                    (unit.initialStartDate.getTime() - earliestStartTime) /
                    unitTaskTimeConversion,
                  y: unitData.trackIndex * trackHeight + trackHeight / 2,
                }
              );
              const curve = connection.getCubicBezierPathBetweenPoints();
              const curveAsPathString = `M${curve.startPoint.x},${curve.startPoint.y} C${curve.startControlPoint.x},${curve.startControlPoint.y} ${curve.endControlPoint.x},${curve.endControlPoint.y} ${curve.endPoint.x},${curve.endPoint.y}`;
              return (
                <g key={`${index}-${depIndex}`}>
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
      <div style={{ position: "absolute", left: 0, top: 0 }}>
        {pathTracks.map((track, index) => {
          // Get the adjusted Y before considering how tall the paths are in this track. We need to track the unit tracks
          // found so far, but this track will be positioned relative to all the tracks that came before it, so we don't
          // need to factor in itself yet.
          const adjustedY = unitTracksSoFar * trackHeight;
          // Update the unitTracksSoFar for future iterations
          const tallestPath = track.reduce((prev, curr) =>
            prev.tracks.length > curr.tracks.length ? prev : curr
          );
          unitTracksSoFar += tallestPath.tracks.length;
          const earliestPath = track.reduce((prev, curr) =>
            prev.path.initialStartDate < curr.path.initialStartDate
              ? prev
              : curr
          );
          const adjustedX =
            (earliestPath.path.initialStartDate.getTime() - earliestStartTime) /
            unitTaskTimeConversion;
          const position: Coordinate = { x: adjustedX, y: adjustedY };
          // Grab direction before considering mass of the current track. We only want to swap directions *after* passing
          // the middle point.
          // Update the presenceSoFar for future iterations
          track.forEach((path) => (presenceSoFar += path.path.presenceTime));
          return <PathTrack key={index} paths={track} position={position} />;
        })}
      </div>
    </div>
  );
}
