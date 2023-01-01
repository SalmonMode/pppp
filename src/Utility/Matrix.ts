export default class Matrix {
  /** The first row of the matrix.
   *
   * Cached during construction to avoid having to check index access for undefined when accessing the first row.
   * Otherwise, we'd need to throw errors to handle those logic paths for the type checking.
   */
  private _firstRow: number[];
  /** The number of rows in the matrix.
   *
   * Cached during construction to avoid having to check index access for undefined after accessing the first row.
   * Otherwise, we'd need to throw errors to handle those logic paths for the type checking.
   */
  private _rowCount: number;
  /** The number of columns in the matrix.
   *
   * Cached during construction to avoid having to check index access for undefined after accessing the first row.
   * Otherwise, we'd need to throw errors to handle those logic paths for the type checking.
   */
  private _columnCount: number;
  constructor(public readonly data: number[][]) {
    const firstRow = data[0];
    if (firstRow === undefined) {
      throw new RangeError("Matrix must have at least one row");
    }
    this._firstRow = firstRow;
    this._verifyMatrixSize();
    this._rowCount = this.data.length;
    this._columnCount = this._firstRow.length;
  }
  /** The number of rows the matrix has. */
  get numberOfRows(): number {
    return this._rowCount;
  }
  /** The number of columns the matrix has. */
  get numberOfColumns(): number {
    return this._columnCount;
  }
  /**
   * Get the element from the specified position.
   *
   * @param rowIndex The index of the row to find
   * @param columnIndex The index of the column within the row to get
   * @returns the number from the specified position
   */
  getElementAtPosition(rowIndex: number, columnIndex: number): number {
    const row = this.getRow(rowIndex);
    const entry = row[columnIndex];
    if (entry === undefined) {
      throw new RangeError(
        `Matrix does not have a column at index ${rowIndex}`
      );
    }
    return entry;
  }
  /**
   * Get the column of the matrix at the specified index
   *
   * @param columnIndex the index of the column to get
   * @returns an array containing the numbers of the column in order
   */
  getColumn(columnIndex: number): number[] {
    const column: number[] = this.data.map((_, rowIndex) =>
      this.getElementAtPosition(rowIndex, columnIndex)
    );

    return column;
  }
  /**
   * Get the row of the matrix at the specified index
   *
   * @param rowIndex the index of the row to get
   * @returns an array containing the numbers of the row in order
   */
  getRow(rowIndex: number): number[] {
    const row = this.data[rowIndex];
    if (row === undefined) {
      throw new RangeError(`Matrix does not have a row at index ${rowIndex}`);
    }
    return row;
  }
  /** Make sure every row of the matrix has the same number of columns. */
  private _verifyMatrixSize(): void {
    const allAreSameSize = this.data.every(
      (row) => row.length === this._firstRow.length
    );
    if (!allAreSameSize) {
      throw new RangeError("All rows of the matrix must have the same size");
    }
  }
  /**
   * Check that the passed matrix can actually be multiplied with this matrix.
   *
   * In order for matrices to be multiplied by each other, the number of columns of the first matrix (this one) must be
   * equal to the number of rows of the second matrix (the one being passed in).
   *
   * @param matrix the other matrix to check for compatiblity
   */
  private _verifyMatrixIsCompatibleForMultiplication(matrix: Matrix): void {
    if (this.numberOfColumns !== matrix.numberOfRows) {
      throw new RangeError(
        "The passed matrix doesn't have as many rows as this matrix has columns, so they cannot be multiplied."
      );
    }
  }
  /**
   * Multiply this matrix by the passed matrix and return a new Matrix object containing the product.
   *
   * This iterates over the rows of the source matrix, the columns of the target matrix, and the columns of the source
   * matrix, incrementing the numbers in each position of the product matrix as it finds the product of the relevant
   * numbers for that position in the product matrix.
   *
   * @param otherMatrix The matrix to multiply by
   * @returns a new Matrix object containing the product
   */
  multiply(otherMatrix: Matrix): Matrix {
    this._verifyMatrixIsCompatibleForMultiplication(otherMatrix);
    const productMatrixData: number[][] = [];
    // Figure out the products for the numbers in the first row of this matrix
    for (let rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
      // Make sure there an array already started for this row
      const productRow = (productMatrixData[rowIndex] ??= []);
      for (let colIdx = 0; colIdx < otherMatrix.numberOfColumns; colIdx++) {
        // Go column by column of the other matrix
        for (let srcColIdx = 0; srcColIdx < this.numberOfColumns; srcColIdx++) {
          // Make sure there's already a zero so we can just add to what's already there
          productRow[colIdx] ??= 0;
          // The src column index translates to the row of the target matrix that we want to target.
          productRow[colIdx] +=
            this.getElementAtPosition(rowIndex, srcColIdx) *
            otherMatrix.getElementAtPosition(srcColIdx, colIdx);
        }
      }
    }
    return new Matrix(productMatrixData);
  }
}
