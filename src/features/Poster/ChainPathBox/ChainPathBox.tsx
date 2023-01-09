import { Box } from "@material-ui/core";
import GraphableChainPath from "../../../Graphing/GraphableChainPath";
import { Coordinate } from "../../../types/ConnectedPoints";
import TaskTrack from "./TaskTrack";

export default function ChainPathBox({
  path,
  position,
  directionOfCenterOfMass,
}: {
  path: GraphableChainPath;
  position: Coordinate;
  /**
   * If 1, indicates we are starting above the central point of mass, and so tracks should be layered upward, with the
   * lower indexed tracks towards the bottom. If -1, indicates the opposite.
   */
  directionOfCenterOfMass: 1 | -1;
}) {
  const height = path.tracks.length * 40;
  const tracks = [...path.tracks];
  if (directionOfCenterOfMass === 1) {
    // we're above center of mass so reverse the track order
    tracks.reverse();
  }
  const pathStartDate = path.path.initialStartDate;
  return (
    <Box
      className={`path`}
      style={{
        // width,
        height,
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      {tracks.map((track, index) => {
        return (
          <TaskTrack
            key={index}
            units={track}
            pathStartDate={pathStartDate}
            trackIndex={index}
          />
        );
      })}
    </Box>
  );
}
