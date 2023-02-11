import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Box from "@mui/material/Box";
import { theme } from "../../../../theme/theme";
import type { TaskUnitDetails } from "../../../../types";
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
}): EmotionJSX.Element {
  return (
    <Box
      css={styles}
      className={"snailTrailTrack"}
      style={{
        top: getYOfTrackTop(trackIndex),
      }}
      data-testid={`snailTrailTrack-${trackIndex}`}
    >
      {units.map((unit: TaskUnitDetails, index: number): EmotionJSX.Element => {
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
