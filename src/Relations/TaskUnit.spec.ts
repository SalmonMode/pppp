import { expect } from "chai";
import { add, sub } from "date-fns";
import {
  EventHistoryInvalidError,
  PrematureTaskStartError,
} from "../errors/Error";
import { assertIsObject } from "primitive-predicates";
import { EventType } from "../types";
import { TaskUnit } from "./";

const now = new Date();
const firstDate = new Date(now.getTime() - 100000);
const lateFirstDate = new Date(firstDate.getTime() + 500);
const secondDate = new Date(firstDate.getTime() + 1000);
const lateSecondDate = new Date(secondDate.getTime() + 500);
const thirdDate = new Date(secondDate.getTime() + 1000);
const fourthDate = new Date(thirdDate.getTime() + 1000);
const fifthDate = new Date(fourthDate.getTime() + 1000);
const sixthDate = new Date(fifthDate.getTime() + 1000);
const seventhDate = new Date(sixthDate.getTime() + 1000);
const eighthDate = new Date(seventhDate.getTime() + 1000);
const ninthDate = new Date(eighthDate.getTime() + 1000);
const tenthDate = new Date(ninthDate.getTime() + 1000);
const eleventhDate = new Date(tenthDate.getTime() + 1000);
const twelfthDate = new Date(eleventhDate.getTime() + 1000);
const thirteenthDate = new Date(twelfthDate.getTime() + 1000);
const fourteenthDate = new Date(thirteenthDate.getTime() + 1000);

