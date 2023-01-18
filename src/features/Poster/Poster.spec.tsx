import { screen } from "@testing-library/react";
import { expect } from "chai";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject } from "../../typePredicates";
import { renderWithProvider } from "../../Utility/TestRenderers";
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
