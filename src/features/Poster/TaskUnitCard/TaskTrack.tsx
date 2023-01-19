import { Box } from "@material-ui/core";
import type { TaskUnitDetails } from "../../../types";
import { trackHeight, unitTaskTimeConversion } from "../../constants";
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
  const height = trackHeight;

  return (
    <Box
      className={`taskTrack`}
      style={{
        height,
        position: "absolute",
        left: 0,
        top: trackIndex * height,
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
