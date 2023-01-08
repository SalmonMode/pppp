import { expect } from "chai";
import { NoSuchChainError } from "../Error";
import ChainStrainMap from "./ChainStrainMap";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import SimpleChainMap from "./SimpleChainMap";
import { default as TaskUnit } from "./TaskUnit";

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
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(startDateB.getTime());
      endDateC = new Date(endDateB.getTime());
      startDateD = new Date(endDateC.getTime());
      endDateD = new Date(startDateD.getTime() + 1000);
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
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let chainA: IsolatedDependencyChain;
    let chainB: IsolatedDependencyChain;
    let chainC: IsolatedDependencyChain;
    let chainD: IsolatedDependencyChain;
    let chainE: IsolatedDependencyChain;
    let chainF: IsolatedDependencyChain;
    let chainG: IsolatedDependencyChain;
    let chainMap: SimpleChainMap;
    let strainMap: ChainStrainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitF = new TaskUnit([unitB, unitC], thirdStartDate, thirdEndDate);
      unitG = new TaskUnit([unitC], thirdStartDate, thirdEndDate);

      chainMap = new SimpleChainMap([unitD, unitE, unitF, unitG]);
      chainA = chainMap.getChainOfUnit(unitA);
      chainB = chainMap.getChainOfUnit(unitB);
      chainC = chainMap.getChainOfUnit(unitC);
      chainD = chainMap.getChainOfUnit(unitD);
      chainE = chainMap.getChainOfUnit(unitE);
      chainF = chainMap.getChainOfUnit(unitF);
      chainG = chainMap.getChainOfUnit(unitG);
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
