import { expect } from "chai";
import { NoSuchChainError } from "../Error";
import {
  ChainStrainMap,
  IsolatedDependencyChain,
  SimpleChainMap,
  TaskUnit,
} from "./";

describe("ChainStrainMap", function () {
  describe("One Unit", function () {
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    let unit: TaskUnit;
    before(function () {
      unit = new TaskUnit([], new Date(), new Date());
      chainMap = new SimpleChainMap([unit]);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should throw NoSuchChainError when getting strain of unrecognized chain", function () {
      expect(() =>
        strainMap.getStrainOfChain(
          new IsolatedDependencyChain([
            new TaskUnit([], new Date(), new Date()),
          ])
        )
      ).to.throw(NoSuchChainError);
    });
    it("should have strain of 0 for only chain", function () {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unit))
      ).to.equal(0);
    });
  });
  describe("Simple Cluster", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
      const startDateC = new Date(startDateB.getTime());
      const endDateC = new Date(endDateB.getTime());
      const startDateD = new Date(endDateC.getTime());
      const endDateD = new Date(startDateD.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitA], startDateC, endDateC);
      unitD = new TaskUnit([unitB, unitC], startDateD, endDateD);
      chainMap = new SimpleChainMap([unitD]);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should have strain of 2 for A", function () {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitA))
      ).to.equal(2);
    });
    it("should have strain of 2 for B", function () {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitB))
      ).to.equal(2);
    });
    it("should have strain of 2 for C", function () {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitC))
      ).to.equal(2);
    });
    it("should have strain of 2 for D", function () {
      expect(
        strainMap.getStrainOfChain(chainMap.getChainOfUnit(unitD))
      ).to.equal(2);
    });
  });
  describe("Relative Unfamiliarity", function () {
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
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const unitA = new TaskUnit([], firstStartDate, firstEndDate);

      const unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      const unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);

      const unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      const unitE = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      const unitF = new TaskUnit([unitB, unitC], thirdStartDate, thirdEndDate);
      const unitG = new TaskUnit([unitC], thirdStartDate, thirdEndDate);

      chainMap = new SimpleChainMap([unitD, unitE, unitF, unitG]);
      chainB = chainMap.getChainOfUnit(unitB);
      chainC = chainMap.getChainOfUnit(unitC);
      chainF = chainMap.getChainOfUnit(unitF);
      strainMap = new ChainStrainMap(chainMap);
    });
    it("should have higher relative familiarity from F to C than F to B", function () {
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
