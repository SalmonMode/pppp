import { NoMoreSortingOptionsError } from "@errors";
import type { ResourceID } from "@typing/Mapping";
import type IStressManager from "@typing/Relations/IStressManager";
import { MoveType, NextMove } from "@typing/Relations/IStressManager";
import type IStressTracker from "@typing/Relations/IStressTracker";

export default class StressManager implements IStressManager {
  constructor(public stressTracker: IStressTracker) {
    this._organizePathsByStress();
  }
  /**
   * Organize the paths by trying to find the lowest total distance and fewest tracks we can.
   */
  private _organizePathsByStress(): void {
    try {
      for (;;) {
        const chosenMove = this._getNextBestMove();
        // We found a viable move!
        switch (chosenMove.type) {
          case MoveType.Below:
            this.stressTracker.movePathBelowPathById(
              chosenMove.pathA,
              chosenMove.pathB
            );
            break;
          case MoveType.Swap:
            this.stressTracker.swapPathsById(
              chosenMove.pathA,
              chosenMove.pathB
            );
            break;
          case MoveType.Converge:
            this.stressTracker.convergePathsById(
              chosenMove.pathA,
              chosenMove.pathB
            );
            break;
          case MoveType.Top:
            this.stressTracker.movePathToTopById(chosenMove.pathA);
            break;
        }
      }
    } catch (err) {
      if (err instanceof NoMoreSortingOptionsError) {
        // All done here so we can move on.
        return;
      }
      // Something unexpected happened.
      throw err;
    }
  }
  /**
   * Consider the current positioning of the paths relative to each other, and find the next move that reduces the total
   * distance and tracks the most.
   *
   * @throws {@link NoMoreSortingOptionsError} when there are no more sorting moves that reduce the distance/tracks.
   *
   * @returns the details for the next best move
   */
  private _getNextBestMove(): NextMove {
    const currentTotalDistance =
      this.stressTracker.getCurrentTotalDistanceOfPaths();
    const currentTracks = this.stressTracker.getCurrentTracks().length;
    let chosenMove: NextMove = {
      type: MoveType.Stay,
      pathA: undefined,
      pathB: undefined,
      totalDistance: currentTotalDistance,
      totalTracks: currentTracks,
    };
    for (const pathId of this.stressTracker.pathMatrixKeys) {
      for (const otherPathId of this.stressTracker.pathMatrixKeys) {
        let possibleMove: NextMove;
        if (pathId === otherPathId) {
          // Consider moving the path to the top. We figure out the move to the top individually because moving below
          // will not consider this scenario for any path (other than the top most path moving below itself).
          possibleMove = {
            totalDistance: this._getTotalDistanceFromShiftToTop(pathId),
            totalTracks: this._getNumberOfTracksFromShiftToTop(pathId),
            type: MoveType.Top,
            pathA: pathId,
            pathB: undefined,
          };
          if (this._isBestMoveSoFar(possibleMove, chosenMove)) {
            // This move is better, so track it for later
            chosenMove = possibleMove;
          }
        } else {
          // Check for the move where we move this path below the other
          const totalDistanceFromBelow = this._getTotalDistanceFromMovingBelow(
            pathId,
            otherPathId
          );
          const totalTracksFromBelow = this._getNumberOfTracksFromMovingBelow(
            pathId,
            otherPathId
          );
          const possibleBelowMove: NextMove = {
            totalDistance: totalDistanceFromBelow,
            totalTracks: totalTracksFromBelow,
            type: MoveType.Below,
            pathA: pathId,
            pathB: otherPathId,
          };
          if (this._isBestMoveSoFar(possibleBelowMove, chosenMove)) {
            // This move is better, so track it for later
            chosenMove = possibleBelowMove;
          }
          // Check for the move where we swap this path with the other
          const totalDistanceFromSwap = this._getTotalDistanceFromSwap(
            pathId,
            otherPathId
          );
          const totalTracksFromSwap = this._getNumberOfTracksFromSwap(
            pathId,
            otherPathId
          );
          const possibleSwapMove: NextMove = {
            totalDistance: totalDistanceFromSwap,
            totalTracks: totalTracksFromSwap,
            type: MoveType.Swap,
            pathA: pathId,
            pathB: otherPathId,
          };
          if (this._isBestMoveSoFar(possibleSwapMove, chosenMove)) {
            // This move is better, so track it for later
            chosenMove = possibleSwapMove;
          }
          // Check for the move where we these paths are moved right next to each other at the middle point between them
          const totalDistanceFromConverge = this._getTotalDistanceFromConverge(
            pathId,
            otherPathId
          );
          const totalTracksFromConverge = this._getNumberOfTracksFromConverge(
            pathId,
            otherPathId
          );
          const possibleConvergeMove: NextMove = {
            totalDistance: totalDistanceFromConverge,
            totalTracks: totalTracksFromConverge,
            type: MoveType.Converge,
            pathA: pathId,
            pathB: otherPathId,
          };
          if (this._isBestMoveSoFar(possibleConvergeMove, chosenMove)) {
            // This move is better, so track it for later
            chosenMove = possibleConvergeMove;
          }
        }
      }
    }
    if (chosenMove.type === MoveType.Stay) {
      throw new NoMoreSortingOptionsError(
        "All possible moves have been exhausted."
      );
    }
    return chosenMove;
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the total (absolute) distance of all paths if the path was moved below the other.
   */
  private _getTotalDistanceFromSwap(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTotalDistanceOfPathsWithPositions(posMatrix);
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the number of tracks if the path was moved below the other.
   */
  private _getNumberOfTracksFromSwap(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTracksWithPositions(posMatrix).length;
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the total (absolute) distance of all paths if the path moved next to the other path at their middle point
   */
  private _getTotalDistanceFromConverge(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromConvergingPathsById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTotalDistanceOfPathsWithPositions(posMatrix);
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the number of tracks if the the path moved next to the other path at their middle point.
   */
  private _getNumberOfTracksFromConverge(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromConvergingPathsById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTracksWithPositions(posMatrix).length;
  }
  /**
   *
   * @param pathId
   * @returns the total (absolute) distance of all paths if the path was moved to the top
   */
  private _getTotalDistanceFromShiftToTop(pathId: ResourceID): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromMovingPathToTopById(
        pathId
      );
    return this.stressTracker.getTotalDistanceOfPathsWithPositions(posMatrix);
  }
  /**
   *
   * @param pathId
   * @returns the number of tracks if the path was moved to the top
   */
  private _getNumberOfTracksFromShiftToTop(pathId: ResourceID): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromMovingPathToTopById(
        pathId
      );
    return this.stressTracker.getTracksWithPositions(posMatrix).length;
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the total (absolute) distance of all paths if the path was moved below the other.
   */
  private _getTotalDistanceFromMovingBelow(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromMovingPathBelowPathById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTotalDistanceOfPathsWithPositions(posMatrix);
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the number of tracks if the path was moved below the other.
   */
  private _getNumberOfTracksFromMovingBelow(
    pathId: ResourceID,
    otherPathId: ResourceID
  ): number {
    const posMatrix =
      this.stressTracker.getUpdatedRelativePositionsMatrixFromMovingPathBelowPathById(
        pathId,
        otherPathId
      );
    return this.stressTracker.getTracksWithPositions(posMatrix).length;
  }
  /**
   *
   * @param possibleMove the move being considered
   * @param previousBestMove the move we know is best so far
   * @returns true, if the move is better, false, if not
   */
  private _isBestMoveSoFar(
    possibleMove: NextMove,
    previousBestMove: NextMove
  ): boolean {
    if (possibleMove.totalDistance < previousBestMove.totalDistance) {
      // This move is better because it has less total distance, so return true
      return true;
    } else if (possibleMove.totalDistance === previousBestMove.totalDistance) {
      if (possibleMove.totalTracks < previousBestMove.totalTracks) {
        // This move is better because it has the same distance, but fewer tracks, so return true
        return true;
      }
    }
    // Not a better move than either what it currently is, or another move we found.
    return false;
  }
  /**
   *
   * @returns the path IDs sorted from top to bottom according to their positions.
   */
  getRankings(): ResourceID[] {
    return this.stressTracker.getRankings();
  }
}
