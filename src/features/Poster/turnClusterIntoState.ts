import GraphableChainPath from "../../Graphing/GraphableChainPath";
import type { TaskUnitCluster } from "../../Relations";
import type {
  TaskUnitsState,
  TaskUnitMap,
  TrackToUnitMap,
} from "./taskUnitsSlice";

export function turnClusterIntoState(cluster: TaskUnitCluster): TaskUnitsState {
  const totalPresence = cluster.paths.reduce(
    (acc: number, path) => acc + path.presenceTime,
    0
  );
  const halfwayPresencePoint = totalPresence / 2;

  let trackCurrentlyBeingBuilt: GraphableChainPath[] = [];
  let pathTracks: GraphableChainPath[][] = [trackCurrentlyBeingBuilt];
  for (let path of cluster.pathsSortedByRanking) {
    const graphablePath = new GraphableChainPath(path);
    let overlapFound = false;
    for (let trackedPath of trackCurrentlyBeingBuilt) {
      if (path.overlapsWithPath(trackedPath.path)) {
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

  const unitCoords: TaskUnitMap = {};
  for (let track of pathTracks) {
    const pathsHeights = track.map((path) => path.tracks.length);

    const tallestPathHeight = Math.max(...pathsHeights);
    const beforeHalfwayPoint = presenceSoFar < halfwayPresencePoint;
    track.forEach((path) => {
      while (path.tracks.length < tallestPathHeight) {
        // fill with empty arrays to make positioning and determining coordinates easier when above the center point.
        // Otherwise, tracks won't be positioned towards the bottom, and we'd have to do more expensive calculations to
        // find the positions of each unit.
        path.tracks.push([]);
      }
      if (beforeHalfwayPoint) {
        // flip them around because we're above the center point
        path.tracks.reverse();
      }
      path.tracks.forEach((track, unitTrackIndex) => {
        for (let unit of track) {
          unitCoords[unit.id] = {
            anticipatedStartTime: unit.anticipatedStartDate.getTime(),
            anticipatedEndTime: unit.anticipatedEndDate.getTime(),
            apparentStartTime: unit.apparentStartDate.getTime(),
            apparentEndTime: unit.apparentEndDate.getTime(),
            trackIndex: unitTracksSoFar + unitTrackIndex,
            name: unit.name,
            id: unit.id,
            directDependencies: [...unit.directDependencies].map((u) => u.id),
            eventHistory: unit.interpolatedEventHistory.map((event) => ({
              type: event.type,
              time: event.date.getTime(),
              projected: event.projected,
            })),
          };
        }
      });
    });
    // These steps must be done outside the track.forEach to make sure the paths in the track stay together
    unitTracksSoFar += tallestPathHeight;
    track.forEach((path) => (presenceSoFar += path.path.presenceTime));
  }

  const trackMap: TrackToUnitMap = [];
  for (let unit of Object.values(unitCoords)) {
    const track = (trackMap[unit.trackIndex] ??= []);
    track.push(unit.id);
  }

  const initialState: TaskUnitsState = {
    loading: false,
    units: unitCoords,
    unitTrackMap: trackMap,
  };
  return initialState;
}
