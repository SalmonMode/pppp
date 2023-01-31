import { expect } from "chai";
import { TaskUnit, UnitPathMatrix } from "./";

describe("UnitPathMatrix", function () {
  describe("Get Unit for Matrix Index That Doesn't Exist", function () {
    let unitPathMatrix: UnitPathMatrix;
    before(function () {
      const now = new Date();
      const startDate = new Date(now.getTime());
      const endDate = new Date(startDate.getTime() + 1000);
      const unit = new TaskUnit(now, [], startDate, endDate);
      unitPathMatrix = new UnitPathMatrix([unit]);
    });
    it("should throw RangeError when trying to find unit for matrix ID that doesn't exist", function () {
      expect(() => unitPathMatrix.getUnitForMatrixIndex(1)).to.throw(
        RangeError
      );
    });
  });
});
