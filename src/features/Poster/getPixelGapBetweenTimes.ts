import { unitTaskTimeConversion } from "../../app/theme";

export default function getPixelGapBetweenTimes(
  laterTime: number,
  earlierTime: number
): number {
  /**
   * How far ahead of the earlier time the later time is in milliseconds. This will be divided by the time conversion
   * number to get the appropriate pixel count.
   */
  const timeAheadOfLeftBoundInMilliseconds = laterTime - earlierTime;
  return timeAheadOfLeftBoundInMilliseconds / unitTaskTimeConversion;
}
