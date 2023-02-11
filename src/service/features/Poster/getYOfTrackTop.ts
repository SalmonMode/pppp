import { theme } from "../../../theme/theme";

export default function getYOfTrackTop(trackIndex: number): number {
  return (
    trackIndex * theme.trackHeight +
    trackIndex * theme.trackGapHeight +
    theme.svgDateTopPadding
  );
}
