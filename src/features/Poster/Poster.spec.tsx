import { screen } from "@testing-library/react";
import { expect } from "chai";
import { sub, add } from "date-fns";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject, assertIsString } from "../../typePredicates";
import { EventType } from "../../types";
import { renderWithProvider } from "../../Utility/TestRenderers";
import {
  borderSize,
  extensionColor,
  prereqsAcceptedColor,
  prereqsPendingColor,
  prerequisitesBoxWidth,
  reviewAcceptedColor,
  reviewBoxWidth,
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

const now = new Date();
const firstDate = sub(now, { days: 10 });
const secondDate = add(firstDate, { days: 1 });
const thirdDate = add(secondDate, { days: 1 });
const fourthDate = add(thirdDate, { days: 1 });
const fifthDate = add(fourthDate, { days: 1 });
const sixthDate = add(fifthDate, { days: 1 });
const seventhDate = add(sixthDate, { days: 1 });
const eighthDate = add(seventhDate, { days: 1 });
const ninthDate = add(eighthDate, { days: 1 });
const tenthDate = add(eighthDate, { days: 1 });
// const now = new Date();
// const firstDate = new Date(now.getTime() - 100000);
// const secondDate = new Date(firstDate.getTime() + 1000);
// const thirdDate = new Date(secondDate.getTime() + 1000);
// const fourthDate = new Date(thirdDate.getTime() + 1000);
// const fifthDate = new Date(fourthDate.getTime() + 1000);
// const sixthDate = new Date(fifthDate.getTime() + 1000);
// const seventhDate = new Date(sixthDate.getTime() + 1000);
// const eighthDate = new Date(seventhDate.getTime() + 1000);
// const ninthDate = new Date(eighthDate.getTime() + 1000);
// const tenthDate = new Date(ninthDate.getTime() + 1000);

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
    const firstDate = add(now, { days: 1 });
    const secondDate = add(firstDate, { days: 1 });
    const thirdDate = add(secondDate, { days: 1 });
    const fourthDate = add(thirdDate, { days: 1 });
    const fifthDate = add(fourthDate, { days: 1 });
    const sixthDate = add(fifthDate, { days: 1 });
    const seventhDate = add(sixthDate, { days: 1 });
    const eighthDate = add(seventhDate, { days: 1 });
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
      unitA = new TaskUnit([], firstDate, thirdDate, "A");
      unitB = new TaskUnit([unitA], secondDate, thirdDate, "B");
      unitC = new TaskUnit([], fifthDate, seventhDate, "C");
      unitD = new TaskUnit([unitC], sixthDate, eighthDate, "D");

      unitE = new TaskUnit([], firstDate, secondDate, "E");
      unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      unitI = new TaskUnit([], firstDate, secondDate, "I");
      unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");

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
    it("should have A-C on third track (index 2)", function () {
      const text = tracks[2]?.textContent;
      expect(text && [...text]).to.have.members(["A", "C"]);
    });
    it("should have red background for unit B Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);

      unitBBox.style.backgroundColor;
      expect(unitBBox.style.backgroundColor).to.equal(snailTrailColor);
    });
    it("should have card smaller than unit A for unit B", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitACard = unitABox.querySelector(".taskUnit");
      assertIsObject(unitACard);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);

      expect(
        Number(getComputedStyle(unitBCard).width.slice(0, -2))
      ).to.be.lessThan(Number(getComputedStyle(unitACard).width.slice(0, -2)));
    });
    it("should have same width for unit B Box than for unit A Box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      expect(Number(getComputedStyle(unitBBox).width.slice(0, -2))).to.equal(
        Number(getComputedStyle(unitABox).width.slice(0, -2))
      );
    });
    it("should have unit B positioned to the right more than unit A box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitBBoxLeft = Number(getComputedStyle(unitBBox).left.slice(0, -2));
      const unitABoxLeft = Number(getComputedStyle(unitABox).left.slice(0, -2));
      expect(unitBBoxLeft).greaterThan(unitABoxLeft);
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
    it("should have unit D positioned to the right more than unit C box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitDBoxLeft = Number(getComputedStyle(unitDBox).left.slice(0, -2));
      const unitCBoxLeft = Number(getComputedStyle(unitCBox).left.slice(0, -2));
      expect(unitDBoxLeft).greaterThan(unitCBoxLeft);
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
          x: Math.round(
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitB.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitD.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitK.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitL.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitL.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitJ.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitK.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitI.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitJ.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitJ.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitG.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitH.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitC.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitH.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitF.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitG.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitE.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitF.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
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
          x: Math.round(
            (initialState.units[unitA.id]!.apparentEndTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
            trackHeight / 2,
        },
        {
          x: Math.round(
            (initialState.units[unitF.id]!.apparentStartTime -
              earliestStartTime) /
              unitTaskTimeConversion
          ),
          y:
            getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
            trackHeight / 2,
        }
      );
      expect(points).to.deep.equal(expectedPoints);
    });
  });
  describe("Reusing Tracks (Different Path Heights)", () => {
    const firstDate = add(now, { days: 1 });
    const secondDate = add(firstDate, { days: 1 });
    const thirdDate = add(secondDate, { days: 1 });
    const fourthDate = add(thirdDate, { days: 1 });
    const fifthDate = add(fourthDate, { days: 1 });
    const sixthDate = add(fifthDate, { days: 1 });
    const seventhDate = add(sixthDate, { days: 1 });
    const eighthDate = add(seventhDate, { days: 1 });
    let initialState: TaskUnitsState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
    before(function () {
      const unitA = new TaskUnit([], firstDate, thirdDate, "A");
      const unitB = new TaskUnit([unitA], secondDate, fourthDate, "B");
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit([unitC], seventhDate, eighthDate, "D");

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");

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
    it("should have A-C on third track (index 2)", function () {
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
      unitA = new TaskUnit([], firstDate, secondDate, "A", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: thirdDate,
        },
      ]);
      unitB = new TaskUnit([unitA], secondDate, thirdDate, "B", [
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
      unitC = new TaskUnit([], fifthDate, sixthDate, "C", [
        {
          type: EventType.TaskIterationStarted,
          date: fifthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
      unitD = new TaskUnit([unitC], sixthDate, seventhDate, "D", [
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

      unitE = new TaskUnit([], firstDate, secondDate, "E", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitF = new TaskUnit([unitA, unitE], secondDate, thirdDate, "F", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitG = new TaskUnit([unitF], fourthDate, fifthDate, "G", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitH = new TaskUnit([unitC, unitG], fifthDate, sixthDate, "H", [
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

      unitI = new TaskUnit([], firstDate, secondDate, "I", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitJ = new TaskUnit([unitA, unitI], secondDate, thirdDate, "J", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitK = new TaskUnit([unitJ], fourthDate, fifthDate, "K", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitL = new TaskUnit([unitC, unitK], fifthDate, sixthDate, "L", [
        {
          type: EventType.TaskIterationStarted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
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
    it("should have card same width as unit B for unit A", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitACard = unitABox.querySelector(".taskUnit");
      assertIsObject(unitACard);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);
      expect(Number(getComputedStyle(unitACard).width.slice(0, -2))).to.equal(
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
    it("should have unit B positioned to the right more than unit A box", function () {
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      const unitBBoxLeft = Number(getComputedStyle(unitBBox).left.slice(0, -2));
      const unitABoxLeft = Number(getComputedStyle(unitABox).left.slice(0, -2));
      expect(unitBBoxLeft).greaterThan(unitABoxLeft);
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
    it("should have unit D positioned to the right more than unit C box", function () {
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      const unitDBoxLeft = Number(getComputedStyle(unitDBox).left.slice(0, -2));
      const unitCBoxLeft = Number(getComputedStyle(unitCBox).left.slice(0, -2));
      expect(unitDBoxLeft).greaterThan(unitCBoxLeft);
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to actual duration, and review and prereq box widths", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[0];
          const reviewEvent = relevantUnit.eventHistory[1];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
          );
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
        it("should have second task box wrapper with a width according to anticipated duration and border", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) - borderSize
          );
        });
        it("should have non labeled task box in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width according to anticipated duration and border in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) - borderSize
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to actual duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[0];
          const reviewEvent = relevantUnit.eventHistory[1];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
          );
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
        it("should have second task box wrapper with a width according to anticipated duration, and review and prereq box widths", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth
          );
        });
        it("should have non labeled task box in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width according to anticipated duration in second task box wrapper, and review and prereq box widths", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth
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
        it("should have third task box wrapper with a width according to anticipated duration, review box width, and border", function () {
          // doesn't need to compensate for prereq box
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              borderSize
          );
        });
        it("should have non labeled task box in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width according to anticipated duration, review box width, and border in third task box wrapper", function () {
          // doesn't need to compensate for prereq box
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              borderSize
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
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
        it("should have task box wrapper with a width according to actual duration, review and prereq box widths, and border", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[0];
          const reviewEvent = relevantUnit.eventHistory[1];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize
          );
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
        it("should have red review box", function () {
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewMajorColor
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
        it("should have second task box wrapper as the fourth item", function () {
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
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(3);
        });
        it("should have second task box wrapper with a width according to actual duration, and review box width", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[1];
          const reviewEvent = relevantUnit.eventHistory[2];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) - reviewBoxWidth
          );
        });
        it("should have non labeled task box in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width according to actual duration, and review box width in second task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[1];
          const reviewEvent = relevantUnit.eventHistory[2];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) - reviewBoxWidth
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
        it("should have red review box as second review box", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewMajorColor
          );
        });
        it("should have review box as fifth item", function () {
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
          expect(parentChildren.indexOf(reviewBox)).to.equal(4);
        });
        it("should have third task box wrapper as the sixth item", function () {
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
          expect(parentChildren.indexOf(taskBoxWrapper)).to.equal(5);
        });
        it("should have third task box wrapper with a width according to actual duration, review box width, and border", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[2];
          const reviewEvent = relevantUnit.eventHistory[3];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              borderSize
          );
        });
        it("should have non labeled task box in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(taskBox.textContent).to.equal("");
        });
        it("should have task box with a width according to actual duration, review box width, and border in third task box wrapper", function () {
          const taskBoxWrapper = card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(taskBoxWrapper);
          const precedingEvent = relevantUnit.eventHistory[2];
          const reviewEvent = relevantUnit.eventHistory[3];
          assertIsObject(precedingEvent);
          assertIsObject(reviewEvent);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (reviewEvent.date.getTime() - precedingEvent.date.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              borderSize
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
        it("should have green review box", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[2];
          assertIsObject(reviewBox);
          expect(getComputedStyle(reviewBox).backgroundColor).to.equal(
            reviewAcceptedColor
          );
        });
        it("should have review box at the end", function () {
          const reviewBox = card.querySelectorAll(".reviewBox")[2];
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
        it("should have task box with a width according to anticipated duration, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          expect(Number(getComputedStyle(taskBox).width.slice(0, -2))).to.equal(
            Math.round(
              (relevantUnit.anticipatedEndDate.getTime() -
                relevantUnit.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
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
        it("should have task box wrapper with a width according to start time, current time, review and prereq box widths, and borders", function () {
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          const startDate = relevantUnit.apparentStartDate;
          expect(
            Number(getComputedStyle(taskBoxWrapper).width.slice(0, -2))
          ).to.equal(
            Math.round(
              (now.getTime() - startDate.getTime()) / unitTaskTimeConversion
            ) -
              reviewBoxWidth -
              prerequisitesBoxWidth -
              borderSize * 2
          );
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
            x: Math.round(
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitB.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitD.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitK.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitL.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitL.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitJ.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitK.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitI.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitJ.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitJ.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitG.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitH.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitC.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitH.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitF.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitG.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitE.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitF.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
            x: Math.round(
              (initialState.units[unitA.id]!.apparentEndTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (initialState.units[unitF.id]!.apparentStartTime -
                earliestStartTime) /
                unitTaskTimeConversion
            ),
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
