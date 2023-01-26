import { expect } from "chai";
import { DependencyOrderError } from "../Error";
import ChainPath from "./ChainPath";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import TaskUnit from "./TaskUnit";

const firstDate = new Date();
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);

describe("ChainPath", function () {
  describe("No Chains", function () {
    it("should throw RangeError", function () {
      expect(() => new ChainPath([])).to.throw(RangeError);
    });
  });
  describe("Multiple Chains", function () {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let path: ChainPath;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate);
      const unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
      path = new ChainPath([chainB, chainA]);
    });
    it("should have visual density of 2/3", function () {
      expect(path.visualDensity).to.equal(2 / 3);
    });
    it("should have end date of head unit", function () {
      expect(path.endDate).to.equal(chainB.endDate);
    });
    it("should have anticipated start date of last unit", function () {
      expect(path.anticipatedStartDate).to.equal(chainA.anticipatedStartDate);
    });
    it("should have timespan of time between last unit anticipated start date and head end date", function () {
      expect(path.timeSpan).to.equal(
        chainB.endDate.getTime() - chainA.anticipatedStartDate.getTime()
      );
    });
    it("should have presence time of both chains combined", function () {
      expect(path.presenceTime).to.equal(
        chainA.presenceTime + chainB.presenceTime
      );
    });
    it("should have correct head", function () {
      expect(path.head).to.equal(chainB);
    });
  });
  describe("Chains Not Connected", function () {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate);
      const unitB = new TaskUnit([], secondDate, thirdDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
    });
    it("should throw DependencyOrderError when disconnected chains are provided", function () {
      expect(() => new ChainPath([chainA, chainB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Chains Out Of Order", function () {
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate);
      const unitB = new TaskUnit([unitA], secondDate, thirdDate);
      chainA = new IsolatedDependencyChain([unitA]);
      chainB = new IsolatedDependencyChain([unitB]);
    });
    it("should throw DependencyOrderError when chains are provided out of order", function () {
      expect(() => new ChainPath([chainA, chainB])).to.throw(
        DependencyOrderError
      );
    });
  });
});
