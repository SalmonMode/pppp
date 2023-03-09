import { theme } from "@service/app/theme";

export default function getYOfTrackTop(trackIndex: number): number {
  return (
    trackIndex * theme.trackHeight +
    trackIndex * theme.trackGapHeight +
    theme.svgDateTopPadding
  );
}
