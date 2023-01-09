import GraphableChainPath from "../../Graphing/GraphableChainPath";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject } from "../../typePredicates";
import { Coordinate } from "../../types/ConnectedPoints";
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
  const unitC = new TaskUnit([unitA], secondStartDate, secondEndDate, "C");

  const unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate, "D");
  const unitE = new TaskUnit([unitC], thirdStartDate, thirdEndDate, "E");
  const unitF = new TaskUnit([unitC], thirdStartDate, thirdEndDate, "F");

  const unitG = new TaskUnit([unitB], fourthStartDate, fourthEndDate, "G");
  const unitH = new TaskUnit(
    [unitE, unitF],
    fourthStartDate,
    fourthEndDate,
    "H"
  );

  const unitI = new TaskUnit([unitG, unitH], fifthStartDate, fifthEndDate, "I");

  const cluster = new TaskUnitCluster([unitD, unitI]);
  const path = cluster.paths[0];
  assertIsObject(path);
  const totalPresence = cluster.paths.reduce(
    (acc: number, path) => acc + path.presenceTime,
    0
  );
  const halfwayPresencePoint = totalPresence / 2;
  const units = path.chains.reduce(
    (acc: TaskUnit[], chain) => [...acc, ...chain.units],
    []
  );
  const earliestUnit = units[units.length - 1];
  assertIsObject(earliestUnit);
  const earliestStartTime = earliestUnit.initialStartDate.getTime();

  let trackCurrentlyBeingBuilt: GraphableChainPath[] = [];
  let pathTracks: GraphableChainPath[][] = [trackCurrentlyBeingBuilt];
  for (let path of cluster.paths) {
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
  return (
    <div>
      {pathTracks.map((track, index) => {
        // Get the adjusted Y before considering how tall the paths are in this track. We need to track the unit tracks
        // found so far, but this track will be positioned relative to all the tracks that came before it, so we don't
        // need to factor in itself yet.
        const adjustedY = unitTracksSoFar * 40;
        // Update the unitTracksSoFar for future iterations
        const tallestPath = track.reduce((prev, curr) =>
          prev.tracks.length > curr.tracks.length ? prev : curr
        );
        unitTracksSoFar += tallestPath.tracks.length;
        const earliestPath = track.reduce((prev, curr) =>
          prev.path.initialStartDate < curr.path.initialStartDate ? prev : curr
        );
        const adjustedX =
          (earliestPath.path.initialStartDate.getTime() - earliestStartTime) /
          20;
        const position: Coordinate = { x: adjustedX, y: adjustedY };
        // Grab direction before considering mass of the current track. We only want to swap directions *after* passing
        // the middle point.
        const direction = presenceSoFar < halfwayPresencePoint ? 1 : -1;
        // Update the presenceSoFar for future iterations
        track.forEach((path) => (presenceSoFar += path.path.presenceTime));
        return (
          <PathTrack
            key={index}
            directionOfCenterOfMass={direction}
            paths={track}
            position={position}
          />
        );
      })}
    </div>
  );
}
