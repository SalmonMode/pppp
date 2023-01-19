import { Card, CardContent } from "@material-ui/core";
import type { Coordinate, TaskUnitDetails } from "../../../types";
import { trackHeight, unitTaskTimeConversion } from "../../constants";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}) {
  const width =
    (unit.anticipatedEndTime - unit.anticipatedStartTime) /
    unitTaskTimeConversion;

  return (
    <Card
      variant="outlined"
      className={`taskUnit`}
      style={{
        width,
        height: trackHeight,
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <CardContent>{unit.name}</CardContent>
    </Card>
  );
}