describe("TaskUnit", function (): void {
  describe("No Dependencies", function (): void {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function (): void {
      unit = new TaskUnit(now, [], firstDate, secondDate);
    });
    it("should have correct presence", function (): void {
      expect(unit.presenceTime).to.equal(
        secondDate.getTime() - firstDate.getTime()
      );
    });
    it("should have correct anticipated start date", function (): void {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent start date", function (): void {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should not be dependent on self", function (): void {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function (): void {
      expect(unit.isDependentOn(new TaskUnit(now, [], firstDate, secondDate)))
        .to.be.false;
    });
    it("should have no direct dependencies", function (): void {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function (): void {
      expect(unit.getAllDependencies()).to.be.empty;
    });
    it("should have projected history", function (): void {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Future Event", function (): void {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function (): void {
      unit = new TaskUnit(now, [], firstDate, secondDate);
    });
    it("should throw EventHistoryInvalidError", function (): void {
      expect(
        () =>
          new TaskUnit(now, [], firstDate, secondDate, undefined, [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
            },
          ])
      ).to.throw(EventHistoryInvalidError);
    });
    it("should have correct anticipated start date", function (): void {
      expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
    });
    it("should have correct apparent start date", function (): void {
      expect(unit.apparentStartDate).to.deep.equal(firstDate);
    });
    it("should not be dependent on self", function (): void {
      expect(unit.isDependentOn(unit)).to.be.false;
    });
    it("should not be dependent on unit that isn't its parent", function (): void {
      expect(unit.isDependentOn(new TaskUnit(now, [], firstDate, secondDate)))
        .to.be.false;
    });
    it("should have no direct dependencies", function (): void {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function (): void {
      expect(unit.getAllDependencies()).to.be.empty;
    });
    it("should have projected history", function (): void {
      expect(unit.projectedHistory).to.deep.equal([
        { type: EventType.TaskIterationStarted, date: firstDate },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Projected History", function (): void {
    describe("ReviewedAndAccepted Event Provided", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndAccepted, date: thirdDate },
        ]);
      });
      it("should have correct presence", function (): void {
        expect(unit.presenceTime).to.equal(
          thirdDate.getTime() - firstDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have correct apparent end date", function (): void {
        expect(unit.apparentEndDate).to.deep.equal(thirdDate);
      });
      it("should have no projected history", function (): void {
        expect(unit.projectedHistory).to.deep.equal([]);
      });
    });
    describe("Ends With TaskIterationStarted Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With Delayed TaskIterationStarted Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(thirdDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With MinorRevisionComplete Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
          { type: EventType.MinorRevisionComplete, date: thirdDate },
        ]);
      });
      it("should have correct presence", function (): void {
        expect(unit.presenceTime).to.equal(
          thirdDate.getTime() - firstDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have correct apparent end date", function (): void {
        expect(unit.apparentEndDate).to.deep.equal(thirdDate);
      });
      it("should have no projected history", function (): void {
        expect(unit.projectedHistory).to.deep.equal([]);
      });
    });
    describe("Ends With Delayed MinorRevisionComplete Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
          { type: EventType.MinorRevisionComplete, date: fourthDate },
        ]);
      });
      it("should have correct presence", function (): void {
        expect(unit.presenceTime).to.equal(
          fourthDate.getTime() - firstDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent end date", function (): void {
        expect(unit.apparentEndDate).to.deep.equal(fourthDate);
      });
      it("should have no projected history", function (): void {
        expect(unit.projectedHistory).to.deep.equal([]);
      });
    });
    describe("Ends With ReviewedAndNeedsMajorRevision Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsMajorRevision Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(secondDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.ReviewedAndAccepted,
        ]);
      });
    });
    describe("Ends With ReviewedAndNeedsMinorRevision Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.MinorRevisionComplete,
        ]);
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsMinorRevision Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(secondDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.MinorRevisionComplete,
        ]);
      });
    });
    describe("Ends With ReviewedAndNeedsRebuild Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsRebuild, date: secondDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function (): void {
        const projectedEventHistoryDates = unit.projectedHistory.map(
          (event) => event.date
        );
        expect(projectedEventHistoryDates).to.deep.equal(
          [...projectedEventHistoryDates].sort()
        );
      });
    });
    describe("Ends With Delayed ReviewedAndNeedsRebuild Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: secondDate },
          { type: EventType.ReviewedAndNeedsRebuild, date: thirdDate },
        ]);
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.presenceTime).to.equal(
          lastProjectedEvent.date.getTime() -
            unit.anticipatedStartDate.getTime()
        );
      });
      it("should have correct anticipated start date", function (): void {
        expect(unit.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have correct anticipated end date", function (): void {
        expect(unit.anticipatedEndDate).to.deep.equal(secondDate);
      });
      it("should have correct apparent start date", function (): void {
        expect(unit.apparentStartDate).to.deep.equal(secondDate);
      });
      it("should have apparent end date equal to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedHistory[unit.projectedHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function (): void {
        const projectedEventHistoryDates = unit.projectedHistory.map(
          (event) => event.date
        );
        expect(projectedEventHistoryDates).to.deep.equal(
          [...projectedEventHistoryDates].sort()
        );
      });
    });
    describe("Non TaskStarted Event Provided First", function (): void {
      describe("ReviewedAndAccepted", function (): void {
        let firstDate: Date;
        let secondDate: Date;
        before(function (): void {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function (): void {
          expect(
            () =>
              new TaskUnit(now, [], firstDate, secondDate, undefined, [
                { type: EventType.ReviewedAndAccepted, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
      describe("MinorRevisionComplete", function (): void {
        let firstDate: Date;
        let secondDate: Date;
        before(function (): void {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function (): void {
          expect(
            () =>
              new TaskUnit(now, [], firstDate, secondDate, undefined, [
                { type: EventType.MinorRevisionComplete, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsMajorRevision", function (): void {
        let firstDate: Date;
        let secondDate: Date;
        before(function (): void {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function (): void {
          expect(
            () =>
              new TaskUnit(now, [], firstDate, secondDate, undefined, [
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: firstDate,
                },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsMinorRevision", function (): void {
        let firstDate: Date;
        let secondDate: Date;
        before(function (): void {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function (): void {
          expect(
            () =>
              new TaskUnit(now, [], firstDate, secondDate, undefined, [
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: firstDate,
                },
              ])
          ).to.throw(Error);
        });
      });
      describe("ReviewedAndNeedsRebuild", function (): void {
        let firstDate: Date;
        let secondDate: Date;
        before(function (): void {
          firstDate = new Date();
          secondDate = new Date(firstDate.getTime() + 1000);
        });
        it("should throw Error", function (): void {
          expect(
            () =>
              new TaskUnit(now, [], firstDate, secondDate, undefined, [
                { type: EventType.ReviewedAndNeedsRebuild, date: firstDate },
              ])
          ).to.throw(Error);
        });
      });
    });
  });
  describe("History Validation", function (): void {
    describe("Task Started Before Dependency Finished (First Task Was Started)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit(now, [], firstDate, secondDate, undefined, [
          { type: EventType.TaskIterationStarted, date: firstDate },
        ]);
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit(now, [unitA], secondDate, thirdDate, undefined, [
              { type: EventType.TaskIterationStarted, date: secondDate },
            ])
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (First Task Was Not Started)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit(now, [], firstDate, secondDate);
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit(now, [unitA], secondDate, thirdDate, undefined, [
              { type: EventType.TaskIterationStarted, date: secondDate },
            ])
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (But Dependency Was Finished)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit(
              now,
              [unitA],
              lateFirstDate,
              lateSecondDate,
              undefined,
              [
                {
                  type: EventType.TaskIterationStarted,
                  date: lateFirstDate,
                },
              ]
            )
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started After Dependency Finished (But Dependency Was Finished)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
      it("should not throw Error when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit(
              now,
              [unitA],
              lateFirstDate,
              lateSecondDate,
              undefined,
              [
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                },
              ]
            )
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted", function (): void {
      it("should not throw error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              { type: EventType.TaskIterationStarted, date: firstDate },
            ])
        ).to.not.throw(Error);
      });
    });
    describe("Starts With ReviewedAndAccepted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              { type: EventType.ReviewedAndAccepted, date: firstDate },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              { type: EventType.MinorRevisionComplete, date: firstDate },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMajorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMajorRevision,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMinorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsMinorRevision,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsRebuild", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
              {
                type: EventType.ReviewedAndNeedsRebuild,
                date: firstDate,
              },
            ])
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted (Swapped Dates)", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, TaskIterationStarted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, TaskIterationStarted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, MinorRevisionComplete", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, TaskIterationStarted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, TaskIterationStarted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, MinorRevisionComplete", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, MinorRevisionComplete", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, TaskIterationStarted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, MinorRevisionComplete", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, MinorRevisionComplete, TaskIterationStarted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit(now, [], firstDate, secondDate, undefined, [
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
  describe("Complex Interconnections", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit(now, [], firstDate, secondDate);
      unitC = new TaskUnit(now, [], firstDate, secondDate);
      unitF = new TaskUnit(now, [], firstDate, secondDate);

      unitB = new TaskUnit(now, [unitA, unitC], thirdDate, fourthDate);
      unitD = new TaskUnit(now, [unitA, unitC, unitF], thirdDate, fourthDate);
      unitG = new TaskUnit(now, [unitC, unitF], thirdDate, fourthDate);

      unitE = new TaskUnit(now, [unitB, unitD, unitG], fifthDate, sixthDate);
      unitH = new TaskUnit(now, [unitD, unitG], fifthDate, sixthDate);
    });
    describe("From A", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitC;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitD;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitE;
      });
      it("should have 2 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 3 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(3);
      });
      it("should have 1 path to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From F", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitF;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitG;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitH;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 2 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Redundancies)", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit(now, [], firstDate, secondDate);
      unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      unitC = new TaskUnit(now, [unitA, unitB], fifthDate, sixthDate);
      unitD = new TaskUnit(now, [unitA, unitB, unitC], seventhDate, eighthDate);
    });
    describe("From A", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From B", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From C", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitC;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
    describe("From D", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitD;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Interwoven Without Redundancies)", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit(now, [], firstDate, secondDate);

      unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      unitF = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      unitC = new TaskUnit(now, [unitB, unitF], fifthDate, sixthDate);
      unitG = new TaskUnit(now, [unitB, unitF], fifthDate, sixthDate);

      unitD = new TaskUnit(now, [unitC, unitG], seventhDate, eighthDate);
      unitH = new TaskUnit(now, [unitC, unitG], seventhDate, eighthDate);

      unitE = new TaskUnit(now, [unitD, unitH], ninthDate, tenthDate);
    });
    describe("From A", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitC;
      });
      it("should have 2 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitD;
      });
      it("should have 4 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitE;
      });
      it("should have 8 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(8);
      });
      it("should have 4 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(4);
      });
      it("should have 2 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 4 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 2 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(2);
      });
      it("should have 1 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(1);
      });
    });
    describe("From F", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitF;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitG;
      });
      it("should have 2 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitH;
      });
      it("should have 4 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Complex Interconnections (Interwoven Without Redundancies)", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit(now, [], firstDate, secondDate);

      unitB = new TaskUnit(now, [unitA], thirdDate, fourthDate);
      unitF = new TaskUnit(now, [unitA], thirdDate, fourthDate);

      unitC = new TaskUnit(now, [unitB, unitF], fifthDate, sixthDate);
      unitG = new TaskUnit(now, [unitB, unitF], fifthDate, sixthDate);

      unitD = new TaskUnit(now, [unitC, unitG], seventhDate, eighthDate);
      unitH = new TaskUnit(now, [unitC, unitG], seventhDate, eighthDate);

      unitE = new TaskUnit(now, [unitD, unitH], ninthDate, tenthDate);
    });
    describe("From A", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitA;
      });
      it("should have 0 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(0);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From B", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitB;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From C", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitC;
      });
      it("should have 2 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From D", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitD;
      });
      it("should have 4 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From E", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitE;
      });
      it("should have 8 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(8);
      });
      it("should have 4 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(4);
      });
      it("should have 2 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(2);
      });
      it("should have 1 path to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(1);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 4 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 2 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(2);
      });
      it("should have 1 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(1);
      });
    });
    describe("From F", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitF;
      });
      it("should have 1 path to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(1);
      });
      it("should have 0 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(0);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 0 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From G", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitG;
      });
      it("should have 2 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(2);
      });
      it("should have 1 path to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(1);
      });
      it("should have 0 paths to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(0);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 1 path to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 0 paths to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(0);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
    describe("From H", function (): void {
      let sourceUnit: TaskUnit;
      before(function (): void {
        sourceUnit = unitH;
      });
      it("should have 4 paths to A", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitA)).to.equal(4);
      });
      it("should have 2 paths to B", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitB)).to.equal(2);
      });
      it("should have 1 path to C", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 0 paths to D", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitD)).to.equal(0);
      });
      it("should have 0 paths to E", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitE)).to.equal(0);
      });
      it("should have 2 paths to F", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitF)).to.equal(2);
      });
      it("should have 1 path to G", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 0 paths to H", function (): void {
        expect(sourceUnit.getNumberOfPathsToDependency(unitH)).to.equal(0);
      });
    });
  });
  describe("Competing Heads", function (): void {
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
    before(function (): void {
      unitA = new TaskUnit(now, [], firstDate, secondDate, "A");
      unitB = new TaskUnit(now, [], firstDate, secondDate, "B");

      unitC = new TaskUnit(now, [unitA], thirdDate, fourthDate, "C");
      unitD = new TaskUnit(now, [unitA, unitB], thirdDate, fourthDate, "D");
      unitE = new TaskUnit(now, [unitB], thirdDate, fourthDate, "E");

      unitF = new TaskUnit(now, [unitC], fifthDate, sixthDate, "F");
      unitG = new TaskUnit(now, [unitC, unitD], fifthDate, sixthDate, "G");
      unitH = new TaskUnit(now, [unitD, unitE], fifthDate, sixthDate, "H");
      unitI = new TaskUnit(now, [unitE], fifthDate, sixthDate, "I");

      unitJ = new TaskUnit(now, [unitF], seventhDate, eighthDate, "J");
      unitK = new TaskUnit(now, [unitF, unitG], seventhDate, eighthDate, "K");
      unitL = new TaskUnit(now, [unitG, unitH], seventhDate, eighthDate, "L");
      unitM = new TaskUnit(now, [unitH, unitI], seventhDate, eighthDate, "M");
      unitN = new TaskUnit(now, [unitI], seventhDate, eighthDate, "N");

      unitO = new TaskUnit(now, [unitJ, unitK], ninthDate, tenthDate, "O");
      unitP = new TaskUnit(now, [unitK, unitL], ninthDate, tenthDate, "P");
      unitQ = new TaskUnit(now, [unitL, unitM], ninthDate, tenthDate, "Q");
      unitR = new TaskUnit(now, [unitM, unitN], ninthDate, tenthDate, "R");

      unitS = new TaskUnit(now, [unitO, unitP], eleventhDate, twelfthDate, "S");
      unitT = new TaskUnit(now, [unitP, unitQ], eleventhDate, twelfthDate, "T");
      unitU = new TaskUnit(now, [unitQ, unitR], eleventhDate, twelfthDate, "U");
      unitV = new TaskUnit(now, [unitR], eleventhDate, twelfthDate, "V");

      unitW = new TaskUnit(
        now,
        [unitS, unitT],
        thirteenthDate,
        fourteenthDate,
        "W"
      );
      unitX = new TaskUnit(
        now,
        [unitT, unitU],
        thirteenthDate,
        fourteenthDate,
        "X"
      );
      unitY = new TaskUnit(
        now,
        [unitU, unitV],
        thirteenthDate,
        fourteenthDate,
        "Y"
      );
    });
    describe("W", function (): void {
      it("should have 20 paths to A", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitA)).to.equal(20);
      });
      it("should have 15 paths to B", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitB)).to.equal(15);
      });
      it("should have 10 paths to C", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitC)).to.equal(10);
      });
      it("should have 10 paths to D", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitD)).to.equal(10);
      });
      it("should have 5 paths to E", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitE)).to.equal(5);
      });
      it("should have 4 paths to F", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitF)).to.equal(4);
      });
      it("should have 6 paths to G", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitG)).to.equal(6);
      });
      it("should have 4 paths to H", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitH)).to.equal(4);
      });
      it("should have 1 paths to I", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitI)).to.equal(1);
      });
      it("should have 1 paths to J", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitJ)).to.equal(1);
      });
      it("should have 3 paths to K", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitK)).to.equal(3);
      });
      it("should have 3 paths to L", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitL)).to.equal(3);
      });
      it("should have 1 paths to M", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitM)).to.equal(1);
      });
      it("should have 0 paths to N", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitN)).to.equal(0);
      });
      it("should have 1 paths to O", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitO)).to.equal(1);
      });
      it("should have 2 paths to P", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitP)).to.equal(2);
      });
      it("should have 1 paths to Q", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitQ)).to.equal(1);
      });
      it("should have 0 paths to R", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitR)).to.equal(0);
      });
      it("should have 1 paths to S", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitS)).to.equal(1);
      });
      it("should have 1 paths to T", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitT)).to.equal(1);
      });
      it("should have 0 paths to U", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitU)).to.equal(0);
      });
      it("should have 0 paths to V", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitV)).to.equal(0);
      });
      it("should have 0 paths to W", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function (): void {
        expect(unitW.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
    describe("X", function (): void {
      it("should have 15 paths to A", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitA)).to.equal(15);
      });
      it("should have 20 paths to B", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitB)).to.equal(20);
      });
      it("should have 5 paths to C", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitC)).to.equal(5);
      });
      it("should have 10 paths to D", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitD)).to.equal(10);
      });
      it("should have 10 paths to E", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitE)).to.equal(10);
      });
      it("should have 1 paths to F", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitF)).to.equal(1);
      });
      it("should have 4 paths to G", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitG)).to.equal(4);
      });
      it("should have 6 paths to H", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitH)).to.equal(6);
      });
      it("should have 4 paths to I", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitI)).to.equal(4);
      });
      it("should have 0 paths to J", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitJ)).to.equal(0);
      });
      it("should have 1 paths to K", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitK)).to.equal(1);
      });
      it("should have 3 paths to L", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitL)).to.equal(3);
      });
      it("should have 3 paths to M", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitM)).to.equal(3);
      });
      it("should have 1 paths to N", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitN)).to.equal(1);
      });
      it("should have 0 paths to O", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitO)).to.equal(0);
      });
      it("should have 1 paths to P", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitP)).to.equal(1);
      });
      it("should have 2 paths to Q", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitQ)).to.equal(2);
      });
      it("should have 1 paths to R", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitR)).to.equal(1);
      });
      it("should have 0 paths to S", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitS)).to.equal(0);
      });
      it("should have 1 paths to T", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitT)).to.equal(1);
      });
      it("should have 1 paths to U", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitU)).to.equal(1);
      });
      it("should have 0 paths to V", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitV)).to.equal(0);
      });
      it("should have 0 paths to W", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function (): void {
        expect(unitX.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
    describe("Y", function (): void {
      it("should have 6 paths to A", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitA)).to.equal(6);
      });
      it("should have 14 paths to B", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitB)).to.equal(14);
      });
      it("should have 1 paths to C", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitC)).to.equal(1);
      });
      it("should have 5 paths to D", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitD)).to.equal(5);
      });
      it("should have 9 paths to E", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitE)).to.equal(9);
      });
      it("should have 0 paths to F", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitF)).to.equal(0);
      });
      it("should have 1 paths to G", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitG)).to.equal(1);
      });
      it("should have 4 paths to H", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitH)).to.equal(4);
      });
      it("should have 5 paths to I", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitI)).to.equal(5);
      });
      it("should have 0 paths to J", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitJ)).to.equal(0);
      });
      it("should have 0 paths to K", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitK)).to.equal(0);
      });
      it("should have 1 paths to L", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitL)).to.equal(1);
      });
      it("should have 3 paths to M", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitM)).to.equal(3);
      });
      it("should have 2 paths to N", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitN)).to.equal(2);
      });
      it("should have 0 paths to O", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitO)).to.equal(0);
      });
      it("should have 0 paths to P", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitP)).to.equal(0);
      });
      it("should have 1 paths to Q", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitQ)).to.equal(1);
      });
      it("should have 2 paths to R", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitR)).to.equal(2);
      });
      it("should have 0 paths to S", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitS)).to.equal(0);
      });
      it("should have 0 paths to T", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitT)).to.equal(0);
      });
      it("should have 1 paths to U", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitU)).to.equal(1);
      });
      it("should have 1 paths to V", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitV)).to.equal(1);
      });
      it("should have 0 paths to W", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitW)).to.equal(0);
      });
      it("should have 0 paths to X", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitX)).to.equal(0);
      });
      it("should have 0 paths to Y", function (): void {
        expect(unitY.getNumberOfPathsToDependency(unitY)).to.equal(0);
      });
    });
  });
  describe("Cascading Date Influence", function (): void {
    const innerNow = new Date();
    const firstDate = sub(innerNow, { days: 3 });
    const secondDate = sub(innerNow, { days: 2 });
    const thirdDate = sub(innerNow, { days: 1 });
    // fourth date is now, but is skipped because we don't reference it
    const fifthDate = add(innerNow, { days: 1 });
    // sixth date is skipped because we don't reference it
    const seventhDate = add(innerNow, { days: 3 });
    const eighthDate = add(innerNow, { days: 4 });
    describe("Delay Cascades", function (): void {
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
      before(function (): void {
        unitA = new TaskUnit(innerNow, [], firstDate, fifthDate, "A", [
          { type: EventType.TaskIterationStarted, date: thirdDate },
        ]);
        unitB = new TaskUnit(innerNow, [unitA], secondDate, thirdDate, "B");
        unitC = new TaskUnit(innerNow, [unitA], seventhDate, eighthDate, "C");
      });
      it("should have A anticipated to start at first date", function (): void {
        expect(unitA.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have A anticipated to end at fifth date", function (): void {
        expect(unitA.anticipatedEndDate).to.deep.equal(fifthDate);
      });
      it("should have A apparently starting at third date", function (): void {
        expect(unitA.apparentStartDate).to.deep.equal(thirdDate);
      });
      it("should have A apparently ending at seventh date", function (): void {
        expect(unitA.apparentEndDate).to.deep.equal(seventhDate);
      });
      it("should have B anticipated to start at second date", function (): void {
        expect(unitB.anticipatedStartDate).to.deep.equal(secondDate);
      });
      it("should have B anticipated to end at third date", function (): void {
        expect(unitB.anticipatedEndDate).to.deep.equal(thirdDate);
      });
      it("should have B apparently starting at seventh date", function (): void {
        expect(unitB.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have B apparently ending at eighth date", function (): void {
        expect(unitB.apparentEndDate).to.deep.equal(eighthDate);
      });
      it("should have C anticipated to start at seventh date", function (): void {
        expect(unitC.anticipatedStartDate).to.deep.equal(seventhDate);
      });
      it("should have C anticipated to end at eighth date", function (): void {
        expect(unitC.anticipatedEndDate).to.deep.equal(eighthDate);
      });
      it("should have C apparently starting at seventh date", function (): void {
        expect(unitC.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have C apparently ending at eighth date", function (): void {
        expect(unitC.apparentEndDate).to.deep.equal(eighthDate);
      });
    });
    describe("Extension Cascades", function (): void {
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
      before(function (): void {
        unitA = new TaskUnit(innerNow, [], firstDate, fifthDate, "A", [
          { type: EventType.TaskIterationStarted, date: firstDate },
          { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
        ]);
        unitB = new TaskUnit(innerNow, [unitA], secondDate, thirdDate, "B");
        unitC = new TaskUnit(innerNow, [unitA], seventhDate, eighthDate, "C");
      });
      it("should have A anticipated to start at first date", function (): void {
        expect(unitA.anticipatedStartDate).to.deep.equal(firstDate);
      });
      it("should have A anticipated to end at fifth date", function (): void {
        expect(unitA.anticipatedEndDate).to.deep.equal(fifthDate);
      });
      it("should have A apparently starting at first date", function (): void {
        expect(unitA.apparentStartDate).to.deep.equal(firstDate);
      });
      it("should have A apparently ending at seventh date", function (): void {
        expect(unitA.apparentEndDate).to.deep.equal(seventhDate);
      });
      it("should have B anticipated to start at second date", function (): void {
        expect(unitB.anticipatedStartDate).to.deep.equal(secondDate);
      });
      it("should have B anticipated to end at third date", function (): void {
        expect(unitB.anticipatedEndDate).to.deep.equal(thirdDate);
      });
      it("should have B apparently starting at seventh date", function (): void {
        expect(unitB.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have B apparently ending at eighth date", function (): void {
        expect(unitB.apparentEndDate).to.deep.equal(eighthDate);
      });
      it("should have C anticipated to start at seventh date", function (): void {
        expect(unitC.anticipatedStartDate).to.deep.equal(seventhDate);
      });
      it("should have C anticipated to end at eighth date", function (): void {
        expect(unitC.anticipatedEndDate).to.deep.equal(eighthDate);
      });
      it("should have C apparently starting at seventh date", function (): void {
        expect(unitC.apparentStartDate).to.deep.equal(seventhDate);
      });
      it("should have C apparently ending at eighth date", function (): void {
        expect(unitC.apparentEndDate).to.deep.equal(eighthDate);
      });
    });
  });
});
