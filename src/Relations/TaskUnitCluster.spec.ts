import { expect } from "chai";
import {
  DependencyOrderError,
  DisjointedUnitsError,
  NoSuchChainError,
} from "../Error";
import { assertIsObject } from "../typePredicates";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import { default as TaskUnit } from "./TaskUnit";
import { default as TaskUnitCluster } from "./TaskUnitCluster";

describe("TaskUnitCluster", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new TaskUnitCluster([])).to.throw(RangeError);
    });
  });
  describe("Disjointed Units", function () {
    it("should throw DisjointedUnitsError", function () {
      expect(
        () =>
          new TaskUnitCluster([
            new TaskUnit([], new Date(), new Date()),
            new TaskUnit([], new Date(), new Date()),
          ])
      ).to.throw(DisjointedUnitsError);
    });
  });
  describe("One Unit", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    let cluster: TaskUnitCluster;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
      cluster = new TaskUnitCluster([unit]);
    });
    it("should have one chain", function () {
      expect(cluster.chains.length).to.equal(1);
    });
    it("should get chain of unit", function () {
      const expectedChain = cluster.chains[0];
      assertIsObject(expectedChain);
      expect(cluster.getChainOfUnit(unit)).to.equal(expectedChain);
    });
  });
  describe("One Unit (Get Chain of Unrelated Unit)", function () {
    let unit: TaskUnit;
    let unrelatedUnit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    let cluster: TaskUnitCluster;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
      unrelatedUnit = new TaskUnit([], startDate, endDate);
      cluster = new TaskUnitCluster([unit]);
    });
    it("should throw NoSuchChainError", function () {
      expect(() => cluster.getChainOfUnit(unrelatedUnit)).to.throw(
        NoSuchChainError
      );
    });
  });
  describe("Two Units", function () {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    let cluster: TaskUnitCluster;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      cluster = new TaskUnitCluster([unitA, unitB]);
    });
    it("should have one chain", function () {
      expect(cluster.chains.length).to.equal(1);
    });
    it("should get chain of unitA", function () {
      const expectedChain = cluster.chains[0];
      assertIsObject(expectedChain);
      expect(cluster.getChainOfUnit(unitA)).to.equal(expectedChain);
    });
    it("should get chain of unitB", function () {
      const expectedChain = cluster.chains[0];
      assertIsObject(expectedChain);
      expect(cluster.getChainOfUnit(unitA)).to.equal(expectedChain);
    });
    it("should provide same chain for unit A and B", function () {
      expect(cluster.getChainOfUnit(unitA)).to.equal(
        cluster.getChainOfUnit(unitB)
      );
    });
    it("should provide only unit B as the available when no isolated units are passed", function () {
      expect(cluster.getHeadsWithoutUnits([])).to.deep.equal([unitB]);
    });
  });
  describe("Chain Building", function () {
    /**
     * ```text
     * Chain 1:   ┏━━━━━━━━━━━┓__┏━━━━━━━━━━━┓
     *           A┗━━━━━━━━━━━┛ ╱┗━━━━━━━━━━━┛B
     *                      ___╱
     * Chain 2:      ┏━━━━┓╱
     *              C┗━━━━┛╲
     *                      ╲__________
     * Chain 3:   ┏━━━━┓_______________╲┏━━━━┓
     *           D┗━━━━┛                ┗━━━━┛E
     * ```
     */
    describe("Different Density (More Density First)", function () {
      /**
       * ```text
       *            ┏━━━━━━━━━━━┓              ┏━━━━━━━━━━━┓
       *           A┗━━━━━━━━━━━┛╲            ╱┗━━━━━━━━━━━┛B
       *                          ╲          ╱
       *                           ╲┏━━━━━━┓╱
       *                           C┗━━━━━━┛╲
       *                   _______╱          ╲_______
       *            ┏━━━━┓╱                          ╲┏━━━━┓
       *           D┗━━━━┛                            ┗━━━━┛E
       * Favors density
       *                             |
       *                             V
       *
       * Chain 1:   ┏━━━━━━━━━━━┓___┏━━━━━━┓___┏━━━━━━━━━━━┓
       *           A┗━━━━━━━━━━━┛  C┗━━━━━━┛   ┗━━━━━━━━━━━┛B
       *
       * Chain 2:   ┏━━━━┓                   Chain 3: ┏━━━━┓
       *           D┗━━━━┛                            ┗━━━━┛E
       * ```
       */
      let unitA: TaskUnit;
      let unitB: TaskUnit;
      let unitC: TaskUnit;
      let unitD: TaskUnit;
      let unitE: TaskUnit;
      let startDateA: Date;
      let startDateB: Date;
      let startDateC: Date;
      let startDateD: Date;
      let startDateE: Date;
      let endDateA: Date;
      let endDateB: Date;
      let endDateC: Date;
      let endDateD: Date;
      let endDateE: Date;
      let cluster: TaskUnitCluster;
      before(function () {
        startDateA = new Date();
        endDateA = new Date(startDateA.getTime() + 5000);
        startDateC = new Date(endDateA.getTime() + 1000);
        endDateC = new Date(startDateC.getTime() + 500);
        startDateB = new Date(endDateC.getTime() + 1000);
        endDateB = new Date(startDateB.getTime() + 5000);
        startDateD = new Date(startDateA.getTime());
        endDateD = new Date(startDateD.getTime() + 500);
        startDateE = new Date(endDateB.getTime() - 500);
        endDateE = new Date(endDateB.getTime());
        unitA = new TaskUnit([], startDateA, endDateA);
        unitD = new TaskUnit([], startDateD, endDateD);
        unitC = new TaskUnit([unitA, unitD], startDateC, endDateC);
        unitB = new TaskUnit([unitC], startDateB, endDateB);
        unitE = new TaskUnit([unitC], startDateE, endDateE);
        cluster = new TaskUnitCluster([unitA, unitB, unitC, unitD, unitE]);
      });
      it("should have greater potential visual density for A-C-B than D-C-E", function () {
        expect(
          new IsolatedDependencyChain([unitB, unitC, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitE, unitC, unitD]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just A, C, and B", function () {
        const aChain = cluster.getChainOfUnit(unitA);
        const bChain = cluster.getChainOfUnit(unitB);
        const cChain = cluster.getChainOfUnit(unitC);
        expect(aChain).to.equal(bChain).and.to.equal(cChain);
        expect(aChain.units.length).to.equal(3);
      });
      it("should have one chain with just D", function () {
        const dChain = cluster.getChainOfUnit(unitD);
        expect(dChain.units.length).to.equal(1);
      });
      it("should have one chain with just E", function () {
        const eChain = cluster.getChainOfUnit(unitE);
        expect(eChain.units.length).to.equal(1);
      });
    });
    describe("Different Density (Less Density First)", function () {
      /**
       * ```text
       *            ┏━━━━┓                            ┏━━━━┓
       *           A┗━━━━┛╲_______            _______╱┗━━━━┛B
       *                          ╲          ╱
       *                           ╲┏━━━━━━┓╱
       *                           C┗━━━━━━┛╲
       *                          ╱          ╲
       *            ┏━━━━━━━━━━━┓╱            ╲┏━━━━━━━━━━━┓
       *           D┗━━━━━━━━━━━┛              ┗━━━━━━━━━━━┛E
       * Favors density
       *                             |
       *                             V
       *
       * Chain 1:   ┏━━━━━━━━━━━┓___┏━━━━━━┓___┏━━━━━━━━━━━┓
       *           D┗━━━━━━━━━━━┛  C┗━━━━━━┛   ┗━━━━━━━━━━━┛E
       *
       * Chain 2:   ┏━━━━┓                   Chain 3: ┏━━━━┓
       *           A┗━━━━┛                            ┗━━━━┛B
       * ```
       */
      let unitA: TaskUnit;
      let unitB: TaskUnit;
      let unitC: TaskUnit;
      let unitD: TaskUnit;
      let unitE: TaskUnit;
      let startDateA: Date;
      let startDateB: Date;
      let startDateC: Date;
      let startDateD: Date;
      let startDateE: Date;
      let endDateA: Date;
      let endDateB: Date;
      let endDateC: Date;
      let endDateD: Date;
      let endDateE: Date;
      let cluster: TaskUnitCluster;
      before(function () {
        startDateD = new Date();
        endDateD = new Date(startDateD.getTime() + 5000);
        startDateC = new Date(endDateD.getTime() + 1000);
        endDateC = new Date(startDateC.getTime() + 500);
        startDateE = new Date(endDateC.getTime() + 1000);
        endDateE = new Date(startDateE.getTime() + 5000);
        startDateA = new Date(startDateD.getTime());
        endDateA = new Date(startDateA.getTime() + 500);
        startDateB = new Date(endDateE.getTime() - 500);
        endDateB = new Date(endDateE.getTime());
        unitA = new TaskUnit([], startDateA, endDateA);
        unitD = new TaskUnit([], startDateD, endDateD);
        unitC = new TaskUnit([unitA, unitD], startDateC, endDateC);
        unitB = new TaskUnit([unitC], startDateB, endDateB);
        unitE = new TaskUnit([unitC], startDateE, endDateE);
        cluster = new TaskUnitCluster([unitA, unitB, unitC, unitD, unitE]);
      });
      it("should have greater potential visual density for D-C-E than A-C-B", function () {
        expect(
          new IsolatedDependencyChain([unitE, unitC, unitD]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitB, unitC, unitA]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just D, C, and E", function () {
        const dChain = cluster.getChainOfUnit(unitD);
        const eChain = cluster.getChainOfUnit(unitE);
        const cChain = cluster.getChainOfUnit(unitC);
        expect(dChain).to.equal(eChain).and.to.equal(cChain);
        expect(dChain.units.length).to.equal(3);
      });
      it("should have one chain with just A", function () {
        const aChain = cluster.getChainOfUnit(unitA);
        expect(aChain.units.length).to.equal(1);
      });
      it("should have one chain with just B", function () {
        const bChain = cluster.getChainOfUnit(unitB);
        expect(bChain.units.length).to.equal(1);
      });
    });
    describe("Same Density, Different Presence (More Presence First)", function () {
      /**
       * ```text
       *                                           6
       *                             ╭─────────────┴──────────────╮
       *                                                    3
       *                                              ╭─────┴─────╮
       *                               1              ┏━━━━━━━━━━━┓
       *                             ╭─┴─╮ __________╱┗━━━━━━━━━━━┛B
       *                             ┏━━━┓╱
       *                            A┗━━━┛╲
       *                                   ╲┏━━━┓
       *                            _______╱┗━━━┛D
       *                      ┏━━━┓╱        ╰─┬─╯
       *                     C┗━━━┛           1
       *                      ╰─┬─╯  ╰────┬─────╯
       *                        1         3
       *                      ╰───────┬─────────╯
       *                              4
       * Favors presence when density
       * is equal
       *                                |
       *                                V
       *
       * Chain 1:                           ┏━━━━━━━━━━━┓
       *                                    ┗━━━━━━━━━━━┛B
       *
       * Chain 2:         ┏━━━┓__┏━━━┓
       *                 A┗━━━┛  ┗━━━┛D
       *
       * Chain 2:   ┏━━━┓
       *           C┗━━━┛
       * ```
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
      let cluster: TaskUnitCluster;
      before(function () {
        startDateA = new Date();
        endDateA = new Date(startDateA.getTime() + 1000);
        startDateB = new Date(endDateA.getTime() + 2000);
        endDateB = new Date(startDateB.getTime() + 3000);
        startDateD = new Date(endDateA.getTime() + 1000);
        endDateD = new Date(startDateD.getTime() + 1000);
        endDateC = new Date(startDateD.getTime() - 2000);
        startDateC = new Date(endDateC.getTime() - 1000);
        unitA = new TaskUnit([], startDateA, endDateA);
        unitB = new TaskUnit([unitA], startDateB, endDateB);
        unitC = new TaskUnit([], startDateC, endDateC);
        unitD = new TaskUnit([unitA, unitC], startDateD, endDateD);
        cluster = new TaskUnitCluster([unitA, unitB, unitC, unitD]);
      });
      it("should have same potential visual density between A-B and A-D", function () {
        expect(
          new IsolatedDependencyChain([unitD, unitA]).visualDensity
        ).to.equal(new IsolatedDependencyChain([unitB, unitA]).visualDensity);
      });
      it("should have lower potential visual density for C-D than A-D", function () {
        expect(
          new IsolatedDependencyChain([unitD, unitC]).visualDensity
        ).to.be.lessThan(
          new IsolatedDependencyChain([unitD, unitA]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just A and D", function () {
        const aChain = cluster.getChainOfUnit(unitA);
        const dChain = cluster.getChainOfUnit(unitD);
        expect(aChain).to.equal(dChain);
        expect(aChain.units.length).to.equal(2);
      });
      it("should have one chain with just B", function () {
        const bChain = cluster.getChainOfUnit(unitB);
        expect(bChain.units.length).to.equal(1);
      });
      it("should have one chain with just C", function () {
        const cChain = cluster.getChainOfUnit(unitC);
        expect(cChain.units.length).to.equal(1);
      });
    });
    describe("Same Density, Different Presence (Less Presence First)", function () {
      /**
       * ```text
       *                          6
       *              ╭───────────┴────────╮
       *                    3
       *              ╭─────┴────╮
       *                       1
       *                     ╭─┴─╮
       *                1    ┏━━━┓
       *              ╭─┴─╮ ╱┗━━━┛B
       *              ┏━━━┓╱
       *             A┗━━━┛╲__
       *                      ╲┏━━━━━━━━━━━┓
       *              ________╱┗━━━━━━━━━━━┛D
       *        ┏━━━┓╱         ╰─────┬─────╯
       *       C┗━━━┛                3
       *        ╰─┬─╯
       *          1
       *        ╰─────────────┬────────────╯
       *                      7
       * Favors presence when density
       * is equal
       *                                |
       *                                V
       *
       * Chain 1:       ┏━━━┓_______┏━━━━━━━━━━━┓
       *               A┗━━━┛       ┗━━━━━━━━━━━┛D
       *
       * Chain 2:                ┏━━━┓
       *                         ┗━━━┛B
       *
       * Chain 3:   ┏━━━┓
       *           C┗━━━┛
       * ```
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
      let cluster: TaskUnitCluster;
      before(function () {
        startDateA = new Date();
        endDateA = new Date(startDateA.getTime() + 1000);
        startDateB = new Date(endDateA.getTime() + 1000);
        endDateB = new Date(startDateB.getTime() + 1000);
        startDateD = new Date(endDateA.getTime() + 2000);
        endDateD = new Date(startDateD.getTime() + 3000);
        endDateC = new Date(startDateD.getTime() - 3000);
        startDateC = new Date(endDateC.getTime() - 1000);
        unitA = new TaskUnit([], startDateA, endDateA);
        unitB = new TaskUnit([unitA], startDateB, endDateB);
        unitC = new TaskUnit([], startDateC, endDateC);
        unitD = new TaskUnit([unitA, unitC], startDateD, endDateD);
        cluster = new TaskUnitCluster([unitA, unitB, unitC, unitD]);
      });
      it("should have same potential visual density between A-B and A-D", function () {
        expect(
          new IsolatedDependencyChain([unitB, unitA]).visualDensity
        ).to.equal(new IsolatedDependencyChain([unitD, unitA]).visualDensity);
      });
      it("should have lower potential visual density for C-D than A-D", function () {
        expect(
          new IsolatedDependencyChain([unitD, unitC]).visualDensity
        ).to.be.lessThan(
          new IsolatedDependencyChain([unitD, unitA]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just A and D", function () {
        const aChain = cluster.getChainOfUnit(unitA);
        const dChain = cluster.getChainOfUnit(unitD);
        expect(aChain).to.equal(dChain);
        expect(aChain.units.length).to.equal(2);
      });
      it("should have one chain with just B", function () {
        const bChain = cluster.getChainOfUnit(unitB);
        expect(bChain.units.length).to.equal(1);
      });
      it("should have one chain with just C", function () {
        const cChain = cluster.getChainOfUnit(unitC);
        expect(cChain.units.length).to.equal(1);
      });
    });
    describe("Complex Interconnections", function () {
      /**
       * ```text
       *
       *                  ╭  ┏━━━┓___┏━━━┓___┏━━━┓  ╮
       *                  │ A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C │
       *                  │        ╳       ╳        ├ 4 Connections
       *    0 Connections ┤  ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓  │╮
       *                  │ D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F ╯│
       *                  │        ╳       ╳         ├ 4 Connections
       *                  │  ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓   │
       *                  ╰ G┗━━━┛   ┗━━━┛H  ┗━━━┛I  ╯
       *
       *                              | Favors cascading attachment. F has 3 paths to D and only 2 paths to A, so it
       *                              | will favor D. C has no preference between A and D, because it has 2 paths to
       *                              V each.
       *
       *       Chain 1:   ┏━━━┓___┏━━━┓___┏━━━┓
       *                 A┗━━━┛   ┗━━━┛B  ┗━━━┛C
       *
       *       Chain 2:   ┏━━━┓___┏━━━┓___┏━━━┓
       *                 D┗━━━┛   ┗━━━┛E  ┗━━━┛F
       *
       *       Chain 3:   ┏━━━┓___┏━━━┓___┏━━━┓
       *                 G┗━━━┛   ┗━━━┛H  ┗━━━┛I
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
      let startDateA: Date;
      let startDateB: Date;
      let startDateC: Date;
      let startDateD: Date;
      let startDateE: Date;
      let startDateF: Date;
      let startDateG: Date;
      let startDateH: Date;
      let startDateI: Date;
      let endDateA: Date;
      let endDateB: Date;
      let endDateC: Date;
      let endDateD: Date;
      let endDateE: Date;
      let endDateF: Date;
      let endDateG: Date;
      let endDateH: Date;
      let endDateI: Date;
      let aChain: IsolatedDependencyChain;
      let bChain: IsolatedDependencyChain;
      let cChain: IsolatedDependencyChain;
      let dChain: IsolatedDependencyChain;
      let eChain: IsolatedDependencyChain;
      let fChain: IsolatedDependencyChain;
      let gChain: IsolatedDependencyChain;
      let hChain: IsolatedDependencyChain;
      let iChain: IsolatedDependencyChain;
      let cluster: TaskUnitCluster;
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
        startDateC = new Date(thirdUnitStart.getTime());
        endDateC = new Date(thirdUnitEnd.getTime());

        startDateD = new Date(firstUnitStart.getTime());
        endDateD = new Date(firstUnitEnd.getTime());
        startDateE = new Date(secondUnitStart.getTime());
        endDateE = new Date(secondUnitEnd.getTime());
        startDateF = new Date(thirdUnitStart.getTime());
        endDateF = new Date(thirdUnitEnd.getTime());

        startDateG = new Date(firstUnitStart.getTime());
        endDateG = new Date(firstUnitEnd.getTime());
        startDateH = new Date(secondUnitStart.getTime());
        endDateH = new Date(secondUnitEnd.getTime());
        startDateI = new Date(thirdUnitStart.getTime());
        endDateI = new Date(thirdUnitEnd.getTime());

        unitA = new TaskUnit([], startDateA, endDateA);
        unitD = new TaskUnit([], startDateD, endDateD);
        unitG = new TaskUnit([], startDateG, endDateG);

        unitB = new TaskUnit([unitA, unitD], startDateB, endDateB);
        unitE = new TaskUnit([unitA, unitD, unitG], startDateE, endDateE);
        unitH = new TaskUnit([unitD, unitG], startDateH, endDateH);

        unitC = new TaskUnit([unitB, unitE], startDateC, endDateC);
        unitF = new TaskUnit([unitB, unitE, unitH], startDateF, endDateF);
        unitI = new TaskUnit([unitE, unitH], startDateI, endDateI);

        cluster = new TaskUnitCluster([
          unitA,
          unitB,
          unitC,
          unitD,
          unitE,
          unitF,
          unitG,
          unitH,
          unitI,
        ]);
        aChain = cluster.getChainOfUnit(unitA);
        bChain = cluster.getChainOfUnit(unitB);
        cChain = cluster.getChainOfUnit(unitC);
        dChain = cluster.getChainOfUnit(unitD);
        eChain = cluster.getChainOfUnit(unitE);
        fChain = cluster.getChainOfUnit(unitF);
        gChain = cluster.getChainOfUnit(unitG);
        hChain = cluster.getChainOfUnit(unitH);
        iChain = cluster.getChainOfUnit(unitI);
      });
      it("should have same potential visual density for A-B-C and D-E-F", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        );
      });
      it("should have same potential visual density for A-B-C and G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have same potential visual density for D-E-F and G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just A, B, and C", function () {
        expect(aChain).to.equal(bChain).and.to.equal(cChain);
        expect(aChain.units.length).to.equal(3);
      });
      it("should have one chain with just D, E, and F", function () {
        expect(dChain).to.equal(eChain).and.to.equal(fChain);
        expect(dChain.units.length).to.equal(3);
      });
      it("should have one chain with just G, H, and I", function () {
        expect(gChain).to.equal(hChain).and.to.equal(iChain);
        expect(gChain.units.length).to.equal(3);
      });
      it("should have 4 connections between chains for A-B-C and D-E-F", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, dChain)
        ).to.equal(4);
      });
      it("should have 4 connections between chains for D-E-F and A-B-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, aChain)
        ).to.equal(4);
      });
      it("should have 0 connections between chains for A-B-C and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, gChain)
        ).to.equal(0);
      });
      it("should have 0 connections between chains for G-H-I and A-B-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, aChain)
        ).to.equal(0);
      });
      it("should have 4 connections between chains for D-E-F and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, gChain)
        ).to.equal(4);
      });
      it("should have 4 connections between chains for G-H-I and D-E-F", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, dChain)
        ).to.equal(4);
      });
      it("should recognize when it doesn't own an unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(cluster.ownsChain(unrelatedChain)).to.be.false;
      });
      it("should throw NoSuchChainError when trying to get strength map for unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() => cluster.getStrengthMapForChain(unrelatedChain)).to.throw(
          NoSuchChainError
        );
      });
      it("should throw NoSuchChainError when trying to get number of connections between unrelated and owned chains", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(unrelatedChain, aChain)
        ).to.throw(NoSuchChainError);
      });
      it("should throw NoSuchChainError when trying to get number of connections between owned and unrelated chains", function () {
        // same as the other one, but looking it up from the other direction to make sure it throws an appropriate error
        // when the other chain isn't owned by the same cluster.
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(aChain, unrelatedChain)
        ).to.throw(NoSuchChainError);
      });
    });
    describe("Complex Interconnections (Passed To Cluster Init Center Out) (Unit Deps Are Least Connected First)", function () {
      /**
       * ```text
       *
       *                  ╭  ┏━━━┓___┏━━━┓___┏━━━┓  ╮
       *                  │ A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C │
       *                  │        ╳       ╳        ├ 4 Connections
       *    0 Connections ┤  ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓  │╮        
       *                  │ D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F ╯│
       *                  │        ╳       ╳         ├ 4 Connections
       *                  │  ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓   │        
       *                  ╰ G┗━━━┛   ┗━━━┛H  ┗━━━┛I  ╯        
       
       *                              | 
       *                              V 
       *
       *       Chain 1:   ┏━━━┓___┏━━━┓___┏━━━┓ 
       *                 A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
       *                        ╳       ╳       
       *       Chain 2:   ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓ 
       *                 D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
       *                        ╳       ╳       
       *       Chain 3:   ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓ 
       *                 G┗━━━┛   ┗━━━┛H  ┗━━━┛I
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
      let startDateA: Date;
      let startDateB: Date;
      let startDateC: Date;
      let startDateD: Date;
      let startDateE: Date;
      let startDateF: Date;
      let startDateG: Date;
      let startDateH: Date;
      let startDateI: Date;
      let endDateA: Date;
      let endDateB: Date;
      let endDateC: Date;
      let endDateD: Date;
      let endDateE: Date;
      let endDateF: Date;
      let endDateG: Date;
      let endDateH: Date;
      let endDateI: Date;
      let aChain: IsolatedDependencyChain;
      let bChain: IsolatedDependencyChain;
      let cChain: IsolatedDependencyChain;
      let dChain: IsolatedDependencyChain;
      let eChain: IsolatedDependencyChain;
      let fChain: IsolatedDependencyChain;
      let gChain: IsolatedDependencyChain;
      let hChain: IsolatedDependencyChain;
      let iChain: IsolatedDependencyChain;
      let cluster: TaskUnitCluster;
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
        startDateC = new Date(thirdUnitStart.getTime());
        endDateC = new Date(thirdUnitEnd.getTime());

        startDateD = new Date(firstUnitStart.getTime());
        endDateD = new Date(firstUnitEnd.getTime());
        startDateE = new Date(secondUnitStart.getTime());
        endDateE = new Date(secondUnitEnd.getTime());
        startDateF = new Date(thirdUnitStart.getTime());
        endDateF = new Date(thirdUnitEnd.getTime());

        startDateG = new Date(firstUnitStart.getTime());
        endDateG = new Date(firstUnitEnd.getTime());
        startDateH = new Date(secondUnitStart.getTime());
        endDateH = new Date(secondUnitEnd.getTime());
        startDateI = new Date(thirdUnitStart.getTime());
        endDateI = new Date(thirdUnitEnd.getTime());

        unitA = new TaskUnit([], startDateA, endDateA);
        unitD = new TaskUnit([], startDateD, endDateD);
        unitG = new TaskUnit([], startDateG, endDateG);

        unitB = new TaskUnit([unitA, unitD], startDateB, endDateB);
        unitE = new TaskUnit([unitA, unitD, unitG], startDateE, endDateE);
        unitH = new TaskUnit([unitD, unitG], startDateH, endDateH);

        unitC = new TaskUnit([unitB, unitE], startDateC, endDateC);
        unitF = new TaskUnit([unitB, unitE, unitH], startDateF, endDateF);
        unitI = new TaskUnit([unitE, unitH], startDateI, endDateI);

        cluster = new TaskUnitCluster([
          unitE,
          unitH,
          unitB,
          unitF,
          unitI,
          unitC,
          unitD,
          unitG,
          unitA,
        ]);
        aChain = cluster.getChainOfUnit(unitA);
        bChain = cluster.getChainOfUnit(unitB);
        cChain = cluster.getChainOfUnit(unitC);
        dChain = cluster.getChainOfUnit(unitD);
        eChain = cluster.getChainOfUnit(unitE);
        fChain = cluster.getChainOfUnit(unitF);
        gChain = cluster.getChainOfUnit(unitG);
        hChain = cluster.getChainOfUnit(unitH);
        iChain = cluster.getChainOfUnit(unitI);
      });
      it("should have same potential visual density for A-B-C and D-E-F", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        );
      });
      it("should have same potential visual density for A-B-C and G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have same potential visual density for D-E-F and G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        ).to.be.equal(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have only three chains", function () {
        expect(cluster.chains.length).to.equal(3);
      });
      it("should have one chain with just A, B, and C", function () {
        expect(aChain).to.equal(bChain).and.to.equal(cChain);
        expect(aChain.units.length).to.equal(3);
      });
      it("should have one chain with just D, E, and F", function () {
        expect(dChain).to.equal(eChain).and.to.equal(fChain);
        expect(dChain.units.length).to.equal(3);
      });
      it("should have one chain with just G, H, and I", function () {
        expect(gChain).to.equal(hChain).and.to.equal(iChain);
        expect(gChain.units.length).to.equal(3);
      });
      it("should have 4 connections between chains for A-B-C and D-E-F", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, dChain)
        ).to.equal(4);
      });
      it("should have 4 connections between chains for D-E-F and A-B-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, aChain)
        ).to.equal(4);
      });
      it("should have 0 connections between chains for A-B-C and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, gChain)
        ).to.equal(0);
      });
      it("should have 0 connections between chains for G-H-I and A-B-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, aChain)
        ).to.equal(0);
      });
      it("should have 4 connections between chains for D-E-F and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, gChain)
        ).to.equal(4);
      });
      it("should have 4 connections between chains for G-H-I and D-E-F", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, dChain)
        ).to.equal(4);
      });
      it("should recognize when it doesn't own an unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(cluster.ownsChain(unrelatedChain)).to.be.false;
      });
      it("should throw NoSuchChainError when trying to get strength map for unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() => cluster.getStrengthMapForChain(unrelatedChain)).to.throw(
          NoSuchChainError
        );
      });
      it("should throw NoSuchChainError when trying to get number of connections between unrelated and owned chains", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(unrelatedChain, aChain)
        ).to.throw(NoSuchChainError);
      });
      it("should throw NoSuchChainError when trying to get number of connections between owned and unrelated chains", function () {
        // same as the other one, but looking it up from the other direction to make sure it throws an appropriate error
        // when the other chain isn't owned by the same cluster.
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(aChain, unrelatedChain)
        ).to.throw(NoSuchChainError);
      });
    });
    describe("Complex Interconnections (Redundant Connection)", function () {
      /**
       * ```text
       *
       *                  ╭  ┏━━━━━━━━━━━┓____┏━━━━━━━━━━━┓____┏━━━━━━━━━━━┓  ╮
       *                  │ A┗━━━━━━━━━━━┛╲  ╱┗━━━━━━━━━━━┛B  ╱┗━━━━━━━━━━━┛C │
       *                  │            ____╲╱             ___╱                ├ 3 Connections
       *                  │           ╱     ╲____________╱_________           │
       *    0 Connections ┤  ┏━━━━━━┓╱_________╲┏━━━━━━┓╱__________╲┏━━━━━━┓  │╮
       *                  │ D┗━━━━━━┛          ╱┗━━━━━━┛E           ┗━━━━━━┛F ╯│
       *                  │         __________╱                                ├ 1 Connections
       *                  │        ╱                                           │
       *                  │  ┏━━━┓╱_______________┏━━━┓________________┏━━━┓   │
       *                  ╰ G┗━━━┛               H┗━━━┛               I┗━━━┛   ╯
       *
       *                                         |  The redundant connection from A to F (implied by
       *                                         V  the connection from A to E) should not be counted.
       *
       *       Chain 1:     ┏━━━━━━━━━━━┓____┏━━━━━━━━━━━┓____┏━━━━━━━━━━━┓
       *                   A┗━━━━━━━━━━━┛╲  ╱┗━━━━━━━━━━━┛B  ╱┗━━━━━━━━━━━┛C
       *                              ____╲╱             ___╱
       *                             ╱     ╲__          ╱
       *       Chain 2:     ┏━━━━━━┓╱_________╲┏━━━━━━┓╱___________┏━━━━━━┓
       *                   D┗━━━━━━┛          ╱┗━━━━━━┛E           ┗━━━━━━┛F
       *                           __________╱
       *                          ╱
       *       Chain 3:     ┏━━━┓╱_______________┏━━━┓________________┏━━━┓
       *                   G┗━━━┛               H┗━━━┛               I┗━━━┛
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
      let startDateA: Date;
      let startDateB: Date;
      let startDateC: Date;
      let startDateD: Date;
      let startDateE: Date;
      let startDateF: Date;
      let startDateG: Date;
      let startDateH: Date;
      let startDateI: Date;
      let endDateA: Date;
      let endDateB: Date;
      let endDateC: Date;
      let endDateD: Date;
      let endDateE: Date;
      let endDateF: Date;
      let endDateG: Date;
      let endDateH: Date;
      let endDateI: Date;
      let aChain: IsolatedDependencyChain;
      let bChain: IsolatedDependencyChain;
      let cChain: IsolatedDependencyChain;
      let dChain: IsolatedDependencyChain;
      let eChain: IsolatedDependencyChain;
      let fChain: IsolatedDependencyChain;
      let gChain: IsolatedDependencyChain;
      let hChain: IsolatedDependencyChain;
      let iChain: IsolatedDependencyChain;
      let cluster: TaskUnitCluster;
      before(function () {
        const leftBoundDate = new Date();
        const rightBoundDate = new Date(leftBoundDate.getTime() + 11000);
        const centerDate = new Date(
          (leftBoundDate.getTime() + rightBoundDate.getTime()) / 2
        );
        const chainOneTaskSize = 3000;
        startDateA = new Date(leftBoundDate.getTime());
        endDateA = new Date(startDateA.getTime() + chainOneTaskSize);
        startDateB = new Date(centerDate.getTime() - chainOneTaskSize / 2);
        endDateB = new Date(startDateB.getTime() + chainOneTaskSize);
        startDateC = new Date(rightBoundDate.getTime() - chainOneTaskSize);
        endDateC = new Date(rightBoundDate.getTime());

        const chainTwoTaskSize = 2000;
        startDateD = new Date(leftBoundDate.getTime());
        endDateD = new Date(startDateD.getTime() + chainTwoTaskSize);
        startDateE = new Date(centerDate.getTime() - chainTwoTaskSize / 2);
        endDateE = new Date(startDateE.getTime() + chainTwoTaskSize);
        startDateF = new Date(rightBoundDate.getTime() - chainTwoTaskSize);
        endDateF = new Date(rightBoundDate.getTime());

        const chainThreeTaskSize = 1000;
        startDateG = new Date(leftBoundDate.getTime());
        endDateG = new Date(startDateG.getTime() + chainThreeTaskSize);
        startDateH = new Date(centerDate.getTime() - chainThreeTaskSize / 2);
        endDateH = new Date(startDateH.getTime() + chainThreeTaskSize);
        startDateI = new Date(rightBoundDate.getTime() - chainThreeTaskSize);
        endDateI = new Date(rightBoundDate.getTime());

        unitA = new TaskUnit([], startDateA, endDateA);
        unitD = new TaskUnit([], startDateD, endDateD);
        unitG = new TaskUnit([], startDateG, endDateG);

        unitB = new TaskUnit([unitA, unitD], startDateB, endDateB);
        unitE = new TaskUnit([unitA, unitD, unitG], startDateE, endDateE);
        unitH = new TaskUnit([unitG], startDateH, endDateH);

        unitC = new TaskUnit([unitB, unitE], startDateC, endDateC);
        unitF = new TaskUnit([unitA, unitE], startDateF, endDateF);
        unitI = new TaskUnit([unitH], startDateI, endDateI);

        cluster = new TaskUnitCluster([
          unitA,
          unitB,
          unitC,
          unitD,
          unitE,
          unitF,
          unitG,
          unitH,
          unitI,
        ]);
        aChain = cluster.getChainOfUnit(unitA);
        bChain = cluster.getChainOfUnit(unitB);
        cChain = cluster.getChainOfUnit(unitC);
        dChain = cluster.getChainOfUnit(unitD);
        eChain = cluster.getChainOfUnit(unitE);
        fChain = cluster.getChainOfUnit(unitF);
        gChain = cluster.getChainOfUnit(unitG);
        hChain = cluster.getChainOfUnit(unitH);
        iChain = cluster.getChainOfUnit(unitI);
      });
      it("should throw DependencyOrderError when trying to build A-F chain", function () {
        expect(() => new IsolatedDependencyChain([unitF, unitA])).to.throw(
          DependencyOrderError
        );
      });
      it("should have greater potential visual density for A-B-C than D-E-F", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        );
      });
      it("should have greater potential visual density for A-B-C than D-B-C", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitC, unitB, unitD]).visualDensity
        );
      });
      it("should have greater potential visual density for A-B-C than D-E-C", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitC, unitE, unitD]).visualDensity
        );
      });
      it("should have greater potential visual density for A-B-C than A-E-F", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitF, unitE, unitA]).visualDensity
        );
      });
      it("should have greater potential visual density for A-B-C than G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitC, unitB, unitA]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have greater potential visual density for D-E-F than G-E-F", function () {
        expect(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitF, unitE, unitG]).visualDensity
        );
      });
      it("should have greater potential visual density for D-E-F than G-H-I", function () {
        expect(
          new IsolatedDependencyChain([unitF, unitE, unitD]).visualDensity
        ).to.be.greaterThan(
          new IsolatedDependencyChain([unitI, unitH, unitG]).visualDensity
        );
      });
      it("should have only four chains", function () {
        expect(cluster.chains.length).to.equal(4);
      });
      it("should have one chain with just C, E, and A", function () {
        expect(cChain).to.equal(eChain).and.to.equal(aChain);
        expect(cChain.units.length).to.equal(3);
      });
      it("should have one chain with just D and B", function () {
        expect(dChain).to.equal(bChain);
        expect(dChain.units.length).to.equal(2);
      });
      it("should have one chain with just G, H, and I", function () {
        expect(gChain).to.equal(hChain).and.to.equal(iChain);
        expect(gChain.units.length).to.equal(3);
      });
      it("should have one chain with just F", function () {
        expect(fChain.units.length).to.equal(1);
      });
      it("should have 3 connections between chains for A-E-C and D-B", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, dChain)
        ).to.equal(3);
      });
      it("should have 3 connections between chains for D-B and A-E-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, aChain)
        ).to.equal(3);
      });
      it("should have 1 connection between chains for A-E-C and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(aChain, gChain)
        ).to.equal(1);
      });
      it("should have 1 connection between chains for G-H-I and A-E-C", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, aChain)
        ).to.equal(1);
      });
      it("should have 0 connections between chains for D-B and G-H-I", function () {
        expect(
          cluster.getNumberOfConnectionsBetweenChains(dChain, gChain)
        ).to.equal(0);
      });
      it("should have 0 connections between chains for G-H-I and D-B", function () {
        // same as the other one, but looking it up from the other direction to make sure that's working as well
        expect(
          cluster.getNumberOfConnectionsBetweenChains(gChain, dChain)
        ).to.equal(0);
      });
      it("should recognize when it doesn't own an unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(cluster.ownsChain(unrelatedChain)).to.be.false;
      });
      it("should throw NoSuchChainError when trying to get strength map for unrelated chain", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() => cluster.getStrengthMapForChain(unrelatedChain)).to.throw(
          NoSuchChainError
        );
      });
      it("should throw NoSuchChainError when trying to get number of connections between unrelated and owned chains", function () {
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(unrelatedChain, aChain)
        ).to.throw(NoSuchChainError);
      });
      it("should throw NoSuchChainError when trying to get number of connections between owned and unrelated chains", function () {
        // same as the other one, but looking it up from the other direction to make sure it throws an appropriate error
        // when the other chain isn't owned by the same cluster.
        const unrelatedChain = new IsolatedDependencyChain([
          new TaskUnit([], new Date(), new Date()),
        ]);
        expect(() =>
          cluster.getNumberOfConnectionsBetweenChains(aChain, unrelatedChain)
        ).to.throw(NoSuchChainError);
      });
    });
  });
});
