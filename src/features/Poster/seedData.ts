import { TaskUnit, TaskUnitCluster } from "../../Relations";

export function getSeedData(): TaskUnitCluster {
  const firstStartDate = new Date();
  const firstEndDate = new Date(firstStartDate.getTime() + 1000);
  const secondStartDate = new Date(firstEndDate.getTime() + 1000);
  const secondEndDate = new Date(secondStartDate.getTime() + 1000);
  const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
  const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
  const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
  const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
  const unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
  const unitB = new TaskUnit(
    [unitA],
    new Date(firstStartDate.getTime() + 100),
    new Date(firstEndDate.getTime() + 100),
    "B"
  );
  const unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
  const unitD = new TaskUnit(
    [unitC],
    new Date(thirdStartDate.getTime() + 100),
    new Date(thirdEndDate.getTime() + 100),
    "D"
  );

  const unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
  const unitF = new TaskUnit(
    [unitA, unitE],
    secondStartDate,
    secondEndDate,
    "F"
  );
  const unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
  const unitH = new TaskUnit(
    [unitC, unitG],
    fourthStartDate,
    fourthEndDate,
    "H"
  );
  const unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
  const unitJ = new TaskUnit(
    [unitA, unitI],
    secondStartDate,
    secondEndDate,
    "J"
  );
  const unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
  const unitL = new TaskUnit(
    [unitC, unitK],
    fourthStartDate,
    fourthEndDate,
    "L"
  );
  const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);
  // const firstStartDate = new Date();
  // const firstEndDate = new Date(firstStartDate.getTime() + 1000);
  // const secondStartDate = new Date(firstEndDate.getTime());
  // const secondEndDate = new Date(secondStartDate.getTime() + 1000);
  // const thirdStartDate = new Date(secondEndDate.getTime());
  // const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
  // const fourthStartDate = new Date(thirdEndDate.getTime());
  // const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
  // const unitA = new TaskUnit(
  //   [],
  //   firstStartDate,
  //   firstEndDate,
  //   "A",
  //   secondStartDate
  // );
  // // unitA.apparentEndDate = secondEndDate;
  // const unitB = new TaskUnit([], firstStartDate, firstEndDate, "B");
  // const unitC = new TaskUnit([], firstStartDate, firstEndDate, "C");

  // const unitD = new TaskUnit([unitA], secondStartDate, secondEndDate, "D");
  // const unitE = new TaskUnit(
  //   [unitA, unitB],
  //   secondStartDate,
  //   secondEndDate,
  //   "E"
  // );
  // const unitF = new TaskUnit(
  //   [unitB, unitC],
  //   secondStartDate,
  //   secondEndDate,
  //   "F"
  // );
  // const unitG = new TaskUnit([unitC], secondStartDate, secondEndDate, "G");

  // const unitH = new TaskUnit([unitD, unitE], thirdStartDate, thirdEndDate, "H");
  // const unitI = new TaskUnit([unitE, unitF], thirdStartDate, thirdEndDate, "I");
  // const unitJ = new TaskUnit([unitF, unitG], thirdStartDate, thirdEndDate, "J");

  // const cluster = new TaskUnitCluster([unitH, unitI, unitJ]);

  return cluster;
}
