import { Card, CardContent } from "@material-ui/core";
import { TaskUnit } from "../../../Relations";
import { Coordinate } from "../../../types/ConnectedPoints";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnit;
  position: Coordinate;
}) {
  const width = unit.presenceTime / 20;

  return (
    <Card
      variant="outlined"
      className={`taskUnit`}
      style={{
        width,
        height: 40,
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      <CardContent>{unit.name}</CardContent>
    </Card>
  );
}
