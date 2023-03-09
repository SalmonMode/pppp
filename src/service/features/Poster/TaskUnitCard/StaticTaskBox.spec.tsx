import { theme } from "@service/app/theme";
import { renderWithProvider } from "@testing/TestRenderers";
import { IterationRelativePosition, ReviewType } from "@typing/TaskUnit";
import { expect } from "chai";
import { assertIsObject, assertIsString } from "primitive-predicates";
import StaticTaskBox from "./StaticTaskBox";

describe("React Integration: StaticTaskBox", function (): void {
  describe("Only Known Iteration With Label, No Extension, Accepted Review, And Accepted Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqIndex: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 180;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <StaticTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.OnlyKnownIteration
          }
          label={expectedLabel}
          reviewVariant={ReviewType.Accepted}
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
      const review = container.querySelector(".reviewBox.acceptedReview");
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
      it("should have a width equal to the actual duration minus both borders width", function (): void {
        expect(Number(boxStyles.width.slice(0, -2))).to.equal(
          actualDuration - theme.borderWidth * 2
        );
      });
      it(
        "should have static, accepted review, prereq included, and prereqs accepted class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "staticTaskBox",
              "prereqsBoxIncluded",
              "prereqsAccepted",
              "acceptedReview",
            ])
            .and.not.to.contain.members([
              "activeTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsPending",
              "pendingReview",
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
        "should have flex basis equal to expected duration minus prereqs and review box widths and both borders " +
          "width",
        function (): void {
          expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
            expectedDuration -
              theme.prerequisitesBoxWidth -
              theme.reviewBoxWidth -
              theme.borderWidth * 2
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
  describe("First Known Iteration With Label, No Extension, Accepted Review, And Accepted Prereqs", function (): void {
    let labelText: string;
    let boxStyles: CSSStyleDeclaration;
    let wrapperStyles: CSSStyleDeclaration;
    let prereqIndex: number;
    let wrapperIndex: number;
    let extensionIndex: number;
    let reviewIndex: number;
    let classNames: string[];

    const expectedDuration = 180;
    const actualDuration = 180;
    const expectedLabel = "Some Label";
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <StaticTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          relativeIterationPosition={
            IterationRelativePosition.FirstKnownIteration
          }
          label={expectedLabel}
          reviewVariant={ReviewType.Accepted}
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
      const review = container.querySelector(".reviewBox.acceptedReview");
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
      it("should have a width equal to the actual duration minus one border width", function (): void {
        expect(Number(boxStyles.width.slice(0, -2))).to.equal(
          actualDuration - theme.borderWidth
        );
      });
      it(
        "should have static, accepted review, prereq included, and prereq accepted class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "staticTaskBox",
              "prereqsBoxIncluded",
              "prereqsAccepted",
              "acceptedReview",
            ])
            .and.not.to.contain.members([
              "activeTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsPending",
              "pendingReview",
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
        "should have flex basis equal to expected duration minus prereqs and review box widths and one border " +
          "width",
        function (): void {
          expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
            expectedDuration -
              theme.prerequisitesBoxWidth -
              theme.reviewBoxWidth -
              theme.borderWidth
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
  describe("Last Known Iteration Without Label, An Extension, Pending Review, And Pending Prereqs", function (): void {
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
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <StaticTaskBox
          expectedDurationWidth={expectedDuration}
          actualDurationWidth={actualDuration}
          reviewVariant={ReviewType.Pending}
          prereqs={{ approved: false, id: "1234", parentUnits: [] }}
          relativeIterationPosition={
            IterationRelativePosition.LastKnownIteration
          }
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
      it("should have a width equal to the actual duration minus one border width", function (): void {
        expect(Number(boxStyles.width.slice(0, -2))).to.equal(
          actualDuration - theme.borderWidth
        );
      });
      it(
        "should have static, pending review, prereq included, and prereq pending class name and not the other " +
          "variant names",
        function (): void {
          expect(classNames)
            .to.contain.members([
              "staticTaskBox",
              "prereqsBoxIncluded",
              "prereqsPending",
              "pendingReview",
            ])
            .and.not.to.contain.members([
              "activeTaskBox",
              "prereqsBoxNotIncluded",
              "prereqsAccepted",
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
        expect(labelText).to.equal("");
      });
      it(
        "should have flex basis equal to expected duration minus prereqs and review box widths and one border " +
          "width",
        function (): void {
          expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
            expectedDuration -
              theme.prerequisitesBoxWidth -
              theme.reviewBoxWidth -
              theme.borderWidth
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
  describe(
    "Intermediate Iteration Without Label, Less Time Than Anticipated, Pending Review, And No " +
      "Prereqs",
    function (): void {
      let labelText: string;
      let boxStyles: CSSStyleDeclaration;
      let wrapperStyles: CSSStyleDeclaration;
      let prereqBoxCount: number;
      let wrapperIndex: number;
      let extensionIndex: number;
      let reviewIndex: number;
      let classNames: string[];

      const expectedDuration = 180;
      const actualDuration = 100;
      before(function (): void {
        const {
          renderResult: { container },
        } = renderWithProvider(
          <StaticTaskBox
            expectedDurationWidth={expectedDuration}
            actualDurationWidth={actualDuration}
            reviewVariant={ReviewType.Pending}
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
        const wrapper = container.querySelector(
          ".anticipatedTaskDurationLabel"
        );
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
        it("should have a width equal to the actual duration minus neither borders width", function (): void {
          expect(Number(boxStyles.width.slice(0, -2))).to.equal(actualDuration);
        });
        it("should have static and prereq not included class name and not the other variant names", function (): void {
          expect(classNames)
            .to.contain.members([
              "staticTaskBox",
              "prereqsBoxNotIncluded",
              "pendingReview",
            ])
            .and.not.to.contain.members([
              "activeTaskBox",
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
        it(
          "should have flex basis equal to expected duration minus review box width and minus neither borders " +
            "width",
          function (): void {
            expect(Number(wrapperStyles.flexBasis.slice(0, -2))).to.equal(
              expectedDuration - theme.reviewBoxWidth
            );
          }
        );
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
    }
  );
});
