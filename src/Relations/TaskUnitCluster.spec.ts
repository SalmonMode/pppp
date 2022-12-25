import { expect } from "chai";
import {
  DependencyOrderError,
  DisjointedUnitsError,
  NoSuchChainError,
} from "../Error";
import { assertIsObject } from "../typePredicates";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import { default as TaskUnit } from "./TaskUnit";
import { default as TaskUnitCluster } from "./TaskUnitCluster";

describe("TaskUnitCluster", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new TaskUnitCluster([])).to.throw(RangeError);
    });
  });
  describe("Disjointed Units", function () {
    it("should throw DisjointedUnitsError", function () {
      expect(
        () =>
          new TaskUnitCluster([
            new TaskUnit([], new Date(), new Date()),
            new TaskUnit([], new Date(), new Date()),
          ])
      ).to.throw(DisjointedUnitsError);
    });
  });
});
