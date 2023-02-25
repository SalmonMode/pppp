import incrmpcorr from "@stdlib/stats-incr-mpcorr";
import { differenceInSeconds } from "date-fns";
import { assertIsNumber } from "primitive-predicates";
import type { ChainPath, TaskUnitCluster } from "../../../Relations";
import {
  EventType,
  ITaskPrerequisites,
  ITaskUnit,
  SerializableTaskEvent,
  SerializableTaskPrerequisitesReference,
  TaskEvent,
} from "../../../types";
import type {
  TaskMetrics,
  TaskUnitMap,
  TaskUnitsLoadingCompleteState,
  TaskUnitsState,
  TrackToUnitMap,
} from "./taskUnitsSlice";

export function turnClusterIntoState(
  cluster: TaskUnitCluster
): TaskUnitsLoadingCompleteState {
  const totalPresence = cluster.paths.reduce<number>(
    (acc: number, path: ChainPath): number => acc + path.presenceTime,
    0
  );
  const halfwayPresencePoint = totalPresence / 2;

  let trackCurrentlyBeingBuilt: ChainPath[] = [];
  const pathTracks: ChainPath[][] = [trackCurrentlyBeingBuilt];
  for (const path of cluster.pathsSortedByRanking) {
    let overlapFound = false;
    for (const trackedPath of trackCurrentlyBeingBuilt) {
      if (path.overlapsWithPath(trackedPath)) {
        // Overlap found, meaning it cannot fit on the same track, so track and break from the innermost loop.
        overlapFound = true;
        break;
      }
    }
    if (overlapFound) {
      // Can't fit on the same track so start building the next
      trackCurrentlyBeingBuilt = [path];
      pathTracks.push(trackCurrentlyBeingBuilt);
      continue;
    }
    // No overlap, so it can go in the same track
    trackCurrentlyBeingBuilt.push(path);
  }
  let presenceSoFar = 0;
  let unitTracksSoFar = 0;

  const unitCoords: TaskUnitMap = {};
  for (const track of pathTracks) {
    const pathsHeights = track.map(
      (path: ChainPath): number => path.tracks.length
    );

    const tallestPathHeight = Math.max(...pathsHeights);
    const beforeHalfwayPoint = presenceSoFar < halfwayPresencePoint;
    track.forEach((path: ChainPath): void => {
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
      path.tracks.forEach(
        (track: ITaskUnit[], unitTrackIndex: number): void => {
          for (const unit of track) {
            unitCoords[unit.id] = {
              anticipatedStartTime: unit.anticipatedStartDate.getTime(),
              anticipatedEndTime: unit.anticipatedEndDate.getTime(),
              apparentStartTime: unit.apparentStartDate.getTime(),
              apparentEndTime: unit.apparentEndDate.getTime(),
              trackIndex: unitTracksSoFar + unitTrackIndex,
              name: unit.name,
              id: unit.id,
              directDependencies: [...unit.directDependencies].map(
                (u: ITaskUnit): string => u.id
              ),
              explicitEventHistory: unit.explicitEventHistory.map(
                (event: TaskEvent): SerializableTaskEvent => {
                  const time = event.date.getTime();
                  if (event.type === EventType.TaskIterationStarted) {
                    return {
                      type: event.type,
                      time,
                      prerequisitesVersion: event.prerequisitesVersion,
                    };
                  }
                  return {
                    type: event.type,
                    time,
                  };
                }
              ),
              projectedEventHistory: unit.projectedEventHistory.map(
                (event: TaskEvent): SerializableTaskEvent => {
                  const time = event.date.getTime();
                  if (event.type === EventType.TaskIterationStarted) {
                    return {
                      type: event.type,
                      time,
                      prerequisitesVersion: event.prerequisitesVersion,
                    };
                  }
                  return {
                    type: event.type,
                    time,
                  };
                }
              ),
              prerequisitesIterations: unit.prerequisitesIterations.map(
                (
                  iter: ITaskPrerequisites
                ): SerializableTaskPrerequisitesReference => ({
                  id: iter.id,
                  approved: !!iter.approvedDate,
                  parentUnits: (iter.parentUnits || []).map((unit) => unit.id),
                })
              ),
            };
          }
        }
      );
    });
    // These steps must be done outside the track.forEach to make sure the paths in the track stay together
    unitTracksSoFar += tallestPathHeight;
    track.forEach((path: ChainPath): void => {
      presenceSoFar += path.presenceTime;
    });
  }

  const trackMap: TrackToUnitMap = [];
  for (const unit of Object.values(unitCoords)) {
    const track = (trackMap[unit.trackIndex] ??= []);
    track.push(unit.id);
  }
  const metrics: TaskMetrics = {
    cumulativeDelays: {},
    cumulativeExtensions: {},
    processTime: {},
    estimatesCoefficient: 0,
  };
  const units = cluster.chainMap.units;
  let totalDelaysInSeconds = 0;
  let totalExtensionsInSeconds = 0;
  let totalProcessTimeInSeconds = 0;
  let coefficient: number | null = 0;
  const window = 20;
  const accumulator = incrmpcorr(window);
  for (const unit of units) {
    const currentDelayInSeconds = differenceInSeconds(
      unit.apparentStartDate,
      unit.anticipatedStartDate
    );
    totalDelaysInSeconds += currentDelayInSeconds;
    // assumes that extensions cause by other events and reiterations are all still extensions, because the task still
    // took longer than anticipated once it was started.
    const anticipatedDurationInSeconds = differenceInSeconds(
      unit.anticipatedEndDate,
      unit.anticipatedStartDate
    );
    const apparentDurationInSeconds = differenceInSeconds(
      unit.apparentEndDate,
      unit.apparentStartDate
    );
    const currentExtensionInSeconds =
      apparentDurationInSeconds - anticipatedDurationInSeconds;
    totalExtensionsInSeconds += currentExtensionInSeconds;
    totalProcessTimeInSeconds += apparentDurationInSeconds;
    assertIsNumber(anticipatedDurationInSeconds);
    assertIsNumber(apparentDurationInSeconds);
    coefficient = accumulator(
      anticipatedDurationInSeconds,
      apparentDurationInSeconds
    );
  }
  // Delays
  metrics.cumulativeDelays.seconds = Math.round(totalDelaysInSeconds) % 60;
  metrics.cumulativeDelays.minutes = Math.floor(totalDelaysInSeconds / 60) % 60;
  metrics.cumulativeDelays.hours =
    Math.floor(totalDelaysInSeconds / (60 * 60)) % 24;
  metrics.cumulativeDelays.days =
    Math.floor(totalDelaysInSeconds / (60 * 60 * 24)) % 365;
  // Extensions
  metrics.cumulativeExtensions.seconds =
    Math.round(totalExtensionsInSeconds) % 60;
  metrics.cumulativeExtensions.minutes =
    Math.floor(totalExtensionsInSeconds / 60) % 60;
  metrics.cumulativeExtensions.hours =
    Math.floor(totalExtensionsInSeconds / (60 * 60)) % 24;
  metrics.cumulativeExtensions.days =
    Math.floor(totalExtensionsInSeconds / (60 * 60 * 24)) % 365;
  // Process Time
  const averageProcessTimeInSeconds = totalProcessTimeInSeconds / units.length;
  metrics.processTime.seconds = Math.round(averageProcessTimeInSeconds) % 60;
  metrics.processTime.minutes =
    Math.floor(averageProcessTimeInSeconds / 60) % 60;
  metrics.processTime.hours =
    Math.floor(averageProcessTimeInSeconds / (60 * 60)) % 24;
  metrics.processTime.days =
    Math.floor(averageProcessTimeInSeconds / (60 * 60 * 24)) % 365;
  assertIsNumber(coefficient);
  metrics.estimatesCoefficient = coefficient;

  const initialState: TaskUnitsState = {
    loading: false,
    units: unitCoords,
    unitTrackMap: trackMap,
    metrics,
  };
  return initialState;
}
