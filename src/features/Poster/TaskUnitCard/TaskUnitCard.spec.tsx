import { screen } from "@testing-library/react";
import { expect } from "chai";
import chroma from "chroma-js";
import { add, sub } from "date-fns";
import { theme } from "../../../app/theme";
import { TaskUnit, TaskUnitCluster } from "../../../Relations";
import { assertIsObject, assertIsString } from "../../../typePredicates";
import { EventType } from "../../../types";
import { renderWithProvider } from "../../../Utility/TestRenderers";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import type { TaskUnitsLoadingCompleteState } from "../taskUnitsSlice";
import { turnClusterIntoState } from "../turnClusterIntoState";
import TaskUnitCard from "./TaskUnitCard";

const now = new Date();
const firstDate = sub(now, { days: 9 });
const secondDate = add(firstDate, { days: 1 });
const thirdDate = add(secondDate, { days: 1 });
const fourthDate = add(thirdDate, { days: 1 });
const fifthDate = add(fourthDate, { days: 1 });
const sixthDate = add(fifthDate, { days: 1 });
const seventhDate = add(sixthDate, { days: 1 });
const eighthDate = add(seventhDate, { days: 1 });
const ninthDate = add(eighthDate, { days: 1 });

describe("React Integration: TaskUnitCard", function (): void {
  describe("Chaotic Tracks", function (): void {
    let initialState: TaskUnitsLoadingCompleteState;

    const unitA = new TaskUnit(now, [], firstDate, secondDate, "A", [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: thirdDate,
      },
    ]);
    const unitB = new TaskUnit(now, [unitA], secondDate, thirdDate, "B", [
      {
        type: EventType.TaskIterationStarted,
        date: thirdDate,
      },
      {
        type: EventType.ReviewedAndNeedsMinorRevision,
        date: fourthDate,
      },
      {
        type: EventType.MinorRevisionComplete,
        date: fifthDate,
      },
    ]);
    const unitC = new TaskUnit(now, [], fifthDate, sixthDate, "C", [
      {
        type: EventType.TaskIterationStarted,
        date: fifthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: add(sixthDate, { hours: 4 }),
      },
    ]);
    const unitD = new TaskUnit(now, [unitC], sixthDate, seventhDate, "D", [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
      },
      {
        type: EventType.ReviewedAndNeedsRebuild,
        date: add(seventhDate, { hours: 4 }),
      },
      {
        type: EventType.TaskIterationStarted,
        date: eighthDate,
      },
      {
        type: EventType.ReviewedAndNeedsMajorRevision,
        date: ninthDate,
      },
    ]);

    const unitE = new TaskUnit(now, [], firstDate, secondDate, "E", [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: secondDate,
      },
    ]);
    const unitF = new TaskUnit(
      now,
      [unitA, unitE],
      secondDate,
      thirdDate,
      "F",
      [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]
    );
    const unitG = new TaskUnit(now, [unitF], fourthDate, fifthDate, "G", [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ]);
    const unitH = new TaskUnit(now, [unitC, unitG], fifthDate, sixthDate, "H", [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
      },
      {
        type: EventType.ReviewedAndNeedsMajorRevision,
        date: add(seventhDate, { hours: 4 }),
      },
      {
        type: EventType.ReviewedAndNeedsRebuild,
        date: eighthDate,
      },
    ]);

    const unitI = new TaskUnit(now, [], firstDate, secondDate, "I", [
      {
        type: EventType.TaskIterationStarted,
        date: firstDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: secondDate,
      },
    ]);
    const unitJ = new TaskUnit(
      now,
      [unitA, unitI],
      secondDate,
      thirdDate,
      "J",
      [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]
    );
    const unitK = new TaskUnit(now, [unitJ], fourthDate, fifthDate, "K", [
      {
        type: EventType.TaskIterationStarted,
        date: fourthDate,
      },
      {
        type: EventType.ReviewedAndAccepted,
        date: fifthDate,
      },
    ]);
    const unitL = new TaskUnit(now, [unitC, unitK], fifthDate, sixthDate, "L", [
      {
        type: EventType.TaskIterationStarted,
        date: add(sixthDate, { hours: 4 }),
      },
    ]);

    before(function (): void {
      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      initialState = turnClusterIntoState(cluster);
    });
    describe("Cards", function (): void {
      /**
       * Units with a simple history. These only have 2 events: TaskIterationStarted, and ReviewedAndAccepted. As such,
       * their test structures are identical.
       */
      const standardUnits = [
        unitA,
        unitC,
        unitE,
        unitF,
        unitG,
        unitI,
        unitJ,
        unitK,
      ];
      for (const relevantUnit of standardUnits) {
        describe(relevantUnit.name, function (): void {
          let boxComputedStyles: CSSStyleDeclaration;
          let cardComputedStyles: CSSStyleDeclaration;
          let labelText: string;
          let firstPrereqBoxComputedStyles: CSSStyleDeclaration;
          let firstTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
          let firstTaskBoxComputedStyles: CSSStyleDeclaration;
          let firstExtensionTrailComputedStyles: CSSStyleDeclaration;
          let firstReviewBoxComputedStyles: CSSStyleDeclaration;
          let firstPrereqBoxIndex: number;
          let firstTaskBoxWrapperIndex: number;
          let firstTaskBoxIndex: number;
          let firstExtensionalTrailIndex: number;
          let firstReviewBoxIndex: number;
          before(async function (): Promise<void> {
            const unitDetails = initialState.units[relevantUnit.id];
            assertIsObject(unitDetails);
            renderWithProvider(
              <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
            );
            const box = await screen.findByTestId(`task-${relevantUnit.id}`);
            boxComputedStyles = getComputedStyle(box);
            const possibleCard = box.querySelector(".taskUnit");
            assertIsObject(possibleCard);
            const card = possibleCard;
            cardComputedStyles = getComputedStyle(card);
            const prereqBox = card.querySelector(".prerequisiteBox");
            assertIsObject(prereqBox);
            firstPrereqBoxComputedStyles = getComputedStyle(prereqBox);
            const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
            assertIsObject(taskBoxWrapper);
            firstTaskBoxWrapperComputedStyles =
              getComputedStyle(taskBoxWrapper);
            const taskBox = taskBoxWrapper.querySelector(".taskBox");
            assertIsObject(taskBox);
            firstTaskBoxComputedStyles = getComputedStyle(taskBox);
            const label = taskBox.textContent;
            assertIsString(label);
            labelText = label;
            const trail = taskBoxWrapper.querySelector(".extensionTrail");
            assertIsObject(trail);
            firstExtensionTrailComputedStyles = getComputedStyle(trail);
            const reviewBox = card.querySelector(".reviewBox");
            assertIsObject(reviewBox);
            firstReviewBoxComputedStyles = getComputedStyle(reviewBox);
            const flexParent = card.querySelector(".cardContentDiv");
            assertIsObject(flexParent);
            const parentChildren: Element[] = [];
            for (let i = 0; i < flexParent.children.length; i++) {
              const child = flexParent.children[i];
              assertIsObject(child);
              parentChildren.push(child);
            }
            const wrapperChildren: Element[] = [];
            for (let i = 0; i < taskBoxWrapper.children.length; i++) {
              const child = taskBoxWrapper.children[i];
              assertIsObject(child);
              wrapperChildren.push(child);
            }
            firstPrereqBoxIndex = parentChildren.indexOf(prereqBox);
            firstTaskBoxWrapperIndex = parentChildren.indexOf(taskBoxWrapper);
            firstReviewBoxIndex = parentChildren.indexOf(reviewBox);
            firstTaskBoxIndex = wrapperChildren.indexOf(taskBox);
            firstExtensionalTrailIndex = wrapperChildren.indexOf(trail);
          });
          it("should have box with a width according to actual duration and anticipated start", function (): void {
            expect(Number(boxComputedStyles.width.slice(0, -2))).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.apparentEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              )
            );
          });
          it("should have card with a width according to actual duration", function (): void {
            expect(Number(cardComputedStyles.width.slice(0, -2))).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.apparentEndDate.getTime(),
                relevantUnit.apparentStartDate.getTime()
              )
            );
          });
          describe("First Item", function (): void {
            it("should have green prerequisites box", function (): void {
              expect(
                chroma(firstPrereqBoxComputedStyles.backgroundColor).hex()
              ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
            });
            it("should have prerequisites box in the beginning", function (): void {
              expect(firstPrereqBoxIndex).to.equal(0);
            });
          });
          describe("Second Item", function (): void {
            it("should have labeled task box", function (): void {
              expect(labelText).to.equal(relevantUnit.name);
            });
            it("should have task box with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
              expect(
                Number(firstTaskBoxComputedStyles.flexBasis.slice(0, -2))
              ).to.equal(
                getPixelGapBetweenTimes(
                  relevantUnit.anticipatedEndDate.getTime(),
                  relevantUnit.anticipatedStartDate.getTime()
                ) -
                  theme.reviewBoxWidth -
                  theme.prerequisitesBoxWidth
              );
            });
            it("should have extension trail with pink background color in task box wrapper", function (): void {
              expect(
                chroma(firstExtensionTrailComputedStyles.backgroundColor).hex()
              ).to.equal(chroma(theme.extensionColor).hex());
            });
            it("should have extension trail lined up to grow in space left behind in task box wrapper", function (): void {
              expect(firstExtensionTrailComputedStyles.flexGrow).to.equal("1");
            });
            it("should have task box as first child in task box wrapper", function (): void {
              expect(firstTaskBoxIndex).to.equal(0);
            });
            it("should have extension trail as last child in task box wrapper", function (): void {
              expect(firstExtensionalTrailIndex).to.equal(1);
            });
            it("should have task box wrapper with a flex basis according to actual duration, and review and prereq box widths", function (): void {
              const precedingEvent = relevantUnit.eventHistory[0];
              const reviewEvent = relevantUnit.eventHistory[1];
              assertIsObject(precedingEvent);
              assertIsObject(reviewEvent);
              expect(
                Number(firstTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
              ).to.equal(
                getPixelGapBetweenTimes(
                  reviewEvent.date.getTime(),
                  precedingEvent.date.getTime()
                ) -
                  theme.reviewBoxWidth -
                  theme.prerequisitesBoxWidth
              );
            });
            it("should have task box wrapper as the second item", function (): void {
              expect(firstTaskBoxWrapperIndex).to.equal(1);
            });
            it("should have task box wrapper that is willing to shrink", function (): void {
              expect(
                Number(firstTaskBoxWrapperComputedStyles.flexShrink)
              ).to.equal(1);
            });
          });
          describe("Third Item", function (): void {
            it("should have green review box", function (): void {
              expect(
                chroma(firstReviewBoxComputedStyles.backgroundColor).hex()
              ).to.equal(chroma(theme.reviewAcceptedColor).hex());
            });
            it("should have review box at the end", function (): void {
              expect(firstReviewBoxIndex).to.equal(2);
            });
          });
        });
      }
      describe("B", function (): void {
        let relevantUnit: TaskUnit;
        let boxComputedStyles: CSSStyleDeclaration;
        let cardComputedStyles: CSSStyleDeclaration;
        let firstLabelText: string;
        let secondLabelText: string;
        let firstPrereqBoxComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxComputedStyles: CSSStyleDeclaration;
        let firstExtensionTrailComputedStyles: CSSStyleDeclaration;
        let secondExtensionTrailComputedStyles: CSSStyleDeclaration;
        let firstReviewBoxComputedStyles: CSSStyleDeclaration;
        let secondReviewBoxComputedStyles: CSSStyleDeclaration;
        let firstPrereqBoxIndex: number;
        let firstTaskBoxWrapperIndex: number;
        let secondTaskBoxWrapperIndex: number;
        let firstTaskBoxIndex: number;
        let secondTaskBoxIndex: number;
        let firstExtensionalTrailIndex: number;
        let secondExtensionalTrailIndex: number;
        let firstReviewBoxIndex: number;
        let secondReviewBoxIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitB;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const box = await screen.findByTestId(`task-${relevantUnit.id}`);
          boxComputedStyles = getComputedStyle(box);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          const card = possibleCard;
          cardComputedStyles = getComputedStyle(card);
          const firstPrereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(firstPrereqBox);
          firstPrereqBoxComputedStyles = getComputedStyle(firstPrereqBox);
          const firstTaskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(firstTaskBoxWrapper);
          firstTaskBoxWrapperComputedStyles =
            getComputedStyle(firstTaskBoxWrapper);
          const firstTaskBox = firstTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(firstTaskBox);
          firstTaskBoxComputedStyles = getComputedStyle(firstTaskBox);
          const label = firstTaskBox.textContent;
          assertIsString(label);
          firstLabelText = label;
          const firstTrail =
            firstTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(firstTrail);
          firstExtensionTrailComputedStyles = getComputedStyle(firstTrail);
          const firstReviewBox = card.querySelector(".reviewBox");
          assertIsObject(firstReviewBox);
          firstReviewBoxComputedStyles = getComputedStyle(firstReviewBox);
          const secondTaskBoxWrapper =
            card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(secondTaskBoxWrapper);
          secondTaskBoxWrapperComputedStyles =
            getComputedStyle(secondTaskBoxWrapper);
          const secondTaskBox = secondTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(secondTaskBox);
          secondTaskBoxComputedStyles = getComputedStyle(secondTaskBox);
          const secondLabel = secondTaskBox.textContent;
          assertIsString(secondLabel);
          secondLabelText = secondLabel;
          const secondTrail =
            secondTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(secondTrail);
          secondExtensionTrailComputedStyles = getComputedStyle(secondTrail);
          const secondReviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(secondReviewBox);
          secondReviewBoxComputedStyles = getComputedStyle(secondReviewBox);
          const flexParent = card.querySelector(".cardContentDiv");
          assertIsObject(flexParent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < flexParent.children.length; i++) {
            const child = flexParent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          const firstWrapperChildren: Element[] = [];
          for (let i = 0; i < firstTaskBoxWrapper.children.length; i++) {
            const child = firstTaskBoxWrapper.children[i];
            assertIsObject(child);
            firstWrapperChildren.push(child);
          }
          const secondWrapperChildren: Element[] = [];
          for (let i = 0; i < secondTaskBoxWrapper.children.length; i++) {
            const child = secondTaskBoxWrapper.children[i];
            assertIsObject(child);
            secondWrapperChildren.push(child);
          }
          firstPrereqBoxIndex = parentChildren.indexOf(firstPrereqBox);
          firstTaskBoxWrapperIndex =
            parentChildren.indexOf(firstTaskBoxWrapper);
          firstReviewBoxIndex = parentChildren.indexOf(firstReviewBox);
          firstTaskBoxIndex = firstWrapperChildren.indexOf(firstTaskBox);
          firstExtensionalTrailIndex = firstWrapperChildren.indexOf(firstTrail);
          secondTaskBoxWrapperIndex =
            parentChildren.indexOf(secondTaskBoxWrapper);
          secondTaskBoxIndex = secondWrapperChildren.indexOf(secondTaskBox);
          secondExtensionalTrailIndex =
            secondWrapperChildren.indexOf(secondTrail);
          secondReviewBoxIndex = parentChildren.indexOf(secondReviewBox);
        });
        it("should have box with a width according to actual duration, and anticipated start", function (): void {
          expect(Number(boxComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card with a width according to actual duration", function (): void {
          expect(Number(cardComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.apparentStartDate.getTime()
            )
          );
        });
        describe("First Item", function (): void {
          it("should have green prerequisites box", function (): void {
            expect(
              chroma(firstPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
          });
          it("should have prerequisites box in the beginning", function (): void {
            expect(firstPrereqBoxIndex).to.equal(0);
          });
        });
        describe("Second Item", function (): void {
          it("should have labeled task box", function (): void {
            expect(firstLabelText).to.equal(relevantUnit.name);
          });
          it("should have task box with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in task box wrapper", function (): void {
            expect(
              chroma(firstExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in task box wrapper", function (): void {
            expect(firstExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in task box wrapper", function (): void {
            expect(firstTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in task box wrapper", function (): void {
            expect(firstExtensionalTrailIndex).to.equal(1);
          });
          it("should have task box wrapper with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have task box wrapper as the second item", function (): void {
            expect(firstTaskBoxWrapperIndex).to.equal(1);
          });
          it("should have task box wrapper that is willing to shrink", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexShrink)
            ).to.equal(1);
          });
        });
        describe("Third Item", function (): void {
          it("should have yellow review box", function (): void {
            expect(
              chroma(firstReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewMinorColor).hex());
          });
          it("should have review box as third item", function (): void {
            expect(firstReviewBoxIndex).to.equal(2);
          });
        });
        describe("Fourth Item", function (): void {
          it("should have second task box wrapper as the last item", function (): void {
            expect(secondTaskBoxWrapperIndex).to.equal(3);
          });
          it("should have second task box wrapper with a flex basis according to anticipated duration and review box width", function (): void {
            expect(
              Number(secondTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) - theme.reviewBoxWidth
            );
          });
          it("should have non labeled task box in second task box wrapper", function (): void {
            expect(secondLabelText).to.equal("");
          });
          it("should have task box with a flex basis according to anticipated duration and review box width in second task box wrapper", function (): void {
            expect(
              Number(secondTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) - theme.reviewBoxWidth
            );
          });
          it("should have extension trail with pink background color in second task box wrapper", function (): void {
            expect(
              chroma(secondExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in second task box wrapper", function (): void {
            expect(secondExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in second task box wrapper", function (): void {
            expect(secondTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in second task box wrapper", function (): void {
            expect(secondExtensionalTrailIndex).to.equal(1);
          });
        });
        describe("Fifth Item", function (): void {
          it("should have green review box", function (): void {
            expect(
              chroma(secondReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewAcceptedColor).hex());
          });
          it("should have review box as fifth item", function (): void {
            expect(secondReviewBoxIndex).to.equal(4);
          });
        });
      });
      describe("D", function (): void {
        let relevantUnit: TaskUnit;
        let boxComputedStyles: CSSStyleDeclaration;
        let cardComputedStyles: CSSStyleDeclaration;
        let firstLabelText: string;
        let secondLabelText: string;
        let thirdLabelText: string;
        let firstPrereqBoxComputedStyles: CSSStyleDeclaration;
        let secondPrereqBoxComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let thirdTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxComputedStyles: CSSStyleDeclaration;
        let thirdTaskBoxComputedStyles: CSSStyleDeclaration;
        let firstExtensionTrailComputedStyles: CSSStyleDeclaration;
        let secondExtensionTrailComputedStyles: CSSStyleDeclaration;
        let thirdExtensionTrailComputedStyles: CSSStyleDeclaration;
        let fourthExtensionTrailComputedStyles: CSSStyleDeclaration;
        let firstReviewBoxComputedStyles: CSSStyleDeclaration;
        let secondReviewBoxComputedStyles: CSSStyleDeclaration;
        let thirdReviewBoxComputedStyles: CSSStyleDeclaration;
        let firstPrereqBoxIndex: number;
        let secondPrereqBoxIndex: number;
        let firstTaskBoxWrapperIndex: number;
        let secondTaskBoxWrapperIndex: number;
        let thirdTaskBoxWrapperIndex: number;
        let firstTaskBoxIndex: number;
        let secondTaskBoxIndex: number;
        let thirdTaskBoxIndex: number;
        let firstExtensionalTrailIndex: number;
        let secondExtensionalTrailIndex: number;
        let thirdExtensionalTrailIndex: number;
        let fourthExtensionalTrailIndex: number;
        let firstReviewBoxIndex: number;
        let secondReviewBoxIndex: number;
        let thirdReviewBoxIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitD;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const box = await screen.findByTestId(`task-${relevantUnit.id}`);
          boxComputedStyles = getComputedStyle(box);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          const card = possibleCard;
          cardComputedStyles = getComputedStyle(card);
          // first item
          const firstPrereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(firstPrereqBox);
          firstPrereqBoxComputedStyles = getComputedStyle(firstPrereqBox);
          // second item
          const firstTaskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(firstTaskBoxWrapper);
          firstTaskBoxWrapperComputedStyles =
            getComputedStyle(firstTaskBoxWrapper);
          const firstTaskBox = firstTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(firstTaskBox);
          firstTaskBoxComputedStyles = getComputedStyle(firstTaskBox);
          const label = firstTaskBox.textContent;
          assertIsString(label);
          firstLabelText = label;
          const firstTrail =
            firstTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(firstTrail);
          firstExtensionTrailComputedStyles = getComputedStyle(firstTrail);
          // third item
          const firstReviewBox = card.querySelector(".reviewBox");
          assertIsObject(firstReviewBox);
          firstReviewBoxComputedStyles = getComputedStyle(firstReviewBox);
          // fourth item
          const secondTrail = card.querySelectorAll(
            ".cardContentDiv > .extensionTrail"
          )[0];
          assertIsObject(secondTrail);
          secondExtensionTrailComputedStyles = getComputedStyle(secondTrail);
          // fifth item
          const secondPrereqBox = card.querySelectorAll(
            ".cardContentDiv > .prerequisiteBox"
          )[1];
          assertIsObject(secondPrereqBox);
          secondPrereqBoxComputedStyles = getComputedStyle(secondPrereqBox);
          // sixth item
          const secondTaskBoxWrapper =
            card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(secondTaskBoxWrapper);
          secondTaskBoxWrapperComputedStyles =
            getComputedStyle(secondTaskBoxWrapper);
          const secondTaskBox = secondTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(secondTaskBox);
          secondTaskBoxComputedStyles = getComputedStyle(secondTaskBox);
          const secondLabel = secondTaskBox.textContent;
          assertIsString(secondLabel);
          secondLabelText = secondLabel;
          const thirdTrail =
            secondTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(thirdTrail);
          thirdExtensionTrailComputedStyles = getComputedStyle(thirdTrail);
          // seventh item
          const secondReviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(secondReviewBox);
          secondReviewBoxComputedStyles = getComputedStyle(secondReviewBox);
          // eighth item
          const thirdTaskBoxWrapper =
            card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(thirdTaskBoxWrapper);
          thirdTaskBoxWrapperComputedStyles =
            getComputedStyle(thirdTaskBoxWrapper);
          const thirdTaskBox = thirdTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(thirdTaskBox);
          thirdTaskBoxComputedStyles = getComputedStyle(thirdTaskBox);
          const thirdLabel = thirdTaskBox.textContent;
          assertIsString(thirdLabel);
          thirdLabelText = thirdLabel;
          const fourthTrail =
            thirdTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(fourthTrail);
          fourthExtensionTrailComputedStyles = getComputedStyle(fourthTrail);
          // ninth item
          const thirdReviewBox = card.querySelectorAll(".reviewBox")[2];
          assertIsObject(thirdReviewBox);
          thirdReviewBoxComputedStyles = getComputedStyle(thirdReviewBox);
          const flexParent = card.querySelector(".cardContentDiv");
          assertIsObject(flexParent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < flexParent.children.length; i++) {
            const child = flexParent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          const firstWrapperChildren: Element[] = [];
          for (let i = 0; i < firstTaskBoxWrapper.children.length; i++) {
            const child = firstTaskBoxWrapper.children[i];
            assertIsObject(child);
            firstWrapperChildren.push(child);
          }
          const secondWrapperChildren: Element[] = [];
          for (let i = 0; i < secondTaskBoxWrapper.children.length; i++) {
            const child = secondTaskBoxWrapper.children[i];
            assertIsObject(child);
            secondWrapperChildren.push(child);
          }
          const thirdWrapperChildren: Element[] = [];
          for (let i = 0; i < thirdTaskBoxWrapper.children.length; i++) {
            const child = thirdTaskBoxWrapper.children[i];
            assertIsObject(child);
            thirdWrapperChildren.push(child);
          }
          firstPrereqBoxIndex = parentChildren.indexOf(firstPrereqBox);
          firstTaskBoxWrapperIndex =
            parentChildren.indexOf(firstTaskBoxWrapper);
          firstTaskBoxIndex = firstWrapperChildren.indexOf(firstTaskBox);
          firstExtensionalTrailIndex = firstWrapperChildren.indexOf(firstTrail);
          firstReviewBoxIndex = parentChildren.indexOf(firstReviewBox);
          secondExtensionalTrailIndex = parentChildren.indexOf(secondTrail);
          secondPrereqBoxIndex = parentChildren.indexOf(secondPrereqBox);
          secondTaskBoxWrapperIndex =
            parentChildren.indexOf(secondTaskBoxWrapper);
          secondTaskBoxIndex = secondWrapperChildren.indexOf(secondTaskBox);
          thirdExtensionalTrailIndex =
            secondWrapperChildren.indexOf(thirdTrail);
          secondReviewBoxIndex = parentChildren.indexOf(secondReviewBox);
          thirdTaskBoxWrapperIndex =
            parentChildren.indexOf(thirdTaskBoxWrapper);
          thirdTaskBoxIndex = thirdWrapperChildren.indexOf(thirdTaskBox);
          fourthExtensionalTrailIndex =
            thirdWrapperChildren.indexOf(fourthTrail);
          thirdReviewBoxIndex = parentChildren.indexOf(thirdReviewBox);
        });
        it("should have box with a width according to actual duration and anticipated start", function (): void {
          expect(Number(boxComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card with a width according to actual duration", function (): void {
          expect(Number(cardComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.apparentStartDate.getTime()
            )
          );
        });
        describe("First Item", function (): void {
          it("should have green prerequisites box", function (): void {
            expect(
              chroma(firstPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
          });
          it("should have prerequisites box in the beginning", function (): void {
            expect(firstPrereqBoxIndex).to.equal(0);
          });
        });
        describe("Second Item", function (): void {
          it("should have labeled task box", function (): void {
            expect(firstLabelText).to.equal(relevantUnit.name);
          });
          it("should have task box with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in task box wrapper", function (): void {
            expect(
              chroma(firstExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in task box wrapper", function (): void {
            expect(firstExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in task box wrapper", function (): void {
            expect(firstTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in task box wrapper", function (): void {
            expect(firstExtensionalTrailIndex).to.equal(1);
          });
          it("should have task box wrapper with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have task box wrapper as the second item", function (): void {
            expect(firstTaskBoxWrapperIndex).to.equal(1);
          });
          it("should have task box wrapper that is willing to shrink", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexShrink)
            ).to.equal(1);
          });
        });
        describe("Third Item", function (): void {
          it("should have black review box", function (): void {
            expect(
              chroma(firstReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewRebuildColor).hex());
          });
          it("should have review box as third item", function (): void {
            expect(firstReviewBoxIndex).to.equal(2);
          });
        });
        describe("Fourth Item", function (): void {
          it("should have extension trail as fourth item", function (): void {
            expect(secondExtensionalTrailIndex).to.equal(3);
          });
          it("should have extension trail with pink background", function (): void {
            expect(
              chroma(secondExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have second extension trail with a width according to time between review and task started", function (): void {
            const reviewEvent = relevantUnit.eventHistory[1];
            const startedEvent = relevantUnit.eventHistory[2];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(secondExtensionTrailComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              )
            );
            expect(
              Number(secondExtensionTrailComputedStyles.flexGrow)
            ).to.equal(0);
            expect(
              Number(secondExtensionTrailComputedStyles.flexShrink)
            ).to.equal(0);
          });
        });
        describe("Fifth Item", function (): void {
          it("should have green prerequisites box", function (): void {
            expect(
              chroma(secondPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
          });
          it("should have second prereq box as fifth item", function (): void {
            expect(secondPrereqBoxIndex).to.equal(4);
          });
        });
        describe("Sixth Item", function (): void {
          it("should have second task box wrapper as sixth item", function (): void {
            expect(secondTaskBoxWrapperIndex).to.equal(5);
          });
          it("should have second task box wrapper with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(secondTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have non labeled task box in second task box wrapper", function (): void {
            expect(secondLabelText).to.equal("");
          });
          it("should have task box with a flex basis according to anticipated duration in second task box wrapper, and review and prereq box widths", function (): void {
            expect(
              Number(secondTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in second task box wrapper", function (): void {
            expect(
              chroma(thirdExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in second task box wrapper", function (): void {
            expect(thirdExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in second task box wrapper", function (): void {
            expect(secondTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in second task box wrapper", function (): void {
            expect(thirdExtensionalTrailIndex).to.equal(1);
          });
        });
        describe("Seventh Item", function (): void {
          it("should have red review box", function (): void {
            expect(
              chroma(secondReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewMajorColor).hex());
          });
          it("should have second review box as seventh item", function (): void {
            expect(secondReviewBoxIndex).to.equal(6);
          });
        });
        describe("Eighth Item", function (): void {
          it("should have third task box wrapper as eighth item", function (): void {
            expect(thirdTaskBoxWrapperIndex).to.equal(7);
          });
          it("should have third task box wrapper with a flex basis according to start time, and current time", function (): void {
            // doesn't need to compensate for prereq box
            const reviewEvent = relevantUnit.eventHistory[3];
            assertIsObject(reviewEvent);
            expect(
              Number(thirdTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(now.getTime(), reviewEvent.date.getTime())
            );
          });
          it("should have non labeled task box in third task box wrapper", function (): void {
            expect(thirdLabelText).to.equal("");
          });
          it("should have task box with a flex basis according to actual duration and review box width in third task box wrapper", function (): void {
            // doesn't need to compensate for prereq box
            const precedingEvent = relevantUnit.eventHistory[2];
            const reviewEvent = relevantUnit.eventHistory[3];
            assertIsObject(precedingEvent);
            assertIsObject(reviewEvent);
            expect(
              Number(thirdTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                reviewEvent.date.getTime(),
                precedingEvent.date.getTime()
              ) - theme.reviewBoxWidth
            );
          });
          it("should have extension trail with pink background color in third task box wrapper", function (): void {
            expect(
              chroma(fourthExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in third task box wrapper", function (): void {
            expect(fourthExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in third task box wrapper", function (): void {
            expect(thirdTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in third task box wrapper", function (): void {
            expect(fourthExtensionalTrailIndex).to.equal(1);
          });
        });
        describe("Ninth Item", function (): void {
          it("should have white review box", function (): void {
            expect(
              chroma(thirdReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewPendingColor).hex());
          });
          it("should have third review box at the end", function (): void {
            expect(thirdReviewBoxIndex).to.equal(8);
          });
        });
      });
      describe("H", function (): void {
        let relevantUnit: TaskUnit;
        let boxComputedStyles: CSSStyleDeclaration;
        let cardComputedStyles: CSSStyleDeclaration;
        let firstLabelText: string;
        let secondLabelText: string;
        let thirdLabelText: string;
        let firstPrereqBoxComputedStyles: CSSStyleDeclaration;
        let secondPrereqBoxComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let thirdTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxComputedStyles: CSSStyleDeclaration;
        let secondTaskBoxComputedStyles: CSSStyleDeclaration;
        let thirdTaskBoxComputedStyles: CSSStyleDeclaration;
        let firstExtensionTrailComputedStyles: CSSStyleDeclaration;
        let secondExtensionTrailComputedStyles: CSSStyleDeclaration;
        let thirdExtensionTrailComputedStyles: CSSStyleDeclaration;
        let fourthExtensionTrailComputedStyles: CSSStyleDeclaration;
        let firstReviewBoxComputedStyles: CSSStyleDeclaration;
        let secondReviewBoxComputedStyles: CSSStyleDeclaration;
        let thirdReviewBoxComputedStyles: CSSStyleDeclaration;
        let firstPrereqBoxIndex: number;
        let secondPrereqBoxIndex: number;
        let firstTaskBoxWrapperIndex: number;
        let secondTaskBoxWrapperIndex: number;
        let thirdTaskBoxWrapperIndex: number;
        let firstTaskBoxIndex: number;
        let secondTaskBoxIndex: number;
        let thirdTaskBoxIndex: number;
        let firstExtensionalTrailIndex: number;
        let secondExtensionalTrailIndex: number;
        let thirdExtensionalTrailIndex: number;
        let fourthExtensionalTrailIndex: number;
        let firstReviewBoxIndex: number;
        let secondReviewBoxIndex: number;
        let thirdReviewBoxIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitH;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const box = await screen.findByTestId(`task-${relevantUnit.id}`);
          boxComputedStyles = getComputedStyle(box);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          const card = possibleCard;
          cardComputedStyles = getComputedStyle(card);
          // first item
          const firstPrereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(firstPrereqBox);
          firstPrereqBoxComputedStyles = getComputedStyle(firstPrereqBox);
          // second item
          const firstTaskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(firstTaskBoxWrapper);
          firstTaskBoxWrapperComputedStyles =
            getComputedStyle(firstTaskBoxWrapper);
          const firstTaskBox = firstTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(firstTaskBox);
          firstTaskBoxComputedStyles = getComputedStyle(firstTaskBox);
          const label = firstTaskBox.textContent;
          assertIsString(label);
          firstLabelText = label;
          const firstTrail =
            firstTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(firstTrail);
          firstExtensionTrailComputedStyles = getComputedStyle(firstTrail);
          // third item
          const firstReviewBox = card.querySelector(".reviewBox");
          assertIsObject(firstReviewBox);
          firstReviewBoxComputedStyles = getComputedStyle(firstReviewBox);
          // fourth item
          const secondTaskBoxWrapper =
            card.querySelectorAll(".taskBoxWrapper")[1];
          assertIsObject(secondTaskBoxWrapper);
          secondTaskBoxWrapperComputedStyles =
            getComputedStyle(secondTaskBoxWrapper);
          const secondTaskBox = secondTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(secondTaskBox);
          secondTaskBoxComputedStyles = getComputedStyle(secondTaskBox);
          const secondLabel = secondTaskBox.textContent;
          assertIsString(secondLabel);
          secondLabelText = secondLabel;
          const secondTrail =
            secondTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(secondTrail);
          secondExtensionTrailComputedStyles = getComputedStyle(secondTrail);
          // fifth item
          const secondReviewBox = card.querySelectorAll(".reviewBox")[1];
          assertIsObject(secondReviewBox);
          secondReviewBoxComputedStyles = getComputedStyle(secondReviewBox);
          // sixth item
          const thirdTrail = card.querySelectorAll(
            ".cardContentDiv > .extensionTrail"
          )[0];
          assertIsObject(thirdTrail);
          thirdExtensionTrailComputedStyles = getComputedStyle(thirdTrail);
          // seventh item
          const secondPrereqBox = card.querySelectorAll(
            ".cardContentDiv > .prerequisiteBox"
          )[1];
          assertIsObject(secondPrereqBox);
          secondPrereqBoxComputedStyles = getComputedStyle(secondPrereqBox);
          // eighth item
          const thirdTaskBoxWrapper =
            card.querySelectorAll(".taskBoxWrapper")[2];
          assertIsObject(thirdTaskBoxWrapper);
          thirdTaskBoxWrapperComputedStyles =
            getComputedStyle(thirdTaskBoxWrapper);
          const thirdTaskBox = thirdTaskBoxWrapper.querySelector(".taskBox");
          assertIsObject(thirdTaskBox);
          thirdTaskBoxComputedStyles = getComputedStyle(thirdTaskBox);
          const thirdLabel = thirdTaskBox.textContent;
          assertIsString(thirdLabel);
          thirdLabelText = thirdLabel;
          const fourthTrail =
            thirdTaskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(fourthTrail);
          fourthExtensionTrailComputedStyles = getComputedStyle(fourthTrail);
          // ninth item
          const thirdReviewBox = card.querySelectorAll(".reviewBox")[2];
          assertIsObject(thirdReviewBox);
          thirdReviewBoxComputedStyles = getComputedStyle(thirdReviewBox);
          const flexParent = card.querySelector(".cardContentDiv");
          assertIsObject(flexParent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < flexParent.children.length; i++) {
            const child = flexParent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          const firstWrapperChildren: Element[] = [];
          for (let i = 0; i < firstTaskBoxWrapper.children.length; i++) {
            const child = firstTaskBoxWrapper.children[i];
            assertIsObject(child);
            firstWrapperChildren.push(child);
          }
          const secondWrapperChildren: Element[] = [];
          for (let i = 0; i < secondTaskBoxWrapper.children.length; i++) {
            const child = secondTaskBoxWrapper.children[i];
            assertIsObject(child);
            secondWrapperChildren.push(child);
          }
          const thirdWrapperChildren: Element[] = [];
          for (let i = 0; i < thirdTaskBoxWrapper.children.length; i++) {
            const child = thirdTaskBoxWrapper.children[i];
            assertIsObject(child);
            thirdWrapperChildren.push(child);
          }
          firstPrereqBoxIndex = parentChildren.indexOf(firstPrereqBox);
          firstTaskBoxWrapperIndex =
            parentChildren.indexOf(firstTaskBoxWrapper);
          firstTaskBoxIndex = firstWrapperChildren.indexOf(firstTaskBox);
          firstExtensionalTrailIndex = firstWrapperChildren.indexOf(firstTrail);
          firstReviewBoxIndex = parentChildren.indexOf(firstReviewBox);
          thirdExtensionalTrailIndex = parentChildren.indexOf(thirdTrail);
          secondPrereqBoxIndex = parentChildren.indexOf(secondPrereqBox);
          secondTaskBoxWrapperIndex =
            parentChildren.indexOf(secondTaskBoxWrapper);
          secondTaskBoxIndex = secondWrapperChildren.indexOf(secondTaskBox);
          secondExtensionalTrailIndex =
            secondWrapperChildren.indexOf(secondTrail);
          secondReviewBoxIndex = parentChildren.indexOf(secondReviewBox);
          thirdTaskBoxWrapperIndex =
            parentChildren.indexOf(thirdTaskBoxWrapper);
          thirdTaskBoxIndex = thirdWrapperChildren.indexOf(thirdTaskBox);
          fourthExtensionalTrailIndex =
            thirdWrapperChildren.indexOf(fourthTrail);
          thirdReviewBoxIndex = parentChildren.indexOf(thirdReviewBox);
        });
        it("should have box with a width according to actual duration and anticipated start", function (): void {
          expect(Number(boxComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card with a width according to actual duration", function (): void {
          expect(Number(cardComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.apparentStartDate.getTime()
            )
          );
        });
        describe("First Item", function (): void {
          it("should have green prerequisites box", function (): void {
            expect(
              chroma(firstPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
          });
          it("should have prerequisites box in the beginning", function (): void {
            expect(firstPrereqBoxIndex).to.equal(0);
          });
        });
        describe("Second Item", function (): void {
          it("should have labeled task box", function (): void {
            expect(firstLabelText).to.equal(relevantUnit.name);
          });
          it("should have task box with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in task box wrapper", function (): void {
            expect(
              chroma(firstExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in task box wrapper", function (): void {
            expect(firstExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in task box wrapper", function (): void {
            expect(firstTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in task box wrapper", function (): void {
            expect(firstExtensionalTrailIndex).to.equal(1);
          });
          it("should have task box wrapper with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have task box wrapper as the second item", function (): void {
            expect(firstTaskBoxWrapperIndex).to.equal(1);
          });
          it("should have task box wrapper that is willing to shrink", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexShrink)
            ).to.equal(1);
          });
        });
        describe("Third Item", function (): void {
          it("should have red review box", function (): void {
            expect(
              chroma(firstReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewMajorColor).hex());
          });
          it("should have review box as third item", function (): void {
            expect(firstReviewBoxIndex).to.equal(2);
          });
        });
        describe("Fourth Item", function (): void {
          it("should have second task box wrapper as fourth item", function (): void {
            expect(secondTaskBoxWrapperIndex).to.equal(3);
          });
          it("should have second task box wrapper with a flex basis according to actual duration, and review box width", function (): void {
            const precedingEvent = relevantUnit.eventHistory[1];
            const reviewEvent = relevantUnit.eventHistory[2];
            assertIsObject(precedingEvent);
            assertIsObject(reviewEvent);
            expect(
              Number(secondTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                reviewEvent.date.getTime(),
                precedingEvent.date.getTime()
              ) - theme.reviewBoxWidth
            );
          });
          it("should have non labeled task box in second task box wrapper", function (): void {
            expect(secondLabelText).to.equal("");
          });
          it("should have task box with a flex basis according to anticipated duration in second task box wrapper, and review box width", function (): void {
            expect(
              Number(secondTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) - theme.reviewBoxWidth
            );
          });
          it("should have extension trail with pink background color in second task box wrapper", function (): void {
            expect(
              chroma(secondExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in second task box wrapper", function (): void {
            expect(secondExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in second task box wrapper", function (): void {
            expect(secondTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in second task box wrapper", function (): void {
            expect(secondExtensionalTrailIndex).to.equal(1);
          });
        });
        describe("Fifth Item", function (): void {
          it("should have black review box", function (): void {
            expect(
              chroma(secondReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewRebuildColor).hex());
          });
          it("should have review box as fifth item", function (): void {
            expect(secondReviewBoxIndex).to.equal(4);
          });
        });
        describe("Sixth Item", function (): void {
          it("should have extension trail as sixth item", function (): void {
            expect(thirdExtensionalTrailIndex).to.equal(5);
          });
          it("should have extension trail with pink background", function (): void {
            expect(
              chroma(thirdExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have third extension trail with a width according to time between review and current time", function (): void {
            const reviewEvent = relevantUnit.eventHistory[2];
            assertIsObject(reviewEvent);
            expect(
              Number(thirdExtensionTrailComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(now.getTime(), reviewEvent.date.getTime())
            );
            expect(Number(thirdExtensionTrailComputedStyles.flexGrow)).to.equal(
              0
            );
            expect(
              Number(thirdExtensionTrailComputedStyles.flexShrink)
            ).to.equal(0);
          });
        });
        describe("Seventh Item", function (): void {
          it("should have white prerequisites box", function (): void {
            expect(
              chroma(secondPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsPendingColor).hex());
          });
          it("should have second prereq box as seventh item", function (): void {
            expect(secondPrereqBoxIndex).to.equal(6);
          });
        });
        describe("Eighth Item", function (): void {
          it("should have third task box wrapper as eighth item", function (): void {
            expect(thirdTaskBoxWrapperIndex).to.equal(7);
          });
          it("should have third task box wrapper with a flex basis according to anticipated duration, and review and prereqs box widths", function (): void {
            // doesn't need to compensate for prereq box
            expect(
              Number(thirdTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have non labeled task box in third task box wrapper", function (): void {
            expect(thirdLabelText).to.equal("");
          });
          it("should have task box with a flex basis according to anticipated duration, amd review and prereqs box widths in third task box wrapper", function (): void {
            // doesn't need to compensate for prereq box
            expect(
              Number(thirdTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in third task box wrapper", function (): void {
            expect(
              chroma(fourthExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in third task box wrapper", function (): void {
            expect(fourthExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in third task box wrapper", function (): void {
            expect(thirdTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in third task box wrapper", function (): void {
            expect(fourthExtensionalTrailIndex).to.equal(1);
          });
        });
        describe("Eighth Item", function (): void {
          it("should have white review box", function (): void {
            expect(
              chroma(thirdReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewPendingColor).hex());
          });
          it("should have third review box at the end", function (): void {
            expect(thirdReviewBoxIndex).to.equal(8);
          });
        });
      });
      describe("L", function (): void {
        let relevantUnit: TaskUnit;
        let boxComputedStyles: CSSStyleDeclaration;
        let cardComputedStyles: CSSStyleDeclaration;
        let labelText: string;
        let firstPrereqBoxComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxWrapperComputedStyles: CSSStyleDeclaration;
        let firstTaskBoxComputedStyles: CSSStyleDeclaration;
        let firstExtensionTrailComputedStyles: CSSStyleDeclaration;
        let firstReviewBoxComputedStyles: CSSStyleDeclaration;
        let firstPrereqBoxIndex: number;
        let firstTaskBoxWrapperIndex: number;
        let firstTaskBoxIndex: number;
        let firstExtensionalTrailIndex: number;
        let firstReviewBoxIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitL;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const box = await screen.findByTestId(`task-${relevantUnit.id}`);
          boxComputedStyles = getComputedStyle(box);
          const possibleCard = box.querySelector(".taskUnit");
          assertIsObject(possibleCard);
          const card = possibleCard;
          cardComputedStyles = getComputedStyle(card);
          const prereqBox = card.querySelector(".prerequisiteBox");
          assertIsObject(prereqBox);
          firstPrereqBoxComputedStyles = getComputedStyle(prereqBox);
          const taskBoxWrapper = card.querySelector(".taskBoxWrapper");
          assertIsObject(taskBoxWrapper);
          firstTaskBoxWrapperComputedStyles = getComputedStyle(taskBoxWrapper);
          const taskBox = taskBoxWrapper.querySelector(".taskBox");
          assertIsObject(taskBox);
          firstTaskBoxComputedStyles = getComputedStyle(taskBox);
          const label = taskBox.textContent;
          assertIsString(label);
          labelText = label;
          const trail = taskBoxWrapper.querySelector(".extensionTrail");
          assertIsObject(trail);
          firstExtensionTrailComputedStyles = getComputedStyle(trail);
          const reviewBox = card.querySelector(".reviewBox");
          assertIsObject(reviewBox);
          firstReviewBoxComputedStyles = getComputedStyle(reviewBox);
          const flexParent = card.querySelector(".cardContentDiv");
          assertIsObject(flexParent);
          const parentChildren: Element[] = [];
          for (let i = 0; i < flexParent.children.length; i++) {
            const child = flexParent.children[i];
            assertIsObject(child);
            parentChildren.push(child);
          }
          const wrapperChildren: Element[] = [];
          for (let i = 0; i < taskBoxWrapper.children.length; i++) {
            const child = taskBoxWrapper.children[i];
            assertIsObject(child);
            wrapperChildren.push(child);
          }
          firstPrereqBoxIndex = parentChildren.indexOf(prereqBox);
          firstTaskBoxWrapperIndex = parentChildren.indexOf(taskBoxWrapper);
          firstReviewBoxIndex = parentChildren.indexOf(reviewBox);
          firstTaskBoxIndex = wrapperChildren.indexOf(taskBox);
          firstExtensionalTrailIndex = wrapperChildren.indexOf(trail);
        });
        it("should have box with a width according to actual duration and anticipated start", function (): void {
          expect(Number(boxComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card with a width according to actual duration", function (): void {
          expect(Number(cardComputedStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              relevantUnit.apparentEndDate.getTime(),
              relevantUnit.apparentStartDate.getTime()
            )
          );
        });
        describe("First Item", function (): void {
          it("should have green prerequisites box", function (): void {
            expect(
              chroma(firstPrereqBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.prereqsAcceptedColor).hex());
          });
          it("should have prerequisites box in the beginning", function (): void {
            expect(firstPrereqBoxIndex).to.equal(0);
          });
        });
        describe("Second Item", function (): void {
          it("should have labeled task box", function (): void {
            expect(labelText).to.equal(relevantUnit.name);
          });
          it("should have task box with a flex basis according to anticipated duration, and review and prereq box widths", function (): void {
            expect(
              Number(firstTaskBoxComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.anticipatedEndDate.getTime(),
                relevantUnit.anticipatedStartDate.getTime()
              ) -
                theme.reviewBoxWidth -
                theme.prerequisitesBoxWidth
            );
          });
          it("should have extension trail with pink background color in task box wrapper", function (): void {
            expect(
              chroma(firstExtensionTrailComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.extensionColor).hex());
          });
          it("should have extension trail lined up to grow in space left behind in task box wrapper", function (): void {
            expect(firstExtensionTrailComputedStyles.flexGrow).to.equal("1");
          });
          it("should have task box as first child in task box wrapper", function (): void {
            expect(firstTaskBoxIndex).to.equal(0);
          });
          it("should have extension trail as last child in task box wrapper", function (): void {
            expect(firstExtensionalTrailIndex).to.equal(1);
          });
          it("should have task box wrapper with a flex basis according to start time, current time, and prereq box width", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexBasis.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                now.getTime(),
                relevantUnit.apparentStartDate.getTime()
              ) - theme.prerequisitesBoxWidth
            );
          });
          it("should have task box wrapper as the second item", function (): void {
            expect(firstTaskBoxWrapperIndex).to.equal(1);
          });
          it("should have task box wrapper that is willing to shrink", function (): void {
            expect(
              Number(firstTaskBoxWrapperComputedStyles.flexShrink)
            ).to.equal(1);
          });
        });
        describe("Third Item", function (): void {
          it("should have white review box", function (): void {
            expect(
              chroma(firstReviewBoxComputedStyles.backgroundColor).hex()
            ).to.equal(chroma(theme.reviewPendingColor).hex());
          });
          it("should have review box at the end", function (): void {
            expect(firstReviewBoxIndex).to.equal(2);
          });
        });
      });
    });
  });
});
