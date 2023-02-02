import { Box } from "@material-ui/core";
import { Coordinate, TaskUnitDetails } from "../../../types";
import { snailTrailColor, trackHeight } from "../../constants";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";

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
