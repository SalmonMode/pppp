import { expect } from "chai";
import chroma from "chroma-js";
import { assertIsObject } from "primitive-predicates";
import { theme } from "../../../app/theme";
import { renderWithProvider } from "../../../Utility/TestRenderers";
import PrerequisitesBox from "./PrerequisitesBox";

describe("React Integration: Prerequisites Box", function (): void {
  describe("Not Started", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(<PrerequisitesBox started={false} />);
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have white background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.prereqsPendingColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(
        theme.prerequisitesBoxWidth
      );
    });
    it("should have pending class name and not the other variant name", function (): void {
      expect(classNames)
        .to.contain("pendingPrerequisitesBox")
        .and.not.contain("acceptedPrerequisitesBox");
    });
  });
  describe("Started", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(<PrerequisitesBox started={true} />);
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have green background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.prereqsAcceptedColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(
        theme.prerequisitesBoxWidth
      );
    });
    it("should have pending class name and not the other variant name", function (): void {
      expect(classNames)
        .to.contain("acceptedPrerequisitesBox")
        .and.not.to.contain("pendingPrerequisitesBox");
    });
  });
});
