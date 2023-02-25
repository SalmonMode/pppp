import { expect } from "chai";
import { assertIsObject, assertIsString } from "primitive-predicates";
import { IterationRelativePosition } from "../../../../types";
import { theme } from "../../../app/theme";
import { renderWithProvider } from "../../../Utility/TestRenderers";
import ActiveTaskBox from "./ActiveTaskBox";

describe("React Integration: ActiveTaskBox", function (): void {
  describe("Only Known Iteration With Label, Extension, And Approved Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqIndex: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 250;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ActiveTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.OnlyKnownIteration
          }
          label={expectedLabel}
          prereqs={{ approved: true, id: "1234", parentUnits: [] }}
        />
      );
      const box = container.querySelector(".taskIteration");
      assertIsObject(box);
      classNames = box.className.split(" ");
      boxStyles = getComputedStyle(box);
      const prereq = container.querySelector(
        ".prerequisitesBox.acceptedPrerequisitesBox"
      );
      assertIsObject(prereq);
      const wrapper = container.querySelector(".anticipatedTaskDurationLabel");
      assertIsObject(wrapper);
      wrapperStyles = getComputedStyle(wrapper);
      const extension = container.querySelector(
        ".extensionTrail.extensionTrailGrow"
      );
      assertIsObject(extension);
      const review = container.querySelector(".reviewBox.pendingReview");
      assertIsObject(review);

      const label = wrapper.textContent;
      assertIsString(label);
      labelText = label;
      const boxChildren: Element[] = [];
      for (let i = 0; i < box.children.length; i++) {
        const child = box.children[i];
        assertIsObject(child);
        boxChildren.push(child);
      }
      prereqIndex = boxChildren.indexOf(prereq);
      wrapperIndex = boxChildren.indexOf(wrapper);
      extensionIndex = boxChildren.indexOf(extension);
      reviewIndex = boxChildren.indexOf(review);
    });
    describe("Outer Box", function (): void {
      it("should be flex", function (): void {
        expect(boxStyles.display).to.equal("flex");
      });
      it("should have a flex direction of row", function (): void {
        expect(boxStyles.flexDirection).to.equal("row");
      });
      it(
        "should have a width equal to the actual duration plus review box width minus both borders " +
          "width",
        function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(
            actualDuration + theme.reviewBoxWidth - theme.borderWidth * 2
          );
        }
      );
      it(
        "should have static, accepted review, prereq included, and prereq accepted class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "activeTaskBox",
              "prereqsBoxIncluded",
              "prereqsAccepted",
              "pendingReview",
            ])
            .and.not.to.contain.members([
              "staticTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsPending",
              "acceptedReview",
              "needsMinorRevisionReview",
              "needsMajorRevisionReview",
              "needsRebuildReview",
            ]);
        }
      );
    });
    describe("Prereqs Box", function (): void {
      it("should be first child of outer box", function (): void {
        expect(prereqIndex).to.equal(0);
      });
    });
    describe("Label Wrapper", function (): void {
      it("should be second child of outer box", function (): void {
        expect(wrapperIndex).to.equal(1);
      });
      it("should have expected text", function (): void {
        expect(labelText).to.equal(expectedLabel);
      });
      it("should have flex basis equal to expected duration minus prereqs and both borders width", function (): void {
        expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
          expectedDuration - theme.prerequisitesBoxWidth - theme.borderWidth * 2
        );
      });
    });
    describe("Extension Trail", function (): void {
      it("should be third child of outer box", function (): void {
        expect(extensionIndex).to.equal(2);
      });
    });
    describe("Review Box", function (): void {
      it("should be fourth child of outer box", function (): void {
        expect(reviewIndex).to.equal(3);
      });
    });
  });
  describe("Only Known Iteration With Label, Extension, And Missing Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqIndex: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 250;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ActiveTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.OnlyKnownIteration
          }
          label={expectedLabel}
          prereqs={null}
        />
      );
      const box = container.querySelector(".taskIteration");
      assertIsObject(box);
      classNames = box.className.split(" ");
      boxStyles = getComputedStyle(box);
      const prereq = container.querySelector(
        ".prerequisitesBox.missingPrerequisitesBox"
      );
      assertIsObject(prereq);
      const wrapper = container.querySelector(".anticipatedTaskDurationLabel");
      assertIsObject(wrapper);
      wrapperStyles = getComputedStyle(wrapper);
      const extension = container.querySelector(
        ".extensionTrail.extensionTrailGrow"
      );
      assertIsObject(extension);
      const review = container.querySelector(".reviewBox.pendingReview");
      assertIsObject(review);

      const label = wrapper.textContent;
      assertIsString(label);
      labelText = label;
      const boxChildren: Element[] = [];
      for (let i = 0; i < box.children.length; i++) {
        const child = box.children[i];
        assertIsObject(child);
        boxChildren.push(child);
      }
      prereqIndex = boxChildren.indexOf(prereq);
      wrapperIndex = boxChildren.indexOf(wrapper);
      extensionIndex = boxChildren.indexOf(extension);
      reviewIndex = boxChildren.indexOf(review);
    });
    describe("Outer Box", function (): void {
      it("should be flex", function (): void {
        expect(boxStyles.display).to.equal("flex");
      });
      it("should have a flex direction of row", function (): void {
        expect(boxStyles.flexDirection).to.equal("row");
      });
      it(
        "should have a width equal to the actual duration plus review box width minus both borders " +
          "width",
        function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(
            actualDuration + theme.reviewBoxWidth - theme.borderWidth * 2
          );
        }
      );
      it(
        "should have static, accepted review, prereq included, and prereq missing class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "activeTaskBox",
              "prereqsBoxIncluded",
              "prereqsAccepted",
              "pendingReview",
            ])
            .and.not.to.contain.members([
              "staticTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsPending",
              "acceptedReview",
              "needsMinorRevisionReview",
              "needsMajorRevisionReview",
              "needsRebuildReview",
            ]);
        }
      );
    });
    describe("Prereqs Box", function (): void {
      it("should be first child of outer box", function (): void {
        expect(prereqIndex).to.equal(0);
      });
    });
    describe("Label Wrapper", function (): void {
      it("should be second child of outer box", function (): void {
        expect(wrapperIndex).to.equal(1);
      });
      it("should have expected text", function (): void {
        expect(labelText).to.equal(expectedLabel);
      });
      it("should have flex basis equal to expected duration minus prereqs and both borders width", function (): void {
        expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
          expectedDuration - theme.prerequisitesBoxWidth - theme.borderWidth * 2
        );
      });
    });
    describe("Extension Trail", function (): void {
      it("should be third child of outer box", function (): void {
        expect(extensionIndex).to.equal(2);
      });
    });
    describe("Review Box", function (): void {
      it("should be fourth child of outer box", function (): void {
        expect(reviewIndex).to.equal(3);
      });
    });
  });
  describe("First Known Iteration With Label, Extension, And Pending Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqIndex: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 250;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ActiveTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.FirstKnownIteration
          }
          label={expectedLabel}
          prereqs={{ approved: false, id: "1234", parentUnits: [] }}
        />
      );
      const box = container.querySelector(".taskIteration");
      assertIsObject(box);
      classNames = box.className.split(" ");
      boxStyles = getComputedStyle(box);
      const prereq = container.querySelector(
        ".prerequisitesBox.pendingPrerequisitesBox"
      );
      assertIsObject(prereq);
      const wrapper = container.querySelector(".anticipatedTaskDurationLabel");
      assertIsObject(wrapper);
      wrapperStyles = getComputedStyle(wrapper);
      const extension = container.querySelector(
        ".extensionTrail.extensionTrailGrow"
      );
      assertIsObject(extension);
      const review = container.querySelector(".reviewBox.pendingReview");
      assertIsObject(review);

      const label = wrapper.textContent;
      assertIsString(label);
      labelText = label;
      const boxChildren: Element[] = [];
      for (let i = 0; i < box.children.length; i++) {
        const child = box.children[i];
        assertIsObject(child);
        boxChildren.push(child);
      }
      prereqIndex = boxChildren.indexOf(prereq);
      wrapperIndex = boxChildren.indexOf(wrapper);
      extensionIndex = boxChildren.indexOf(extension);
      reviewIndex = boxChildren.indexOf(review);
    });
    describe("Outer Box", function (): void {
      it("should be flex", function (): void {
        expect(boxStyles.display).to.equal("flex");
      });
      it("should have a flex direction of row", function (): void {
        expect(boxStyles.flexDirection).to.equal("row");
      });
      it(
        "should have a width equal to the actual duration plus review box width minus one border " +
          "width",
        function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(
            actualDuration + theme.reviewBoxWidth - theme.borderWidth
          );
        }
      );
      it(
        "should have static, accepted review, prereq included, and prereq accepted class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "activeTaskBox",
              "prereqsBoxIncluded",
              "prereqsAccepted",
              "pendingReview",
            ])
            .and.not.to.contain.members([
              "staticTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsPending",
              "acceptedReview",
              "needsMinorRevisionReview",
              "needsMajorRevisionReview",
              "needsRebuildReview",
            ]);
        }
      );
    });
    describe("Prereqs Box", function (): void {
      it("should be first child of outer box", function (): void {
        expect(prereqIndex).to.equal(0);
      });
    });
    describe("Label Wrapper", function (): void {
      it("should be second child of outer box", function (): void {
        expect(wrapperIndex).to.equal(1);
      });
      it("should have expected text", function (): void {
        expect(labelText).to.equal(expectedLabel);
      });
      it(
        "should have flex basis equal to expected duration minus prereqs and one border " +
          "width",
        function (): void {
          expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
            expectedDuration - theme.prerequisitesBoxWidth - theme.borderWidth
          );
        }
      );
    });
    describe("Extension Trail", function (): void {
      it("should be third child of outer box", function (): void {
        expect(extensionIndex).to.equal(2);
      });
    });
    describe("Review Box", function (): void {
      it("should be fourth child of outer box", function (): void {
        expect(reviewIndex).to.equal(3);
      });
    });
  });
  describe("Last Known Iteration Without Label, More Time Than Anticipated, And No Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqBoxCount: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 280;
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ActiveTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.LastKnownIteration
          }
        />
      );
      const box = container.querySelector(".taskIteration");
      assertIsObject(box);
      classNames = box.className.split(" ");
      boxStyles = getComputedStyle(box);
      prereqBoxCount = container.querySelectorAll(".prerequisitesBox").length;
      const wrapper = container.querySelector(".anticipatedTaskDurationLabel");
      assertIsObject(wrapper);
      wrapperStyles = getComputedStyle(wrapper);
      const extension = container.querySelector(
        ".extensionTrail.extensionTrailGrow"
      );
      assertIsObject(extension);
      const review = container.querySelector(".reviewBox.pendingReview");
      assertIsObject(review);

      const label = wrapper.textContent;
      assertIsString(label);
      labelText = label;
      const boxChildren: Element[] = [];
      for (let i = 0; i < box.children.length; i++) {
        const child = box.children[i];
        assertIsObject(child);
        boxChildren.push(child);
      }
      wrapperIndex = boxChildren.indexOf(wrapper);
      extensionIndex = boxChildren.indexOf(extension);
      reviewIndex = boxChildren.indexOf(review);
    });
    describe("Outer Box", function (): void {
      it("should be flex", function (): void {
        expect(boxStyles.display).to.equal("flex");
      });
      it("should have a flex direction of row", function (): void {
        expect(boxStyles.flexDirection).to.equal("row");
      });
      it(
        "should have a width equal to the actual duration plus review box width minus one border " +
          "width",
        function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(
            actualDuration + theme.reviewBoxWidth - theme.borderWidth
          );
        }
      );
      it("should have static and prereq not included class name and not the other variant names", function (): void {
        expect(classNames)
          .to.contain.members([
            "activeTaskBox",
            "prereqsBoxNotIncluded",
            "pendingReview",
          ])
          .and.not.to.contain.members([
            "staticTaskBox",
            "prereqsBoxIncluded",
            "prereqsAccepted",
            "prereqsPending",
            "acceptedReview",
            "needsMinorRevisionReview",
            "needsMajorRevisionReview",
            "needsRebuildReview",
          ]);
      });
    });
    describe("Prereqs Box", function (): void {
      it("should not have prereqs box", function (): void {
        expect(prereqBoxCount).to.equal(0);
      });
    });
    describe("Label Wrapper", function (): void {
      it("should be first child of outer box", function (): void {
        expect(wrapperIndex).to.equal(0);
      });
      it("should have expected text", function (): void {
        expect(labelText).to.equal("");
      });
      it("should have flex basis equal to expected duration minus one border width", function (): void {
        expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
          expectedDuration - theme.borderWidth
        );
      });
    });
    describe("Extension Trail", function (): void {
      it("should be second child of outer box", function (): void {
        expect(extensionIndex).to.equal(1);
      });
    });
    describe("Review Box", function (): void {
      it("should be third child of outer box", function (): void {
        expect(reviewIndex).to.equal(2);
      });
    });
  });
  describe("Intermediate Iteration Without Label, More Time Than Anticipated, And No Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqBoxCount: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 280;
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <ActiveTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.IntermediateIteration
          }
        />
      );
      const box = container.querySelector(".taskIteration");
      assertIsObject(box);
      classNames = box.className.split(" ");
      boxStyles = getComputedStyle(box);
      prereqBoxCount = container.querySelectorAll(".prerequisitesBox").length;
      const wrapper = container.querySelector(".anticipatedTaskDurationLabel");
      assertIsObject(wrapper);
      wrapperStyles = getComputedStyle(wrapper);
      const extension = container.querySelector(
        ".extensionTrail.extensionTrailGrow"
      );
      assertIsObject(extension);
      const review = container.querySelector(".reviewBox.pendingReview");
      assertIsObject(review);

      const label = wrapper.textContent;
      assertIsString(label);
      labelText = label;
      const boxChildren: Element[] = [];
      for (let i = 0; i < box.children.length; i++) {
        const child = box.children[i];
        assertIsObject(child);
        boxChildren.push(child);
      }
      wrapperIndex = boxChildren.indexOf(wrapper);
      extensionIndex = boxChildren.indexOf(extension);
      reviewIndex = boxChildren.indexOf(review);
    });
    describe("Outer Box", function (): void {
      it("should be flex", function (): void {
        expect(boxStyles.display).to.equal("flex");
      });
      it("should have a flex direction of row", function (): void {
        expect(boxStyles.flexDirection).to.equal("row");
      });
      it(
        "should have a width equal to the actual duration plus review box width minus neither borders " +
          "width",
        function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(
            actualDuration + theme.reviewBoxWidth
          );
        }
      );
      it("should have static and prereq not included class name and not the other variant names", function (): void {
        expect(classNames)
          .to.contain.members([
            "activeTaskBox",
            "prereqsBoxNotIncluded",
            "pendingReview",
          ])
          .and.not.to.contain.members([
            "staticTaskBox",
            "prereqsBoxIncluded",
            "prereqsAccepted",
            "prereqsPending",
            "acceptedReview",
            "needsMinorRevisionReview",
            "needsMajorRevisionReview",
            "needsRebuildReview",
          ]);
      });
    });
    describe("Prereqs Box", function (): void {
      it("should not have prereqs box", function (): void {
        expect(prereqBoxCount).to.equal(0);
      });
    });
    describe("Label Wrapper", function (): void {
      it("should be first child of outer box", function (): void {
        expect(wrapperIndex).to.equal(0);
      });
      it("should have expected text", function (): void {
        expect(labelText).to.equal("");
      });
      it("should have flex basis equal to expected duration minus neither borders width", function (): void {
        expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
          expectedDuration
        );
      });
    });
    describe("Extension Trail", function (): void {
      it("should be second child of outer box", function (): void {
        expect(extensionIndex).to.equal(1);
      });
    });
    describe("Review Box", function (): void {
      it("should be third child of outer box", function (): void {
        expect(reviewIndex).to.equal(2);
      });
    });
  });
});
