import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { EventType } from "../../types";
import { sub, add } from "date-fns";

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
  // const tenthDate = add(ninthDate, { days: 1 });
  // const eleventhDate = add(tenthDate, { days: 1 });
  // const twelfthDate = add(eleventhDate, { days: 1 });
  // const firstStartDate = sub(new Date(now.getTime() - 4000);
  // const firstEndDate = new Date(firstStartDate.getTime() + 1000);
  // const secondStartDate = new Date(firstEndDate.getTime() + 1000);
  // const secondEndDate = new Date(secondStartDate.getTime() + 1000);
  // const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
  // const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
  // const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
  // const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
  // const fifthStartDate = new Date(fourthEndDate.getTime() + 1000);
  // const fifthEndDate = new Date(fifthStartDate.getTime() + 1000);
  const unitA = new TaskUnit([], firstDate, secondDate, "A", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: thirdDate,
    },
  ]);
  const unitB = new TaskUnit([unitA], secondDate, thirdDate, "B", [
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
  const unitC = new TaskUnit([], fifthDate, sixthDate, "C", [
    {
      type: EventType.TaskIterationStarted,
      date: fifthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: add(sixthDate, { hours: 4 }),
    },
  ]);
  const unitD = new TaskUnit([unitC], sixthDate, seventhDate, "D", [
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

  const unitE = new TaskUnit([], firstDate, secondDate, "E", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: secondDate,
    },
  ]);
  const unitF = new TaskUnit([unitA, unitE], secondDate, thirdDate, "F", [
    {
      type: EventType.TaskIterationStarted,
      date: thirdDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fourthDate,
    },
  ]);
  const unitG = new TaskUnit([unitF], fourthDate, fifthDate, "G", [
    {
      type: EventType.TaskIterationStarted,
      date: fourthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fifthDate,
    },
  ]);
  const unitH = new TaskUnit([unitC, unitG], fifthDate, sixthDate, "H", [
    {
      type: EventType.TaskIterationStarted,
      date: add(sixthDate, { hours: 4 }),
    },
    {
      type: EventType.ReviewedAndNeedsMajorRevision,
      date: add(seventhDate, { hours: 4 }),
    },
    {
      type: EventType.ReviewedAndNeedsMajorRevision,
      date: eighthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: add(eighthDate, { hours: 4 }),
    },
  ]);

  const unitI = new TaskUnit([], firstDate, secondDate, "I", [
    {
      type: EventType.TaskIterationStarted,
      date: firstDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: secondDate,
    },
  ]);
  const unitJ = new TaskUnit([unitA, unitI], secondDate, thirdDate, "J", [
    {
      type: EventType.TaskIterationStarted,
      date: thirdDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fourthDate,
    },
  ]);
  const unitK = new TaskUnit([unitJ], fourthDate, fifthDate, "K", [
    {
      type: EventType.TaskIterationStarted,
      date: fourthDate,
    },
    {
      type: EventType.ReviewedAndAccepted,
      date: fifthDate,
    },
  ]);
  const unitL = new TaskUnit([unitC, unitK], fifthDate, sixthDate, "L", [
    {
      type: EventType.TaskIterationStarted,
      date: add(sixthDate, { hours: 4 }),
    },
  ]);
  const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

  return cluster;
}
