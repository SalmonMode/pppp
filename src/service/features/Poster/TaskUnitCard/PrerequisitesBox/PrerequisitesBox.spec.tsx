import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { expect } from "chai";
import chroma from "chroma-js";
import { assertIsObject, assertIsString } from "primitive-predicates";
import { EventType } from "../../../../../types";
import { makeStore } from "../../../../app/store";
import { theme } from "../../../../app/theme";
import { renderWithProvider } from "../../../../Utility/TestRenderers";
import PrerequisitesBox from "./PrerequisitesBox";

describe("React Integration: Prerequisites Box", function (): void {
  describe("Not Started", function (): void {
    let styles: CSSStyleDeclaration;
    let classNames: string[];
    before(function (): void {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <PrerequisitesBox
          prerequisiteDetails={{ approved: false, id: "1234", parentUnits: [] }}
        />
      );
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
      } = renderWithProvider(
        <PrerequisitesBox
          prerequisiteDetails={{ approved: true, id: "1234", parentUnits: [] }}
        />
      );
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
  describe("Prerequisites Button Clicked, Missing Prerequisites, With Loading State", function (): void {
    let button: HTMLElement;
    beforeEach(function () {
      const {
        renderResult: { container },
      } = renderWithProvider(<PrerequisitesBox prerequisiteDetails={null} />);
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      button = screen.getByRole("button");
    });
    it("should throw Error when trying to click button", function () {
      expect(() => fireEvent.click(button)).to.throw(Error);
    });
  });
  describe("Prerequisites Button Clicked, Missing Prerequisites", function (): void {
    let tooltipText: string;
    beforeEach(async function () {
      const {
        renderResult: { container },
      } = renderWithProvider(<PrerequisitesBox prerequisiteDetails={null} />, {
        store: makeStore({
          taskUnits: {
            loading: false,
            units: {},
            metrics: {
              cumulativeDelays: {},
              cumulativeExtensions: {},
              estimatesCoefficient: 0,
              processTime: {},
            },
            unitTrackMap: [],
          },
        }),
      });
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      const tooltip = screen.getByRole("tooltip");
      const possibleTooltipText = tooltip.textContent;
      assertIsString(possibleTooltipText);
      tooltipText = possibleTooltipText;
    });
    it("should have undrafted tooltip text", function () {
      expect(tooltipText).to.equal(
        "The prerequisites for this iteration have not been drafted yet"
      );
    });
  });
  describe("Prerequisites Button Clicked, Pending Prerequisites, No Dependencies", function (): void {
    let tooltipText: string;
    beforeEach(async function () {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <PrerequisitesBox
          prerequisiteDetails={{ approved: false, id: "1234", parentUnits: [] }}
        />,
        {
          store: makeStore({
            taskUnits: {
              loading: false,
              units: {
                "1234": {
                  anticipatedEndTime: 5678,
                  anticipatedStartTime: 1234,
                  apparentEndTime: 5678,
                  apparentStartTime: 1234,
                  id: "1234",
                  name: "unit",
                  directDependencies: [],
                  explicitEventHistory: [],
                  projectedEventHistory: [
                    {
                      type: EventType.TaskIterationStarted,
                      time: 1234,
                      prerequisitesVersion: 0,
                    },
                    { type: EventType.ReviewedAndAccepted, time: 5678 },
                  ],
                  prerequisitesIterations: [
                    { id: "1234", approved: false, parentUnits: [] },
                  ],
                  trackIndex: 0,
                },
              },
              metrics: {
                cumulativeDelays: {},
                cumulativeExtensions: {},
                estimatesCoefficient: 0,
                processTime: {},
              },
              unitTrackMap: [],
            },
          }),
        }
      );
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      const button = await screen.findByRole("button");
      fireEvent.click(button);
      const tooltip = await screen.findByRole("tooltip");
      assertIsObject(tooltip);
      const possibleTooltipText = tooltip.textContent;
      assertIsString(possibleTooltipText);
      tooltipText = possibleTooltipText;
    });
    it("should have pending tooltip text", function () {
      expect(tooltipText).to.equal(
        "This task's prerequisites have not been signed off on" +
          "Dependencies:" +
          "N/A"
      );
    });
  });
  describe("Prerequisites Button Clicked, Approved Prerequisites, Two Dependencies", function (): void {
    let tooltipText: string;
    beforeEach(async function () {
      const {
        renderResult: { container },
      } = renderWithProvider(
        <PrerequisitesBox
          prerequisiteDetails={{
            approved: true,
            id: "1234",
            parentUnits: ["5678", "91011"],
          }}
        />,
        {
          store: makeStore({
            taskUnits: {
              loading: false,
              units: {
                "1234": {
                  anticipatedEndTime: 5678,
                  anticipatedStartTime: 1234,
                  apparentEndTime: 5678,
                  apparentStartTime: 1234,
                  id: "1234",
                  name: "unit",
                  directDependencies: [],
                  explicitEventHistory: [],
                  projectedEventHistory: [
                    {
                      type: EventType.TaskIterationStarted,
                      time: 1234,
                      prerequisitesVersion: 0,
                    },
                    { type: EventType.ReviewedAndAccepted, time: 5678 },
                  ],
                  prerequisitesIterations: [
                    { id: "1234", approved: true, parentUnits: [] },
                  ],
                  trackIndex: 0,
                },
                "5678": {
                  anticipatedEndTime: 1234,
                  anticipatedStartTime: 0,
                  apparentEndTime: 1234,
                  apparentStartTime: 0,
                  id: "5678",
                  name: "A Unit",
                  directDependencies: [],
                  explicitEventHistory: [],
                  projectedEventHistory: [
                    {
                      type: EventType.TaskIterationStarted,
                      time: 0,
                      prerequisitesVersion: 0,
                    },
                    { type: EventType.ReviewedAndAccepted, time: 1234 },
                  ],
                  prerequisitesIterations: [
                    { id: "1234", approved: true, parentUnits: [] },
                  ],
                  trackIndex: 0,
                },
                "91011": {
                  anticipatedEndTime: 1234,
                  anticipatedStartTime: 0,
                  apparentEndTime: 1234,
                  apparentStartTime: 0,
                  id: "91011",
                  name: "B Unit",
                  directDependencies: [],
                  explicitEventHistory: [],
                  projectedEventHistory: [
                    {
                      type: EventType.TaskIterationStarted,
                      time: 0,
                      prerequisitesVersion: 0,
                    },
                    { type: EventType.ReviewedAndAccepted, time: 1234 },
                  ],
                  prerequisitesIterations: [
                    { id: "1234", approved: false, parentUnits: [] },
                  ],
                  trackIndex: 0,
                },
              },
              metrics: {
                cumulativeDelays: {},
                cumulativeExtensions: {},
                estimatesCoefficient: 0,
                processTime: {},
              },
              unitTrackMap: [],
            },
          }),
        }
      );
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      const button = await screen.findByRole("button");
      fireEvent.click(button);
      const tooltip = await screen.findByRole("tooltip");
      assertIsObject(tooltip);
      const possibleTooltipText = tooltip.textContent;
      assertIsString(possibleTooltipText);
      tooltipText = possibleTooltipText;
    });
    it("should have pending tooltip text", function () {
      expect(tooltipText).to.equal(
        "This task's prerequisites have been signed off on" +
          "Dependencies:" +
          "A Unit" +
          "B Unit"
      );
    });
  });
  describe("Prerequisites Button Clicked, Close Tooltip", async function (): Promise<void> {
    beforeEach(async function () {
      const {
        renderResult: { container },
      } = renderWithProvider(<PrerequisitesBox prerequisiteDetails={null} />, {
        store: makeStore({
          taskUnits: {
            loading: false,
            units: {},
            metrics: {
              cumulativeDelays: {},
              cumulativeExtensions: {},
              estimatesCoefficient: 0,
              processTime: {},
            },
            unitTrackMap: [],
          },
        }),
      });
      const box = container.querySelector(".prerequisitesBox");
      assertIsObject(box);
      const button = screen.getByRole("button");
      fireEvent.click(button);
      const tooltip = screen.getByRole("tooltip");

      fireEvent.keyDown(container, {
        key: "Escape",
        code: "Escape",
        charCode: 27,
      });
      await waitForElementToBeRemoved(tooltip);
    });
    it("should not have tooltip", function () {
      expect(screen.queryByRole("tooltip")).to.be.null;
    });
  });
});
