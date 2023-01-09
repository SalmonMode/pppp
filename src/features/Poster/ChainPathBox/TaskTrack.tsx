import { Box } from "@material-ui/core";
import { TaskUnit } from "../../../Relations";
import TaskUnitCard from "../TaskUnitCard/TaskUnitCard";

export default function TaskTrack({
  units,
  trackIndex,
  pathStartDate,
}: {
  units: TaskUnit[];
  trackIndex: number;
  pathStartDate: Date;
}) {
  const height = 40;

  return (
    <Box
      className={`taskTrack`}
      style={{
        height,
        position: "absolute",
        left: 0,
        top: trackIndex * height,
      }}
    >
      {units.map((unit, index) => {
        const adjustedX =
          (unit.initialStartDate.getTime() - pathStartDate.getTime()) / 20;
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
