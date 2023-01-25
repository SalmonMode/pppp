import { expect } from "chai";
import { PrematureTaskStartError } from "../Error";
import { EventType } from "../types";
import { TaskUnit } from "./";
import { assumedReqTime } from "./constants";

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
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(startDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(startDate);
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
    it("should have projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.TaskIterationStarted, date: startDate },
        { type: EventType.ReviewedAndAccepted, date: endDate },
      ]);
    });
  });
  describe("ReviewedAndAccepted Event Provided", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let actualEndDate: Date;
    let endDate: Date;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      actualEndDate = new Date(endDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate, undefined, [
        { type: EventType.TaskIterationStarted, date: startDate },
        { type: EventType.ReviewedAndAccepted, date: actualEndDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        actualEndDate.getTime() - startDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(startDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(endDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(startDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(actualEndDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([]);
    });
  });
  describe("Ends With TaskIterationStarted Event", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let actualEndDate: Date;
    let endDate: Date;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      actualEndDate = new Date(endDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate, undefined, [
        { type: EventType.TaskIterationStarted, date: startDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        endDate.getTime() - startDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(startDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(endDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(startDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(endDate);
    });
    it("should have projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        {
          type: EventType.ReviewedAndAccepted,
          date: new Date(endDate.getTime()),
        },
      ]);
    });
  });
  describe("Ends With Delayed TaskIterationStarted Event", function () {
    let unit: TaskUnit;
    let startDate: Date;
    let actualStartDate: Date;
    let endDate: Date;
    before(function () {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 1000);
      actualStartDate = new Date(endDate.getTime() + 1000);
      unit = new TaskUnit([], startDate, endDate, undefined, [
        { type: EventType.TaskIterationStarted, date: actualStartDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        actualStartDate.getTime() - startDate.getTime() + 1000
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(startDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(endDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(actualStartDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(
        new Date(actualStartDate.getTime() + 1000)
      );
    });
    it("should have projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        {
          type: EventType.ReviewedAndAccepted,
          date: new Date(actualStartDate.getTime() + 1000),
        },
      ]);
    });
  });
  describe("Ends With MinorRevisionComplete Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
        { type: EventType.MinorRevisionComplete, date: thirdDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        thirdDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(thirdDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([]);
    });
  });
  describe("Ends With Delayed MinorRevisionComplete Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: secondDate },
        { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
        { type: EventType.MinorRevisionComplete, date: fourthDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        fourthDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(fourthDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([]);
    });
  });
  describe("Ends With ReviewedAndNeedsMajorRevision Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndNeedsMajorRevision, date: secondDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        thirdDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(thirdDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.ReviewedAndAccepted, date: thirdDate },
      ]);
    });
  });
  describe("Ends With Delayed ReviewedAndNeedsMajorRevision Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: secondDate },
        { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        fourthDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(fourthDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.ReviewedAndAccepted, date: fourthDate },
      ]);
    });
  });
  describe("Ends With ReviewedAndNeedsMinorRevision Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        thirdDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(thirdDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.MinorRevisionComplete, date: thirdDate },
      ]);
    });
  });
  describe("Ends With Delayed ReviewedAndNeedsMinorRevision Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: secondDate },
        { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        fourthDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(fourthDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.MinorRevisionComplete, date: fourthDate },
      ]);
    });
  });
  describe("Ends With ReviewedAndNeedsRebuild Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + assumedReqTime);
      fourthDate = new Date(thirdDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndNeedsRebuild, date: secondDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        fourthDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(fourthDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.TaskIterationStarted, date: thirdDate },
        { type: EventType.ReviewedAndAccepted, date: fourthDate },
      ]);
    });
  });
  describe("Ends With Delayed ReviewedAndNeedsRebuild Event", function () {
    let unit: TaskUnit;
    let firstDate: Date;
    let secondDate: Date;
    let thirdDate: Date;
    let fourthDate: Date;
    let fifthDate: Date;
    before(function () {
      firstDate = new Date();
      secondDate = new Date(firstDate.getTime() + 1000);
      thirdDate = new Date(secondDate.getTime() + 1000);
      fourthDate = new Date(thirdDate.getTime() + assumedReqTime);
      fifthDate = new Date(fourthDate.getTime() + 1000);
      unit = new TaskUnit([], firstDate, secondDate, undefined, [
        { type: EventType.TaskIterationStarted, date: secondDate },
        { type: EventType.ReviewedAndNeedsRebuild, date: thirdDate },
      ]);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        fifthDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct anticipated end date", function () {
      expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(secondDate);
    });
    it("should have correct apparent end date", function () {
      expect(unit.apparentEndDate).to.deep.equal(fifthDate);
    });
    it("should have no projected history", function () {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.TaskIterationStarted, date: fourthDate },
        { type: EventType.ReviewedAndAccepted, date: fifthDate },
      ]);
    });
  });
  describe("Non TaskStarted Event Provided First", function () {
    describe("ReviewedAndAccepted", function () {
      let startDate: Date;
      let endDate: Date;
      before(function () {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 1000);
      });
      it("should throw Error", function () {
        expect(
          () =>
            new TaskUnit([], startDate, endDate, undefined, [
              { type: EventType.ReviewedAndAccepted, date: startDate },
            ])
        ).to.throw(Error);
      });
    });
    describe("MinorRevisionComplete", function () {
      let startDate: Date;
      let endDate: Date;
      before(function () {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 1000);
      });
      it("should throw Error", function () {
        expect(
          () =>
            new TaskUnit([], startDate, endDate, undefined, [
              { type: EventType.MinorRevisionComplete, date: startDate },
            ])
        ).to.throw(Error);
      });
    });
    describe("ReviewedAndNeedsMajorRevision", function () {
      let startDate: Date;
      let endDate: Date;
      before(function () {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 1000);
      });
      it("should throw Error", function () {
        expect(
          () =>
            new TaskUnit([], startDate, endDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: startDate,
              },
            ])
        ).to.throw(Error);
      });
    });
    describe("ReviewedAndNeedsMinorRevision", function () {
      let startDate: Date;
      let endDate: Date;
      before(function () {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 1000);
      });
      it("should throw Error", function () {
        expect(
          () =>
            new TaskUnit([], startDate, endDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: startDate,
              },
            ])
        ).to.throw(Error);
      });
    });
    describe("ReviewedAndNeedsRebuild", function () {
      let startDate: Date;
      let endDate: Date;
      before(function () {
        startDate = new Date();
        endDate = new Date(startDate.getTime() + 1000);
      });
      it("should throw Error", function () {
        expect(
          () =>
            new TaskUnit([], startDate, endDate, undefined, [
              { type: EventType.ReviewedAndNeedsRebuild, date: startDate },
            ])
        ).to.throw(Error);
      });
    });
  });
  describe("Task Started Before Dependency Finished (First Task Was Started)", function () {
    let unitA: TaskUnit;
    let firstStartDate: Date;
    let firstEndDate: Date;
    let secondStartDate: Date;
    let secondEndDate: Date;
    before(function () {
      firstStartDate = new Date();
      firstEndDate = new Date(firstStartDate.getTime() + 1000);
      secondStartDate = new Date(firstEndDate.getTime());
      secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, undefined, [
        { type: EventType.TaskIterationStarted, date: firstStartDate },
      ]);
    });
    it("should throw PrematureTaskStartError when instantiating unit B", function () {
      expect(
        () =>
          new TaskUnit([unitA], secondStartDate, secondEndDate, undefined, [
            { type: EventType.TaskIterationStarted, date: secondStartDate },
          ])
      ).to.throw(PrematureTaskStartError);
    });
  });
  describe("Task Started Before Dependency Finished (First Task Was Not Started)", function () {
    let unitA: TaskUnit;
    let firstStartDate: Date;
    let firstEndDate: Date;
    let secondStartDate: Date;
    let secondEndDate: Date;
    before(function () {
      firstStartDate = new Date();
      firstEndDate = new Date(firstStartDate.getTime() + 1000);
      secondStartDate = new Date(firstEndDate.getTime());
      secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate);
    });
    it("should throw PrematureTaskStartError when instantiating unit B", function () {
      expect(
        () =>
          new TaskUnit([unitA], secondStartDate, secondEndDate, undefined, [
            { type: EventType.TaskIterationStarted, date: secondStartDate },
          ])
      ).to.throw(PrematureTaskStartError);
    });
  });
  describe("Task Started Before Dependency Finished (But Dependency Was Finished)", function () {
    let unitA: TaskUnit;
    let firstStartDate: Date;
    let firstEndDate: Date;
    let secondStartDate: Date;
    let secondEndDate: Date;
    before(function () {
      firstStartDate = new Date();
      firstEndDate = new Date(firstStartDate.getTime() + 1000);
      secondStartDate = new Date(firstStartDate.getTime() + 500);
      secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, undefined, [
        {
          type: EventType.TaskIterationStarted,
          date: firstStartDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: firstEndDate,
        },
      ]);
    });
    it("should throw PrematureTaskStartError when instantiating unit B", function () {
      expect(
        () =>
          new TaskUnit([unitA], secondStartDate, secondEndDate, undefined, [
            {
              type: EventType.TaskIterationStarted,
              date: secondStartDate,
            },
          ])
      ).to.throw(PrematureTaskStartError);
    });
  });
  describe("Task Started After Dependency Finished (But Dependency Was Finished)", function () {
    let unitA: TaskUnit;
    let firstStartDate: Date;
    let firstEndDate: Date;
    let secondStartDate: Date;
    let secondEndDate: Date;
    before(function () {
      firstStartDate = new Date();
      firstEndDate = new Date(firstStartDate.getTime() + 1000);
      secondStartDate = new Date(firstStartDate.getTime() + 1500);
      secondEndDate = new Date(secondStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, undefined, [
        {
          type: EventType.TaskIterationStarted,
          date: firstStartDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: firstEndDate,
        },
      ]);
    });
    it("should not throw Error when instantiating unit B", function () {
      expect(
        () =>
          new TaskUnit([unitA], secondStartDate, secondEndDate, undefined, [
            {
              type: EventType.TaskIterationStarted,
              date: secondStartDate,
            },
          ])
      ).to.not.throw(Error);
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
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);

      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitC = new TaskUnit([], firstStartDate, firstEndDate);
      unitF = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA, unitC], secondStartDate, secondEndDate);
      unitD = new TaskUnit(
        [unitA, unitC, unitF],
        secondStartDate,
        secondEndDate
      );
      unitG = new TaskUnit([unitC, unitF], secondStartDate, secondEndDate);

      unitE = new TaskUnit([unitB, unitD, unitG], thirdStartDate, thirdEndDate);
      unitH = new TaskUnit([unitD, unitG], thirdStartDate, thirdEndDate);
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
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);

      unitA = new TaskUnit([], firstStartDate, firstEndDate);
      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitC = new TaskUnit([unitA, unitB], thirdStartDate, thirdEndDate);
      unitD = new TaskUnit(
        [unitA, unitB, unitC],
        fourthStartDate,
        fourthEndDate
      );
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
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
      startDateA = new Date(firstStartDate.getTime());
      endDateA = new Date(firstEndDate.getTime());

      startDateB = new Date(secondStartDate.getTime());
      endDateB = new Date(secondEndDate.getTime());
      startDateF = new Date(secondStartDate.getTime());
      endDateF = new Date(secondEndDate.getTime());

      startDateC = new Date(thirdStartDate.getTime());
      endDateC = new Date(thirdEndDate.getTime());
      startDateG = new Date(thirdStartDate.getTime());
      endDateG = new Date(thirdEndDate.getTime());

      startDateD = new Date(fourthStartDate.getTime());
      endDateD = new Date(fourthEndDate.getTime());
      startDateH = new Date(fourthStartDate.getTime());
      endDateH = new Date(fourthEndDate.getTime());

      startDateE = new Date(fifthStartDate.getTime());
      endDateE = new Date(fifthEndDate.getTime());

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
    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
      const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);

      unitA = new TaskUnit([], firstStartDate, firstEndDate);

      unitB = new TaskUnit([unitA], secondStartDate, secondEndDate);
      unitF = new TaskUnit([unitA], secondStartDate, secondEndDate);

      unitC = new TaskUnit([unitB, unitF], thirdStartDate, thirdEndDate);
      unitG = new TaskUnit([unitB, unitF], thirdStartDate, thirdEndDate);

      unitD = new TaskUnit([unitC, unitG], fourthStartDate, fourthEndDate);
      unitH = new TaskUnit([unitC, unitG], fourthStartDate, fourthEndDate);

      unitE = new TaskUnit([unitD, unitH], fifthStartDate, fifthEndDate);
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
     * A┗━━━┛╲ C┗━━━┛╲ F┗━━━┛  ╱┗━━━┛╲K ┗━━━┛O ╱┗━━━┛S ╱┗━━━┛W
     *        ╲       ╲       ╱       ╲       ╱       |
     *        |        ╲┏━━━┓╱         ╲┏━━━┓╱        |
     *        |       G╱┗━━━┛╲         ╱┗━━━┛╲P       |
     *        |       ╱       ╲       ╱       ╲       |
     *  ┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓╱__┏━━━┓__╲┏━━━┓╱__┏━━━┓
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
      it("should have 20 paths to A", function () {
        expect(unitW.getNumberOfPathsToDependency(unitA)).to.equal(20);
      });
      it("should have 15 paths to B", function () {
        expect(unitW.getNumberOfPathsToDependency(unitB)).to.equal(15);
      });
      it("should have 10 paths to C", function () {
        expect(unitW.getNumberOfPathsToDependency(unitC)).to.equal(10);
      });
      it("should have 10 paths to D", function () {
        expect(unitW.getNumberOfPathsToDependency(unitD)).to.equal(10);
      });
      it("should have 5 paths to E", function () {
        expect(unitW.getNumberOfPathsToDependency(unitE)).to.equal(5);
      });
      it("should have 4 paths to F", function () {
        expect(unitW.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 6 paths to G", function () {
        expect(unitW.getNumberOfPathsToDependency(unitG)).to.equal(6);
      });
      it("should have 4 paths to H", function () {
        expect(unitW.getNumberOfPathsToDependency(unitH)).to.equal(4);
      });
      it("should have 1 paths to I", function () {
        expect(unitW.getNumberOfPathsToDependency(unitI)).to.equal(1);
      });
      it("should have 1 paths to J", function () {
        expect(unitW.getNumberOfPathsToDependency(unitJ)).to.equal(1);
      });
      it("should have 3 paths to K", function () {
        expect(unitW.getNumberOfPathsToDependency(unitK)).to.equal(3);
      });
      it("should have 3 paths to L", function () {
        expect(unitW.getNumberOfPathsToDependency(unitL)).to.equal(3);
      });
      it("should have 1 paths to M", function () {
        expect(unitW.getNumberOfPathsToDependency(unitM)).to.equal(1);
      });
      it("should have 0 paths to N", function () {
        expect(unitW.getNumberOfPathsToDependency(unitN)).to.equal(0);
      });
      it("should have 1 paths to O", function () {
        expect(unitW.getNumberOfPathsToDependency(unitO)).to.equal(1);
      });
      it("should have 2 paths to P", function () {
        expect(unitW.getNumberOfPathsToDependency(unitP)).to.equal(2);
      });
      it("should have 1 paths to Q", function () {
        expect(unitW.getNumberOfPathsToDependency(unitQ)).to.equal(1);
      });
      it("should have 0 paths to R", function () {
        expect(unitW.getNumberOfPathsToDependency(unitR)).to.equal(0);
      });
      it("should have 1 paths to S", function () {
        expect(unitW.getNumberOfPathsToDependency(unitS)).to.equal(1);
      });
      it("should have 1 paths to T", function () {
        expect(unitW.getNumberOfPathsToDependency(unitT)).to.equal(1);
      });
      it("should have 0 paths to U", function () {
        expect(unitW.getNumberOfPathsToDependency(unitU)).to.equal(0);
      });
      it("should have 0 paths to V", function () {
        expect(unitW.getNumberOfPathsToDependency(unitV)).to.equal(0);
      });
      it("should have 0 paths to W", function () {
        expect(unitW.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function () {
        expect(unitW.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function () {
        expect(unitW.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
    describe("X", function () {
      it("should have 15 paths to A", function () {
        expect(unitX.getNumberOfPathsToDependency(unitA)).to.equal(15);
      });
      it("should have 20 paths to B", function () {
        expect(unitX.getNumberOfPathsToDependency(unitB)).to.equal(20);
      });
      it("should have 5 paths to C", function () {
        expect(unitX.getNumberOfPathsToDependency(unitC)).to.equal(5);
      });
      it("should have 10 paths to D", function () {
        expect(unitX.getNumberOfPathsToDependency(unitD)).to.equal(10);
      });
      it("should have 10 paths to E", function () {
        expect(unitX.getNumberOfPathsToDependency(unitE)).to.equal(10);
      });
      it("should have 1 paths to F", function () {
        expect(unitX.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 4 paths to G", function () {
        expect(unitX.getNumberOfPathsToDependency(unitG)).to.equal(4);
      });
      it("should have 6 paths to H", function () {
        expect(unitX.getNumberOfPathsToDependency(unitH)).to.equal(6);
      });
      it("should have 4 paths to I", function () {
        expect(unitX.getNumberOfPathsToDependency(unitI)).to.equal(4);
      });
      it("should have 0 paths to J", function () {
        expect(unitX.getNumberOfPathsToDependency(unitJ)).to.equal(0);
      });
      it("should have 1 paths to K", function () {
        expect(unitX.getNumberOfPathsToDependency(unitK)).to.equal(1);
      });
      it("should have 3 paths to L", function () {
        expect(unitX.getNumberOfPathsToDependency(unitL)).to.equal(3);
      });
      it("should have 3 paths to M", function () {
        expect(unitX.getNumberOfPathsToDependency(unitM)).to.equal(3);
      });
      it("should have 1 paths to N", function () {
        expect(unitX.getNumberOfPathsToDependency(unitN)).to.equal(1);
      });
      it("should have 0 paths to O", function () {
        expect(unitX.getNumberOfPathsToDependency(unitO)).to.equal(0);
      });
      it("should have 1 paths to P", function () {
        expect(unitX.getNumberOfPathsToDependency(unitP)).to.equal(1);
      });
      it("should have 2 paths to Q", function () {
        expect(unitX.getNumberOfPathsToDependency(unitQ)).to.equal(2);
      });
      it("should have 1 paths to R", function () {
        expect(unitX.getNumberOfPathsToDependency(unitR)).to.equal(1);
      });
      it("should have 0 paths to S", function () {
        expect(unitX.getNumberOfPathsToDependency(unitS)).to.equal(0);
      });
      it("should have 1 paths to T", function () {
        expect(unitX.getNumberOfPathsToDependency(unitT)).to.equal(1);
      });
      it("should have 1 paths to U", function () {
        expect(unitX.getNumberOfPathsToDependency(unitU)).to.equal(1);
      });
      it("should have 0 paths to V", function () {
        expect(unitX.getNumberOfPathsToDependency(unitV)).to.equal(0);
      });
      it("should have 0 paths to W", function () {
        expect(unitX.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function () {
        expect(unitX.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function () {
        expect(unitX.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
    describe("Y", function () {
      it("should have 6 paths to A", function () {
        expect(unitY.getNumberOfPathsToDependency(unitA)).to.equal(6);
      });
      it("should have 14 paths to B", function () {
        expect(unitY.getNumberOfPathsToDependency(unitB)).to.equal(14);
      });
      it("should have 1 paths to C", function () {
        expect(unitY.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 5 paths to D", function () {
        expect(unitY.getNumberOfPathsToDependency(unitD)).to.equal(5);
      });
      it("should have 9 paths to E", function () {
        expect(unitY.getNumberOfPathsToDependency(unitE)).to.equal(9);
      });
      it("should have 0 paths to F", function () {
        expect(unitY.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 1 paths to G", function () {
        expect(unitY.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 4 paths to H", function () {
        expect(unitY.getNumberOfPathsToDependency(unitH)).to.equal(4);
      });
      it("should have 5 paths to I", function () {
        expect(unitY.getNumberOfPathsToDependency(unitI)).to.equal(5);
      });
      it("should have 0 paths to J", function () {
        expect(unitY.getNumberOfPathsToDependency(unitJ)).to.equal(0);
      });
      it("should have 0 paths to K", function () {
        expect(unitY.getNumberOfPathsToDependency(unitK)).to.equal(0);
      });
      it("should have 1 paths to L", function () {
        expect(unitY.getNumberOfPathsToDependency(unitL)).to.equal(1);
      });
      it("should have 3 paths to M", function () {
        expect(unitY.getNumberOfPathsToDependency(unitM)).to.equal(3);
      });
      it("should have 2 paths to N", function () {
        expect(unitY.getNumberOfPathsToDependency(unitN)).to.equal(2);
      });
      it("should have 0 paths to O", function () {
        expect(unitY.getNumberOfPathsToDependency(unitO)).to.equal(0);
      });
      it("should have 0 paths to P", function () {
        expect(unitY.getNumberOfPathsToDependency(unitP)).to.equal(0);
      });
      it("should have 1 paths to Q", function () {
        expect(unitY.getNumberOfPathsToDependency(unitQ)).to.equal(1);
      });
      it("should have 2 paths to R", function () {
        expect(unitY.getNumberOfPathsToDependency(unitR)).to.equal(2);
      });
      it("should have 0 paths to S", function () {
        expect(unitY.getNumberOfPathsToDependency(unitS)).to.equal(0);
      });
      it("should have 0 paths to T", function () {
        expect(unitY.getNumberOfPathsToDependency(unitT)).to.equal(0);
      });
      it("should have 1 paths to U", function () {
        expect(unitY.getNumberOfPathsToDependency(unitU)).to.equal(1);
      });
      it("should have 1 paths to V", function () {
        expect(unitY.getNumberOfPathsToDependency(unitV)).to.equal(1);
      });
      it("should have 0 paths to W", function () {
        expect(unitY.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function () {
        expect(unitY.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function () {
        expect(unitY.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
  });
});
