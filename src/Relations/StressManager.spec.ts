import { expect } from "chai";
import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { assertIsObject } from "../typePredicates";
import { InterconnectionStrengthMapping } from "../types";
import ChainPath from "./ChainPath";
import { default as IsolatedDependencyChain } from "./IsolatedDependencyChain";
import StressManager from "./StressManager";
import StressTracker from "./StressTracker";
import { default as TaskUnit } from "./TaskUnit";

describe("StressManager", function () {
  describe("Many Paths", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let stressTracker: StressTracker;
    let stressManager: StressManager;
    let originalImbalance: number;
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      const sixthPath = paths[5];
      assertIsObject(sixthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      pathF = sixthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathC.id]: 2,
          [pathD.id]: 1,
          [pathF.id]: 4,
        },
        [pathB.id]: {
          [pathC.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathB.id]: 3,
          [pathE.id]: 3,
          [pathF.id]: 1,
        },
        [pathD.id]: {
          [pathA.id]: 1,
          [pathB.id]: 4,
          [pathE.id]: 3,
        },
        [pathE.id]: {
          [pathC.id]: 3,
          [pathD.id]: 3,
          [pathF.id]: 1,
        },
        [pathF.id]: {
          [pathA.id]: 4,
          [pathC.id]: 1,
          [pathE.id]: 1,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      originalImbalance = stressTracker
        .getCurrentStressOfPaths()
        .reduce((acc, curr) => acc + Math.abs(curr), 0);
      stressManager = new StressManager(stressTracker);
    });
    it("should have less imbalance after sorting", function () {
      const postSortImbalance =
        stressManager.getCurrentImbalanceOfStressLevels();
      expect(postSortImbalance).to.be.lessThan(originalImbalance);
    });
  });
  describe("Many More Paths", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let stressTracker: StressTracker;
    let stressManager: StressManager;
    let originalImbalance: number;
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      const sixthPath = paths[5];
      assertIsObject(sixthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      pathF = sixthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 7,
          [pathC.id]: 2,
          [pathD.id]: 1,
          [pathF.id]: 4,
        },
        [pathB.id]: {
          [pathA.id]: 7,
          [pathC.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathB.id]: 3,
          [pathE.id]: 3,
          [pathF.id]: 1,
        },
        [pathD.id]: {
          [pathA.id]: 1,
          [pathB.id]: 4,
          [pathE.id]: 3,
        },
        [pathE.id]: {
          [pathC.id]: 3,
          [pathD.id]: 3,
          [pathF.id]: 1,
        },
        [pathF.id]: {
          [pathA.id]: 4,
          [pathC.id]: 1,
          [pathE.id]: 1,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      originalImbalance = stressTracker
        .getCurrentStressOfPaths()
        .reduce((acc, curr) => acc + Math.abs(curr), 0);
      stressManager = new StressManager(stressTracker);
    });
    it("should have less imbalance after sorting", function () {
      const postSortImbalance =
        stressManager.getCurrentImbalanceOfStressLevels();
      expect(postSortImbalance).to.be.lessThan(originalImbalance);
    });
  });
  describe("Many Paths Best Move Is To Top", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let stressTracker: StressTracker;
    let stressManager: StressManager;
    let originalImbalance: number;
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 2,
          [pathE.id]: 1,
        },
        [pathB.id]: {
          [pathA.id]: 2,
          [pathC.id]: 2,
        },
        [pathC.id]: {
          [pathB.id]: 2,
          [pathD.id]: 2,
        },
        [pathD.id]: {
          [pathC.id]: 2,
        },
        [pathE.id]: {
          [pathA.id]: 1,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      originalImbalance = stressTracker
        .getCurrentStressOfPaths()
        .reduce((acc, curr) => acc + Math.abs(curr), 0);
      stressManager = new StressManager(stressTracker);
    });
    it("should have less imbalance after sorting", function () {
      const postSortImbalance =
        stressManager.getCurrentImbalanceOfStressLevels();
      expect(postSortImbalance).to.be.lessThan(originalImbalance);
    });
    it("should be sorted E, A, B, C, then D", function () {
      expect(stressManager.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathB.id,
        pathC.id,
        pathD.id,
      ]);
    });
  });
  describe("Many Paths Best Move Is Below", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let stressTracker: StressTracker;
    let stressManager: StressManager;
    let originalImbalance: number;
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathB.id]: 2,
        },
        [pathB.id]: {
          [pathA.id]: 2,
          [pathC.id]: 2,
        },
        [pathC.id]: {
          [pathB.id]: 2,
          [pathD.id]: 3,
          [pathE.id]: 1,
        },
        [pathD.id]: {
          [pathC.id]: 3,
        },
        [pathE.id]: {
          [pathC.id]: 1,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
      originalImbalance = stressTracker
        .getCurrentStressOfPaths()
        .reduce((acc, curr) => acc + Math.abs(curr), 0);
      stressManager = new StressManager(stressTracker);
    });
    it("should have less imbalance after sorting", function () {
      const postSortImbalance =
        stressManager.getCurrentImbalanceOfStressLevels();
      expect(postSortImbalance).to.be.lessThan(originalImbalance);
    });
    it("should be sorted A, B, E, C, then D", function () {
      expect(stressManager.getRankings()).to.deep.equal([
        pathA.id,
        pathB.id,
        pathE.id,
        pathC.id,
        pathD.id,
      ]);
    });
  });
  describe("Busted Moving During Organize", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let stressTracker: StressTracker;
    let sandbox: SinonSandbox;
    let moveBelowStub: SinonStub;
    before(function () {
      sandbox = createSandbox();
      moveBelowStub = sandbox.stub(
        StressTracker.prototype,
        "movePathBelowPathById"
      );
      moveBelowStub.throws(RangeError);
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      const sixthPath = paths[5];
      assertIsObject(sixthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      pathF = sixthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathC.id]: 2,
          [pathD.id]: 1,
          [pathF.id]: 4,
        },
        [pathB.id]: {
          [pathC.id]: 3,
          [pathD.id]: 4,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathB.id]: 3,
          [pathE.id]: 3,
          [pathF.id]: 1,
        },
        [pathD.id]: {
          [pathA.id]: 1,
          [pathB.id]: 4,
          [pathE.id]: 3,
        },
        [pathE.id]: {
          [pathC.id]: 3,
          [pathD.id]: 3,
          [pathF.id]: 1,
        },
        [pathF.id]: {
          [pathA.id]: 4,
          [pathC.id]: 1,
          [pathE.id]: 1,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
    });
    after(function () {
      sandbox.restore();
    });
    it("should bubble error properly", function () {
      expect(() => new StressManager(stressTracker)).to.throw(RangeError);
    });
  });
  describe("Busted Moving During Scooch", function () {
    let startDate: Date;
    let endDate: Date;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let stressTracker: StressTracker;
    let sandbox: SinonSandbox;
    let swapStub: SinonStub;
    before(function () {
      sandbox = createSandbox();
      swapStub = sandbox.stub(StressTracker.prototype, "swapPathsById");
      swapStub.throws(RangeError);
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
      const fifthPath = paths[4];
      assertIsObject(fifthPath);
      pathA = firstPath;
      pathB = secondPath;
      pathC = thirdPath;
      pathD = fourthPath;
      pathE = fifthPath;
      const strengthMapping: InterconnectionStrengthMapping = {
        [pathA.id]: {
          [pathC.id]: 2,
        },
        [pathB.id]: {
          [pathD.id]: 1,
        },
        [pathC.id]: {
          [pathA.id]: 2,
          [pathD.id]: 2,
        },
        [pathD.id]: {
          [pathB.id]: 1,
          [pathC.id]: 2,
          [pathE.id]: 3,
        },
        [pathE.id]: {
          [pathD.id]: 2,
        },
      };
      stressTracker = new StressTracker(strengthMapping);
    });
    after(function () {
      sandbox.restore();
    });
    it("should bubble error properly", function () {
      expect(() => new StressManager(stressTracker)).to.throw(RangeError);
    });
  });
});
