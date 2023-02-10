import { expect } from "chai";
import { NoSuchChainError } from "../Error";
import {
  ChainStrainMap,
  IsolatedDependencyChain,
  SimpleChainMap,
  TaskUnit
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
      unit = new TaskUnit(now, [], new Date(), new Date());
      chainMap = new SimpleChainMap([unit]);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should throw NoSuchChainError when getting strain of unrecognized chain", function (): void {
      expect(() =>
        strainMap.getStrainOfChain(
          new IsolatedDependencyChain([
            new TaskUnit(now, [], new Date(), new Date()),
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
      unitA = new TaskUnit(now, [], firstDate, secondDate);
      unitB = new TaskUnit(now, [unitA], secondDate, thirdDate);
      unitC = new TaskUnit(now, [unitA], secondDate, thirdDate);
      unitD = new TaskUnit(now, [unitB, unitC], thirdDate, fourthDate);
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
      const unitA = new TaskUnit(now, [], firstDate, secondDate);

      const unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      const unitC = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      const unitD = new TaskUnit(now, [unitB], fifthDate, sixthDate);
      const unitE = new TaskUnit(now, [unitB], fifthDate, sixthDate);
      const unitF = new TaskUnit(now, [unitB, unitC], fifthDate, sixthDate);
      const unitG = new TaskUnit(now, [unitC], fifthDate, sixthDate);

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
