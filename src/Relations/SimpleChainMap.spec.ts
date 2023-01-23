import { expect } from "chai";
import { DependencyOrderError, NoSuchChainError } from "../Error";
import { assertIsObject } from "../typePredicates";
import { EventType } from "../types";
import { IsolatedDependencyChain, SimpleChainMap, TaskUnit } from "./";

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
  describe("Two Units in One Chain, Passing Non True Head", function () {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
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
    let chainMap: SimpleChainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
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
    let chainMap: SimpleChainMap;
    before(function () {
      const startDateA = new Date();
      const endDateA = new Date(startDateA.getTime() + 1000);
      const startDateB = new Date(endDateA.getTime());
      const endDateB = new Date(startDateB.getTime() + 1000);
      const startDateC = new Date(endDateB.getTime());
      const endDateC = new Date(startDateC.getTime() + 1000);
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
  describe("Complex Interdependence With Delays", function () {
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
     *
     *             |
     *             V
     *
     *           ┬┬┬┬┬┬┬┏━━━┓
     *           ┴┴┴┴┴D╱┗━━━┛╲
     *    ┬┬┬┬┬┬┬┏━━━┓╱ ┬┬┬┬┬┬╲┏━━━┓
     *   A┴┴┴┴┴┴┴┗━━━┛╲ ┴┴┴┴┴┴╱┗━━━┛H
     *          ┬┬┬┬┬┬E╲┏━━━┓╱
     *          ┴┴┴┴┴┴┴╱┗━━━┛╲
     *    ┏━━━┓╱        ┬┬┬┬┬┬╲┏━━━┓
     *   B┗━━━┛╲       _┴┴┴┴┴┴╱┗━━━┛I
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
    const normalTaskDuration = 1000;
    const firstStartDate = new Date();
    const firstEndDate = new Date(
      firstStartDate.getTime() + normalTaskDuration
    );
    const secondStartDate = new Date(firstEndDate.getTime());
    const secondEndDate = new Date(
      secondStartDate.getTime() + normalTaskDuration
    );
    const thirdStartDate = new Date(secondEndDate.getTime());
    const thirdEndDate = new Date(
      thirdStartDate.getTime() + normalTaskDuration
    );
    const fourthStartDate = new Date(thirdEndDate.getTime());
    const fourthEndDate = new Date(
      fourthStartDate.getTime() + normalTaskDuration
    );
    const aDelay = secondStartDate.getTime() - firstStartDate.getTime();
    before(function () {
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A", [
        { type: EventType.TaskStarted, date: secondStartDate },
      ]);
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
    it("should have A anticipated to start at first date", function () {
      expect(unitA.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A anticipated to end at first date", function () {
      expect(unitA.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have A apparently starting at second date", function () {
      expect(unitA.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have A apparently ending at second date", function () {
      expect(unitA.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have B anticipated to start at first date", function () {
      expect(unitB.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B anticipated to end at first date", function () {
      expect(unitB.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have B apparently starting at first date", function () {
      expect(unitB.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B apparently ending at first date", function () {
      expect(unitB.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C anticipated to start at first date", function () {
      expect(unitC.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C anticipated to end at first date", function () {
      expect(unitC.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C apparently starting at first date", function () {
      expect(unitC.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C apparently ending at first date", function () {
      expect(unitC.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have D anticipated to start at second date", function () {
      expect(unitD.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have D anticipated to end at second date", function () {
      expect(unitD.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have D apparently starting at third date", function () {
      expect(unitD.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D apparently ending at third date", function () {
      expect(unitD.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E anticipated to start at second date", function () {
      expect(unitE.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have E anticipated to end at second date", function () {
      expect(unitE.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have E apparently starting at third date", function () {
      expect(unitE.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E apparently ending at third date", function () {
      expect(unitE.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have F anticipated to start at second date", function () {
      expect(unitF.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F anticipated to end at second date", function () {
      expect(unitF.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have F apparently starting at second date", function () {
      expect(unitF.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F apparently ending at second date", function () {
      expect(unitF.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G anticipated to start at second date", function () {
      expect(unitG.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G anticipated to end at second date", function () {
      expect(unitG.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G apparently starting at second date", function () {
      expect(unitG.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G apparently ending at second date", function () {
      expect(unitG.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have H anticipated to start at third date", function () {
      expect(unitH.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have H anticipated to end at third date", function () {
      expect(unitH.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have H apparently starting at fourth date", function () {
      expect(unitH.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H apparently ending at fourth date", function () {
      expect(unitH.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I anticipated to start at third date", function () {
      expect(unitI.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have I anticipated to end at third date", function () {
      expect(unitI.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have I apparently starting at fourth date", function () {
      expect(unitI.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I apparently ending at fourth date", function () {
      expect(unitI.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have J anticipated to start at third date", function () {
      expect(unitJ.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J anticipated to end at third date", function () {
      expect(unitJ.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have J apparently starting at third date", function () {
      expect(unitJ.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J apparently ending at third date", function () {
      expect(unitJ.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have presence of normal duration plus A's delay for A", function () {
      expect(unitA.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration for B", function () {
      expect(unitB.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for C", function () {
      expect(unitC.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration plus A's delay for D", function () {
      expect(unitD.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration plus A's delay for E", function () {
      expect(unitE.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration for F", function () {
      expect(unitF.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for G", function () {
      expect(unitG.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration plus A's delay for H", function () {
      expect(unitH.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration plus A's delay for I", function () {
      expect(unitI.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration for J", function () {
      expect(unitJ.presenceTime).to.equal(normalTaskDuration);
    });
  });
  describe("Complex Interdependence With Delays But Task Was Scheduled Later Anyway", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         D╱┗━━━┛╲_______
     *    ┏━━━┓╱              ╲┏━━━┓
     *   A┗━━━┛╲              ╱┗━━━┛H
     *          ╲_______┏━━━┓╱
     *          ╱      E┗━━━┛╲
     *    ┏━━━┓╱              ╲┏━━━┓
     *   B┗━━━┛╲       _______╱┗━━━┛I
     *          ╲┏━━━┓╱
     *         F╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   C┗━━━┛╲       ╱┗━━━┛J
     *          ╲┏━━━┓╱
     *          G┗━━━┛
     *
     *             |
     *             V
     *
     *                  ┏━━━┓
     *                D╱┗━━━┛╲
     *    ┬┬┬┬┬┬┬┏━━━┓╱       ╲┏━━━┓
     *   A┴┴┴┴┴┴┴┗━━━┛╲       ╱┗━━━┛H
     *                E╲┏━━━┓╱
     *          _______╱┗━━━┛╲
     *    ┏━━━┓╱              ╲┏━━━┓
     *   B┗━━━┛╲       _______╱┗━━━┛I
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
    const normalTaskDuration = 1000;
    const firstStartDate = new Date();
    const firstEndDate = new Date(
      firstStartDate.getTime() + normalTaskDuration
    );
    const secondStartDate = new Date(firstEndDate.getTime() + 1500);
    const secondEndDate = new Date(
      secondStartDate.getTime() + normalTaskDuration
    );
    const thirdStartDate = new Date(
      secondEndDate.getTime() + normalTaskDuration
    );
    const thirdEndDate = new Date(
      thirdStartDate.getTime() + normalTaskDuration
    );
    const fourthStartDate = new Date(
      thirdEndDate.getTime() + normalTaskDuration
    );
    const fourthEndDate = new Date(
      fourthStartDate.getTime() + normalTaskDuration
    );
    const aDelay = firstEndDate.getTime() - firstStartDate.getTime();
    before(function () {
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A", [
        { type: EventType.TaskStarted, date: firstEndDate },
      ]);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitA, unitB], thirdStartDate, thirdEndDate);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], fourthStartDate, fourthEndDate);
      unitI = new TaskUnit([unitE, unitF], fourthStartDate, fourthEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);

      chainMap = new SimpleChainMap([unitH, unitI, unitJ]);
    });
    it("should have A anticipated to start at first date", function () {
      expect(unitA.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A anticipated to end at first date", function () {
      expect(unitA.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have A apparently starting at first end date", function () {
      expect(unitA.apparentStartDate).to.deep.equal(firstEndDate);
    });
    it("should have A apparently ending after first end date and before second start date", function () {
      expect(unitA.apparentEndDate)
        .to.be.greaterThan(firstEndDate)
        .and.lessThan(secondStartDate);
    });
    it("should have B anticipated to start at first date", function () {
      expect(unitB.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B anticipated to end at first date", function () {
      expect(unitB.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have B apparently starting at first date", function () {
      expect(unitB.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B apparently ending at first date", function () {
      expect(unitB.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C anticipated to start at first date", function () {
      expect(unitC.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C anticipated to end at first date", function () {
      expect(unitC.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C apparently starting at first date", function () {
      expect(unitC.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C apparently ending at first date", function () {
      expect(unitC.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have D anticipated to start at third date", function () {
      expect(unitD.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D anticipated to end at third date", function () {
      expect(unitD.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have D apparently starting at third date", function () {
      expect(unitD.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D apparently ending at third date", function () {
      expect(unitD.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E anticipated to start at third date", function () {
      expect(unitE.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E anticipated to end at third date", function () {
      expect(unitE.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E apparently starting at third date", function () {
      expect(unitE.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E apparently ending at third date", function () {
      expect(unitE.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have F anticipated to start at second date", function () {
      expect(unitF.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F anticipated to end at second date", function () {
      expect(unitF.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have F apparently starting at second date", function () {
      expect(unitF.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F apparently ending at second date", function () {
      expect(unitF.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G anticipated to start at second date", function () {
      expect(unitG.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G anticipated to end at second date", function () {
      expect(unitG.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G apparently starting at second date", function () {
      expect(unitG.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G apparently ending at second date", function () {
      expect(unitG.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have H anticipated to start at fourth date", function () {
      expect(unitH.anticipatedStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H anticipated to end at fourth date", function () {
      expect(unitH.anticipatedEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have H apparently starting at fourth date", function () {
      expect(unitH.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H apparently ending at fourth date", function () {
      expect(unitH.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I anticipated to start at fourth date", function () {
      expect(unitI.anticipatedStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I anticipated to end at fourth date", function () {
      expect(unitI.anticipatedEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I apparently starting at fourth date", function () {
      expect(unitI.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I apparently ending at fourth date", function () {
      expect(unitI.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have J anticipated to start at third date", function () {
      expect(unitJ.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J anticipated to end at third date", function () {
      expect(unitJ.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have J apparently starting at third date", function () {
      expect(unitJ.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J apparently ending at third date", function () {
      expect(unitJ.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have presence of normal duration plus A's delay for A", function () {
      expect(unitA.presenceTime).to.equal(normalTaskDuration + aDelay);
    });
    it("should have presence of normal duration for B", function () {
      expect(unitB.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for C", function () {
      expect(unitC.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for D", function () {
      expect(unitD.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for E", function () {
      expect(unitE.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for F", function () {
      expect(unitF.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for G", function () {
      expect(unitG.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for H", function () {
      expect(unitH.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for I", function () {
      expect(unitI.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for J", function () {
      expect(unitJ.presenceTime).to.equal(normalTaskDuration);
    });
  });
  describe("Complex Interdependence With Extensions", function () {
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
     *
     *             |
     *             V
     *
     *           ┬┬┬┬┬┬┬┏━━━┓
     *           ┴┴┴┴┴D╱┗━━━┛╲
     *    ┏━━━━━━━━━━┓╱ ┬┬┬┬┬┬╲┏━━━┓
     *   A┗━━━━━━━━━━┛╲ ┴┴┴┴┴┴╱┗━━━┛H
     *          ┬┬┬┬┬┬E╲┏━━━┓╱
     *          ┴┴┴┴┴┴┴╱┗━━━┛╲
     *    ┏━━━┓╱        ┬┬┬┬┬┬╲┏━━━┓
     *   B┗━━━┛╲       _┴┴┴┴┴┴╱┗━━━┛I
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
    const normalTaskDuration = 1000;
    const firstStartDate = new Date();
    const firstEndDate = new Date(
      firstStartDate.getTime() + normalTaskDuration
    );
    const secondStartDate = new Date(firstEndDate.getTime());
    const secondEndDate = new Date(
      secondStartDate.getTime() + normalTaskDuration
    );
    const thirdStartDate = new Date(secondEndDate.getTime());
    const thirdEndDate = new Date(
      thirdStartDate.getTime() + normalTaskDuration
    );
    const fourthStartDate = new Date(thirdEndDate.getTime());
    const fourthEndDate = new Date(
      fourthStartDate.getTime() + normalTaskDuration
    );
    const aExtension = secondEndDate.getTime() - firstEndDate.getTime();
    before(function () {
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A", [
        { type: EventType.TaskStarted, date: firstStartDate },
        { type: EventType.ReviewedAndComplete, date: secondEndDate },
      ]);
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
    it("should have A anticipated to start at first date", function () {
      expect(unitA.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A anticipated to end at first date", function () {
      expect(unitA.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have A apparently starting at first date", function () {
      expect(unitA.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A apparently ending at second date", function () {
      expect(unitA.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have B anticipated to start at first date", function () {
      expect(unitB.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B anticipated to end at first date", function () {
      expect(unitB.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have B apparently starting at first date", function () {
      expect(unitB.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B apparently ending at first date", function () {
      expect(unitB.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C anticipated to start at first date", function () {
      expect(unitC.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C anticipated to end at first date", function () {
      expect(unitC.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C apparently starting at first date", function () {
      expect(unitC.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C apparently ending at first date", function () {
      expect(unitC.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have D anticipated to start at second date", function () {
      expect(unitD.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have D anticipated to end at second date", function () {
      expect(unitD.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have D apparently starting at third date", function () {
      expect(unitD.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D apparently ending at third date", function () {
      expect(unitD.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E anticipated to start at second date", function () {
      expect(unitE.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have E anticipated to end at second date", function () {
      expect(unitE.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have E apparently starting at third date", function () {
      expect(unitE.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E apparently ending at third date", function () {
      expect(unitE.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have F anticipated to start at second date", function () {
      expect(unitF.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F anticipated to end at second date", function () {
      expect(unitF.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have F apparently starting at second date", function () {
      expect(unitF.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F apparently ending at second date", function () {
      expect(unitF.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G anticipated to start at second date", function () {
      expect(unitG.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G anticipated to end at second date", function () {
      expect(unitG.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G apparently starting at second date", function () {
      expect(unitG.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G apparently ending at second date", function () {
      expect(unitG.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have H anticipated to start at third date", function () {
      expect(unitH.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have H anticipated to end at third date", function () {
      expect(unitH.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have H apparently starting at fourth date", function () {
      expect(unitH.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H apparently ending at fourth date", function () {
      expect(unitH.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I anticipated to start at third date", function () {
      expect(unitI.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have I anticipated to end at third date", function () {
      expect(unitI.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have I apparently starting at fourth date", function () {
      expect(unitI.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I apparently ending at fourth date", function () {
      expect(unitI.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have J anticipated to start at third date", function () {
      expect(unitJ.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J anticipated to end at third date", function () {
      expect(unitJ.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have J apparently starting at third date", function () {
      expect(unitJ.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J apparently ending at third date", function () {
      expect(unitJ.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have presence of normal duration plus A's extension for A", function () {
      expect(unitA.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration for B", function () {
      expect(unitB.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for C", function () {
      expect(unitC.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration plus A's extension for D", function () {
      expect(unitD.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration plus A's extension for E", function () {
      expect(unitE.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration for F", function () {
      expect(unitF.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for G", function () {
      expect(unitG.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration plus A's extension for H", function () {
      expect(unitH.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration plus A's extension for I", function () {
      expect(unitI.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration for J", function () {
      expect(unitJ.presenceTime).to.equal(normalTaskDuration);
    });
  });
  describe("Complex Interdependence With Extensions But Task Was Scheduled Later Anyway", function () {
    /**
     * ```text
     *           ┏━━━┓
     *         D╱┗━━━┛╲_______
     *    ┏━━━┓╱              ╲┏━━━┓
     *   A┗━━━┛╲              ╱┗━━━┛H
     *          ╲_______┏━━━┓╱
     *          ╱      E┗━━━┛╲
     *    ┏━━━┓╱              ╲┏━━━┓
     *   B┗━━━┛╲       _______╱┗━━━┛I
     *          ╲┏━━━┓╱
     *         F╱┗━━━┛╲
     *    ┏━━━┓╱       ╲┏━━━┓
     *   C┗━━━┛╲       ╱┗━━━┛J
     *          ╲┏━━━┓╱
     *          G┗━━━┛
     *
     *             |
     *             V
     *
     *                  ┏━━━┓
     *                D╱┗━━━┛╲
     *    ┏━━━━━━━━━━┓╱       ╲┏━━━┓
     *   A┗━━━━━━━━━━┛╲       ╱┗━━━┛H
     *                E╲┏━━━┓╱
     *          _______╱┗━━━┛╲
     *    ┏━━━┓╱              ╲┏━━━┓
     *   B┗━━━┛╲       _______╱┗━━━┛I
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
    const normalTaskDuration = 1000;
    const firstStartDate = new Date();
    const firstEndDate = new Date(
      firstStartDate.getTime() + normalTaskDuration
    );
    const secondStartDate = new Date(firstEndDate.getTime() + 1500);
    const secondEndDate = new Date(
      secondStartDate.getTime() + normalTaskDuration
    );
    const thirdStartDate = new Date(
      secondEndDate.getTime() + normalTaskDuration
    );
    const thirdEndDate = new Date(
      thirdStartDate.getTime() + normalTaskDuration
    );
    const fourthStartDate = new Date(
      thirdEndDate.getTime() + normalTaskDuration
    );
    const fourthEndDate = new Date(
      fourthStartDate.getTime() + normalTaskDuration
    );
    const aExtension = normalTaskDuration;
    before(function () {
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A", [
        { type: EventType.TaskStarted, date: firstStartDate },
        {
          type: EventType.ReviewedAndComplete,
          date: new Date(firstEndDate.getTime() + normalTaskDuration),
        },
      ]);
      unitA.apparentEndDate = new Date(firstEndDate.getTime() + 1000);
      unitB = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);

      unitD = new TaskUnit([unitA], thirdStartDate, thirdEndDate);
      unitE = new TaskUnit([unitA, unitB], thirdStartDate, thirdEndDate);
      unitF = new TaskUnit([unitB, unitC], secondStartDate, secondEndDate);
      unitG = new TaskUnit([unitC], secondStartDate, secondEndDate);

      unitH = new TaskUnit([unitD, unitE], fourthStartDate, fourthEndDate);
      unitI = new TaskUnit([unitE, unitF], fourthStartDate, fourthEndDate);
      unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate);

      chainMap = new SimpleChainMap([unitH, unitI, unitJ]);
    });
    it("should have A anticipated to start at first date", function () {
      expect(unitA.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A anticipated to end at first date", function () {
      expect(unitA.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have A apparently starting at first start date", function () {
      expect(unitA.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have A apparently ending after first end date and before second start date", function () {
      expect(unitA.apparentEndDate)
        .to.be.greaterThan(firstEndDate)
        .and.lessThan(secondStartDate);
    });
    it("should have B anticipated to start at first date", function () {
      expect(unitB.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B anticipated to end at first date", function () {
      expect(unitB.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have B apparently starting at first date", function () {
      expect(unitB.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have B apparently ending at first date", function () {
      expect(unitB.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C anticipated to start at first date", function () {
      expect(unitC.anticipatedStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C anticipated to end at first date", function () {
      expect(unitC.anticipatedEndDate).to.deep.equal(firstEndDate);
    });
    it("should have C apparently starting at first date", function () {
      expect(unitC.apparentStartDate).to.deep.equal(firstStartDate);
    });
    it("should have C apparently ending at first date", function () {
      expect(unitC.apparentEndDate).to.deep.equal(firstEndDate);
    });
    it("should have D anticipated to start at third date", function () {
      expect(unitD.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D anticipated to end at third date", function () {
      expect(unitD.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have D apparently starting at third date", function () {
      expect(unitD.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have D apparently ending at third date", function () {
      expect(unitD.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E anticipated to start at third date", function () {
      expect(unitE.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E anticipated to end at third date", function () {
      expect(unitE.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have E apparently starting at third date", function () {
      expect(unitE.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have E apparently ending at third date", function () {
      expect(unitE.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have F anticipated to start at second date", function () {
      expect(unitF.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F anticipated to end at second date", function () {
      expect(unitF.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have F apparently starting at second date", function () {
      expect(unitF.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have F apparently ending at second date", function () {
      expect(unitF.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G anticipated to start at second date", function () {
      expect(unitG.anticipatedStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G anticipated to end at second date", function () {
      expect(unitG.anticipatedEndDate).to.deep.equal(secondEndDate);
    });
    it("should have G apparently starting at second date", function () {
      expect(unitG.apparentStartDate).to.deep.equal(secondStartDate);
    });
    it("should have G apparently ending at second date", function () {
      expect(unitG.apparentEndDate).to.deep.equal(secondEndDate);
    });
    it("should have H anticipated to start at fourth date", function () {
      expect(unitH.anticipatedStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H anticipated to end at fourth date", function () {
      expect(unitH.anticipatedEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have H apparently starting at fourth date", function () {
      expect(unitH.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have H apparently ending at fourth date", function () {
      expect(unitH.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I anticipated to start at fourth date", function () {
      expect(unitI.anticipatedStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I anticipated to end at fourth date", function () {
      expect(unitI.anticipatedEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have I apparently starting at fourth date", function () {
      expect(unitI.apparentStartDate).to.deep.equal(fourthStartDate);
    });
    it("should have I apparently ending at fourth date", function () {
      expect(unitI.apparentEndDate).to.deep.equal(fourthEndDate);
    });
    it("should have J anticipated to start at third date", function () {
      expect(unitJ.anticipatedStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J anticipated to end at third date", function () {
      expect(unitJ.anticipatedEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have J apparently starting at third date", function () {
      expect(unitJ.apparentStartDate).to.deep.equal(thirdStartDate);
    });
    it("should have J apparently ending at third date", function () {
      expect(unitJ.apparentEndDate).to.deep.equal(thirdEndDate);
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).anticipatedStartDate).to.deep.equal(
        unitA.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for A", function () {
      expect(chainMap.getChainOfUnit(unitA).endDate).to.deep.equal(
        unitA.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).anticipatedStartDate).to.deep.equal(
        unitB.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for B", function () {
      expect(chainMap.getChainOfUnit(unitB).endDate).to.deep.equal(
        unitB.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).anticipatedStartDate).to.deep.equal(
        unitC.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for C", function () {
      expect(chainMap.getChainOfUnit(unitC).endDate).to.deep.equal(
        unitC.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).anticipatedStartDate).to.deep.equal(
        unitD.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for D", function () {
      expect(chainMap.getChainOfUnit(unitD).endDate).to.deep.equal(
        unitD.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).anticipatedStartDate).to.deep.equal(
        unitE.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for E", function () {
      expect(chainMap.getChainOfUnit(unitE).endDate).to.deep.equal(
        unitE.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).anticipatedStartDate).to.deep.equal(
        unitF.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for F", function () {
      expect(chainMap.getChainOfUnit(unitF).endDate).to.deep.equal(
        unitF.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).anticipatedStartDate).to.deep.equal(
        unitG.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for G", function () {
      expect(chainMap.getChainOfUnit(unitG).endDate).to.deep.equal(
        unitG.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).anticipatedStartDate).to.deep.equal(
        unitH.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for H", function () {
      expect(chainMap.getChainOfUnit(unitH).endDate).to.deep.equal(
        unitH.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).anticipatedStartDate).to.deep.equal(
        unitI.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for I", function () {
      expect(chainMap.getChainOfUnit(unitI).endDate).to.deep.equal(
        unitI.apparentEndDate
      );
    });
    it("should have same start time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).anticipatedStartDate).to.deep.equal(
        unitJ.anticipatedStartDate
      );
    });
    it("should have same end time of unit for chain for J", function () {
      expect(chainMap.getChainOfUnit(unitJ).endDate).to.deep.equal(
        unitJ.apparentEndDate
      );
    });
    it("should have presence of normal duration plus A's extension for A", function () {
      expect(unitA.presenceTime).to.equal(normalTaskDuration + aExtension);
    });
    it("should have presence of normal duration for B", function () {
      expect(unitB.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for C", function () {
      expect(unitC.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for D", function () {
      expect(unitD.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for E", function () {
      expect(unitE.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for F", function () {
      expect(unitF.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for G", function () {
      expect(unitG.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for H", function () {
      expect(unitH.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for I", function () {
      expect(unitI.presenceTime).to.equal(normalTaskDuration);
    });
    it("should have presence of normal duration for J", function () {
      expect(unitJ.presenceTime).to.equal(normalTaskDuration);
    });
  });
});
