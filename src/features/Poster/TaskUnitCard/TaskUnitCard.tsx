import { Box, Card, CardContent } from "@material-ui/core";
import type { Coordinate, TaskUnitDetails } from "../../../types";
import {
  snailTrailColor,
  trackHeight,
  unitTaskTimeConversion,
} from "../../constants";

export default function TaskUnitCard({
  unit,
  position,
}: {
  unit: TaskUnitDetails;
  position: Coordinate;
}) {
  const cardWidth =
    (unit.apparentEndTime - unit.apparentStartTime) / unitTaskTimeConversion;
  const presenceWidth =
    (unit.apparentEndTime - unit.anticipatedStartTime) / unitTaskTimeConversion;

  return (
    <Box
      data-testid={`task-${unit.id}`}
      style={{
        width: presenceWidth,
        height: trackHeight,
        position: "absolute",
        left: position.x,
        top: position.y,
        backgroundColor: presenceWidth === cardWidth ? "none" : snailTrailColor,
      }}
    >
      <Card
        variant="outlined"
        className={`taskUnit`}
        style={{
          zIndex: 20,
          width: cardWidth,
          height: trackHeight,
          position: "absolute",
          left: presenceWidth - cardWidth,
          top: 0,
        }}
      >
        <CardContent>{unit.name}</CardContent>
      </Card>
    </Box>
  );
}
