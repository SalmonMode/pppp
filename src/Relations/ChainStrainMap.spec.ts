import { expect } from "chai";
import { NoSuchChainError } from "../errors/Error";
import {
  ChainStrainMap,
  IsolatedDependencyChain,
  SimpleChainMap,
  TaskUnit,
} from "./";

const now = new Date();
const firstDate = new Date(now.getTime() - 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);

describe("ChainStrainMap", function (): void {
  describe("One Unit", function (): void {
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    let unit: TaskUnit;
    before(function (): void {
      unit = new TaskUnit({
        now,
        name: "unit",
        anticipatedStartDate: new Date(),
        anticipatedEndDate: new Date(),
      });
      chainMap = new SimpleChainMap([unit]);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should throw NoSuchChainError when getting strain of unrecognized chain", function (): void {
      expect(() =>
        strainMap.getStrainOfChain(
          new IsolatedDependencyChain([
            new TaskUnit({
              now,
              name: "unit",
              anticipatedStartDate: new Date(),
              anticipatedEndDate: new Date(),
            }),
          ])
        )
      ).to.throw(NoSuchChainError);
    });
    it("should have strain of 0 for only chain", function (): void {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unit))
      ).to.equal(0);
    });
  });
  describe("Simple Cluster", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "A",
      });
      unitB = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
        name: "B",
      });
      unitC = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
        name: "C",
      });
      unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB, unitC] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "D",
      });
      chainMap = new SimpleChainMap([unitD]);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should have strain of 2 for A", function (): void {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitA))
      ).to.equal(2);
    });
    it("should have strain of 2 for B", function (): void {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitB))
      ).to.equal(2);
    });
    it("should have strain of 2 for C", function (): void {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitC))
      ).to.equal(2);
    });
    it("should have strain of 2 for D", function (): void {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitD))
      ).to.equal(2);
    });
  });
  describe("Relative Unfamiliarity", function (): void {
    /**
     * ```text
     *                ┏━━━┓
     *               ╱┗━━━┛D
     *         ┏━━━┓╱╲┏━━━┓
     *       B╱┗━━━┛╲ ┗━━━┛E
     *  ┏━━━┓╱       ╲┏━━━┓
     * A┗━━━┛╲       ╱┗━━━┛F
     *        ╲┏━━━┓╱
     *        C┗━━━┛╲
     *               ╲┏━━━┓
     *                ┗━━━┛G
     * ```
     */
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
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
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitA] },
        ],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "C",
      });

      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "D",
      });
      const unitE = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitB, unitC] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [
          { id: "1234", approved: true, parentUnits: [unitC] },
        ],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });

      chainMap = new SimpleChainMap([unitD, unitE, unitF, unitG]);
      chainB = chainMap.getChainOfUnit(unitB);
      chainC = chainMap.getChainOfUnit(unitC);
      chainF = chainMap.getChainOfUnit(unitF);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should have higher relative familiarity from F to C than F to B", function (): void {
      const bRelFam = strainMap.getRelativeFamiliarityOfChainWithChain(
        chainB,
        chainF
      );
      const cRelFam = strainMap.getRelativeFamiliarityOfChainWithChain(
        chainC,
        chainF
      );
      expect(cRelFam).to.be.greaterThan(bRelFam);
    });
  });
});
