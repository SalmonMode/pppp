import { screen } from "@testing-library/react";
import { expect } from "chai";
import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { add, startOfDay, sub } from "date-fns";
import ConnectedPoints from "../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../Relations";
import { assertIsObject, assertIsString } from "../../typePredicates";
import { EventType } from "../../types";
import { renderWithProvider } from "../../Utility/TestRenderers";
import { halfDayDuration, snailTrailColor, trackHeight } from "../constants";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";
import getYOfTrackTop from "./getYOfTrackTop";
import Poster from "./Poster";
import type { TaskUnitsState } from "./taskUnitsSlice";
import { turnClusterIntoState } from "./turnClusterIntoState";

const now = new Date();

const halfDayWidth = getPixelGapBetweenTimes(
  now.getTime() - sub(now, halfDayDuration).getTime(),
  0
);

describe("React Integration: Poster", () => {
  describe("Initial State", () => {
    beforeEach(function () {
      renderWithProvider(<Poster />);
    });

    it('should say "loading..."', async function () {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });

  describe("Chaotic Tracks", () => {
    let sandbox: SinonSandbox;
    let scrollStub: SinonStub;
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

    let unitASnailTrailStyles: CSSStyleDeclaration;
    let unitABoxStyles: CSSStyleDeclaration;
    let unitACardStyles: CSSStyleDeclaration;

    let unitBSnailTrailStyles: CSSStyleDeclaration;
    let unitBBoxStyles: CSSStyleDeclaration;
    let unitBCardStyles: CSSStyleDeclaration;

    let unitCSnailTrailStyles: CSSStyleDeclaration;
    let unitCBoxStyles: CSSStyleDeclaration;
    let unitCCardStyles: CSSStyleDeclaration;

    let unitDSnailTrailStyles: CSSStyleDeclaration;
    let unitDBoxStyles: CSSStyleDeclaration;
    let unitDCardStyles: CSSStyleDeclaration;

    let unitESnailTrailStyles: CSSStyleDeclaration;
    let unitEBoxStyles: CSSStyleDeclaration;
    let unitECardStyles: CSSStyleDeclaration;

    let unitFSnailTrailStyles: CSSStyleDeclaration;
    let unitFBoxStyles: CSSStyleDeclaration;
    let unitFCardStyles: CSSStyleDeclaration;

    let unitGSnailTrailStyles: CSSStyleDeclaration;
    let unitGBoxStyles: CSSStyleDeclaration;
    let unitGCardStyles: CSSStyleDeclaration;

    let unitHSnailTrailStyles: CSSStyleDeclaration;
    let unitHBoxStyles: CSSStyleDeclaration;
    let unitHCardStyles: CSSStyleDeclaration;

    let unitISnailTrailStyles: CSSStyleDeclaration;
    let unitIBoxStyles: CSSStyleDeclaration;
    let unitICardStyles: CSSStyleDeclaration;

    let unitJSnailTrailStyles: CSSStyleDeclaration;
    let unitJBoxStyles: CSSStyleDeclaration;
    let unitJCardStyles: CSSStyleDeclaration;

    let unitKSnailTrailStyles: CSSStyleDeclaration;
    let unitKBoxStyles: CSSStyleDeclaration;
    let unitKCardStyles: CSSStyleDeclaration;

    let unitLSnailTrailStyles: CSSStyleDeclaration;
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
    let earliestTimePoint: number;

    // Date Lines
    let svgWidth: number;
    let firstDateLabelX: number;
    let secondDateLabelX: number;
    let thirdDateLabelX: number;
    let fourthDateLabelX: number;
    let fifthDateLabelX: number;
    let sixthDateLabelX: number;
    let seventhDateLabelX: number;
    let eighthDateLabelX: number;
    let ninthDateLabelX: number;
    let tenthDateLabelX: number;
    let eleventhDateLabelX: number;
    let twelfthDateLabelX: number;
    let firstDateLabelText: string;
    let secondDateLabelText: string;
    let thirdDateLabelText: string;
    let fourthDateLabelText: string;
    let fifthDateLabelText: string;
    let sixthDateLabelText: string;
    let seventhDateLabelText: string;
    let eighthDateLabelText: string;
    let ninthDateLabelText: string;
    let tenthDateLabelText: string;
    let eleventhDateLabelText: string;
    let twelfthDateLabelText: string;
    let firstDateLineX: number;
    let secondDateLineX: number;
    let thirdDateLineX: number;
    let fourthDateLineX: number;
    let fifthDateLineX: number;
    let sixthDateLineX: number;
    let seventhDateLineX: number;
    let eighthDateLineX: number;
    let ninthDateLineX: number;
    let tenthDateLineX: number;
    let eleventhDateLineX: number;
    let twelfthDateLineX: number;

    const startOfFirstDate = startOfDay(sub(now, { days: 9 }));
    const startOfSecondDate = startOfDay(sub(now, { days: 8 }));
    const startOfThirdDate = startOfDay(sub(now, { days: 7 }));
    const startOfFourthDate = startOfDay(sub(now, { days: 6 }));
    const startOfFifthDate = startOfDay(sub(now, { days: 5 }));
    const startOfSixthDate = startOfDay(sub(now, { days: 4 }));
    const startOfSeventhDate = startOfDay(sub(now, { days: 3 }));
    const startOfEighthDate = startOfDay(sub(now, { days: 2 }));
    const startOfNinthDate = startOfDay(sub(now, { days: 1 }));
    const startOfTenthDate = startOfDay(add(now, { days: 0 }));
    const startOfEleventhDate = startOfDay(add(now, { days: 1 }));
    const startOfTwelfthDate = startOfDay(add(now, { days: 2 }));

    before(async function () {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = () => {};
      scrollStub = sandbox.stub(Element.prototype, "scrollIntoView");
      const firstDate = sub(now, { days: 9 });
      const secondDate = add(firstDate, { days: 1 });
      const thirdDate = add(secondDate, { days: 1 });
      const fourthDate = add(thirdDate, { days: 1 });
      const fifthDate = add(fourthDate, { days: 1 });
      const sixthDate = add(fifthDate, { days: 1 });
      const seventhDate = add(sixthDate, { days: 1 });
      const eighthDate = add(seventhDate, { days: 1 });
      const ninthDate = add(eighthDate, { days: 1 });
      unitA = new TaskUnit(now, [], firstDate, secondDate, "A", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: thirdDate,
        },
      ]);
      unitB = new TaskUnit(now, [unitA], secondDate, thirdDate, "B", [
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
      unitC = new TaskUnit(now, [], fifthDate, sixthDate, "C", [
        {
          type: EventType.TaskIterationStarted,
          date: fifthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
      unitD = new TaskUnit(now, [unitC], sixthDate, seventhDate, "D", [
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

      unitE = new TaskUnit(now, [], firstDate, secondDate, "E", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitF = new TaskUnit(now, [unitA, unitE], secondDate, thirdDate, "F", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitG = new TaskUnit(now, [unitF], fourthDate, fifthDate, "G", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitH = new TaskUnit(now, [unitC, unitG], fifthDate, sixthDate, "H", [
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

      unitI = new TaskUnit(now, [], firstDate, secondDate, "I", [
        {
          type: EventType.TaskIterationStarted,
          date: firstDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: secondDate,
        },
      ]);
      unitJ = new TaskUnit(now, [unitA, unitI], secondDate, thirdDate, "J", [
        {
          type: EventType.TaskIterationStarted,
          date: thirdDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fourthDate,
        },
      ]);
      unitK = new TaskUnit(now, [unitJ], fourthDate, fifthDate, "K", [
        {
          type: EventType.TaskIterationStarted,
          date: fourthDate,
        },
        {
          type: EventType.ReviewedAndAccepted,
          date: fifthDate,
        },
      ]);
      unitL = new TaskUnit(now, [unitC, unitK], fifthDate, sixthDate, "L", [
        {
          type: EventType.TaskIterationStarted,
          date: add(sixthDate, { hours: 4 }),
        },
      ]);
      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);
      earliestStartTime = startOfDay(unitI.anticipatedStartDate).getTime();
      earliestTimePoint = sub(earliestStartTime, halfDayDuration).getTime();

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

      const unitASnailTrail = screen.getByTestId(`snailTrail-${unitA.id}`);
      unitASnailTrailStyles = getComputedStyle(unitASnailTrail);
      const unitABox = screen.getByTestId(`task-${unitA.id}`);
      unitABoxStyles = getComputedStyle(unitABox);
      const unitACard = unitABox.querySelector(".taskUnit");
      assertIsObject(unitACard);
      unitACardStyles = getComputedStyle(unitACard);
      const unitBSnailTrail = screen.getByTestId(`snailTrail-${unitB.id}`);
      unitBSnailTrailStyles = getComputedStyle(unitBSnailTrail);
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      unitBBoxStyles = getComputedStyle(unitBBox);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);
      unitBCardStyles = getComputedStyle(unitBCard);
      const unitCSnailTrail = screen.getByTestId(`snailTrail-${unitC.id}`);
      unitCSnailTrailStyles = getComputedStyle(unitCSnailTrail);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      unitCBoxStyles = getComputedStyle(unitCBox);
      const unitCCard = unitCBox.querySelector(".taskUnit");
      assertIsObject(unitCCard);
      unitCCardStyles = getComputedStyle(unitCCard);
      const unitDSnailTrail = screen.getByTestId(`snailTrail-${unitD.id}`);
      unitDSnailTrailStyles = getComputedStyle(unitDSnailTrail);
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      unitDBoxStyles = getComputedStyle(unitDBox);
      const unitDCard = unitDBox.querySelector(".taskUnit");
      assertIsObject(unitDCard);
      unitDCardStyles = getComputedStyle(unitDCard);
      const unitESnailTrail = screen.getByTestId(`snailTrail-${unitE.id}`);
      unitESnailTrailStyles = getComputedStyle(unitESnailTrail);
      const unitEBox = screen.getByTestId(`task-${unitE.id}`);
      unitEBoxStyles = getComputedStyle(unitEBox);
      const unitECard = unitEBox.querySelector(".taskUnit");
      assertIsObject(unitECard);
      unitECardStyles = getComputedStyle(unitECard);
      const unitFSnailTrail = screen.getByTestId(`snailTrail-${unitF.id}`);
      unitFSnailTrailStyles = getComputedStyle(unitFSnailTrail);
      const unitFBox = screen.getByTestId(`task-${unitF.id}`);
      unitFBoxStyles = getComputedStyle(unitFBox);
      const unitFCard = unitFBox.querySelector(".taskUnit");
      assertIsObject(unitFCard);
      unitFCardStyles = getComputedStyle(unitFCard);
      const unitGSnailTrail = screen.getByTestId(`snailTrail-${unitG.id}`);
      unitGSnailTrailStyles = getComputedStyle(unitGSnailTrail);
      const unitGBox = screen.getByTestId(`task-${unitG.id}`);
      unitGBoxStyles = getComputedStyle(unitGBox);
      const unitGCard = unitGBox.querySelector(".taskUnit");
      assertIsObject(unitGCard);
      unitGCardStyles = getComputedStyle(unitGCard);
      const unitHSnailTrail = screen.getByTestId(`snailTrail-${unitH.id}`);
      unitHSnailTrailStyles = getComputedStyle(unitHSnailTrail);
      const unitHBox = screen.getByTestId(`task-${unitH.id}`);
      unitHBoxStyles = getComputedStyle(unitHBox);
      const unitHCard = unitHBox.querySelector(".taskUnit");
      assertIsObject(unitHCard);
      unitHCardStyles = getComputedStyle(unitHCard);
      const unitISnailTrail = screen.getByTestId(`snailTrail-${unitI.id}`);
      unitISnailTrailStyles = getComputedStyle(unitISnailTrail);
      const unitIBox = screen.getByTestId(`task-${unitI.id}`);
      unitIBoxStyles = getComputedStyle(unitIBox);
      const unitICard = unitIBox.querySelector(".taskUnit");
      assertIsObject(unitICard);
      unitICardStyles = getComputedStyle(unitICard);
      const unitJSnailTrail = screen.getByTestId(`snailTrail-${unitJ.id}`);
      unitJSnailTrailStyles = getComputedStyle(unitJSnailTrail);
      const unitJBox = screen.getByTestId(`task-${unitJ.id}`);
      unitJBoxStyles = getComputedStyle(unitJBox);
      const unitJCard = unitJBox.querySelector(".taskUnit");
      assertIsObject(unitJCard);
      unitJCardStyles = getComputedStyle(unitJCard);
      const unitKSnailTrail = screen.getByTestId(`snailTrail-${unitK.id}`);
      unitKSnailTrailStyles = getComputedStyle(unitKSnailTrail);
      const unitKBox = screen.getByTestId(`task-${unitK.id}`);
      unitKBoxStyles = getComputedStyle(unitKBox);
      const unitKCard = unitKBox.querySelector(".taskUnit");
      assertIsObject(unitKCard);
      unitKCardStyles = getComputedStyle(unitKCard);
      const unitLSnailTrail = screen.getByTestId(`snailTrail-${unitL.id}`);
      unitLSnailTrailStyles = getComputedStyle(unitLSnailTrail);
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

      const svg = screen.getByTestId("posterSVG");
      svgWidth = Number(getComputedStyle(svg).width.slice(0, -2));

      // Date Lines
      const dateLinesGroup = screen.getByTestId("dateLinesGroup");
      const firstDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[0];
      assertIsObject(firstDateLabel);
      firstDateLabelX = Number(firstDateLabel.getAttribute("x"));
      const possibleFirstDateLabelText = firstDateLabel.textContent;
      assertIsString(possibleFirstDateLabelText);
      firstDateLabelText = possibleFirstDateLabelText;
      const firstDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[0];
      assertIsObject(firstDateLine);
      firstDateLineX = Number(firstDateLine.getAttribute("x1"));
      const secondDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[1];
      assertIsObject(secondDateLabel);
      secondDateLabelX = Number(secondDateLabel.getAttribute("x"));
      const possibleSecondDateLabelText = secondDateLabel.textContent;
      assertIsString(possibleSecondDateLabelText);
      secondDateLabelText = possibleSecondDateLabelText;
      const secondDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[1];
      assertIsObject(secondDateLine);
      secondDateLineX = Number(secondDateLine.getAttribute("x1"));
      const thirdDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[2];
      assertIsObject(thirdDateLabel);
      thirdDateLabelX = Number(thirdDateLabel.getAttribute("x"));
      const possibleThirdDateLabelText = thirdDateLabel.textContent;
      assertIsString(possibleThirdDateLabelText);
      thirdDateLabelText = possibleThirdDateLabelText;
      const thirdDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[2];
      assertIsObject(thirdDateLine);
      thirdDateLineX = Number(thirdDateLine.getAttribute("x1"));
      const fourthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[3];
      assertIsObject(fourthDateLabel);
      fourthDateLabelX = Number(fourthDateLabel.getAttribute("x"));
      const possibleFourthDateLabelText = fourthDateLabel.textContent;
      assertIsString(possibleFourthDateLabelText);
      fourthDateLabelText = possibleFourthDateLabelText;
      const fourthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[3];
      assertIsObject(fourthDateLine);
      fourthDateLineX = Number(fourthDateLine.getAttribute("x1"));
      const fifthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[4];
      assertIsObject(fifthDateLabel);
      fifthDateLabelX = Number(fifthDateLabel.getAttribute("x"));
      const possibleFifthDateLabelText = fifthDateLabel.textContent;
      assertIsString(possibleFifthDateLabelText);
      fifthDateLabelText = possibleFifthDateLabelText;
      const fifthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[4];
      assertIsObject(fifthDateLine);
      fifthDateLineX = Number(fifthDateLine.getAttribute("x1"));
      const sixthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[5];
      assertIsObject(sixthDateLabel);
      sixthDateLabelX = Number(sixthDateLabel.getAttribute("x"));
      const possibleSixthDateLabelText = sixthDateLabel.textContent;
      assertIsString(possibleSixthDateLabelText);
      sixthDateLabelText = possibleSixthDateLabelText;
      const sixthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[5];
      assertIsObject(sixthDateLine);
      sixthDateLineX = Number(sixthDateLine.getAttribute("x1"));
      const seventhDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[6];
      assertIsObject(seventhDateLabel);
      seventhDateLabelX = Number(seventhDateLabel.getAttribute("x"));
      const possibleSeventhDateLabelText = seventhDateLabel.textContent;
      assertIsString(possibleSeventhDateLabelText);
      seventhDateLabelText = possibleSeventhDateLabelText;
      const seventhDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[6];
      assertIsObject(seventhDateLine);
      seventhDateLineX = Number(seventhDateLine.getAttribute("x1"));
      const eighthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[7];
      assertIsObject(eighthDateLabel);
      eighthDateLabelX = Number(eighthDateLabel.getAttribute("x"));
      const possibleEighthDateLabelText = eighthDateLabel.textContent;
      assertIsString(possibleEighthDateLabelText);
      eighthDateLabelText = possibleEighthDateLabelText;
      const eighthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[7];
      assertIsObject(eighthDateLine);
      eighthDateLineX = Number(eighthDateLine.getAttribute("x1"));
      const ninthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[8];
      assertIsObject(ninthDateLabel);
      ninthDateLabelX = Number(ninthDateLabel.getAttribute("x"));
      const possibleNinthDateLabelText = ninthDateLabel.textContent;
      assertIsString(possibleNinthDateLabelText);
      ninthDateLabelText = possibleNinthDateLabelText;
      const ninthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[8];
      assertIsObject(ninthDateLine);
      ninthDateLineX = Number(ninthDateLine.getAttribute("x1"));
      const tenthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[9];
      assertIsObject(tenthDateLabel);
      tenthDateLabelX = Number(tenthDateLabel.getAttribute("x"));
      const possibleTenthDateLabelText = tenthDateLabel.textContent;
      assertIsString(possibleTenthDateLabelText);
      tenthDateLabelText = possibleTenthDateLabelText;
      const tenthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[9];
      assertIsObject(tenthDateLine);
      tenthDateLineX = Number(tenthDateLine.getAttribute("x1"));
      const eleventDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[10];
      assertIsObject(eleventDateLabel);
      eleventhDateLabelX = Number(eleventDateLabel.getAttribute("x"));
      const possibleEleventDateLabelText = eleventDateLabel.textContent;
      assertIsString(possibleEleventDateLabelText);
      eleventhDateLabelText = possibleEleventDateLabelText;
      const eleventDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[10];
      assertIsObject(eleventDateLine);
      eleventhDateLineX = Number(eleventDateLine.getAttribute("x1"));
      const twelfthDateLabel = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup text"
      )[11];
      assertIsObject(twelfthDateLabel);
      twelfthDateLabelX = Number(twelfthDateLabel.getAttribute("x"));
      const possibleTwelfthDateLabelText = twelfthDateLabel.textContent;
      assertIsString(possibleTwelfthDateLabelText);
      twelfthDateLabelText = possibleTwelfthDateLabelText;
      const twelfthDateLine = dateLinesGroup.querySelectorAll(
        ".singleDateLineGroup line"
      )[11];
      assertIsObject(twelfthDateLine);
      twelfthDateLineX = Number(twelfthDateLine.getAttribute("x1"));
    });
    after(function () {
      sandbox.restore();
    });

    it("should have tried to scroll", function () {
      expect(scrollStub.called).to.be.true;
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
        it("should have red background for snail trail", function () {
          expect(unitASnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitASnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              unitA.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitABoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              unitA.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitACardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              unitA.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitBSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitBSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitB.apparentEndDate.getTime(),
              unitB.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitBBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitB.apparentEndDate.getTime(),
              unitB.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitBCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitB.apparentEndDate.getTime(),
              unitB.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitCSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitCSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              unitC.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitCBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              unitC.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitCCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              unitC.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitDSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitDSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitD.apparentEndDate.getTime(),
              unitD.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitDBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitD.apparentEndDate.getTime(),
              unitD.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitDCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitD.apparentEndDate.getTime(),
              unitD.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitESnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitESnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitE.apparentEndDate.getTime(),
              unitE.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitEBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitE.apparentEndDate.getTime(),
              unitE.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitECardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitE.apparentEndDate.getTime(),
              unitE.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitFSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitFSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitF.apparentEndDate.getTime(),
              unitF.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitFBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitF.apparentEndDate.getTime(),
              unitF.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitFCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitF.apparentEndDate.getTime(),
              unitF.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitGSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitGSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitG.apparentEndDate.getTime(),
              unitG.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitGBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitG.apparentEndDate.getTime(),
              unitG.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitGCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitG.apparentEndDate.getTime(),
              unitG.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitHSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitHSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitH.apparentEndDate.getTime(),
              unitH.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitHBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitH.apparentEndDate.getTime(),
              unitH.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitHCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitH.apparentEndDate.getTime(),
              unitH.apparentStartDate.getTime()
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
        it("should have red background for snail trail", function () {
          expect(unitISnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitISnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitI.apparentEndDate.getTime(),
              unitI.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitIBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitI.apparentEndDate.getTime(),
              unitI.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitICardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitI.apparentEndDate.getTime(),
              unitI.apparentStartDate.getTime()
            )
          );
        });
      });
      describe("J", function () {
        it("should have red background for snail trail", function () {
          expect(unitJSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitJSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitJ.apparentEndDate.getTime(),
              unitJ.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitJBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitJ.apparentEndDate.getTime(),
              unitJ.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitJCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitJ.apparentEndDate.getTime(),
              unitJ.apparentStartDate.getTime()
            )
          );
        });
      });
      describe("K", function () {
        it("should have red background for snail trail", function () {
          expect(unitKSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitKSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitK.apparentEndDate.getTime(),
              unitK.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitKBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitK.apparentEndDate.getTime(),
              unitK.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitKCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitK.apparentEndDate.getTime(),
              unitK.apparentStartDate.getTime()
            )
          );
        });
      });
      describe("L", function () {
        it("should have red background for snail trail", function () {
          expect(unitLSnailTrailStyles.backgroundColor).to.equal(
            snailTrailColor
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function () {
          expect(Number(unitLSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitL.apparentEndDate.getTime(),
              unitL.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have box width according to anticipated start date and apparent end date", function () {
          expect(Number(unitLBoxStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitL.apparentEndDate.getTime(),
              unitL.anticipatedStartDate.getTime()
            )
          );
        });
        it("should have card width according to apparent start date and apparent end date", function () {
          expect(Number(unitLCardStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitL.apparentEndDate.getTime(),
              unitL.apparentStartDate.getTime()
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
            x: getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitB.apparentStartDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitB.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForBA).to.deep.equal(expectedPoints);
      });
      it("should have path from D to C", function () {
        const expectedPoints = new ConnectedPoints(
          {
            x: getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitD.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitK.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitK.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitL.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitL.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitJ.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitJ.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitK.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitI.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitI.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitJ.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitJ.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitG.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitG.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitH.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitC.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitH.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitF.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitG.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitE.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitE.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitF.apparentStartDate.getTime(),
              earliestTimePoint
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
            x: getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitA.id]!.trackIndex) +
              trackHeight / 2,
          },
          {
            x: getPixelGapBetweenTimes(
              unitF.apparentStartDate.getTime(),
              earliestTimePoint
            ),
            y:
              getYOfTrackTop(initialState.units[unitF.id]!.trackIndex) +
              trackHeight / 2,
          }
        );
        expect(pathPointsForFA).to.deep.equal(expectedPoints);
      });
    });
    describe("Date Lines", function () {
      describe("Lines", function () {
        it("should have first date line in position according to date", function () {
          expect(firstDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFirstDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have first date line half a day's worth of width in from the left", function () {
          expect(firstDateLineX).to.equal(halfDayWidth);
        });
        it("should have second date line in position according to date", function () {
          expect(secondDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSecondDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have second date line to the right of the first date line", function () {
          expect(secondDateLineX).to.be.greaterThan(firstDateLineX);
        });
        it("should have third date line in position according to date", function () {
          expect(thirdDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfThirdDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have third date line to the right of the second date line", function () {
          expect(thirdDateLineX).to.be.greaterThan(secondDateLineX);
        });
        it("should have fourth date line in position according to date", function () {
          expect(fourthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFourthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fourth date line to the right of the third date line", function () {
          expect(fourthDateLineX).to.be.greaterThan(thirdDateLineX);
        });
        it("should have fifth date line in position according to date", function () {
          expect(fifthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFifthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fifth date line to the right of the fourth date line", function () {
          expect(fifthDateLineX).to.be.greaterThan(fourthDateLineX);
        });
        it("should have sixth date line in position according to date", function () {
          expect(sixthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSixthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have sixth date line to the right of the fifth date line", function () {
          expect(sixthDateLineX).to.be.greaterThan(fifthDateLineX);
        });
        it("should have seventh date line in position according to date", function () {
          expect(seventhDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSeventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have seventh date line to the right of the sixth date line", function () {
          expect(seventhDateLineX).to.be.greaterThan(sixthDateLineX);
        });
        it("should have eighth date line in position according to date", function () {
          expect(eighthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfEighthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eighth date line to the right of the seventh date line", function () {
          expect(eighthDateLineX).to.be.greaterThan(seventhDateLineX);
        });
        it("should have ninth date line in position according to date", function () {
          expect(ninthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfNinthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have ninth date line to the right of the eighth date line", function () {
          expect(ninthDateLineX).to.be.greaterThan(eighthDateLineX);
        });
        it("should have tenth date line in position according to date", function () {
          expect(tenthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfTenthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have tenth date line to the right of the ninth date line", function () {
          expect(tenthDateLineX).to.be.greaterThan(ninthDateLineX);
        });
        it("should have eleventh date line in position according to date", function () {
          expect(eleventhDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfEleventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eleventh date line to the right of the tenth date line", function () {
          expect(eleventhDateLineX).to.be.greaterThan(tenthDateLineX);
        });
        it("should have twelfth date line in position according to date", function () {
          expect(twelfthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfTwelfthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have twelfth date line to the right of the eleventh date line", function () {
          expect(twelfthDateLineX).to.be.greaterThan(eleventhDateLineX);
        });
        it("should have twelfth date line half a day's worth of width from the end of the SVG", function () {
          expect(twelfthDateLabelX + halfDayWidth).to.lessThanOrEqual(svgWidth);
        });
      });
      describe("Labels", function () {
        it("should have first date label with proper date text", function () {
          expect(firstDateLabelText).to.equal(
            startOfFirstDate.toLocaleDateString()
          );
        });
        it("should have first date label in position according to date", function () {
          expect(firstDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFirstDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have first date label half a day's worth of width in from the left", function () {
          expect(firstDateLabelX).to.equal(halfDayWidth);
        });
        it("should have second date label with proper date text", function () {
          expect(secondDateLabelText).to.equal(
            startOfSecondDate.toLocaleDateString()
          );
        });
        it("should have second date label in position according to date", function () {
          expect(secondDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSecondDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have second date label to the right of the first date label", function () {
          expect(secondDateLabelX).to.be.greaterThan(firstDateLabelX);
        });
        it("should have third date label with proper date text", function () {
          expect(thirdDateLabelText).to.equal(
            startOfThirdDate.toLocaleDateString()
          );
        });
        it("should have third date label in position according to date", function () {
          expect(thirdDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfThirdDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have third date label to the right of the second date label", function () {
          expect(thirdDateLabelX).to.be.greaterThan(secondDateLabelX);
        });
        it("should have fourth date label with proper date text", function () {
          expect(fourthDateLabelText).to.equal(
            startOfFourthDate.toLocaleDateString()
          );
        });
        it("should have fourth date label in position according to date", function () {
          expect(fourthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFourthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fourth date label to the right of the third date label", function () {
          expect(fourthDateLabelX).to.be.greaterThan(thirdDateLabelX);
        });
        it("should have fifth date label with proper date text", function () {
          expect(fifthDateLabelText).to.equal(
            startOfFifthDate.toLocaleDateString()
          );
        });
        it("should have fifth date label in position according to date", function () {
          expect(fifthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFifthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fifth date label to the right of the fourth date label", function () {
          expect(fifthDateLabelX).to.be.greaterThan(fourthDateLabelX);
        });
        it("should have sixth date label with proper date text", function () {
          expect(sixthDateLabelText).to.equal(
            startOfSixthDate.toLocaleDateString()
          );
        });
        it("should have sixth date label in position according to date", function () {
          expect(sixthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSixthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have sixth date label to the right of the fifth date label", function () {
          expect(sixthDateLabelX).to.be.greaterThan(fifthDateLabelX);
        });
        it("should have seventh date label with proper date text", function () {
          expect(seventhDateLabelText).to.equal(
            startOfSeventhDate.toLocaleDateString()
          );
        });
        it("should have seventh date label in position according to date", function () {
          expect(seventhDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSeventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have seventh date label to the right of the sixth date label", function () {
          expect(seventhDateLabelX).to.be.greaterThan(sixthDateLabelX);
        });
        it("should have eighth date label with proper date text", function () {
          expect(eighthDateLabelText).to.equal(
            startOfEighthDate.toLocaleDateString()
          );
        });
        it("should have eighth date label in position according to date", function () {
          expect(eighthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfEighthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eighth date label to the right of the seventh date label", function () {
          expect(eighthDateLabelX).to.be.greaterThan(seventhDateLabelX);
        });
        it("should have ninth date label with proper date text", function () {
          expect(ninthDateLabelText).to.equal(
            startOfNinthDate.toLocaleDateString()
          );
        });
        it("should have ninth date label in position according to date", function () {
          expect(ninthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfNinthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have ninth date label to the right of the eighth date label", function () {
          expect(ninthDateLabelX).to.be.greaterThan(eighthDateLabelX);
        });
        it("should have tenth date label with proper date text", function () {
          expect(tenthDateLabelText).to.equal(
            startOfTenthDate.toLocaleDateString()
          );
        });
        it("should have tenth date label in position according to date", function () {
          expect(tenthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfTenthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have tenth date label to the right of the ninth date label", function () {
          expect(tenthDateLabelX).to.be.greaterThan(ninthDateLabelX);
        });
        it("should have eleventh date label with proper date text", function () {
          expect(eleventhDateLabelText).to.equal(
            startOfEleventhDate.toLocaleDateString()
          );
        });
        it("should have eleventh date label in position according to date", function () {
          expect(eleventhDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfEleventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eleventh date label to the right of the tenth date label", function () {
          expect(eleventhDateLabelX).to.be.greaterThan(tenthDateLabelX);
        });
        it("should have twelfth date label with proper date text", function () {
          expect(twelfthDateLabelText).to.equal(
            startOfTwelfthDate.toLocaleDateString()
          );
        });
        it("should have twelfth date label in position according to date", function () {
          expect(twelfthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfTwelfthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have twelfth date label to the right of the eleventh date label", function () {
          expect(twelfthDateLabelX).to.be.greaterThan(eleventhDateLabelX);
        });
        it("should have twelfth date label half a day's worth of width from the end of the SVG", function () {
          expect(twelfthDateLabelX + halfDayWidth).to.lessThanOrEqual(svgWidth);
        });
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
      const unitA = new TaskUnit(now, [], firstDate, thirdDate, "A");
      const unitB = new TaskUnit(now, [unitA], secondDate, fourthDate, "B");
      const unitC = new TaskUnit(now, [], fifthDate, sixthDate, "C");
      const unitD = new TaskUnit(now, [unitC], seventhDate, eighthDate, "D");

      const unitE = new TaskUnit(now, [], firstDate, secondDate, "E");
      const unitF = new TaskUnit(
        now,
        [unitA, unitE],
        thirdDate,
        fourthDate,
        "F"
      );
      const unitG = new TaskUnit(now, [unitF], fifthDate, sixthDate, "G");
      const unitH = new TaskUnit(
        now,
        [unitC, unitG],
        seventhDate,
        eighthDate,
        "H"
      );
      const unitI = new TaskUnit(now, [], firstDate, secondDate, "I");
      const unitJ = new TaskUnit(
        now,
        [unitA, unitI],
        thirdDate,
        fourthDate,
        "J"
      );
      const unitK = new TaskUnit(now, [unitJ], fifthDate, sixthDate, "K");
      const unitL = new TaskUnit(
        now,
        [unitC, unitK],
        seventhDate,
        eighthDate,
        "L"
      );

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
