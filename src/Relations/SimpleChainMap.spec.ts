import { expect } from "chai";
import {
  DependencyOrderError,
  DisjointedUnitsError,
  NoSuchChainError,
} from "../Error";
import { assertIsObject } from "../typePredicates";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import SimpleChainMap from "./SimpleChainMap";
import TaskUnit from "./TaskUnit";

describe("SimpleChainMap", function () {
  describe("No Units", function () {
    it("should throw RangeError", function () {
      expect(() => new SimpleChainMap([])).to.throw(RangeError);
    });
  });
  describe("One Unit", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let endDate: Date;
    let chainMap: SimpleChainMap;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate);
      chainMap = new SimpleChainMap([unit]);
    });
    it("should have one chain", function () {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get chain of unit", function () {
      const expectedChain = chainMap.chains[0];
      assertIsObject(expectedChain);
      expect(chainMap.getChainOfUnit(unit)).to.equal(expectedChain);
    });
    it("should throw NoSuchChainError when getting chain of unrecognized unit", function () {
      expect(() =>
        chainMap.getChainOfUnit(new TaskUnit([], startDate, endDate))
      ).to.throw(NoSuchChainError);
    });
    it("should throw NoSuchChainError when getting chains connected to unrecognized chain", function () {
      expect(() =>
        chainMap.getChainsConnectedToChain(
          new IsolatedDependencyChain([new TaskUnit([], startDate, endDate)])
        )
      ).to.throw(NoSuchChainError);
    });
  });
  describe("Two Standalone Heads", function () {
    /**
     * ```text
     *  ┏━━━┓  ┏━━━┓
     * A┗━━━┛  ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([], startDateB, endDateB);
    });
    it("should throw DisjointedUnitsError", function () {
      expect(() => new SimpleChainMap([unitA, unitB])).to.throw(
        DisjointedUnitsError
      );
    });
  });
  describe("Two Standalone Heads With Deps", function () {
    /**
     * ```text
     *   ┏━━━┓___┏━━━┓
     *  A┗━━━┛   ┗━━━┛C
     *   ┏━━━┓___┏━━━┓
     *  B┗━━━┛   ┗━━━┛D
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let firstStartDate: Date;
    let secondStartDate: Date;
    let firstEndDate: Date;
    let secondEndDate: Date;
    before(function () {
      firstStartDate = new Date();
      firstEndDate = new Date(firstStartDate.getTime() + 1000);
      secondStartDate = new Date(firstEndDate.getTime());
      secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitB], secondStartDate, secondEndDate);
    });
    it("should throw DisjointedUnitsError", function () {
      expect(() => new SimpleChainMap([unitC, unitD])).to.throw(
        DisjointedUnitsError
      );
    });
  });
  describe("Two Units in One Chain, Passing Non True Head", function () {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
    });
    it("should throw DependencyOrderError", function () {
      expect(() => new SimpleChainMap([unitA, unitB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Two Units in One Chain", function () {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let endDateA: Date;
    let endDateB: Date;
    let chainMap: SimpleChainMap;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      chainMap = new SimpleChainMap([unitB]);
    });
    it("should have one chain", function () {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get same chain for unitA and unitB", function () {
      expect(chainMap.getChainOfUnit(unitA)).to.equal(
        chainMap.getChainOfUnit(unitB)
      );
    });
  });
  describe("Three Units in One Chain", function () {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B    ┗━━━┛C
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let startDateA: Date;
    let startDateB: Date;
    let startDateC: Date;
    let endDateA: Date;
    let endDateB: Date;
    let endDateC: Date;
    let chainMap: SimpleChainMap;
    before(function () {
      startDateA = new Date();
      endDateA = new Date(startDateA.getTime() + 1000);
      startDateB = new Date(endDateA.getTime());
      endDateB = new Date(startDateB.getTime() + 1000);
      startDateC = new Date(endDateB.getTime());
      endDateC = new Date(startDateC.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitB], startDateC, endDateC);
      chainMap = new SimpleChainMap([unitC]);
    });
    it("should have one chain", function () {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get same chain for unitA, unitB, and unitC", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.equal(chainMap.getChainOfUnit(unitB))
        .and.to.equal(chainMap.getChainOfUnit(unitC));
    });
  });
  describe("Fork", function () {
    /**
     * ```text
     *         ┏━━━┓
     *        ╱┗━━━┛B
     *  ┏━━━┓╱
     * A┗━━━┛╲
     *        ╲┏━━━┓
     *         ┗━━━┛C
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);
      chainMap = new SimpleChainMap([unitB, unitC]);
    });
    it("should have 3 chains", function () {
      expect(chainMap.chains.length).to.equal(3);
    });
    it("should provide head chains for B and C", function () {
      expect(chainMap.getHeadChains()).to.have.members([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitC),
      ]);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB));
    });
    describe("Connections", function () {
      it("should have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork", function () {
    /**
     * ```text
     *                   ┏━━━┓
     *                  ╱┗━━━┛C
     *  ┏━━━┓_____┏━━━┓╱
     * A┗━━━┛     ┗━━━┛╲B
     *                  ╲┏━━━┓
     *                   ┗━━━┛D
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
      const thirdStartDate = new Date(endDateB.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have provide chains for A and B for dependencies of C", function () {
      expect([
        ...chainMap.getAllDependenciesOfChain(chainMap.getChainOfUnit(unitC)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitB),
      ]);
    });
    it("should have provide chains for A and B for dependencies of D", function () {
      expect([
        ...chainMap.getAllDependenciesOfChain(chainMap.getChainOfUnit(unitD)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitB),
      ]);
    });
    it("should have provide chain for B for chains connected to C", function () {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitC)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for B for chains connected to D", function () {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitD)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for B for chains connected to A", function () {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitA)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for A, C, and D for chains connected to B", function () {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitB)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitC),
        chainMap.getChainOfUnit(unitD),
      ]);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function () {
      it("should have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork, With Earlier Branch Being Chainable", function () {
    /**
     * ```text
     *                   ┏━━━┓___┏━━━┓
     *                  ╱┗━━━┛C  ┗━━━┛E
     *  ┏━━━┓_____┏━━━┓╱
     * A┗━━━┛     ┗━━━┛╲B
     *                  ╲┏━━━┓
     *                   ┗━━━┛D
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
      const thirdStartDate = new Date(endDateB.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime());
      const fourthEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitC], fourthStartDate, fourthEndDate);
      chainMap = new SimpleChainMap([unitD, unitE]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have same chain for unitC and unitE", function () {
      expect(chainMap.getChainOfUnit(unitC)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    describe("Connections", function () {
      it("should have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC and unitE connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork, With Later Branch Being Chainable", function () {
    /**
     * ```text
     *                   ┏━━━┓
     *                  ╱┗━━━┛C
     *  ┏━━━┓_____┏━━━┓╱
     * A┗━━━┛     ┗━━━┛╲B
     *                  ╲┏━━━┓___┏━━━┓
     *                   ┗━━━┛D  ┗━━━┛E
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
      const thirdStartDate = new Date(endDateB.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime());
      const fourthEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], startDateA, endDateA);
      unitB = new TaskUnit([unitA], startDateB, endDateB);
      unitC = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit([unitB], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitD], fourthStartDate, fourthEndDate);
      chainMap = new SimpleChainMap([unitC, unitE]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have same chain for unitD and unitE", function () {
      expect(chainMap.getChainOfUnit(unitD)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    describe("Connections", function () {
      it("should have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Merge", function () {
    /**
     * ```text
     *     ┏━━━┓
     *    A┗━━━┛╲
     *           ╲┏━━━┓
     *           ╱┗━━━┛C
     *     ┏━━━┓╱
     *    B┗━━━┛
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      chainMap = new SimpleChainMap([unitC]);
    });
    it("should have 3 chains", function () {
      expect(chainMap.chains.length).to.equal(3);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
    });
  });
  describe("Two Units Merging Before One Unit", function () {
    /**
     * ```text
     *     ┏━━━┓
     *    A┗━━━┛╲
     *           ╲┏━━━┓_____┏━━━┓
     *           ╱┗━━━┛C    ┗━━━┛D
     *     ┏━━━┓╱
     *    B┗━━━┛
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA, unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      chainMap = new SimpleChainMap([unitD]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
    });
  });
  describe("Two Units Merging Before Forking Into Two Units", function () {
    /**
     * ```text
     *     ┏━━━┓         ┏━━━┓
     *    A┗━━━┛╲       ╱┗━━━┛D
     *           ╲┏━━━┓╱
     *           ╱┗━━━┛╲C
     *     ┏━━━┓╱       ╲┏━━━┓
     *    B┗━━━┛         ┗━━━┛E
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      chainMap = new SimpleChainMap([unitD, unitE]);
    });
    it("should have 5 chains", function () {
      expect(chainMap.chains.length).to.equal(5);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitE than the other units", function () {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before One Unit Later Forking Into Two Units", function () {
    /**
     * ```text
     *     ┏━━━┓                 ┏━━━┓
     *    A┗━━━┛╲               ╱┗━━━┛E
     *           ╲┏━━━┓___┏━━━┓╱
     *           ╱┗━━━┛C  ┗━━━┛╲D
     *     ┏━━━┓╱               ╲┏━━━┓
     *    B┗━━━┛                 ┗━━━┛F
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime());
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitD], fourthStartDate, fourthEndDate);
      unitF = new TaskUnit([unitD], fourthStartDate, fourthEndDate);
      chainMap = new SimpleChainMap([unitE, unitF]);
    });
    it("should have 6 chains", function () {
      expect(chainMap.chains.length).to.equal(6);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitE than the other units", function () {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitD connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should have chain for unitD connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should not have chain for unitE connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before Two Units Later Forking Into Two Units", function () {
    /**
     * ```text
     *     ┏━━━┓                         ┏━━━┓
     *    A┗━━━┛╲                       ╱┗━━━┛F
     *           ╲┏━━━┓___┏━━━┓___┏━━━┓╱
     *           ╱┗━━━┛C  ┗━━━┛D  ┗━━━┛╲E
     *     ┏━━━┓╱                       ╲┏━━━┓
     *    B┗━━━┛                         ┗━━━┛G
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime());
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime());
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitD], fourthStartDate, fourthEndDate);
      unitF = new TaskUnit([unitE], fifthStartDate, fifthEndDate);
      unitG = new TaskUnit([unitE], fifthStartDate, fifthEndDate);
      chainMap = new SimpleChainMap([unitF, unitG]);
    });
    it("should have 7 chains", function () {
      expect(chainMap.chains.length).to.equal(7);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitE than the other units", function () {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitD connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitD connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitE connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should have chain for unitE connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.true;
      });
      it("should not have chain for unitF connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before Three Units Later Forking Into Two Units", function () {
    /**
     * ```text
     *     ┏━━━┓                                 ┏━━━┓
     *    A┗━━━┛╲                               ╱┗━━━┛G
     *           ╲┏━━━┓___┏━━━┓___┏━━━┓___┏━━━┓╱
     *           ╱┗━━━┛C  ┗━━━┛D  ┗━━━┛E  ┗━━━┛╲F
     *     ┏━━━┓╱                               ╲┏━━━┓
     *    B┗━━━┛                                 ┗━━━┛H
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
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime());
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime());
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      const sixthStartDate = new Date(fifthEndDate.getTime());
      const sixthEndDate = new Date(sixthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitC], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitD], fourthStartDate, fourthEndDate);
      unitF = new TaskUnit([unitE], fifthStartDate, fifthEndDate);
      unitG = new TaskUnit([unitF], sixthStartDate, sixthEndDate);
      unitH = new TaskUnit([unitF], sixthStartDate, sixthEndDate);
      chainMap = new SimpleChainMap([unitG, unitH]);
    });
    it("should have 7 chains", function () {
      expect(chainMap.chains.length).to.equal(7);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have same chain for unitD as unitE", function () {
      expect(chainMap.getChainOfUnit(unitD)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    it("should have different chain for unitD and unitE than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD and unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitE", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitD and unitE connected to chain for unitF", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD and unitE connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitD and unitE connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should not have chain for unitE connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitE connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitF connected to chain for unitG", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.true;
      });
      it("should have chain for unitF connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.true;
      });
      it("should not have chain for unitG connected to chain for unitH", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitG),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
    });
  });
  describe("Fork Before Merge", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         B╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   A┗━━━┛╲       ╱┗━━━┛D
     *          ╲┏━━━┓╱
     *          C┗━━━┛
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime());
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitB, unitC], thirdStartDate, thirdEndDate);
      chainMap = new SimpleChainMap([unitD]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function () {
      it("should have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
    });
  });
  describe("Four Units Interwoven", function () {
    /**
     * ```text
     *     ┏━━━┓____┏━━━┓
     *    A┗━━━┛╲  ╱┗━━━┛C
     *           ╲╱
     *           ╱╲
     *     ┏━━━┓╱__╲┏━━━┓
     *    B┗━━━┛    ┗━━━┛D
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Four Units Semi Interwoven", function () {
    /**
     * ```text
     *     ┏━━━┓____┏━━━┓
     *    A┗━━━┛╲   ┗━━━┛C
     *           ╲
     *            ╲
     *     ┏━━━┓___╲┏━━━┓
     *    B┗━━━┛    ┗━━━┛D
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime());
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitD = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should have 4 chains", function () {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function () {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function () {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function () {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function () {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function () {
      it("should not have chain for unitA connected to chain for unitB", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitC", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function () {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Complex Interdependence", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         D╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   A┗━━━┛╲       ╱┗━━━┛H
     *          ╲┏━━━┓╱
     *         E╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   B┗━━━┛╲       ╱┗━━━┛I
     *          ╲┏━━━┓╱
     *         F╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   C┗━━━┛╲       ╱┗━━━┛J
     *          ╲┏━━━┓╱
     *          G┗━━━┛
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
    let chainMap: SimpleChainMap;
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitE = new TaskUnit([unitA, unitB], secondStartDate, secondEndDate);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate);
      unitI = new TaskUnit([unitE, unitF], thirdStartDate, thirdEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);
      chainMap = new SimpleChainMap([unitH, unitI, unitJ]);
    });
    it("should have heads of I and J without A, D, and H", function () {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
          unitA,
          unitD,
          unitH,
        ])
      ).to.have.members([unitI, unitJ]);
    });
    it("should have heads of D, E, F, and G without H, I, and J", function () {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
          unitH,
          unitI,
          unitJ,
        ])
      ).to.have.members([unitD, unitE, unitF, unitG]);
    });
    it("should have head of just E without A, B, C, D, F, G, H, I, and J", function () {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
          unitA,
          unitB,
          unitC,
          unitD,
          unitF,
          unitG,
          unitH,
          unitI,
          unitJ,
        ])
      ).to.have.members([unitE]);
    });
    it("should have no heads without any units A, B, C, D, E, F, G, H, I, and J", function () {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
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
        ])
      ).to.have.members([]);
    });
  });
});
