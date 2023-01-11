import { NoMoreSortingOptionsError } from "../Error";
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

type NextMove =
  | MoveDetails<MoveType.Below>
  | MoveDetails<MoveType.Swap>
  | MoveDetails<MoveType.Top>;

export default class StressManager {
  constructor(public stressTracker: StressTracker) {
    this._organizePathsByStress();
    this._scoochCloser();
  }
  /**
   * Get the sum of the absolute values of each path's current stress levels.
   *
   * Each path is pulled upwards and downwards by its connections to the other paths. Their current stress levels
   * indicate both the imbalance of their stress, and the direction they are most pulled. You can think of it like the
   * net force being applied to the chain. For example, if a path is pulled up by 4 connections, and down by 1, it's
   * stress would be -3.
   *
   * Simply adding all the numbers together could result in a relatively small value, which might suggest it is well
   * balanced. This may be true if only considering upper most and lower most paths. But if we consider the paths in
   * between, they may be more imbalanced than is necessary. Using the absolute values helps us figure out if our
   * sorting efforts are helping or hurting.
   */
  getCurrentImbalanceOfStressLevels(): number {
    const currentStressLevels = this.stressTracker.getCurrentStressOfPaths();
    const currentStressImbalance =
      this._calculateTotalImbalanceOfStressLevels(currentStressLevels);
    return currentStressImbalance;
  }
  /**
   * Organize the paths by trying to find the lowest total imbalance we can.
   */
  private _organizePathsByStress() {
    try {
      while (true) {
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
   * imbalance the most.
   *
   * @throws {@link NoMoreSortingOptionsError} when there are no more sorting moves that reduce the total imbalance.
   *
   * @returns the details for the next best move
   */
  private _getNextBestMove(): NextMove {
    let chosenMove: undefined | NextMove;
    const currentStressImbalance = this.getCurrentImbalanceOfStressLevels();
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
    if (!chosenMove) {
      throw new NoMoreSortingOptionsError(
        "All possible moves have been exhausted."
      );
    }
    return chosenMove;
  }
  /**
   * Organize the paths by scooching them past each other depending on the vector of each path's imbalance, so long as
   * it doesn't impact imbalance. Some paths may be positioned a bit further away than they need to. This will bring
   * them closer together.
   *
   * If these moves could impact balance, it could only be negatively, as positive moves of that kind would've been
   * found by _organizePathsByStress.
   */
  private _scoochCloser() {
    try {
      while (true) {
        const chosenMove = this._getNextScoochMove();
        this.stressTracker.swapPathsById(chosenMove.pathA, chosenMove.pathB);
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
   * Find the next move we can make to scooch paths closer to where they're connected without impacting imbalance.
   *
   * @throws {@link NoMoreSortingOptionsError} when there are no more sorting moves without impacting imbalance.
   *
   * @returns the details for the next scooch move
   */
  private _getNextScoochMove(): MoveDetails<MoveType.Swap> {
    let chosenMove: undefined | MoveDetails<MoveType.Swap>;
    const rankings = this.getRankings();
    rankings.forEach((pathId, index) => {
      const nextPathId = rankings[index + 1];
      if (nextPathId === undefined) {
        // reached bottom, so nothing left to do
        return;
      }
      const pathStress = this.stressTracker.getCurrentStressOfPathById(pathId);
      const nextPathStress =
        this.stressTracker.getCurrentStressOfPathById(nextPathId);
      if (pathStress > nextPathStress) {
        // path is being pulled down more than next path, so a switch here may be appropriate. Let's check that it
        // wouldn't impact imbalance.
        const stressLevelsIfSwapped =
          this.stressTracker.getStressOfPathsIfPathSwappedWithPathById(
            pathId,
            nextPathId
          );
        const pathStressIfSwapped =
          stressLevelsIfSwapped[
            this.stressTracker.getMatrixIndexForPathId(pathId)
          ];
        if (pathStressIfSwapped === pathStress) {
          // Move is safe. The only way it could remain the same is if the two paths aren't connected.
          const totalImbalanceFromSwap =
            this._calculateTotalImbalanceOfStressLevels(stressLevelsIfSwapped);
          chosenMove = {
            type: MoveType.Swap,
            totalImbalance: totalImbalanceFromSwap,
            pathA: pathId,
            pathB: nextPathId,
          };
        }
        // Move would impact imbalance, so it is unsafe
      }
      // Path has no reason to move down
    });
    if (!chosenMove) {
      throw new NoMoreSortingOptionsError(
        "All possible moves have been exhausted."
      );
    }
    return chosenMove;
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
