import { screen } from "@testing-library/react";
import { expect } from "chai";
import { renderWithProvider } from "../../Utility/TestRenderers";
import PosterBoard from "./PosterBoard";

describe("React Integration: PosterBoard", () => {
  describe("Initial State", () => {
    beforeEach(function () {
      renderWithProvider(<PosterBoard />);
    });
    it('should initially say "loading..."', async function () {
      let poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
    it("should have 4 tracks after loading", async function () {
      let poster = await screen.findByTestId(`poster`);
      const tracks = poster.querySelectorAll(".taskTrack");
      expect(tracks.length).to.equal(4);
    });
  });
});
