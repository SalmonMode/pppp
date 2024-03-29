import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import { theme } from "@service/app/theme";
import type { Coordinate } from "@typing/ConnectedPoints";
import type { TaskUnitDetails } from "@typing/TaskUnit";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";

export default function TaskUnitSnailTrail({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}): JSX.Element {
  const presenceWidth = getPixelGapBetweenTimes(
    unit.apparentEndTime,
    unit.anticipatedStartTime
  );
  return (
    <Box
      data-testid={`snailTrail-${unit.id}`}
      css={styles}
      style={{
        width: presenceWidth,
        left: position.x,
        top: position.y,
      }}
    ></Box>
  );
}

const styles = css({
  height: theme.trackHeight,
  position: "absolute",
  backgroundColor: theme.snailTrailColor,
  borderRadius: 5,
});
