import { default as TaskUnit } from "./TaskUnit";
import { expect } from "chai";

describe("TaskUnit", function () {
  describe("No Dependencies", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        endDate.getTime() - startDate.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unit.initialStartDate).to.equal(startDate);
    });
    it("should not be dependent on self", function () {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unit.isDependentOn(new TaskUnit([], startDate, endDate))).to.be
        .false;
    });
    it("should have no direct dependencies", function () {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function () {
      expect(unit.getAllDependencies()).to.be.empty;
    });
  });
  describe("Has Dependencies", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime() + 1000);
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(endDateB.getTime() + 1000);
      endDateC = new Date(startDateC.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitB], startDateC, endDateC);
      unitD = new TaskUnit([unitB], startDateC, endDateC);
    });
    it("should have correct presence", function () {
      expect(unitC.presenceTime).to.equal(
        endDateC.getTime() - startDateC.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitC.initialStartDate).to.equal(startDateC);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitC.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitC.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitC.isDependentOn(unitA)).to.be.true;
    });
    it("should not be dependent on sibling unit", function () {
      expect(unitC.isDependentOn(unitD)).to.be.false;
    });
    it("should have B as a direct dependency", function () {
      expect(unitC.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B and A as dependencies", function () {
      expect([...unitC.getAllDependencies()]).to.have.members([unitA, unitB]);
    });
  });
});
