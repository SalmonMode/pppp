import { screen } from "@testing-library/react";
import { expect } from "chai";
import chroma from "chroma-js";
import { add, startOfDay, sub } from "date-fns";
import { createSandbox, SinonSandbox, SinonStub } from "sinon";
import { theme } from "../../app/theme";
import ConnectedPoints from "../../../Graphing/ConnectedPoints";
import { TaskUnit, TaskUnitCluster } from "../../../Relations";
import { assertIsObject, assertIsString } from "primitive-predicates";
import { EventType } from "../../../types";
import { renderWithProvider } from "../../Utility/TestRenderers";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";
import getYOfTrackTop from "./getYOfTrackTop";
import Poster from "./Poster";
import type { TaskUnitsLoadingCompleteState } from "./taskUnitsSlice";
import { turnClusterIntoState } from "./turnClusterIntoState";

const now = new Date();

const halfDayWidth = getPixelGapBetweenTimes(
  now.getTime() - sub(now, { hours: 12 }).getTime(),
  0
);

describe("React Integration: Poster", function (): void {
  describe("Initial State", function (): void {
    let sandbox: SinonSandbox;
    beforeEach(function (): void {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      sandbox.stub(Element.prototype, "scrollIntoView");
      renderWithProvider(<Poster />);
    });
    afterEach(function (): void {
      sandbox.restore();
    });

    it('should say "loading..."', async function (): Promise<void> {
      const poster = await screen.findByTestId(`poster-loading`);
      expect(poster.textContent).to.equal("loading...");
    });
  });

  describe("Chaotic Tracks", function (): void {
    let sandbox: SinonSandbox;
    let scrollStub: SinonStub;
    let initialState: TaskUnitsLoadingCompleteState;
    let poster: HTMLElement;
    let tracks: NodeListOf<Element>;
    const firstDate = sub(now, { days: 9 });
    const secondDate = add(firstDate, { days: 1 });
    const thirdDate = add(secondDate, { days: 1 });
    const fourthDate = add(thirdDate, { days: 1 });
    const fifthDate = add(fourthDate, { days: 1 });
    const sixthDate = add(fifthDate, { days: 1 });
    const seventhDate = add(sixthDate, { days: 1 });
    const eighthDate = add(seventhDate, { days: 1 });
    const ninthDate = add(eighthDate, { days: 1 });
    const unitA = new TaskUnit({
      now,
      prerequisitesIterations: [{ id: "1234" }],
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "A",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "B",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234" }],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "C",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [
        { id: "1234", parentUnits: [unitC] },
        { id: "1234567", parentUnits: [unitC] },
      ],
      anticipatedStartDate: sixthDate,
      anticipatedEndDate: seventhDate,
      name: "D",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
          date: add(sixthDate, { hours: 4 }),
        },
        {
          type: EventType.ReviewedAndNeedsRebuild,
          date: add(seventhDate, { hours: 4 }),
        },
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 1,
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
      prerequisitesIterations: [{ id: "1234" }],
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "E",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "F",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
      anticipatedStartDate: fourthDate,
      anticipatedEndDate: fifthDate,
      name: "G",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "H",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234" }],
      anticipatedStartDate: firstDate,
      anticipatedEndDate: secondDate,
      name: "I",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
      anticipatedStartDate: secondDate,
      anticipatedEndDate: thirdDate,
      name: "J",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
      anticipatedStartDate: fourthDate,
      anticipatedEndDate: fifthDate,
      name: "K",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
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
      prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
      anticipatedStartDate: fifthDate,
      anticipatedEndDate: sixthDate,
      name: "L",
      eventHistory: [
        {
          type: EventType.TaskIterationStarted,
          prerequisitesVersion: 0,
          date: add(sixthDate, { hours: 4 }),
        },
      ],
    });

    let trackCount: number;
    let secondTrackText: string;
    let thirdTrackText: string;

    let unitASnailTrailStyles: CSSStyleDeclaration;
    let unitABoxStyles: CSSStyleDeclaration;

    let unitBSnailTrailStyles: CSSStyleDeclaration;
    let unitBBoxStyles: CSSStyleDeclaration;

    let unitCSnailTrailStyles: CSSStyleDeclaration;
    let unitCBoxStyles: CSSStyleDeclaration;

    let unitDSnailTrailStyles: CSSStyleDeclaration;
    let unitDBoxStyles: CSSStyleDeclaration;

    let unitESnailTrailStyles: CSSStyleDeclaration;
    let unitEBoxStyles: CSSStyleDeclaration;

    let unitFSnailTrailStyles: CSSStyleDeclaration;
    let unitFBoxStyles: CSSStyleDeclaration;

    let unitGSnailTrailStyles: CSSStyleDeclaration;
    let unitGBoxStyles: CSSStyleDeclaration;

    let unitHSnailTrailStyles: CSSStyleDeclaration;
    let unitHBoxStyles: CSSStyleDeclaration;

    let unitISnailTrailStyles: CSSStyleDeclaration;
    let unitIBoxStyles: CSSStyleDeclaration;

    let unitJSnailTrailStyles: CSSStyleDeclaration;
    let unitJBoxStyles: CSSStyleDeclaration;

    let unitKSnailTrailStyles: CSSStyleDeclaration;
    let unitKBoxStyles: CSSStyleDeclaration;

    let unitLSnailTrailStyles: CSSStyleDeclaration;
    let unitLBoxStyles: CSSStyleDeclaration;

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

    before(async function (): Promise<void> {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      scrollStub = sandbox.stub(Element.prototype, "scrollIntoView");

      const cluster = new TaskUnitCluster([unitB, unitD, unitH, unitL]);
      earliestStartTime = startOfDay(unitI.anticipatedStartDate).getTime();
      earliestTimePoint = sub(earliestStartTime, { hours: 12 }).getTime();

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
      const unitBSnailTrail = screen.getByTestId(`snailTrail-${unitB.id}`);
      unitBSnailTrailStyles = getComputedStyle(unitBSnailTrail);
      const unitBBox = screen.getByTestId(`task-${unitB.id}`);
      unitBBoxStyles = getComputedStyle(unitBBox);
      const unitBCard = unitBBox.querySelector(".taskUnit");
      assertIsObject(unitBCard);
      const unitCSnailTrail = screen.getByTestId(`snailTrail-${unitC.id}`);
      unitCSnailTrailStyles = getComputedStyle(unitCSnailTrail);
      const unitCBox = screen.getByTestId(`task-${unitC.id}`);
      unitCBoxStyles = getComputedStyle(unitCBox);
      const unitCCard = unitCBox.querySelector(".taskUnit");
      assertIsObject(unitCCard);
      const unitDSnailTrail = screen.getByTestId(`snailTrail-${unitD.id}`);
      unitDSnailTrailStyles = getComputedStyle(unitDSnailTrail);
      const unitDBox = screen.getByTestId(`task-${unitD.id}`);
      unitDBoxStyles = getComputedStyle(unitDBox);
      const unitDCard = unitDBox.querySelector(".taskUnit");
      assertIsObject(unitDCard);
      const unitESnailTrail = screen.getByTestId(`snailTrail-${unitE.id}`);
      unitESnailTrailStyles = getComputedStyle(unitESnailTrail);
      const unitEBox = screen.getByTestId(`task-${unitE.id}`);
      unitEBoxStyles = getComputedStyle(unitEBox);
      const unitECard = unitEBox.querySelector(".taskUnit");
      assertIsObject(unitECard);
      const unitFSnailTrail = screen.getByTestId(`snailTrail-${unitF.id}`);
      unitFSnailTrailStyles = getComputedStyle(unitFSnailTrail);
      const unitFBox = screen.getByTestId(`task-${unitF.id}`);
      unitFBoxStyles = getComputedStyle(unitFBox);
      const unitFCard = unitFBox.querySelector(".taskUnit");
      assertIsObject(unitFCard);
      const unitGSnailTrail = screen.getByTestId(`snailTrail-${unitG.id}`);
      unitGSnailTrailStyles = getComputedStyle(unitGSnailTrail);
      const unitGBox = screen.getByTestId(`task-${unitG.id}`);
      unitGBoxStyles = getComputedStyle(unitGBox);
      const unitGCard = unitGBox.querySelector(".taskUnit");
      assertIsObject(unitGCard);
      const unitHSnailTrail = screen.getByTestId(`snailTrail-${unitH.id}`);
      unitHSnailTrailStyles = getComputedStyle(unitHSnailTrail);
      const unitHBox = screen.getByTestId(`task-${unitH.id}`);
      unitHBoxStyles = getComputedStyle(unitHBox);
      const unitHCard = unitHBox.querySelector(".taskUnit");
      assertIsObject(unitHCard);
      const unitISnailTrail = screen.getByTestId(`snailTrail-${unitI.id}`);
      unitISnailTrailStyles = getComputedStyle(unitISnailTrail);
      const unitIBox = screen.getByTestId(`task-${unitI.id}`);
      unitIBoxStyles = getComputedStyle(unitIBox);
      const unitICard = unitIBox.querySelector(".taskUnit");
      assertIsObject(unitICard);
      const unitJSnailTrail = screen.getByTestId(`snailTrail-${unitJ.id}`);
      unitJSnailTrailStyles = getComputedStyle(unitJSnailTrail);
      const unitJBox = screen.getByTestId(`task-${unitJ.id}`);
      unitJBoxStyles = getComputedStyle(unitJBox);
      const unitJCard = unitJBox.querySelector(".taskUnit");
      assertIsObject(unitJCard);
      const unitKSnailTrail = screen.getByTestId(`snailTrail-${unitK.id}`);
      unitKSnailTrailStyles = getComputedStyle(unitKSnailTrail);
      const unitKBox = screen.getByTestId(`task-${unitK.id}`);
      unitKBoxStyles = getComputedStyle(unitKBox);
      const unitKCard = unitKBox.querySelector(".taskUnit");
      assertIsObject(unitKCard);
      const unitLSnailTrail = screen.getByTestId(`snailTrail-${unitL.id}`);
      unitLSnailTrailStyles = getComputedStyle(unitLSnailTrail);
      const unitLBox = screen.getByTestId(`task-${unitL.id}`);
      unitLBoxStyles = getComputedStyle(unitLBox);
      const unitLCard = unitLBox.querySelector(".taskUnit");
      assertIsObject(unitLCard);
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

      const svg = screen.getByTestId("posterSvg");
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
    after(function (): void {
      sandbox.restore();
    });

    it("should have tried to scroll", function (): void {
      expect(scrollStub.called).to.be.true;
    });
    it("should have 4 task tracks", function (): void {
      expect(trackCount).to.equal(4);
    });
    it("should have B-D on second track (index 1)", function (): void {
      expect([...secondTrackText]).to.have.members(["B", "D"]);
    });
    it("should have A-C on third track (index 2)", function (): void {
      expect([...thirdTrackText]).to.have.members(["A", "C"]);
    });

    describe("Boxes", function (): void {
      describe("A", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitASnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitASnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitA.apparentEndDate.getTime(),
              unitA.anticipatedStartDate.getTime()
            )
          );
        });
        it("should having box starting from the same horizontal point as box for E", function (): void {
          expect(Number(unitABoxStyles.left.slice(0, -2))).to.equal(
            Number(unitEBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for I", function (): void {
          expect(Number(unitABoxStyles.left.slice(0, -2))).to.equal(
            Number(unitIBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("B", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitBSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitBSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitB.apparentEndDate.getTime(),
              unitB.anticipatedStartDate.getTime()
            )
          );
        });
        it("should having box starting further to the right than box for A", function (): void {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitABoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for F", function (): void {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitFBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for J", function (): void {
          expect(Number(unitBBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitJBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("C", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitCSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitCSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitC.apparentEndDate.getTime(),
              unitC.anticipatedStartDate.getTime()
            )
          );
        });
        it("should having box starting further to the right than box for B", function (): void {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitBBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting further to the right than box for K", function (): void {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitKBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting further to the right than box for G", function (): void {
          expect(Number(unitCBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitGBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("D", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitDSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitDSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitD.apparentEndDate.getTime(),
              unitD.anticipatedStartDate.getTime()
            )
          );
        });
        it("should having box starting further to the right than box for C", function (): void {
          expect(Number(unitDBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitCBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for H", function (): void {
          expect(Number(unitDBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitHBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for L", function (): void {
          expect(Number(unitDBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitLBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("E", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitESnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitESnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitE.apparentEndDate.getTime(),
              unitE.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("F", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitFSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitFSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitF.apparentEndDate.getTime(),
              unitF.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("G", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitGSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitGSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitG.apparentEndDate.getTime(),
              unitG.anticipatedStartDate.getTime()
            )
          );
        });
        it("should having box starting further to the right than box for B", function (): void {
          expect(Number(unitGBoxStyles.left.slice(0, -2))).to.be.greaterThan(
            Number(unitBBoxStyles.left.slice(0, -2))
          );
        });
        it("should having box starting from the same horizontal point as box for K", function (): void {
          expect(Number(unitGBoxStyles.left.slice(0, -2))).to.equal(
            Number(unitKBoxStyles.left.slice(0, -2))
          );
        });
      });
      describe("H", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitHSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitHSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitH.apparentEndDate.getTime(),
              unitH.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("I", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitISnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitISnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitI.apparentEndDate.getTime(),
              unitI.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("J", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitJSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitJSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitJ.apparentEndDate.getTime(),
              unitJ.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("K", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitKSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitKSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitK.apparentEndDate.getTime(),
              unitK.anticipatedStartDate.getTime()
            )
          );
        });
      });
      describe("L", function (): void {
        it("should have red background for snail trail", function (): void {
          expect(chroma(unitLSnailTrailStyles.backgroundColor).hex()).to.equal(
            chroma(theme.snailTrailColor).hex()
          );
        });
        it("should have snail trail width according to anticipated start date and apparent end date", function (): void {
          expect(Number(unitLSnailTrailStyles.width.slice(0, -2))).to.equal(
            getPixelGapBetweenTimes(
              unitL.apparentEndDate.getTime(),
              unitL.anticipatedStartDate.getTime()
            )
          );
        });
      });
    });
    describe("Paths", function (): void {
      const pathDetails: {
        rightTask: TaskUnit;
        leftTask: TaskUnit;
      }[] = [
        { rightTask: unitB, leftTask: unitA },
        { rightTask: unitD, leftTask: unitC },
        { rightTask: unitL, leftTask: unitK },
        { rightTask: unitL, leftTask: unitC },
        { rightTask: unitK, leftTask: unitJ },
        { rightTask: unitJ, leftTask: unitI },
        { rightTask: unitJ, leftTask: unitA },
        { rightTask: unitH, leftTask: unitG },
        { rightTask: unitH, leftTask: unitC },
        { rightTask: unitG, leftTask: unitF },
        { rightTask: unitF, leftTask: unitE },
        { rightTask: unitF, leftTask: unitA },
      ];
      let processedPoints: ConnectedPoints[];
      before(function (): void {
        processedPoints = [
          pathPointsForBA,
          pathPointsForDC,
          pathPointsForLK,
          pathPointsForLC,
          pathPointsForKJ,
          pathPointsForJI,
          pathPointsForJA,
          pathPointsForHG,
          pathPointsForHC,
          pathPointsForGF,
          pathPointsForFE,
          pathPointsForFA,
        ];
      });
      for (const pd of pathDetails) {
        it(`should have path from ${pd.rightTask.name} to ${pd.leftTask.name}`, function (): void {
          const leftTaskDetails = initialState.units[pd.leftTask.id];
          assertIsObject(leftTaskDetails);
          const rightTaskDetails = initialState.units[pd.rightTask.id];
          assertIsObject(rightTaskDetails);
          const index = pathDetails.indexOf(pd);
          const actualConnectedPoints = processedPoints[index];
          assertIsObject(actualConnectedPoints);
          const expectedPoints = new ConnectedPoints(
            {
              x: getPixelGapBetweenTimes(
                pd.leftTask.apparentEndDate.getTime(),
                earliestTimePoint
              ),
              y:
                getYOfTrackTop(leftTaskDetails.trackIndex) +
                theme.trackHeight / 2,
            },
            {
              x: getPixelGapBetweenTimes(
                pd.rightTask.apparentStartDate.getTime(),
                earliestTimePoint
              ),
              y:
                getYOfTrackTop(rightTaskDetails.trackIndex) +
                theme.trackHeight / 2,
            }
          );
          expect(actualConnectedPoints).to.deep.equal(expectedPoints);
        });
      }
    });
    describe("Date Lines", function (): void {
      describe("Lines", function (): void {
        it("should have first date line in position according to date", function (): void {
          expect(firstDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFirstDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have first date line half a day's worth of width in from the left", function (): void {
          expect(firstDateLineX).to.equal(halfDayWidth);
        });
        it("should have second date line in position according to date", function (): void {
          expect(secondDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSecondDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have second date line to the right of the first date line", function (): void {
          expect(secondDateLineX).to.be.greaterThan(firstDateLineX);
        });
        it("should have third date line in position according to date", function (): void {
          expect(thirdDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfThirdDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have third date line to the right of the second date line", function (): void {
          expect(thirdDateLineX).to.be.greaterThan(secondDateLineX);
        });
        it("should have fourth date line in position according to date", function (): void {
          expect(fourthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFourthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fourth date line to the right of the third date line", function (): void {
          expect(fourthDateLineX).to.be.greaterThan(thirdDateLineX);
        });
        it("should have fifth date line in position according to date", function (): void {
          expect(fifthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfFifthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fifth date line to the right of the fourth date line", function (): void {
          expect(fifthDateLineX).to.be.greaterThan(fourthDateLineX);
        });
        it("should have sixth date line in position according to date", function (): void {
          expect(sixthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSixthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have sixth date line to the right of the fifth date line", function (): void {
          expect(sixthDateLineX).to.be.greaterThan(fifthDateLineX);
        });
        it("should have seventh date line in position according to date", function (): void {
          expect(seventhDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfSeventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have seventh date line to the right of the sixth date line", function (): void {
          expect(seventhDateLineX).to.be.greaterThan(sixthDateLineX);
        });
        it("should have eighth date line in position according to date", function (): void {
          expect(eighthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfEighthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eighth date line to the right of the seventh date line", function (): void {
          expect(eighthDateLineX).to.be.greaterThan(seventhDateLineX);
        });
        it("should have ninth date line in position according to date", function (): void {
          expect(ninthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfNinthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have ninth date line to the right of the eighth date line", function (): void {
          expect(ninthDateLineX).to.be.greaterThan(eighthDateLineX);
        });
        it("should have tenth date line in position according to date", function (): void {
          expect(tenthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfTenthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have tenth date line to the right of the ninth date line", function (): void {
          expect(tenthDateLineX).to.be.greaterThan(ninthDateLineX);
        });
        it("should have eleventh date line in position according to date", function (): void {
          expect(eleventhDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfEleventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eleventh date line to the right of the tenth date line", function (): void {
          expect(eleventhDateLineX).to.be.greaterThan(tenthDateLineX);
        });
        it("should have twelfth date line in position according to date", function (): void {
          expect(twelfthDateLineX).to.equal(
            getPixelGapBetweenTimes(
              startOfTwelfthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have twelfth date line to the right of the eleventh date line", function (): void {
          expect(twelfthDateLineX).to.be.greaterThan(eleventhDateLineX);
        });
        it("should have twelfth date line half a day's worth of width from the end of the SVG", function (): void {
          expect(twelfthDateLabelX + halfDayWidth).to.lessThanOrEqual(svgWidth);
        });
      });
      describe("Labels", function (): void {
        it("should have first date label with proper date text", function (): void {
          expect(firstDateLabelText).to.equal(
            startOfFirstDate.toLocaleDateString()
          );
        });
        it("should have first date label in position according to date", function (): void {
          expect(firstDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFirstDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have first date label half a day's worth of width in from the left", function (): void {
          expect(firstDateLabelX).to.equal(halfDayWidth);
        });
        it("should have second date label with proper date text", function (): void {
          expect(secondDateLabelText).to.equal(
            startOfSecondDate.toLocaleDateString()
          );
        });
        it("should have second date label in position according to date", function (): void {
          expect(secondDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSecondDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have second date label to the right of the first date label", function (): void {
          expect(secondDateLabelX).to.be.greaterThan(firstDateLabelX);
        });
        it("should have third date label with proper date text", function (): void {
          expect(thirdDateLabelText).to.equal(
            startOfThirdDate.toLocaleDateString()
          );
        });
        it("should have third date label in position according to date", function (): void {
          expect(thirdDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfThirdDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have third date label to the right of the second date label", function (): void {
          expect(thirdDateLabelX).to.be.greaterThan(secondDateLabelX);
        });
        it("should have fourth date label with proper date text", function (): void {
          expect(fourthDateLabelText).to.equal(
            startOfFourthDate.toLocaleDateString()
          );
        });
        it("should have fourth date label in position according to date", function (): void {
          expect(fourthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFourthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fourth date label to the right of the third date label", function (): void {
          expect(fourthDateLabelX).to.be.greaterThan(thirdDateLabelX);
        });
        it("should have fifth date label with proper date text", function (): void {
          expect(fifthDateLabelText).to.equal(
            startOfFifthDate.toLocaleDateString()
          );
        });
        it("should have fifth date label in position according to date", function (): void {
          expect(fifthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfFifthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have fifth date label to the right of the fourth date label", function (): void {
          expect(fifthDateLabelX).to.be.greaterThan(fourthDateLabelX);
        });
        it("should have sixth date label with proper date text", function (): void {
          expect(sixthDateLabelText).to.equal(
            startOfSixthDate.toLocaleDateString()
          );
        });
        it("should have sixth date label in position according to date", function (): void {
          expect(sixthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSixthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have sixth date label to the right of the fifth date label", function (): void {
          expect(sixthDateLabelX).to.be.greaterThan(fifthDateLabelX);
        });
        it("should have seventh date label with proper date text", function (): void {
          expect(seventhDateLabelText).to.equal(
            startOfSeventhDate.toLocaleDateString()
          );
        });
        it("should have seventh date label in position according to date", function (): void {
          expect(seventhDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfSeventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have seventh date label to the right of the sixth date label", function (): void {
          expect(seventhDateLabelX).to.be.greaterThan(sixthDateLabelX);
        });
        it("should have eighth date label with proper date text", function (): void {
          expect(eighthDateLabelText).to.equal(
            startOfEighthDate.toLocaleDateString()
          );
        });
        it("should have eighth date label in position according to date", function (): void {
          expect(eighthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfEighthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eighth date label to the right of the seventh date label", function (): void {
          expect(eighthDateLabelX).to.be.greaterThan(seventhDateLabelX);
        });
        it("should have ninth date label with proper date text", function (): void {
          expect(ninthDateLabelText).to.equal(
            startOfNinthDate.toLocaleDateString()
          );
        });
        it("should have ninth date label in position according to date", function (): void {
          expect(ninthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfNinthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have ninth date label to the right of the eighth date label", function (): void {
          expect(ninthDateLabelX).to.be.greaterThan(eighthDateLabelX);
        });
        it("should have tenth date label with proper date text", function (): void {
          expect(tenthDateLabelText).to.equal(
            startOfTenthDate.toLocaleDateString()
          );
        });
        it("should have tenth date label in position according to date", function (): void {
          expect(tenthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfTenthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have tenth date label to the right of the ninth date label", function (): void {
          expect(tenthDateLabelX).to.be.greaterThan(ninthDateLabelX);
        });
        it("should have eleventh date label with proper date text", function (): void {
          expect(eleventhDateLabelText).to.equal(
            startOfEleventhDate.toLocaleDateString()
          );
        });
        it("should have eleventh date label in position according to date", function (): void {
          expect(eleventhDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfEleventhDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have eleventh date label to the right of the tenth date label", function (): void {
          expect(eleventhDateLabelX).to.be.greaterThan(tenthDateLabelX);
        });
        it("should have twelfth date label with proper date text", function (): void {
          expect(twelfthDateLabelText).to.equal(
            startOfTwelfthDate.toLocaleDateString()
          );
        });
        it("should have twelfth date label in position according to date", function (): void {
          expect(twelfthDateLabelX).to.equal(
            getPixelGapBetweenTimes(
              startOfTwelfthDate.getTime(),
              earliestTimePoint
            )
          );
        });
        it("should have twelfth date label to the right of the eleventh date label", function (): void {
          expect(twelfthDateLabelX).to.be.greaterThan(eleventhDateLabelX);
        });
        it("should have twelfth date label half a day's worth of width from the end of the SVG", function (): void {
          expect(twelfthDateLabelX + halfDayWidth).to.lessThanOrEqual(svgWidth);
        });
      });
    });
  });
  describe("Reusing Tracks (Different Path Heights)", function (): void {
    let sandbox: SinonSandbox;
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

    before(async function (): Promise<void> {
      sandbox = createSandbox();
      Element.prototype.scrollIntoView = function (): void {
        // Purely exists because jsdom does not actually support this method so it cannot be stubbed without something
        // here.
        return;
      };
      sandbox.stub(Element.prototype, "scrollIntoView");
      const unitA = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: thirdDate,
        name: "A",
      });
      const unitB = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA] }],
        anticipatedStartDate: secondDate,
        anticipatedEndDate: fourthDate,
        name: "B",
      });
      const unitC = new TaskUnit({
        now,
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "C",
      });
      const unitD = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "D",
      });

      const unitE = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "E",
      });
      const unitF = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitE] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "F",
      });
      const unitG = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitF] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "G",
      });
      const unitH = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitG] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "H",
      });
      const unitI = new TaskUnit({
        now,
        anticipatedStartDate: firstDate,
        anticipatedEndDate: secondDate,
        name: "I",
      });
      const unitJ = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitA, unitI] }],
        anticipatedStartDate: thirdDate,
        anticipatedEndDate: fourthDate,
        name: "J",
      });
      const unitK = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitJ] }],
        anticipatedStartDate: fifthDate,
        anticipatedEndDate: sixthDate,
        name: "K",
      });
      const unitL = new TaskUnit({
        now,
        prerequisitesIterations: [{ id: "1234", parentUnits: [unitC, unitK] }],
        anticipatedStartDate: seventhDate,
        anticipatedEndDate: eighthDate,
        name: "L",
      });

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
    after(function (): void {
      sandbox.restore();
    });

    it("should have 4 task tracks", function (): void {
      expect(trackCount).to.equal(4);
    });
    it("should have B on second track (index 1)", function (): void {
      expect([...secondTrackText]).to.have.members(["B"]);
    });
    it("should have A-C-D on third track (index 2)", function (): void {
      expect([...thirdTrackText]).to.have.members(["A", "C", "D"]);
    });
  });
});
