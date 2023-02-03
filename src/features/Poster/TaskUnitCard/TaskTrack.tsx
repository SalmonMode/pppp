import { css } from "@emotion/react";
import Box from "@mui/material/Box";
import { theme } from "../../../app/theme";
import type { TaskUnitDetails } from "../../../types";
import getPixelGapBetweenTimes from "../getPixelGapBetweenTimes";
import getYOfTrackTop from "../getYOfTrackTop";
import TaskUnitCard from "./TaskUnitCard";

export default function TaskTrack({
  units,
  trackIndex,
  pathStartDate,
}: {
  units: TaskUnitDetails[];
  trackIndex: number;
  pathStartDate: Date;
}) {
  return (
    <Box
      css={styles}
      className={"taskTrack"}
      data-testid={`taskTrack-${trackIndex}`}
      style={{ top: getYOfTrackTop(trackIndex) }}
    >
      {units.map((unit, index) => {
        const adjustedX = getPixelGapBetweenTimes(
          unit.anticipatedStartTime,
          pathStartDate.getTime()
        );
        return (
          <TaskUnitCard
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
