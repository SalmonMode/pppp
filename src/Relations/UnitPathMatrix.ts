import Matrix from "@matrix";
import type { ITaskUnit } from "@types";

/**
 * A simple abstraction around a matrix of the unit relations to perform helpful operations.
 */
export default class UnitPathMatrix {
  /**
   * The units sorted alphabetically by their IDs.
   *
   * This is the basis for which the path matrix keys are based. The index in this array is the same as their
   * corresponding row and column in each matrix.
   *
   * For matrix subsets, new arrays will be made containing the subset of units, and the indexes will inherently be
   * different, but the principle is the same.
   */
  private _unitsSortedById: ITaskUnit[];
  /**
   * The matrix only understands integers for its column and row indexes. So we need to track the order of all the units
   * according to their sorted ID order. The index of their ID in this list represents the index of their column and row
   * in the matrix.
   */
  private _pathMatrixKeys: string[];
  /**
   * A matrix showing the direct connections of each unit in both directions. This will show where each unit can "step"
   * to, or where they can be stepped to from in exactly one step. This is useful for identifying interconnections,
   * which is necessary to sort according to the stress model.
   */
  private _symmetricSingleStepMatrix: Matrix;
  /**
   * A matrix showing the direct dependencies of each unit. This will show where each unit can "step" to in just a
   * single step. This is useful for easily and efficiently identifying which units are usable as heads when other units
   * have been eliminated.
   */
  private _singleStepMatrix: Matrix;
  constructor(units: ITaskUnit[]) {
    const firstUnit = units[0];
    if (firstUnit === undefined) {
      throw new RangeError("Must provide at least 1 ITaskUnit");
    }
    this._unitsSortedById = this._getAllUnitsSortedById(units);
    this._pathMatrixKeys = this._getPathMatrixKeys();
    this._singleStepMatrix = this._buildSingleStepMatrix();
    this._symmetricSingleStepMatrix = this._buildSymmetricSingleStepMatrix();
  }
  /**
   * Take an array of units, and return a new array with the same units sorted alphabetically by their IDs.
   *
   * @param units the units to sort
   * @returns a new array of units sorted according to their IDs
   */
  private _getAllUnitsSortedById(units: ITaskUnit[]): ITaskUnit[] {
    return [...units].sort((prev: ITaskUnit, next: ITaskUnit): number =>
      prev.id.localeCompare(next.id)
    );
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
    return this._unitsSortedById
      .map((unit: ITaskUnit): string => unit.id)
      .sort();
  }
  /**
   * A matrix showing which units are connected to which other units.
   *
   * This details which units are dependent on which units, and the reverse. If A is dependent on B, then A is connected
   * to B and B is connected to A.
   *
   * This is useful for identifying interconnections, which is necessary to sort according to the stress model.
   */
  get taskUnitInterconnections(): Matrix {
    return this._symmetricSingleStepMatrix;
  }
  /**
   * @param unit
   * @returns The index in the path and single step matrices that correspond with the row and column index of the unit.
   */
  getMatrixIndexForUnit(unit: ITaskUnit): number {
    return this._pathMatrixKeys.indexOf(unit.id);
  }
  /**
   * Build a matrix that shows the direct dependencies of each unit. This will show where each unit can "step" to in
   * just a single step. In others words M1.
   */
  private _buildSingleStepMatrix(): Matrix {
    const pathMatrixData: number[][] = [];
    for (const unit of this._unitsSortedById) {
      const rowData: number[] = new Array(this._unitsSortedById.length);
      // fill with 0s by default, since we'll only be replacing the relevant places with 1s.
      rowData.fill(0);
      for (const dep of unit.directDependencies) {
        const depIndex = this.getMatrixIndexForUnit(dep);
        rowData[depIndex] = 1;
      }
      pathMatrixData.push(rowData);
    }
    return new Matrix(pathMatrixData);
  }
  /**
   * Build a matrix that shows the interconnections of each unit. This will show where each unit can "step" to, or be
   * stepped to from in exactly a single step.
   */
  private _buildSymmetricSingleStepMatrix(): Matrix {
    const singleStepM = this._singleStepMatrix;
    // We can get the symmetric matrix by adding the single step matrix to the transposed version of itself.
    return singleStepM.add(singleStepM.transpose());
  }
  /**
   * Build a matrix showing which units every unit can reach in a single step. This is useful for very easily and
   * efficiently identifying which units are heads when other units have been eliminated.
   *
   * @param sortedUnits
   * @returns a matrix showing which units each unit can reach in a single step (i.e. their direct dependencies)
   */
  private _buildSubsetSingleStepMatrix(sortedUnits: ITaskUnit[]): Matrix {
    // get slice of single step for relevant units
    const matrixData: number[][] = [];
    const sliceIndexes = sortedUnits.map((unit: ITaskUnit): number =>
      this.getMatrixIndexForUnit(unit)
    );
    for (const row of sliceIndexes) {
      const rowData: number[] = [];
      for (const column of sliceIndexes) {
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
  getHeadUnitsWithoutIsolatedUnit(isolatedUnits: ITaskUnit[]): ITaskUnit[] {
    const allowedUnits = this._unitsSortedById.filter(
      (unit: ITaskUnit): boolean => !isolatedUnits.includes(unit)
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
    sortedAllowedUnits: ITaskUnit[],
    matrix: Matrix
  ): ITaskUnit[] {
    const headUnits: ITaskUnit[] = [];
    for (const [indexAsString, unit] of Object.entries(sortedAllowedUnits)) {
      const index = Number(indexAsString);
      // get the index associated with
      const column = matrix.getColumn(index);
      if (column.some((pathCountToUnit: number): number => pathCountToUnit)) {
        // There are some paths to this unit, so it must not be a head
        continue;
      } else {
        // There are no paths to this unit, so it must be a head
        headUnits.push(unit);
      }
    }
    return headUnits;
  }
  getUnitForMatrixIndex(index: number): ITaskUnit {
    const unit = this._unitsSortedById[index];
    if (!unit) {
      throw new RangeError(`No unit exsts for matrix index ${index}`);
    }
    return unit;
  }

  /**
   * Get all units connected to the passed unit, whether it is a direct dependency of them, or they are of it.
   *
   * @param unit the unit to find the connected units of
   * @returns a set of units that have a connection to the passed unit
   */
  getUnitsConnectedToUnit(unit: ITaskUnit): Set<ITaskUnit> {
    const connectedUnits = new Set<ITaskUnit>();
    const unitIndex = this.getMatrixIndexForUnit(unit);
    const connectionsRow = this.taskUnitInterconnections.getRow(unitIndex);
    connectionsRow.forEach((walks: number, connectionIndex: number): void => {
      if (walks) {
        connectedUnits.add(this.getUnitForMatrixIndex(connectionIndex));
      }
    });
    return connectedUnits;
  }
}
