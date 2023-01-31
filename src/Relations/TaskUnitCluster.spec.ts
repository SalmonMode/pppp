import { expect } from "chai";
import { NoSuchChainPathError } from "../Error";
import { IsolatedDependencyChain, TaskUnit, TaskUnitCluster } from "./";

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

describe("TaskUnitCluster", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new TaskUnitCluster([])).to.throw(RangeError);
    });
  });
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
    let cluster: TaskUnitCluster;
    before(function () {
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [unitA], secondDate, thirdDate);
      const unitC = new TaskUnit(now, [unitA], secondDate, thirdDate);
      const unitD = new TaskUnit(now, [unitB, unitC], thirdDate, fourthDate);
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
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let cluster: TaskUnitCluster;
    before(function () {
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitE = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitD = new TaskUnit(now, [unitA, unitE], thirdDate, fourthDate);
      const unitG = new TaskUnit(now, [unitE], thirdDate, fourthDate);

      const unitC = new TaskUnit(now, [unitB, unitD], fifthDate, sixthDate);
      const unitF = new TaskUnit(now, [unitD, unitG], fifthDate, sixthDate);
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
    it("should have D path in the middle", function () {
      expect(cluster.pathsSortedByRanking[1]).to.equal(
        cluster.getPathOfChain(chainD)
      );
    });
    it("should throw NoSuchChainPathError when getting path of unrecognized chain", function () {
      expect(() =>
        cluster.getPathOfChain(
          new IsolatedDependencyChain([
            new TaskUnit(now, [], new Date(), new Date()),
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [], firstDate, secondDate);
      const unitC = new TaskUnit(now, [], firstDate, secondDate);

      const unitD = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitE = new TaskUnit(now, [unitA, unitB], thirdDate, fourthDate);
      const unitF = new TaskUnit(now, [unitB, unitC], thirdDate, fourthDate);
      const unitG = new TaskUnit(now, [unitC], thirdDate, fourthDate);

      const unitH = new TaskUnit(now, [unitD, unitE], fifthDate, sixthDate);
      const unitI = new TaskUnit(now, [unitE, unitF], fifthDate, sixthDate);
      const unitJ = new TaskUnit(now, [unitF, unitG], fifthDate, sixthDate);
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitG = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      const unitC = new TaskUnit(now, [unitB], fifthDate, sixthDate);
      const unitE = new TaskUnit(now, [unitB, unitG], fifthDate, sixthDate);
      const unitI = new TaskUnit(now, [unitG], fifthDate, sixthDate);

      const unitD = new TaskUnit(now, [unitC, unitE], seventhDate, eighthDate);
      const unitH = new TaskUnit(now, [unitE, unitI], seventhDate, eighthDate);

      const unitF = new TaskUnit(now, [unitD, unitH], ninthDate, tenthDate);

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
    it("should have A path in the middle", function () {
      expect(cluster.pathsSortedByRanking[1]).to.equal(
        cluster.getPathOfChain(chainA)
      );
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate, "A");
      const unitB = new TaskUnit(now, [], firstDate, secondDate, "B");

      const unitC = new TaskUnit(now, [unitA], thirdDate, fourthDate, "C");
      const unitD = new TaskUnit(
        now,
        [unitA, unitB],
        thirdDate,
        fourthDate,
        "D"
      );
      const unitE = new TaskUnit(now, [unitB], thirdDate, fourthDate, "E");

      const unitF = new TaskUnit(now, [unitC], fifthDate, sixthDate, "F");
      const unitG = new TaskUnit(
        now,
        [unitC, unitD],
        fifthDate,
        sixthDate,
        "G"
      );
      const unitH = new TaskUnit(
        now,
        [unitD, unitE],
        fifthDate,
        sixthDate,
        "H"
      );
      const unitI = new TaskUnit(now, [unitE], fifthDate, sixthDate, "I");

      const unitJ = new TaskUnit(now, [unitF], seventhDate, eighthDate, "J");
      const unitK = new TaskUnit(
        now,
        [unitF, unitG],
        seventhDate,
        eighthDate,
        "K"
      );
      const unitL = new TaskUnit(
        now,
        [unitG, unitH],
        seventhDate,
        eighthDate,
        "L"
      );
      const unitM = new TaskUnit(
        now,
        [unitH, unitI],
        seventhDate,
        eighthDate,
        "M"
      );
      const unitN = new TaskUnit(now, [unitI], seventhDate, eighthDate, "N");

      const unitO = new TaskUnit(
        now,
        [unitJ, unitK],
        ninthDate,
        tenthDate,
        "O"
      );
      const unitP = new TaskUnit(
        now,
        [unitK, unitL],
        ninthDate,
        tenthDate,
        "P"
      );
      const unitQ = new TaskUnit(
        now,
        [unitL, unitM],
        ninthDate,
        tenthDate,
        "Q"
      );
      const unitR = new TaskUnit(
        now,
        [unitM, unitN],
        ninthDate,
        tenthDate,
        "R"
      );

      const unitS = new TaskUnit(
        now,
        [unitO, unitP],
        eleventhDate,
        twelfthDate,
        "S"
      );
      const unitT = new TaskUnit(
        now,
        [unitP, unitQ],
        eleventhDate,
        twelfthDate,
        "T"
      );
      const unitU = new TaskUnit(
        now,
        [unitQ, unitR],
        eleventhDate,
        twelfthDate,
        "U"
      );
      const unitV = new TaskUnit(now, [unitR], eleventhDate, twelfthDate, "V");

      const unitW = new TaskUnit(
        now,
        [unitS, unitT],
        thirteenthDate,
        fourteenthDate,
        "W"
      );
      const unitX = new TaskUnit(
        now,
        [unitT, unitU],
        thirteenthDate,
        fourteenthDate,
        "X"
      );
      const unitY = new TaskUnit(
        now,
        [unitU, unitV],
        thirteenthDate,
        fourteenthDate,
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitC = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      const unitD = new TaskUnit(now, [unitB, unitC], fifthDate, sixthDate);

      const unitE = new TaskUnit(now, [], seventhDate, eighthDate);
      const unitF = new TaskUnit(now, [unitD], seventhDate, eighthDate);

      const unitG = new TaskUnit(now, [unitE], ninthDate, tenthDate);
      const unitH = new TaskUnit(now, [unitE, unitF], ninthDate, tenthDate);
      const unitI = new TaskUnit(now, [unitF], ninthDate, tenthDate);

      const unitJ = new TaskUnit(
        now,
        [unitG, unitH],
        eleventhDate,
        twelfthDate
      );
      const unitK = new TaskUnit(
        now,
        [unitH, unitI],
        eleventhDate,
        twelfthDate
      );
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [], firstDate, secondDate);
      const unitC = new TaskUnit(now, [], firstDate, secondDate);

      const unitD = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitE = new TaskUnit(now, [unitA, unitB], thirdDate, fifthDate);
      const unitF = new TaskUnit(now, [unitB, unitC], thirdDate, fourthDate);
      const unitG = new TaskUnit(now, [unitC], thirdDate, fourthDate);

      const unitH = new TaskUnit(now, [unitD, unitE], sixthDate, seventhDate);
      const unitI = new TaskUnit(now, [unitE, unitF], sixthDate, seventhDate);
      const unitJ = new TaskUnit(now, [unitF, unitG], sixthDate, seventhDate);
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);
      const unitB = new TaskUnit(now, [], firstDate, secondDate);
      const unitC = new TaskUnit(now, [], firstDate, secondDate);

      const unitD = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitE = new TaskUnit(now, [unitA, unitB], thirdDate, fourthDate);
      const unitF = new TaskUnit(now, [unitB, unitC], thirdDate, fifthDate);
      const unitG = new TaskUnit(now, [unitC], thirdDate, fourthDate);

      const unitH = new TaskUnit(now, [unitD, unitE], sixthDate, seventhDate);
      const unitI = new TaskUnit(now, [unitE, unitF], sixthDate, seventhDate);
      const unitJ = new TaskUnit(now, [unitF, unitG], sixthDate, seventhDate);
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitC = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      const unitD = new TaskUnit(now, [unitB], fifthDate, sixthDate);
      const unitE = new TaskUnit(now, [unitC], fifthDate, sixthDate);
      const unitF = new TaskUnit(now, [unitC], fifthDate, sixthDate);

      const unitG = new TaskUnit(now, [unitB], seventhDate, eighthDate);
      const unitH = new TaskUnit(now, [unitE, unitF], seventhDate, eighthDate);

      const unitI = new TaskUnit(now, [unitG, unitH], ninthDate, tenthDate);

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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      const unitC = new TaskUnit(now, [unitB], fifthDate, sixthDate);
      const unitD = new TaskUnit(now, [unitA], fifthDate, sixthDate);
      const unitE = new TaskUnit(now, [unitB], fifthDate, sixthDate);

      const unitF = new TaskUnit(now, [unitC], seventhDate, eighthDate);
      const unitG = new TaskUnit(now, [unitC], seventhDate, eighthDate);
      const unitH = new TaskUnit(now, [unitC, unitD], seventhDate, eighthDate);
      const unitI = new TaskUnit(
        now,
        [unitC, unitD, unitE],
        seventhDate,
        eighthDate
      );
      const unitJ = new TaskUnit(now, [unitD, unitE], seventhDate, eighthDate);
      const unitK = new TaskUnit(now, [unitE], seventhDate, eighthDate);

      const unitL = new TaskUnit(
        now,
        [unitH, unitI, unitJ],
        ninthDate,
        tenthDate
      );

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
