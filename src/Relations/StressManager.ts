import { assertIsNumber, assertIsString } from "../typePredicates";
import { RelationshipMapping } from "../types";
import ChainPath from "./ChainPath";
import StressTracker from "./StressTracker";

enum MoveType {
  Swap,
  Below,
  Top,
}

interface MoveDetails<T extends MoveType> {
  type: T;
  totalImbalance: number;
  pathA: ChainPath["id"];
  pathB: T extends MoveType.Top ? undefined : ChainPath["id"];
}

// type RelativeMoveDetails = Required<MoveDetails>;

export default class StressManager {
  constructor(public stressTracker: StressTracker) {
    this.getRankings().forEach((a) => console.log(a));
    this._organizePathsByStress();
  }
  /**
   * Organize the paths by trying to find the lowest total imbalance we can.
   */
  private _organizePathsByStress() {
    let canStillMove = true;
    while (canStillMove) {
      // first find biggest delta
      // track the contenderfor most viable move
      let chosenMove:
        | undefined
        | MoveDetails<MoveType.Below>
        | MoveDetails<MoveType.Swap>
        | MoveDetails<MoveType.Top>;
      const currentStressLevels = this.stressTracker.getCurrentStressOfPaths();
      const currentStressImbalance =
        this._calculateTotalImbalanceOfStressLevels(currentStressLevels);
      for (let pathId of this.stressTracker.pathMatrixKeys) {
        for (let otherPathId of this.stressTracker.pathMatrixKeys) {
          let moveType: MoveType;
          let totalImbalance: number;
          if (pathId === otherPathId) {
            // Consider moving the path to the top. We figure out the move to the top individually because moving below
            // will not consider this scenario for any path (other than the top most path moving below itself).
            totalImbalance = this._getTotalImbalanceFromShiftToTop(pathId);
            moveType = MoveType.Top;
          } else {
            // Check for the move where we move this path below the other
            const totalImbalanceFromBelow =
              this._getTotalImbalanceFromMovingBelow(pathId, otherPathId);
            // Check for the move where we swap this path with the other
            const totalImbalanceFromSwap = this._getTotalImbalanceFromSwap(
              pathId,
              otherPathId
            );
            if (totalImbalanceFromSwap < totalImbalanceFromBelow) {
              moveType = MoveType.Swap;
              totalImbalance = totalImbalanceFromSwap;
            } else {
              moveType = MoveType.Below;
              totalImbalance = totalImbalanceFromBelow;
            }
          }
          if (
            this._isBestMoveSoFar(
              currentStressImbalance,
              totalImbalance,
              chosenMove?.totalImbalance
            )
          ) {
            // This move is better, so track it for later
            if (moveType === MoveType.Top) {
              chosenMove = {
                type: moveType,
                totalImbalance,
                pathA: pathId,
                pathB: undefined,
              };
            } else {
              chosenMove = {
                type: moveType,
                totalImbalance,
                pathA: pathId,
                pathB: otherPathId,
              };
            }
          }
        }
      }
      // Should either have chosen move, or there's no obvious moves left and we can move on to the next phase.
      if (chosenMove) {
        // We found a viable move!
        switch (chosenMove.type) {
          case MoveType.Below:
            this.stressTracker.movePathBelowPathById(
              chosenMove.pathA,
              chosenMove.pathB
            );
            break;
          case MoveType.Swap:
            this.stressTracker.swapPositionsOfPathsById(
              chosenMove.pathA,
              chosenMove.pathB
            );
            break;
          case MoveType.Top:
            this.stressTracker.movePathToTopById(chosenMove.pathA);
            break;
        }
        // Reset so we don't make the same move more than once
        chosenMove = undefined;
      } else {
        // No moves left
        canStillMove = false;
      }
    }
  }
  /**
   *
   * @param stressLevels the stress levels of each path
   * @returns the sum of the absolute value of each stress level
   */
  private _calculateTotalImbalanceOfStressLevels(
    stressLevels: number[]
  ): number {
    return stressLevels.reduce((acc, curr) => acc + Math.abs(curr), 0);
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the total (absolute) imbalance of all paths if the path was swapped with the other path
   */
  private _getTotalImbalanceFromSwap(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): number {
    const possibleStressLevels =
      this.stressTracker.getStressOfPathsIfPathSwappedWithPathById(
        pathId,
        otherPathId
      );
    const totalImbalance =
      this._calculateTotalImbalanceOfStressLevels(possibleStressLevels);
    return totalImbalance;
  }
  /**
   *
   * @param pathId
   * @returns the total (absolute) imbalance of all paths if the path was moved to the top
   */
  private _getTotalImbalanceFromShiftToTop(pathId: ChainPath["id"]): number {
    const possibleStressLevels =
      this.stressTracker.getStressOfPathsIfPathMovedToTopById(pathId);
    const totalImbalance =
      this._calculateTotalImbalanceOfStressLevels(possibleStressLevels);
    return totalImbalance;
  }
  /**
   *
   * @param pathId
   * @param otherPathId
   * @returns the total (absolute) imbalance of all paths if the path was moved below the other path
   */
  private _getTotalImbalanceFromMovingBelow(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): number {
    const possibleStressLevels =
      this.stressTracker.getStressOfPathsIfPathMovedBelowPathById(
        pathId,
        otherPathId
      );
    const totalImbalance =
      this._calculateTotalImbalanceOfStressLevels(possibleStressLevels);
    return totalImbalance;
  }
  /**
   *
   * @param currentStressImbalance how imbalanced the stress currently is
   * @param possibleStressImbalance how imbalanced it could be
   * @param previousBestStressImbalance how imbalanced the best most we found so far was
   * @returns true, if the move is better, false, if not
   */
  private _isBestMoveSoFar(
    currentStressImbalance: number,
    possibleStressImbalance: number,
    previousBestStressImbalance?: number
  ): boolean {
    if (previousBestStressImbalance) {
      // Have something to compare it against
      if (possibleStressImbalance < previousBestStressImbalance) {
        // This move is better, so return true
        return true;
      }
    } else {
      // Nothing was set yet, so let's consider the first move.
      if (possibleStressImbalance < currentStressImbalance) {
        // This is better than the current layout, so return true
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
  getRankings(): ChainPath["id"][] {
    const rankings: RelationshipMapping = {};
    for (let id of this.stressTracker.pathMatrixKeys) {
      const matrixIndex = this.stressTracker.getMatrixIndexForPathId(id);
      const positionRow =
        this.stressTracker.positioningMatrix.getRow(matrixIndex);
      const rank = positionRow.reduce((acc, curr) => acc + curr, 0);
      rankings[id] = rank;
    }
    const rankedIds = [...this.stressTracker.pathMatrixKeys];
    rankedIds.sort((a, b) => {
      const rankA = rankings[a];
      assertIsNumber(rankA);
      const rankB = rankings[b];
      assertIsNumber(rankB);
      return rankB - rankA;
    });
    return rankedIds;
  }
}
