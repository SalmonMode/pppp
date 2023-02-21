import { expect } from "chai";
import { DependencyOrderError, NoSuchChainError } from "../errors/Error";
import { assertIsObject } from "primitive-predicates";
import { IsolatedDependencyChain, SimpleChainMap, TaskUnit } from "./";

const now = new Date();
const firstDate = new Date(now.getTime() - 100000);
const secondDate = new Date(firstDate.getTime() + 1000);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);

describe("SimpleChainMap", function (): void {
  describe("No Units", function (): void {
    it("should throw RangeError", function (): void {
      expect(() => new SimpleChainMap([])).to.throw(RangeError);
    });
  });
  describe("One Unit", function (): void {
    let unit: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function (): void {
      unit = new TaskUnit({
        now,
        name: "unit",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      chainMap = new SimpleChainMap([unit]);
    });
    it("should have one chain", function (): void {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get chain of unit", function (): void {
      const expectedChain = chainMap.chains[0];
      assertIsObject(expectedChain);
      expect(chainMap.getChainOfUnit(unit)).to.equal(expectedChain);
    });
    it("should throw NoSuchChainError when getting chain of unrecognized unit", function (): void {
      expect(() =>
        chainMap.getChainOfUnit(
          new TaskUnit({
            now,
            name: "unit",
            anticipatedStartDate: firstDate,
            anticipatedEndDate: secondDate,
          })
        )
      ).to.throw(NoSuchChainError);
    });
    it("should throw NoSuchChainError when getting chains connected to unrecognized chain", function (): void {
      expect(() =>
        chainMap.getChainsConnectedToChain(
          new IsolatedDependencyChain([
            new TaskUnit({
              now,
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
            }),
          ])
        )
      ).to.throw(NoSuchChainError);
    });
  });
  describe("Two Units in One Chain, Passing Non True Head", function (): void {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
    });
    it("should throw DependencyOrderError", function (): void {
      expect(() => new SimpleChainMap([unitA, unitB])).to.throw(
        DependencyOrderError
      );
    });
  });
  describe("Two Units in One Chain", function (): void {
    /**
     * ```text
     *  ┏━━━┓_____┏━━━┓
     * A┗━━━┛     ┗━━━┛B
     * ```
     */
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let chainMap: SimpleChainMap;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chainMap = new SimpleChainMap([unitB]);
    });
    it("should have one chain", function (): void {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get same chain for unitA and unitB", function (): void {
      expect(chainMap.getChainOfUnit(unitA)).to.equal(
        chainMap.getChainOfUnit(unitB)
      );
    });
  });
  describe("Three Units in One Chain", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitC]);
    });
    it("should have one chain", function (): void {
      expect(chainMap.chains.length).to.equal(1);
    });
    it("should get same chain for unitA, unitB, and unitC", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.equal(chainMap.getChainOfUnit(unitB))
        .and.to.equal(chainMap.getChainOfUnit(unitC));
    });
  });
  describe("Fork", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chainMap = new SimpleChainMap([unitB, unitC]);
    });
    it("should have 3 chains", function (): void {
      expect(chainMap.chains.length).to.equal(3);
    });
    it("should provide head chains for B and C", function (): void {
      expect(chainMap.getHeadChains()).to.have.members([
        chainMap.getChainOfUnit(unitB),
        chainMap.getChainOfUnit(unitC),
      ]);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB));
    });
    describe("Connections", function (): void {
      it("should have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should provide all units", function (): void {
      expect(chainMap.units).to.have.members([unitA, unitB, unitC, unitD]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have provide chains for A and B for dependencies of C", function (): void {
      expect([
        ...chainMap.getAllDependenciesOfChain(chainMap.getChainOfUnit(unitC)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitB),
      ]);
    });
    it("should have provide chains for A and B for dependencies of D", function (): void {
      expect([
        ...chainMap.getAllDependenciesOfChain(chainMap.getChainOfUnit(unitD)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitB),
      ]);
    });
    it("should have provide chain for B for chains connected to C", function (): void {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitC)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for B for chains connected to D", function (): void {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitD)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for B for chains connected to A", function (): void {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitA)),
      ]).to.have.members([chainMap.getChainOfUnit(unitB)]);
    });
    it("should have provide chain for A, C, and D for chains connected to B", function (): void {
      expect([
        ...chainMap.getChainsConnectedToChain(chainMap.getChainOfUnit(unitB)),
      ]).to.have.members([
        chainMap.getChainOfUnit(unitA),
        chainMap.getChainOfUnit(unitC),
        chainMap.getChainOfUnit(unitD),
      ]);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function (): void {
      it("should have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork, With Earlier Branch Being Chainable", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      chainMap = new SimpleChainMap([unitD, unitE]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have same chain for unitC and unitE", function (): void {
      expect(chainMap.getChainOfUnit(unitC)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    describe("Connections", function (): void {
      it("should have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC and unitE connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("One Unit Chain Before Fork, With Later Branch Being Chainable", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      chainMap = new SimpleChainMap([unitC, unitE]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have same chain for unitD and unitE", function (): void {
      expect(chainMap.getChainOfUnit(unitD)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    describe("Connections", function (): void {
      it("should have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Merge", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chainMap = new SimpleChainMap([unitC]);
    });
    it("should have 3 chains", function (): void {
      expect(chainMap.chains.length).to.equal(3);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
    });
  });
  describe("Two Units Merging Before One Unit", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitD]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
    });
  });
  describe("Two Units Merging Before Forking Into Two Units", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitD, unitE]);
    });
    it("should have 5 chains", function (): void {
      expect(chainMap.chains.length).to.equal(5);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE));
    });
    it("should have different chain for unitE than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before One Unit Later Forking Into Two Units", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      chainMap = new SimpleChainMap([unitE, unitF]);
    });
    it("should have 6 chains", function (): void {
      expect(chainMap.chains.length).to.equal(6);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    it("should have different chain for unitE than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should have chain for unitD connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should have chain for unitD connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should not have chain for unitE connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before Two Units Later Forking Into Two Units", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      chainMap = new SimpleChainMap([unitF, unitG]);
    });
    it("should have 7 chains", function (): void {
      expect(chainMap.chains.length).to.equal(7);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitE than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitE))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitD connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitD connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should have chain for unitE connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should have chain for unitE connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.true;
      });
      it("should not have chain for unitF connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
    });
  });
  describe("Two Units Merging Before Three Units Later Forking Into Two Units", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD] }],
        anticipatedStartDate: fourthDate,
        anticipatedEndDate: fifthDate,
      });
      unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
      });
      unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: sixthDate,
        anticipatedEndDate: seventhDate,
      });
      chainMap = new SimpleChainMap([unitG, unitH]);
    });
    it("should have 7 chains", function (): void {
      expect(chainMap.chains.length).to.equal(7);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD))
        .and.to.not.equal(chainMap.getChainOfUnit(unitE))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    it("should have same chain for unitD as unitE", function (): void {
      expect(chainMap.getChainOfUnit(unitD)).to.equal(
        chainMap.getChainOfUnit(unitE)
      );
    });
    it("should have different chain for unitD and unitE than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitF))
        .and.to.not.equal(chainMap.getChainOfUnit(unitG));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitA connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitC connected to chain for unitD and unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitE", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitE)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitC connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitD and unitE connected to chain for unitF", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitF)
          )
        ).to.be.true;
      });
      it("should not have chain for unitD and unitE connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitD and unitE connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitD),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should not have chain for unitE connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.false;
      });
      it("should not have chain for unitE connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitE),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
      it("should have chain for unitF connected to chain for unitG", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitG)
          )
        ).to.be.true;
      });
      it("should have chain for unitF connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitF),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.true;
      });
      it("should not have chain for unitG connected to chain for unitH", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitG),
            chainMap.getChainOfUnit(unitH)
          )
        ).to.be.false;
      });
    });
  });
  describe("Fork Before Merge", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitD]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function (): void {
      it("should have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should not have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
      it("should not have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
    });
  });
  describe("Four Units Interwoven", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Four Units Semi Interwoven", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      chainMap = new SimpleChainMap([unitC, unitD]);
    });
    it("should have 4 chains", function (): void {
      expect(chainMap.chains.length).to.equal(4);
    });
    it("should have different chain for unitA than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitA))
        .to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitB than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitB))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitC than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitC))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitD));
    });
    it("should have different chain for unitD than the other units", function (): void {
      expect(chainMap.getChainOfUnit(unitD))
        .to.not.equal(chainMap.getChainOfUnit(unitA))
        .and.to.not.equal(chainMap.getChainOfUnit(unitB))
        .and.to.not.equal(chainMap.getChainOfUnit(unitC));
    });
    describe("Connections", function (): void {
      it("should not have chain for unitA connected to chain for unitB", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitB)
          )
        ).to.be.false;
      });
      it("should have chain for unitA connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.true;
      });
      it("should have chain for unitA connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitA),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitB connected to chain for unitC", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitC)
          )
        ).to.be.false;
      });
      it("should have chain for unitB connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitB),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.true;
      });
      it("should not have chain for unitC connected to chain for unitD", function (): void {
        expect(
          chainMap.chainsAreConnected(
            chainMap.getChainOfUnit(unitC),
            chainMap.getChainOfUnit(unitD)
          )
        ).to.be.false;
      });
    });
  });
  describe("Complex Interdependence", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });

      unitD = new TaskUnit({
        now,
        name: "D",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitE = new TaskUnit({
        now,
        name: "E",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitB] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitF = new TaskUnit({
        now,
        name: "F",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitB, unitC] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });
      unitG = new TaskUnit({
        now,
        name: "G",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
      });

      unitH = new TaskUnit({
        now,
        name: "H",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitD, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitI = new TaskUnit({
        now,
        name: "I",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitE, unitF] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      unitJ = new TaskUnit({
        now,
        name: "J",
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF, unitG] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
      });
      chainMap = new SimpleChainMap([unitH, unitI, unitJ]);
    });
    it("should have heads of I and J without A, D, and H", function (): void {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
          unitA,
          unitD,
          unitH,
        ])
      ).to.have.members([unitI, unitJ]);
    });
    it("should have heads of D, E, F, and G without H, I, and J", function (): void {
      expect(
        chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit([
          unitH,
          unitI,
          unitJ,
        ])
      ).to.have.members([unitD, unitE, unitF, unitG]);
    });
    it("should have head of just E without A, B, C, D, F, G, H, I, and J", function (): void {
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
    it("should have no heads without any units A, B, C, D, E, F, G, H, I, and J", function (): void {
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
