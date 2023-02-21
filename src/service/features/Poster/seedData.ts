import { add, sub } from "date-fns";
import { TaskUnit, TaskUnitCluster } from "../../../Relations";
import { EventType } from "../../../types";

export function getSeedData(): TaskUnitCluster {
  const now = new Date();
  const firstDate = sub(now, { days: 9 });
  const secondDate = add(firstDate, { days: 1 });
  const thirdDate = add(secondDate, { days: 1 });
  const fourthDate = add(thirdDate, { days: 1 });
  const fifthDate = add(fourthDate, { days: 1 });
  const sixthDate = add(fifthDate, { days: 1 });
  const seventhDate = add(sixthDate, { days: 1 });
  const eighthDate = add(seventhDate, { days: 1 });
  const ninthDate = add(eighthDate, { days: 1 });
  const unitA = new TaskUnit({
    now,
    prerequisitesIterations: [
      { id: "1234", approvedDate: sub(firstDate, { hours: 4 }) },
    ],
    anticipatedStartDate: firstDate,
    anticipatedEndDate: secondDate,
    name: "A",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: thirdDate,
      },
    ],
  });
  const unitB = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitA],
      },
    ],
    anticipatedStartDate: secondDate,
    anticipatedEndDate: thirdDate,
    name: "B",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndNeedsMinorRevision,
        date: fourthDate,
      },
      {
        type: EventType.MinorRevisionComplete,
        date: fifthDate,
      },
    ],
  });
  const unitC = new TaskUnit({
    now,
    prerequisitesIterations: [
      { id: "1234", approvedDate: sub(firstDate, { hours: 4 }) },
    ],
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "C",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fifthDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: add(sixthDate, { hours: 4 }),
      },
    ],
  });
  const unitD = new TaskUnit({
    now,
    prerequisitesIterations: [
      { id: "1234", approvedDate: fifthDate, parentUnits: [unitC] },
      {
        id: "123456",
        approvedDate: add(seventhDate, { hours: 6 }),
        parentUnits: [unitC],
      },
    ],
    anticipatedStartDate: sixthDate,
    anticipatedEndDate: seventhDate,
    name: "D",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndNeedsRebuild,
        date: add(seventhDate, { hours: 4 }),
      },
      {
        type: EventType.TaskIterationStarted,
        date: eighthDate,
        prerequisitesVersion: 1,
      },
      {
        type: EventType.ReviewedAndNeedsMajorRevision,
        date: ninthDate,
      },
    ],
  });

  const unitE = new TaskUnit({
    now,
    prerequisitesIterations: [
      { id: "1234", approvedDate: sub(firstDate, { hours: 4 }) },
    ],
    anticipatedStartDate: firstDate,
    anticipatedEndDate: thirdDate,
    name: "E",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: thirdDate,
      },
    ],
  });
  const unitF = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitA, unitE],
      },
    ],
    anticipatedStartDate: thirdDate,
    anticipatedEndDate: fourthDate,
    name: "F",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fourthDate,
      },
    ],
  });
  const unitG = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitF],
      },
    ],
    anticipatedStartDate: fourthDate,
    anticipatedEndDate: fifthDate,
    name: "G",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ],
  });
  const unitH = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitC, unitG],
      },
    ],
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "H",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndNeedsMajorRevision,
        date: add(seventhDate, { hours: 4 }),
      },
      {
        type: EventType.ReviewedAndNeedsRebuild,
        date: eighthDate,
      },
    ],
  });

  const unitI = new TaskUnit({
    now,
    prerequisitesIterations: [
      { id: "1234", approvedDate: sub(firstDate, { hours: 4 }) },
    ],
    anticipatedStartDate: firstDate,
    anticipatedEndDate: secondDate,
    name: "I",
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
  const unitJ = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitA, unitI],
      },
    ],
    anticipatedStartDate: secondDate,
    anticipatedEndDate: thirdDate,
    name: "J",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fourthDate,
      },
    ],
  });
  const unitK = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitJ],
      },
    ],
    anticipatedStartDate: fourthDate,
    anticipatedEndDate: fifthDate,
    name: "K",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
        prerequisitesVersion: 0,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ],
  });
  const unitL = new TaskUnit({
    now,
    prerequisitesIterations: [
      {
        id: "1234",
        approvedDate: sub(firstDate, { hours: 4 }),
        parentUnits: [unitC, unitK],
      },
    ],
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "L",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
        prerequisitesVersion: 0,
      },
    ],
  });
  const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

  return cluster;
}
