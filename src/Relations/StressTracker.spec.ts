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

describe("StressTracker", function () {
  describe("Simple Paths", function () {
    let stressTracker: StressTracker;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit([], firstStartDate, firstEndDate, "B");
      const unitC = new TaskUnit([], firstStartDate, firstEndDate, "C");
      const unitD = new TaskUnit([], firstStartDate, firstEndDate, "D");

      const unitE = new TaskUnit(
        [unitA, unitB],
        secondStartDate,
        secondEndDate,
        "E"
      );
      const unitF = new TaskUnit(
        [unitA, unitB, unitD],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitC], secondStartDate, secondEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitD],
        secondStartDate,
        secondEndDate,
        "H"
      );

      const unitI = new TaskUnit(
        [unitE, unitG],
        thirdStartDate,
        thirdEndDate,
        "I"
      );
      const unitJ = new TaskUnit(
        [unitF, unitH],
        thirdStartDate,
        thirdEndDate,
        "J"
      );
      const unitK = new TaskUnit(
        [unitE, unitG],
        thirdStartDate,
        thirdEndDate,
        "K"
      );
      const unitL = new TaskUnit(
        [unitB, unitG, unitH],
        thirdStartDate,
        thirdEndDate,
        "L"
      );

      const unitM = new TaskUnit([unitI], fourthStartDate, fourthEndDate, "M");
      const unitN = new TaskUnit(
        [unitI, unitJ, unitL],
        fourthStartDate,
        fourthEndDate,
        "N"
      );
      const unitO = new TaskUnit([unitK], fourthStartDate, fourthEndDate, "O");
      const unitP = new TaskUnit([unitL], fourthStartDate, fourthEndDate, "P");
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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit([], firstStartDate, firstEndDate, "B");
      const unitC = new TaskUnit([], firstStartDate, firstEndDate, "C");
      const unitD = new TaskUnit([], firstStartDate, firstEndDate, "D");

      const unitE = new TaskUnit([unitA], secondStartDate, secondEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitB, unitD],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit(
        [unitA, unitC, unitD],
        secondStartDate,
        secondEndDate,
        "G"
      );
      const unitH = new TaskUnit(
        [unitB, unitD],
        secondStartDate,
        secondEndDate,
        "H"
      );

      const unitI = new TaskUnit(
        [unitE, unitF],
        thirdStartDate,
        thirdEndDate,
        "I"
      );
      const unitJ = new TaskUnit(
        [unitE, unitF, unitH],
        thirdStartDate,
        thirdEndDate,
        "J"
      );
      const unitK = new TaskUnit(
        [unitE, unitG],
        thirdStartDate,
        thirdEndDate,
        "K"
      );
      const unitL = new TaskUnit(
        [unitF, unitG, unitH],
        thirdStartDate,
        thirdEndDate,
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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitE],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitG],
        fourthStartDate,
        fourthEndDate,
        "H"
      );
      const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitI],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      const unitL = new TaskUnit(
        [unitC, unitK],
        fourthStartDate,
        fourthEndDate,
        "L"
      );

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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitE],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitG],
        fourthStartDate,
        fourthEndDate,
        "H"
      );
      const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitI],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      const unitL = new TaskUnit(
        [unitC, unitK],
        fourthStartDate,
        fourthEndDate,
        "L"
      );

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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitE],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitG],
        fourthStartDate,
        fourthEndDate,
        "H"
      );
      const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitI],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      const unitL = new TaskUnit(
        [unitC, unitK],
        fourthStartDate,
        fourthEndDate,
        "L"
      );

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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitE],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitG],
        fourthStartDate,
        fourthEndDate,
        "H"
      );
      const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitI],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      const unitL = new TaskUnit(
        [unitC, unitK],
        fourthStartDate,
        fourthEndDate,
        "L"
      );

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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      const unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      const unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit(
        [unitA, unitE],
        secondStartDate,
        secondEndDate,
        "F"
      );
      const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      const unitH = new TaskUnit(
        [unitC, unitG],
        fourthStartDate,
        fourthEndDate,
        "H"
      );
      const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      const unitJ = new TaskUnit(
        [unitA, unitI],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      const unitL = new TaskUnit(
        [unitC, unitK],
        fourthStartDate,
        fourthEndDate,
        "L"
      );

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
