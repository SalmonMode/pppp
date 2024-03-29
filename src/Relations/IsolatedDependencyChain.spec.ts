import { DependencyOrderError } from "@errors";
import TaskUnit from "@TaskUnit";
import { expect } from "chai";
import IsolatedDependencyChain from "./IsolatedDependencyChain";

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

describe("IsolatedDependencyChain", function (): void {
  describe("No Units", function (): void {
    it("should throw RangeError", function (): void {
      expect(() => new IsolatedDependencyChain([])).to.throw(RangeError);
    });
  });
  describe("One Unit", function (): void {
    let unit: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      unit = new TaskUnit({
        now,
        name: "unit",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      chain = new IsolatedDependencyChain([unit]);
    });
    it("should have same presence as its unit", function (): void {
      expect(chain.presenceTime).to.equal(unit.presenceTime);
    });
    it("should have same anticipated start date as its unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unit.anticipatedStartDate);
    });
    it("should have same end date as its unit", function (): void {
      expect(chain.endDate).to.deep.equal(unit.anticipatedEndDate);
    });
    it("should have same timespan as its unit presence time", function (): void {
      expect(chain.timeSpan).to.equal(unit.presenceTime);
    });
    it("should have visual density of 1", function (): void {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its unit", function (): void {
      expect(chain.head).to.equal(unit);
    });
    it("should have no external dependencies", function (): void {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the same as the head", function (): void {
      expect(chain.lastUnit).to.equal(chain.head);
    });
  });
  describe("Two Units (Sunny Day)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function (): void {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function (): void {
      expect(chain.endDate).to.deep.equal(unitB.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function (): void {
      const expectedTimeSpan =
        unitB.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function (): void {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function (): void {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function (): void {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function (): void {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Three Units (Sunny Day)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chain = new IsolatedDependencyChain([unitC, unitB, unitA]);
    });
    it("should have same presence as its units", function (): void {
      expect(chain.presenceTime).to.equal(
        unitC.presenceTime + unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function (): void {
      expect(chain.endDate).to.deep.equal(unitC.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function (): void {
      const expectedTimeSpan =
        unitC.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function (): void {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function (): void {
      expect(chain.head).to.equal(unitC);
    });
    it("should have no external dependencies", function (): void {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the third unit", function (): void {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (External Dependency)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: eighthDate,
        anticipatedEndDate: ninthDate,
      });
      chain = new IsolatedDependencyChain([unitF, unitE]);
    });
    it("should have same presence as its units", function (): void {
      expect(chain.presenceTime).to.equal(
        unitE.presenceTime + unitF.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unitE.anticipatedStartDate);
    });
    it("should have same end date as head unit", function (): void {
      expect(chain.endDate).to.deep.equal(unitF.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function (): void {
      const expectedTimeSpan =
        unitF.anticipatedEndDate.getTime() -
        unitE.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 1", function (): void {
      expect(chain.visualDensity).to.equal(1);
    });
    it("should have head property set to its first unit", function (): void {
      expect(chain.head).to.equal(unitF);
    });
    it("should have D as external dependency", function (): void {
      expect([...chain.getExternalDependencies()]).to.have.members([unitD]);
    });
    it("should provide last unit that's the second unit", function (): void {
      expect(chain.lastUnit).to.equal(unitE);
    });
    it("should have 2 paths to A", function (): void {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitA]))
      ).to.equal(2);
    });
    it("should have 1 path to B", function (): void {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitB]))
      ).to.equal(1);
    });
    it("should have 1 path to C", function (): void {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitC]))
      ).to.equal(1);
    });
    it("should have 1 path to D", function (): void {
      expect(
        chain.getNumberOfPathsToDependency(new IsolatedDependencyChain([unitD]))
      ).to.equal(1);
    });
    it("should not be directly dependent on A", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitA])))
        .to.be.false;
    });
    it("should not be directly dependent on B", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitB])))
        .to.be.false;
    });
    it("should not be directly dependent on C", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitC])))
        .to.be.false;
    });
    it("should be directly dependent on D", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitD])))
        .to.be.true;
    });
    it("should not be directly dependent on E", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitE])))
        .to.be.false;
    });
    it("should not be directly dependent on F", function (): void {
      expect(chain.isDirectlyDependentOn(new IsolatedDependencyChain([unitF])))
        .to.be.false;
    });
    it("should have attachment to dependencies of 2", function (): void {
      expect(chain.attachmentToDependencies).to.equal(2);
    });
  });
  describe("Two Units (With Gap)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function (): void {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same end date as head unit", function (): void {
      expect(chain.endDate).to.deep.equal(unitB.anticipatedEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function (): void {
      const expectedTimeSpan =
        unitB.anticipatedEndDate.getTime() -
        unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 2/3 (1000 ms gap between both 1000 ms chunks of presence)", function (): void {
      expect(chain.visualDensity).to.equal(2 / 3);
    });
    it("should have head property set to its first unit", function (): void {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function (): void {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function (): void {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (With Overlap)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chain: IsolatedDependencyChain;
    before(function (): void {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: thirdDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: fourthDate,
      });
      chain = new IsolatedDependencyChain([unitB, unitA]);
    });
    it("should have same presence as its units", function (): void {
      expect(chain.presenceTime).to.equal(
        unitB.presenceTime + unitA.presenceTime
      );
    });
    it("should have same anticipated start date as its prior unit", function (): void {
      expect(chain.anticipatedStartDate).to.equal(unitA.anticipatedStartDate);
    });
    it("should have same apparent end date as head unit", function (): void {
      expect(chain.endDate).to.deep.equal(unitB.apparentEndDate);
    });
    it("should have timespan from start of prior unit to end of later unit", function (): void {
      const expectedTimeSpan =
        unitB.apparentEndDate.getTime() - unitA.anticipatedStartDate.getTime();
      expect(chain.timeSpan).to.equal(expectedTimeSpan);
    });
    it("should have visual density of 5/4 (overlap)", function (): void {
      expect(chain.visualDensity).to.equal(5 / 4);
    });
    it("should have head property set to its unit", function (): void {
      expect(chain.head).to.equal(unitB);
    });
    it("should have no external dependencies", function (): void {
      expect(chain.getExternalDependencies()).to.be.empty;
    });
    it("should provide last unit that's the second unit", function (): void {
      expect(chain.lastUnit).to.equal(unitA);
    });
  });
  describe("Two Units (Out of Order)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    before(function (): void {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: thirdDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: fourthDate,
      });
    });
    it("should throw DependencyOrderError", function (): void {
      expect(() => new IsolatedDependencyChain([unitA, unitB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Two Units (No Dependency)", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    before(function (): void {
      // Pretending A should've only taken 1000 ms, but actually took 2000
      // Even though B took 1000 ms once started, we're pretending it got delayed by 1000 ms because of A.
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: thirdDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: secondDate,
        anticipatedEndDate: fourthDate,
      });
    });
    it("should throw DependencyOrderError", function (): void {
      expect(() => new IsolatedDependencyChain([unitB, unitA])).to.throw(
        DependencyOrderError
      );
    });
  });
});
