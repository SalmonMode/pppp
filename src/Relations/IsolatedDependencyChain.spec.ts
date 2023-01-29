import { expect } from "chai";
import { DependencyOrderError } from "../Error";
import { IsolatedDependencyChain, TaskUnit } from "./";

const now = new Date();
const firstDate = new Date(now.getTime() + 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);
const ninthDate = new Date(eighthDate.getTime() + 1000);
const tenthDate = new Date(ninthDate.getTime() + 1000);

describe("IsolatedDependencyChain", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new IsolatedDependencyChain([])).to.throw(RangeError);
    });
  });
  describe("One Unit", function () {
    let unit: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      unit = new TaskUnit([], firstDate, secondDate);
      chain = new IsolatedDependencyChain([unit]);
    });
    it("should have same presence as its unit", function () {
      expect(chain.presenceTime).to.equal(unit.presenceTime);
    });
    it("should have same anticipated start date as its unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unit.anticipatedStartDate);
    });
    it("should have same end date as its unit", function () {
      expect(chain.endDate).to.deep.equal(unit.anticipatedEndDate);
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
    it("should provide last unit that's the same as the head", function () {
      expect(chain.lastUnit).to.equal(chain.head);
    });
  });
  describe("Two Units (Sunny Day)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      unitA = new TaskUnit([], firstDate, secondDate);
      unitB = new TaskUnit([unitA], secondDate, thirdDate);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.deep.equal(unitB.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function () {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Three Units (Sunny Day)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      unitA = new TaskUnit([], firstDate, secondDate);
      unitB = new TaskUnit([unitA], secondDate, thirdDate);
      unitC = new TaskUnit([unitB], thirdDate, fourthDate);
      chain = new IsolatedDependencyChain([unitC, unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitC.presenceTime + unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.deep.equal(unitC.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitC.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function () {
      expect(chain.head).to.equal(unitC);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the third unit", function () {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (External Dependency)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      unitA = new TaskUnit([], firstDate, secondDate);
      unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      unitC = new TaskUnit([unitA], thirdDate, fourthDate);
      unitD = new TaskUnit([unitB, unitC], fifthDate, sixthDate);
      unitE = new TaskUnit([unitD], seventhDate, eighthDate);
      unitF = new TaskUnit([unitE], eighthDate, ninthDate);
      chain = new IsolatedDependencyChain([unitF, unitE]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitE.presenceTime + unitF.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unitE.anticipatedStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.deep.equal(unitF.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitF.anticipatedEndDate.getTime() -
        unitE.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function () {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function () {
      expect(chain.head).to.equal(unitF);
    });
    it("should have D as external dependency", function () {
      expect([...chain.getExternalDependencies()]).to.have.members([unitD]);
    });
    it("should provide last unit that's the second unit", function () {
      expect(chain.lastUnit).to.equal(unitE);
    });
    it("should have 2 paths to A", function () {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitA]))
      ).to.equal(2);
    });
    it("should have 1 path to B", function () {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitB]))
      ).to.equal(1);
    });
    it("should have 1 path to C", function () {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitC]))
      ).to.equal(1);
    });
    it("should have 1 path to D", function () {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitD]))
      ).to.equal(1);
    });
    it("should not be directly dependent on A", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitA])))
        .to.be.false;
    });
    it("should not be directly dependent on B", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitB])))
        .to.be.false;
    });
    it("should not be directly dependent on C", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitC])))
        .to.be.false;
    });
    it("should be directly dependent on D", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitD])))
        .to.be.true;
    });
    it("should not be directly dependent on E", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitE])))
        .to.be.false;
    });
    it("should not be directly dependent on F", function () {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitF])))
        .to.be.false;
    });
    it("should have attachment to dependencies of 2", function () {
      expect(chain.attachmentToDependencies).to.equal(2);
    });
  });
  describe("Two Units (With Gap)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      unitA = new TaskUnit([], firstDate, secondDate);
      unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function () {
      expect(chain.endDate).to.deep.equal(unitB.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 2/3 (1000 ms gap between both 1000 ms chunks of presence)", function () {
      expect(chain.visualDensity).to.equal(2 / 3);
    });
    it("should have head property set to its first unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function () {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (With Overlap)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function () {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit([], firstDate, thirdDate);
      unitB = new TaskUnit([unitA], secondDate, fourthDate);
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function () {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function () {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same apparent end date as head unit", function () {
      expect(chain.endDate).to.deep.equal(unitB.apparentEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function () {
      const expectedTimeSpan =
        unitB.apparentEndDate.getTime() - unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 5/4 (overlap)", function () {
      expect(chain.visualDensity).to.equal(5 / 4);
    });
    it("should have head property set to its unit", function () {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function () {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function () {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (Out of Order)", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    before(function () {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit([], firstDate, thirdDate);
      unitB = new TaskUnit([unitA], secondDate, fourthDate);
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
    before(function () {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit([], firstDate, thirdDate);
      unitB = new TaskUnit([], secondDate, fourthDate);
    });
    it("should throw DependencyOrderError", function () {
      expect(() => new IsolatedDependencyChain([unitB, unitA])).to.throw(
        DependencyOrderError
      );
    });
  });
});
