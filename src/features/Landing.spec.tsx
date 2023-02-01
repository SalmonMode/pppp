import { screen } from "@testing-library/react";
import * as chai from "chai";
import { createSandbox, SinonSandbox } from "sinon";
import { default as chaiAsPromised } from "chai-as-promised";
import { renderWithProvider } from "../Utility/TestRenderers";
import LandingPage from "./Landing";

chai.use(chaiAsPromised);

var expect = chai.expect;

describe("React Integration: Landing Page", function () {
  describe("Success", function () {
    let sandbox: SinonSandbox;
    beforeEach(function () {
      sandbox = createSandbox();
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<LandingPage />);
    });
    afterEach(function () {
      sandbox.restore();
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
