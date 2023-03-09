import { screen } from "@testing-library/react";
import { renderWithProvider } from "@testing/TestRenderers";
import { expect } from "chai";
import EstimateCoefficientChart from "./EstimateCoefficientChart";

describe("React Integration: EstimateCoefficientChart", function (): void {
  beforeEach(function (): void {
    renderWithProvider(<EstimateCoefficientChart coefficient={0.5} />);
  });
  it("should put arrow where coefficient is on the char", async function (): Promise<void> {
    const arrow = await screen.findByTestId(`coefficient-arrow`);
    const styles = getComputedStyle(arrow);
    expect(Number(styles.left.slice(0, -2))).to.equal(400 * 0.75);
  });
});
