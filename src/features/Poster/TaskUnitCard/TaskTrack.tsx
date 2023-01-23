import { Box } from "@material-ui/core";
import type { TaskUnitDetails } from "../../../types";
import {
  trackGapHeight,
  trackHeight,
  unitTaskTimeConversion,
} from "../../constants";
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
        const adjustedX =
          (unit.anticipatedStartTime - pathStartDate.getTime()) /
          unitTaskTimeConversion;
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
