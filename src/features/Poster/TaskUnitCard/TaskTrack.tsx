import Box from "@mui/material/Box";
import type { TaskUnitDetails } from "../../../types";
import { trackHeight } from "../../constants";
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
      className={`taskTrack`}
      style={{
        height: trackHeight,
        position: "absolute",
        left: 0,
        top: getYOfTrackTop(trackIndex),
      }}
      data-testid={`taskTrack-${trackIndex}`}
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
