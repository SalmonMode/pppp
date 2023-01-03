import { expect } from "chai";
import { default as TaskUnit } from "./TaskUnit";

describe("TaskUnit", function () {
  describe("No Dependencies", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        endDate.getTime() - startDate.getTime()
      );
    });
    it("should have correct initial start date", function () {
      expect(unit.initialStartDate).to.equal(startDate);
    });
    it("should not be dependent on self", function () {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unit.isDependentOn(new TaskUnit([], startDate, endDate))).to.be
        .false;
    });
    it("should have no direct dependencies", function () {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function () {
      expect(unit.getAllDependencies()).to.be.empty;
    });
  });
  describe("Complex Interconnections", function () {
    /**
     * ```text
     *    ┏━━━┓___┏━━━┓
     *   A┗━━━┛╲ ╱┗━━━┛╲B
     *          ╳       ╲
     *    ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
     *   C┗━━━┛╲ ╱┗━━━┛╲D╱┗━━━┛E
     *          ╳       ╳
     *    ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
     *   F┗━━━┛   ┗━━━┛G  ┗━━━┛H
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
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondUnitEnd = new Date(secondUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());
      startDateB = new Date(secondUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());

      startDateC = new Date(firstUnitStart.getTime());
      endDateC = new Date(firstUnitEnd.getTime());
      startDateD = new Date(secondUnitStart.getTime());
      endDateD = new Date(secondUnitEnd.getTime());
      startDateE = new Date(thirdUnitStart.getTime());
      endDateE = new Date(thirdUnitEnd.getTime());

      startDateF = new Date(firstUnitStart.getTime());
      endDateF = new Date(firstUnitEnd.getTime());
      startDateG = new Date(secondUnitStart.getTime());
      endDateG = new Date(secondUnitEnd.getTime());
      startDateH = new Date(thirdUnitStart.getTime());
      endDateH = new Date(thirdUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);
      unitC = new TaskUnit([], startDateC, endDateC);
      unitF = new TaskUnit([], startDateF, endDateF);

      unitB = new TaskUnit([unitA, unitC], startDateB, endDateB);
      unitD = new TaskUnit([unitA, unitC, unitF], startDateD, endDateD);
      unitG = new TaskUnit([unitC, unitF], startDateG, endDateG);

      unitE = new TaskUnit([unitB, unitD, unitG], startDateE, endDateE);
      unitH = new TaskUnit([unitD, unitG], startDateH, endDateH);
    });
    describe("From A", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitC;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitD;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitE;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 3 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(3);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From F", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitF;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitG;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitH;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 2 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Redundancies)", function () {
    /**
     * ```text
     *            ┏━━━┓___________┏━━━┓
     *           ╱┗━━━┛╲B________╱┗━━━┛D
     *          ╱_______╳       ╱
     *    ┏━━━┓╱_________╲┏━━━┓╱
     *   A┗━━━┛           ┗━━━┛C
     *                  | A path should only be considered if the unit it steps to is only available through that path.
     *                  V
     *    ┏━━━┓___┏━━━┓___┏━━━┓___┏━━━┓
     *   A┗━━━┛  B┗━━━┛   ┗━━━┛C  ┗━━━┛D
     * ```
     *
     * `A` can be reached from `C` by going through `B`, and `B` can be reached from `D` by going through `C`, so the
     * paths `C`->`A` and `D`->`B` are redundant.
     */
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
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime() + 1000);
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(endDateB.getTime() + 1000);
      endDateC = new Date(startDateC.getTime() + 1000);
      startDateD = new Date(endDateC.getTime() + 1000);
      endDateD = new Date(startDateD.getTime() + 1000);

      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitA, unitB], startDateC, endDateC);
      unitD = new TaskUnit([unitA, unitB, unitC], startDateD, endDateD);
    });
    describe("From A", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From B", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From C", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitC;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From D", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitD;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Interwoven Without Redundancies)", function () {
    /**
     * ```text
     *          ┏━━━┓____┏━━━┓____┏━━━┓
     *        B╱┗━━━┛╲  ╱┗━━━┛╲C ╱┗━━━┛╲D
     *   ┏━━━┓╱       ╲╱       ╲╱       ╲┏━━━┓
     *  A┗━━━┛╲       ╱╲       ╱╲       ╱┗━━━┛E
     *         ╲┏━━━┓╱__╲┏━━━┓╱__╲┏━━━┓╱
     *         F┗━━━┛    ┗━━━┛G   ┗━━━┛H
     *
     * There are no redundant paths.
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
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondUnitEnd = new Date(secondUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      const fourthUnitStart = new Date(thirdUnitEnd.getTime() + 1000);
      const fourthUnitEnd = new Date(fourthUnitStart.getTime() + 1000);
      const fifthUnitStart = new Date(fourthUnitEnd.getTime() + 1000);
      const fifthUnitEnd = new Date(fifthUnitStart.getTime() + 1000);
      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());

      startDateB = new Date(secondUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());
      startDateF = new Date(secondUnitStart.getTime());
      endDateF = new Date(secondUnitEnd.getTime());

      startDateC = new Date(thirdUnitStart.getTime());
      endDateC = new Date(thirdUnitEnd.getTime());
      startDateG = new Date(thirdUnitStart.getTime());
      endDateG = new Date(thirdUnitEnd.getTime());

      startDateD = new Date(fourthUnitStart.getTime());
      endDateD = new Date(fourthUnitEnd.getTime());
      startDateH = new Date(fourthUnitStart.getTime());
      endDateH = new Date(fourthUnitEnd.getTime());

      startDateE = new Date(fifthUnitStart.getTime());
      endDateE = new Date(fifthUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);

      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitF = new TaskUnit([unitA], startDateF, endDateF);

      unitC = new TaskUnit([unitB, unitF], startDateC, endDateC);
      unitG = new TaskUnit([unitB, unitF], startDateG, endDateG);

      unitD = new TaskUnit([unitC, unitG], startDateD, endDateD);
      unitH = new TaskUnit([unitC, unitG], startDateH, endDateH);

      unitE = new TaskUnit([unitD, unitH], startDateE, endDateE);
    });
    describe("From A", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitC;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitD;
      });
      it("should have 4 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitE;
      });
      it("should have 8 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(8);
      });
      it("should have 4 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(4);
      });
      it("should have 2 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 4 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 2 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(2);
      });
      it("should have 1 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(1);
      });
    });
    describe("From F", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitF;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitG;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitH;
      });
      it("should have 4 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Interwoven Without Redundancies)", function () {
    /**
     * ```text
     *          ┏━━━┓____┏━━━┓____┏━━━┓
     *        B╱┗━━━┛╲  ╱┗━━━┛╲C ╱┗━━━┛╲D
     *   ┏━━━┓╱       ╲╱       ╲╱       ╲┏━━━┓
     *  A┗━━━┛╲       ╱╲       ╱╲       ╱┗━━━┛E
     *         ╲┏━━━┓╱__╲┏━━━┓╱__╲┏━━━┓╱
     *         F┗━━━┛    ┗━━━┛G   ┗━━━┛H
     *
     * There are no redundant paths.
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
    before(function () {
      const firstUnitStart = new Date();
      const firstUnitEnd = new Date(firstUnitStart.getTime() + 1000);
      const secondUnitStart = new Date(firstUnitEnd.getTime() + 1000);
      const secondUnitEnd = new Date(secondUnitStart.getTime() + 1000);
      const thirdUnitStart = new Date(secondUnitEnd.getTime() + 1000);
      const thirdUnitEnd = new Date(thirdUnitStart.getTime() + 1000);
      const fourthUnitStart = new Date(thirdUnitEnd.getTime() + 1000);
      const fourthUnitEnd = new Date(fourthUnitStart.getTime() + 1000);
      const fifthUnitStart = new Date(fourthUnitEnd.getTime() + 1000);
      const fifthUnitEnd = new Date(fifthUnitStart.getTime() + 1000);
      startDateA = new Date(firstUnitStart.getTime());
      endDateA = new Date(firstUnitEnd.getTime());

      startDateB = new Date(secondUnitStart.getTime());
      endDateB = new Date(secondUnitEnd.getTime());
      startDateF = new Date(secondUnitStart.getTime());
      endDateF = new Date(secondUnitEnd.getTime());

      startDateC = new Date(thirdUnitStart.getTime());
      endDateC = new Date(thirdUnitEnd.getTime());
      startDateG = new Date(thirdUnitStart.getTime());
      endDateG = new Date(thirdUnitEnd.getTime());

      startDateD = new Date(fourthUnitStart.getTime());
      endDateD = new Date(fourthUnitEnd.getTime());
      startDateH = new Date(fourthUnitStart.getTime());
      endDateH = new Date(fourthUnitEnd.getTime());

      startDateE = new Date(fifthUnitStart.getTime());
      endDateE = new Date(fifthUnitEnd.getTime());

      unitA = new TaskUnit([], startDateA, endDateA);

      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitF = new TaskUnit([unitA], startDateF, endDateF);

      unitC = new TaskUnit([unitB, unitF], startDateC, endDateC);
      unitG = new TaskUnit([unitB, unitF], startDateG, endDateG);

      unitD = new TaskUnit([unitC, unitG], startDateD, endDateD);
      unitH = new TaskUnit([unitC, unitG], startDateH, endDateH);

      unitE = new TaskUnit([unitD, unitH], startDateE, endDateE);
    });
    describe("From A", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitC;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitD;
      });
      it("should have 4 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitE;
      });
      it("should have 8 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(8);
      });
      it("should have 4 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(4);
      });
      it("should have 2 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 4 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 2 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(2);
      });
      it("should have 1 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(1);
      });
    });
    describe("From F", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitF;
      });
      it("should have 1 path to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitG;
      });
      it("should have 2 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function () {
      let sourceUnit: TaskUnit;
      before(function () {
        sourceUnit = unitH;
      });
      it("should have 4 paths to A", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function () {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Competing Heads", function () {
    /**
     * ```text
     *                        ┏━━━┓
     *                       ╱┗━━━┛╲J
     *                 ┏━━━┓╱       ╲┏━━━┓
     *               F╱┗━━━┛╲       ╱┗━━━┛╲O
     *          ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *        C╱┗━━━┛╲       ╱┗━━━┛╲K      ╱┗━━━┛╲S
     *   ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *  A┗━━━┛╲      G╱┗━━━┛╲       ╱┗━━━┛╲P      ╱┗━━━┛W
     *         ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱
     *        D╱┗━━━┛╲       ╱┗━━━┛╲L      ╱┗━━━┛╲T
     *   ┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *  B┗━━━┛╲      H╱┗━━━┛╲       ╱┗━━━┛╲Q      ╱┗━━━┛X
     *         ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓╱
     *         E┗━━━┛╲       ╱┗━━━┛╲M      ╱┗━━━┛╲U
     *                ╲┏━━━┓╱       ╲┏━━━┓╱       ╲┏━━━┓
     *                I┗━━━┛╲       ╱┗━━━┛╲R      ╱┗━━━┛Y
     *                       ╲┏━━━┓╱       ╲┏━━━┓╱
     *                        ┗━━━┛N        ┗━━━┛V
     *
     *                             |
     *                             V
     *
     *                          ┏━━━┓
     *                        J╱┗━━━┛╲
     *                        ╱       ╲
     *  ┏━━━┓___┏━━━┓___┏━━━┓╱__┏━━━┓__╲┏━━━┓___┏━━━┓___┏━━━┓
     * A┗━━━┛╲ C┗━━━┛╲ F┗━━━┛  ╱┗━━━┛╲K ┗━━━┛O ╱┗━━━┛S  ┗━━━┛W
     *        ╲       ╲       ╱       ╲       ╱
     *        |        ╲┏━━━┓╱         ╲┏━━━┓╱
     *        |       G╱┗━━━┛╲         ╱┗━━━┛╲P
     *        |       ╱       ╲       ╱       ╲
     *  ┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓___┏━━━┓
     * B┗━━━┛╲ D┗━━━┛ H╱┗━━━┛╲  ┗━━━┛L ╱┗━━━┛╲Q ┗━━━┛T ╱┗━━━┛X
     *        ╲       |       ╲       ╱       ╲       ╱
     *        |       |        ╲┏━━━┓╱         ╲┏━━━┓╱
     *        |       |        ╱┗━━━┛╲M        ╱┗━━━┛╲U
     *        |       ╱       ╱       ╲       ╱       ╲
     *         ╲┏━━━┓╱__┏━━━┓╱__┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓
     *          ┗━━━┛E  ┗━━━┛I  ┗━━━┛N  ┗━━━┛R  ┗━━━┛V  ┗━━━┛Y
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
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let unitL: TaskUnit;
    let unitM: TaskUnit;
    let unitN: TaskUnit;
    let unitO: TaskUnit;
    let unitP: TaskUnit;
    let unitQ: TaskUnit;
    let unitR: TaskUnit;
    let unitS: TaskUnit;
    let unitT: TaskUnit;
    let unitU: TaskUnit;
    let unitV: TaskUnit;
    let unitW: TaskUnit;
    let unitX: TaskUnit;
    let unitY: TaskUnit;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      const sixthStartDate = new Date(fifthEndDate.getTime() + 1000);
      const sixthEndDate = new Date(sixthStartDate.getTime() + 1000);
      const seventhStartDate = new Date(sixthEndDate.getTime() + 1000);
      const seventhEndDate = new Date(seventhStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      unitB = new TaskUnit([], firstStartDate, firstEndDate, "B");

      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate, "C");
      unitD = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate, "D");
      unitE = new TaskUnit([unitB], secondStartDate, secondEndDate, "E");

      unitF = new TaskUnit([unitC], thirdStartDate, thirdEndDate, "F");
      unitG = new TaskUnit([unitC, unitD], thirdStartDate, thirdEndDate, "G");
      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate, "H");
      unitI = new TaskUnit([unitE], thirdStartDate, thirdEndDate, "I");

      unitJ = new TaskUnit([unitF], fourthStartDate, fourthEndDate, "J");
      unitK = new TaskUnit([unitF, unitG], fourthStartDate, fourthEndDate, "K");
      unitL = new TaskUnit([unitG, unitH], fourthStartDate, fourthEndDate, "L");
      unitM = new TaskUnit([unitH, unitI], fourthStartDate, fourthEndDate, "M");
      unitN = new TaskUnit([unitI], fourthStartDate, fourthEndDate, "N");

      unitO = new TaskUnit([unitJ, unitK], fifthStartDate, fifthEndDate, "O");
      unitP = new TaskUnit([unitK, unitL], fifthStartDate, fifthEndDate, "P");
      unitQ = new TaskUnit([unitL, unitM], fifthStartDate, fifthEndDate, "Q");
      unitR = new TaskUnit([unitM, unitN], fifthStartDate, fifthEndDate, "R");

      unitS = new TaskUnit([unitO, unitP], sixthStartDate, sixthEndDate, "S");
      unitT = new TaskUnit([unitP, unitQ], sixthStartDate, sixthEndDate, "T");
      unitU = new TaskUnit([unitQ, unitR], sixthStartDate, sixthEndDate, "U");
      unitV = new TaskUnit([unitR], sixthStartDate, sixthEndDate, "V");

      unitW = new TaskUnit(
        [unitS, unitT],
        seventhStartDate,
        seventhEndDate,
        "W"
      );
      unitX = new TaskUnit(
        [unitT, unitU],
        seventhStartDate,
        seventhEndDate,
        "X"
      );
      unitY = new TaskUnit(
        [unitU, unitV],
        seventhStartDate,
        seventhEndDate,
        "Y"
      );
    });
    describe("W", function () {
      it("should have 2 paths to P", function () {
        expect(unitW.getNumberOfPathsToDependency(unitP)).to.equal(2);
      });
      it("should have 3 paths to K", function () {
        expect(unitW.getNumberOfPathsToDependency(unitK)).to.equal(3);
      });
    });
  });
});
