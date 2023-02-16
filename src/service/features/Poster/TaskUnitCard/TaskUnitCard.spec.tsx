import { screen } from "@testing-library/react";
import { expect } from "chai";
import { add, sub } from "date-fns";
import { assertIsObject } from "primitive-predicates";
import { TaskUnit, TaskUnitCluster } from "../../../../Relations";
import { EventType } from "../../../../types";
import { theme } from "../../../app/theme";
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

    const unitA = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: thirdDate,
        },
      ],
    });
    const unitB = new TaskUnit({
      now,
      parentUnits: [unitA],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "B",
      eventHistory: [
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
      ],
    });
    const unitC = new TaskUnit({
      now,
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "C",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: fifthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: add(sixthDate, { hours: 4 }),
        },
      ],
    });
    const unitD = new TaskUnit({
      now,
      parentUnits: [unitC],
      anticipatedStartDate: sixthDate,
      anticipatedEndDate: seventhDate,
      name: "D",
      eventHistory: [
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
      ],
    });

    const unitE = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "E",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ],
    });
    const unitF = new TaskUnit({
      now,
      parentUnits: [unitA, unitE],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "F",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ],
    });
    const unitG = new TaskUnit({
      now,
      parentUnits: [unitF],
      anticipatedStartDate: fourthDate,
      anticipatedEndDate: fifthDate,
      name: "G",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ],
    });
    const unitH = new TaskUnit({
      now,
      parentUnits: [unitC, unitG],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "H",
      eventHistory: [
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
      ],
    });

    const unitI = new TaskUnit({
      now,
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "I",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ],
    });
    const unitJ = new TaskUnit({
      now,
      parentUnits: [unitA, unitI],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "J",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ],
    });
    const unitK = new TaskUnit({
      now,
      parentUnits: [unitJ],
      anticipatedStartDate: fourthDate,
      anticipatedEndDate: fifthDate,
      name: "K",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ],
    });
    const unitL = new TaskUnit({
      now,
      parentUnits: [unitC, unitK],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "L",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          date: add(sixthDate, { hours: 4 }),
        },
      ],
    });

    before(function (): void {
      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      initialState = turnClusterIntoState(cluster);
    });
    describe("Cards", function (): void {
      describe("Standard Cards", function (): void {
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
            let firstIterationWrapperComputedStyles: CSSStyleDeclaration;
            before(async function (): Promise<void> {
              const unitDetails = initialState.units[relevantUnit.id];
              assertIsObject(unitDetails);
              renderWithProvider(
                <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
              );
              const box = await screen.findByTestId(`task-${relevantUnit.id}`);
              const card = box.querySelector(".taskUnit");
              assertIsObject(card);
              const firstIterationWrapper = box.querySelector(
                ".staticTaskBox.taskIteration.prereqsBoxIncluded.prereqsAccepted"
              );
              assertIsObject(firstIterationWrapper);
              firstIterationWrapperComputedStyles = getComputedStyle(
                firstIterationWrapper
              );
            });
            describe("First Item (Static Task Iteration Box)", function (): void {
              it("should have width of actual duration minus both borders width", function (): void {
                expect(
                  Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
                ).to.equal(
                  getPixelGapBetweenTimes(
                    relevantUnit.apparentEndDate.getTime(),
                    relevantUnit.apparentStartDate.getTime()
                  ) -
                    theme.borderWidth * 2
                );
              });
            });
          });
        }
      });
      describe("B", function (): void {
        let relevantUnit: TaskUnit;
        let firstIterationWrapperComputedStyles: CSSStyleDeclaration;
        let secondIterationWrapperComputedStyles: CSSStyleDeclaration;
        let firstIterationClassNames: string[];
        let secondIterationClassNames: string[];
        let firstIterationIndex: number;
        let secondIterationIndex: number;
        before(function (): void {
          relevantUnit = unitB;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          const {
            renderResult: { container },
          } = renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const contentContainer = container.querySelector(".cardContentDiv");
          assertIsObject(contentContainer);
          const elements = container.querySelectorAll(".taskIteration");
          const firstIteration = elements[0];
          const secondIteration = elements[1];
          assertIsObject(firstIteration);
          assertIsObject(secondIteration);
          firstIterationWrapperComputedStyles =
            getComputedStyle(firstIteration);
          secondIterationWrapperComputedStyles =
            getComputedStyle(secondIteration);
          firstIterationClassNames = firstIteration.className.split(" ");
          secondIterationClassNames = secondIteration.className.split(" ");
          const containerChildren: Element[] = [];
          for (let i = 0; i < contentContainer.children.length; i++) {
            const child = contentContainer.children[i];
            assertIsObject(child);
            containerChildren.push(child);
          }
          firstIterationIndex = containerChildren.indexOf(firstIteration);
          secondIterationIndex = containerChildren.indexOf(secondIteration);
        });
        describe("First Iteration", function (): void {
          it("should be first child", function (): void {
            expect(firstIterationIndex).to.equal(0);
          });
          it("should have width according to actual duration of first iteration minus one border width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[0];
            const startedEvent = relevantUnit.interpolatedEventHistory[1];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) - theme.borderWidth
            );
          });
          it("should have static, minor review, and prereq included class name and not the other variant names", function (): void {
            expect(firstIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "needsMinorRevisionReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxNotIncluded",
                "prereqsPending",
                "pendingReview",
                "acceptedReview",
                "needsMajorRevisionReview",
                "needsRebuildReview",
              ]);
          });
        });
        describe("Second Iteration", function (): void {
          it("should be second child", function (): void {
            expect(secondIterationIndex).to.equal(1);
          });
          it("should have width according to actual duration of second iteration minus one border width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[1];
            const startedEvent = relevantUnit.interpolatedEventHistory[2];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(secondIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) - theme.borderWidth
            );
          });
          it("should have static, accepted review, and prereqs not included class name and not the other variant names", function (): void {
            expect(secondIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxNotIncluded",
                "acceptedReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "prereqsPending",
                "pendingReview",
                "needsMinorRevisionReview",
                "needsMajorRevisionReview",
                "needsRebuildReview",
              ]);
          });
        });
      });
      describe("D", function (): void {
        let relevantUnit: TaskUnit;
        let firstIterationWrapperComputedStyles: CSSStyleDeclaration;
        let secondIterationWrapperComputedStyles: CSSStyleDeclaration;
        let thirdIterationWrapperComputedStyles: CSSStyleDeclaration;
        let extensionComputedStyles: CSSStyleDeclaration;
        let firstIterationClassNames: string[];
        let secondIterationClassNames: string[];
        let thirdIterationClassNames: string[];
        let firstIterationIndex: number;
        let secondIterationIndex: number;
        let thirdIterationIndex: number;
        let extensionTrailIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitD;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          const {
            renderResult: { container },
          } = renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const contentContainer = container.querySelector(".cardContentDiv");
          assertIsObject(contentContainer);
          const elements = container.querySelectorAll(".taskIteration");
          const firstIteration = elements[0];
          const secondIteration = elements[1];
          const thirdIteration = elements[2];
          assertIsObject(firstIteration);
          assertIsObject(secondIteration);
          assertIsObject(thirdIteration);
          firstIterationWrapperComputedStyles =
            getComputedStyle(firstIteration);
          secondIterationWrapperComputedStyles =
            getComputedStyle(secondIteration);
          thirdIterationWrapperComputedStyles =
            getComputedStyle(thirdIteration);
          firstIterationClassNames = firstIteration.className.split(" ");
          secondIterationClassNames = secondIteration.className.split(" ");
          thirdIterationClassNames = thirdIteration.className.split(" ");
          const extensionTrail = container.querySelector(
            ".extensionTrail.extensionTrailFixedSize"
          );
          assertIsObject(extensionTrail);
          extensionComputedStyles = getComputedStyle(extensionTrail);
          const containerChildren: Element[] = [];
          for (let i = 0; i < contentContainer.children.length; i++) {
            const child = contentContainer.children[i];
            assertIsObject(child);
            containerChildren.push(child);
          }
          firstIterationIndex = containerChildren.indexOf(firstIteration);
          secondIterationIndex = containerChildren.indexOf(secondIteration);
          thirdIterationIndex = containerChildren.indexOf(thirdIteration);
          extensionTrailIndex = containerChildren.indexOf(extensionTrail);
        });
        describe("First Iteration", function (): void {
          it("should be first child", function (): void {
            expect(firstIterationIndex).to.equal(0);
          });
          it("should have width according to actual duration of first iteration minus one border width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[0];
            const startedEvent = relevantUnit.interpolatedEventHistory[1];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) - theme.borderWidth
            );
          });
          it("should have static, rebuild review, prereqs accepted, and prereq included class name and not the other variant names", function (): void {
            expect(firstIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "needsRebuildReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxNotIncluded",
                "prereqsPending",
                "pendingReview",
                "acceptedReview",
                "needsMinorRevisionReview",
                "needsMajorRevisionReview",
              ]);
          });
        });
        describe("Extension Trail", function (): void {
          it("should be second child", function (): void {
            expect(extensionTrailIndex).to.equal(1);
          });
          it("should have width according to actual duration of second iteration minus neither borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[1];
            const startedEvent = relevantUnit.interpolatedEventHistory[2];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(Number(extensionComputedStyles.width.slice(0, -2))).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              )
            );
          });
        });
        describe("Second Iteration", function (): void {
          it("should be third child", function (): void {
            expect(secondIterationIndex).to.equal(2);
          });
          it("should have width according to actual duration of second iteration minus neither borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[2];
            const startedEvent = relevantUnit.interpolatedEventHistory[3];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(secondIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              )
            );
          });
          it("should have static, major review, prereqs accepted, and prereq included class name and not the other variant names", function (): void {
            expect(secondIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "needsMajorRevisionReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxNotIncluded",
                "prereqsPending",
                "pendingReview",
                "acceptedReview",
                "needsMinorRevisionReview",
                "needsRebuildReview",
              ]);
          });
        });
        describe("Third Iteration", function (): void {
          it("should be fourth child", function (): void {
            expect(thirdIterationIndex).to.equal(3);
          });
          it("should have width according to actual duration of third iteration plus review box width minus one border width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[3];
            const startedEvent = relevantUnit.interpolatedEventHistory[4];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(thirdIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) +
                theme.reviewBoxWidth -
                theme.borderWidth
            );
          });
          it("should have active, pending review, and prereq not included class name and not the other variant names", function (): void {
            expect(thirdIterationClassNames)
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
      });
      describe("H", function (): void {
        let relevantUnit: TaskUnit;
        let firstIterationWrapperComputedStyles: CSSStyleDeclaration;
        let secondIterationWrapperComputedStyles: CSSStyleDeclaration;
        let thirdIterationWrapperComputedStyles: CSSStyleDeclaration;
        let extensionComputedStyles: CSSStyleDeclaration;
        let firstIterationClassNames: string[];
        let secondIterationClassNames: string[];
        let thirdIterationClassNames: string[];
        let firstIterationIndex: number;
        let secondIterationIndex: number;
        let thirdIterationIndex: number;
        let extensionTrailIndex: number;
        before(async function (): Promise<void> {
          relevantUnit = unitH;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          const {
            renderResult: { container },
          } = renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const contentContainer = container.querySelector(".cardContentDiv");
          assertIsObject(contentContainer);
          const elements = container.querySelectorAll(".taskIteration");
          const firstIteration = elements[0];
          const secondIteration = elements[1];
          const thirdIteration = elements[2];
          assertIsObject(firstIteration);
          assertIsObject(secondIteration);
          assertIsObject(thirdIteration);
          firstIterationWrapperComputedStyles =
            getComputedStyle(firstIteration);
          secondIterationWrapperComputedStyles =
            getComputedStyle(secondIteration);
          thirdIterationWrapperComputedStyles =
            getComputedStyle(thirdIteration);
          firstIterationClassNames = firstIteration.className.split(" ");
          secondIterationClassNames = secondIteration.className.split(" ");
          thirdIterationClassNames = thirdIteration.className.split(" ");
          const extensionTrail = container.querySelector(
            ".extensionTrail.extensionTrailFixedSize"
          );
          assertIsObject(extensionTrail);
          extensionComputedStyles = getComputedStyle(extensionTrail);
          const containerChildren: Element[] = [];
          for (let i = 0; i < contentContainer.children.length; i++) {
            const child = contentContainer.children[i];
            assertIsObject(child);
            containerChildren.push(child);
          }
          firstIterationIndex = containerChildren.indexOf(firstIteration);
          secondIterationIndex = containerChildren.indexOf(secondIteration);
          thirdIterationIndex = containerChildren.indexOf(thirdIteration);
          extensionTrailIndex = containerChildren.indexOf(extensionTrail);
        });
        describe("First Iteration", function (): void {
          it("should be first child", function (): void {
            expect(firstIterationIndex).to.equal(0);
          });
          it("should have width according to actual duration of first iteration minus one border width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[0];
            const startedEvent = relevantUnit.interpolatedEventHistory[1];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) - theme.borderWidth
            );
          });
          it("should have static, major review, accepted prereqs, and prereq included class name and not the other variant names", function (): void {
            expect(firstIterationClassNames)
              .to.contain.members([
                "taskIteration",
                "staticTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "needsMajorRevisionReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxNotIncluded",
                "prereqsPending",
                "pendingReview",
                "acceptedReview",
                "needsMinorRevisionReview",
                "needsRebuildReview",
              ]);
          });
        });
        describe("Second Iteration", function (): void {
          it("should be second child", function (): void {
            expect(secondIterationIndex).to.equal(1);
          });
          it("should have width according to actual duration of second iteration minus neither borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[1];
            const startedEvent = relevantUnit.interpolatedEventHistory[2];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(secondIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              )
            );
          });
          it("should have static, rebuild review, and prereq not included class name and not the other variant names", function (): void {
            expect(secondIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxNotIncluded",
                "needsRebuildReview",
              ])
              .and.not.to.contain.members([
                "activeTaskBox",
                "prereqsBoxIncluded",
                "prereqsAccepted",
                "prereqsPending",
                "pendingReview",
                "acceptedReview",
                "needsMinorRevisionReview",
                "needsMajorRevisionReview",
              ]);
          });
        });
        describe("Extension Trail", function (): void {
          it("should be third child", function (): void {
            expect(extensionTrailIndex).to.equal(2);
          });
          it("should have width according to actual duration of second iteration minus neither borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[2];
            const startedEvent = relevantUnit.interpolatedEventHistory[3];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(Number(extensionComputedStyles.width.slice(0, -2))).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              )
            );
          });
        });
        describe("Third Iteration", function (): void {
          it("should be fourth child", function (): void {
            expect(thirdIterationIndex).to.equal(3);
          });
          it("should have width according to actual duration of third iteration minus one borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[3];
            const startedEvent = relevantUnit.interpolatedEventHistory[4];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(thirdIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) - theme.borderWidth
            );
          });
          it("should have static, pending review, pending prereqs, and prereq included class name and not the other variant names", function (): void {
            expect(thirdIterationClassNames)
              .to.contain.members([
                "staticTaskBox",
                "prereqsBoxIncluded",
                "prereqsPending",
                "pendingReview",
              ])
              .and.not.to.contain.members([
                "staticTaskBox",
                "prereqsBoxNotIncluded",
                "prereqsAccepted",
                "acceptedReview",
                "needsMinorRevisionReview",
                "needsMajorRevisionReview",
                "needsRebuildReview",
              ]);
          });
        });
      });
      describe("L", function (): void {
        let relevantUnit: TaskUnit;
        let firstIterationWrapperComputedStyles: CSSStyleDeclaration;
        let firstIterationClassNames: string[];
        let firstIterationIndex: number;
        let childCount: number;
        before(function (): void {
          relevantUnit = unitL;
          const unitDetails = initialState.units[relevantUnit.id];
          assertIsObject(unitDetails);
          const {
            renderResult: { container },
          } = renderWithProvider(
            <TaskUnitCard position={{ x: 0, y: 0 }} unit={unitDetails} />
          );
          const contentContainer = container.querySelector(".cardContentDiv");
          assertIsObject(contentContainer);
          const elements = container.querySelectorAll(".taskIteration");
          const firstIteration = elements[0];
          assertIsObject(firstIteration);
          firstIterationWrapperComputedStyles =
            getComputedStyle(firstIteration);
          firstIterationClassNames = firstIteration.className.split(" ");
          const containerChildren: Element[] = [];
          for (let i = 0; i < contentContainer.children.length; i++) {
            const child = contentContainer.children[i];
            assertIsObject(child);
            containerChildren.push(child);
          }
          childCount = containerChildren.length;
          firstIterationIndex = containerChildren.indexOf(firstIteration);
        });
        it("should only have one child", function (): void {
          expect(childCount).to.equal(1);
        });
        describe("First Iteration", function (): void {
          it("should be first child", function (): void {
            expect(firstIterationIndex).to.equal(0);
          });
          it("should have width according to actual duration of first iteration plus review box width minus both borders width", function (): void {
            const reviewEvent = relevantUnit.interpolatedEventHistory[0];
            const startedEvent = relevantUnit.interpolatedEventHistory[1];
            assertIsObject(reviewEvent);
            assertIsObject(startedEvent);
            expect(
              Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                startedEvent.date.getTime(),
                reviewEvent.date.getTime()
              ) +
                theme.reviewBoxWidth -
                theme.borderWidth * 2
            );
          });
          it("should have width according to actual duration plus review box width minus both borders width", function (): void {
            expect(
              Number(firstIterationWrapperComputedStyles.width.slice(0, -2))
            ).to.equal(
              getPixelGapBetweenTimes(
                relevantUnit.apparentEndDate.getTime(),
                relevantUnit.apparentStartDate.getTime()
              ) +
                theme.reviewBoxWidth -
                theme.borderWidth * 2
            );
          });
          it("should have static, pending review, prereqs accepted, and prereq included class name and not the other variant names", function (): void {
            expect(firstIterationClassNames)
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
          });
        });
      });
    });
  });
});
