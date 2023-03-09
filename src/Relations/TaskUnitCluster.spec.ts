import { NoSuchChainPathError } from "@errors";
import TaskUnit from "@TaskUnit";
import type IIsolatedDependencyChain from "@typing/Relations/IIsolatedDepedencyChain";
import { expect } from "chai";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import TaskUnitCluster from "./TaskUnitCluster";

const now = new Date();
const firstDate = new Date(now.getTime());
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);
const ninthDate = new Date(eighthDate.getTime() + 1000);
const tenthDate = new Date(ninthDate.getTime() + 1000);
const eleventhDate = new Date(tenthDate.getTime() + 1000);
const twelfthDate = new Date(eleventhDate.getTime() + 1000);
const thirteenthDate = new Date(twelfthDate.getTime() + 1000);
const fourteenthDate = new Date(thirteenthDate.getTime() + 1000);

describe("TaskUnitCluster", function (): void {
  describe("No Units", function (): void {
    it("should throw RangeError", function (): void {
      expect(() => new TaskUnitCluster([])).to.throw(RangeError);
    });
  });
  describe("Simple Cluster", function (): void {
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
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      cluster = new TaskUnitCluster([unitD]);
    });
    it("should have 2 paths", function (): void {
      expect(cluster.paths.length).to.equal(2);
    });
  });
  describe("Simple Conflict Cluster", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitD] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      cluster = new TaskUnitCluster([unitC, unitF]);
      chainA = cluster.chainMap.getChainOfUnit(unitA);
      chainB = cluster.chainMap.getChainOfUnit(unitB);
      chainC = cluster.chainMap.getChainOfUnit(unitC);
      chainD = cluster.chainMap.getChainOfUnit(unitD);
      chainE = cluster.chainMap.getChainOfUnit(unitE);
      chainF = cluster.chainMap.getChainOfUnit(unitF);
      chainG = cluster.chainMap.getChainOfUnit(unitG);
    });
    it("should have 3 paths", function (): void {
      expect(cluster.paths.length).to.equal(3);
    });
    it("should have path with only D", function (): void {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([chainD]);
    });
    it("should have path with only A, B, and C", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainC,
      ]);
    });
    it("should have path with only E, G, and F", function (): void {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([
        chainE,
        chainG,
        chainF,
      ]);
    });
    it("should have D path in the middle", function (): void {
      expect(cluster.pathsSortedByRanking[1]).to.equal(
        cluster.getPathOfChain(chainD)
      );
    });
    it("should throw NoSuchChainPathError when getting path of unrecognized chain", function (): void {
      expect(() =>
        cluster.getPathOfChain(
          new IsolatedDependencyChain([
            new TaskUnit({
              now,
              name: "unit",
              anticipatedStartDate: new Date(),
              anticipatedEndDate: new Date(),
            }),
          ])
        )
      ).to.throw(NoSuchChainPathError);
    });
  });
  describe("Unavoidable Unfamiliarity Cluster", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitJ = new TaskUnit({
        now,
        name: "J",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
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
    it("should have 4 paths", function (): void {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only A, D, and H", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only C, G, and J", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
    it("should have path with only B, E, and I", function (): void {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainI,
      ]);
    });
    it("should have path with only F", function (): void {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
  });
  describe("More Complex Conflict Cluster", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitE] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitI] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });

      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitH] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
      });

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
    it("should have 3 paths", function (): void {
      expect(cluster.paths.length).to.equal(3);
    });
    it("should have chains A, B, E, D, and F in the same path", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainE,
        chainD,
        chainF,
      ]);
    });
    it("should have chains G, H, and I in the same path", function (): void {
      expect(cluster.getPathOfChain(chainG).chains).to.have.members([
        chainG,
        chainH,
        chainI,
      ]);
    });
    it("should have chain C in its own path", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([chainC]);
    });
    it("should have A path in the middle", function (): void {
      expect(cluster.pathsSortedByRanking[1]).to.equal(
        cluster.getPathOfChain(chainA)
      );
    });
  });
  describe("Competing Heads", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let chainK: IIsolatedDependencyChain;
    let chainL: IIsolatedDependencyChain;
    let chainM: IIsolatedDependencyChain;
    let chainN: IIsolatedDependencyChain;
    let chainO: IIsolatedDependencyChain;
    let chainP: IIsolatedDependencyChain;
    let chainQ: IIsolatedDependencyChain;
    let chainR: IIsolatedDependencyChain;
    let chainS: IIsolatedDependencyChain;
    let chainT: IIsolatedDependencyChain;
    let chainU: IIsolatedDependencyChain;
    let chainV: IIsolatedDependencyChain;
    let chainW: IIsolatedDependencyChain;
    let chainX: IIsolatedDependencyChain;
    let chainY: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "B",
      });

      const unitC = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "E",
      });

      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitD] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "I",
      });

      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitG] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitG, unitH] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });
      const unitM = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitH, unitI] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "M",
      });
      const unitN = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitI] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "N",
      });

      const unitO = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ, unitK] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
        name: "O",
      });
      const unitP = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitK, unitL] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
        name: "P",
      });
      const unitQ = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitL, unitM] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
        name: "Q",
      });
      const unitR = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitM, unitN] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
        name: "R",
      });

      const unitS = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitO, unitP] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "S",
      });
      const unitT = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitP, unitQ] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "T",
      });
      const unitU = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitQ, unitR] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "U",
      });
      const unitV = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitR] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "V",
      });

      const unitW = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitS, unitT] }],
        anticipatedStartDate: thirteenthDate,
        anticipatedEndDate: fourteenthDate,
        name: "W",
      });
      const unitX = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitT, unitU] }],
        anticipatedStartDate: thirteenthDate,
        anticipatedEndDate: fourteenthDate,
        name: "X",
      });
      const unitY = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitU, unitV] }],
        anticipatedStartDate: thirteenthDate,
        anticipatedEndDate: fourteenthDate,
        name: "Y",
      });

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
    it("should have chain A, C, F, K, O, S, and W in the same path", function (): void {
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
    it("should have chain H in its own path", function (): void {
      expect(cluster.getPathOfChain(chainH).chains).to.have.members([chainH]);
    });
    it("should have chain J in its own path", function (): void {
      expect(cluster.getPathOfChain(chainJ).chains).to.have.members([chainJ]);
    });
    it("should have chains B, E, I, M, Q, T, and X in the same path", function (): void {
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
    it("should have chains D, G, L, and P in the same path", function (): void {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([
        chainD,
        chainG,
        chainL,
        chainP,
      ]);
    });
    it("should have chains N, R, V, and Y in the same path", function (): void {
      expect(cluster.getPathOfChain(chainN).chains).to.have.members([
        chainN,
        chainR,
        chainV,
        chainY,
      ]);
    });
    it("should have chain U in its own path", function (): void {
      expect(cluster.getPathOfChain(chainU).chains).to.have.members([chainU]);
    });
  });
  describe("Same Relative Attachment, But Different Strain", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let chainK: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });

      const unitE = new TaskUnit({
        now,
        name: "E",
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });

      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
      });
      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
      });
      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
      });

      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitG, unitH] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitH, unitI] }],
        anticipatedStartDate: eleventhDate,
        anticipatedEndDate: twelfthDate,
        name: "K",
      });
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
    it("should have 4 paths", function (): void {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only E, G, and J", function (): void {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([
        chainE,
        chainG,
        chainJ,
      ]);
    });
    it("should have path with only A, B, D, F, I, and K", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainB,
        chainD,
        chainF,
        chainI,
        chainK,
      ]);
    });
    it("should have path with only C", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([chainC]);
    });
    it("should have path with only H", function (): void {
      expect(cluster.getPathOfChain(chainH).chains).to.have.members([chainH]);
    });
  });
  describe("Same Relative Attachment, Same Strain, But Different Density (Higher Density First)", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fifthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      const unitJ = new TaskUnit({
        now,
        name: "J",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitG] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
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
    it("should have 4 paths", function (): void {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only F", function (): void {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only A, D, and H", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only B, E, and I", function (): void {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainI,
      ]);
    });
    it("should have path with only C, G, and J", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
  });
  describe("Same Relative Attachment, Same Strain, But Different Density (Higher Density Last)", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fifthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      const unitJ = new TaskUnit({
        now,
        name: "J",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitG] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
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
    it("should have 4 paths", function (): void {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only E", function (): void {
      expect(cluster.getPathOfChain(chainE).chains).to.have.members([chainE]);
    });
    it("should have path with only A, D, and H", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainH,
      ]);
    });
    it("should have path with only B, F, and I", function (): void {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainF,
        chainI,
      ]);
    });
    it("should have path with only C, G, and J", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainG,
        chainJ,
      ]);
    });
  });
  describe("Relative Familiarity", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });

      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });

      const unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitG, unitH] }],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
      });

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
    it("should have 4 paths", function (): void {
      expect(cluster.paths.length).to.equal(4);
    });
    it("should have path with only A, C, E, H and I", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainC,
        chainE,
        chainH,
        chainI,
      ]);
    });
    it("should have path with only B and G", function (): void {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainG,
      ]);
    });
    it("should have path with only F", function (): void {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only D", function (): void {
      expect(cluster.getPathOfChain(chainD).chains).to.have.members([chainD]);
    });
  });
  describe("Relative Unfamiliarity", function (): void {
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
    let chainA: IIsolatedDependencyChain;
    let chainB: IIsolatedDependencyChain;
    let chainC: IIsolatedDependencyChain;
    let chainD: IIsolatedDependencyChain;
    let chainE: IIsolatedDependencyChain;
    let chainF: IIsolatedDependencyChain;
    let chainG: IIsolatedDependencyChain;
    let chainH: IIsolatedDependencyChain;
    let chainI: IIsolatedDependencyChain;
    let chainJ: IIsolatedDependencyChain;
    let chainK: IIsolatedDependencyChain;
    let chainL: IIsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      const unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });

      const unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      const unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });

      const unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitD] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitC, unitD, unitE] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        name: "J",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });
      const unitK = new TaskUnit({
        now,
        name: "K",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
      });

      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitH, unitI, unitJ] },
        ],
        anticipatedStartDate: ninthDate,
        anticipatedEndDate: tenthDate,
        name: "L",
      });

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
    it("should have 6 paths", function (): void {
      expect(cluster.paths.length).to.equal(6);
    });
    it("should have path with only C and H", function (): void {
      expect(cluster.getPathOfChain(chainC).chains).to.have.members([
        chainC,
        chainH,
      ]);
    });
    it("should have path with only A, D, I, and L", function (): void {
      expect(cluster.getPathOfChain(chainA).chains).to.have.members([
        chainA,
        chainD,
        chainI,
        chainL,
      ]);
    });
    it("should have path with only B, E, and J", function (): void {
      expect(cluster.getPathOfChain(chainB).chains).to.have.members([
        chainB,
        chainE,
        chainJ,
      ]);
    });
    it("should have path with only F", function (): void {
      expect(cluster.getPathOfChain(chainF).chains).to.have.members([chainF]);
    });
    it("should have path with only G", function (): void {
      expect(cluster.getPathOfChain(chainG).chains).to.have.members([chainG]);
    });
    it("should have path with only K", function (): void {
      expect(cluster.getPathOfChain(chainK).chains).to.have.members([chainK]);
    });
  });
});
