import { screen } from "@testing-library/react";
import { expect } from "chai";
import { renderWithProvider } from "../../Utility/TestRenderers";
import { createSandbox, SinonSandbox } from "sinon";
import PosterBoard from "./PosterBoard";

describe("React Integration: PosterBoard", () => {
  describe("Initial State", () => {
    let sandbox: SinonSandbox;
    beforeEach(function () {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = () => {};
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<PosterBoard />);
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should initially say "loading..."', async function () {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
    it("should have 4 tracks after loading", async function () {
      const poster = await screen.findByTestId(`poster`);
      const tracks = poster.querySelectorAll(".taskTrack");
      expect(tracks.length).to.equal(4);
    });
  });
});
