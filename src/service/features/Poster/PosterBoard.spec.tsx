import { screen } from "@testing-library/react";
import { expect } from "chai";
import { createSandbox, type SinonSandbox } from "sinon";
import { renderWithProvider } from "@testing/TestRenderers";
import PosterBoard from "./PosterBoard";

describe("React Integration: PosterBoard", function (): void {
  describe("Initial State", function (): void {
    let sandbox: SinonSandbox;
    beforeEach(function (): void {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<PosterBoard />);
    });
    afterEach(function (): void {
      sandbox.restore();
    });
    it('should initially say "loading..."', async function (): Promise<void> {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
    it("should have 4 tracks after loading", async function (): Promise<void> {
      const poster = await screen.findByTestId(`poster`);
      const tracks = poster.querySelectorAll(".taskTrack");
      expect(tracks.length).to.equal(4);
    });
  });
});
