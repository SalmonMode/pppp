import { expect } from "chai";
import chroma from "chroma-js";
import { assertIsObject } from "primitive-predicates";
import { ReviewType } from "../../../../types";
import { theme } from "../../../app/theme";
import { renderWithProvider } from "../../../Utility/TestRenderers";
import ReviewBox from "./ReviewBox";

describe("React Integration: Review Box", function (): void {
  describe("Pending", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(<ReviewBox variant={ReviewType.Pending} />);
      const box = container.querySelector(".reviewBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have white background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.reviewPendingColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(theme.reviewBoxWidth);
    });
    it("should have pending class name and none of the other variant names", function (): void {
      expect(classNames)
        .to.contain("pendingReview")
        .and.not.contain.members([
          "acceptedReview",
          "needsMinorRevisionReview",
          "needsMajorRevisionReview",
          "needsRebuildReview",
        ]);
    });
  });
  describe("Accepted", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(<ReviewBox variant={ReviewType.Accepted} />);
      const box = container.querySelector(".reviewBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have green background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.reviewAcceptedColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(theme.reviewBoxWidth);
    });
    it("should have accepted class name and none of the other variant names", function (): void {
      expect(classNames)
        .to.contain("acceptedReview")
        .and.not.contain.members([
          "pendingReview",
          "needsMinorRevisionReview",
          "needsMajorRevisionReview",
          "needsRebuildReview",
        ]);
    });
  });
  describe("Minor Revision Needed", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ReviewBox variant={ReviewType.NeedsMinorRevision} />
      );
      const box = container.querySelector(".reviewBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have yellow background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.reviewMinorColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(theme.reviewBoxWidth);
    });
    it("should have minor class name and none of the other variant names", function (): void {
      expect(classNames)
        .to.contain("needsMinorRevisionReview")
        .and.not.contain.members([
          "pendingReview",
          "acceptedReview",
          "needsMajorRevisionReview",
          "needsRebuildReview",
        ]);
    });
  });
  describe("Major Revision Needed", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ReviewBox variant={ReviewType.NeedsMajorRevision} />
      );
      const box = container.querySelector(".reviewBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have red background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.reviewMajorColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(theme.reviewBoxWidth);
    });
    it("should have major class name and none of the other variant names", function (): void {
      expect(classNames)
        .to.contain("needsMajorRevisionReview")
        .and.not.contain.members([
          "pendingReview",
          "acceptedReview",
          "needsMinorRevisionReview",
          "needsRebuildReview",
        ]);
    });
  });
  describe("Rebuild Needed", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(<ReviewBox variant={ReviewType.NeedsRebuild} />);
      const box = container.querySelector(".reviewBox");
      assertIsObject(box);
      styles = getComputedStyle(box);
      classNames = box.className.split(" ");
    });
    it("should have black background", function (): void {
      expect(chroma(styles.backgroundColor).hex()).to.equal(
        chroma(theme.reviewRebuildColor).hex()
      );
    });
    it("should have width according to theme", function (): void {
      expect(Number(styles.width.slice(0, -2))).to.equal(theme.reviewBoxWidth);
    });
    it("should have rebuild class name and none of the other variant names", function (): void {
      expect(classNames)
        .to.contain("needsRebuildReview")
        .and.not.contain.members([
          "pendingReview",
          "acceptedReview",
          "needsMinorRevisionReview",
          "needsMajorRevisionReview",
        ]);
    });
  });
});
