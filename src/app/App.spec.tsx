import { render, screen } from "@testing-library/react";
import * as chai from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import type { Router } from "next/router";
import LandingPage from "../features/Landing";
import App from "./App";

chai.use(chaiAsPromised);

var expect = chai.expect;

describe("React Integration: App landing", function () {
  describe("Success", function () {
    beforeEach(function () {
      Element.prototype.scrollIntoView = () => {};
      render(
        App({
          Component: LandingPage,
          router: {} as Router,
          pageProps: {},
        })
      );
    });
    it('should initially say "loading..."', async function () {
      let poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
});
