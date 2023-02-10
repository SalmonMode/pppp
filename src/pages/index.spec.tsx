import { screen } from "@testing-library/react";
import * as chai from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import { createSandbox, SinonSandbox } from "sinon";
import IndexPage from ".";
import { renderWithProvider } from "../Utility/TestRenderers";

chai.use(chaiAsPromised);

const expect = chai.expect;
describe("React Integration: Index Page", function (): void {
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
      renderWithProvider(<IndexPage />);
    });
    afterEach(function (): void {
      sandbox.restore();
    });
    it('should initially say "loading..."', async function (): Promise<void> {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
});
