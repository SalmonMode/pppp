import { Box } from "@material-ui/core";
import GraphableChainPath from "../../../Graphing/GraphableChainPath";
import { Coordinate } from "../../../types";
import { trackHeight, unitTaskTimeConversion } from "../../constants";
import ChainPathBox from "./ChainPathBox";

export default function PathTrack({
  paths,
  position,
}: {
  paths: GraphableChainPath[];
  position: Coordinate;
}) {
  const tallestPath = paths.reduce((prev, curr) =>
    prev.tracks.length > curr.tracks.length ? prev : curr
  );
  // Paths don't overlap, but may be out of order
  const earliestPath = paths.reduce((prev, curr) =>
    prev.path.initialStartDate < curr.path.initialStartDate ? prev : curr
  );
  const height = tallestPath.tracks.length * trackHeight;

  return (
    <Box
      className={`pathTrack`}
      style={{
        height,
        position: "absolute",
        left: position.x,
        top: position.y,
      }}
    >
      {paths.map((path, index) => {
        const adjustedX =
          (path.path.initialStartDate.getTime() -
            earliestPath.path.initialStartDate.getTime()) /
          unitTaskTimeConversion;
        return (
          <ChainPathBox
            key={index}
            path={path}
            position={{ x: adjustedX, y: 0 }}
          />
        );
      })}
    </Box>
  );
}
