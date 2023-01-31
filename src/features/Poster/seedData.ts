import { add, sub } from "date-fns";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { EventType } from "../../types";

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
  const unitA = new TaskUnit(now, [], firstDate, secondDate, "A", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: thirdDate,
    },
  ]);
  const unitB = new TaskUnit(now, [unitA], secondDate, thirdDate, "B", [
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
  ]);
  const unitC = new TaskUnit(now, [], fifthDate, sixthDate, "C", [
    {
      type: EventType.TaskIterationStarted,
      date: fifthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: add(sixthDate, { hours: 4 }),
    },
  ]);
  const unitD = new TaskUnit(now, [unitC], sixthDate, seventhDate, "D", [
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
  ]);

  const unitE = new TaskUnit(now, [], firstDate, secondDate, "E", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: secondDate,
    },
  ]);
  const unitF = new TaskUnit(now, [unitA, unitE], secondDate, thirdDate, "F", [
    {
      type: EventType.TaskIterationStarted,
      date: thirdDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fourthDate,
    },
  ]);
  const unitG = new TaskUnit(now, [unitF], fourthDate, fifthDate, "G", [
    {
      type: EventType.TaskIterationStarted,
      date: fourthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fifthDate,
    },
  ]);
  const unitH = new TaskUnit(now, [unitC, unitG], fifthDate, sixthDate, "H", [
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
  ]);

  const unitI = new TaskUnit(now, [], firstDate, secondDate, "I", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: secondDate,
    },
  ]);
  const unitJ = new TaskUnit(now, [unitA, unitI], secondDate, thirdDate, "J", [
    {
      type: EventType.TaskIterationStarted,
      date: thirdDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fourthDate,
    },
  ]);
  const unitK = new TaskUnit(now, [unitJ], fourthDate, fifthDate, "K", [
    {
      type: EventType.TaskIterationStarted,
      date: fourthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fifthDate,
    },
  ]);
  const unitL = new TaskUnit(now, [unitC, unitK], fifthDate, sixthDate, "L", [
    {
      type: EventType.TaskIterationStarted,
      date: add(sixthDate, { hours: 4 }),
    },
  ]);
  const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

  return cluster;
}
