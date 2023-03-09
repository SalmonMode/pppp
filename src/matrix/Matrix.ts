import type IMatrix from "@typing/IMatrix";

export default class Matrix implements IMatrix {
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
  get numberOfRows(): number {
    return this._rowCount;
  }
  get numberOfColumns(): number {
    return this._columnCount;
  }
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
  add(otherMatrix: IMatrix): IMatrix {
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
  subtract(otherMatrix: IMatrix): IMatrix {
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
  multiply(otherMatrix: IMatrix): IMatrix {
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
  transpose(): IMatrix {
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
    matrix: IMatrix
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
  private _verifyMatrixIsCompatibleForMultiplication(matrix: IMatrix): void {
    if (this.numberOfColumns !== matrix.numberOfRows) {
      throw new RangeError(
        "The passed matrix doesn't have as many rows as this matrix has columns, so they cannot be multiplied."
      );
    }
  }
}
