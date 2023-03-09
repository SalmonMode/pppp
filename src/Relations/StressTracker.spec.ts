import { expect } from "chai";
import { NoSuchChainPathError } from "@errors";
import type { ResourceMap } from "@types";
import {
  ChainPath,
  SimpleChainMap,
  SimpleChainPathMap,
  StressTracker,
} from "./";
import TaskUnit from "@TaskUnit";

const now = new Date();
const firstDate = new Date(now.getTime() + 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);

describe("StressTracker", function (): void {
  describe("Simple Paths", function (): void {
    let stressTracker: StressTracker;
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitA, unitB, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitD] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "H",
      });

      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitH] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitB, unitG, unitH] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "L",
      });

      const unitM = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitI] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "M",
      });
      const unitN = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitI, unitJ, unitL] },
        ],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "N",
      });
      const unitO = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "O",
      });
      const unitP = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitL] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "P",
      });
      const chainMap = new SimpleChainMap([unitM, unitN, unitO, unitP]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitM),
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitE),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathB = new ChainPath([
        chainMap.getChainOfUnit(unitN),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitB),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitO),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathD = new ChainPath([
        chainMap.getChainOfUnit(unitP),
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitD),
      ]);
      pathA.id = "A";
      pathB.id = "B";
      pathC.id = "C";
      pathD.id = "D";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathD,
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
    it("should have a total distance of 34", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(34);
    });
    it("should throw NoSuchChainPathError when getting path ID for out of range matrix index", function (): void {
      expect(() => stressTracker.getPathIdForMatrixIndex(10000)).to.throw(
        NoSuchChainPathError
      );
    });
  });
  describe("Simple Paths After Swap", function (): void {
    let stressTracker: StressTracker;
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitA, unitB, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitA, unitC, unitD] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitD] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "H",
      });

      const unitI = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitE, unitF, unitH] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitG] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitF, unitG, unitH] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitI, unitJ, unitK, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitE),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathB = new ChainPath([
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitB),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathD = new ChainPath([
        chainMap.getChainOfUnit(unitL),
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitD),
      ]);
      pathA.id = "A";
      pathB.id = "B";
      pathC.id = "C";
      pathD.id = "D";
      const pathMapping: ResourceMap<ChainPath> = [
        pathA,
        pathB,
        pathC,
        pathD,
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
      stressTracker.swapPathsById(pathD.id, pathB.id);
    });
    it("should have a total distance of 46", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(46);
    });
  });
  describe("Sharing Tracks", function (): void {
    let stressTracker: StressTracker;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathI = new ChainPath([
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
    });
    it("should have a total distance of 16", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 4 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(4);
    });
  });
  describe("Sharing Tracks After Swap", function (): void {
    let stressTracker: StressTracker;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathI = new ChainPath([
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
      stressTracker.swapPathsById(pathI.id, pathC.id);
    });
    it("should have a total distance of 18", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(18);
    });
    it("should have 4 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(4);
    });
  });
  describe("Sharing Tracks After Move To Top", function (): void {
    let stressTracker: StressTracker;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathI = new ChainPath([
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
      stressTracker.movePathToTopById(pathC.id);
    });
    it("should have a total distance of 16", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing Tracks After Move Below", function (): void {
    let stressTracker: StressTracker;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathI = new ChainPath([
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
      stressTracker.movePathBelowPathById(pathA.id, pathI.id);
    });
    it("should have a total distance of 16", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing Tracks After Converge", function (): void {
    let stressTracker: StressTracker;
    before(function (): void {
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
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
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

      const chainMap = new SimpleChainMap([unitB, unitD, unitH, unitL]);
      const pathA = new ChainPath([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitA),
      ]);
      const pathC = new ChainPath([
        chainMap.getChainOfUnit(unitD),
        chainMap.getChainOfUnit(unitC),
      ]);
      const pathE = new ChainPath([
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitF),
        chainMap.getChainOfUnit(unitE),
      ]);
      const pathI = new ChainPath([
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
      stressTracker.convergePathsById(pathA.id, pathC.id);
    });
    it("should have a total distance of 12", function (): void {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(12);
    });
    it("should have 3 tracks", function (): void {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
});
