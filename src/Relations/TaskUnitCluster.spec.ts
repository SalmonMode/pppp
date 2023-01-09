import { expect } from "chai";
import { DisjointedUnitsError, NoSuchChainPathError } from "../Error";
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
  // describe("Many Paths Strength Map Predicting Swap", function () {
  //   let startDate: Date;
  //   let endDate: Date;
  //   let pathA: ChainPath;
  //   let pathB: ChainPath;
  //   let pathC: ChainPath;
  //   let pathD: ChainPath;
  //   let pathE: ChainPath;
  //   let pathF: ChainPath;
  //   let expectedPathAPostSwapStress: number;
  //   let expectedPathDPostSwapStress: number;
  //   let stressTracker: StressTracker;
  //   before(function () {
  //     startDate = new Date();
  //     endDate = new Date(startDate.getTime() + 1000);
  //     const unit = new TaskUnit([], startDate, endDate);
  //     const chain = new IsolatedDependencyChain([unit]);
  //     // make sure paths are in alphabetical order
  //     const paths = [
  //       new ChainPath([chain]),
  //       new ChainPath([chain]),
  //       new ChainPath([chain]),
  //       new ChainPath([chain]),
  //       new ChainPath([chain]),
  //       new ChainPath([chain]),
  //     ];
  //     paths.sort((prev, next) => prev.id.localeCompare(next.id));
  //     const firstPath = paths[0];
  //     assertIsObject(firstPath);
  //     const secondPath = paths[1];
  //     assertIsObject(secondPath);
  //     const thirdPath = paths[2];
  //     assertIsObject(thirdPath);
  //     const fourthPath = paths[3];
  //     assertIsObject(fourthPath);
  //     const fifthPath = paths[4];
  //     assertIsObject(fifthPath);
  //     const sixthPath = paths[5];
  //     assertIsObject(sixthPath);
  //     pathA = firstPath;
  //     pathB = secondPath;
  //     pathC = thirdPath;
  //     pathD = fourthPath;
  //     pathE = fifthPath;
  //     pathF = sixthPath;
  //     const strengthMapping: InterconnectionStrengthMapping = {
  //       [pathA.id]: {
  //         [pathC.id]: 2,
  //         [pathD.id]: 1,
  //         [pathF.id]: 4,
  //       },
  //       [pathB.id]: {
  //         [pathC.id]: 3,
  //         [pathD.id]: 4,
  //       },
  //       [pathC.id]: {
  //         [pathA.id]: 2,
  //         [pathB.id]: 3,
  //         [pathE.id]: 3,
  //         [pathF.id]: 1,
  //       },
  //       [pathD.id]: {
  //         [pathA.id]: 1,
  //         [pathB.id]: 4,
  //         [pathE.id]: 3,
  //       },
  //       [pathE.id]: {
  //         [pathC.id]: 3,
  //         [pathD.id]: 3,
  //         [pathF.id]: 1,
  //       },
  //       [pathF.id]: {
  //         [pathA.id]: 4,
  //         [pathC.id]: 1,
  //         [pathE.id]: 1,
  //       },
  //     };
  //     stressTracker = new StressTracker(strengthMapping);
  //     expectedPathAPostSwapStress =
  //       stressTracker.getStressOfPathIfSwappedWithPath(pathA, pathD);
  //     expectedPathDPostSwapStress =
  //       stressTracker.getStressOfPathIfSwappedWithPath(pathD, pathA);
  //     stressTracker.swapPositionsOfPaths(pathA, pathD);
  //   });
  //   it("should predicted pathA stress correctly", function () {
  //     expect(stressTracker.getCurrentStressOfPath(pathA))
  //       .to.equal(expectedPathAPostSwapStress)
  //       .and.to.equal(1);
  //   });
  //   it("should predicted pathD stress correctly", function () {
  //     expect(stressTracker.getCurrentStressOfPath(pathD))
  //       .to.equal(expectedPathDPostSwapStress)
  //       .and.to.equal(8);
  //   });
  //   it("should throw NoSuchChainPathError when getting path of unrecognized chain", function () {
  //     expect(() =>
  //       cluster.getPathOfChain(
  //         new IsolatedDependencyChain([
  //           new TaskUnit([], new Date(), new Date()),
  //         ])
  //       )
  //     ).to.throw(NoSuchChainPathError);
  //   });
  // });
  describe("Simple Cluster", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         B╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   A┗━━━┛╲       ╱┗━━━┛D
     *          ╲┏━━━┓╱
     *          C┗━━━┛
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    let cluster: TaskUnitCluster;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(startDateB.getTime());
      endDateC = new Date(endDateB.getTime());
      startDateD = new Date(endDateC.getTime());
      endDateD = new Date(startDateD.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitA], startDateC, endDateC);
      unitD = new TaskUnit([unitB, unitC], startDateD, endDateD);
      unitE = new TaskUnit([], startDateC, endDateC);
      cluster = new TaskUnitCluster([unitD]);
    });
    it("should have 2 paths", function () {
      expect(cluster.paths.length).to.equal(2);
    });
  });
  describe("Simple Conflict Cluster", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         B╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   A┗━━━┛╲       ╱┗━━━┛C
     *          ╲┏━━━┓╱
     *         D╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   E┗━━━┛╲       ╱┗━━━┛F
     *          ╲┏━━━┓╱
     *          G┗━━━┛
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitE = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitA, unitE], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitE], secondStartDate, secondEndDate);

      unitC = new TaskUnit([unitB, unitD], thirdStartDate, thirdEndDate);
      unitF = new TaskUnit([unitD, unitG], thirdStartDate, thirdEndDate);
      cluster = new TaskUnitCluster([unitC, unitF]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
    });
    it("should have 3 paths", function () {
      expect(cluster.paths.length).to.equal(3);
    });
    it("should have path with only D", function () {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([chainD]);
    });
    it("should have path with only A, B, and C", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainC,
      ]);
    });
    it("should have path with only E, G, and F", function () {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([
        chainE,
        chainG,
        chainF,
      ]);
    });
    it("should throw NoSuchChainPathError when getting path of unrecognized chain", function () {
      expect(() =>
        cluster.getPathOfChain(
          new IsolatedDependencyChain([
            new TaskUnit([], new Date(), new Date()),
          ])
        )
      ).to.throw(NoSuchChainPathError);
    });
  });
  describe("Unavoidable Unfamiliarity Cluster", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         D╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   A┗━━━┛╲       ╱┗━━━┛H
     *          ╲┏━━━┓╱
     *         E╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   B┗━━━┛╲       ╱┗━━━┛I
     *          ╲┏━━━┓╱
     *         F╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   C┗━━━┛╲       ╱┗━━━┛J
     *          ╲┏━━━┓╱
     *          G┗━━━┛
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitE = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate);
      unitI = new TaskUnit([unitE, unitF], thirdStartDate, thirdEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);
      cluster = new TaskUnitCluster([unitH, unitI, unitJ]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
    });
    it("should have 4 paths", function () {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only A, D, and H", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only C, G, and J", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
    it("should have path with only B, E, and I", function () {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainI,
      ]);
    });
    it("should have path with only F", function () {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
  });
  describe("More Complex Conflict Cluster", function () {
    /**
     * ```text
     *                 ┏━━━┓
     *               C╱┗━━━┛╲
     *          ┏━━━┓╱       ╲┏━━━┓
     *        B╱┗━━━┛╲       ╱┗━━━┛╲D
     *   ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *  A┗━━━┛╲      E╱┗━━━┛╲       ╱┗━━━┛F
     *         ╲┏━━━┓╱       ╲┏━━━┓╱
     *         G┗━━━┛╲       ╱┗━━━┛H
     *                ╲┏━━━┓╱
     *                I┗━━━┛
     *
     *                   |
     *                   V
     *
     *                 ┏━━━┓
     *               C╱┗━━━┛╲
     *   ┏━━━┓__┏━━━┓╱_┏━━━┓_╲┏━━━┓__┏━━━┓
     *  A┗━━━┛╲B┗━━━┛ E┗━━━┛  ┗━━━┛D╱┗━━━┛F
     *         ╲┏━━━┓__┏━━━┓__┏━━━┓╱
     *         G┗━━━┛ I┗━━━┛  ┗━━━┛H
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
    let unitI: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitB, unitG], thirdStartDate, thirdEndDate);
      unitI = new TaskUnit([unitG], thirdStartDate, thirdEndDate);

      unitD = new TaskUnit([unitC, unitE], fourthStartDate, fourthEndDate);
      unitH = new TaskUnit([unitE, unitI], fourthStartDate, fourthEndDate);

      unitF = new TaskUnit([unitD, unitH], fifthStartDate, fifthEndDate);

      cluster = new TaskUnitCluster([unitF]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
    });
    it("should have 3 paths", function () {
      expect(cluster.paths.length).to.equal(3);
    });
    it("should have chains A, B, E, D, and F in the same path", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainE,
        chainD,
        chainF,
      ]);
    });
    it("should have chains G, H, and I in the same path", function () {
      expect(cluster.getPathOfChain(chainG).chains).to.have.members([
        chainG,
        chainH,
        chainI,
      ]);
    });
    it("should have chain C in its own path", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([chainC]);
    });
  });
  describe("Competing Heads", function () {
    /**
     * ```text
     *                        ┏━━━┓
     *                       ╱┗━━━┛╲J
     *                 ┏━━━┓╱       ╲┏━━━┓
     *               F╱┗━━━┛╲       ╱┗━━━┛╲O
     *          ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *        C╱┗━━━┛╲       ╱┗━━━┛╲K      ╱┗━━━┛╲S
     *   ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *  A┗━━━┛╲      G╱┗━━━┛╲       ╱┗━━━┛╲P      ╱┗━━━┛W
     *         ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱
     *        D╱┗━━━┛╲       ╱┗━━━┛╲L      ╱┗━━━┛╲T
     *   ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *  B┗━━━┛╲      H╱┗━━━┛╲       ╱┗━━━┛╲Q      ╱┗━━━┛X
     *         ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱
     *         E┗━━━┛╲       ╱┗━━━┛╲M      ╱┗━━━┛╲U
     *                ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *                I┗━━━┛╲       ╱┗━━━┛╲R      ╱┗━━━┛Y
     *                       ╲┏━━━┓╱       ╲┏━━━┓╱
     *                        ┗━━━┛N        ┗━━━┛V
     *
     *                             |
     *                             V
     *
     *                          ┏━━━┓
     *                        J╱┗━━━┛╲
     *                        ╱       ╲
     *  ┏━━━┓___┏━━━┓___┏━━━┓╱__┏━━━┓__╲┏━━━┓___┏━━━┓___┏━━━┓
     * A┗━━━┛╲ C┗━━━┛╲ F┗━━━┛  ╱┗━━━┛╲K ┗━━━┛O ╱┗━━━┛S ╱┗━━━┛W
     *        ╲       ╲       ╱       ╲       ╱       |
     *         ╲┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓╱        |
     *        D╱┗━━━┛╲ G┗━━━┛  ╱┗━━━┛╲L ┗━━━┛╲P       |
     *        |       ╲       ╱       |       |       |
     *        |        ╲┏━━━┓╱        |       |       |
     *        |       H╱┗━━━┛╲        |       |       |
     *        |       ╱       ╲       |       |       |
     *  ┏━━━┓╱__┏━━━┓╱__┏━━━┓__╲┏━━━┓__╲┏━━━┓__╲┏━━━┓╱__┏━━━┓
     * B┗━━━┛  E┗━━━┛  I┗━━━┛╲  ┗━━━┛╲M ┗━━━┛╲Q ┗━━━┛T ╱┗━━━┛X
     *                        |       |       ╲       ╱
     *                        |       |        ╲┏━━━┓╱
     *                        |       |        ╱┗━━━┛╲U
     *                        |       |       ╱       ╲
     *                         ╲┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓
     *                          ┗━━━┛N  ┗━━━┛R  ┗━━━┛V  ┗━━━┛Y
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let unitL: TaskUnit;
    let unitM: TaskUnit;
    let unitN: TaskUnit;
    let unitO: TaskUnit;
    let unitP: TaskUnit;
    let unitQ: TaskUnit;
    let unitR: TaskUnit;
    let unitS: TaskUnit;
    let unitT: TaskUnit;
    let unitU: TaskUnit;
    let unitV: TaskUnit;
    let unitW: TaskUnit;
    let unitX: TaskUnit;
    let unitY: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let chainK: IsolatedDependencyChain;
    let chainL: IsolatedDependencyChain;
    let chainM: IsolatedDependencyChain;
    let chainN: IsolatedDependencyChain;
    let chainO: IsolatedDependencyChain;
    let chainP: IsolatedDependencyChain;
    let chainQ: IsolatedDependencyChain;
    let chainR: IsolatedDependencyChain;
    let chainS: IsolatedDependencyChain;
    let chainT: IsolatedDependencyChain;
    let chainU: IsolatedDependencyChain;
    let chainV: IsolatedDependencyChain;
    let chainW: IsolatedDependencyChain;
    let chainX: IsolatedDependencyChain;
    let chainY: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      const sixthStartDate = new Date(fifthEndDate.getTime() + 1000);
      const sixthEndDate = new Date(sixthStartDate.getTime() + 1000);
      const seventhStartDate = new Date(sixthEndDate.getTime() + 1000);
      const seventhEndDate = new Date(seventhStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      unitB = new TaskUnit([], firstStartDate, firstEndDate, "B");

      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate, "C");
      unitD = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate, "D");
      unitE = new TaskUnit([unitB], secondStartDate, secondEndDate, "E");

      unitF = new TaskUnit([unitC], thirdStartDate, thirdEndDate, "F");
      unitG = new TaskUnit([unitC, unitD], thirdStartDate, thirdEndDate, "G");
      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate, "H");
      unitI = new TaskUnit([unitE], thirdStartDate, thirdEndDate, "I");

      unitJ = new TaskUnit([unitF], fourthStartDate, fourthEndDate, "J");
      unitK = new TaskUnit([unitF, unitG], fourthStartDate, fourthEndDate, "K");
      unitL = new TaskUnit([unitG, unitH], fourthStartDate, fourthEndDate, "L");
      unitM = new TaskUnit([unitH, unitI], fourthStartDate, fourthEndDate, "M");
      unitN = new TaskUnit([unitI], fourthStartDate, fourthEndDate, "N");

      unitO = new TaskUnit([unitJ, unitK], fifthStartDate, fifthEndDate, "O");
      unitP = new TaskUnit([unitK, unitL], fifthStartDate, fifthEndDate, "P");
      unitQ = new TaskUnit([unitL, unitM], fifthStartDate, fifthEndDate, "Q");
      unitR = new TaskUnit([unitM, unitN], fifthStartDate, fifthEndDate, "R");

      unitS = new TaskUnit([unitO, unitP], sixthStartDate, sixthEndDate, "S");
      unitT = new TaskUnit([unitP, unitQ], sixthStartDate, sixthEndDate, "T");
      unitU = new TaskUnit([unitQ, unitR], sixthStartDate, sixthEndDate, "U");
      unitV = new TaskUnit([unitR], sixthStartDate, sixthEndDate, "V");

      unitW = new TaskUnit(
        [unitS, unitT],
        seventhStartDate,
        seventhEndDate,
        "W"
      );
      unitX = new TaskUnit(
        [unitT, unitU],
        seventhStartDate,
        seventhEndDate,
        "X"
      );
      unitY = new TaskUnit(
        [unitU, unitV],
        seventhStartDate,
        seventhEndDate,
        "Y"
      );

      cluster = new TaskUnitCluster([unitW, unitX, unitY]);

      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
      chainK = cluster.chainMap.getChainOfUnit(unitK);
      chainL = cluster.chainMap.getChainOfUnit(unitL);
      chainM = cluster.chainMap.getChainOfUnit(unitM);
      chainN = cluster.chainMap.getChainOfUnit(unitN);
      chainO = cluster.chainMap.getChainOfUnit(unitO);
      chainP = cluster.chainMap.getChainOfUnit(unitP);
      chainQ = cluster.chainMap.getChainOfUnit(unitQ);
      chainR = cluster.chainMap.getChainOfUnit(unitR);
      chainS = cluster.chainMap.getChainOfUnit(unitS);
      chainT = cluster.chainMap.getChainOfUnit(unitT);
      chainU = cluster.chainMap.getChainOfUnit(unitU);
      chainV = cluster.chainMap.getChainOfUnit(unitV);
      chainW = cluster.chainMap.getChainOfUnit(unitW);
      chainX = cluster.chainMap.getChainOfUnit(unitX);
      chainY = cluster.chainMap.getChainOfUnit(unitY);
    });
    it("should have chain A, C, F, K, O, S, and W in the same path", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainC,
        chainF,
        chainK,
        chainO,
        chainS,
        chainW,
      ]);
    });
    it("should have chain H in its own path", function () {
      expect(cluster.getPathOfChain(chainH).chains).to.have.members([chainH]);
    });
    it("should have chain J in its own path", function () {
      expect(cluster.getPathOfChain(chainJ).chains).to.have.members([chainJ]);
    });
    it("should have chains B, E, I, M, Q, T, and X in the same path", function () {
      expect(cluster.getPathOfChain(chainM).chains).to.have.members([
        chainB,
        chainE,
        chainI,
        chainM,
        chainQ,
        chainT,
        chainX,
      ]);
    });
    it("should have chains D, G, L, and P in the same path", function () {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([
        chainD,
        chainG,
        chainL,
        chainP,
      ]);
    });
    it("should have chains N, R, V, and Y in the same path", function () {
      expect(cluster.getPathOfChain(chainN).chains).to.have.members([
        chainN,
        chainR,
        chainV,
        chainY,
      ]);
    });
    it("should have chain U in its own path", function () {
      expect(cluster.getPathOfChain(chainU).chains).to.have.members([chainU]);
    });
  });
  describe("Same Relative Attachment, But Different Strain", function () {
    /**
     * ```text
     *                               ┏━━━┓
     *                              ╱┗━━━┛╲G
     *                        ┏━━━┓╱       ╲┏━━━┓
     *                        ┗━━━┛╲E      ╱┗━━━┛J
     *         ┏━━━┓                ╲┏━━━┓╱
     *       B╱┗━━━┛╲               ╱┗━━━┛╲H
     *  ┏━━━┓╱       ╲┏━━━┓___┏━━━┓╱       ╲┏━━━┓
     * A┗━━━┛╲       ╱┗━━━┛D  ┗━━━┛╲F      ╱┗━━━┛K
     *        ╲┏━━━┓╱               ╲┏━━━┓╱
     *        C┗━━━┛                 ┗━━━┛I
     *
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let chainK: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      const sixthStartDate = new Date(fifthEndDate.getTime() + 1000);
      const sixthEndDate = new Date(sixthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitD = new TaskUnit([unitB, unitC], thirdStartDate, thirdEndDate);

      unitE = new TaskUnit([], fourthStartDate, fourthEndDate);
      unitF = new TaskUnit([unitD], fourthStartDate, fourthEndDate);

      unitG = new TaskUnit([unitE], fifthStartDate, fifthEndDate);
      unitH = new TaskUnit([unitE, unitF], fifthStartDate, fifthEndDate);
      unitI = new TaskUnit([unitF], fifthStartDate, fifthEndDate);

      unitJ = new TaskUnit([unitG, unitH], sixthStartDate, sixthEndDate);
      unitK = new TaskUnit([unitH, unitI], sixthStartDate, sixthEndDate);
      cluster = new TaskUnitCluster([unitJ, unitK]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
      chainK = cluster.chainMap.getChainOfUnit(unitK);
    });
    it("should have 4 paths", function () {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only E, G, and J", function () {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([
        chainE,
        chainG,
        chainJ,
      ]);
    });
    it("should have path with only A, B, D, F, I, and K", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainD,
        chainF,
        chainI,
        chainK,
      ]);
    });
    it("should have path with only C", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([chainC]);
    });
    it("should have path with only H", function () {
      expect(cluster.getPathOfChain(chainH).chains).to.have.members([chainH]);
    });
  });
  describe("Same Relative Attachment, Same Strain, But Different Density (Higher Density First)", function () {
    /**
     * ```text
     *
     *         ┏━━━┓___
     *       D╱┗━━━┛   ╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * A┗━━━┛╲          ╱┗━━━┛H
     *        ╲┏━━━━━━┓╱
     *       E╱┗━━━━━━┛╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * B┗━━━┛╲          ╱┗━━━┛I
     *        ╲┏━━━┓___╱
     *       F╱┗━━━┛   ╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * C┗━━━┛╲          ╱┗━━━┛J
     *        ╲┏━━━┓___╱
     *        G┗━━━┛
     *
     *
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const secondEndDateAlt = new Date(secondStartDate.getTime() + 2000);
      const thirdStartDate = new Date(secondEndDateAlt.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitE = new TaskUnit([unitA, unitB], secondStartDate, secondEndDateAlt);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate);
      unitI = new TaskUnit([unitE, unitF], thirdStartDate, thirdEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);
      cluster = new TaskUnitCluster([unitH, unitI, unitJ]);

      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
    });
    it("should have 4 paths", function () {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only F", function () {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only A, D, and H", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only B, E, and I", function () {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainI,
      ]);
    });
    it("should have path with only C, G, and J", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
  });
  describe("Same Relative Attachment, Same Strain, But Different Density (Higher Density Last)", function () {
    /**
     * ```text
     *
     *         ┏━━━┓___
     *       D╱┗━━━┛   ╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * A┗━━━┛╲          ╱┗━━━┛H
     *        ╲┏━━━┓___╱
     *       E╱┗━━━┛   ╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * B┗━━━┛╲          ╱┗━━━┛I
     *        ╲┏━━━━━━┓╱
     *       F╱┗━━━━━━┛╲
     *  ┏━━━┓╱          ╲┏━━━┓
     * C┗━━━┛╲          ╱┗━━━┛J
     *        ╲┏━━━┓___╱
     *        G┗━━━┛
     *
     *
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const secondEndDateAlt = new Date(secondStartDate.getTime() + 2000);
      const thirdStartDate = new Date(secondEndDateAlt.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitE = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDateAlt);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate);
      unitI = new TaskUnit([unitE, unitF], thirdStartDate, thirdEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);
      cluster = new TaskUnitCluster([unitH, unitI, unitJ]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
    });
    it("should have 4 paths", function () {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only E", function () {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([chainE]);
    });
    it("should have path with only A, D, and H", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only B, F, and I", function () {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainF,
        chainI,
      ]);
    });
    it("should have path with only C, G, and J", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
  });
  describe("Relative Familiarity", function () {
    /**
     * ```text
     *                     ┏━━━┓
     *                    ╱┗━━━┛D
     *             _┏━━━┓╱___┏━━━┓
     *            ╱B┗━━━┛    ┗━━━┛╲G
     *           ╱                 ╲
     *          ╱                   ╲
     *         ╱                     ╲┏━━━┓
     *        ╱                      ╱┗━━━┛I
     *  ┏━━━┓╱        ┏━━━┓         ╱
     * A┗━━━┛╲       ╱┗━━━┛╲E      ╱
     *        ╲┏━━━┓╱       ╲┏━━━┓╱
     *        C┗━━━┛╲       ╱┗━━━┛H
     *               ╲┏━━━┓╱
     *                ┗━━━┛F
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
    let unitI: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      unitF = new TaskUnit([unitC], thirdStartDate, thirdEndDate);

      unitG = new TaskUnit([unitB], fourthStartDate, fourthEndDate);
      unitH = new TaskUnit([unitE, unitF], fourthStartDate, fourthEndDate);

      unitI = new TaskUnit([unitG, unitH], fifthStartDate, fifthEndDate);

      cluster = new TaskUnitCluster([unitD, unitI]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
    });
    it("should have 4 paths", function () {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only A, C, E, H and I", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainC,
        chainE,
        chainH,
        chainI,
      ]);
    });
    it("should have path with only B and G", function () {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainG,
      ]);
    });
    it("should have path with only F", function () {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only D", function () {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([chainD]);
    });
  });
  describe("Relative Unfamiliarity", function () {
    /**
     * ```text
     *                                       ┏━━━┓
     *                                      ╱┗━━━┛F
     *                                     ╱╲┏━━━┓
     *                                    ╱  ┗━━━┛G
     *           ┏━━━┓______________┏━━━┓╱___┏━━━┓
     *         B╱┗━━━┛╲            C┗━━━┛╲  ╱┗━━━┛╲H
     *         ╱       ╲                  ╲╱       ╲
     *        ╱         ╲                 ╱╲        ╲
     *  ┏━━━┓╱___________╲ _________┏━━━┓╱__╲┏━━━┓___╲┏━━━┓
     * A┗━━━┛             ╲        D┗━━━┛╲  ╱┗━━━┛I  ╱┗━━━┛L
     *                     ╲              ╲╱        ╱
     *                      ╲             ╱╲       ╱
     *                       ╲______┏━━━┓╱__╲┏━━━┓╱
     *                             E┗━━━┛╲   ┗━━━┛J
     *                                    ╲
     *                                     ╲
     *                                      ╲┏━━━┓
     *                                       ┗━━━┛K
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let unitL: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainH: IsolatedDependencyChain;
    let chainI: IsolatedDependencyChain;
    let chainJ: IsolatedDependencyChain;
    let chainK: IsolatedDependencyChain;
    let chainL: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit([unitA], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitB], thirdStartDate, thirdEndDate);

      unitF = new TaskUnit([unitC], fourthStartDate, fourthEndDate);
      unitG = new TaskUnit([unitC], fourthStartDate, fourthEndDate);
      unitH = new TaskUnit([unitC, unitD], fourthStartDate, fourthEndDate);
      unitI = new TaskUnit(
        [unitC, unitD, unitE],
        fourthStartDate,
        fourthEndDate
      );
      unitJ = new TaskUnit([unitD, unitE], fourthStartDate, fourthEndDate);
      unitK = new TaskUnit([unitE], fourthStartDate, fourthEndDate);

      unitL = new TaskUnit([unitH, unitI, unitJ], fifthStartDate, fifthEndDate);

      cluster = new TaskUnitCluster([unitF, unitG, unitK, unitL]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
      chainH = cluster.chainMap.getChainOfUnit(unitH);
      chainI = cluster.chainMap.getChainOfUnit(unitI);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
      chainJ = cluster.chainMap.getChainOfUnit(unitJ);
      chainK = cluster.chainMap.getChainOfUnit(unitK);
      chainL = cluster.chainMap.getChainOfUnit(unitL);
    });
    it("should have 6 paths", function () {
      expect(cluster.paths.length).to.equal(6);
    });
    it("should have path with only C and H", function () {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainH,
      ]);
    });
    it("should have path with only A, D, I, and L", function () {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainI,
        chainL,
      ]);
    });
    it("should have path with only B, E, and J", function () {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainJ,
      ]);
    });
    it("should have path with only F", function () {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only G", function () {
      expect(cluster.getPathOfChain(chainG).chains).to.have.members([chainG]);
    });
    it("should have path with only K", function () {
      expect(cluster.getPathOfChain(chainK).chains).to.have.members([chainK]);
    });
  });
});
