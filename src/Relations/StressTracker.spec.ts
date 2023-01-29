import { expect } from "chai";
import { NoSuchChainPathError } from "../Error";
import { ResourceMap } from "../types";
import {
  ChainPath,
  SimpleChainMap,
  SimpleChainPathMap,
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

describe("StressTracker", function () {
  describe("Simple Paths", function () {
    let stressTracker: StressTracker;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");
      const unitD = new TaskUnit([], firstDate, secondDate, "D");

      const unitE = new TaskUnit([unitA, unitB], thirdDate, fourthDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitB, unitD],
        thirdDate,
        fourthDate,
        "F"
      );
      const unitG = new TaskUnit([unitC], thirdDate, fourthDate, "G");
      const unitH = new TaskUnit([unitC, unitD], thirdDate, fourthDate, "H");

      const unitI = new TaskUnit([unitE, unitG], fifthDate, sixthDate, "I");
      const unitJ = new TaskUnit([unitF, unitH], fifthDate, sixthDate, "J");
      const unitK = new TaskUnit([unitE, unitG], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit(
        [unitB, unitG, unitH],
        fifthDate,
        sixthDate,
        "L"
      );

      const unitM = new TaskUnit([unitI], seventhDate, eighthDate, "M");
      const unitN = new TaskUnit(
        [unitI, unitJ, unitL],
        seventhDate,
        eighthDate,
        "N"
      );
      const unitO = new TaskUnit([unitK], seventhDate, eighthDate, "O");
      const unitP = new TaskUnit([unitL], seventhDate, eighthDate, "P");
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
    });
    it("should have a total distance of 34", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(34);
    });
    it("should throw NoSuchChainPathError when getting path ID for out of range matrix index", function () {
      expect(() => stressTracker.getPathIdForMatrixIndex(10000)).to.throw(
        NoSuchChainPathError
      );
    });
  });
  describe("Simple Paths After Swap", function () {
    let stressTracker: StressTracker;
    before(function () {
      const unitA = new TaskUnit([], firstDate, secondDate, "A");
      const unitB = new TaskUnit([], firstDate, secondDate, "B");
      const unitC = new TaskUnit([], firstDate, secondDate, "C");
      const unitD = new TaskUnit([], firstDate, secondDate, "D");

      const unitE = new TaskUnit([unitA], thirdDate, fourthDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitB, unitD],
        thirdDate,
        fourthDate,
        "F"
      );
      const unitG = new TaskUnit(
        [unitA, unitC, unitD],
        thirdDate,
        fourthDate,
        "G"
      );
      const unitH = new TaskUnit([unitB, unitD], thirdDate, fourthDate, "H");

      const unitI = new TaskUnit([unitE, unitF], fifthDate, sixthDate, "I");
      const unitJ = new TaskUnit(
        [unitE, unitF, unitH],
        fifthDate,
        sixthDate,
        "J"
      );
      const unitK = new TaskUnit([unitE, unitG], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit(
        [unitF, unitG, unitH],
        fifthDate,
        sixthDate,
        "L"
      );

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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      stressTracker.swapPathsById(pathD.id, pathB.id);
    });
    it("should have a total distance of 46", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(46);
    });
  });
  describe("Sharing Tracks", function () {
    let stressTracker: StressTracker;
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
    });
    it("should have a total distance of 16", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 4 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(4);
    });
  });
  describe("Sharing Tracks After Swap", function () {
    let stressTracker: StressTracker;
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      stressTracker.swapPathsById(pathI.id, pathC.id);
    });
    it("should have a total distance of 18", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(18);
    });
    it("should have 4 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(4);
    });
  });
  describe("Sharing Tracks After Move To Top", function () {
    let stressTracker: StressTracker;
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      stressTracker.movePathToTopById(pathC.id);
    });
    it("should have a total distance of 16", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing Tracks After Move Below", function () {
    let stressTracker: StressTracker;
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      stressTracker.movePathBelowPathById(pathA.id, pathI.id);
    });
    it("should have a total distance of 16", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(16);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
  describe("Sharing Tracks After Converge", function () {
    let stressTracker: StressTracker;
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
      ].reduce((acc, path) => {
        return { ...acc, [path.id]: path };
      }, {});
      const pathMap = new SimpleChainPathMap(pathMapping, chainMap);
      stressTracker = new StressTracker(pathMap);
      stressTracker.convergePathsById(pathA.id, pathC.id);
    });
    it("should have a total distance of 12", function () {
      expect(stressTracker.getCurrentTotalDistanceOfPaths()).to.equal(12);
    });
    it("should have 3 tracks", function () {
      expect(stressTracker.getCurrentTracks().length).to.equal(3);
    });
  });
});
