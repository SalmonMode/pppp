import { assertIsObject } from "../typePredicates";
import { InterconnectionStrengthMapping } from "../types";
import { Matrix } from "../Utility";
import ChainPath from "./ChainPath";

export default class StressTracker {
  /**
   * A matrix that will track the above/below position of every path relative to every other path. If it is above a
   * path, it will have a 1. If below, a -1. For itself, it will always have a 0. This is useful for calculating the
   * stress on any given path in any given position relative to others when multiplied by a matrix containing the
   * number of connections between each path, ordered in the same way. As paths are swapped with each other to find the
   * optimal order, this matrix will be modified.
   */
  positioningMatrix: Matrix;
  /**
   * A matrix showing how many connections each path has to every other path. Useful when combined with the positioning
   * matrix through multiplication.
   */
  private _connectionMatrix: Matrix;
  /**
   * The current stress levels for each path given the current arrangement of path positions relative to each other.
   *
   * Conveniently, each number in each row for a given path represents what the stress for a given path would be if
   * swapped with the path of the corresponding. For example:
   *
   * ```text
   *       A   B   C   D
   *    ┏                 ┓
   *  A ┃  5   4   2   6  ┃
   *  B ┃  2   1   0   2  ┃
   *  C ┃ -3  -7  -4  -4  ┃
   *  D ┃ -1  -3  -2  -2  ┃
   *    ┗                 ┛
   * ```
   *
   * The diagonal represents each path's current stress (this is what it's stress would be after swapping with itself).
   *
   * The A row, for example, shows what stress levels A could be if swapped with the path of the corresponding column.
   * If A were swapped with B, then A would have a stress of 2, and we can see in B's row that B would have a stress of
   * 4 if it swapped with A.
   *
   * This of course tells us nothing about the stress levels of the other paths after such a swap, so we could only
   * assume there'd be no other changes along the diagonal if the swapped paths were neighboring each other. It's safe
   * if they're neighboring because the relative positions of all other paths to every other path remains the same. If
   * we swapped A and B, and they were neighbors, C and D would still be above or below them after the swap.
   *
   * This is useful for finding potential ways to swap
   */
  private _stressMatrix: Matrix;
  /**
   * The matrix only understands integers for its column and row indexes. So we need to track the order of all the paths
   * according to their sorted ID order. The index of their ID in this list represents the index of their column and row
   * in the matrix.
   */
  readonly pathMatrixKeys: string[];
  constructor(
    public readonly connectionStrengthMapping: InterconnectionStrengthMapping
  ) {
    this.pathMatrixKeys = this._getPathMatrixKeys();
    this.positioningMatrix = this._buildPositioningMatrix();
    this._connectionMatrix = this._buildConnectionMatrix();
    this._stressMatrix = this.getStressMatrixUsingPositions(
      this.positioningMatrix
    );
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
    return Object.keys(this.connectionStrengthMapping).sort();
  }
  /**
   *
   * @returns a matrix showing the initial positions of each path relative to each other.
   */
  private _buildPositioningMatrix(): Matrix {
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
   *
   * @returns a matrix showing the number of connections between each path.
   */
  private _buildConnectionMatrix(): Matrix {
    const matrixData: number[][] = [];
    // Each row can be filled with 0s to the appropriate size, and then updated based on the connections found in the
    // strength mapping.
    for (let id of this.pathMatrixKeys) {
      const newRow = Array(this.pathMatrixKeys.length).fill(0);
      const strengthMapping = this.connectionStrengthMapping[id];
      assertIsObject(strengthMapping);
      for (let [key, strength] of Object.entries(strengthMapping)) {
        const index = this.getMatrixIndexForPathId(key);
        newRow[index] = strength;
      }
      matrixData.push(newRow);
    }
    return new Matrix(matrixData);
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
   * @param path
   * @param otherPath
   */
  swapPositionsOfPaths(path: ChainPath, otherPath: ChainPath) {
    return this.swapPositionsOfPathsById(path.id, otherPath.id);
  }
  /**
   * Swap the paths and update all the stress values.
   *
   * @param pathId
   * @param otherPathId
   */
  swapPositionsOfPathsById(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): void {
    this.positioningMatrix =
      this.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
        pathId,
        otherPathId
      );
    this._stressMatrix = this.getStressMatrixUsingPositions(
      this.positioningMatrix
    );
  }
  /**
   * Get the updated relative positions matrix after swapping the positions of two paths.
   *
   * For details on how this is implemented, see {@link getAdjustmentMatrixBasedOnDifferenceBetweenPaths}.
   *
   * @param path one of the paths that is switching its position
   * @param otherPath the other path that is switching its position with the first path
   * @returns a matrix showing the relative positions of all paths after swapping the positions of two paths
   */
  getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPaths(
    path: ChainPath,
    otherPath: ChainPath
  ): Matrix {
    return this.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
      path.id,
      otherPath.id
    );
  }
  /**
   * Get the updated relative positions matrix after swapping the positions of two paths.
   *
   * For details on how this is implemented, see {@link getAdjustmentMatrixBasedOnDifferenceBetweenPaths}.
   *
   * @param pathId one of the paths that is switching its position
   * @param otherPathId the other path that is switching its position with the first path
   * @returns a matrix showing the relative positions of all paths after swapping the positions of two paths
   */
  getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): Matrix {
    const diff = this.getDifferenceBetweenPathsById(pathId, otherPathId);

    const adjustmentMatrix =
      this.getAdjustmentMatrixBasedOnDifferenceBetweenPaths(diff);

    // Produce a new matrix containing the updated relative positions.
    const updatedPositionData: number[][] = [];
    for (let i = 0; i < diff.length; i++) {
      const oldRow = this.positioningMatrix.getRow(i);
      if (!!diff[i]) {
        // this row is affected so update it.
        const updatedRow = new Matrix([oldRow])
          .multiply(adjustmentMatrix)
          .getRow(0);
        updatedPositionData.push(updatedRow);
      } else {
        updatedPositionData.push(oldRow);
      }
    }
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
   * A and C's position relative to it, and we need to update it's relative position to A and C. This will be taken care
   * of during multiplication at a later step using a new matrix produced using this array (see
   * {@link StressTracker.getAdjustmentMatrixBasedOnDifferenceBetweenPaths}).
   *
   * @param pathId The first path's ID
   * @param otherPathId the second path's ID
   * @returns an array indicating which relative positions need to be updated
   */
  getDifferenceBetweenPathsById(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): number[] {
    const pathIndex = this.getMatrixIndexForPathId(pathId);
    const otherPathIndex = this.getMatrixIndexForPathId(otherPathId);
    // Find out what else will need to change after this swap
    const pathRow = this.positioningMatrix.getRow(pathIndex);
    const otherPathRow = this.positioningMatrix.getRow(otherPathIndex);
    // Wherever there is a difference is where updates need to occur.
    const diff = new Matrix([pathRow])
      .subtract(new Matrix([otherPathRow]))
      .getRow(0);
    return diff;
  }
  /**
   * A matrix each row in the current positioning matrix can be multiplied by individually to get the row's
   * corresponding path's position relative to all other units after two units would be swapped.
   *
   * For example, if there are paths A, B, C, and D, with their positions in that order, and their IDs in the same
   * order, the matrix would look something like this:
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
   * From this, we can produce a diagonal matrix with a 1 for every path that doesn't need to have its relative position
   * updated, and a -1 for those that do. In the example from above, that matrix would look like this:
   *
   * ```text
   *       A  B  C  D
   *    ┏             ┓
   *  A ┃ -1  0  0  0 ┃
   *  B ┃  0 -1  0  0 ┃
   *  C ┃  0  0 -1  0 ┃
   *  D ┃  0  0  0  1 ┃
   *    ┗             ┛
   * ```
   *
   * If we were to multiply the entire position matrix by this in one go, things would get quite messy, because even
   * though A is being moved, it's position relative to D is the same. But if were to multiply by -1 for it's position
   * relative to A, it would be swapped, which we don't want. To combat this, we would only multiply the impacted rows
   * by this matrix, and stitch everything back together. In this case, we multiply the rows for A, B, and C
   * respectively, but use D's original row because it doesn't need to be updated at all.
   *
   * When we actually do the multiplication for any given (impacted) row, we can see how that plays out. For example,
   * with A, we'd do the following:
   *
   * ```text
   *                            A  B  C  D
   *       A  B  C  D        ┏             ┓
   *    ┏             ┓    A ┃ -1  0  0  0 ┃
   *  A ┃  0  1  1  1 ┃ X  B ┃  0 -1  0  0 ┃
   *    ┗             ┛    C ┃  0  0 -1  0 ┃
   *                       D ┃  0  0  0  1 ┃
   *                         ┗             ┛
   * ```
   *
   * The first step is to get A's relative position to itself. So we multiply the first row of the left matrix by the
   * first column of the right matrix. That gives us this:
   *
   * ```text
   *    0     1     1     1
   *       +     +     +
   *  x-1    x0    x0    x0
   * ______________________
   *    0  +  0  +  0  +  0
   * ```
   *
   * and as a result, we have this:
   *
   *       A  B  C  D
   *    ┏             ┓
   *   A┃  0  ?  ?  ? ┃
   *    ┗             ┛
   * ```
   *
   * Which is perfect, because each path has a 0 for itself (since it's neither above nor below itself).
   *
   * Then we do the next column to get A's position relative to B:
   *
   * ```text
   *    0      1     1     1
   *       +      +     +
   *   x0    x-1    x0    x0
   * ______________________
   *    0  +  -1  +  0  +  0
   * ```
   *
   * and as a result, we have this:
   *
   * ```text
   *       A   B   C   D
   *    ┏                 ┓
   *   A┃  0  -1   ?   ?  ┃
   *    ┗                 ┛
   * ```
   *
   * This works out because we're multiplying by -1 to get the *opposite* position of whatever A had before. We know to
   * do this, because it was one of the impacted relative positions. A now properly shows itself as being below B.
   *
   * Then we do the same thing for the C column to get:
   *
   * ```text
   *       A   B    C   D
   *    ┏                  ┓
   *   A┃  0  -1   -1   ?  ┃
   *    ┗                  ┛
   * ```
   *
   * And now for D:
   *
   * ```text
   *    0     1     1     1
   *       +     +     +
   *   x0    x0    x0    x1
   * ______________________
   *    0  +  0  +  0  +  1
   * ```
   *
   * Giving us this:
   *
   * ```text
   *       A   B    C   D
   *    ┏                  ┓
   *   A┃  0  -1   -1   1  ┃
   *    ┗                  ┛
   * ```
   *
   * This works out because we're multiplying by 1, so we get the same exact value, and A still shows itself as being
   * above D.
   *
   * The same thing happens for the B row, and even though B wasn't moving, the matrix we multiply by ensures that only
   * its relative position to A and C are impacted. Doing the same operations, we'd end up with this:
   *
   * ```text
   *       A   B    C   D
   *    ┏                  ┓
   *   B┃  1   0   -1   1  ┃
   *    ┗                  ┛
   * ```
   *
   * @param diff the paths that have their relative positions effected.
   * @returns a matrix to multiply impacted rows by to get updated relative positions.
   */
  getAdjustmentMatrixBasedOnDifferenceBetweenPaths(diff: number[]): Matrix {
    const adjustmentMatrixData: number[][] = [];
    // Find the spots where there are diffs.
    for (let i = 0; i < diff.length; i++) {
      const row = new Array(diff.length);
      row.fill(0);
      // Put a 1 wherever there was no diff to preserve the values, and a -1 where there was to flip things.
      // This will produce a matrix with all 0s except for 1s and -1s along the diagonal.
      row[i] = !!diff[i] ? -1 : 1;
      adjustmentMatrixData.push(row);
    }
    // The affected rows can be multiplied by this to produce their updated values
    return new Matrix(adjustmentMatrixData);
  }
  /**
   * Given a particular arrangement of paths, return a matrix showing how much stress and in which directions each path
   * would be under.
   *
   * Since each path is already positioned somewhere, this will help us consider what it would be like if any other path
   * were in the position of the path we're looking at. In other words, we're considering what it would be like for each
   * path to swap positions with the path positioned here. As a result, where the 0 is will need to be swapped with the
   * inverse of the position the other path has for it. For example, if A swapped with C, C's 0 might be at index 2,
   * while A's is at 0. But if A already has a -1 in its index 2 (where C is, indicating A is below C), and C has a 1 in
   * its index 0 (indicating it's above A), then in order to consider what it would be like for A to be swapped with C,
   * A could use C's position array and simply swap the numbers in the 0th and 2nd index.
   *
   * We can get away with this implementation, because we aren't concerned about the stress of the other paths for the
   * purposes of this.
   *
   * @param positionsMatrix the positions of all paths relative to each other
   * @returns a matrix showing the relative stress vectors of each path
   */
  getStressMatrixUsingPositions(positionsMatrix: Matrix): Matrix {
    const stressData: number[][] = [];
    for (
      let pathIndex = 0;
      pathIndex < this.pathMatrixKeys.length;
      pathIndex++
    ) {
      // generate possible positions matrix for this path by using the position rows of each path. It only needs to swap
      // the value that's at the pathIndex with wherever the zero is in this row to get the right position row.
      const positionsData: number[][] = [];
      for (let positionsRow of positionsMatrix.data) {
        // find where the zero is in this positionsMatrix row
        const zeroIndex = positionsRow.indexOf(0);
        // make a copy because we'll be modifying it
        const swappedPositionsRow = [...positionsRow];
        if (zeroIndex !== pathIndex) {
          // Swap the zero and relative position.
          swappedPositionsRow.splice(
            zeroIndex,
            1,
            ...swappedPositionsRow.slice(pathIndex, pathIndex + 1)
          );
          swappedPositionsRow[pathIndex] = 0;
        } else {
          // no need to do this for the current path, as we'd just be replacing 0 with 0 twice.
        }
        positionsData.push(swappedPositionsRow);
      }
      // Must be transposed to produce a clean row when multiplied by this path's connections row for the final matrix.
      const possiblePositionsOfPathMatrix = new Matrix(
        positionsData
      ).transpose();
      const connStrengthMatrixForPath = new Matrix([
        this._connectionMatrix.getRow(pathIndex),
      ]);
      const possibleStressMatrix = connStrengthMatrixForPath.multiply(
        possiblePositionsOfPathMatrix
      );
      // Grab the only row from the resulting matrix.
      stressData.push(possibleStressMatrix.getRow(0));
    }
    return new Matrix(stressData);
  }
  /**
   * Get the stress of the provided path according to the provided stress path.
   *
   * @param path the path to get the stress of
   * @param stressMatrix the stress matrix to pull the stress information from
   * @returns the stress of the path according to the provided stress matrix
   */
  getStressOfPathWithStressMatrix(
    path: ChainPath,
    stressMatrix: Matrix
  ): number {
    return this.getStressOfPathWithStressMatrixById(path.id, stressMatrix);
  }
  /**
   * Get the stress of the provided path according to the provided stress path.
   *
   * @param path the path to get the stress of
   * @param stressMatrix the stress matrix to pull the stress information from
   * @returns the stress of the path according to the provided stress matrix
   */
  getStressOfPathWithStressMatrixById(
    pathId: ChainPath["id"],
    stressMatrix: Matrix
  ): number {
    const matrixIndex = this.getMatrixIndexForPathId(pathId);
    return stressMatrix.getElementAtPosition(matrixIndex, matrixIndex);
  }
  /**
   * Get the stress of the provided path according to the current arrangement of the paths.
   *
   * The arrangment of the paths is tracked to have a singular "current reality" to compare against when sorting, and to
   * reference after sorting. Because the stress of this state will need to be referenced a lot, the value is cached
   * both when instantiating the StressTracker, and whenever committing to swapping the positions of two paths. This way
   * it's calculated fewer times.
   *
   * @param path the path to get the current stress of
   * @returns the stress of the path according to the current arrangement of paths
   */
  getCurrentStressOfPath(path: ChainPath): number {
    return this.getCurrentStressOfPathById(path.id);
  }
  /**
   * Get the stress of the provided path according to the current arrangement of the paths.
   *
   * The arrangment of the paths is tracked to have a singular "current reality" to compare against when sorting, and to
   * reference after sorting. Because the stress of this state will need to be referenced a lot, the value is cached
   * both when instantiating the StressTracker, and whenever committing to swapping the positions of two paths. This way
   * it's calculated fewer times.
   *
   * @param pathId the ID of the path to get the current stress of
   * @returns the stress of the path according to the current arrangement of paths
   */
  getCurrentStressOfPathById(pathId: ChainPath["id"]): number {
    return this.getStressOfPathWithStressMatrixById(pathId, this._stressMatrix);
  }
  /**
   * Get the stress of the first path passed if it were to be swapped with the second path passed.
   *
   * @param path
   * @param otherPath
   * @returns the theoretical stress of the path argument if it were to be swapped with the otherPath argument
   */
  getStressOfPathIfSwappedWithPath(
    path: ChainPath,
    otherPath: ChainPath
  ): number {
    return this.getStressOfPathIfSwappedWithPathById(path.id, otherPath.id);
  }
  /**
   * Get the stress of the first path passed if it were to be swapped with the second path passed.
   *
   * @param pathId
   * @param otherPathId
   * @returns the theoretical stress of the path argument if it were to be swapped with the otherPath argument
   */
  getStressOfPathIfSwappedWithPathById(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): number {
    const pathIndex = this.getMatrixIndexForPathId(pathId);
    const otherPathIndex = this.getMatrixIndexForPathId(otherPathId);
    return this._stressMatrix.getElementAtPosition(pathIndex, otherPathIndex);
  }
  /**
   * Get the stress levels of each path given the provided positioning.
   *
   * @param positionsMatrix the positions to get the stress levels for
   * @returns an array containing the stress levels for each path in the order according to the pathMatrixKeys
   */
  getStressOfPathsGivenPositionsMatrix(positionsMatrix: Matrix): number[] {
    const stressLevels: number[] = [];
    for (
      let pathIndex = 0;
      pathIndex < this.pathMatrixKeys.length;
      pathIndex++
    ) {
      const connRow = this._connectionMatrix.getRow(pathIndex);
      const connMatForPath = new Matrix([connRow]).transpose();
      const positionRow = positionsMatrix.getRow(pathIndex);
      const positionMatrix = new Matrix([positionRow]);
      stressLevels.push(
        positionMatrix.multiply(connMatForPath).getElementAtPosition(0, 0)
      );
    }
    return stressLevels;
  }
  /**
   * Get the stress levels of each path given the current positioning.
   *
   * @param positionsMatrix the positions to get the stress levels for
   * @returns an array containing the stress levels for each path in the order according to the pathMatrixKeys
   */
  getCurrentStressOfPaths(): number[] {
    return this.getStressOfPathsGivenPositionsMatrix(this.positioningMatrix);
  }
  /**
   * Get the stress levels of each path given the positioning after the swap between the provided paths is reflected.
   *
   * @param positionsMatrix the positions to get the stress levels for
   * @returns an array containing the stress levels for each path in the order according to the pathMatrixKeys
   */
  getStressOfPathsIfPathSwappedWithPathById(
    pathId: ChainPath["id"],
    otherPathId: ChainPath["id"]
  ): number[] {
    const posMatrix =
      this.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPathsById(
        pathId,
        otherPathId
      );
    return this.getStressOfPathsGivenPositionsMatrix(posMatrix);
  }
}