import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import { theme } from "@service/app/theme";
import type { TaskUnitDetails } from "@typing/TaskUnit";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import getYOfTrackTop from "../getYOfTrackTop";
import TaskUnitSnailTrail from "./TaskUnitSnailTrail";

export default function SnailTrailTrack({
  units,
  trackIndex,
  pathStartDate,
}: {
  units: TaskUnitDetails[];
  trackIndex: number;
  pathStartDate: Date;
}): JSX.Element {
  return (
    <Box
      css={styles}
      className={"snailTrailTrack"}
      style={{
        top: getYOfTrackTop(trackIndex),
      }}
      data-testid={`snailTrailTrack-${trackIndex}`}
    >
      {units.map((unit: TaskUnitDetails, index: number): JSX.Element => {
        const adjustedX = getPixelGapBetweenTimes(
          unit.anticipatedStartTime,
          pathStartDate.getTime()
        );
        return (
          <TaskUnitSnailTrail
            key={index}
            unit={unit}
            position={{ x: adjustedX, y: 0 }}
          />
        );
      })}
    </Box>
  );
}

const styles = css({
  height: theme.trackHeight,
  left: 0,
  position: "absolute",
});
