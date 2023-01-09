import { Box } from "@material-ui/core";
import GraphableChainPath from "../../../Graphing/GraphableChainPath";
import { Coordinate } from "../../../types";
import TaskTrack from "./TaskTrack";

export default function ChainPathBox({
  path,
  position,
}: {
  path: GraphableChainPath;
  position: Coordinate;
}) {
  const height = path.tracks.length * 40;
  const tracks = [...path.tracks];
  const pathStartDate = path.path.initialStartDate;
  return (
    <Box
      className={`path`}
      style={{
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
