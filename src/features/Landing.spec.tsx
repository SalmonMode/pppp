import { screen } from "@testing-library/react";
import * as chai from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import { createSandbox, SinonSandbox } from "sinon";
import { renderWithProvider } from "../Utility/TestRenderers";
import LandingPage from "./Landing";

chai.use(chaiAsPromised);

const expect = chai.expect;

describe("React Integration: Landing Page", function (): void {
  describe("Success", function (): void {
    let sandbox: SinonSandbox;
    beforeEach(function (): void {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<LandingPage />);
    });
    afterEach(function (): void {
      sandbox.restore();
    });
    describe("Poster Board", function (): void {
      it("should have 4 tracks after loading", async function (): Promise<void> {
        const poster = await screen.findByTestId(`poster`);
        const tracks = poster.querySelectorAll(".taskTrack");
        expect(tracks.length).to.equal(4);
      });
    });
    describe("Metrics Panel", async function (): Promise<void> {
      it("should have metrics panel", async function (): Promise<void> {
        await screen.findByTestId(`metrics-panel`);
      });
    });
  });
});
