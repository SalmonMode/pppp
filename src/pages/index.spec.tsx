import { screen } from "@testing-library/react";
import * as chai from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import { createSandbox, SinonSandbox } from "sinon";
import IndexPage from ".";
import { renderWithProvider } from "../Utility/TestRenderers";

chai.use(chaiAsPromised);

var expect = chai.expect;
describe("React Integration: Index Page", function () {
  describe("Success", function () {
    let sandbox: SinonSandbox;
    beforeEach(function () {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = () => {};
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<IndexPage />);
    });
    afterEach(function () {
      sandbox.restore();
    });
    it('should initially say "loading..."', async function () {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
});
