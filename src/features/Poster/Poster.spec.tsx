import { screen } from "@testing-library/react";
import { expect } from "chai";
import { SinonStub, SinonSandbox, createSandbox } from "sinon";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject, assertIsString } from "../../typePredicates";
import { renderWithProvider } from "../../Utility/TestRenderers";
import {
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
});
