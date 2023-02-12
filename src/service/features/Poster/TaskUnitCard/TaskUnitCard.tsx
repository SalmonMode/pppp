import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { theme } from "../../../../theme/theme";
import { assertIsObject } from "primitive-predicates";
import {
  Coordinate,
  EventType,
  ReviewType,
  SerializableTaskEvent,
  TaskUnitDetails,
} from "../../../../types";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import { ExtensionTrailFixedSize } from "./ExtensionTrail";
import PrerequisitesBox from "./PrerequisitesBox";
import ReviewBox from "./ReviewBox";
import TaskBox from "./TaskBox";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}): EmotionJSX.Element {
  const cardWidth = getPixelGapBetweenTimes(
    unit.apparentEndTime,
    unit.apparentStartTime
  );
  const presenceWidth = getPixelGapBetweenTimes(
    unit.apparentEndTime,
    unit.anticipatedStartTime
  );
  const expectedDurationWidth = getPixelGapBetweenTimes(
    unit.anticipatedEndTime,
    unit.anticipatedStartTime
  );
  const firstEvent = unit.eventHistory[0];
  assertIsObject(firstEvent);
  return (
    <Box
      data-testid={`task-${unit.id}`}
      css={boxStyles}
      style={{ width: presenceWidth, left: position.x, top: position.y }}
    >
      <Card
        variant="outlined"
        className="taskUnit"
        css={cardStyles}
        style={{
          width: cardWidth,
          left: presenceWidth - cardWidth,
        }}
      >
        <CardContent css={cardContentStyles}>
          <div css={cardContentInnerStyles} className="cardContentDiv">
            {unit.eventHistory.map(
              (
                event: SerializableTaskEvent,
                index: number
              ): EmotionJSX.Element[] => {
                const nextEvent = unit.eventHistory[index + 1];
                const prevEvent = unit.eventHistory[index - 1];

                switch (event.type) {
                  case EventType.MinorRevisionComplete:
                  case EventType.ReviewedAndAccepted:
                  case EventType.ReviewedAndNeedsMinorRevision:
                  case EventType.ReviewedAndNeedsMajorRevision:
                  case EventType.ReviewedAndNeedsRebuild: {
                    assertIsObject(prevEvent);
                    const comps: JSX.Element[] = [];
                    if (prevEvent.type !== EventType.TaskIterationStarted) {
                      // Since the current event is a review or completion of a revision, the previous event could only be
                      // TaskIterationStarted, ReviewedAndNeedsMajorRevision, ReviewedAndNeedsMinorRevision. Since the
                      // previous event here is not TaskIterationStarted, that leaves either ReviewedAndNeedsMajorRevision
                      // or ReviewedAndNeedsMinorRevision. That means this is the only time we need to include the
                      // previous TaskBox (since there is no TaskIterationStarted event for these situations). We can also
                      // be sure that since the last event was some sort of review, we can be sure there must have been an
                      // earlier TaskBox already included in this card, so we don't need to label this one.
                      const adjustableExpectedDurationWidth =
                        expectedDurationWidth - theme.reviewBoxWidth;
                      const actualDurationWidth =
                        getPixelGapBetweenTimes(event.time, prevEvent.time) -
                        theme.reviewBoxWidth;
                      // Prereq width is only relevant if we need to compensate for the width of the prereq box. That
                      // only happens if it's the first iteration, or there was a rebuild. But both of these also would
                      // have an associated TaskIterationStarted event, which is why that switch case handles it and
                      // controls for the width of the prereq box.
                      const taskBox = (
                        <TaskBox
                          key={index - 0.5}
                          expectedDurationWidth={
                            adjustableExpectedDurationWidth
                          }
                          actualDurationWidth={actualDurationWidth}
                        />
                      );
                      comps.push(taskBox);
                    }
                    switch (event.type) {
                      case EventType.MinorRevisionComplete:
                      case EventType.ReviewedAndAccepted: {
                        comps.push(
                          <ReviewBox
                            key={index}
                            variant={
                              event.projected
                                ? ReviewType.Pending
                                : ReviewType.Accepted
                            }
                          />
                        );
                        break;
                      }
                      case EventType.ReviewedAndNeedsMajorRevision: {
                        comps.push(
                          <ReviewBox
                            key={index}
                            variant={ReviewType.NeedsMajorRevision}
                          />
                        );
                        break;
                      }
                      case EventType.ReviewedAndNeedsMinorRevision: {
                        comps.push(
                          <ReviewBox
                            key={index}
                            variant={ReviewType.NeedsMinorRevision}
                          />
                        );
                        break;
                      }
                      case EventType.ReviewedAndNeedsRebuild: {
                        comps.push(
                          <ReviewBox
                            key={index}
                            variant={ReviewType.NeedsRebuild}
                          />
                        );
                        // Since this is a ReviewedAndNeedsRebuild event, we can know that there must be events in the
                        // future (projected or otherwise). That's helpful, because we need to know when the next event
                        // supposedly starts to figure out how wide to make the extension trail that exists after the
                        // black review box and before the prereqs box. We also know that the next event must be
                        // TaskIterationStarted, which means we know that when that event is placed, the prereqs box will
                        // be handled by it.
                        assertIsObject(nextEvent);
                        const trailWidth = getPixelGapBetweenTimes(
                          nextEvent.time,
                          event.time
                        );
                        comps.push(
                          <ExtensionTrailFixedSize
                            key={index + 0.25}
                            width={trailWidth}
                          />
                        );
                        break;
                      }
                    }

                    return comps;
                  }
                  case EventType.TaskIterationStarted: {
                    // Must be following a rebuild
                    // next event must be a review, and prereqs must be provided
                    assertIsObject(nextEvent);
                    const adjustableExpectedDurationWidth =
                      expectedDurationWidth -
                      theme.prerequisitesBoxWidth -
                      theme.reviewBoxWidth;
                    const actualDurationWidth =
                      getPixelGapBetweenTimes(nextEvent.time, event.time) -
                      theme.prerequisitesBoxWidth -
                      theme.reviewBoxWidth;
                    const label = prevEvent ? undefined : unit.name;
                    return [
                      <PrerequisitesBox
                        key={index - 0.25}
                        started={!event.projected}
                      />,
                      <TaskBox
                        key={index}
                        expectedDurationWidth={adjustableExpectedDurationWidth}
                        actualDurationWidth={actualDurationWidth}
                        label={label}
                      />,
                    ];
                  }
                }
              }
            )}
          </div>
        </CardContent>
      </Card>
    </Box>
  );
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
