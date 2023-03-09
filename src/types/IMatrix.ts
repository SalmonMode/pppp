export default interface IMatrix {
  /**
   * The actual data of the matrix in a multidimensional array.
   */
  data: number[][];
  /** The number of rows the matrix has. */
  numberOfRows: number;
  /** The number of columns the matrix has. */
  numberOfColumns: number;
  /**
   * Get the element from the specified position.
   *
   * @param rowIndex The index of the row to find
   * @param columnIndex The index of the column within the row to get
   * @returns the number from the specified position
   *
   * @throws {@link RangeError} if either index is not valid.
   */
  getElementAtPosition(rowIndex: number, columnIndex: number): number;
  /**
   * Get the column of the matrix at the specified index
   *
   * @param columnIndex the index of the column to get
   * @returns an array containing the numbers of the column in order
   *
   * @throws {@link RangeError} if index is not valid.
   */
  getColumn(columnIndex: number): number[];
  /**
   * Get the row of the matrix at the specified index
   *
   * @param rowIndex the index of the row to get
   * @returns an array containing the numbers of the row in order
   *
   * @throws {@link RangeError} if index is not valid.
   */
  getRow(rowIndex: number): number[];
  /**
   * Add this matrix by the passed matrix and return a new IMatrix object containing the sum.
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
   * @returns a new IMatrix object containing the sum
   */
  add(otherMatrix: IMatrix): IMatrix;
  /**
   * Subtract this matrix by the passed matrix and return a new IMatrix object containing the difference.
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
   * @returns a new IMatrix object containing the difference
   */
  subtract(otherMatrix: IMatrix): IMatrix;
  /**
   * Multiply this matrix by the passed matrix and return a new IMatrix object containing the product.
   *
   * This iterates over the rows of the source matrix, the columns of the target matrix, and the columns of the source
   * matrix, incrementing the numbers in each position of the product matrix as it finds the product of the relevant
   * numbers for that position in the product matrix.
   *
   * @param otherMatrix The matrix to multiply by
   * @returns a new IMatrix object containing the product
   */
  multiply(otherMatrix: IMatrix): IMatrix;
  /**
   * Transpose this matrix and return a new IMatrix object containing the result.
   *
   * Transposing a matrix means reflecting it over its X and Y axis. This can be done in one swift action by turning the
   * rows into columns.
   *
   * @returns a new IMatrix object containing the transposed result
   */
  transpose(): IMatrix;
}
