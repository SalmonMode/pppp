import { screen } from "@testing-library/react";
import { expect } from "chai";
import { renderWithProvider } from "../../Utility/TestRenderers";
import MetricsSummary from "./MetricsSummary";

describe("React Integration: MetricsSummary", () => {
  describe("React Integration: Normal Coefficient", () => {
    beforeEach(function () {
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
    it("should have delays details", async function () {
      const delaysEl = await screen.findByTestId(`delays`);
      expect(delaysEl.textContent).to.equal(`Delays: 2 days 3 hours`);
    });
    it("should have extensions details", async function () {
      const extensionsEl = await screen.findByTestId(`extensions`);
      expect(extensionsEl.textContent).to.equal(`Extensions: 5 days 3 hours`);
    });
    it("should have process time details", async function () {
      const processTimeEl = await screen.findByTestId(`process-time`);
      expect(processTimeEl.textContent).to.equal(
        `Average Process Time: 1 day 2 hours`
      );
    });
    it("should have coefficient details", async function () {
      const coefficientEl = await screen.findByTestId(`est-coefficient-label`);
      expect(coefficientEl.textContent).to.equal(
        `Estimates Coefficient: ~${0.33444}`
      );
    });
    it("should have coefficient chart", async function () {
      await screen.findByTestId(`coefficient-chart`);
    });
  });
  describe("React Integration: NaN Coefficient", () => {
    // This can happen if all the estimated times for each task is the same number. This happens because the formula to
    // determine the coefficient must find the covariance of each set of numbers (apparent vs anticipated). If it's all
    // the same number, then there is no variance, i.e. 0. And dividing by zero is impossible.
    beforeEach(function () {
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
    it("should have delays details", async function () {
      const delaysEl = await screen.findByTestId(`delays`);
      expect(delaysEl.textContent).to.equal(`Delays: 2 days 3 hours`);
    });
    it("should have extensions details", async function () {
      const extensionsEl = await screen.findByTestId(`extensions`);
      expect(extensionsEl.textContent).to.equal(`Extensions: 5 days 3 hours`);
    });
    it("should have process time details", async function () {
      const processTimeEl = await screen.findByTestId(`process-time`);
      expect(processTimeEl.textContent).to.equal(
        `Average Process Time: 1 day 2 hours`
      );
    });
    it("should have coefficient details", async function () {
      const coefficientEl = await screen.findByTestId(`est-coefficient-label`);
      expect(coefficientEl.textContent).to.equal(
        `Estimates Coefficient: ~0.0000`
      );
    });
    it("should have coefficient chart", async function () {
      await screen.findByTestId(`coefficient-chart`);
    });
  });
});
