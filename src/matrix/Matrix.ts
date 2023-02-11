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
    const column: number[] = this.data.map(
      (row: number[], rowIndex: number): number => {
        const entry = row[columnIndex];
        if (entry === undefined) {
          throw new RangeError(
            `Matrix does not have a column at index ${rowIndex}`
          );
        }
        return entry;
      }
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
      (row: number[]): boolean => row.length === this._firstRow.length
    );
    if (!allAreSameSize) {
      throw new RangeError("All rows of the matrix must have the same size");
    }
  }
  /**
   * Add this matrix by the passed matrix and return a new Matrix object containing the sum.
   *
   * This produces a new matrix, where the elements in each position are the sum of the elements in the respective
   * positions in this matrix and the passed matrix. For example:
   *
   * ```text
   *      A           B
   *  ┏       ┓   ┏       ┓   ┏       ┓
   *  ┃ 0 1 3 ┃   ┃ 0 0 5 ┃   ┃ 0 1 8 ┃
   *  ┃ 2 0 1 ┃ + ┃ 0 0 3 ┃ = ┃ 2 0 4 ┃
   *  ┃ 5 1 0 ┃   ┃ 0 6 1 ┃   ┃ 5 7 1 ┃
   *  ┗       ┛   ┗       ┛   ┗       ┛
   * ```
   *
   * @param otherMatrix The matrix to add by
   * @returns a new Matrix object containing the sum
   */
  add(otherMatrix: Matrix): Matrix {
    this._verifyMatrixIsCompatibleForAdditionAndSubtraction(otherMatrix);
    const sumMatrixData: number[][] = [];
    for (let rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
      const rowData: number[] = [];
      for (let colIdx = 0; colIdx < this.numberOfColumns; colIdx++) {
        const sum =
          this.getElementAtPosition(rowIndex, colIdx) +
          otherMatrix.getElementAtPosition(rowIndex, colIdx);
        rowData.push(sum);
      }
      sumMatrixData.push(rowData);
    }
    return new Matrix(sumMatrixData);
  }
  /**
   * Subtract this matrix by the passed matrix and return a new Matrix object containing the difference.
   *
   * This produces a new matrix, where the elements in each position are the difference of the elements in the
   * respective positions in this matrix and the passed matrix. For example:
   *
   * ```text
   *      A           B
   *  ┏       ┓   ┏       ┓   ┏         ┓
   *  ┃ 0 1 3 ┃   ┃ 0 0 5 ┃   ┃ 0  1 -2 ┃
   *  ┃ 2 0 3 ┃ - ┃ 0 0 1 ┃ = ┃ 2  0  2 ┃
   *  ┃ 5 6 7 ┃   ┃ 0 1 4 ┃   ┃ 0  5  3 ┃
   *  ┗       ┛   ┗       ┛   ┗         ┛
   * ```
   *
   * @param otherMatrix The matrix to subtract by
   * @returns a new Matrix object containing the difference
   */
  subtract(otherMatrix: Matrix): Matrix {
    this._verifyMatrixIsCompatibleForAdditionAndSubtraction(otherMatrix);
    const differenceMatrixData: number[][] = [];
    for (let rowIndex = 0; rowIndex < this.numberOfRows; rowIndex++) {
      const rowData: number[] = [];
      for (let colIdx = 0; colIdx < this.numberOfColumns; colIdx++) {
        const difference =
          this.getElementAtPosition(rowIndex, colIdx) -
          otherMatrix.getElementAtPosition(rowIndex, colIdx);
        rowData.push(difference);
      }
      differenceMatrixData.push(rowData);
    }
    return new Matrix(differenceMatrixData);
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
      const productRow: number[] = (productMatrixData[rowIndex] = []);
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
  /**
   * Transpose this matrix and return a new Matrix object containing the result.
   *
   * Transposing a matrix means reflecting it over its X and Y axis. This can be done in one swift action by turning the
   * rows into columns.
   *
   * @returns a new Matrix object containing the transposed result
   */
  transpose(): Matrix {
    const newData: number[][] = [];
    // Each row needs to become each column in the transposed matrix.
    for (const row of this.data) {
      for (const [columnIndexAsString, sourceNumber] of Object.entries(row)) {
        const newRowIndex = Number(columnIndexAsString);
        // Make sure there's an array started for the new row in the transposed matrix. This both makes sure the array
        // exists, and satisfied TypeScript's noUncheckedIndexAccess.
        const newRow = (newData[newRowIndex] ??= []);
        // Add the source number to the new row.
        newRow.push(sourceNumber);
      }
    }
    return new Matrix(newData);
  }
  /**
   * Check that the passed matrix can actually be summed with this matrix.
   *
   * In order for matrices to be added to each other, they must have the same numbers of rows and columns as each other.
   *
   * @param matrix the other matrix to check for compatiblity
   */
  private _verifyMatrixIsCompatibleForAdditionAndSubtraction(
    matrix: Matrix
  ): void {
    if (
      this.numberOfRows !== matrix.numberOfRows ||
      this.numberOfColumns !== matrix.numberOfColumns
    ) {
      throw new RangeError(
        `The passed matrix doesn't have the same number of rows and columns (Rows: ${matrix.numberOfRows}, Columns: ` +
          `${matrix.numberOfColumns}) as this matrix (Rows: ${this.numberOfRows}, Columns: ${this.numberOfColumns})`
      );
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
}
