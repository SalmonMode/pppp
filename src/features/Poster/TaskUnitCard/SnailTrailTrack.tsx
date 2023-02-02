import { Box } from "@mui/material";
import type { TaskUnitDetails } from "../../../types";
import { trackHeight } from "../../constants";
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
}) {
  return (
    <Box
      className={`snailTrailTrack`}
      style={{
        height: trackHeight,
        position: "absolute",
        left: 0,
        top: getYOfTrackTop(trackIndex),
      }}
      data-testid={`snailTrailTrack-${trackIndex}`}
    >
      {units.map((unit, index) => {
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
