import type IMatrix from "@typing/IMatrix";
import type { ResourceID } from "@typing/Mapping";
import type ISimpleChainPathMap from "./ISimpleChainPathMap";

/**
 * The information detailing a given "track". This includes how tall the track is (i.e., how many "subtracks" are
 * within this track), and which ChainPaths are in that track.
 *
 * Each track contains only paths that can be placed horizontally of each other without overlapping. This would suggest
 * that the height should be 1, but each path can overlap with itself, and so might need to be layered vertically in
 * order to fit. This layering creates "subtracks" within the track itself, which is why the "height" of the track
 * isn't always 1. The ChainPath requiring the most layers/subtracks determines the "height" of the track, because
 * that is the smallest amount of subtracks necessary to make sure every included ChainPath can fit.
 *
 * This height matters, because it is the vertical distance a connecting line will have to travel should it go over that
 * track, and we want to keep this number as low as possible.
 */
export interface TrackDetails {
  height: number;
  paths: ResourceID[];
}

export default interface IStressTracker {
  /**
   * The matrix only understands integers for its column and row indexes. So we need to track the order of all the paths
   * according to their sorted ID order. The index of their ID in this list represents the index of their column and row
   * in the matrix.
   */
  readonly pathMatrixKeys: string[];
  pathMap: ISimpleChainPathMap;
  /**
   * @param pathId
   * @returns The index in matrices that correspond with the row and column index of the path associated with the id.
   */
  getPathIdForMatrixIndex(index: number): ResourceID;
  /**
   * @param pathId
   * @returns The index in matrices that correspond with the row and column index of the path associated with the id.
   */
  getMatrixIndexForPathId(pathId: string): number;
  /**
   * Swap the paths and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  swapPathsById(pathId: ResourceID, otherPathId: ResourceID): void;
  /**
   * Converge the paths, bringing them together at the middle point between them, and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  convergePathsById(pathId: ResourceID, otherPathId: ResourceID): void;
  /**
   * Move the path below the other path and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  movePathBelowPathById(pathId: ResourceID, otherPathId: ResourceID): void;
  /**
   * Move the path above all other paths and update all the stress values.
   *
   * @param pathId
   */
  movePathToTopById(pathId: ResourceID): void;
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
  ): IMatrix;
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
  ): IMatrix;
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
  ): IMatrix;
  /**
   * Get the updated relative positions matrix after moving one path above another.
   *
   * @param pathId the ID of the path that is moving
   * @param otherPathId the ID of the path that the moving path is moving above
   * @returns a matrix showing the relative positions of all paths after moving the path above the other path
   */
  getUpdatedRelativePositionsMatrixFromMovingPathToTopById(
    pathId: ResourceID
  ): IMatrix;
  /**
   *
   * @returns The total distance of all connections of all paths with the current positioning
   */
  getCurrentTotalDistanceOfPaths(): number;
  /**
   * Given the positions and the current track details, get the cumulative distance each path would have to travel to
   * reach each of its connected paths.
   *
   * @param positions the positions of the paths
   * @returns the cumulative distance each path would have to travel to reach each of its connected paths
   */
  getTotalDistanceOfPathsWithPositions(positions: IMatrix): number;
  /**
   *
   * @returns the path IDs sorted from top to bottom according to their positions.
   */
  getRankings(): ResourceID[];
  /**
   *
   * @returns the track details according to the current positioning of the paths
   */
  getCurrentTracks(): TrackDetails[];
  /**
   * Get the track details if the paths were positioned according to the passed positions matrix.
   *
   * @param positions the positions of each path
   * @returns the track details
   */
  getTracksWithPositions(positions: IMatrix): TrackDetails[];
}
