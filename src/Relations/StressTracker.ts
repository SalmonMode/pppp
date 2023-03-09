import { NoSuchChainPathError } from "@errors";
import Matrix from "@matrix";
import type IMatrix from "@typing/IMatrix";
import type { RelationshipMapping, ResourceID } from "@typing/Mapping";
import type IChainPath from "@typing/Relations/IChainPath";
import type ISimpleChainPathMap from "@typing/Relations/ISimpleChainPathMap";
import type IStressTracker from "@typing/Relations/IStressTracker";
import type { TrackDetails } from "@typing/Relations/IStressTracker";
import {
  assertIsNumber,
  assertIsObject,
  assertIsString
} from "primitive-predicates";

export default class StressTracker implements IStressTracker {
  /**
   * A matrix that will track the above/below position of every path relative to every other path. If it is above a
   * path, it will have a 1. If below, a -1. For itself, it will always have a 0. This is useful for calculating the
   * stress on any given path in any given position relative to others when multiplied by a matrix containing the
   * number of connections between each path, ordered in the same way. As paths are swapped with each other to find the
   * optimal order, this matrix will be modified.
   */
  private __positionsMatrix: IMatrix;
  /**
   * The current distance from each path to the others.
   *
   * This factors in track height.
   */
  private _distanceMatrix: IMatrix;
  private _currentTotalDistance: number;
  /**
   * The current information about which paths are on which tracks, and how tall each track is.
   */
  private _allTracksDetails: TrackDetails[];
  /**
   * The matrix only understands integers for its column and row indexes. So we need to track the order of all the paths
   * according to their sorted ID order. The index of their ID in this list represents the index of their column and row
   * in the matrix.
   */
  readonly pathMatrixKeys: string[];
  constructor(public pathMap: ISimpleChainPathMap) {
    this.pathMatrixKeys = this._getPathMatrixKeys();
    this.__positionsMatrix = this._buildPositionsMatrix();
    this._allTracksDetails = this._getPathTrackDetailsWithPositions(
      this._positionsMatrix
    );
    this._distanceMatrix = this._getDistanceMatrixUsingPositions(
      this._positionsMatrix
    );
    this._currentTotalDistance = this._getTotalDistanceWithDistances(
      this._distanceMatrix
    );
  }
  /**
   * A matrix that will track the above/below position of every path relative to every other path. If it is above a
   * path, it will have a 1. If below, a -1. For itself, it will always have a 0. This is useful for calculating the
   * stress on any given path in any given position relative to others when multiplied by a matrix containing the
   * number of connections between each path, ordered in the same way. As paths are swapped with each other to find the
   * optimal order, this matrix will be modified.
   */
  private get _positionsMatrix(): IMatrix {
    return this.__positionsMatrix;
  }
  private set _positionsMatrix(positionsMatrix: IMatrix) {
    this.__positionsMatrix = positionsMatrix;
    this._allTracksDetails =
      this._getPathTrackDetailsWithPositions(positionsMatrix);
    this._distanceMatrix = this._getDistanceMatrixUsingPositionsAndTrackDetails(
      positionsMatrix,
      this._allTracksDetails
    );
    this._currentTotalDistance = this._getTotalDistanceWithDistances(
      this._distanceMatrix
    );
  }
  private _getTotalConnectionDistanceForPathWithDistancesById(
    distances: IMatrix,
    pathId: ResourceID
  ): number {
    let distance = 0;
    const pathMatrixIndex = this.getMatrixIndexForPathId(pathId);
    const pathConns = this.pathMap.getConnectionsForPathById(pathId);
    for (const [otherPathId, numberOfConnections] of Object.entries(
      pathConns
    )) {
      const otherPathMatrixIndex = this.getMatrixIndexForPathId(otherPathId);

      const distanceBetween = distances.getElementAtPosition(
        pathMatrixIndex,
        otherPathMatrixIndex
      );
      distance += distanceBetween * numberOfConnections;
    }
    return distance;
  }

