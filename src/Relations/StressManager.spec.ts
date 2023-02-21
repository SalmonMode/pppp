import { expect } from "chai";
import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import type { ResourceMap } from "../types";
import {
  ChainPath,
  SimpleChainMap,
  SimpleChainPathMap,
  StressManager,
  StressTracker,
  TaskUnit,
} from "./";

const now = new Date();
const firstDate = new Date(now.getTime() + 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);

describe("StressManager", function (): void {
  describe("Many Paths", function (): void {
    let stressTracker: StressTracker;
    let originalDistance: number;
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
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "F",
      });

      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitC, unitF] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB, unitC, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          {
            id: "1234",
            approved: true,
            parentUnits: [unitA, unitB, unitD, unitE],
          },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitD, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitC, unitF] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "L",
      });

      const unitM = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitG, unitI, unitL] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "M",
      });
      const unitN = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitH, unitI, unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "N",
      });
      const unitO = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitH, unitI] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "O",
      });
      const unitP = new TaskUnit({
        now,
        prerequisitesIterations: [
          {
            id: "1234",
            approved: true,
            parentUnits: [unitH, unitJ, unitK, unitL],
          },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "P",
      });
      const unitQ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF, unitI, unitK] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "Q",
      });
      const unitR = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitG, unitL] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "R",
      });

      const chainMap = new SimpleChainMap([
        unitM,
        unitN,
        unitO,
        unitP,
        unitQ,
        unitR,
      ]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitM),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathB = new ChainPath([
        chainMap.getChainOfUnit(unitN),
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitB),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitO),
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathD = new ChainPath([
        chainMap.getChainOfUnit(unitP),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitD),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitQ),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathF = new ChainPath([
        chainMap.getChainOfUnit(unitR),
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitF),
      ]);
      pathA.id = "A";
      pathB.id = "B";
      pathC.id = "C";
      pathD.id = "D";
      pathE.id = "E";
      pathF.id = "F";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathD,
        pathE,
        pathF,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
  });
  describe("Many Paths Best Move Is To Top", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let originalDistance: number;
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
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });

      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitB, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitB, unitC] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB, unitC, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "I",
      });

      const chainMap = new SimpleChainMap([unitF, unitG, unitH, unitI]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathB = new ChainPath([
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitB),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathD = new ChainPath([
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitD),
      ]);
      pathE = new ChainPath([chainMap.getChainOfUnit(unitE)]);
      pathA.id = "A";
      pathB.id = "B";
      pathC.id = "C";
      pathD.id = "D";
      pathE.id = "E";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathD,
        pathE,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, B, C, then D", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathB.id,
        pathC.id,
        pathD.id,
      ]);
    });
  });
  describe("Many Paths Best Move Is Below", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let pathG: ChainPath;
    let pathH: ChainPath;
    let originalDistance: number;
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
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "H",
      });

      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitB] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitB, unitC] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          {
            id: "1234",
            approved: true,
            parentUnits: [unitB, unitC, unitD, unitH],
          },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitD, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "L",
      });
      const unitM = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitD, unitE, unitF] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "M",
      });
      const unitN = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitE, unitF, unitG] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "N",
      });
      const unitO = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF, unitG] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "O",
      });
      const unitP = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitH] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "P",
      });

      const chainMap = new SimpleChainMap([
        unitI,
        unitJ,
        unitK,
        unitL,
        unitM,
        unitN,
        unitO,
        unitP,
      ]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathB = new ChainPath([
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitB),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathD = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitD),
      ]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitM),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathF = new ChainPath([
        chainMap.getChainOfUnit(unitN),
        chainMap.getChainOfUnit(unitF),
      ]);
      pathG = new ChainPath([
        chainMap.getChainOfUnit(unitO),
        chainMap.getChainOfUnit(unitG),
      ]);
      pathH = new ChainPath([
        chainMap.getChainOfUnit(unitP),
        chainMap.getChainOfUnit(unitH),
      ]);
      pathA.id = "A";
      pathB.id = "B";
      pathC.id = "C";
      pathD.id = "D";
      pathE.id = "E";
      pathF.id = "F";
      pathG.id = "G";
      pathH.id = "H";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathD,
        pathE,
        pathF,
        pathG,
        pathH,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted A, B, H, C, D, E, F, then G", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathA.id,
        pathB.id,
        pathH.id,
        pathC.id,
        pathD.id,
        pathE.id,
        pathF.id,
        pathG.id,
      ]);
    });
  });
  describe("Best Move is Scooching Closer", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: new Date(firstDate.getTime() + 100),
        anticipatedEndDate: new Date(secondDate.getTime() + 100),
        name: "B",
      });
      const unitC = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: new Date(fifthDate.getTime() + 100),
        anticipatedEndDate: new Date(sixthDate.getTime() + 100),
        name: "D",
      });

      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitG] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitI] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitK] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });
      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathI = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitI),
      ]);
      pathA.id = "A";
      pathC.id = "C";
      pathE.id = "E";
      pathI.id = "I";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathC,
        pathE,
        pathI,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, C, A, then I", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathC.id,
        pathA.id,
        pathI.id,
      ]);
    });
  });
  describe("Sharing a Track", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathH: ChainPath;
    let originalDistance: number;
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
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "C",
      });

      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitB] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });

      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitE] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "I",
      });

      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitG] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitH] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitH, unitI] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitD, unitJ, unitK, unitL]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathB = new ChainPath([
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitE),
        chainMap.getChainOfUnit(unitB),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathH = new ChainPath([
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitH),
      ]);
      pathA.id = "1";
      pathB.id = "2";
      pathH.id = "3";
      pathC.id = "4";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathH,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have same distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.equal(originalDistance);
    });
    it("should be sorted B, A, H, C", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathB.id,
        pathA.id,
        pathH.id,
        pathC.id,
      ]);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing a Track (Different Path Heights)", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: new Date(firstDate.getTime() + 100),
        anticipatedEndDate: new Date(secondDate.getTime() + 100),
        name: "B",
      });
      const unitC = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "D",
      });

      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitG] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitI] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitK] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathI = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitI),
      ]);
      pathA.id = "1";
      pathE.id = "2";
      pathI.id = "3";
      pathC.id = "4";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathC,
        pathE,
        pathI,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, C, I", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathC.id,
        pathI.id,
      ]);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing a Track (Different Path Heights, Starting With Shorter On Top)", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "B",
      });
      const unitC = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: new Date(fifthDate.getTime() + 100),
        anticipatedEndDate: new Date(sixthDate.getTime() + 100),
        name: "D",
      });

      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitG] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitI] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitK] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathI = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitI),
      ]);
      pathA.id = "1";
      pathE.id = "2";
      pathI.id = "3";
      pathC.id = "4";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathC,
        pathE,
        pathI,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function (): void {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, C, I", function (): void {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathC.id,
        pathI.id,
      ]);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Busted Moving During Organize", function (): void {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let sandbox: SinonSandbox;
    let moveBelowStub: SinonStub;
    before(function (): void {
      sandbox = createSandbox();
      moveBelowStub = sandbox.stub(StressTracker.prototype, "swapPathsById");
      moveBelowStub.throws(RangeError);
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: new Date(firstDate.getTime() + 100),
        anticipatedEndDate: new Date(secondDate.getTime() + 100),
        name: "B",
      });
      const unitC = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: new Date(fifthDate.getTime() + 100),
        anticipatedEndDate: new Date(sixthDate.getTime() + 100),
        name: "D",
      });

      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitF] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitG] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA, unitI] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC, unitK] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });
      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathI = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitI),
      ]);
      pathA.id = "A";
      pathC.id = "C";
      pathE.id = "E";
      pathI.id = "I";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathC,
        pathE,
        pathI,
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
    });
    after(function (): void {
      sandbox.restore();
    });
    it("should bubble error properly", function (): void {
      expect(() => new StressManager(stressTracker)).to.throw(RangeError);
    });
  });
});
