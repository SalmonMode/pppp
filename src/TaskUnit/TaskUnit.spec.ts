import { EventHistoryInvalidError, PrematureTaskStartError } from "@errors";
import { EventType } from "@typing/TaskUnit";
import { expect } from "chai";
import { add, secondsInDay, sub } from "date-fns";
import { assertIsNumber, assertIsObject } from "primitive-predicates";
import TaskUnit from "./TaskUnit";

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

/**
 * This is intended to be used with others of its type that will be grouped relative to a common TaskUnit. Each one
 * represents how many paths the common unit has to each unit in the collection. For example, if the common unit is A,
 * and A is directly dependent on B, the key will be B's name, and the value will be 1 (because it's a direct
 * dependency). But given the same relationship, if B is the common unit, the key will be A's name, and the value would
 * be 0 (because B does not depend on A).
 */
type TaskNameToDependencyCountMap = {
  [key: string]: number;
};
/**
 * Each key is a unit's name. Each value is a dict containing references to all other units and how many paths each of
 * the top level unit has to them.
 */
type TaskNameToDependencyCountMapMap = {
  [key: string]: TaskNameToDependencyCountMap;
};

describe("TaskUnit", function (): void {
  describe("No Dependencies", function (): void {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function (): void {
      unit = new TaskUnit({
        now,
        name: "unit",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
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
      expect(
        unit.isDependentOn(
          new TaskUnit({
            now,
            name: "unit",
            anticipatedStartDate: firstDate,
            anticipatedEndDate: secondDate,
          })
        )
      ).to.be.false;
    });
    it("should have no direct dependencies", function (): void {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function (): void {
      expect(unit.getAllDependencies()).to.be.empty;
    });
    it("should have projected history", function (): void {
      expect(unit.projectedEventHistory).to.deep.equal([
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
          prerequisitesVersion: 0,
        },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Changing Dependencies Through Prerequisites", function (): void {
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    before(function (): void {
      unitA = new TaskUnit({
        now,
        name: "A",
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
        prerequisitesIterations: [
          {
            id: "1234",
            approvedDate: firstDate,
          },
        ],
        eventHistory: [
          {
            type: EventType.TaskIterationStarted,
            date: secondDate,
            prerequisitesVersion: 0,
          },
          {
            type: EventType.ReviewedAndAccepted,
            date: thirdDate,
          },
        ],
      });
      unitB = new TaskUnit({
        now,
        name: "B",
        anticipatedStartDate: secondDate,
        anticipatedEndDate: thirdDate,
        prerequisitesIterations: [
          {
            id: "1234",
            approvedDate: firstDate,
          },
        ],
        eventHistory: [
          {
            type: EventType.TaskIterationStarted,
            date: secondDate,
            prerequisitesVersion: 0,
          },
          {
            type: EventType.ReviewedAndAccepted,
            date: thirdDate,
          },
        ],
      });
      unitC = new TaskUnit({
        now,
        name: "C",
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        prerequisitesIterations: [
          {
            id: "1234",
            approvedDate: firstDate,
            parentUnits: [unitA],
          },
          {
            id: "5678",
            approvedDate: fifthDate,
            parentUnits: [unitB],
          },
        ],
        eventHistory: [
          {
            type: EventType.TaskIterationStarted,
            date: thirdDate,
            prerequisitesVersion: 0,
          },
          {
            type: EventType.ReviewedAndNeedsRebuild,
            date: fourthDate,
          },
          {
            type: EventType.TaskIterationStarted,
            date: sixthDate,
            prerequisitesVersion: 1,
          },
        ],
      });
    });
    it("should have unit B as the only direct dependency for unit C", function (): void {
      expect([...unitC.directDependencies]).to.have.members([unitB]);
    });
    it("should have unit A as the only stale direct dependency for unit C", function (): void {
      expect([...unitC.staleDirectDependencies]).to.have.members([unitA]);
    });
  });
  describe("Future Event", function (): void {
    const firstDate = new Date(now.getTime() + 100000);
    const secondDate = new Date(firstDate.getTime() + 1000);
    let unit: TaskUnit;
    before(function (): void {
      unit = new TaskUnit({
        now,
        name: "unit",
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
      });
    });
    it("should throw EventHistoryInvalidError", function (): void {
      expect(
        () =>
          new TaskUnit({
            now,
            prerequisitesIterations: [
              { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
            ],
            name: "unit",
            anticipatedStartDate: firstDate,
            anticipatedEndDate: secondDate,
            eventHistory: [
              {
                type: EventType.TaskIterationStarted,
                date: firstDate,
                prerequisitesVersion: 0,
              },
            ],
          })
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
      expect(
        unit.isDependentOn(
          new TaskUnit({
            now,
            name: "unit",
            anticipatedStartDate: firstDate,
            anticipatedEndDate: secondDate,
          })
        )
      ).to.be.false;
    });
    it("should have no direct dependencies", function (): void {
      expect(unit.directDependencies).to.be.empty;
    });
    it("should have no dependencies", function (): void {
      expect(unit.getAllDependencies()).to.be.empty;
    });
    it("should have projected history", function (): void {
      expect(unit.projectedEventHistory).to.deep.equal([
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
          prerequisitesVersion: 0,
        },
        { type: EventType.ReviewedAndAccepted, date: secondDate },
      ]);
    });
  });
  describe("Projected History", function (): void {
    describe("ReviewedAndAccepted Event Provided", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndAccepted, date: thirdDate },
          ],
        });
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
        expect(unit.projectedEventHistory).to.deep.equal([]);
      });
    });
    describe("Ends With TaskIterationStarted Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: thirdDate,
              prerequisitesVersion: 0,
            },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
            { type: EventType.MinorRevisionComplete, date: thirdDate },
          ],
        });
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
        expect(unit.projectedEventHistory).to.deep.equal([]);
      });
    });
    describe("Ends With Delayed MinorRevisionComplete Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: secondDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
            { type: EventType.MinorRevisionComplete, date: fourthDate },
          ],
        });
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
        expect(unit.projectedEventHistory).to.deep.equal([]);
      });
    });
    describe("Ends With ReviewedAndNeedsMajorRevision Event", function (): void {
      let unit: TaskUnit;
      before(function (): void {
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMajorRevision, date: secondDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: secondDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMinorRevision, date: secondDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: secondDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMinorRevision, date: thirdDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with MinorRevisionComplete", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsRebuild, date: secondDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function (): void {
        const projectedEventHistoryDates = unit.projectedEventHistory.map(
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
        unit = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: secondDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsRebuild, date: thirdDate },
          ],
        });
      });
      it("should have presence from anticipated date to date of last projected event", function (): void {
        const lastProjectedEvent =
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
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
          unit.projectedEventHistory[unit.projectedEventHistory.length - 1];
        assertIsObject(lastProjectedEvent);
        expect(unit.apparentEndDate).to.deep.equal(lastProjectedEvent.date);
      });
      it("should have projected history with TaskIterationStarted, and ReviewedAndAccepted", function (): void {
        const projectedEventHistoryTypes = unit.projectedEventHistory.map(
          (event) => event.type
        );
        expect(projectedEventHistoryTypes).to.deep.equal([
          EventType.TaskIterationStarted,
          EventType.ReviewedAndAccepted,
        ]);
      });
      it("should have projected history in chronological order", function (): void {
        const projectedEventHistoryDates = unit.projectedEventHistory.map(
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
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  { type: EventType.ReviewedAndAccepted, date: firstDate },
                ],
              })
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
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  { type: EventType.MinorRevisionComplete, date: firstDate },
                ],
              })
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
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: firstDate,
                  },
                ],
              })
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
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: firstDate,
                  },
                ],
              })
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
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  { type: EventType.ReviewedAndNeedsRebuild, date: firstDate },
                ],
              })
          ).to.throw(Error);
        });
      });
    });
  });
  describe("History Validation", function (): void {
    describe("Task Started Before Dependency Finished (First Task Was Started)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
          ],
        });
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              name: "unit",
              prerequisitesIterations: [
                {
                  id: "1234",
                  parentUnits: [unitA],
                  approvedDate: sub(firstDate, { seconds: 1 }),
                },
              ],
              anticipatedStartDate: secondDate,
              anticipatedEndDate: thirdDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started With Unapproved Prerequisites Iteration", function (): void {
      it("should throw PrematureTaskStartError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [{ id: "1234" }],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Prerequisites Iteration is Approved", function (): void {
      it("should throw PrematureTaskStartError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: secondDate },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (First Task Was Not Started)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
        });
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              name: "unit",
              prerequisitesIterations: [
                {
                  id: "1234",
                  parentUnits: [unitA],
                  approvedDate: sub(firstDate, { seconds: 1 }),
                },
              ],
              anticipatedStartDate: secondDate,
              anticipatedEndDate: thirdDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started Before Dependency Finished (But Dependency Was Finished)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            {
              type: EventType.ReviewedAndAccepted,
              date: secondDate,
            },
          ],
        });
      });
      it("should throw PrematureTaskStartError when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              name: "B",
              prerequisitesIterations: [
                {
                  id: "1234",
                  parentUnits: [unitA],
                  approvedDate: sub(firstDate, { seconds: 1 }),
                },
              ],
              anticipatedStartDate: lateFirstDate,
              anticipatedEndDate: lateSecondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: lateFirstDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(PrematureTaskStartError);
      });
    });
    describe("Task Started After Dependency Finished (But Dependency Was Finished)", function (): void {
      let unitA: TaskUnit;
      before(function (): void {
        unitA = new TaskUnit({
          now,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          name: "unit",
          anticipatedStartDate: firstDate,
          anticipatedEndDate: secondDate,
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            {
              type: EventType.ReviewedAndAccepted,
              date: secondDate,
            },
          ],
        });
      });
      it("should not throw Error when instantiating unit B", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              name: "unit",
              prerequisitesIterations: [
                {
                  id: "1234",
                  parentUnits: [unitA],
                  approvedDate: sub(firstDate, { seconds: 1 }),
                },
              ],
              anticipatedStartDate: lateFirstDate,
              anticipatedEndDate: lateSecondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted", function (): void {
      it("should not throw error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted Without Any Prerequisites Iterations", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndAccepted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                { type: EventType.ReviewedAndAccepted, date: firstDate },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                { type: EventType.MinorRevisionComplete, date: firstDate },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMajorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: firstDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsMinorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: firstDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With ReviewedAndNeedsRebuild", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: firstDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted (Swapped Dates)", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: firstDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: secondDate,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: secondDate,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: secondDate,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe("Starts With TaskIterationStarted, TaskIterationStarted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.TaskIterationStarted,
                  date: secondDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.MinorRevisionComplete,
                  date: secondDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndAccepted", function (): void {
      it("should not throw Error", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: thirdDate,
                },
              ],
            })
        ).to.not.throw(Error);
      });
    });
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, " +
        "ReviewedAndNeedsMajorRevision",
      function (): void {
        it("should not throw Error", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.not.throw(Error);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, " +
        "ReviewedAndNeedsMinorRevision",
      function (): void {
        it("should not throw Error", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.not.throw(Error);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, " +
        "ReviewedAndNeedsRebuild",
      function (): void {
        it("should not throw Error", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: thirdDate,
                  },
                ],
              })
          ).to.not.throw(Error);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, " +
        "TaskIterationStarted",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 0,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMajorRevision, " +
        "MinorRevisionComplete",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.MinorRevisionComplete,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete",
      function (): void {
        it("should not throw Error", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.MinorRevisionComplete,
                    date: thirdDate,
                  },
                ],
              })
          ).to.not.throw(Error);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "ReviewedAndNeedsMinorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "ReviewedAndNeedsMajorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "ReviewedAndNeedsRebuild",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, ReviewedAndAccepted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "TaskIterationStarted",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 0,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "TaskIterationStarted With Sufficient Prerequisites Iterations",
      function (): void {
        it("should not throw Error", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                  { id: "4567", approvedDate: lateSecondDate },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 1,
                  },
                ],
              })
          ).to.not.throw(Error);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "TaskIterationStarted With Sufficient Prerequisites Iterations And Changing Parent Units To Incomplete Units",
      function (): void {
        it("should throw PrematureTaskStartError", function (): void {
          const newPreUnit = new TaskUnit({
            now,
            name: "unit",
            anticipatedStartDate: thirdDate,
            anticipatedEndDate: fourthDate,
          });
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                  {
                    id: "4567",
                    approvedDate: lateSecondDate,
                    parentUnits: [newPreUnit],
                  },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 1,
                  },
                ],
              })
          ).to.throw(PrematureTaskStartError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "TaskIterationStarted With Approved First Prerequisites Iteration And Unapproved Second Iteration",
      function (): void {
        it("should throw PrematureTaskStartError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                  { id: "4567" },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 1,
                  },
                ],
              })
          ).to.throw(PrematureTaskStartError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "TaskIterationStarted With Approved First Prerequisites Iteration And Using Old Prereqs For Second Iteration",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                  { id: "4567", approvedDate: sub(thirdDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 0,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "TaskIterationStarted Without Available Second Prereq Iteration",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.TaskIterationStarted,
                    date: thirdDate,
                    prerequisitesVersion: 1,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: secondDate,
                },
                {
                  type: EventType.MinorRevisionComplete,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "ReviewedAndNeedsMinorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMinorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, " +
        "ReviewedAndNeedsMajorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
                  },
                  {
                    type: EventType.ReviewedAndNeedsRebuild,
                    date: secondDate,
                  },
                  {
                    type: EventType.ReviewedAndNeedsMajorRevision,
                    date: thirdDate,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndNeedsRebuild", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndNeedsRebuild, ReviewedAndAccepted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndAccepted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, MinorRevisionComplete", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.MinorRevisionComplete,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMajorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndNeedsMajorRevision,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsMinorRevision", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndNeedsMinorRevision,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, ReviewedAndNeedsRebuild", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.ReviewedAndNeedsRebuild,
                  date: thirdDate,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe("Starts With TaskIterationStarted, ReviewedAndAccepted, TaskIterationStarted", function (): void {
      it("should throw EventHistoryInvalidError", function (): void {
        expect(
          () =>
            new TaskUnit({
              now,
              prerequisitesIterations: [
                { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
              ],
              name: "unit",
              anticipatedStartDate: firstDate,
              anticipatedEndDate: secondDate,
              eventHistory: [
                {
                  type: EventType.TaskIterationStarted,
                  date: firstDate,
                  prerequisitesVersion: 0,
                },
                {
                  type: EventType.ReviewedAndAccepted,
                  date: secondDate,
                },
                {
                  type: EventType.TaskIterationStarted,
                  date: thirdDate,
                  prerequisitesVersion: 0,
                },
              ],
            })
        ).to.throw(EventHistoryInvalidError);
      });
    });
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, ReviewedAndAccepted",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, MinorRevisionComplete",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, ReviewedAndNeedsMajorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, ReviewedAndNeedsMinorRevision",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, ReviewedAndNeedsRebuild",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
    describe(
      "Starts With TaskIterationStarted, ReviewedAndNeedsMinorRevision, " +
        "MinorRevisionComplete, TaskIterationStarted",
      function (): void {
        it("should throw EventHistoryInvalidError", function (): void {
          expect(
            () =>
              new TaskUnit({
                now,
                prerequisitesIterations: [
                  { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
                ],
                name: "unit",
                anticipatedStartDate: firstDate,
                anticipatedEndDate: secondDate,
                eventHistory: [
                  {
                    type: EventType.TaskIterationStarted,
                    date: firstDate,
                    prerequisitesVersion: 0,
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
                    prerequisitesVersion: 0,
                  },
                ],
              })
          ).to.throw(EventHistoryInvalidError);
        });
      }
    );
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
    const unitA = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
    });
    const unitC = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "C",
    });
    const unitF = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "F",
    });

    const unitB = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA, unitC],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "B",
    });
    const unitD = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA, unitC, unitF],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "D",
    });
    const unitG = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitC, unitF],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "G",
    });

    const unitE = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitB, unitD, unitG],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "E",
    });
    const unitH = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitD, unitG],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "H",
    });

    const units = [unitA, unitB, unitC, unitD, unitE, unitF, unitG, unitH];

    const dependencyCountMapMap: TaskNameToDependencyCountMapMap = {
      A: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      B: {
        A: 1,
        B: 0,
        C: 1,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      C: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      D: {
        A: 1,
        B: 0,
        C: 1,
        D: 0,
        E: 0,
        F: 1,
        G: 0,
        H: 0,
      },
      E: {
        A: 2,
        B: 1,
        C: 3,
        D: 1,
        E: 0,
        F: 2,
        G: 1,
        H: 0,
      },
      F: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      G: {
        A: 0,
        B: 0,
        C: 1,
        D: 0,
        E: 0,
        F: 1,
        G: 0,
        H: 0,
      },
      H: {
        A: 1,
        B: 0,
        C: 2,
        D: 1,
        E: 0,
        F: 2,
        G: 1,
        H: 0,
      },
    };
    for (const unit of units) {
      describe(`From ${unit.name}`, function (): void {
        const depCountMap = dependencyCountMapMap[unit.name];
        assertIsObject(depCountMap);
        for (const depUnit of units) {
          const depCount = depCountMap[depUnit.name];
          assertIsNumber(depCount);
          it(`should have ${depCount} paths to ${depUnit.name}`, function (): void {
            expect(unit.getNumberOfPathsToDependency(depUnit)).to.equal(
              depCount
            );
          });
        }
      });
    }
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
    const unitA = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
    });
    const unitB = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "B",
    });
    const unitC = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA, unitB],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "C",
    });
    const unitD = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA, unitB, unitC],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "D",
    });

    const units = [unitA, unitB, unitC, unitD];

    const dependencyCountMapMap: TaskNameToDependencyCountMapMap = {
      A: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
      },
      B: {
        A: 1,
        B: 0,
        C: 0,
        D: 0,
      },
      C: {
        A: 1,
        B: 1,
        C: 0,
        D: 0,
      },
      D: {
        A: 1,
        B: 1,
        C: 1,
        D: 0,
      },
    };
    for (const unit of units) {
      describe(`From ${unit.name}`, function (): void {
        const depCountMap = dependencyCountMapMap[unit.name];
        assertIsObject(depCountMap);
        for (const depUnit of units) {
          const depCount = depCountMap[depUnit.name];
          assertIsNumber(depCount);
          it(`should have ${depCount} paths to ${depUnit.name}`, function (): void {
            expect(unit.getNumberOfPathsToDependency(depUnit)).to.equal(
              depCount
            );
          });
        }
      });
    }
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
    const unitA = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
    });

    const unitB = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "B",
    });
    const unitF = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "F",
    });

    const unitC = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitB, unitF],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "C",
    });
    const unitG = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitB, unitF],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "G",
    });

    const unitD = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitC, unitG],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "D",
    });
    const unitH = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitC, unitG],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "H",
    });

    const unitE = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitD, unitH],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: ninthDate,
      anticipatedEndDate: tenthDate,
      name: "E",
    });

    const units = [unitA, unitB, unitC, unitD, unitE, unitF, unitG, unitH];
    const dependencyCountMapMap: TaskNameToDependencyCountMapMap = {
      A: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      B: {
        A: 1,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      C: {
        A: 2,
        B: 1,
        C: 0,
        D: 0,
        E: 0,
        F: 1,
        G: 0,
        H: 0,
      },
      D: {
        A: 4,
        B: 2,
        C: 1,
        D: 0,
        E: 0,
        F: 2,
        G: 1,
        H: 0,
      },
      E: {
        A: 8,
        B: 4,
        C: 2,
        D: 1,
        E: 0,
        F: 4,
        G: 2,
        H: 1,
      },
      F: {
        A: 1,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
      },
      G: {
        A: 2,
        B: 1,
        C: 0,
        D: 0,
        E: 0,
        F: 1,
        G: 0,
        H: 0,
      },
      H: {
        A: 4,
        B: 2,
        C: 1,
        D: 0,
        E: 0,
        F: 2,
        G: 1,
        H: 0,
      },
    };
    for (const unit of units) {
      describe(`From ${unit.name}`, function (): void {
        const depCountMap = dependencyCountMapMap[unit.name];
        assertIsObject(depCountMap);
        for (const depUnit of units) {
          const depCount = depCountMap[depUnit.name];
          assertIsNumber(depCount);
          it(`should have ${depCount} paths to ${depUnit.name}`, function (): void {
            expect(unit.getNumberOfPathsToDependency(depUnit)).to.equal(
              depCount
            );
          });
        }
      });
    }
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
    const unitA = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
    });
    const unitB = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "B",
    });

    const unitC = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "C",
    });
    const unitD = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitA, unitB],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "D",
    });
    const unitE = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitB],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirdDate,
      anticipatedEndDate: fourthDate,
      name: "E",
    });

    const unitF = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitC],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "F",
    });
    const unitG = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitC, unitD],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "G",
    });
    const unitH = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitD, unitE],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "H",
    });
    const unitI = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitE],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "I",
    });

    const unitJ = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitF],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "J",
    });
    const unitK = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitF, unitG],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "K",
    });
    const unitL = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitG, unitH],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "L",
    });
    const unitM = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitH, unitI],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "M",
    });
    const unitN = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitI],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: seventhDate,
      anticipatedEndDate: eighthDate,
      name: "N",
    });

    const unitO = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitJ, unitK],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: ninthDate,
      anticipatedEndDate: tenthDate,
      name: "O",
    });
    const unitP = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitK, unitL],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: ninthDate,
      anticipatedEndDate: tenthDate,
      name: "P",
    });
    const unitQ = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitL, unitM],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: ninthDate,
      anticipatedEndDate: tenthDate,
      name: "Q",
    });
    const unitR = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitM, unitN],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: ninthDate,
      anticipatedEndDate: tenthDate,
      name: "R",
    });

    const unitS = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitO, unitP],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: eleventhDate,
      anticipatedEndDate: twelfthDate,
      name: "S",
    });
    const unitT = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitP, unitQ],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: eleventhDate,
      anticipatedEndDate: twelfthDate,
      name: "T",
    });
    const unitU = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitQ, unitR],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: eleventhDate,
      anticipatedEndDate: twelfthDate,
      name: "U",
    });
    const unitV = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitR],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: eleventhDate,
      anticipatedEndDate: twelfthDate,
      name: "V",
    });

    const unitW = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitS, unitT],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirteenthDate,
      anticipatedEndDate: fourteenthDate,
      name: "W",
    });
    const unitX = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitT, unitU],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirteenthDate,
      anticipatedEndDate: fourteenthDate,
      name: "X",
    });
    const unitY = new TaskUnit({
      now,
      prerequisitesIterations: [
        {
          id: "1234",
          parentUnits: [unitU, unitV],
          approvedDate: sub(firstDate, { seconds: 1 }),
        },
      ],
      anticipatedStartDate: thirteenthDate,
      anticipatedEndDate: fourteenthDate,
      name: "Y",
    });
    const allUnits = [
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
      unitL,
      unitM,
      unitN,
      unitO,
      unitP,
      unitQ,
      unitR,
      unitS,
      unitT,
      unitU,
      unitV,
      unitW,
      unitX,
      unitY,
    ];
    // These are the heads and could only have the correct dep path counts if the others are good
    const checkingUnits = [unitW, unitX, unitY];
    const dependencyCountMapMap: TaskNameToDependencyCountMapMap = {
      W: {
        A: 20,
        B: 15,
        C: 10,
        D: 10,
        E: 5,
        F: 4,
        G: 6,
        H: 4,
        I: 1,
        J: 1,
        K: 3,
        L: 3,
        M: 1,
        N: 0,
        O: 1,
        P: 2,
        Q: 1,
        R: 0,
        S: 1,
        T: 1,
        U: 0,
        V: 0,
        W: 0,
        X: 0,
        Y: 0,
      },
      X: {
        A: 15,
        B: 20,
        C: 5,
        D: 10,
        E: 10,
        F: 1,
        G: 4,
        H: 6,
        I: 4,
        J: 0,
        K: 1,
        L: 3,
        M: 3,
        N: 1,
        O: 0,
        P: 1,
        Q: 2,
        R: 1,
        S: 0,
        T: 1,
        U: 1,
        V: 0,
        W: 0,
        X: 0,
        Y: 0,
      },
      Y: {
        A: 6,
        B: 14,
        C: 1,
        D: 5,
        E: 9,
        F: 0,
        G: 1,
        H: 4,
        I: 5,
        J: 0,
        K: 0,
        L: 1,
        M: 3,
        N: 2,
        O: 0,
        P: 0,
        Q: 1,
        R: 2,
        S: 0,
        T: 0,
        U: 1,
        V: 1,
        W: 0,
        X: 0,
        Y: 0,
      },
    };
    for (const unit of checkingUnits) {
      describe(`From ${unit.name}`, function (): void {
        const depCountMap = dependencyCountMapMap[unit.name];
        assertIsObject(depCountMap);
        for (const depUnit of allUnits) {
          const depCount = depCountMap[depUnit.name];
          assertIsNumber(depCount);
          it(`should have ${depCount} paths to ${depUnit.name}`, function (): void {
            expect(unit.getNumberOfPathsToDependency(depUnit)).to.equal(
              depCount
            );
          });
        }
      });
    }
  });
  describe("Cascading Date Influence", function (): void {
    const innerNow = new Date();
    const firstDate = sub(innerNow, { seconds: 3 * secondsInDay });
    const secondDate = sub(innerNow, { seconds: 2 * secondsInDay });
    const thirdDate = sub(innerNow, { seconds: 1 * secondsInDay });
    // fourth date is now, but is skipped because we don't reference it
    const fifthDate = add(innerNow, { seconds: 1 * secondsInDay });
    // sixth date is skipped because we don't reference it
    const seventhDate = add(innerNow, { seconds: 3 * secondsInDay });
    const eighthDate = add(innerNow, { seconds: 4 * secondsInDay });
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
        unitA = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          anticipatedStartDate: firstDate,
          anticipatedEndDate: fifthDate,
          name: "A",
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: thirdDate,
              prerequisitesVersion: 0,
            },
          ],
        });
        unitB = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            {
              id: "1234",
              parentUnits: [unitA],
              approvedDate: sub(firstDate, { seconds: 1 }),
            },
          ],
          anticipatedStartDate: secondDate,
          anticipatedEndDate: thirdDate,
          name: "B",
        });
        unitC = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            {
              id: "1234",
              parentUnits: [unitA],
              approvedDate: sub(firstDate, { seconds: 1 }),
            },
          ],
          anticipatedStartDate: seventhDate,
          anticipatedEndDate: eighthDate,
          name: "C",
        });
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
        unitA = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            { id: "1234", approvedDate: sub(firstDate, { seconds: 1 }) },
          ],
          anticipatedStartDate: firstDate,
          anticipatedEndDate: fifthDate,
          name: "A",
          eventHistory: [
            {
              type: EventType.TaskIterationStarted,
              date: firstDate,
              prerequisitesVersion: 0,
            },
            { type: EventType.ReviewedAndNeedsMajorRevision, date: thirdDate },
          ],
        });
        unitB = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            {
              id: "1234",
              parentUnits: [unitA],
              approvedDate: sub(firstDate, { seconds: 1 }),
            },
          ],
          anticipatedStartDate: secondDate,
          anticipatedEndDate: thirdDate,
          name: "B",
        });
        unitC = new TaskUnit({
          now: innerNow,
          prerequisitesIterations: [
            {
              id: "1234",
              parentUnits: [unitA],
              approvedDate: sub(firstDate, { seconds: 1 }),
            },
          ],
          anticipatedStartDate: seventhDate,
          anticipatedEndDate: eighthDate,
          name: "C",
        });
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
