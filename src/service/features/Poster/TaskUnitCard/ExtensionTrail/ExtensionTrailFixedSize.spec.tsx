import { theme } from "@service/app/theme";
import { renderWithProvider } from "@testing/TestRenderers";
import { expect } from "chai";
import chroma from "chroma-js";
import { assertIsObject } from "primitive-predicates";
import ExtensionTrailFixedSize from "./ExtensionTrailFixedSize";

describe("React Integration: Extension Trail Fixed Size", function (): void {
  let styles: CSSStyleDeclaration;
  let classNames: string[];
  const expectedWidth = 180;
  before(function (): void {
    const {
      renderResult: { container },
    } = renderWithProvider(<ExtensionTrailFixedSize width={expectedWidth} />);
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
  it("should have expected width", function (): void {
    expect(Number(styles.width.slice(0, -2))).to.equal(expectedWidth);
  });
  it("should not be able to flex grow", function (): void {
    expect(styles.flexGrow).to.equal("0");
  });
  it("should not be able to flex shrink", function (): void {
    expect(styles.flexGrow).to.equal("0");
  });
  it("should have fixed size class name and not the other variant name", function (): void {
    expect(classNames)
      .to.contain("extensionTrailFixedSize")
      .and.not.to.contain("extensionTrailGrow");
  });
});
