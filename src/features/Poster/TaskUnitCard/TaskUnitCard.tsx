import { Card, CardContent } from "@material-ui/core";
import { TaskUnit } from "../../../Relations";
import { Coordinate } from "../../../types";
import { trackHeight, unitTaskTimeConversion } from "../../constants";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnit;
  position: Coordinate;
}) {
  const width = unit.presenceTime / unitTaskTimeConversion;

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
