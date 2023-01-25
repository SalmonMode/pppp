import { screen } from "@testing-library/react";
import { expect } from "chai";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject, assertIsString } from "../../typePredicates";
import { EventType } from "../../types";
import { renderWithProvider } from "../../Utility/TestRenderers";
import {
  extensionColor,
  prereqsAcceptedColor,
  prereqsPendingColor,
  reviewAcceptedColor,
  reviewMajorColor,
  reviewMinorColor,
  reviewPendingColor,
  reviewRebuildColor,
  snailTrailColor,
  trackHeight,
  unitTaskTimeConversion,
} from "../constants";
import getYOfTrackTop from "./getYOfTrackTop";
import Poster from "./Poster";
import type { TaskUnitsState } from "./taskUnitsSlice";
import { turnClusterIntoState } from "./turnClusterIntoState";

describe("React Integration: Poster", () => {
  describe("Initial State", () => {
    beforeEach(function () {
      renderWithProvider(<Poster />);
    });

    it('should say "loading..."', async function () {
      let poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
  describe("Reusing Tracks", () => {
    let initialState: TaskUnitsState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
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

    before(function () {
      const firstStartDate = new Date();
      const firstEndDate = new Date(firstStartDate.getTime() + 1000);
      const secondStartDate = new Date(firstEndDate.getTime() + 1000);
      const secondEndDate = new Date(secondStartDate.getTime() + 1000);
      const thirdStartDate = new Date(secondEndDate.getTime() + 1000);
      const thirdEndDate = new Date(thirdStartDate.getTime() + 1000);
      const fourthStartDate = new Date(thirdEndDate.getTime() + 1000);
      const fourthEndDate = new Date(fourthStartDate.getTime() + 1000);
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A");
      unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B"
      );
      unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C");
      unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D"
      );

      unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      unitF = new TaskUnit([unitA, unitE], secondStartDate, secondEndDate, "F");
      unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      unitH = new TaskUnit([unitC, unitG], fourthStartDate, fourthEndDate, "H");
      unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      unitJ = new TaskUnit([unitA, unitI], secondStartDate, secondEndDate, "J");
      unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      unitL = new TaskUnit([unitC, unitK], fourthStartDate, fourthEndDate, "L");

      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      initialState = turnClusterIntoState(cluster);
      const unitIDetails = initialState.units[unitI.id];
      assertIsObject(unitIDetails);
    });
    beforeEach(async function () {
      renderWithProvider(<Poster />, {
        preloadedState: {
          taskUnits: initialState,
        },
      });
      poster = await screen.findByTestId(`poster`);
      tracks = poster.querySelectorAll(".taskTrack");
    });

    it("should have 4 task tracks", function () {
      expect(tracks.length).to.equal(4);
    });
    it("should have B-D on second track (index 1)", function () {
      const text = tracks[1]?.textContent;
      expect(text && [...text]).to.have.members(["B", "D"]);
    });
    it("should have A-C on second track (index 1)", function () {
      const text = tracks[2]?.textContent;
      expect(text && [...text]).to.have.members(["A", "C"]);
    });
    it("should have red background for unit B Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);

      unitBBox.style.backgroundColor;
      expect(unitBBox.style.backgroundColor).to.equal(snailTrailColor);
    });
    it("should have same size card as unit A for unit B", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitACard = unitABox.querySelector(".taskUnit");
      const unitBCard = unitBBox.querySelector(".taskUnit");
      expect(unitBCard && getComputedStyle(unitBCard).width).to.equal(
        unitACard && getComputedStyle(unitACard).width
      );
    });
    it("should have larger width for unit B Box than for unit A Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      expect(
        Number(getComputedStyle(unitBBox).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitABox).width.slice(0, -2))
      );
    });
    it("should have unit B positioned to the right slightly more than unit A box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitBBoxLeft = Number(getComputedStyle(unitBBox).left.slice(0, -2));
      const unitABoxLeft = Number(getComputedStyle(unitABox).left.slice(0, -2));
      expect(unitBBoxLeft - unitABoxLeft).to.equal(10);
    });
    it("should have red background for unit D Box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);

      unitDBox.style.backgroundColor;
      expect(unitDBox.style.backgroundColor).to.equal(snailTrailColor);
    });
    it("should have same size card as unit C for unit D", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitCCard = unitCBox.querySelector(".taskUnit");
      const unitDCard = unitDBox.querySelector(".taskUnit");
      expect(unitDCard && getComputedStyle(unitDCard).width).to.equal(
        unitCCard && getComputedStyle(unitCCard).width
      );
    });
    it("should have larger width for unit D Box than for unit C Box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      expect(
        Number(getComputedStyle(unitDBox).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitCBox).width.slice(0, -2))
      );
    });
    it("should have unit D positioned to the right slightly more than unit C box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitDBoxLeft = Number(getComputedStyle(unitDBox).left.slice(0, -2));
      const unitCBoxLeft = Number(getComputedStyle(unitCBox).left.slice(0, -2));
      expect(unitDBoxLeft - unitCBoxLeft).to.equal(10);
    });
    it("should have path from B to A", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitB.id}-${unitA.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitB.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitB.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from D to C", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitD.id}-${unitC.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitD.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitD.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from L to K", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitL.id}-${unitK.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitK.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitL.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from L to C", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitL.id}-${unitC.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitL.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from K to J", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitK.id}-${unitJ.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitJ.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitK.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from J to I", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitJ.id}-${unitI.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitI.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitJ.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from J to A", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitJ.id}-${unitA.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitJ.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from H to G", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitH.id}-${unitG.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitG.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitH.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from H to C", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitH.id}-${unitC.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitH.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from G to F", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitG.id}-${unitF.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitF.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitG.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from F to E", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitF.id}-${unitE.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitE.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitF.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
    it("should have path from F to A", function () {
      const pathGroup = screen.getByTestId(`pathGroup-${unitF.id}-${unitA.id}`);
      const path = pathGroup.querySelector("path");
      assertIsObject(path);
      const pathD = path.getAttribute("d");
      assertIsString(pathD);
      const points = ConnectedPoints.fromCurve(pathD);
      const earliestStartTime = unitI.anticipatedStartDate.getTime();
      const expectedPoints = new ConnectedPoints(
        {
          x:
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x:
            (initialState.units[unitF.id]!.apparentStartTime -
              earliestStartTime) /
            unitTaskTimeConversion,
          y:
            getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
  });
  describe("Reusing Tracks (Different Path Heights)", () => {
    let initialState: TaskUnitsState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
    before(function () {
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
      const unitD = new TaskUnit([unitC], fourthStartDate, fourthEndDate, "D");

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

      initialState = turnClusterIntoState(cluster);
      const unitIDetails = initialState.units[unitI.id];
      assertIsObject(unitIDetails);
    });
    beforeEach(async function () {
      renderWithProvider(<Poster />, {
        preloadedState: {
          taskUnits: initialState,
        },
      });
      poster = await screen.findByTestId(`poster`);
      tracks = poster.querySelectorAll(".taskTrack");
    });

    it("should have 4 task tracks", function () {
      expect(tracks.length).to.equal(4);
    });
    it("should have B on second track (index 1)", function () {
      const text = tracks[1]?.textContent;
      expect(text && [...text]).to.have.members(["B"]);
    });
    it("should have A-C on second track (index 1)", function () {
      const text = tracks[2]?.textContent;
      expect(text && [...text]).to.have.members(["A", "C", "D"]);
    });
  });
  describe("Chaotic Tracks", () => {
    let initialState: TaskUnitsState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
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
      unitA = new TaskUnit([], firstStartDate, firstEndDate, "A", [
        {
          type: EventType.TaskIterationStarted,
          date: firstStartDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondStartDate,
        },
      ]);
      unitB = new TaskUnit(
        [unitA],
        new Date(firstStartDate.getTime() + 100),
        new Date(firstEndDate.getTime() + 100),
        "B",
        [
          {
            type: EventType.TaskIterationStarted,
            date: secondStartDate,
          },
          {
            type: EventType.ReviewedAndNeedsMinorRevision,
            date: new Date(secondEndDate.getTime() - 100),
          },
        ]
      );
      unitC = new TaskUnit([], thirdStartDate, thirdEndDate, "C", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdStartDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: thirdEndDate,
        },
      ]);
      unitD = new TaskUnit(
        [unitC],
        new Date(thirdStartDate.getTime() + 100),
        new Date(thirdEndDate.getTime() + 100),
        "D",
        [
          {
            type: EventType.TaskIterationStarted,
            date: fourthStartDate,
          },
          {
            type: EventType.ReviewedAndNeedsRebuild,
            date: fourthEndDate,
          },
          {
            type: EventType.TaskIterationStarted,
            date: fifthStartDate,
          },
          {
            type: EventType.ReviewedAndNeedsMajorRevision,
            date: fifthEndDate,
          },
        ]
      );

      unitE = new TaskUnit([], firstStartDate, firstEndDate, "E");
      unitF = new TaskUnit([unitA, unitE], secondStartDate, secondEndDate, "F");
      unitG = new TaskUnit([unitF], thirdStartDate, thirdEndDate, "G");
      unitH = new TaskUnit([unitC, unitG], fourthStartDate, fourthEndDate, "H");
      unitI = new TaskUnit([], firstStartDate, firstEndDate, "I");
      unitJ = new TaskUnit([unitA, unitI], secondStartDate, secondEndDate, "J");
      unitK = new TaskUnit([unitJ], thirdStartDate, thirdEndDate, "K");
      unitL = new TaskUnit([unitC, unitK], fourthStartDate, fourthEndDate, "L");
      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      initialState = turnClusterIntoState(cluster);
      const unitIDetails = initialState.units[unitI.id];
      assertIsObject(unitIDetails);
    });
    beforeEach(async function () {
      renderWithProvider(<Poster />, {
        preloadedState: {
          taskUnits: initialState,
        },
      });
      poster = await screen.findByTestId(`poster`);
      tracks = poster.querySelectorAll(".taskTrack");
    });

    it("should have 4 task tracks", function () {
      expect(tracks.length).to.equal(4);
    });
    it("should have B-D on second track (index 1)", function () {
      const text = tracks[1]?.textContent;
      expect(text && [...text]).to.have.members(["B", "D"]);
    });
    it("should have A-C on second track (index 1)", function () {
      const text = tracks[2]?.textContent;
      expect(text && [...text]).to.have.members(["A", "C"]);
    });
    it("should have red background for unit B Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);

      unitBBox.style.backgroundColor;
      expect(unitBBox.style.backgroundColor).to.equal(snailTrailColor);
    });
    it("should have card wider than unit B for unit A", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitACard = unitABox.querySelector(".taskUnit");
      assertIsObject(unitACard);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);
      expect(
        Number(getComputedStyle(unitACard).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitBCard).width.slice(0, -2))
      );
    });
    it("should have larger width for unit B Box than for unit A Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      expect(
        Number(getComputedStyle(unitBBox).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitABox).width.slice(0, -2))
      );
    });
    it("should have unit B positioned to the right slightly more than unit A box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitBBoxLeft = Number(getComputedStyle(unitBBox).left.slice(0, -2));
      const unitABoxLeft = Number(getComputedStyle(unitABox).left.slice(0, -2));
      expect(unitBBoxLeft - unitABoxLeft).to.equal(10);
    });
    it("should have red background for unit D Box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);

      unitDBox.style.backgroundColor;
      expect(unitDBox.style.backgroundColor).to.equal(snailTrailColor);
    });
    it("should have card wider than unit C for unit D", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitCCard = unitCBox.querySelector(".taskUnit");
      assertIsObject(unitCCard);
      const unitDCard = unitDBox.querySelector(".taskUnit");
      assertIsObject(unitDCard);
      expect(
        Number(getComputedStyle(unitDCard).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitCCard).width.slice(0, -2))
      );
    });
    it("should have larger width for unit D Box than for unit C Box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      expect(
        Number(getComputedStyle(unitDBox).width.slice(0, -2))
      ).to.be.greaterThan(
        Number(getComputedStyle(unitCBox).width.slice(0, -2))
      );
    });
    it("should have unit D positioned to the right slightly more than unit C box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitDBoxLeft = Number(getComputedStyle(unitDBox).left.slice(0, -2));
      const unitCBoxLeft = Number(getComputedStyle(unitCBox).left.slice(0, -2));
      expect(unitDBoxLeft - unitCBoxLeft).to.equal(10);
    });
    describe("Cards", function () {
      describe("A", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitA;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have green prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsAcceptedColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 150", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(150);
        });
        it("should have task box wrapper as the second item", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have green review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewAcceptedColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("B", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitB;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have green prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsAcceptedColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 40", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(40);
        });
        it("should have task box wrapper as the second item", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have yellow review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewMinorColor
          );
        });
        it("should have review box as third item", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(reviewBox)).to.equal(2);
        });
        it("should have second task box wrapper as the last item", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(taskBoxWrapper);
        });
        it("should have second task box wrapper with a width of 100", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(100);
        });
        it("should have non labeled task box in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width of 100 in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            100
          );
        });
        it("should have extension trail with pink background color in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
      });
      describe("C", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitC;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have green prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsAcceptedColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper as the second item", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have green review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewAcceptedColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("D", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitD;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have green prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsAcceptedColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper as the second item", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have black review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewRebuildColor
          );
        });
        it("should have review box as third item", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(reviewBox)).to.equal(2);
        });
        it("should have extension trail as fourth item", function () {
          const trail = card.querySelector(".reviewBox + .extensionTrail");
          assertIsObject(trail);
          const parent = trail.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(trail)).to.equal(3);
        });
        it("should have second prereq box as fifth item", function () {
          const prereqBox = card.querySelectorAll(".prerequisiteBox")[1];
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(prereqBox)).to.equal(4);
        });
        it("should have second task box wrapper as sixth item", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(5);
        });
        it("should have second task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have non labeled task box in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width of 50 in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have red review box", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewMajorColor
          );
        });
        it("should have second review box as seventh item", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(reviewBox)).to.equal(6);
        });
        it("should have third task box wrapper as sixth item", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(7);
        });
        it("should have third task box wrapper with a width of 75", function () {
          // 75 because it doesn't need to compensate for prereq box
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(75);
        });
        it("should have non labeled task box in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width of 75 in third task box wrapper", function () {
          // 75 because it doesn't need to compensate for prereq box
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            75
          );
        });
        it("should have extension trail with pink background color in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have task box as first child in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[2];
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have third review box at the end", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[2];
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("E", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitE;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("F", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitF;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("G", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitG;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("H", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitH;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("I", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitI;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("J", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitJ;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("K", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitK;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
      describe("L", function () {
        let card: Element;
        let relevantUnit: TaskUnit;
        beforeEach(async function () {
          relevantUnit = unitL;
          const box = screen.getByTestId(`task-${relevantUnit.id}`);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          card = possibleCard;
        });
        it("should have white prerequisites box", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          expect(getComputedStyle(prereqBox).backgroundColor).to.equal(
            prereqsPendingColor
          );
        });
        it("should have prerequisites box in the beginning", function () {
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          const parent = prereqBox.parentElement;
          assertIsObject(parent);
          expect(parent.firstChild).to.equal(prereqBox);
        });
        it("should have labeled task box", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal(relevantUnit.name);
        });
        it("should have task box with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            50
          );
        });
        it("should have extension trail with pink background color in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).backgroundColor).to.equal(
            extensionColor
          );
        });
        it("should have extension trail lined up to grow in space left behind in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(getComputedStyle(trail).flexGrow).to.equal("1");
        });
        it("should have extension trail with 0 width in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(Number(getComputedStyle(trail).width.slice(0, -2))).to.equal(
            0
          );
        });
        it("should have task box as first child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBoxWrapper.firstChild).to.equal(taskBox);
        });
        it("should have extension trail as last child in task box wrapper", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          expect(taskBoxWrapper.lastChild).to.equal(trail);
        });
        it("should have task box wrapper with a width of 50", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(50);
        });
        it("should have task box wrapper in the middle", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const parent = taskBoxWrapper.parentElement;
          assertIsObject(parent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(1);
        });
        it("should have white review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewPendingColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          const parent = reviewBox.parentElement;
          assertIsObject(parent);
          expect(parent.lastChild).to.equal(reviewBox);
        });
      });
    });
    describe("Paths", function () {
      it("should have path from B to A", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitB.id}-${unitA.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitB.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitB.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from D to C", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitD.id}-${unitC.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitD.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitD.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from L to K", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitL.id}-${unitK.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitK.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitL.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from L to C", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitL.id}-${unitC.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitL.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from K to J", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitK.id}-${unitJ.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitJ.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitK.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from J to I", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitJ.id}-${unitI.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitI.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitJ.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from J to A", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitJ.id}-${unitA.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitJ.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from H to G", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitH.id}-${unitG.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitG.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitH.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from H to C", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitH.id}-${unitC.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitH.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from G to F", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitG.id}-${unitF.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitF.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitG.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from F to E", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitF.id}-${unitE.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitE.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitF.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
      it("should have path from F to A", function () {
        const pathGroup = screen.getByTestId(
          `pathGroup-${unitF.id}-${unitA.id}`
        );
        const path = pathGroup.querySelector("path");
        assertIsObject(path);
        const pathD = path.getAttribute("d");
        assertIsString(pathD);
        const points = ConnectedPoints.fromCurve(pathD);
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x:
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x:
              (initialState.units[unitF.id]!.apparentStartTime -
                earliestStartTime) /
              unitTaskTimeConversion,
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(points).to.deep.equal(expectedPoints);
      });
    });
  });
});
