import { Box, Card, CardContent } from "@material-ui/core";
import { assertIsObject } from "../../../typePredicates";
import {
  Coordinate,
  EventType,
  ReviewType,
  TaskUnitDetails,
} from "../../../types";
import {
  prerequisitesBoxWidth,
  reviewBoxWidth,
  snailTrailColor,
  trackHeight,
} from "../../constants";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import ExtensionTrailFixedSize from "./ExtensionTrailFixedSize";
import PrerequisitesBox from "./PrerequisitesBox";
import ReviewBox from "./ReviewBox";
import TaskBox from "./TaskBox";

export default function TaskUnitSnailTrail({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}) {
  let presenceWidth = getPixelGapBetweenTimes(
    unit.apparentEndTime,
    unit.anticipatedStartTime
  );
  return (
    <Box
      data-testid={`snailTrail-${unit.id}`}
      style={{
        width: presenceWidth,
        height: trackHeight,
        position: "absolute",
        left: position.x,
        top: position.y,
        backgroundColor: snailTrailColor,
        borderRadius: 5,
      }}
    ></Box>
  );
}
