import { expect } from "chai";
import { default as TaskUnit } from "./TaskUnit";

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
  describe("Has Equivalent Branching Dependencies", function () {
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
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      unitD = new TaskUnit([], startDateC, endDateC);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitC, unitD], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-C as ideal chain when all available", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitC,
      ]);
    });
  });
  describe("Has Branching Dependencies (Skewed on Presence, Not Time Span (More Presence First))", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 1500);
      startDateD = new Date(endDateD.getTime() - 500);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitC, unitD], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-C as ideal chain when all available", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitC,
      ]);
    });
  });
  describe("Has Branching Dependencies (Skewed on Presence, Not Time Span (Less Presence First))", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 1500);
      startDateD = new Date(endDateD.getTime() - 500);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitD, unitC], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-C as ideal chain when all available", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitC,
      ]);
    });
  });
  describe("Has Branching Dependencies (Same Density (More Presence First))", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 2000);
      startDateD = new Date(endDateD.getTime() - 3000);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitD, unitC], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-D as ideal chain when all available (preferred more presence)", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitD,
      ]);
    });
  });
  describe("Has Branching Dependencies (Same Density (Less Presence First))", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 2000);
      startDateD = new Date(endDateD.getTime() - 3000);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitC, unitD], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-D as ideal chain when all available (preferred more presence)", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitD,
      ]);
    });
  });
  describe("Has Branching Dependencies (More Density First)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 1000);
      startDateD = new Date(endDateD.getTime() - 2000);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitD, unitC], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-D as ideal chain when all available (preferred more density)", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitD,
      ]);
    });
  });
  describe("Has Branching Dependencies (Less Density First)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      endDateD = new Date(startDateB.getTime() - 1000);
      startDateD = new Date(endDateD.getTime() - 2000);
      unitD = new TaskUnit([], startDateD, endDateD);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitC, unitD], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
    });
    it("should have correct presence", function () {
      expect(unitA.presenceTime).to.equal(
        endDateA.getTime() - startDateA.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unitA.initialStartDate).to.equal(startDateA);
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unitA.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
        .false;
    });
    it("should be dependent on direct dependency", function () {
      expect(unitA.isDependentOn(unitB)).to.be.true;
    });
    it("should be dependent on indirect dependency", function () {
      expect(unitA.isDependentOn(unitC)).to.be.true;
      expect(unitA.isDependentOn(unitD)).to.be.true;
    });
    it("should have B as a direct dependency", function () {
      expect(unitA.directDependencies).to.deep.equal(new Set([unitB]));
    });
    it("should have B, C, and D as dependencies", function () {
      expect([...unitA.getAllDependencies()]).to.have.members([
        unitB,
        unitC,
        unitD,
      ]);
    });
    it("should provide A-B-D as ideal chain when C is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC]).units
      ).to.deep.equal([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as ideal chain when D is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitD]).units
      ).to.deep.equal([unitA, unitB, unitC]);
    });
    it("should provide A-B as ideal chain when C and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitC, unitD]).units
      ).to.deep.equal([unitA, unitB]);
    });
    it("should provide A as ideal chain when B, C, and D are unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB, unitC, unitD]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A as ideal chain when B is unavailable", function () {
      expect(
        unitA.getIdealDensityChainWithoutUnits([unitB]).units
      ).to.deep.equal([unitA]);
    });
    it("should provide A-B-D as ideal chain when all available (preferred more density)", function () {
      expect(unitA.getIdealDensityChainWithoutUnits([]).units).to.deep.equal([
        unitA,
        unitB,
        unitD,
      ]);
    });
  });
  describe("Complex Interconnections", function () {
    /**
     * ```text
     *
     *    ┏━━━┓___┏━━━┓
     *   A┗━━━┛╲ ╱┗━━━┛╲B
     *          ╳       ╲
     *    ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
     *   C┗━━━┛╲ ╱┗━━━┛╲D╱┗━━━┛E
     *          ╳       ╳
     *    ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
     *   F┗━━━┛   ┗━━━┛G  ┗━━━┛H
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let unitH: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let startDateE: Date;
    let startDateF: Date;
    let startDateG: Date;
    let startDateH: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    let endDateE: Date;
    let endDateF: Date;
    let endDateG: Date;
    let endDateH: Date;
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondUnitEnd = new Date(secondUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());
      startDateB = new Date(secondUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());

      startDateC = new Date(firstUnitStart.getTime());
      endDateC = new Date(firstUnitEnd.getTime());
      startDateD = new Date(secondUnitStart.getTime());
      endDateD = new Date(secondUnitEnd.getTime());
      startDateE = new Date(thirdUnitStart.getTime());
      endDateE = new Date(thirdUnitEnd.getTime());

      startDateF = new Date(firstUnitStart.getTime());
      endDateF = new Date(firstUnitEnd.getTime());
      startDateG = new Date(secondUnitStart.getTime());
      endDateG = new Date(secondUnitEnd.getTime());
      startDateH = new Date(thirdUnitStart.getTime());
      endDateH = new Date(thirdUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitF = new TaskUnit([], startDateF, endDateF);

      unitB = new TaskUnit([unitA, unitC], startDateB, endDateB);
      unitD = new TaskUnit([unitA, unitC, unitF], startDateD, endDateD);
      unitG = new TaskUnit([unitC, unitF], startDateG, endDateG);

      unitE = new TaskUnit([unitB, unitD, unitG], startDateE, endDateE);
      unitH = new TaskUnit([unitD, unitG], startDateH, endDateH);
    });
    describe("From A", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitC;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitD;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitE;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 3 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(3);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From F", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitF;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitG;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitH;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 2 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
});
