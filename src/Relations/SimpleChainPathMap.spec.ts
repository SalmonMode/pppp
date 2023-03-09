import { NoSuchChainPathError } from "@errors";
import TaskUnit from "@TaskUnit";
import type {
  InterconnectionStrengthMapping,
  ResourceMap,
} from "@typing/Mapping";
import { expect } from "chai";
import ChainPath from "./ChainPath";
import SimpleChainMap from "./SimpleChainMap";
import SimpleChainPathMap from "./SimpleChainPathMap";

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
          { id: "1234", parentUnits: [unitA, unitC, unitF] },
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
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitB, unitC, unitE] },
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
          { id: "1234", parentUnits: [unitC, unitD, unitE] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitA, unitC, unitF] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "L",
      });

      const unitM = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitG, unitI, unitL] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "M",
      });
      const unitN = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", parentUnits: [unitH, unitI, unitJ] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "N",
      });
      const unitO = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitH, unitI] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "O",
      });
      const unitP = new TaskUnit({
        now,
        prerequisitesIterations: [
          {
            id: "1234",
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
          { id: "1234", parentUnits: [unitF, unitI, unitK] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "Q",
      });
      const unitR = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitG, unitL] }],
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
