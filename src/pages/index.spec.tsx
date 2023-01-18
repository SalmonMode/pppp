import { screen } from "@testing-library/react";
import * as chai from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import IndexPage from ".";
import { renderWithProvider } from "../Utility/TestRenderers";

chai.use(chaiAsPromised);

var expect = chai.expect;
describe("React Integration: Index Page", function () {
  describe("Success", function () {
    beforeEach(function () {
      renderWithProvider(<IndexPage />);
    });
    it('should initially say "loading..."', async function () {
      let poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
});
