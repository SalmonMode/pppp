import { default as IsolatedDependencyChain } from "./IsolatedDependencyChain";
import { default as TaskUnit } from "./TaskUnit";
import { expect } from "chai";
import { DependencyOrderError } from "../Error";

describe("IsolatedDependencyChain", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new IsolatedDependencyChain([])).to.throw(RangeError);
    });
  });

  // describe("One Unit", function () {
  //   let unit: TaskUnit;
  //   let unitB: TaskUnit;
  //   let unitC: TaskUnit;
  //   let unitD: TaskUnit;
  //   let startDateA: Date;
  //   let startDateB: Date;
  //   let startDateC: Date;
  //   let endDateA: Date;
  //   let endDateB: Date;
  //   let endDateC: Date;
  //   before(function () {
  //     startDateA = new Date();
  //     endDateA = new Date(startDateA.getTime() + 1000);
  //     startDateB = new Date(endDateA.getTime() + 1000);
  //     endDateB = new Date(startDateB.getTime() + 1000);
  //     startDateC = new Date(endDateB.getTime() + 1000);
  //     endDateC = new Date(startDateC.getTime() + 1000);
  //     unitA = new TaskUnit([], startDateA, endDateA);
  //     unitB = new TaskUnit([unitA], startDateB, endDateB);
  //     unitC = new TaskUnit([unitB], startDateC, endDateC);
  //     unitD = new TaskUnit([unitB], startDateC, endDateC);
  //   });
  //   it("should have correct presence", function () {
  //     expect(unitC.presenceTime).to.equal(
  //       endDateC.getTime() - startDateC.getTime()
  //     );
  //   });
  //   it("should have correct initial start date", function () {
  //     expect(unitC.initialStartDate).to.equal(startDateC);
  //   });
  //   it("should not be dependent on unit that isn't its parent", function () {
  //     expect(unitC.isDependentOn(new TaskUnit([], startDateA, endDateA))).to.be
  //       .false;
  //   });
  //   it("should be dependent on direct dependency", function () {
  //     expect(unitC.isDependentOn(unitB)).to.be.true;
  //   });
  //   it("should be dependent on indirect dependency", function () {
  //     expect(unitC.isDependentOn(unitA)).to.be.true;
  //   });
  //   it("should not be dependent on sibling unit", function () {
  //     expect(unitC.isDependentOn(unitD)).to.be.false;
  //   });
  //   it("should have B as a direct dependency", function () {
  //     expect(unitC.directDependencies).to.deep.equal(new Set([unitB]));
  //   });
  //   it("should have B and A as dependencies", function () {
  //     expect([...unitC.getAllDependencies()]).to.have.members([unitA, unitB]);
  //   });
  // });
  describe("One Unit", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    let chain: IsolatedDependencyChain;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
      chain = new IsolatedDependencyChain([unit]);
    });
    it("should have same presence as its unit", function () {
      expect(chain.presenceTime).to.equal(unit.presenceTime);
    });
    it("should have same initial start date as its unit", function () {
      expect(chain.initialStartDate).to.equal(unit.initialStartDate);
    });
    it("should have same end date as its unit", function () {
      expect(chain.endDate).to.equal(unit.endDate);
    });
    it("should have same timespan as its unit presence time", function () {
      expect(chain.timeSpan).to.equal(unit.presenceTime);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unit);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
  });
  describe("Two Units (Sunny Day)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    let chain: IsolatedDependencyChain;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same initial start date as its prior unit", function () {
      expect(chain.initialStartDate).to.equal(unitA.initialStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.equal(unitB.endDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.endDate.getTime() - unitA.initialStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
  });
  describe("Two Units (External Dependency)", function () {
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
    let chain: IsolatedDependencyChain;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date();
      endDateC = new Date(startDateC.getTime() + 500);
      startDateD = new Date(endDateC.getTime());
      endDateD = new Date(startDateD.getTime() + 500);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitD = new TaskUnit([unitC], startDateD, endDateD);
      unitB = new TaskUnit([unitA, unitD], startDateB, endDateB);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same initial start date as its prior unit", function () {
      expect(chain.initialStartDate).to.equal(unitA.initialStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.equal(unitB.endDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.endDate.getTime() - unitA.initialStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have D as external dependency", function () {
      expect([...chain.getExternalDependencies()]).to.have.members([unitD]);
    });
  });
  describe("Two Units (With Gap)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    let chain: IsolatedDependencyChain;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime() + 1000);
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same initial start date as its prior unit", function () {
      expect(chain.initialStartDate).to.equal(unitA.initialStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.equal(unitB.endDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.endDate.getTime() - unitA.initialStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 2/3 (1000 ms gap between both 1000 ms chunks of presence)", function () {
      expect(chain.visualDensity).to.equal(2 / 3);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
  });
  describe("Two Units (With Overlap)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    let chain: IsolatedDependencyChain;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 2000);
      // Pretending A should've only taken 1000 ms, but actually took 2000
      startDateB = new Date(endDateA.getTime() - 1000);
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      endDateB = new Date(startDateB.getTime() + 2000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same initial start date as its prior unit", function () {
      expect(chain.initialStartDate).to.equal(unitA.initialStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.equal(unitB.endDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.endDate.getTime() - unitA.initialStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 4/3 (overlap)", function () {
      expect(chain.visualDensity).to.equal(4 / 3);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
  });
  describe("Two Units (Out of Order)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 2000);
      // Pretending A should've only taken 1000 ms, but actually took 2000
      startDateB = new Date(endDateA.getTime() - 1000);
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      endDateB = new Date(startDateB.getTime() + 2000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
    });
    it("should throw DependencyOrderError", function () {
      expect(() => new IsolatedDependencyChain([unitA, unitB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Two Units (No Dependency)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 2000);
      // Pretending A should've only taken 1000 ms, but actually took 2000
      startDateB = new Date(endDateA.getTime() - 1000);
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      endDateB = new Date(startDateB.getTime() + 2000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([], startDateB, endDateB);
    });
    it("should throw DependencyOrderError", function () {
      expect(() => new IsolatedDependencyChain([unitB, unitA])).to.throw(
        DependencyOrderError
      );
    });
  });
});
