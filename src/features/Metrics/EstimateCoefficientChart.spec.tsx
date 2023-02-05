import { screen } from "@testing-library/react";
import { expect } from "chai";
import { renderWithProvider } from "../../Utility/TestRenderers";
import EstimateCoefficientChart from "./EstimateCoefficientChart";

describe("React Integration: EstimateCoefficientChart", () => {
  beforeEach(function () {
    renderWithProvider(<EstimateCoefficientChart coefficient={0.5} />);
  });
  it("should put arrow where coefficient is on the char", async function () {
    const arrow = await screen.findByTestId(`coefficient-arrow`);
    const styles = getComputedStyle(arrow);
    expect(Number(styles.left.slice(0, -2))).to.equal(400 * 0.75);
  });
});
