import { Matrix } from "../Utility";
import TaskUnit from "./TaskUnit";

/**
 * A simple abstraction around a matrix of the unit relations to perform helpful operations.
 */
export default class UnitPathMatrix {
  private _unitsSortedById: TaskUnit[];
  /**
   * A matrix showing the direct dependencies of each unit. This will show where each unit can "step" to in just a
   * single step. This is useful for easily and efficiently identifying which units are usable as heads when other units
   * have been eliminated.
   */
  private _singleStepMatrix: Matrix;
  /**
   * The matrix only understands integers for its column and row indexes. So we need to track the order of all the units
   * according to their sorted ID order. The index of their ID in this list represents the index of their column and row
   * in the matrix.
   */
  private _pathMatrixKeys: string[];
  constructor(units: TaskUnit[]) {
    const firstUnit = units[0];
    if (firstUnit === undefined) {
      throw new RangeError("Must provide at least 1 TaskUnit");
    }
    this._unitsSortedById = this._getAllUnitsSortedById(units);
    this._pathMatrixKeys = this._getPathMatrixKeys();
    this._singleStepMatrix = this._buildSingleStepMatrix();
  }
  /**
   * Take an array of units, and return a new array with the same units sorted alphabetically by their IDs.
   *
   * @param units the units to sort
   * @returns a new array of units sorted according to their IDs
   */
  private _getAllUnitsSortedById(units: TaskUnit[]): TaskUnit[] {
    return [...units].sort((prev, next) => prev.id.localeCompare(next.id));
  }
  /**
   * Get the IDs of the units in alphabetical order.
   *
   * This reflects their sorting order, and their indexes in this array will line up with their respective row and
   * column indexes in the path matrix and single step matrix.
   *
   * @returns The IDs of the units in alphabetical order
   */
  private _getPathMatrixKeys(): string[] {
    return this._unitsSortedById.map((unit) => unit.id).sort();
  }
  /**
   * @param unit
   * @returns The index in the path and single step matrices that correspond with the row and column index of the unit.
   */
  getMatrixIndexForUnit(unit: TaskUnit): number {
    return this._pathMatrixKeys.indexOf(unit.id);
  }
  /**
   * Build a matrix that shows the direct dependencies of each unit. This will show where each unit can "step" to in
   * just a single step. In others words M1.
   */
  private _buildSingleStepMatrix(): Matrix {
    const pathMatrixData: number[][] = [];
    for (let unit of this._unitsSortedById) {
      const rowData: number[] = new Array(this._unitsSortedById.length);
      // fill with 0s by default, since we'll only be replacing the relevant places with 1s.
      rowData.fill(0);
      for (let dep of unit.directDependencies) {
        const depIndex = this.getMatrixIndexForUnit(dep);
        rowData[depIndex] = 1;
      }
      pathMatrixData.push(rowData);
    }
    return new Matrix(pathMatrixData);
  }
  /**
   * Build a matrix showing which units every unit can reach in a single step. This is useful for very easily and
   * efficiently identifying which units are heads when other units have been eliminated.
   *
   * @param sortedUnits
   * @returns a matrix showing which units each unit can reach in a single step (i.e. their direct dependencies)
   */
  private _buildSubsetSingleStepMatrix(sortedUnits: TaskUnit[]): Matrix {
    // get slice of single step for relevant units
    const matrixData: number[][] = [];
    const sliceIndexes = sortedUnits.map((unit) =>
      this.getMatrixIndexForUnit(unit)
    );
    for (let row of sliceIndexes) {
      const rowData: number[] = [];
      for (let column of sliceIndexes) {
        rowData.push(this._singleStepMatrix.getElementAtPosition(row, column));
      }
      matrixData.push(rowData);
    }
    return new Matrix(matrixData);
  }
  /**
   * Get the current available head units, after adjusting for any units that may have already been used.
   *
   * @param isolatedUnits the units that have already been isolated, and thus can't be heads
   * @returns a list of the head units that no other units can reach without using any isolated units
   */
  getHeadUnitsWithoutIsolatedUnit(isolatedUnits: TaskUnit[]): TaskUnit[] {
    const allowedUnits = this._unitsSortedById.filter(
      (unit) => !isolatedUnits.includes(unit)
    );
    if (allowedUnits.length === 0) {
      // must not be any more available heads, so return empty list.
      return [];
    }
    const singleSubset = this._buildSubsetSingleStepMatrix(allowedUnits);
    return this._getHeadsUsingMatrix(allowedUnits, singleSubset);
  }
  /**
   * Get the heads using the matrix.
   *
   * The matrix should have a column of zeroes for any units that no other available unit depends on.
   *
   * @param sortedAllowedUnits the units that correspond with the indexes of the matrix
   * @param matrix the matrix containing the available paths
   * @returns the units that no other available units directly depend on
   */
  private _getHeadsUsingMatrix(
    sortedAllowedUnits: TaskUnit[],
    matrix: Matrix
  ): TaskUnit[] {
    const headUnits: TaskUnit[] = [];
    for (let [indexAsString, unit] of Object.entries(sortedAllowedUnits)) {
      const index: number = Number(indexAsString);
      // get the index associated with
      const column = matrix.getColumn(index);
      if (column.some((pathCountToUnit) => pathCountToUnit)) {
        // There are some paths to this unit, so it must not be a head
        continue;
      } else {
        // There are no paths to this unit, so it must be a head
        headUnits.push(unit);
      }
    }
    return headUnits;
  }
}
