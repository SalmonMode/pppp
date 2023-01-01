import { expect } from "chai";
import { default as Matrix } from "./Matrix";

describe("Matrix", function () {
  describe("Empty Matrix", function () {
    it("should throw RangeError", function () {
      expect(() => new Matrix([])).to.throw(RangeError);
    });
  });
  describe("Uneven Matrix", function () {
    it("should throw RangeError", function () {
      expect(() => new Matrix([[1, 2], [1]])).to.throw(RangeError);
    });
  });
  describe("Good Matrix", function () {
    let matrix: Matrix;
    before(function () {
      matrix = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });
    it("should have 3 rows", function () {
      expect(matrix.numberOfRows).to.equal(3);
    });
    it("should have 2 columns", function () {
      expect(matrix.numberOfColumns).to.equal(2);
    });
    it("should throw RangeError when getting nonexistent row", function () {
      expect(() => matrix.getRow(3)).to.throw(RangeError);
    });
    it("should throw RangeError when getting nonexistent column", function () {
      expect(() => matrix.getColumn(2)).to.throw(RangeError);
    });
    it("should throw RangeError when getting nonexistent element (outside row range)", function () {
      expect(() => matrix.getElementAtPosition(3, 1)).to.throw(RangeError);
    });
    it("should throw RangeError when getting nonexistent element (outside column range)", function () {
      expect(() => matrix.getElementAtPosition(1, 3)).to.throw(RangeError);
    });
  });
  describe("Multiplication", function () {
    let matrix: Matrix;
    before(function () {
      matrix = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });
    it("should throw RangeError when multiplying by matrix with fewer rows than good matrix has columns", function () {
      const otherMatrix = new Matrix([[1, 2, 3, 4, 5, 6]]);
      expect(() => matrix.multiply(otherMatrix)).to.throw(RangeError);
    });
    it("should throw RangeError when multiplying by matrix with more rows than good matrix has columns", function () {
      const otherMatrix = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ]);
      expect(() => matrix.multiply(otherMatrix)).to.throw(RangeError);
    });
    it("should produce correct matrix when multiplying by another good matrix", function () {
      const otherMatrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
      ]);
      const expectedMatrix = new Matrix([
        [9, 12, 15],
        [19, 26, 33],
        [29, 40, 51],
      ]);
      expect(matrix.multiply(otherMatrix)).to.deep.equal(expectedMatrix);
    });
  });
  describe("Addition", function () {
    let matrix: Matrix;
    before(function () {
      matrix = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
      ]);
    });
    it("should throw RangeError when adding by matrix with fewer rows than good matrix", function () {
      const otherMatrix = new Matrix([
        [1, 2],
        [3, 4],
      ]);
      expect(() => matrix.add(otherMatrix)).to.throw(RangeError);
    });
    it("should throw RangeError when adding by matrix with more rows than good matrix", function () {
      const otherMatrix = new Matrix([
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
      ]);
      expect(() => matrix.add(otherMatrix)).to.throw(RangeError);
    });
    it("should throw RangeError when adding by matrix with fewer columns than good matrix", function () {
      const otherMatrix = new Matrix([[1], [3], [5]]);
      expect(() => matrix.add(otherMatrix)).to.throw(RangeError);
    });
    it("should throw RangeError when adding by matrix with more columns than good matrix", function () {
      const otherMatrix = new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]);
      expect(() => matrix.add(otherMatrix)).to.throw(RangeError);
    });
    it("should produce correct sum matrix when adding compatible matrices", function () {
      const otherMatrix = new Matrix([
        [0, 5],
        [4, 0],
        [4, 1],
      ]);
      const expectedMatrix = new Matrix([
        [1, 7],
        [7, 4],
        [9, 7],
      ]);
      expect(matrix.add(otherMatrix)).to.deep.equal(expectedMatrix);
    });
  });
});
