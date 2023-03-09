import { expect } from "chai";
import chroma from "chroma-js";
import { assertIsObject } from "primitive-predicates";
import { theme } from "@service/app/theme";
import { renderWithProvider } from "@testing/TestRenderers";
import ExtensionTrail from "./ExtensionTrail";

describe("React Integration: Extension Trail", function (): void {
  let styles: CSSStyleDeclaration;
  let classNames: string[];
  before(function (): void {
    const {
      renderResult: { container },
    } = renderWithProvider(<ExtensionTrail />);
    const box = container.querySelector(".extensionTrail");
    assertIsObject(box);
    styles = getComputedStyle(box);
    classNames = box.className.split(" ");
  });
  it("should have pink background", function (): void {
    expect(chroma(styles.backgroundColor).hex()).to.equal(
      chroma(theme.extensionColor).hex()
    );
  });
  it("should have flex basis of 0", function (): void {
    expect(Number(styles.flexBasis.slice(0, -2))).to.equal(0);
  });
  it("should be able to flex grow", function (): void {
    expect(styles.flexGrow).to.equal("1");
  });
  it("should have growing class name and not the other variant name", function (): void {
    expect(classNames)
      .to.contain("extensionTrailGrow")
      .and.not.to.contain("extensionTrailFixedSize");
  });
});
