import { assertIsNumber, assertIsString } from "../typePredicates";
import { RelationshipMapping } from "../types";
import ChainPath from "./ChainPath";
import StressTracker from "./StressTracker";

interface SwapDetails {
  totalImbalance: number;
  pathA: ChainPath["id"];
  pathB: ChainPath["id"];
}

export default class StressManager {
  constructor(public stressTracker: StressTracker) {
    this._organizePathsByStress();
    this._organizePathsByMovingThemCloserWithoutImpactingImbalance();
  }
  /**
   * Organize the paths by trying to find the lowest total imbalance we can find.
   */
  private _organizePathsByStress() {
    // First pass. Focus on relative balance. Eventually, no moves will remain that have any positive balancing effects.
    // At this point, there may still be neutral moves we can make to help detangle, though. So we can go to the second
    // phase, where we simply move paths past each other (as long as there's no balance impact) to bring paths closer to
    // the paths they're connected to, even if they still have to remain on the side they were on.

    // Find the next, most beneficial move
    let canStillMove = true;
    while (canStillMove) {
      // first find biggest delta
      // track the contenderfor most viable move
      let chosenMove: undefined | SwapDetails;
      const currentStressLevels = this.stressTracker.getCurrentStressOfPaths();
      const currentStressImbalance =
        this._calculateTotalImbalanceOfStressLevels(currentStressLevels);
      for (let pathId of this.stressTracker.pathMatrixKeys) {
        for (let otherPathId of this.stressTracker.pathMatrixKeys) {
          if (pathId === otherPathId) {
            continue;
          }
          const possibleStressLevels =
            this.stressTracker.getStressOfPathsIfPathSwappedWithPathById(
              pathId,
              otherPathId
            );
          const totalImbalance =
            this._calculateTotalImbalanceOfStressLevels(possibleStressLevels);
          if (chosenMove) {
            // Have something to compare it against
            if (totalImbalance < chosenMove.totalImbalance) {
              // This move is better, so track it for later
              chosenMove = {
                totalImbalance,
                pathA: pathId,
                pathB: otherPathId,
              };
            }
          } else {
            // Nothing was set yet, so let's consider the first move.
            if (totalImbalance < currentStressImbalance) {
              // This is better than the current layout, so let's track it for later
              chosenMove = {
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
        this.stressTracker.swapPositionsOfPathsById(
          chosenMove.pathA,
          chosenMove.pathB
        );
      } else {
        // No moves left, so let's go to phase 2
        canStillMove = false;
      }
    }
  }
  /**
   * Organize the paths by moving them closer to the paths they're most attached to, provided it won't impact balancing.
   */
  private _organizePathsByMovingThemCloserWithoutImpactingImbalance() {
    // Phase 2
    // If this finds something it can swap, it will follow it until it can no longer swap it down. If it moves past
    // multiple other paths,we may skip past some that also need to be shifted down, so we may have to iterate over the
    // for loop itself multiple times. Putting it in a while loop helps us make sure we use the for loop as many times
    // as is needed.
    let foundSomethingToSwap = true;
    while (foundSomethingToSwap) {
      foundSomethingToSwap = false;
      for (
        let pathIndex = 0;
        pathIndex < this.stressTracker.pathMatrixKeys.length - 1;
        pathIndex++
      ) {
        // get the effective number for the path's position by totalling the items in its position row. We can then sort
        // from greatest to least.
        const rankedIds = this._getRankings();

        const pathId = rankedIds[pathIndex];
        assertIsString(pathId);
        const otherPathId = rankedIds[pathIndex + 1];
        assertIsString(otherPathId);
        // check if can switch without changing stress levels
        const currentPathStress =
          this.stressTracker.getCurrentStressOfPathById(pathId);
        const newStress =
          this.stressTracker.getStressOfPathIfSwappedWithPathById(
            pathId,
            otherPathId
          );
        if (currentPathStress !== newStress) {
          // would change things, so continue to next iteration
          continue;
        }
        // check if they should be swapped
        const currentOtherPathStress =
          this.stressTracker.getCurrentStressOfPathById(otherPathId);
        if (currentPathStress > currentOtherPathStress) {
          // path is being pulled down more than other path, so swap
          this.stressTracker.swapPositionsOfPathsById(pathId, otherPathId);
          // Track that we found something so we can try going through the loop again
          foundSomethingToSwap = true;
        } else {
          // no benefit from swapping
        }
      }
    }
  }
  private _calculateTotalImbalanceOfStressLevels(
    stressLevels: number[]
  ): number {
    return stressLevels.reduce((acc, curr) => acc + Math.abs(curr), 0);
  }
  private _getRankings(): ChainPath["id"][] {
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
