import { expect } from "chai";
import { NoSuchChainPathError } from "../Error";
import { InterconnectionStrengthMapping, ResourceMap } from "../types";
import { ChainPath, SimpleChainMap, SimpleChainPathMap, TaskUnit } from "./";

describe("SimpleChainMap", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new SimpleChainMap([])).to.throw(RangeError);
    });
  });
  describe("Many Paths", function () {
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let pathMap: SimpleChainPathMap;
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
      const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      const unitF = new TaskUnit([], firstStartDate, firstEndDate, "F");

      const unitG = new TaskUnit(
        [unitA, unitC, unitF],
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
        [unitB, unitC, unitE],
        secondStartDate,
        secondEndDate,
        "I"
      );
      const unitJ = new TaskUnit(
        [unitA, unitB, unitD, unitE],
        secondStartDate,
        secondEndDate,
        "J"
      );
      const unitK = new TaskUnit(
        [unitC, unitD, unitE],
        secondStartDate,
        secondEndDate,
        "K"
      );
      const unitL = new TaskUnit(
        [unitA, unitC, unitF],
        secondStartDate,
        secondEndDate,
        "L"
      );

      const unitM = new TaskUnit(
        [unitG, unitI, unitL],
        thirdStartDate,
        thirdEndDate,
        "M"
      );
      const unitN = new TaskUnit(
        [unitH, unitI, unitJ],
        thirdStartDate,
        thirdEndDate,
        "N"
      );
      const unitO = new TaskUnit(
        [unitH, unitI],
        thirdStartDate,
        thirdEndDate,
        "O"
      );
      const unitP = new TaskUnit(
        [unitH, unitJ, unitK, unitL],
        thirdStartDate,
        thirdEndDate,
        "P"
      );
      const unitQ = new TaskUnit(
        [unitF, unitI, unitK],
        thirdStartDate,
        thirdEndDate,
        "Q"
      );
      const unitR = new TaskUnit(
        [unitG, unitL],
        thirdStartDate,
        thirdEndDate,
        "R"
      );

      const chainMap = new SimpleChainMap([
        unitM,
        unitN,
        unitO,
        unitP,
        unitQ,
        unitR,
      ]);
      pathA = new ChainPath([
        chainMap.getChainOfUnit(unitM),
        chainMap.getChainOfUnit(unitG),
        chainMap.getChainOfUnit(unitA),
      ]);
      pathB = new ChainPath([
        chainMap.getChainOfUnit(unitN),
        chainMap.getChainOfUnit(unitH),
        chainMap.getChainOfUnit(unitB),
      ]);
      pathC = new ChainPath([
        chainMap.getChainOfUnit(unitO),
        chainMap.getChainOfUnit(unitI),
        chainMap.getChainOfUnit(unitC),
      ]);
      pathD = new ChainPath([
        chainMap.getChainOfUnit(unitP),
        chainMap.getChainOfUnit(unitJ),
        chainMap.getChainOfUnit(unitD),
      ]);
      pathE = new ChainPath([
        chainMap.getChainOfUnit(unitQ),
        chainMap.getChainOfUnit(unitK),
        chainMap.getChainOfUnit(unitE),
      ]);
      pathF = new ChainPath([
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
      pathMap = new SimpleChainPathMap(pathMapping, chainMap);
    });
    it("should provide correct path for ID", function () {
      expect(pathMap.getPathById(pathA.id)).to.equal(pathA);
    });
    it("should throw NoSuchChainPathError when unrecognized path by id", function () {
      expect(() => pathMap.getPathById("abc")).to.throw(NoSuchChainPathError);
    });
    it("should throw NoSuchChainPathError when getting connections of unrecognized path id", function () {
      expect(() => pathMap.getConnectionsForPathById("abc")).to.throw(
        NoSuchChainPathError
      );
    });
    it("should have correct number of connections between paths", function () {
      const expectedMap: InterconnectionStrengthMapping = {
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
          [pathF.id]: 1,
        },
        [pathE.id]: {
          [pathC.id]: 3,
          [pathD.id]: 3,
          [pathF.id]: 1,
        },
        [pathF.id]: {
          [pathA.id]: 4,
          [pathC.id]: 1,
          [pathD.id]: 1,
          [pathE.id]: 1,
        },
      };
      expect(pathMap.connectionStrengthMapping).to.deep.equal(expectedMap);
    });
  });
});
