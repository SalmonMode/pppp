import { render, screen } from "@testing-library/react";
import { use, expect } from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import type { Router } from "next/router";
import { createSandbox, SinonSandbox } from "sinon";
import LandingPage from "../features/Landing";
import App from "./App";

use(chaiAsPromised);

describe("React Integration: App landing", function () {
  describe("Success", function () {
    let sandbox: SinonSandbox;
    beforeEach(function () {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      Element.prototype.scrollIntoView = sandbox.stub(
        Element.prototype,
        "scrollIntoView"
      );
      render(
        App({
          Component: LandingPage,
          router: {} as Router,
          pageProps: {},
        })
      );
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
