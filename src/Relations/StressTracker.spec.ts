import { expect } from "chai";
import * as Sinon from "sinon";
import { DependencyOrderError } from "../Error";
import { assertIsObject } from "../typePredicates";
import { InterconnectionStrengthMapping } from "../types";
import { Matrix } from "../Utility";
import ChainPath from "./ChainPath";
import { default as IsolatedDependencyChain } from "./IsolatedDependencyChain";
import StressTracker from "./StressTracker";
import { default as TaskUnit } from "./TaskUnit";

describe("StressTracker", function () {
  describe("Simple Paths", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let stressTracker: StressTracker;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      const unit = new TaskUnit([], startDate, endDate);
      const chain = new IsolatedDependencyChain([unit]);
      // make sure paths are in alphabetical order
      const paths = [
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
      ];
      paths.sort((prev, next) => prev.id.localeCompare(next.id));
      const firstPath = paths[0];
      assertIsObject(firstPath);
      const secondPath = paths[1];
      assertIsObject(secondPath);
      const thirdPath = paths[2];
      assertIsObject(thirdPath);
      const fourthPath = paths[3];
      assertIsObject(fourthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 3,
          [pathC.id]: 2,
        },
        [pathB.id]: {
          [pathA.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathD.id]: 2,
        },
        [pathD.id]: {
          [pathB.id]: 4,
          [pathC.id]: 2,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
    });
    it("should have a stress of 5 for A", function () {
      expect(stressTracker.getCurrentStressOfPath(pathA)).to.equal(5);
    });
    it("should have a stress of 1 for B", function () {
      expect(stressTracker.getCurrentStressOfPath(pathB)).to.equal(1);
    });
    it("should have a stress of 0 for C", function () {
      expect(stressTracker.getCurrentStressOfPath(pathC)).to.equal(0);
    });
    it("should have a stress of -6 for D", function () {
      expect(stressTracker.getCurrentStressOfPath(pathD)).to.equal(-6);
    });
  });
  describe("Simple Paths Get Stress Of Possible Position Swap", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let stressTracker: StressTracker;
    let possibleStressMatrix: Matrix;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      const unit = new TaskUnit([], startDate, endDate);
      const chain = new IsolatedDependencyChain([unit]);
      // make sure paths are in alphabetical order
      const paths = [
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
      ];
      paths.sort((prev, next) => prev.id.localeCompare(next.id));
      const firstPath = paths[0];
      assertIsObject(firstPath);
      const secondPath = paths[1];
      assertIsObject(secondPath);
      const thirdPath = paths[2];
      assertIsObject(thirdPath);
      const fourthPath = paths[3];
      assertIsObject(fourthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 3,
          [pathC.id]: 2,
        },
        [pathB.id]: {
          [pathA.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathD.id]: 2,
        },
        [pathD.id]: {
          [pathB.id]: 4,
          [pathC.id]: 2,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      possibleStressMatrix = stressTracker.getStressMatrixUsingPositions(
        stressTracker.getUpdatedRelativePositionsMatrixFromSwitchingPositionsOfPaths(
          pathD,
          pathB
        )
      );
    });
    it("should have a possible stress of 5 for A considering swap", function () {
      expect(
        stressTracker.getStressOfPathWithStressMatrix(
          pathA,
          possibleStressMatrix
        )
      ).to.equal(5);
    });
    it("should have a possible stress of -7 for B considering swap", function () {
      expect(
        stressTracker.getStressOfPathWithStressMatrix(
          pathB,
          possibleStressMatrix
        )
      ).to.equal(-7);
    });
    it("should have a possible stress of -4 for C considering swap", function () {
      expect(
        stressTracker.getStressOfPathWithStressMatrix(
          pathC,
          possibleStressMatrix
        )
      ).to.equal(-4);
    });
    it("should have a possible stress of 6 for D considering swap", function () {
      expect(
        stressTracker.getStressOfPathWithStressMatrix(
          pathD,
          possibleStressMatrix
        )
      ).to.equal(6);
    });
    it("should still have an actual stress of 5 for A", function () {
      expect(stressTracker.getCurrentStressOfPath(pathA)).to.equal(5);
    });
    it("should still have an actual stress of 1 for B", function () {
      expect(stressTracker.getCurrentStressOfPath(pathB)).to.equal(1);
    });
    it("should still have an actual stress of 0 for C", function () {
      expect(stressTracker.getCurrentStressOfPath(pathC)).to.equal(0);
    });
    it("should still have an actual stress of -6 for D", function () {
      expect(stressTracker.getCurrentStressOfPath(pathD)).to.equal(-6);
    });
  });
  describe("Simple Paths After Swap", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let stressTracker: StressTracker;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      const unit = new TaskUnit([], startDate, endDate);
      const chain = new IsolatedDependencyChain([unit]);
      // make sure paths are in alphabetical order
      const paths = [
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
        new ChainPath([chain]),
      ];
      paths.sort((prev, next) => prev.id.localeCompare(next.id));
      const firstPath = paths[0];
      assertIsObject(firstPath);
      const secondPath = paths[1];
      assertIsObject(secondPath);
      const thirdPath = paths[2];
      assertIsObject(thirdPath);
      const fourthPath = paths[3];
      assertIsObject(fourthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 3,
          [pathC.id]: 2,
        },
        [pathB.id]: {
          [pathA.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathD.id]: 2,
        },
        [pathD.id]: {
          [pathB.id]: 4,
          [pathC.id]: 2,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      stressTracker.swapPositionsOfPaths(pathD, pathB);
    });
    it("should have a stress of 5 for A", function () {
      expect(stressTracker.getCurrentStressOfPath(pathA)).to.equal(5);
    });
    it("should have a stress of -7 for B", function () {
      expect(stressTracker.getCurrentStressOfPath(pathB)).to.equal(-7);
    });
    it("should have a stress of -4 for C", function () {
      expect(stressTracker.getCurrentStressOfPath(pathC)).to.equal(-4);
    });
    it("should have a stress of 6 for D", function () {
      expect(stressTracker.getCurrentStressOfPath(pathD)).to.equal(6);
    });
  });
});
