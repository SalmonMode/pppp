import { trackHeight, trackGapHeight } from "../constants";

export default function getYOfTrackTop(trackIndex: number): number {
  return trackIndex * trackHeight + trackIndex * trackGapHeight;
}
