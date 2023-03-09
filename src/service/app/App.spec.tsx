import LandingPage from "@service/features/Landing";
import { render, screen } from "@testing-library/react";
import { expect, use } from "chai";
import { default as chaiAsPromised } from "chai-as-promised";
import type { Router } from "next/router";
import { createSandbox, type SinonSandbox } from "sinon";
import App from "./App";

use(chaiAsPromised);

describe("React Integration: App landing", function (): void {
  describe("Success", function (): void {
    let sandbox: SinonSandbox;
    beforeEach(function (): void {
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
    afterEach(function (): void {
      sandbox.restore();
    });
    it('should initially say "loading..."', async function (): Promise<void> {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });
});
