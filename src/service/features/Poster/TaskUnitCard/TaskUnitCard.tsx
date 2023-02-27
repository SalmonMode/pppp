import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { assertIsObject } from "primitive-predicates";
import { theme } from "../../../app/theme";
import {
  Coordinate,
  EventType,
  IterationRelativePosition,
  ReviewType,
  SerializableTaskEvent,
  SerializableTaskPrerequisitesReference,
  SerializableTaskReviewEvent,
  TaskUnitDetails,
} from "../../../../types";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import ActiveTaskBox from "./ActiveTaskBox";
import { ExtensionTrailFixedSize } from "./ExtensionTrail";
import StaticTaskBox from "./StaticTaskBox";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}): EmotionJSX.Element {
  const explicitCardPieces = unit.explicitEventHistory.map(
    (event: SerializableTaskEvent, index: number): EmotionJSX.Element[] => {
      const nextEvent =
        unit.explicitEventHistory[index + 1] || unit.projectedEventHistory[0];
      const prevEvent = unit.explicitEventHistory[index - 1];
      const prevPrevEvent = unit.explicitEventHistory[index - 2];
      return getCardPieceForEvent({
        event,
        overallEventIndex: index,
        nextEvent,
        prevEvent,
        prevPrevEvent,
        unit,
        projected: false,
      });
    }
  );
  const projectedCardPieces = unit.projectedEventHistory.map(
    (event: SerializableTaskEvent, index: number): EmotionJSX.Element[] => {
      const nextEvent = unit.projectedEventHistory[index + 1];
      const prevEvent =
        unit.projectedEventHistory[index - 1] ||
        unit.explicitEventHistory[unit.explicitEventHistory.length - 1];
      const prevPrevEvent =
        unit.projectedEventHistory[index - 2] ||
        unit.explicitEventHistory[unit.explicitEventHistory.length - 2];
      return getCardPieceForEvent({
        event,
        overallEventIndex: index + unit.explicitEventHistory.length,
        nextEvent,
        prevEvent,
        prevPrevEvent,
        unit,
        projected: true,
      });
    }
  );
  const cardPieces: EmotionJSX.Element[][] = [
    ...explicitCardPieces,
    ...projectedCardPieces,
  ];
  return (
    <Box
      data-testid={`task-${unit.id}`}
      id={`task-${unit.id}`}
      css={boxStyles}
      style={{ left: position.x, top: position.y }}
    >
      <Card variant="outlined" className="taskUnit" css={cardStyles}>
        <CardContent css={cardContentStyles}>
          <div css={cardContentInnerStyles} className="cardContentDiv">
            {cardPieces}
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}

interface EventContext {
  /**
   * The details for this event.
   */
  event: SerializableTaskEvent;
  /**
   * The sequence number this event is across the entire interpolated event history. If it's the first projected event,
   * and there were 3 explicit events before it, the number would be 3, because it's zero-indexed and it's the fourth
   * event in the interpolated event history.
   */
  overallEventIndex: number;
  /**
   * Whether or not this event is part of the projected event history.
   */
  projected: boolean;
  /**
   * The event before the event before this one.
   */
  prevPrevEvent: SerializableTaskEvent | undefined;
  /**
   * The event before this one.
   */
  prevEvent: SerializableTaskEvent | undefined;
  /**
   * The event after this one.
   */
  nextEvent: SerializableTaskEvent | undefined;
  /**
   * The TaskUnitDetails for the unit.
   */
  unit: TaskUnitDetails;
}

function getCardPieceForEvent({
  event,
  overallEventIndex,
  projected,
  prevEvent,
  prevPrevEvent,
  nextEvent,
  unit,
}: EventContext): JSX.Element[] {
  switch (event.type) {
    // Everything is built by using the review events as reference points.
    case EventType.MinorRevisionComplete:
    case EventType.ReviewedAndAccepted:
    case EventType.ReviewedAndNeedsMinorRevision:
    case EventType.ReviewedAndNeedsMajorRevision:
    case EventType.ReviewedAndNeedsRebuild: {
      assertIsObject(prevEvent);
      const comps: JSX.Element[] = [];
      const taskBoxCreationDetails = getTaskBoxCreationDetails(
        unit,
        event,
        overallEventIndex,
        nextEvent,
        prevEvent,
        prevPrevEvent,
        projected
      );
      const taskBox = getTaskBox(taskBoxCreationDetails);
      comps.push(taskBox);
      if (event.type === EventType.ReviewedAndNeedsRebuild) {
        // Since this is a ReviewedAndNeedsRebuild event, we can know that there must be events in the
        // future (projected or otherwise). That's helpful, because we need to know when the next event
        // supposedly starts to figure out how wide to make the extension trail that exists after the
        // black review box and before the prereqs box. We also know that the next event must be
        // TaskIterationStarted, which means we know that when that event is placed, the prereqs box will
        // be handled by it.
        assertIsObject(nextEvent);
        const trailWidth = getPixelGapBetweenTimes(nextEvent.time, event.time);
        comps.push(
          <ExtensionTrailFixedSize
            key={overallEventIndex + 0.25}
            width={trailWidth}
          />
        );
      }

      return comps;
    }
    case EventType.TaskIterationStarted: {
      // Don't do anything here. The task iteration boxes are produced when handling the review events.
      return [];
    }
  }
}

interface BaseTaskBoxCreationDetails {
  overallEventIndex: number;
  expectedDurationWidth: number;
  actualDurationWidth: number;
  relativeIterationPosition: IterationRelativePosition;
  label?: string;
  /**
   * The prerequisites information to include for the task box. If undefined, it means no prerequisites box should be
   * included. If null, it means there should be one, but no prerequisites exist for it yet. If it's a
   * SerializableTaskPrerequisitesReference object, then the details of the prerequisites are available.
   */
  prereqs?: SerializableTaskPrerequisitesReference | null;
  /**
   * Discriminator. If true, is ActiveTaskBoxCreationDetails, if false, is StaticTaskBoxCreationDetails
   */
  isActive: boolean;
}
interface ActiveTaskBoxCreationDetails extends BaseTaskBoxCreationDetails {
  isActive: true;
}
interface StaticTaskBoxCreationDetails extends BaseTaskBoxCreationDetails {
  isActive: false;
  reviewVariant: ReviewType;
}
type TaskBoxCreationDetails =
  | ActiveTaskBoxCreationDetails
  | StaticTaskBoxCreationDetails;

/**
 * Get the creation details for the task box with a provided discriminator that distinguishes between whether it should
 * create an ActiveTaskBox or a StaticTaskBox.
 *
 * @param unit
 * @param event
 * @param overallEventIndex
 * @param nextEvent
 * @param prevEvent
 * @param prevPrevEvent
 * @param projected
 * @returns the creation details for the task box
 */
function getTaskBoxCreationDetails(
  unit: TaskUnitDetails,
  event: SerializableTaskReviewEvent,
  overallEventIndex: number,
  nextEvent: SerializableTaskEvent | undefined,
  prevEvent: SerializableTaskEvent,
  prevPrevEvent: SerializableTaskEvent | undefined,
  projected: boolean
): TaskBoxCreationDetails {
  /**
   * The prerequisites information to include for the task box. If undefined, it means no prerequisites box should be
   * included. If null, it means there should be one, but no prerequisites exist for it yet. If it's a
   * SerializableTaskPrerequisitesReference object, then the details of the prerequisites are available.
   */
  let prereqs: SerializableTaskPrerequisitesReference | null | undefined;
  if (prevEvent.type === EventType.TaskIterationStarted) {
    prereqs =
      unit.prerequisitesIterations[prevEvent.prerequisitesVersion] || null;
  } else {
    // prereqs should remain undefined because the prereq box doesn't need to be displayed.
  }
  const expectedDurationWidth = getPixelGapBetweenTimes(
    unit.anticipatedEndTime,
    unit.anticipatedStartTime
  );
  const actualDurationWidth = getPixelGapBetweenTimes(
    event.time,
    prevEvent.time
  );
  const relativeIterationPosition = getRelativeIterationPositionFromReviewEvent(
    prevPrevEvent,
    nextEvent
  );
  const label = prevPrevEvent ? undefined : unit.name;

  if (projected && unit.explicitEventHistory.includes(prevEvent)) {
    // is active
    const details: ActiveTaskBoxCreationDetails = {
      actualDurationWidth,
      expectedDurationWidth,
      prereqs,
      overallEventIndex,
      relativeIterationPosition,
      label,
      isActive: true,
    };
    return details;
  }
  // is static
  const reviewVariant = getReviewVariant(event.type, projected);
  const details: StaticTaskBoxCreationDetails = {
    actualDurationWidth,
    expectedDurationWidth,
    overallEventIndex,
    relativeIterationPosition,
    label,
    prereqs,
    reviewVariant,
    isActive: false,
  };
  return details;
}

/**
 * Using the provided TaskBoxCreationDetails (built using getTaskBoxCreationDetails), create and return the
 * ActiveTaskBox or StaticTaskBox.
 *
 * @param details
 * @returns the created ActiveTaskBox or StaticTaskBox
 */
function getTaskBox(details: TaskBoxCreationDetails): JSX.Element {
  if (details.isActive) {
    return (
      <ActiveTaskBox
        key={details.overallEventIndex}
        expectedDurationWidth={details.expectedDurationWidth}
        actualDurationWidth={details.actualDurationWidth}
        relativeIterationPosition={details.relativeIterationPosition}
        label={details.label}
        prereqs={details.prereqs}
      />
    );
  } else {
    return (
      <StaticTaskBox
        key={details.overallEventIndex}
        expectedDurationWidth={details.expectedDurationWidth}
        actualDurationWidth={details.actualDurationWidth}
        relativeIterationPosition={details.relativeIterationPosition}
        label={details.label}
        prereqs={details.prereqs}
        reviewVariant={details.reviewVariant}
      />
    );
  }
}

/**
 * Get the review variant for the review event.
 *
 * If the event is either a EventType.MinorRevisionComplete or EventType.ReviewedAndAccepted, then it is possible that
 * it's a projected event. If it's not projected, then it must be an accepted review variant. If it is projected, then
 * the pending review variant must be used.
 *
 * All other types are directly indicative of the variant that will be used.
 *
 * @param eventType the type of the review event
 * @param projected whether or not the event is projected
 * @returns the review variant
 */
function getReviewVariant(
  eventType: SerializableTaskReviewEvent["type"],
  projected: boolean
): ReviewType {
  switch (eventType) {
    case EventType.MinorRevisionComplete:
    case EventType.ReviewedAndAccepted: {
      return projected ? ReviewType.Pending : ReviewType.Accepted;
    }
    case EventType.ReviewedAndNeedsMajorRevision: {
      return ReviewType.NeedsMajorRevision;
    }
    case EventType.ReviewedAndNeedsMinorRevision: {
      return ReviewType.NeedsMinorRevision;
    }
    case EventType.ReviewedAndNeedsRebuild: {
      return ReviewType.NeedsRebuild;
    }
  }
}

/**
 * Get the relative position information.
 *
 * If the event two events prior to the review event is undefined, then it must be the first iteration. If not, then it
 * cannot be the first iteration.
 *
 * If the event just after the review event is undefined, then it must be the last iteration. If not, then it cannot be
 * the last iteration.
 *
 * Using this information we can determine the relative position information.
 *
 * @param eventBeforeTaskIteration The event that was two events prior to the review event
 * @param eventAfterReviewEvent The event just after the review event
 * @returns the relative position information for the task iteration
 */
function getRelativeIterationPositionFromReviewEvent(
  eventBeforeTaskIteration?: SerializableTaskEvent,
  eventAfterReviewEvent?: SerializableTaskEvent
): IterationRelativePosition {
  let relativeIterationPosition: IterationRelativePosition =
    IterationRelativePosition.OnlyKnownIteration;
  if (eventBeforeTaskIteration) {
    // This is not the first known iteration.
    relativeIterationPosition &= IterationRelativePosition.FirstKnownIteration;
  }
  if (eventAfterReviewEvent) {
    // This is not the last known iteration.
    relativeIterationPosition &= IterationRelativePosition.LastKnownIteration;
  }
  return relativeIterationPosition;
}

const boxStyles = css({
  height: theme.trackHeight,
  position: "absolute",
});
const cardStyles = css({
  height: theme.trackHeight,
  position: "absolute",
  boxSizing: "border-box",
  top: 0,
  borderWidth: theme.borderWidth,
});
const cardContentStyles = css({
  padding: 0,
  height: "100%",
});
const cardContentInnerStyles = css({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.taskCardBackgroundColor,
  height: "100%",
  alignItems: "center",
});
