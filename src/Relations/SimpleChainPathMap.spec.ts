import { expect } from "chai";
import { NoSuchChainPathError } from "../errors/Error";
import type { InterconnectionStrengthMapping, ResourceMap } from "../types";
import { ChainPath, SimpleChainMap, SimpleChainPathMap, TaskUnit } from "./";

describe("SimpleChainPathMap", function (): void {
  describe("No Units", function (): void {
    it("should throw RangeError", function (): void {
      expect(() => new SimpleChainMap([])).to.throw(RangeError);
    });
  });
  describe("Many Paths", function (): void {
    let pathA: ChainPath;
    let pathB: ChainPath;
    let pathC: ChainPath;
    let pathD: ChainPath;
    let pathE: ChainPath;
    let pathF: ChainPath;
    let pathMap: SimpleChainPathMap;
    before(function (): void {
      const now = new Date();
      const firstDate = new Date(now.getTime() - 100000);
      const secondDate = new Date(firstDate.getTime() + 1000);
      const thirdDate = new Date(secondDate.getTime() + 1000);
      const fourthDate = new Date(thirdDate.getTime() + 1000);
      const fifthDate = new Date(fourthDate.getTime() + 1000);
      const sixthDate = new Date(fifthDate.getTime() + 1000);
      const unitA = new TaskUnit(now, [], firstDate, secondDate, "A");
      const unitB = new TaskUnit(now, [], firstDate, secondDate, "B");
      const unitC = new TaskUnit(now, [], firstDate, secondDate, "C");
      const unitD = new TaskUnit(now, [], firstDate, secondDate, "D");
      const unitE = new TaskUnit(now, [], firstDate, secondDate, "E");
      const unitF = new TaskUnit(now, [], firstDate, secondDate, "F");

      const unitG = new TaskUnit(
        now,
        [unitA, unitC, unitF],
        thirdDate,
        fourthDate,
        "G"
      );
      const unitH = new TaskUnit(
        now,
        [unitB, unitD],
        thirdDate,
        fourthDate,
        "H"
      );
      const unitI = new TaskUnit(
        now,
        [unitB, unitC, unitE],
        thirdDate,
        fourthDate,
        "I"
      );
      const unitJ = new TaskUnit(
        now,
        [unitA, unitB, unitD, unitE],
        thirdDate,
        fourthDate,
        "J"
      );
      const unitK = new TaskUnit(
        now,
        [unitC, unitD, unitE],
        thirdDate,
        fourthDate,
        "K"
      );
      const unitL = new TaskUnit(
        now,
        [unitA, unitC, unitF],
        thirdDate,
        fourthDate,
        "L"
      );

      const unitM = new TaskUnit(
        now,
        [unitG, unitI, unitL],
        fifthDate,
        sixthDate,
        "M"
      );
      const unitN = new TaskUnit(
        now,
        [unitH, unitI, unitJ],
        fifthDate,
        sixthDate,
        "N"
      );
      const unitO = new TaskUnit(
        now,
        [unitH, unitI],
        fifthDate,
        sixthDate,
        "O"
      );
      const unitP = new TaskUnit(
        now,
        [unitH, unitJ, unitK, unitL],
        fifthDate,
        sixthDate,
        "P"
      );
      const unitQ = new TaskUnit(
        now,
        [unitF, unitI, unitK],
        fifthDate,
        sixthDate,
        "Q"
      );
      const unitR = new TaskUnit(
        now,
        [unitG, unitL],
        fifthDate,
        sixthDate,
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
      ].reduce<ResourceMap<ChainPath>>(
        (
          acc: ResourceMap<ChainPath>,
          path: ChainPath
        ): ResourceMap<ChainPath> => {
          return { ...acc, [path.id]: path };
        },
        {}
      );
      pathMap = new SimpleChainPathMap(pathMapping, chainMap);
    });
    it("should provide correct path for ID", function (): void {
      expect(pathMap.getPathById(pathA.id)).to.equal(pathA);
    });
    it("should throw NoSuchChainPathError when unrecognized path by id", function (): void {
      expect(() => pathMap.getPathById("abc")).to.throw(NoSuchChainPathError);
    });
    it("should throw NoSuchChainPathError when getting connections of unrecognized path id", function (): void {
      expect(() => pathMap.getConnectionsForPathById("abc")).to.throw(
        NoSuchChainPathError
      );
    });
    it("should have correct number of connections between paths", function (): void {
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
