import { expect } from "chai";
import { DependencyOrderError } from "../Error";
import ChainPath from "./ChainPath";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import TaskUnit from "./TaskUnit";

const now = new Date();
const firstDate = new Date(now.getTime() + 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);

describe("ChainPath", function (): void {
  describe("No Chains", function (): void {
    it("should throw RangeError", function (): void {
      expect(() => new ChainPath([])).to.throw(RangeError);
    });
  });
  describe("Multiple Chains", function (): void {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let path: ChainPath;
    before(function (): void {
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
      path = new ChainPath([chainB, chainA]);
    });
    it("should have visual density of 2/3", function (): void {
      expect(path.visualDensity).to.equal(2 / 3);
    });
    it("should have end date of head unit", function (): void {
      expect(path.endDate).to.equal(chainB.endDate);
    });
    it("should have anticipated start date of last unit", function (): void {
      expect(path.anticipatedStartDate).to.equal(chainA.anticipatedStartDate);
    });
    it("should have timespan of time between last unit anticipated start date and head end date", function (): void {
      expect(path.timeSpan).to.equal(
        chainB.endDate.getTime() - chainA.anticipatedStartDate.getTime()
      );
    });
    it("should have presence time of both chains combined", function (): void {
      expect(path.presenceTime).to.equal(
        chainA.presenceTime + chainB.presenceTime
      );
    });
    it("should have correct head", function (): void {
      expect(path.head).to.equal(chainB);
    });
  });
  describe("Chains Not Connected", function (): void {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    before(function (): void {
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [], secondDate, thirdDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
    });
    it("should throw DependencyOrderError when disconnected chains are provided", function (): void {
      expect(() => new ChainPath([chainA, chainB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Chains Out Of Order", function (): void {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    before(function (): void {
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [unitA], secondDate, thirdDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
    });
    it("should throw DependencyOrderError when chains are provided out of order", function (): void {
      expect(() => new ChainPath([chainA, chainB])).to.throw(
        DependencyOrderError
      );
    });
  });
});
