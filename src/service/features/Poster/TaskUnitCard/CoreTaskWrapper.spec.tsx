import { expect } from "chai";
import { assertIsObject, assertIsString } from "primitive-predicates";
import { renderWithProvider } from "@testing/TestRenderers";
import CoreTaskWrapper from "./CoreTaskWrapper";

describe("React Integration: CoreTaskWrapper", function (): void {
  describe("With Label", function (): void {
    let labelText: string;
    let wrapperStyles: CSSStyleDeclaration;
    const expectedDuration = 180;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <CoreTaskWrapper
          expectedDurationWidth={expectedDuration}
          label={expectedLabel}
        />
      );
      const coreWrapper = container.querySelector(
        ".anticipatedTaskDurationLabel"
      );
      assertIsObject(coreWrapper);
      wrapperStyles = getComputedStyle(coreWrapper);
      const label = coreWrapper.textContent;
      assertIsString(label);
      labelText = label;
    });
    it("should be flex", function (): void {
      expect(wrapperStyles.display).to.equal("flex");
    });
    it("should have a flex direction of row", function (): void {
      expect(wrapperStyles.flexDirection).to.equal("row");
    });
    it("should have a flex basis equal to the expected duration", function (): void {
      expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
        expectedDuration
      );
    });
    it("should havebe able to flex shrink", function (): void {
      expect(wrapperStyles.flexShrink).to.equal("1");
    });
    it("should have expected text", function (): void {
      expect(labelText).to.equal(expectedLabel);
    });
    it("should center text", function (): void {
      expect(wrapperStyles.justifyContent).to.equal("center");
      expect(wrapperStyles.alignItems).to.equal("center");
    });
  });
  describe("Without Label", function (): void {
    let labelText: string;
    let wrapperStyles: CSSStyleDeclaration;
    const expectedDuration = 180;
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <CoreTaskWrapper expectedDurationWidth={expectedDuration} />
      );
      const coreWrapper = container.querySelector(
        ".anticipatedTaskDurationLabel"
      );
      assertIsObject(coreWrapper);
      wrapperStyles = getComputedStyle(coreWrapper);
      const label = coreWrapper.textContent;
      assertIsString(label);
      labelText = label;
    });
    it("should be flex", function (): void {
      expect(wrapperStyles.display).to.equal("flex");
    });
    it("should have a flex direction of row", function (): void {
      expect(wrapperStyles.flexDirection).to.equal("row");
    });
    it("should have a flex basis equal to the expected duration", function (): void {
      expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
        expectedDuration
      );
    });
    it("should havebe able to flex shrink", function (): void {
      expect(wrapperStyles.flexShrink).to.equal("1");
    });
    it("should have expected text", function (): void {
      expect(labelText).to.equal("");
    });
    it("should center text", function (): void {
      expect(wrapperStyles.justifyContent).to.equal("center");
      expect(wrapperStyles.alignItems).to.equal("center");
    });
  });
});
