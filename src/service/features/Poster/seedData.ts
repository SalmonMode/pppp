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
    anticipatedStartDate: firstDate,
    anticipatedEndDate: secondDate,
    name: "A",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: thirdDate,
      },
    ],
  });
  const unitB = new TaskUnit({
    now,
    parentUnits: [unitA],
    anticipatedStartDate: secondDate,
    anticipatedEndDate: thirdDate,
    name: "B",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
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
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "C",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fifthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: add(sixthDate, { hours: 4 }),
      },
    ],
  });
  const unitD = new TaskUnit({
    now,
    parentUnits: [unitC],
    anticipatedStartDate: sixthDate,
    anticipatedEndDate: seventhDate,
    name: "D",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
      },
      {
        type: EventType.ReviewedAndNeedsRebuild,
        date: add(seventhDate, { hours: 4 }),
      },
      {
        type: EventType.TaskIterationStarted,
        date: eighthDate,
      },
      {
        type: EventType.ReviewedAndNeedsMajorRevision,
        date: ninthDate,
      },
    ],
  });

  const unitE = new TaskUnit({
    now,
    anticipatedStartDate: firstDate,
    anticipatedEndDate: thirdDate,
    name: "E",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: thirdDate,
      },
    ],
  });
  const unitF = new TaskUnit({
    now,
    parentUnits: [unitA, unitE],
    anticipatedStartDate: thirdDate,
    anticipatedEndDate: fourthDate,
    name: "F",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fourthDate,
      },
    ],
  });
  const unitG = new TaskUnit({
    now,
    parentUnits: [unitF],
    anticipatedStartDate: fourthDate,
    anticipatedEndDate: fifthDate,
    name: "G",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ],
  });
  const unitH = new TaskUnit({
    now,
    parentUnits: [unitC, unitG],
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "H",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
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
    anticipatedStartDate: firstDate,
    anticipatedEndDate: secondDate,
    name: "I",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: secondDate,
      },
    ],
  });
  const unitJ = new TaskUnit({
    now,
    parentUnits: [unitA, unitI],
    anticipatedStartDate: secondDate,
    anticipatedEndDate: thirdDate,
    name: "J",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fourthDate,
      },
    ],
  });
  const unitK = new TaskUnit({
    now,
    parentUnits: [unitJ],
    anticipatedStartDate: fourthDate,
    anticipatedEndDate: fifthDate,
    name: "K",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ],
  });
  const unitL = new TaskUnit({
    now,
    parentUnits: [unitC, unitK],
    anticipatedStartDate: fifthDate,
    anticipatedEndDate: sixthDate,
    name: "L",
    eventHistory: [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
      },
    ],
  });
  const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

  return cluster;
}