  /**
   * Get the IDs of the paths in alphabetical order.
   *
   * This reflects their sorting order, and their indexes in this array will line up with their respective row and
   * column indexes in the path matrix and single step matrix.
   *
   * @returns The IDs of the paths in alphabetical order
   */
  private _getPathMatrixKeys(): string[] {
    return Object.keys(this.pathMap.connectionStrengthMapping).sort();
  }
  /**
   *
   * @returns a matrix showing the initial positions of each path relative to each other.
   */
  private _buildPositionsMatrix(): IMatrix {
    const matrixData: number[][] = [];
    // The initial order doesn't matter, so we can assume we're positioning them in the order of their keys. The first
    // path will be positioned on top of everything else, so it should have a 0 in its first position, and 1s in the
    // remaining positions (because it's above everything else). The second path will be positioned just below it, so it
    // should have a -1 in the first position (because it's below the first path), a zero in the second position
    // (because it's neither above or below itself), and 1s in the remaining positions.
    for (let i = 0; i < this.pathMatrixKeys.length; i++) {
      const aboveColumns = Array(this.pathMatrixKeys.length - 1 - i).fill(1);
      const belowColumns = Array(i).fill(-1);
      const newRow = belowColumns.concat(0, aboveColumns);
      matrixData.push(newRow);
    }
    return new Matrix(matrixData);
  }
  /**
   * @param pathId
   * @returns The index in matrices that correspond with the row and column index of the path associated with the id.
   */
  getPathIdForMatrixIndex(index: number): ResourceID {
    const pathId = this.pathMatrixKeys[index];
    if (!pathId) {
      throw new NoSuchChainPathError(`No path found at matrix index ${index}`);
    }
    return pathId;
  }
  /**
   * @param pathId
   * @returns The index in matrices that correspond with the row and column index of the path associated with the id.
   */
  getMatrixIndexForPathId(pathId: string): number {
    return this.pathMatrixKeys.indexOf(pathId);
  }
  /**
   * Swap the paths and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  swapPathsById(pathId: ResourceID, otherPathId: ResourceID): void {
    this._positionsMatrix =
      this.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
        pathId,
        otherPathId
      );
  }
  /**
   * Converge the paths, bringing them together at the middle point between them, and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  convergePathsById(pathId: ResourceID, otherPathId: ResourceID): void {
    this._positionsMatrix =
      this.getUpdatedRelativePositionsMatrixFromConvergingPathsById(
        pathId,
        otherPathId
      );
  }
  /**
   * Move the path below the other path and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  movePathBelowPathById(pathId: ResourceID, otherPathId: ResourceID): void {
    this._positionsMatrix =
      this.getUpdatedRelativePositionsMatrixFromMovingPathBelowPathById(
        pathId,
        otherPathId
      );
  }
  /**
   * Move the path above all other paths and update all the stress values.
   *
   * @param pathId
   */
  movePathToTopById(pathId: ResourceID): void {
    this._positionsMatrix =
      this.getUpdatedRelativePositionsMatrixFromMovingPathToTopById(pathId);
  }
  /**
   * Get the updated relative positions matrix after swapping the positions of two paths.
   *
   * @param pathId one of the paths that is switching its position
   * @param otherPathId the other path that is switching its position with the first path
   * @returns a matrix showing the relative positions of all paths after swapping the positions of two paths
   */
  getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): IMatrix {
    const diff = this._getDifferenceBetweenPathsById(pathId, otherPathId);
    const matrixIndexOfPath = this.getMatrixIndexForPathId(pathId);
    const matrixIndexOfOtherPath = this.getMatrixIndexForPathId(otherPathId);

    // Produce a new matrix containing the updated relative positions.
    const updatedPositionData: number[][] = [];
    this.pathMatrixKeys.forEach((_key: string, index: number): void => {
      const oldRow = [...this._positionsMatrix.getRow(index)];
      if (diff[index]) {
        // this row was affected so update it
        if (index === matrixIndexOfPath || index === matrixIndexOfOtherPath) {
          // The row for one of the swapping paths. All truthy indexes in the diff need to be updated
          const updatedRow = oldRow.map(
            (value: number, columnIndex: number): number => {
              if (diff[columnIndex]) {
                // The value for one of the impacted paths
                return value * -1;
              }
              // A path that was neither one of the swapping paths, nor one of the paths between them.
              return value;
            }
          );
          updatedPositionData.push(updatedRow);
        } else {
          // One of the in between paths. Only the values for the swapped paths need to be swapped. All other values can
          // stay the same.
          const updatedRow = oldRow.map(
            (value: number, columnIndex: number): number => {
              if (
                columnIndex === matrixIndexOfPath ||
                columnIndex === matrixIndexOfOtherPath
              ) {
                // The value for one of the swapped paths
                return value * -1;
              }
              // A path that was neither one of the swapping paths
              return value;
            }
          );
          updatedPositionData.push(updatedRow);
        }
      } else {
        updatedPositionData.push(oldRow);
      }
    });
    return new Matrix(updatedPositionData);
  }
  /**
   * Get the updated relative positions matrix after moving the two paths closer together until they are right night to
   * each other.
   *
   * @param pathId
   * @param otherPathId
   * @returns a matrix showing the relative positions of all paths after moving the paths next to each other
   */
  getUpdatedRelativePositionsMatrixFromConvergingPathsById(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): IMatrix {
    const pathsBetween = this._getPathsBetweenPathsWithPositionsById(
      this._positionsMatrix,
      pathId,
      otherPathId
    );
    if (pathsBetween.length === 0) {
      return this._positionsMatrix;
    }
    const currentRankings = this.getRankings();
    const [upperPathId, lowerPathId] = [pathId, otherPathId].sort(
      (a: string, b: string): number =>
        currentRankings.indexOf(a) - currentRankings.indexOf(b)
    );
    assertIsString(upperPathId);
    assertIsString(lowerPathId);
    const middlePathId =
      pathsBetween[Math.floor((pathsBetween.length - 1) / 2)];
    assertIsString(middlePathId);
    // First move the upper path below the middle path. The lower path will be moved below the upper path after the
    // first move to preserve their order.
    const firstMoveMatrix =
      this.getUpdatedRelativePositionsMatrixFromMovingPathBelowPathById(
        upperPathId,
        middlePathId
      );
    // Now move the lower path below the upper path
    const secondMoveMatrix =
      this._getUpdatedRelativePositionsMatrixFromMovingPathBelowPathWithPositionsById(
        firstMoveMatrix,
        lowerPathId,
        upperPathId
      );
    // The middle path should now be just above the upper path, and the lower path should now be just below the upper
    // path.
    return secondMoveMatrix;
  }
  /**
   * Get the updated relative positions matrix after moving one path below another.
   *
   * @param positions the matrix of positions to move from
   * @param pathId the ID of the path that is moving
   * @param otherPathId the ID of the path that the moving path is moving below
   * @returns a matrix showing the relative positions of all paths after moving the path below the other path
   */
  private _getUpdatedRelativePositionsMatrixFromMovingPathBelowPathWithPositionsById(
    positions: IMatrix,
    pathId: ResourceID,
    otherPathId: ResourceID
  ): IMatrix {
    const matrixIndexOfPathThatIsMoving = this.getMatrixIndexForPathId(pathId);
    const matrixIndexOfPathThatItIsMovingBelow =
      this.getMatrixIndexForPathId(otherPathId);

    // Produce a new matrix containing the updated relative positions.
    const updatedPositionData: number[][] = [];
    this.pathMatrixKeys.forEach((key: string, index: number): void => {
      let updatedRow: number[];
      if (key === pathId) {
        // This is the row that is moving, so copy the target path's positions, but update its relative position to the
        // target path to be -1. It should be relatively positioned the same as the target path, save for it's position
        // to the target path (since it should be below it).
        updatedRow = [
          ...positions.getRow(matrixIndexOfPathThatItIsMovingBelow),
        ];
        // set it's position relative to itself to be 0
        updatedRow[matrixIndexOfPathThatIsMoving] = 0;
        // set it's position relative to the target path to be -1
        updatedRow[matrixIndexOfPathThatItIsMovingBelow] = -1;
      } else if (key === otherPathId) {
        // This is the row for the target path. The only thing that might need to change here is that it's position
        // relative to the path that is moving should be 1, because it will be above the moving path.
        updatedRow = [...positions.getRow(index)];
        updatedRow[matrixIndexOfPathThatIsMoving] = 1;
      } else {
        // This is for the rows of every other path. The only thing that might need to change here is that their
        // position relative to the moving path should be the same as their position relative to the target path (since
        // they're right next to each other with nothing in between).
        updatedRow = [...positions.getRow(index)];
        updatedRow.splice(
          matrixIndexOfPathThatIsMoving,
          1,
          ...updatedRow.slice(
            matrixIndexOfPathThatItIsMovingBelow,
            matrixIndexOfPathThatItIsMovingBelow + 1
          )
        );
      }
      updatedPositionData.push(updatedRow);
    });
    return new Matrix(updatedPositionData);
  }
  /**
   * Get the updated relative positions matrix after moving one path below another.
   *
   * @param pathId the ID of the path that is moving
   * @param otherPathId the ID of the path that the moving path is moving below
   * @returns a matrix showing the relative positions of all paths after moving the path below the other path
   */
  getUpdatedRelativePositionsMatrixFromMovingPathBelowPathById(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): IMatrix {
    return this._getUpdatedRelativePositionsMatrixFromMovingPathBelowPathWithPositionsById(
      this._positionsMatrix,
      pathId,
      otherPathId
    );
  }
  /**
   * Get the updated relative positions matrix after moving one path above another.
   *
   * @param pathId the ID of the path that is moving
   * @param otherPathId the ID of the path that the moving path is moving above
   * @returns a matrix showing the relative positions of all paths after moving the path above the other path
   */
  getUpdatedRelativePositionsMatrixFromMovingPathToTopById(
    pathId: ResourceID
  ): IMatrix {
    const matrixIndexOfPathThatIsMoving = this.getMatrixIndexForPathId(pathId);

    // Produce a new matrix containing the updated relative positions.
    const updatedPositionData: number[][] = [];
    this.pathMatrixKeys.forEach((key: string, index: number): void => {
      let updatedRow: number[];
      if (key === pathId) {
        // This is the row that is moving, so make it all 1s except for a 0 for itself.
        updatedRow = this._positionsMatrix
          .getRow(matrixIndexOfPathThatIsMoving)
          .map((value: number): number => (value === 0 ? 0 : 1));
      } else {
        // This is for the rows of every other path. The only thing that might need to change here is that their
        // position relative to the moving path should -1 (since everything is below it now).
        updatedRow = [...this._positionsMatrix.getRow(index)];
        updatedRow[matrixIndexOfPathThatIsMoving] = -1;
      }
      updatedPositionData.push(updatedRow);
    });
    return new Matrix(updatedPositionData);
  }
  /**
   * Get the difference of relative positions between these two paths.
   *
   * This will tell us if both paths are above/below another path (in which case, there's no difference between the two
   * paths), or if they differ. If they differ, then the relative positions will need to be updated.
   *
   * In the array returned, each item corresponds to one of the paths, in the order their keys are sorted. Each number
   * in the array indicates if the associated path would be impacted by the swapping of the two chosen paths. For
   * example, if there are paths A, B, C, and D, with their positions in that order, and their IDs in the same order,
   * the matrix would look something like this:
   *
   * ```text
   *       A  B  C  D
   *    ┏             ┓
   *  A ┃  0  1  1  1 ┃
   *  B ┃ -1  0  1  1 ┃
   *  C ┃ -1 -1  0  1 ┃
   *  D ┃ -1 -1 -1  0 ┃
   *    ┗             ┛
   * ```
   *
   * If we were to swap A and C, the subtraction would look like this:
   *
   * ```text
   *       A  B  C  D         A  B  C  D
   *    ┏             ┓    ┏             ┓
   *   A┃  0  1  1  1 ┃ - C┃ -1 -1  0  1 ┃
   *    ┗             ┛    ┗             ┛
   * ```
   *
   * This would result in the following difference:
   *
   * ```text
   *        A  B  C  D
   *    ┏              ┓
   *    ┃  -1  2  1  0 ┃
   *    ┗              ┛
   * ```
   *
   * This difference tells us that A, B, and C, but not D, will be impacted by this shift. We can tell this is the
   * case because D would still be at the bottom, but A would be below B and C, B would be below C and above A, and C
   * would be above A and B. As a result, their respective values must be switched when the time comes.
   *
   * The array simultaneously describes which paths need to have their row in the positions matrix updated, and also
   * which paths they need update their relative position to. B, for example, is not being moved, but we need to update
   * A and C's position relative to it, and we need to update it's relative position to A and C.
   *
   * @param pathId The first path's ID
   * @param otherPathId the second path's ID
   * @returns an array indicating which relative positions need to be updated
   */
  private _getDifferenceBetweenPathsById(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number[] {
    return this._getDifferenceBetweenPathsWithPositionsById(
      this._positionsMatrix,
      pathId,
      otherPathId
    );
  }
  /**
   * Get the difference of relative positions between these two paths, given a particular positioning matrix.
   *
   * This will tell us if both paths are above/below another path (in which case, there's no difference between the two
   * paths), or if they differ. If they differ, then the relative positions will need to be updated.
   *
   * In the array returned, each item corresponds to one of the paths, in the order their keys are sorted. Each number
   * in the array indicates if the associated path would be impacted by the swapping of the two chosen paths. For
   * example, if there are paths A, B, C, and D, with their positions in that order, and their IDs in the same order,
   * the matrix would look something like this:
   *
   * ```text
   *       A  B  C  D
   *    ┏             ┓
   *  A ┃  0  1  1  1 ┃
   *  B ┃ -1  0  1  1 ┃
   *  C ┃ -1 -1  0  1 ┃
   *  D ┃ -1 -1 -1  0 ┃
   *    ┗             ┛
   * ```
   *
   * If we were to swap A and C, the subtraction would look like this:
   *
   * ```text
   *       A  B  C  D         A  B  C  D
   *    ┏             ┓    ┏             ┓
   *   A┃  0  1  1  1 ┃ - C┃ -1 -1  0  1 ┃
   *    ┗             ┛    ┗             ┛
   * ```
   *
   * This would result in the following difference:
   *
   * ```text
   *        A  B  C  D
   *    ┏              ┓
   *    ┃  -1  2  1  0 ┃
   *    ┗              ┛
   * ```
   *
   * This difference tells us that A, B, and C, but not D, will be impacted by this shift. We can tell this is the
   * case because D would still be at the bottom, but A would be below B and C, B would be below C and above A, and C
   * would be above A and B. As a result, their respective values must be switched when the time comes.
   *
   * The array simultaneously describes which paths need to have their row in the positions matrix updated, and also
   * which paths they need update their relative position to. B, for example, is not being moved, but we need to update
   * A and C's position relative to it, and we need to update it's relative position to A and C.
   *
   * @param positions The positions of each path
   * @param pathId The first path's ID
   * @param otherPathId the second path's ID
   * @returns an array indicating which paths are between the two provided (including the two paths themselves)
   */
  private _getDifferenceBetweenPathsWithPositionsById(
    positions: IMatrix,
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number[] {
    const pathIndex = this.getMatrixIndexForPathId(pathId);
    const otherPathIndex = this.getMatrixIndexForPathId(otherPathId);
    // Find out what else will need to change after this swap
    const pathRow = positions.getRow(pathIndex);
    const otherPathRow = positions.getRow(otherPathIndex);
    // Wherever there is a difference is where updates need to occur.
    const diff = new Matrix([pathRow])
      .subtract(new Matrix([otherPathRow]))
      .getRow(0);
    return diff;
  }
  /**
   * Given a particular arrangement of paths, return a matrix showing how much distance is between each path.
   *
   * @param positionsMatrix the positions of all paths relative to each other
   * @returns a matrix showing the relative stress vectors of each path
   */
  private _getDistanceMatrixUsingPositions(positions: IMatrix): IMatrix {
    const tracks = this._getPathTracksWithPositions(positions);
    const allTracksDetails = this._getPathTrackDetails(tracks);
    return this._getDistanceMatrixUsingPositionsAndTrackDetails(
      positions,
      allTracksDetails
    );
  }
  /**
   * Given a particular arrangement of paths, return a matrix showing how much distance each path would need to take to
   * reach each other path.
   *
   * @param positionsMatrix the positions of all paths relative to each other
   * @returns a matrix showing the relative stress vectors of each path
   */
  private _getDistanceMatrixUsingPositionsAndTrackDetails(
    positions: IMatrix,
    allTracksDetails: TrackDetails[]
  ): IMatrix {
    const distanceData: number[][] = [];
    /**
     * Tracks which track each path is on to speed up lookup times.
     */
    const pathTrackMap: RelationshipMapping =
      allTracksDetails.reduce<RelationshipMapping>(
        (
          acc: RelationshipMapping,
          track: TrackDetails,
          index: number
        ): RelationshipMapping => {
          return {
            ...acc,
            ...track.paths.reduce<RelationshipMapping>(
              (
                innerAcc: RelationshipMapping,
                pathId: string
              ): RelationshipMapping => {
                return { ...innerAcc, [pathId]: index };
              },
              {}
            ),
          };
        },
        {}
      );
    for (const pathId of this.pathMatrixKeys) {
      for (const otherPathId of this.pathMatrixKeys) {
        const matrixIndex = this.getMatrixIndexForPathId(pathId);
        const pathRow: number[] = (distanceData[matrixIndex] ??= []);
        if (pathId === otherPathId) {
          // same path, so put a 0
          pathRow.push(0);
          continue;
        }
        const inBetweens = this._getDifferenceBetweenPathsWithPositionsById(
          positions,
          pathId,
          otherPathId
        );
        const trackIndexesInvolved = new Set<number>();
        inBetweens.forEach((value: number, index: number): void => {
          if (value) {
            // is in between
            const pathId = this.getPathIdForMatrixIndex(index);
            const trackIndex = pathTrackMap[pathId];
            assertIsNumber(trackIndex);
            trackIndexesInvolved.add(trackIndex);
          }
        });
        // remove indexes for the tracks for the path themselves
        const pathTrackIndex = pathTrackMap[pathId];
        assertIsNumber(pathTrackIndex);
        trackIndexesInvolved.delete(pathTrackIndex);
        let distanceBetween = 0;
        for (const trackIndex of trackIndexesInvolved) {
          const trackDetails = allTracksDetails[trackIndex];
          assertIsObject(trackDetails);
          distanceBetween += trackDetails.height;
        }
        pathRow.push(distanceBetween);
      }
    }
    return new Matrix(distanceData);
  }
  /**
   *
   * @param distances The matrix showing how far each path is from every other path
   * @returns the amount of distance each path's connections must take to reach their connected paths
   */
  private _getTotalDistanceWithDistances(distances: IMatrix): number {
    let distance = 0;
    for (const pathId of this.pathMatrixKeys) {
      distance += this._getTotalConnectionDistanceForPathWithDistancesById(
        distances,
        pathId
      );
    }
    return distance;
  }
  /**
   *
   * @returns The total distance of all connections of all paths with the current positioning
   */
  getCurrentTotalDistanceOfPaths(): number {
    return this._currentTotalDistance;
  }
  /**
   * Figure out which ChainPaths should be grouped together in the same tracks given the provided positions matrix.
   *
   * @param positions the positions of the paths
   * @returns an array of ChainPath arrays, with each ChainPath array representing a track
   */
  private _getPathTracksWithPositions(positions: IMatrix): IChainPath[][] {
    const rankings = this._getRankingsUsingPositions(positions);
    // First figure out the tracks
    let trackCurrentlyBeingBuilt: IChainPath[] = [];
    const pathTracks: IChainPath[][] = [trackCurrentlyBeingBuilt];
    for (const pathId of rankings) {
      const path = this.pathMap.getPathById(pathId);
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
    return pathTracks;
  }
  /**
   * Convert the provided arrays of ChainPath arrays (with each ChainPath array representing a given track) into track
   * details.
   *
   * @param tracks the paths of each track
   * @returns the track details for all tracks
   */
  private _getPathTrackDetails(tracks: IChainPath[][]): TrackDetails[] {
    const trackDetails: TrackDetails[] = [];
    for (const track of tracks) {
      const height = track.reduce<number>(
        (acc: number, path: IChainPath): number =>
          Math.max(acc, path.tracks.length),
        0
      );
      trackDetails.push({
        height,
        paths: track.map((path: IChainPath): string => path.id),
      });
    }
    return trackDetails;
  }
  /**
   * Get the details for all the tracks given the provided positions matrix.
   *
   * @param positions the positions of the paths
   * @returns the track details
   */
  private _getPathTrackDetailsWithPositions(
    positions: IMatrix
  ): TrackDetails[] {
    const tracks = this._getPathTracksWithPositions(positions);
    return this._getPathTrackDetails(tracks);
  }
  /**
   * Given the positions and the current track details, get the cumulative distance each path would have to travel to
   * reach each of its connected paths.
   *
   * @param positions the positions of the paths
   * @returns the cumulative distance each path would have to travel to reach each of its connected paths
   */
  getTotalDistanceOfPathsWithPositions(positions: IMatrix): number {
    const allTracksDetails = this._getPathTrackDetailsWithPositions(positions);
    return this._getTotalDistanceOfPathsWithPositionsWithTrackDetails(
      positions,
      allTracksDetails
    );
  }
  /**
   * Given the positions and track details, get the cumulative distance each path would have to travel to reach each of
   * its connected paths.
   *
   * @param positions the positions of the paths
   * @param allTracksDetails the track details
   * @returns the cumulative distance each path would have to travel to reach each of its connected paths
   */
  private _getTotalDistanceOfPathsWithPositionsWithTrackDetails(
    positions: IMatrix,
    allTracksDetails: TrackDetails[]
  ): number {
    const distances = this._getDistanceMatrixUsingPositionsAndTrackDetails(
      positions,
      allTracksDetails
    );
    return this._getTotalDistanceWithDistances(distances);
  }
  /**
   * Get the IDs of the ChainPaths that are between the two paths provided, according to the provided positions matrix.
   *
   * Note: This includes the IDs of the two paths provided.
   *
   * @param positions the positions of the paths
   * @param pathId one of the two outer paths to consider
   * @param otherPathId one of the two outer paths to consider
   * @returns an array of ChainPath IDs
   */
  private _getPathsBetweenPathsWithPositionsById(
    positions: IMatrix,
    pathId: ResourceID,
    otherPathId: ResourceID
  ): ResourceID[] {
    const inBetweens = this._getDifferenceBetweenPathsWithPositionsById(
      positions,
      pathId,
      otherPathId
    );
    const pathIdsInvolved: ResourceID[] = [];
    inBetweens.forEach((value: number, index: number): void => {
      if (value) {
        // is in between
        const inBetweenPathId = this.pathMatrixKeys[index];
        if (
          inBetweenPathId &&
          ![pathId, otherPathId].includes(inBetweenPathId)
        ) {
          pathIdsInvolved.push(inBetweenPathId);
        }
      }
    });
    return pathIdsInvolved;
  }
  /**
   *
   * @returns the path IDs sorted from top to bottom according to their positions.
   */
  getRankings(): ResourceID[] {
    return this._getRankingsUsingPositions(this._positionsMatrix);
  }
  /**
   *
   * @returns the path IDs sorted from top to bottom according to their positions.
   */
  private _getRankingsUsingPositions(positions: IMatrix): ResourceID[] {
    const rankings: RelationshipMapping = {};
    for (const id of this.pathMatrixKeys) {
      const matrixIndex = this.getMatrixIndexForPathId(id);
      const positionRow = positions.getRow(matrixIndex);
      const rank = positionRow.reduce<number>(
        (acc: number, curr: number): number => acc + curr,
        0
      );
      rankings[id] = rank;
    }
    const rankedIds = [...this.pathMatrixKeys];
    rankedIds.sort((a: string, b: string): number => {
      const rankA = rankings[a];
      assertIsNumber(rankA);
      const rankB = rankings[b];
      assertIsNumber(rankB);
      return rankB - rankA;
    });
    return rankedIds;
  }
  /**
   *
   * @returns the track details according to the current positioning of the paths
   */
  getCurrentTracks(): TrackDetails[] {
    return this._allTracksDetails;
  }
  /**
   * Get the track details if the paths were positioned according to the passed positions matrix.
   *
   * @param positions the positions of each path
   * @returns the track details
   */
  getTracksWithPositions(positions: IMatrix): TrackDetails[] {
    const tracks = this._getPathTracksWithPositions(positions);
    const allTracksDetails = this._getPathTrackDetails(tracks);
    return allTracksDetails;
  }
}
