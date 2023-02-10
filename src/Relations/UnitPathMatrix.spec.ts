import { expect } from "chai";
import { TaskUnit, UnitPathMatrix } from "./";

describe("UnitPathMatrix", function (): void {
  describe("Get Unit for Matrix Index That Doesn't Exist", function (): void {
    let unitPathMatrix: UnitPathMatrix;
    before(function (): void {
      const now = new Date();
      const startDate = new Date(now.getTime());
      const endDate = new Date(startDate.getTime() + 1000);
      const unit = new TaskUnit(now, [], startDate, endDate);
      unitPathMatrix = new UnitPathMatrix([unit]);
    });
    it("should throw RangeError when trying to find unit for matrix ID that doesn't exist", function (): void {
      expect(() => unitPathMatrix.getUnitForMatrixIndex(1)).to.throw(
        RangeError
      );
    });
  });
});
