import { expect } from "chai";
import { EventHistoryInvalidError, PrematureTaskStartError } from "../Error";
import { assertIsObject } from "../typePredicates";
import { EventType } from "../types";
import { TaskUnit } from "./";
import { assumedReqTime } from "./constants";

const now = new Date();
const firstDate = new Date(now.getTime() - 100000);
const lateFirstDate = new Date(firstDate.getTime() + 500);
const secondDate = new Date(firstDate.getTime() + 1000);
const lateSecondDate = new Date(secondDate.getTime() + 500);
const thirdDate = new Date(secondDate.getTime() + 1000);
const lateThirdDate = new Date(thirdDate.getTime() + 500);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const lateFourthDate = new Date(fourthDate.getTime() + 500);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const lateFifthDate = new Date(fifthDate.getTime() + 500);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const lateSixthDate = new Date(sixthDate.getTime() + 500);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const lateSeventhDate = new Date(seventhDate.getTime() + 500);
const eighthDate = new Date(seventhDate.getTime() + 1000);
const lateEighthDate = new Date(eighthDate.getTime() + 500);
const ninthDate = new Date(eighthDate.getTime() + 1000);
const tenthDate = new Date(ninthDate.getTime() + 1000);
const eleventhDate = new Date(tenthDate.getTime() + 1000);
const twelfthDate = new Date(eleventhDate.getTime() + 1000);
const thirteenthDate = new Date(twelfthDate.getTime() + 1000);
const fourteenthDate = new Date(thirteenthDate.getTime() + 1000);

