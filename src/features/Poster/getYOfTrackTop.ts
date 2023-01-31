import { trackHeight, trackGapHeight, svgDateTopPadding } from "../constants";

export default function getYOfTrackTop(trackIndex: number): number {
  return (
    trackIndex * trackHeight + trackIndex * trackGapHeight + svgDateTopPadding
  );
}
