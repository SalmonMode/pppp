import { expect } from "chai";
import { DisjointedUnitsError, NoSuchTaskUnitError } from "../Error";
import { assertIsObject } from "../typePredicates";
import StrainMap from "./StrainMap";
import { default as TaskUnit } from "./TaskUnit";

describe("StrainMap", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new StrainMap([])).to.throw(RangeError);
    });
  });
  describe("Disjointed Units", function () {
    it("should throw DisjointedUnitsError", function () {
      expect(
        () =>
          new StrainMap([
            new TaskUnit([], new Date(), new Date()),
            new TaskUnit([], new Date(), new Date()),
          ])
      ).to.throw(DisjointedUnitsError);
    });
  });
  describe("1 Unit", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    let strainMap: StrainMap;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
      strainMap = new StrainMap([unit]);
    });
    it("should throw NoSuchTaskUnitError when trying to get strain of unknown unit", function () {
      expect(() =>
        strainMap.getStrainOfUnit(new TaskUnit([], startDate, endDate))
      ).to.throw(NoSuchTaskUnitError);
    });
    it("should provide strain of 0 for only unit", function () {
      expect(strainMap.getStrainOfUnit(unit)).to.equal(0);
    });
  });
  describe("2 Units", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let strainMap: StrainMap;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() + 1000);
      endDateB = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateB.getTime() + 1000);
      endDateC = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(endDateC.getTime() + 1000);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      strainMap = new StrainMap([unitA, unitB]);
    });
    it("should throw NoSuchTaskUnitError when trying to get strain of unknown unit", function () {
      expect(() => strainMap.getStrainOfUnit(unitC)).to.throw(
        NoSuchTaskUnitError
      );
    });
    it("should provide strain of 1 for first unit", function () {
      expect(strainMap.getStrainOfUnit(unitA)).to.equal(1);
    });
    it("should provide strain of 1 for second unit", function () {
      expect(strainMap.getStrainOfUnit(unitB)).to.equal(1);
    });
  });
  describe("Has Equivalent Branching Dependencies", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let strainMap: StrainMap;
    before(function () {
      endDateA = new Date();
      startDateA = new Date(endDateA.getTime() - 1000);
      endDateB = new Date(startDateA.getTime() - 1000);
      startDateB = new Date(endDateB.getTime() - 1000);
      endDateC = new Date(startDateB.getTime() - 1000);
      startDateC = new Date(endDateC.getTime() - 1000);
      unitD = new TaskUnit([], startDateC, endDateC);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitB = new TaskUnit([unitC, unitD], startDateB, endDateB);
      unitA = new TaskUnit([unitB], startDateA, endDateA);
      strainMap = new StrainMap([unitA, unitB, unitC, unitD]);
    });
    it("should provide A-B-D as preferred chain when C is unavailable", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(unitA, [
        unitC,
      ]);
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA, unitB, unitD]);
    });
    it("should provide A-B-C as preferred chain when D is unavailable", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(unitA, [
        unitD,
      ]);
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA, unitB, unitC]);
    });
    it("should provide A-B as preferred chain when C and D are unavailable", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(unitA, [
        unitC,
        unitD,
      ]);
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA, unitB]);
    });
    it("should provide A as preferred chain when B, C, and D are unavailable", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(unitA, [
        unitB,
        unitC,
        unitD,
      ]);
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA]);
    });
    it("should provide A as preferred chain when B is unavailable", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(unitA, [
        unitB,
      ]);
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA]);
    });
    it("should provide A-B-C and A-B-D as most strained chains when all available", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(
        unitA,
        []
      );
      expect(chains.length).to.equal(2);
      const chainC = chains[0];
      const chainD = chains[1];
      assertIsObject(chainC);
      assertIsObject(chainD);
      expect(chainC.units).to.have.members([unitA, unitB, unitC]);
      expect(chainD.units).to.have.members([unitA, unitB, unitD]);
    });
  });
  describe("Early Temptation", function () {
    /**
     * ```text
     *
     *                   ┏━━━┓
     *                  ╱┗━━━┛D
     *            ┏━━━┓╱_┏━━━┓
     *          C╱┗━━━┛╲ ┗━━━┛E
     *          ╱       ╲┏━━━┓
     *    ┏━━━┓╱__┏━━━┓  ┗━━━┛F
     *   A┗━━━┛  B┗━━━┛╲
     *                  ╲┏━━━┓__┏━━━┓
     *                  ╱┗━━━┛G ┗━━━┛H
     *    ┏━━━┓___┏━━━┓╱
     *   I┗━━━┛  J┗━━━┛╲
     *                  ╲┏━━━┓K
     *                   ┗━━━┛
     *
     * ```
     *
     * When figuring out `H`, `J` presents an immediately more strained path, having a strain of 3, while `B` only has a
     * strain of 2. But `B` leads to `A` which has far more strain, and is the preferred path.
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let unitH: TaskUnit;
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let startDateE: Date;
    let startDateF: Date;
    let startDateG: Date;
    let startDateH: Date;
    let startDateI: Date;
    let startDateJ: Date;
    let startDateK: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    let endDateE: Date;
    let endDateF: Date;
    let endDateG: Date;
    let endDateH: Date;
    let endDateI: Date;
    let endDateJ: Date;
    let endDateK: Date;
    let strainMap: StrainMap;
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondUnitEnd = new Date(secondUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      const fourthUnitStart = new Date(thirdUnitEnd.getTime() + 1000);
      const fourthUnitEnd = new Date(fourthUnitStart.getTime() + 1000);

      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());
      startDateI = new Date(firstUnitStart.getTime());
      endDateI = new Date(firstUnitEnd.getTime());

      startDateB = new Date(secondUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());
      startDateC = new Date(secondUnitStart.getTime());
      endDateC = new Date(secondUnitEnd.getTime());
      startDateJ = new Date(secondUnitStart.getTime());
      endDateJ = new Date(secondUnitEnd.getTime());

      startDateD = new Date(thirdUnitStart.getTime());
      endDateD = new Date(thirdUnitEnd.getTime());
      startDateE = new Date(thirdUnitStart.getTime());
      endDateE = new Date(thirdUnitEnd.getTime());
      startDateF = new Date(thirdUnitStart.getTime());
      endDateF = new Date(thirdUnitEnd.getTime());
      startDateG = new Date(thirdUnitStart.getTime());
      endDateG = new Date(thirdUnitEnd.getTime());
      startDateK = new Date(thirdUnitStart.getTime());
      endDateK = new Date(thirdUnitEnd.getTime());

      startDateH = new Date(fourthUnitStart.getTime());
      endDateH = new Date(fourthUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);
      unitI = new TaskUnit([], startDateI, endDateI);

      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitA], startDateC, endDateC);
      unitJ = new TaskUnit([unitI], startDateJ, endDateJ);

      unitD = new TaskUnit([unitC], startDateD, endDateD);
      unitE = new TaskUnit([unitC], startDateE, endDateE);
      unitF = new TaskUnit([unitC], startDateF, endDateF);
      unitG = new TaskUnit([unitB, unitJ], startDateG, endDateG);
      unitK = new TaskUnit([unitJ], startDateK, endDateK);

      unitH = new TaskUnit([unitG], startDateH, endDateH);

      strainMap = new StrainMap([
        unitA,
        unitB,
        unitC,
        unitD,
        unitE,
        unitF,
        unitG,
        unitH,
        unitI,
        unitJ,
        unitK,
      ]);
    });
    it("should provide A-B-G-H as preferred chain when all are available", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(
        unitH,
        []
      );
      expect(chains.length).to.equal(1);
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitA, unitB, unitG, unitH]);
    });
  });
  describe("Heavily interconnected", function () {
    /**
     * ```text
     *               ┏━━━━━━┓____┏━━━━━━┓
     *              ╱┗━━━━━━┛╲B ╱┗━━━━━━┛╲C
     *             ╱          ╲╱          ╲
     *            ╱           ╱╲           ╲
     *           ╱      ┏━━━┓╱__╲┏━━━┓      ╲
     *          ╱     E╱┗━━━┛╲ F╱┗━━━┛╲      ╲
     *    ┏━━━┓╱______╱       ╲╱       ╲______╲┏━━━┓
     *   A┗━━━┛       ╲       ╱╲       ╱       ┗━━━┛D
     *                 ╲┏━━━┓╱__╲┏━━━┓╱
     *                  ┗━━━┛G   ┗━━━┛H
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let unitH: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let startDateD: Date;
    let startDateE: Date;
    let startDateF: Date;
    let startDateG: Date;
    let startDateH: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let endDateD: Date;
    let endDateE: Date;
    let endDateF: Date;
    let endDateG: Date;
    let endDateH: Date;
    let strainMap: StrainMap;
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondLargeUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondSmallUnitStart = new Date(
        secondLargeUnitStart.getTime() + 1000
      );
      const secondUnitEnd = new Date(secondSmallUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdSmallUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      const thirdLargeUnitEnd = new Date(thirdSmallUnitEnd.getTime() + 1000);
      const fourthUnitStart = new Date(thirdLargeUnitEnd.getTime() + 1000);
      const fourthUnitEnd = new Date(fourthUnitStart.getTime() + 1000);
      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());

      startDateB = new Date(secondLargeUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());
      startDateE = new Date(secondSmallUnitStart.getTime());
      endDateE = new Date(secondUnitEnd.getTime());
      startDateG = new Date(secondSmallUnitStart.getTime());
      endDateG = new Date(secondUnitEnd.getTime());

      startDateC = new Date(thirdUnitStart.getTime());
      endDateC = new Date(thirdLargeUnitEnd.getTime());
      startDateF = new Date(thirdUnitStart.getTime());
      endDateF = new Date(thirdSmallUnitEnd.getTime());
      startDateH = new Date(thirdUnitStart.getTime());
      endDateH = new Date(thirdSmallUnitEnd.getTime());

      startDateD = new Date(fourthUnitStart.getTime());
      endDateD = new Date(fourthUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);

      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitE = new TaskUnit([unitA], startDateE, endDateE);
      unitG = new TaskUnit([unitA], startDateG, endDateG);

      unitC = new TaskUnit([unitB, unitE], startDateC, endDateC);
      unitF = new TaskUnit([unitB, unitE, unitG], startDateF, endDateF);
      unitH = new TaskUnit([unitE, unitG], startDateH, endDateH);

      unitD = new TaskUnit([unitC, unitF, unitH], startDateD, endDateD);
      strainMap = new StrainMap([
        unitA,
        unitB,
        unitC,
        unitD,
        unitE,
        unitF,
        unitG,
        unitH,
      ]);
    });
    it("should prefer D->F->E->A when everything is available", function () {
      const chains = strainMap.getMostStrainedPathsFromUnitWithoutUnits(
        unitD,
        []
      );
      const chain = chains[0];
      assertIsObject(chain);
      expect(chain.units).to.have.members([unitD, unitF, unitE, unitA]);
    });
  });
});