describe("TaskUnit", function () {
  describe("No Dependencies", function () {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function () {
      unit = new TaskUnit([], firstDate, secondDate);
    });
    it("should have correct presence", function () {
      expect(unit.presenceTime).to.equal(
        secondDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should not be dependent on self", function () {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unit.isDependentOn(new TaskUnit([], firstDate, secondDate))).to.be
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
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Future Event", function () {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function () {
      unit = new TaskUnit([], firstDate, secondDate);
    });
    it("should throw EventHistoryInvalidError", function () {
      expect(
        () =>
          new TaskUnit([], firstDate, secondDate, undefined, [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
            },
          ])
      ).to.throw(EventHistoryInvalidError);
    });
    it("should have correct anticipated start date", function () {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent start date", function () {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should not be dependent on self", function () {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function () {
      expect(unit.isDependentOn(new TaskUnit([], firstDate, secondDate))).to.be
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
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Projected History", function () {
    describe("ReviewedAndAccepted Event Provided", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndAccepted, date: thirdDate },
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
    describe("Ends With TaskIterationStarted Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With Delayed TaskIterationStarted Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function () {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function () {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function () {
        expect(unit.apparentStartDate).to.deep.equal(thirdDate);
      });
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With MinorRevisionComplete Event", function () {
      let unit: TaskUnit;
      before(function () {
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
      before(function () {
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
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsMajorRevision Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With ReviewedAndNeedsMinorRevision Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.MinorRevisionComplete,
        ]);
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsMinorRevision Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.MinorRevisionComplete,
        ]);
      });
    });
    describe("Ends With ReviewedAndNeedsRebuild Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsRebuild, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function () {
        const projectedEventHistoryDates = unit.projectedHistory.map(
          (event) => event.date
        );
        expect(projectedEventHistoryDates).to.deep.equal(
          [...projectedEventHistoryDates].sort()
        );
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsRebuild Event", function () {
      let unit: TaskUnit;
      before(function () {
        unit = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsRebuild, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
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
      it("should have apparent end date equal to date of last projected event", function () {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function () {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function () {
        const projectedEventHistoryDates = unit.projectedHistory.map(
          (event) => event.date
        );
        expect(projectedEventHistoryDates).to.deep.equal(
          [...projectedEventHistoryDates].sort()
        );
      });
    });
    describe("Non TaskStarted Event Provided First", function () {
      describe("ReviewedAndAccepted", function () {
        let firstDate: Date;
        let secondDate: Date;
        before(function () {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function () {
          expect(
            () =>
              new TaskUnit([], firstDate, secondDate, undefined, [
                { type: EventType.ReviewedAndAccepted, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
      describe("MinorRevisionComplete", function () {
        let firstDate: Date;
        let secondDate: Date;
        before(function () {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function () {
          expect(
            () =>
              new TaskUnit([], firstDate, secondDate, undefined, [
                { type: EventType.MinorRevisionComplete, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsMajorRevision", function () {
        let firstDate: Date;
        let secondDate: Date;
        before(function () {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function () {
          expect(
            () =>
              new TaskUnit([], firstDate, secondDate, undefined, [
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: firstDate,
                },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsMinorRevision", function () {
        let firstDate: Date;
        let secondDate: Date;
        before(function () {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function () {
          expect(
            () =>
              new TaskUnit([], firstDate, secondDate, undefined, [
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: firstDate,
                },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsRebuild", function () {
        let firstDate: Date;
        let secondDate: Date;
        before(function () {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function () {
          expect(
            () =>
              new TaskUnit([], firstDate, secondDate, undefined, [
                { type: EventType.ReviewedAndNeedsRebuild, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
    });
  });
  describe("History Validation", function () {
    describe("Task Started Before Dependency Finished (First Task Was Started)", function () {
      let unitA: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
        ]);
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function () {
        expect(
          () =>
            new TaskUnit([unitA], secondDate, thirdDate, undefined, [
              { type: EventType.TaskIterationStarted, date: secondDate },
            ])
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (First Task Was Not Started)", function () {
      let unitA: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, secondDate);
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function () {
        expect(
          () =>
            new TaskUnit([unitA], secondDate, thirdDate, undefined, [
              { type: EventType.TaskIterationStarted, date: secondDate },
            ])
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (But Dependency Was Finished)", function () {
      let unitA: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, secondDate, undefined, [
          {
            type: EventType.TaskIterationStarted,
            date: firstDate,
          },
          {
            type: EventType.ReviewedAndAccepted,
            date: secondDate,
          },
        ]);
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function () {
        expect(
          () =>
            new TaskUnit([unitA], lateFirstDate, lateSecondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: lateFirstDate,
              },
            ])
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started After Dependency Finished (But Dependency Was Finished)", function () {
      let unitA: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, secondDate, undefined, [
          {
            type: EventType.TaskIterationStarted,
            date: firstDate,
          },
          {
            type: EventType.ReviewedAndAccepted,
            date: secondDate,
          },
        ]);
      });
      it("should not throw Error when instantiating unit B", function () {
        expect(
          () =>
            new TaskUnit([unitA], lateFirstDate, lateSecondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: secondDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted", function () {
      it("should not throw error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              { type: EventType.TaskIterationStarted, date: firstDate },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With ReviewedAndAccepted", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              { type: EventType.ReviewedAndAccepted, date: firstDate },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With MinorRevisionComplete", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              { type: EventType.MinorRevisionComplete, date: firstDate },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMajorRevision", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMinorRevision", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsRebuild", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted (Swapped Dates)", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, TaskIterationStarted", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: secondDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, MinorRevisionComplete", function () {
      it("should throw EventHistoryInvalidError", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: secondDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, TaskIterationStarted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, MinorRevisionComplete", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, TaskIterationStarted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, TaskIterationStarted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: thirdDate,
              },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, MinorRevisionComplete", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, MinorRevisionComplete", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, TaskIterationStarted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: secondDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: thirdDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndAccepted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.ReviewedAndAccepted,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, MinorRevisionComplete", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsMajorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsMinorRevision", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsRebuild", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, TaskIterationStarted", function () {
      it("should not throw Error", function () {
        expect(
          () =>
            new TaskUnit([], firstDate, secondDate, undefined, [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
              },
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: secondDate,
              },
              {
                type: EventType.MinorRevisionComplete,
                date: thirdDate,
              },
              {
                type: EventType.TaskIterationStarted,
                date: fourthDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
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
      unitA = new TaskUnit([], firstDate, secondDate);
      unitC = new TaskUnit([], firstDate, secondDate);
      unitF = new TaskUnit([], firstDate, secondDate);

      unitB = new TaskUnit([unitA, unitC], thirdDate, fourthDate);
      unitD = new TaskUnit([unitA, unitC, unitF], thirdDate, fourthDate);
      unitG = new TaskUnit([unitC, unitF], thirdDate, fourthDate);

      unitE = new TaskUnit([unitB, unitD, unitG], fifthDate, sixthDate);
      unitH = new TaskUnit([unitD, unitG], fifthDate, sixthDate);
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
      unitA = new TaskUnit([], firstDate, secondDate);
      unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      unitC = new TaskUnit([unitA, unitB], fifthDate, sixthDate);
      unitD = new TaskUnit([unitA, unitB, unitC], seventhDate, eighthDate);
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
    before(function () {
      unitA = new TaskUnit([], firstDate, secondDate);

      unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      unitF = new TaskUnit([unitA], thirdDate, fourthDate);

      unitC = new TaskUnit([unitB, unitF], fifthDate, sixthDate);
      unitG = new TaskUnit([unitB, unitF], fifthDate, sixthDate);

      unitD = new TaskUnit([unitC, unitG], seventhDate, eighthDate);
      unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate);

      unitE = new TaskUnit([unitD, unitH], ninthDate, tenthDate);
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
      unitA = new TaskUnit([], firstDate, secondDate);

      unitB = new TaskUnit([unitA], thirdDate, fourthDate);
      unitF = new TaskUnit([unitA], thirdDate, fourthDate);

      unitC = new TaskUnit([unitB, unitF], fifthDate, sixthDate);
      unitG = new TaskUnit([unitB, unitF], fifthDate, sixthDate);

      unitD = new TaskUnit([unitC, unitG], seventhDate, eighthDate);
      unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate);

      unitE = new TaskUnit([unitD, unitH], ninthDate, tenthDate);
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
      unitA = new TaskUnit([], firstDate, secondDate, "A");
      unitB = new TaskUnit([], firstDate, secondDate, "B");

      unitC = new TaskUnit([unitA], thirdDate, fourthDate, "C");
      unitD = new TaskUnit([unitA, unitB], thirdDate, fourthDate, "D");
      unitE = new TaskUnit([unitB], thirdDate, fourthDate, "E");

      unitF = new TaskUnit([unitC], fifthDate, sixthDate, "F");
      unitG = new TaskUnit([unitC, unitD], fifthDate, sixthDate, "G");
      unitH = new TaskUnit([unitD, unitE], fifthDate, sixthDate, "H");
      unitI = new TaskUnit([unitE], fifthDate, sixthDate, "I");

      unitJ = new TaskUnit([unitF], seventhDate, eighthDate, "J");
      unitK = new TaskUnit([unitF, unitG], seventhDate, eighthDate, "K");
      unitL = new TaskUnit([unitG, unitH], seventhDate, eighthDate, "L");
      unitM = new TaskUnit([unitH, unitI], seventhDate, eighthDate, "M");
      unitN = new TaskUnit([unitI], seventhDate, eighthDate, "N");

      unitO = new TaskUnit([unitJ, unitK], ninthDate, tenthDate, "O");
      unitP = new TaskUnit([unitK, unitL], ninthDate, tenthDate, "P");
      unitQ = new TaskUnit([unitL, unitM], ninthDate, tenthDate, "Q");
      unitR = new TaskUnit([unitM, unitN], ninthDate, tenthDate, "R");

      unitS = new TaskUnit([unitO, unitP], eleventhDate, twelfthDate, "S");
      unitT = new TaskUnit([unitP, unitQ], eleventhDate, twelfthDate, "T");
      unitU = new TaskUnit([unitQ, unitR], eleventhDate, twelfthDate, "U");
      unitV = new TaskUnit([unitR], eleventhDate, twelfthDate, "V");

      unitW = new TaskUnit([unitS, unitT], thirteenthDate, fourteenthDate, "W");
      unitX = new TaskUnit([unitT, unitU], thirteenthDate, fourteenthDate, "X");
      unitY = new TaskUnit([unitU, unitV], thirteenthDate, fourteenthDate, "Y");
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
  describe("Cascading Date Influence", function () {
    const now = new Date();
    const firstDate = new Date(now.getTime() - 150000);
    const secondDate = new Date(firstDate.getTime() + 50000);
    const thirdDate = new Date(secondDate.getTime() + 50000);
    // should roughly be now
    const fourthDate = new Date(thirdDate.getTime() + 50000);
    const fifthDate = new Date(fourthDate.getTime() + 50000);
    const sixthDate = new Date(fifthDate.getTime() + 50000);
    const seventhDate = new Date(sixthDate.getTime() + 50000);
    const eighthDate = new Date(seventhDate.getTime() + 50000);
    describe("Delay Cascades", function () {
      /**
       * ```text
       *                   Now
       *                    |      ┏━━━┓
       *                    |    B╱┗━━━┛
       *    ┏━━━━━━━━━━━━━━━━━━━┓╱
       *   A┗━━━━━━━━━━━━━━━━━━━┛╲
       *                    |     ╲______________┏━━━┓
       *                    |                   C┗━━━┛
       *
       *             |
       *             V
       *
       *                   Now
       *                    |     ┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┏━━━┓
       *                    |    B┴┴┴┴┴┴┴┴┴┴┴┴┴┴╱┗━━━┛
       *    ┬┬┬┬┬┬┬┬┬┬┬┬┬┬┏━━━━━━━━━━━━━━━━━━━┓╱
       *   A┴┴┴┴┴┴┴┴┴┴┴┴┴┴┗━━━━━━━━━━━━━━━━━━━┛╲
       *                    |                   ╲┏━━━┓
       *                    |                   C┗━━━┛
       * ```
       */
      let unitA: TaskUnit;
      let unitB: TaskUnit;
      let unitC: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, fifthDate, "A", [
          { type: EventType.TaskIterationStarted, date: thirdDate },
        ]);
        unitB = new TaskUnit([unitA], secondDate, thirdDate, "B");
        unitC = new TaskUnit([unitA], seventhDate, eighthDate, "C");
      });
      it("should have A anticipated to start at first date", function () {
        expect(unitA.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have A anticipated to end at fifth date", function () {
        expect(unitA.anticipatedEndDate).to.deep.equal(fifthDate);
      });
      it("should have A apparently starting at third date", function () {
        expect(unitA.apparentStartDate).to.deep.equal(thirdDate);
      });
      it("should have A apparently ending at seventh date", function () {
        expect(unitA.apparentEndDate).to.deep.equal(seventhDate);
      });
      it("should have B anticipated to start at second date", function () {
        expect(unitB.anticipatedStartDate).to.deep.equal(secondDate);
      });
      it("should have B anticipated to end at third date", function () {
        expect(unitB.anticipatedEndDate).to.deep.equal(thirdDate);
      });
      it("should have B apparently starting at seventh date", function () {
        expect(unitB.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have B apparently ending at eighth date", function () {
        expect(unitB.apparentEndDate).to.deep.equal(eighthDate);
      });
      it("should have C anticipated to start at seventh date", function () {
        expect(unitC.anticipatedStartDate).to.deep.equal(seventhDate);
      });
      it("should have C anticipated to end at eighth date", function () {
        expect(unitC.anticipatedEndDate).to.deep.equal(eighthDate);
      });
      it("should have C apparently starting at seventh date", function () {
        expect(unitC.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have C apparently ending at eighth date", function () {
        expect(unitC.apparentEndDate).to.deep.equal(eighthDate);
      });
    });
    describe("Extension Cascades", function () {
      /**
       * ```text
       *                   Now
       *                    |      ┏━━━┓
       *                    |    B╱┗━━━┛
       *    ┏━━━━━━━━━━━━━━━━━━━┓╱
       *   A┗━━━━━━━━━━━━━━━━━━━┛╲
       *                    |     ╲______________┏━━━┓
       *                    |                   C┗━━━┛
       *
       *             |
       *             V
       *
       *                   Now
       *                    |     ┬┬┬┬┬┬┬┬┬┬┬┬┬┬┬┏━━━┓
       *                    |    B┴┴┴┴┴┴┴┴┴┴┴┴┴┴╱┗━━━┛
       *    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓╱
       *   A┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛╲
       *                    |                   ╲┏━━━┓
       *                    |                   C┗━━━┛
       * ```
       */
      let unitA: TaskUnit;
      let unitB: TaskUnit;
      let unitC: TaskUnit;
      before(function () {
        unitA = new TaskUnit([], firstDate, fifthDate, "A", [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
        ]);
        unitB = new TaskUnit([unitA], secondDate, thirdDate, "B");
        unitC = new TaskUnit([unitA], seventhDate, eighthDate, "C");
      });
      it("should have A anticipated to start at first date", function () {
        expect(unitA.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have A anticipated to end at fifth date", function () {
        expect(unitA.anticipatedEndDate).to.deep.equal(fifthDate);
      });
      it("should have A apparently starting at first date", function () {
        expect(unitA.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have A apparently ending at seventh date", function () {
        expect(unitA.apparentEndDate).to.deep.equal(seventhDate);
      });
      it("should have B anticipated to start at second date", function () {
        expect(unitB.anticipatedStartDate).to.deep.equal(secondDate);
      });
      it("should have B anticipated to end at third date", function () {
        expect(unitB.anticipatedEndDate).to.deep.equal(thirdDate);
      });
      it("should have B apparently starting at seventh date", function () {
        expect(unitB.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have B apparently ending at eighth date", function () {
        expect(unitB.apparentEndDate).to.deep.equal(eighthDate);
      });
      it("should have C anticipated to start at seventh date", function () {
        expect(unitC.anticipatedStartDate).to.deep.equal(seventhDate);
      });
      it("should have C anticipated to end at eighth date", function () {
        expect(unitC.anticipatedEndDate).to.deep.equal(eighthDate);
      });
      it("should have C apparently starting at seventh date", function () {
        expect(unitC.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have C apparently ending at eighth date", function () {
        expect(unitC.apparentEndDate).to.deep.equal(eighthDate);
      });
    });
  });
});
