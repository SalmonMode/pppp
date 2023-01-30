import { screen } from "@testing-library/react";
import { expect } from "chai";
import { add, sub } from "date-fns";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject, assertIsString } from "../../typePredicates";
import { EventType } from "../../types";
import { renderWithProvider } from "../../Utility/TestRenderers";
import {
  snailTrailColor,
  trackHeight,
  unitTaskTimeConversion,
} from "../constants";
import getYOfTrackTop from "./getYOfTrackTop";
import Poster from "./Poster";
import type { TaskUnitsState } from "./taskUnitsSlice";
import { turnClusterIntoState } from "./turnClusterIntoState";

const now = new Date();

describe("React Integration: Poster", () => {
  describe("Initial State", () => {
    beforeEach(function () {
      renderWithProvider(<Poster />);
    });

    it('should say "loading..."', async function () {
      let poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });

  describe("Chaotic Tracks", () => {
    let initialState: TaskUnitsState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
    let unitA: TaskUnit;
    let unitB: TaskUnit;
    let unitC: TaskUnit;
    let unitD: TaskUnit;
    let unitE: TaskUnit;
    let unitF: TaskUnit;
    let unitG: TaskUnit;
    let unitH: TaskUnit;
    let unitI: TaskUnit;
    let unitJ: TaskUnit;
    let unitK: TaskUnit;
    let unitL: TaskUnit;

    let trackCount: number;
    let secondTrackText: string;
    let thirdTrackText: string;

    let unitABoxStyles: CSSStyleDeclaration;
    let unitACardStyles: CSSStyleDeclaration;

    let unitBBoxStyles: CSSStyleDeclaration;
    let unitBCardStyles: CSSStyleDeclaration;

    let unitCBoxStyles: CSSStyleDeclaration;
    let unitCCardStyles: CSSStyleDeclaration;

    let unitDBoxStyles: CSSStyleDeclaration;
    let unitDCardStyles: CSSStyleDeclaration;

    let unitEBoxStyles: CSSStyleDeclaration;
    let unitECardStyles: CSSStyleDeclaration;

    let unitFBoxStyles: CSSStyleDeclaration;
    let unitFCardStyles: CSSStyleDeclaration;

    let unitGBoxStyles: CSSStyleDeclaration;
    let unitGCardStyles: CSSStyleDeclaration;

    let unitHBoxStyles: CSSStyleDeclaration;
    let unitHCardStyles: CSSStyleDeclaration;

    let unitIBoxStyles: CSSStyleDeclaration;
    let unitICardStyles: CSSStyleDeclaration;

    let unitJBoxStyles: CSSStyleDeclaration;
    let unitJCardStyles: CSSStyleDeclaration;

    let unitKBoxStyles: CSSStyleDeclaration;
    let unitKCardStyles: CSSStyleDeclaration;

    let unitLBoxStyles: CSSStyleDeclaration;
    let unitLCardStyles: CSSStyleDeclaration;

    let pathPointsForBA: ConnectedPoints;
    let pathPointsForDC: ConnectedPoints;
    let pathPointsForLK: ConnectedPoints;
    let pathPointsForLC: ConnectedPoints;
    let pathPointsForKJ: ConnectedPoints;
    let pathPointsForJI: ConnectedPoints;
    let pathPointsForJA: ConnectedPoints;
    let pathPointsForHG: ConnectedPoints;
    let pathPointsForHC: ConnectedPoints;
    let pathPointsForGF: ConnectedPoints;
    let pathPointsForFE: ConnectedPoints;
    let pathPointsForFA: ConnectedPoints;
    let earliestStartTime: number;

    before(async function () {
      const firstDate = sub(now, { days: 9 });
      const secondDate = add(firstDate, { days: 1 });
      const thirdDate = add(secondDate, { days: 1 });
      const fourthDate = add(thirdDate, { days: 1 });
      const fifthDate = add(fourthDate, { days: 1 });
      const sixthDate = add(fifthDate, { days: 1 });
      const seventhDate = add(sixthDate, { days: 1 });
      const eighthDate = add(seventhDate, { days: 1 });
      const ninthDate = add(eighthDate, { days: 1 });
      unitA = new TaskUnit([], firstDate, secondDate, "A", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: thirdDate,
        },
      ]);
      unitB = new TaskUnit([unitA], secondDate, thirdDate, "B", [
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
      unitC = new TaskUnit([], fifthDate, sixthDate, "C", [
        {
          type: EventType.TaskIterationStarted,
          date: fifthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
      unitD = new TaskUnit([unitC], sixthDate, seventhDate, "D", [
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

      unitE = new TaskUnit([], firstDate, secondDate, "E", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitF = new TaskUnit([unitA, unitE], secondDate, thirdDate, "F", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitG = new TaskUnit([unitF], fourthDate, fifthDate, "G", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitH = new TaskUnit([unitC, unitG], fifthDate, sixthDate, "H", [
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

      unitI = new TaskUnit([], firstDate, secondDate, "I", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitJ = new TaskUnit([unitA, unitI], secondDate, thirdDate, "J", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitK = new TaskUnit([unitJ], fourthDate, fifthDate, "K", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitL = new TaskUnit([unitC, unitK], fifthDate, sixthDate, "L", [
        {
          type: EventType.TaskIterationStarted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      initialState = turnClusterIntoState(cluster);
      renderWithProvider(<Poster />, {
        preloadedState: {
          taskUnits: initialState,
        },
      });
      poster = await screen.findByTestId(`poster`);
      tracks = poster.querySelectorAll(".taskTrack");
      trackCount = tracks.length;
      const secondTrackContent = tracks[1]?.textContent;
      assertIsString(secondTrackContent);
      secondTrackText = secondTrackContent;
      const thirdTrackContent = tracks[2]?.textContent;
      assertIsString(thirdTrackContent);
      thirdTrackText = thirdTrackContent;

      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      unitABoxStyles = getComputedStyle(unitABox);
      const unitACard = unitABox.querySelector(".taskUnit");
      assertIsObject(unitACard);
      unitACardStyles = getComputedStyle(unitACard);
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      unitBBoxStyles = getComputedStyle(unitBBox);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);
      unitBCardStyles = getComputedStyle(unitBCard);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      unitCBoxStyles = getComputedStyle(unitCBox);
      const unitCCard = unitCBox.querySelector(".taskUnit");
      assertIsObject(unitCCard);
      unitCCardStyles = getComputedStyle(unitCCard);
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      unitDBoxStyles = getComputedStyle(unitDBox);
      const unitDCard = unitDBox.querySelector(".taskUnit");
      assertIsObject(unitDCard);
      unitDCardStyles = getComputedStyle(unitDCard);
      const unitEBox = screen.getByTestId(`task-${unitE.id}`);
      unitEBoxStyles = getComputedStyle(unitEBox);
      const unitECard = unitEBox.querySelector(".taskUnit");
      assertIsObject(unitECard);
      unitECardStyles = getComputedStyle(unitECard);
      const unitFBox = screen.getByTestId(`task-${unitF.id}`);
      unitFBoxStyles = getComputedStyle(unitFBox);
      const unitFCard = unitFBox.querySelector(".taskUnit");
      assertIsObject(unitFCard);
      unitFCardStyles = getComputedStyle(unitFCard);
      const unitGBox = screen.getByTestId(`task-${unitG.id}`);
      unitGBoxStyles = getComputedStyle(unitGBox);
      const unitGCard = unitGBox.querySelector(".taskUnit");
      assertIsObject(unitGCard);
      unitGCardStyles = getComputedStyle(unitGCard);
      const unitHBox = screen.getByTestId(`task-${unitH.id}`);
      unitHBoxStyles = getComputedStyle(unitHBox);
      const unitHCard = unitHBox.querySelector(".taskUnit");
      assertIsObject(unitHCard);
      unitHCardStyles = getComputedStyle(unitHCard);
      const unitIBox = screen.getByTestId(`task-${unitI.id}`);
      unitIBoxStyles = getComputedStyle(unitIBox);
      const unitICard = unitIBox.querySelector(".taskUnit");
      assertIsObject(unitICard);
      unitICardStyles = getComputedStyle(unitICard);
      const unitJBox = screen.getByTestId(`task-${unitJ.id}`);
      unitJBoxStyles = getComputedStyle(unitJBox);
      const unitJCard = unitJBox.querySelector(".taskUnit");
      assertIsObject(unitJCard);
      unitJCardStyles = getComputedStyle(unitJCard);
      const unitKBox = screen.getByTestId(`task-${unitK.id}`);
      unitKBoxStyles = getComputedStyle(unitKBox);
      const unitKCard = unitKBox.querySelector(".taskUnit");
      assertIsObject(unitKCard);
      unitKCardStyles = getComputedStyle(unitKCard);
      const unitLBox = screen.getByTestId(`task-${unitL.id}`);
      unitLBoxStyles = getComputedStyle(unitLBox);
      const unitLCard = unitLBox.querySelector(".taskUnit");
      assertIsObject(unitLCard);
      unitLCardStyles = getComputedStyle(unitLCard);
      // Connected points
      const pathGroupBA = screen.getByTestId(
        `pathGroup-${unitB.id}-${unitA.id}`
      );
      const pathBA = pathGroupBA.querySelector("path");
      assertIsObject(pathBA);
      const pathDForBA = pathBA.getAttribute("d");
      assertIsString(pathDForBA);
      pathPointsForBA = ConnectedPoints.fromCurve(pathDForBA);
      const pathGroupDC = screen.getByTestId(
        `pathGroup-${unitD.id}-${unitC.id}`
      );
      const pathDC = pathGroupDC.querySelector("path");
      assertIsObject(pathDC);
      const pathDForDC = pathDC.getAttribute("d");
      assertIsString(pathDForDC);
      pathPointsForDC = ConnectedPoints.fromCurve(pathDForDC);
      const pathGroupLK = screen.getByTestId(
        `pathGroup-${unitL.id}-${unitK.id}`
      );
      const pathLK = pathGroupLK.querySelector("path");
      assertIsObject(pathLK);
      const pathDForLK = pathLK.getAttribute("d");
      assertIsString(pathDForLK);
      pathPointsForLK = ConnectedPoints.fromCurve(pathDForLK);
      const pathGroupLC = screen.getByTestId(
        `pathGroup-${unitL.id}-${unitC.id}`
      );
      const pathLC = pathGroupLC.querySelector("path");
      assertIsObject(pathLC);
      const pathDForLC = pathLC.getAttribute("d");
      assertIsString(pathDForLC);
      pathPointsForLC = ConnectedPoints.fromCurve(pathDForLC);
      const pathGroupKJ = screen.getByTestId(
        `pathGroup-${unitK.id}-${unitJ.id}`
      );
      const pathKJ = pathGroupKJ.querySelector("path");
      assertIsObject(pathKJ);
      const pathDForKJ = pathKJ.getAttribute("d");
      assertIsString(pathDForKJ);
      pathPointsForKJ = ConnectedPoints.fromCurve(pathDForKJ);
      const pathGroupJI = screen.getByTestId(
        `pathGroup-${unitJ.id}-${unitI.id}`
      );
      const pathJI = pathGroupJI.querySelector("path");
      assertIsObject(pathJI);
      const pathDForJI = pathJI.getAttribute("d");
      assertIsString(pathDForJI);
      pathPointsForJI = ConnectedPoints.fromCurve(pathDForJI);
      const pathGroupJA = screen.getByTestId(
        `pathGroup-${unitJ.id}-${unitA.id}`
      );
      const pathJA = pathGroupJA.querySelector("path");
      assertIsObject(pathJA);
      const pathDForJA = pathJA.getAttribute("d");
      assertIsString(pathDForJA);
      pathPointsForJA = ConnectedPoints.fromCurve(pathDForJA);
      const pathGroupHG = screen.getByTestId(
        `pathGroup-${unitH.id}-${unitG.id}`
      );
      const pathHG = pathGroupHG.querySelector("path");
      assertIsObject(pathHG);
      const pathDForHG = pathHG.getAttribute("d");
      assertIsString(pathDForHG);
      pathPointsForHG = ConnectedPoints.fromCurve(pathDForHG);
      const pathGroupHC = screen.getByTestId(
        `pathGroup-${unitH.id}-${unitC.id}`
      );
      const pathHC = pathGroupHC.querySelector("path");
      assertIsObject(pathHC);
      const pathDForHC = pathHC.getAttribute("d");
      assertIsString(pathDForHC);
      pathPointsForHC = ConnectedPoints.fromCurve(pathDForHC);
      const pathGroupGF = screen.getByTestId(
        `pathGroup-${unitG.id}-${unitF.id}`
      );
      const pathGF = pathGroupGF.querySelector("path");
      assertIsObject(pathGF);
      const pathDForGF = pathGF.getAttribute("d");
      assertIsString(pathDForGF);
      pathPointsForGF = ConnectedPoints.fromCurve(pathDForGF);
      const pathGroupFE = screen.getByTestId(
        `pathGroup-${unitF.id}-${unitE.id}`
      );
      const pathFE = pathGroupFE.querySelector("path");
      assertIsObject(pathFE);
      const pathDForFE = pathFE.getAttribute("d");
      assertIsString(pathDForFE);
      pathPointsForFE = ConnectedPoints.fromCurve(pathDForFE);
      const pathGroupFA = screen.getByTestId(
        `pathGroup-${unitF.id}-${unitA.id}`
      );
      const pathFA = pathGroupFA.querySelector("path");
      assertIsObject(pathFA);
      const pathDForFA = pathFA.getAttribute("d");
      assertIsString(pathDForFA);
      pathPointsForFA = ConnectedPoints.fromCurve(pathDForFA);

      earliestStartTime = unitI.anticipatedStartDate.getTime();
    });

    it("should have 4 task tracks", function () {
      expect(trackCount).to.equal(4);
    });
    it("should have B-D on second track (index 1)", function () {
      expect([...secondTrackText]).to.have.members(["B", "D"]);
    });
    it("should have A-C on third track (index 2)", function () {
      expect([...thirdTrackText]).to.have.members(["A", "C"]);
    });

    describe("Boxes", function () {
      describe("A", function () {
        it("should have red background for box", function () {
          expect(unitABoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitA.apparentEndDate.getTime() -
                unitA.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitA.apparentEndDate.getTime() -
                unitA.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should having box starting from the same horizontal point as box for E", function () {
          expect(Number(unitABoxStyles.left.slice(0, -2))).to.equal(
            Number(unitEBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for I", function () {
          expect(Number(unitABoxStyles.left.slice(0, -2))).to.equal(
            Number(unitIBoxStyles.left.slice(0, -2))
          );
        });
        it("should have card same width as B Card", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.equal(
            Number(unitBCardStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for C", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for C", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for E", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitECardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for E", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitEBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for F", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFCardStyles.width.slice(0, -2))
          );
        });
        it("should have box as wide as box for F", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.equal(
            Number(unitFBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for G", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for G", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for I", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitICardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for I", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitIBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for J", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJCardStyles.width.slice(0, -2))
          );
        });
        it("should have box as wide as box for J", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.equal(
            Number(unitJBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for K", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for K", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("B", function () {
        it("should have red background for box", function () {
          expect(unitBBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitB.apparentEndDate.getTime() -
                unitB.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitB.apparentEndDate.getTime() -
                unitB.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should having box starting further to the right than box for A", function () {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitABoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for F", function () {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitFBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for J", function () {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitJBoxStyles.left.slice(0, -2))
          );
        });
        it("should have box wider than box for A", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitABoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for C", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for C", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for E", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitECardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for E", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitEBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for F", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for F", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for G", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for G", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for I", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitICardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for I", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitIBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for J", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for J", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for K", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for K", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("C", function () {
        it("should have red background for box", function () {
          expect(unitCBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitC.apparentEndDate.getTime() -
                unitC.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitC.apparentEndDate.getTime() -
                unitC.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should having box starting further to the right than box for G", function () {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for H", function () {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitHBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for L", function () {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitLBoxStyles.left.slice(0, -2))
          );
        });
        it("should have card wider than card for E", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitECardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for E", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitEBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for F", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFCardStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for G", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for G", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for I", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitICardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for I", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitIBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for J", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJCardStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for K", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for K", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("D", function () {
        it("should have red background for box", function () {
          expect(unitDBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitD.apparentEndDate.getTime() -
                unitD.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitD.apparentEndDate.getTime() -
                unitD.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should having box starting further to the right than box for H", function () {
          expect(Number(unitDBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitHBoxStyles.left.slice(0, -2))
          );
        });
        it("should have card wider than card for A", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitACardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for A", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitABoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for B", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitBCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for B", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitBBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for C", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for C", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitCBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for E", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitECardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for E", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitEBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for F", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for F", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitFBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for G", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for G", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for I", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitICardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for I", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitIBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for J", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for J", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitJBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card wider than card for K", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for K", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card as wide as card for L", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.equal(
            Number(unitLCardStyles.width.slice(0, -2))
          );
        });
      });
      describe("E", function () {
        it("should have red background for box", function () {
          expect(unitEBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitEBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitE.apparentEndDate.getTime() -
                unitE.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitE.apparentEndDate.getTime() -
                unitE.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card as wide as card for F", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Number(unitFCardStyles.width.slice(0, -2))
          );
        });
        it("should have card as wide as card for G", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Number(unitGCardStyles.width.slice(0, -2))
          );
        });
        it("should have box as wide as box for G", function () {
          expect(Number(unitEBoxStyles.width.slice(0, -2))).to.equal(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have card as wide as card for I", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Number(unitICardStyles.width.slice(0, -2))
          );
        });
        it("should have card as wide as card for J", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Number(unitJCardStyles.width.slice(0, -2))
          );
        });
        it("should have card as wide as card for K", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            Number(unitKCardStyles.width.slice(0, -2))
          );
        });
        it("should have box as wide as box for K", function () {
          expect(Number(unitEBoxStyles.width.slice(0, -2))).to.equal(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("F", function () {
        it("should have red background for box", function () {
          expect(unitFBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitF.apparentEndDate.getTime() -
                unitF.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitFCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitF.apparentEndDate.getTime() -
                unitF.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have box wider than box for E", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitEBoxStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for G", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for I", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitIBoxStyles.width.slice(0, -2))
          );
        });
        it("should have box as wide as box for J", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.equal(
            Number(unitJBoxStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for K", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("G", function () {
        it("should have red background for box", function () {
          expect(unitGBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitGBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitG.apparentEndDate.getTime() -
                unitG.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitGCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitG.apparentEndDate.getTime() -
                unitG.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should having box starting further to the right than box for B", function () {
          expect(Number(unitGBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitBBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for K", function () {
          expect(Number(unitGBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitKBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("H", function () {
        it("should have red background for box", function () {
          expect(unitHBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitHBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitH.apparentEndDate.getTime() -
                unitH.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitHCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitH.apparentEndDate.getTime() -
                unitH.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card wider than card for L", function () {
          expect(Number(unitHCardStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitLCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for L", function () {
          expect(Number(unitHBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitLBoxStyles.width.slice(0, -2))
          );
        });
      });
      describe("I", function () {
        it("should have red background for box", function () {
          expect(unitIBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitIBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitI.apparentEndDate.getTime() -
                unitI.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitICardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitI.apparentEndDate.getTime() -
                unitI.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
      });
      describe("J", function () {
        it("should have red background for box", function () {
          expect(unitJBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitJBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitJ.apparentEndDate.getTime() -
                unitJ.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitJCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitJ.apparentEndDate.getTime() -
                unitJ.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
      });
      describe("K", function () {
        it("should have red background for box", function () {
          expect(unitKBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitKBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitK.apparentEndDate.getTime() -
                unitK.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitKCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitK.apparentEndDate.getTime() -
                unitK.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
      });
      describe("L", function () {
        it("should have red background for box", function () {
          expect(unitLBoxStyles.backgroundColor).to.equal(snailTrailColor);
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitLBoxStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitL.apparentEndDate.getTime() -
                unitL.anticipatedStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitLCardStyles.width.slice(0, -2))).to.equal(
            Math.round(
              (unitL.apparentEndDate.getTime() -
                unitL.apparentStartDate.getTime()) /
                unitTaskTimeConversion
            )
          );
        });
        it("should have card as wide as card for D", function () {
          expect(Number(unitLCardStyles.width.slice(0, -2))).to.equal(
            Number(unitDCardStyles.width.slice(0, -2))
          );
        });
        it("should have box wider than box for D", function () {
          expect(Number(unitLBoxStyles.width.slice(0, -2))).to.be.greaterThan(
            Number(unitDBoxStyles.width.slice(0, -2))
          );
        });
      });
    });
    describe("Paths", function () {
      it("should have path from B to A", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitA.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitB.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitB.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForBA).to.deep.equal(expectedPoints);
      });
      it("should have path from D to C", function () {
        const earliestStartTime = unitI.anticipatedStartDate.getTime();
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitC.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitD.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitD.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForDC).to.deep.equal(expectedPoints);
      });
      it("should have path from L to K", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitK.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitL.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForLK).to.deep.equal(expectedPoints);
      });
      it("should have path from L to C", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitC.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitL.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitL.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForLC).to.deep.equal(expectedPoints);
      });
      it("should have path from K to J", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitJ.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitK.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForKJ).to.deep.equal(expectedPoints);
      });
      it("should have path from J to I", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitI.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitJ.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForJI).to.deep.equal(expectedPoints);
      });
      it("should have path from J to A", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitA.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitJ.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForJA).to.deep.equal(expectedPoints);
      });
      it("should have path from H to G", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitG.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitH.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForHG).to.deep.equal(expectedPoints);
      });
      it("should have path from H to C", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitC.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitH.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitH.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForHC).to.deep.equal(expectedPoints);
      });
      it("should have path from G to F", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitF.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitG.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForGF).to.deep.equal(expectedPoints);
      });
      it("should have path from F to E", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitE.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitF.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForFE).to.deep.equal(expectedPoints);
      });
      it("should have path from F to A", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: Math.round(
              (unitA.apparentEndDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: Math.round(
              (unitF.apparentStartDate.getTime() - earliestStartTime) /
                unitTaskTimeConversion
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForFA).to.deep.equal(expectedPoints);
      });
    });
  });
  describe("Reusing Tracks (Different Path Heights)", () => {
    const firstDate = add(now, { days: 1 });
    const secondDate = add(firstDate, { days: 1 });
    const thirdDate = add(secondDate, { days: 1 });
    const fourthDate = add(thirdDate, { days: 1 });
    const fifthDate = add(fourthDate, { days: 1 });
    const sixthDate = add(fifthDate, { days: 1 });
    const seventhDate = add(sixthDate, { days: 1 });
    const eighthDate = add(seventhDate, { days: 1 });
    let trackCount: number;
    let secondTrackText: string;
    let thirdTrackText: string;

    before(async function () {
      const unitA = new TaskUnit([], firstDate, thirdDate, "A");
      const unitB = new TaskUnit([unitA], secondDate, fourthDate, "B");
      const unitC = new TaskUnit([], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit([unitC], seventhDate, eighthDate, "D");

      const unitE = new TaskUnit([], firstDate, secondDate, "E");
      const unitF = new TaskUnit([unitA, unitE], thirdDate, fourthDate, "F");
      const unitG = new TaskUnit([unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit([unitC, unitG], seventhDate, eighthDate, "H");
      const unitI = new TaskUnit([], firstDate, secondDate, "I");
      const unitJ = new TaskUnit([unitA, unitI], thirdDate, fourthDate, "J");
      const unitK = new TaskUnit([unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit([unitC, unitK], seventhDate, eighthDate, "L");

      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);

      const initialState = turnClusterIntoState(cluster);
      renderWithProvider(<Poster />, {
        preloadedState: {
          taskUnits: initialState,
        },
      });
      const poster = await screen.findByTestId(`poster`);
      const tracks = poster.querySelectorAll(".taskTrack");
      trackCount = tracks.length;
      const secondTrackContent = tracks[1]?.textContent;
      assertIsString(secondTrackContent);
      secondTrackText = secondTrackContent;
      const thirdTrackContent = tracks[2]?.textContent;
      assertIsString(thirdTrackContent);
      thirdTrackText = thirdTrackContent;
    });

    it("should have 4 task tracks", function () {
      expect(trackCount).to.equal(4);
    });
    it("should have B on second track (index 1)", function () {
      expect([...secondTrackText]).to.have.members(["B"]);
    });
    it("should have A-C-D on third track (index 2)", function () {
      expect([...thirdTrackText]).to.have.members(["A", "C", "D"]);
    });
  });
});
