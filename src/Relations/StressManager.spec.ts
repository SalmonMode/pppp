import { expect } from "chai";
import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { ResourceMap } from "../types";
import {
  ChainPath,
  SimpleChainMap,
  SimpleChainPathMap,
  StressManager,
  StressTracker,
  TaskUnit,
} from "./";

const firstDate = new Date();
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);

describe("StressManager", function () {
  describe("Many Paths", function () {
    let stressTracker: StressTracker;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");
      const unitD = new TaskUnit([], firstDate, secondDate, "D");
      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([], firstDate, secondDate, "F");

      const unitG = new TaskUnit(
        [unitA, unitC, unitF],
        thirdDate,
        fourthDate,
        "G"
      );
      const unitH = new TaskUnit([unitB, unitD], thirdDate, fourthDate, "H");
      const unitI = new TaskUnit(
        [unitB, unitC, unitE],
        thirdDate,
        fourthDate,
        "I"
      );
      const unitJ = new TaskUnit(
        [unitA, unitB, unitD, unitE],
        thirdDate,
        fourthDate,
        "J"
      );
      const unitK = new TaskUnit(
        [unitC, unitD, unitE],
        thirdDate,
        fourthDate,
        "K"
      );
      const unitL = new TaskUnit(
        [unitA, unitC, unitF],
        thirdDate,
        fourthDate,
        "L"
      );

      const unitM = new TaskUnit(
        [unitG, unitI, unitL],
        fifthDate,
        sixthDate,
        "M"
      );
      const unitN = new TaskUnit(
        [unitH, unitI, unitJ],
        fifthDate,
        sixthDate,
        "N"
      );
      const unitO = new TaskUnit([unitH, unitI], fifthDate, sixthDate, "O");
      const unitP = new TaskUnit(
        [unitH, unitJ, unitK, unitL],
        fifthDate,
        sixthDate,
        "P"
      );
      const unitQ = new TaskUnit(
        [unitF, unitI, unitK],
        fifthDate,
        sixthDate,
        "Q"
      );
      const unitR = new TaskUnit([unitG, unitL], fifthDate, sixthDate, "R");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
  });
  describe("Many Paths Best Move Is To Top", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");
      const unitD = new TaskUnit([], firstDate, secondDate, "D");
      const unitE = new TaskUnit([], firstDate, secondDate, "E");

      const unitF = new TaskUnit(
        [unitA, unitB, unitE],
        thirdDate,
        fourthDate,
        "F"
      );
      const unitG = new TaskUnit(
        [unitA, unitB, unitC],
        thirdDate,
        fourthDate,
        "G"
      );
      const unitH = new TaskUnit(
        [unitB, unitC, unitD],
        thirdDate,
        fourthDate,
        "H"
      );
      const unitI = new TaskUnit([unitC, unitD], thirdDate, fourthDate, "I");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, B, C, then D", function () {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathB.id,
        pathC.id,
        pathD.id,
      ]);
    });
  });
  describe("Many Paths Best Move Is Below", function () {
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
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");
      const unitD = new TaskUnit([], firstDate, secondDate, "D");
      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([], firstDate, secondDate, "F");
      const unitG = new TaskUnit([], firstDate, secondDate, "G");
      const unitH = new TaskUnit([], firstDate, secondDate, "H");

      const unitI = new TaskUnit([unitA, unitB], thirdDate, fourthDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitB, unitC],
        thirdDate,
        fourthDate,
        "J"
      );
      const unitK = new TaskUnit(
        [unitB, unitC, unitD, unitH],
        thirdDate,
        fourthDate,
        "K"
      );
      const unitL = new TaskUnit(
        [unitC, unitD, unitE],
        thirdDate,
        fourthDate,
        "L"
      );
      const unitM = new TaskUnit(
        [unitD, unitE, unitF],
        thirdDate,
        fourthDate,
        "M"
      );
      const unitN = new TaskUnit(
        [unitE, unitF, unitG],
        thirdDate,
        fourthDate,
        "N"
      );
      const unitO = new TaskUnit([unitF, unitG], thirdDate, fourthDate, "O");
      const unitP = new TaskUnit([unitH], thirdDate, fourthDate, "P");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted A, B, H, C, D, E, F, then G", function () {
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
  describe("Best Move is Scooching Closer", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstDate.getTime() + 100),
        new Date(secondDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(fifthDate.getTime() + 100),
        new Date(sixthDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, C, A, then I", function () {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathC.id,
        pathA.id,
        pathI.id,
      ]);
    });
  });
  describe("Sharing a Track", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathH: ChainPath;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");

      const unitD = new TaskUnit([unitA], thirdDate, fourthDate, "D");
      const unitE = new TaskUnit([unitA, unitB], thirdDate, fourthDate, "E");
      const unitF = new TaskUnit([unitC], thirdDate, fourthDate, "F");

      const unitG = new TaskUnit([unitE], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([], fifthDate, sixthDate, "H");
      const unitI = new TaskUnit([unitF], fifthDate, sixthDate, "I");

      const unitJ = new TaskUnit([unitG], seventhDate, eighthDate, "J");
      const unitK = new TaskUnit([unitH], seventhDate, eighthDate, "K");
      const unitL = new TaskUnit([unitH, unitI], seventhDate, eighthDate, "L");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have same distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.equal(originalDistance);
    });
    it("should be sorted B, A, H, C", function () {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathB.id,
        pathA.id,
        pathH.id,
        pathC.id,
      ]);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing a Track (Different Path Heights)", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstDate.getTime() + 100),
        new Date(secondDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit([unitC], seventhDate, eighthDate, "D");

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, C, I", function () {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathC.id,
        pathI.id,
      ]);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing a Track (Different Path Heights, Starting With Shorter On Top)", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let originalDistance: number;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([unitA], thirdDate, fourthDate, "B");
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(fifthDate.getTime() + 100),
        new Date(sixthDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      originalDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      new StressManager(stressTracker);
    });
    it("should have less distance after sorting", function () {
      const postSortDistance = stressTracker.getCurrentTotalDistanceOfPaths();
      expect(postSortDistance).to.be.lessThan(originalDistance);
    });
    it("should be sorted E, A, C, I", function () {
      expect(stressTracker.getRankings()).to.deep.equal([
        pathE.id,
        pathA.id,
        pathC.id,
        pathI.id,
      ]);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Busted Moving During Organize", function () {
    let stressTracker: StressTracker;
    let pathA: ChainPath;
    let pathC: ChainPath;
    let pathE: ChainPath;
    let pathI: ChainPath;
    let sandbox: SinonSandbox;
    let moveBelowStub: SinonStub;
    before(function () {
      sandbox = createSandbox();
      moveBelowStub = sandbox.stub(StressTracker.prototype, "swapPathsById");
      moveBelowStub.throws(RangeError);
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstDate.getTime() + 100),
        new Date(secondDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(fifthDate.getTime() + 100),
        new Date(sixthDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
    });
    after(function () {
      sandbox.restore();
    });
    it("should bubble error properly", function () {
      expect(() => new StressManager(stressTracker)).to.throw(RangeError);
    });
  });
});
