import { Box, Card, CardContent } from "@material-ui/core";
import { assertIsObject } from "../../../typePredicates";
import {
  Coordinate,
  EventType,
  ReviewType,
  TaskUnitDetails,
} from "../../../types";
import {
  borderSize,
  prerequisitesBoxWidth,
  reviewBoxWidth,
  snailTrailColor,
  trackHeight,
  unitTaskTimeConversion,
} from "../../constants";
import ExtensionTrailFixedSize from "./ExtensionTrailFixedSize";
import PrerequisitesBox from "./PrerequisitesBox";
import ReviewBox from "./ReviewBox";
import TaskBox from "./TaskBox";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}) {
  let cardWidth = Math.round(
    (unit.apparentEndTime - unit.apparentStartTime) / unitTaskTimeConversion
  );
  // Compensate for the border pixels to make sure adjacent tasks don't overlap
  cardWidth -= borderSize * 2;
  let presenceWidth = Math.round(
    (unit.apparentEndTime - unit.anticipatedStartTime) / unitTaskTimeConversion
  );
  // Compensate for the border pixels to make sure adjacent tasks don't overlap
  presenceWidth -= borderSize * 2;
  // Compensate for the border pixels to make sure the card lines up with the background of the box
  const cardHeight = trackHeight - borderSize * 2;
  const expectedDurationOfFirst =
    unit.anticipatedEndTime - unit.anticipatedStartTime;
  const firstEvent = unit.eventHistory[0];
  assertIsObject(firstEvent);
  return (
    <Box
      data-testid={`task-${unit.id}`}
      style={{
        width: presenceWidth,
        height: trackHeight,
        position: "absolute",
        left: position.x,
        top: position.y,
        backgroundColor: presenceWidth === cardWidth ? "none" : snailTrailColor,
        borderRadius: 4,
      }}
    >
      <Card
        variant="outlined"
        className={`taskUnit`}
        style={{
          zIndex: 20,
          width: cardWidth,
          height: cardHeight,
          position: "absolute",
          left: presenceWidth - cardWidth,
          top: 0,
        }}
      >
        <CardContent style={{ padding: 0, height: "100%" }}>
          <div
            className="cardContentDiv"
            style={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: "lightblue",
              height: "100%",
              alignItems: "center",
            }}
          >
            {unit.eventHistory.map((event, index) => {
              const nextEvent = unit.eventHistory[index + 1];
              const prevEvent = unit.eventHistory[index - 1];

              switch (event.type) {
                case EventType.ReviewedAndAccepted:
                case EventType.ReviewedAndNeedsMinorRevision:
                case EventType.ReviewedAndNeedsMajorRevision:
                case EventType.ReviewedAndNeedsRebuild:
                case EventType.MinorRevisionComplete:
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
                    var actualDuration = event.time - prevEvent.time;
                    var expectedDurationWidth = Math.round(
                      expectedDurationOfFirst / unitTaskTimeConversion
                    );
                    var actualDurationWidth = Math.round(
                      actualDuration / unitTaskTimeConversion
                    );
                    if (index === unit.eventHistory.length - 1) {
                      // last box, so we need to compensate for the border pixels to make sure adjacent tasks don't
                      // overlap. It's impossible to reach here if this is the review for the first TaskIterationStarted
                      // so we don't need to compensate for the left border width. That will be taken care of for the
                      // first TaskIterationStarted event.
                      actualDurationWidth -= borderSize;
                      expectedDurationWidth -= borderSize;
                    }
                    if (event.type !== EventType.MinorRevisionComplete) {
                      // The only times the review box is not included is if it's a minor revision.
                      actualDurationWidth -= reviewBoxWidth;
                      expectedDurationWidth -= reviewBoxWidth;
                      // Prereq width is only relevant if we need to compensate for the width of the prereq box. That
                      // only happens if it's the first iteration, or there was a rebuild. But both of these also would
                      // have an associated TaskIterationStarted event, which is why that switch case handles it and
                      // controls for the width of the prereq box.
                    }
                    const taskBox = (
                      <TaskBox
                        key={index - 0.5}
                        expectedDurationWidth={expectedDurationWidth}
                        actualDurationWidth={actualDurationWidth}
                      />
                    );
                    comps.push(taskBox);
                  }
                  switch (event.type) {
                    case EventType.ReviewedAndAccepted:
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
                    case EventType.ReviewedAndNeedsMajorRevision:
                      comps.push(
                        <ReviewBox
                          key={index}
                          variant={ReviewType.NeedsMajorRevision}
                        />
                      );
                      break;
                    case EventType.ReviewedAndNeedsMinorRevision:
                      comps.push(
                        <ReviewBox
                          key={index}
                          variant={ReviewType.NeedsMinorRevision}
                        />
                      );
                      break;
                    case EventType.ReviewedAndNeedsRebuild:
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
                      var trailWidth = Math.round(
                        (nextEvent.time - event.time) / unitTaskTimeConversion
                      );
                      comps.push(
                        <ExtensionTrailFixedSize
                          key={index + 0.25}
                          width={trailWidth}
                        />
                      );
                      break;
                  }

                  return comps;
                case EventType.TaskIterationStarted:
                  // Must be following a rebuild
                  // next event must be a review, and prereqs must be provided
                  assertIsObject(nextEvent);
                  var actualDuration = nextEvent.time - event.time;
                  var expectedDurationWidth =
                    Math.round(
                      expectedDurationOfFirst / unitTaskTimeConversion
                    ) -
                    prerequisitesBoxWidth -
                    reviewBoxWidth;
                  var actualDurationWidth =
                    Math.round(actualDuration / unitTaskTimeConversion) -
                    prerequisitesBoxWidth -
                    reviewBoxWidth;
                  if (index === 0) {
                    // First box, so we need to compensate for the border pixels to make sure adjacent tasks don't
                    // overlap
                    actualDurationWidth -= borderSize;
                    expectedDurationWidth -= borderSize;
                  }
                  if (index === unit.eventHistory.length - 2) {
                    // last box, so we need to compensate for the border pixels to make sure adjacent tasks don't
                    // overlap.
                    actualDurationWidth -= borderSize;
                    expectedDurationWidth -= borderSize;
                  }
                  var label = prevEvent ? undefined : unit.name;
                  return [
                    <PrerequisitesBox
                      key={index - 0.25}
                      started={!event.projected}
                    />,
                    <TaskBox
                      key={index}
                      expectedDurationWidth={expectedDurationWidth}
                      actualDurationWidth={actualDurationWidth}
                      label={label}
                    />,
                  ];
              }
            })}
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
