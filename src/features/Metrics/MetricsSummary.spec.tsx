import { fireEvent, screen } from "@testing-library/react";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { assertIsObject } from "../../typePredicates";
import { renderWithProvider } from "../../Utility/TestRenderers";
import MetricsSummary from "./MetricsSummary";

use(chaiAsPromised);

describe("React Integration: MetricsSummary", () => {
  describe("Normal Coefficient", () => {
    beforeEach(function (): void {
      renderWithProvider(
        <MetricsSummary
          metrics={{
            cumulativeDelays: { days: 2, hours: 3 },
            cumulativeExtensions: { days: 5, hours: 3 },
            processTime: { days: 1, hours: 2 },
            estimatesCoefficient: 0.334437,
          }}
        />
      );
    });
    it("should have delays details", async function (): Promise<void> {
      const delaysEl = await screen.findByTestId(`delays`);
      expect(delaysEl.textContent).to.equal(`Delays: 2 days 3 hours`);
    });
    it("should have extensions details", async function (): Promise<void> {
      const extensionsEl = await screen.findByTestId(`extensions`);
      expect(extensionsEl.textContent).to.equal(`Extensions: 5 days 3 hours`);
    });
    it("should have process time details", async function (): Promise<void> {
      const processTimeEl = await screen.findByTestId(`process-time`);
      expect(processTimeEl.textContent).to.equal(
        `Average Process Time: 1 day 2 hours`
      );
    });
    it("should have coefficient details", async function (): Promise<void> {
      const coefficientEl = await screen.findByTestId(`est-coefficient-label`);
      expect(coefficientEl.textContent).to.equal(
        `Correlation of Estimated to Actual Times: ~${0.33444}`
      );
    });
    it("should have coefficient chart", async function (): Promise<void> {
      await screen.findByTestId(`coefficient-chart`);
    });
    it("should not have coefficient help modal", async function (): Promise<void> {
      expect(screen.findByTestId(`coefficient-help-modal`)).to.eventually.be
        .rejected;
    });
  });
  describe("NaN Coefficient", () => {
    // This can happen if all the estimated times for each task is the same number. This happens because the formula to
    // determine the coefficient must find the covariance of each set of numbers (apparent vs anticipated). If it's all
    // the same number, then there is no variance, i.e. 0. And dividing by zero is impossible.
    beforeEach(function (): void {
      renderWithProvider(
        <MetricsSummary
          metrics={{
            cumulativeDelays: { days: 2, hours: 3 },
            cumulativeExtensions: { days: 5, hours: 3 },
            processTime: { days: 1, hours: 2 },
            estimatesCoefficient: NaN,
          }}
        />
      );
    });
    it("should have delays details", async function (): Promise<void> {
      const delaysEl = await screen.findByTestId(`delays`);
      expect(delaysEl.textContent).to.equal(`Delays: 2 days 3 hours`);
    });
    it("should have extensions details", async function (): Promise<void> {
      const extensionsEl = await screen.findByTestId(`extensions`);
      expect(extensionsEl.textContent).to.equal(`Extensions: 5 days 3 hours`);
    });
    it("should have process time details", async function (): Promise<void> {
      const processTimeEl = await screen.findByTestId(`process-time`);
      expect(processTimeEl.textContent).to.equal(
        `Average Process Time: 1 day 2 hours`
      );
    });
    it("should have coefficient details", async function (): Promise<void> {
      const coefficientEl = await screen.findByTestId(`est-coefficient-label`);
      expect(coefficientEl.textContent).to.equal(
        `Correlation of Estimated to Actual Times: ~0.0000`
      );
    });
    it("should have coefficient chart", async function (): Promise<void> {
      await screen.findByTestId(`coefficient-chart`);
    });
  });
  describe("Coefficient Modal Button Clicked", () => {
    beforeEach(async function (): Promise<void> {
      renderWithProvider(
        <MetricsSummary
          metrics={{
            cumulativeDelays: { days: 2, hours: 3 },
            cumulativeExtensions: { days: 5, hours: 3 },
            processTime: { days: 1, hours: 2 },
            estimatesCoefficient: NaN,
          }}
        />
      );
      const button = await screen.findByRole("button");
      fireEvent.click(button);
    });
    it("should have coefficient help modal", async function (): Promise<void> {
      const modal = await screen.findByTestId(`coefficient-help-modal`);
      const title = modal.querySelector("#modal-modal-title");
      assertIsObject(title);
      expect(title.textContent).to.equal(
        "Correlation of Estimated to Actual Times"
      );
    });
  });
  describe("Coefficient Modal Dismissed", () => {
    beforeEach(async function (): Promise<void> {
      renderWithProvider(
        <MetricsSummary
          metrics={{
            cumulativeDelays: { days: 2, hours: 3 },
            cumulativeExtensions: { days: 5, hours: 3 },
            processTime: { days: 1, hours: 2 },
            estimatesCoefficient: NaN,
          }}
        />
      );
      const button = await screen.findByRole("button");
      fireEvent.click(button);
      const presentation = await screen.findByRole("presentation");
      const backdrop = await presentation.querySelector(".MuiModal-backdrop");
      assertIsObject(backdrop);
      fireEvent.click(backdrop);
    });
    it("should not have coefficient help modal", async function (): Promise<void> {
      expect(screen.findByTestId(`coefficient-help-modal`)).to.eventually.be
        .rejected;
    });
  });
});
