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
  ReviewType,
  SerializableTaskEvent,
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
      style={{ left: position.x, top: position.y }}
    >
      <Card variant="outlined" className="taskUnit" css={cardStyles}>
        <CardContent css={cardContentStyles}>
          <div css={cardContentInnerStyles} className="cardContentDiv">
            {unit.eventHistory.map(
              (
                event: SerializableTaskEvent,
                index: number
              ): EmotionJSX.Element[] => {
                const nextEvent = unit.eventHistory[index + 1];
                const prevEvent = unit.eventHistory[index - 1];
                const prevPrevEvent = unit.eventHistory[index - 2];

                switch (event.type) {
                  case EventType.MinorRevisionComplete:
                  case EventType.ReviewedAndAccepted:
                  case EventType.ReviewedAndNeedsMinorRevision:
                  case EventType.ReviewedAndNeedsMajorRevision:
                  case EventType.ReviewedAndNeedsRebuild: {
                    assertIsObject(prevEvent);
                    const comps: JSX.Element[] = [];
                    const includePrereqs =
                      prevEvent.type === EventType.TaskIterationStarted;
                    let prereqsAccepted: undefined | boolean;
                    if (includePrereqs) {
                      prereqsAccepted = !prevEvent.projected;
                    }
                    let reviewVariant: ReviewType;
                    switch (event.type) {
                      case EventType.MinorRevisionComplete:
                      case EventType.ReviewedAndAccepted: {
                        reviewVariant = event.projected
                          ? ReviewType.Pending
                          : ReviewType.Accepted;
                        break;
                      }
                      case EventType.ReviewedAndNeedsMajorRevision: {
                        reviewVariant = ReviewType.NeedsMajorRevision;
                        break;
                      }
                      case EventType.ReviewedAndNeedsMinorRevision: {
                        reviewVariant = ReviewType.NeedsMinorRevision;
                        break;
                      }
                      case EventType.ReviewedAndNeedsRebuild: {
                        reviewVariant = ReviewType.NeedsRebuild;
                        break;
                      }
                    }
                    const adjustableExpectedDurationWidth =
                      expectedDurationWidth;
                    const actualDurationWidth = getPixelGapBetweenTimes(
                      event.time,
                      prevEvent.time
                    );
                    const label = prevPrevEvent ? undefined : unit.name;
                    if (event.projected && !prevEvent.projected) {
                      comps.push(
                        <ActiveTaskBox
                          key={index}
                          expectedDurationWidth={
                            adjustableExpectedDurationWidth
                          }
                          actualDurationWidth={actualDurationWidth}
                          label={label}
                          includePrereqs={includePrereqs}
                        />
                      );
                    } else {
                      comps.push(
                        <StaticTaskBox
                          key={index}
                          expectedDurationWidth={
                            adjustableExpectedDurationWidth
                          }
                          actualDurationWidth={actualDurationWidth}
                          label={label}
                          prereqsAccepted={prereqsAccepted}
                          reviewVariant={reviewVariant}
                        />
                      );
                    }
                    if (event.type === EventType.ReviewedAndNeedsRebuild) {
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
                    }

                    return comps;
                  }
                  case EventType.TaskIterationStarted: {
                    return [];
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
