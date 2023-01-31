import { unitTaskTimeConversion } from "../constants";

export default function getPixelGapBetweenTimes(
  laterTime: number,
  earlierTime: number
): number {
  /**
   * How far ahead of the earlier time the later time is in milliseconds. This will be divided by the time conversion
   * number to get the appropriate pixel count.
   */
  const timeAheadOfLeftBoundInMilliseconds = laterTime - earlierTime;
  return Math.round(
    timeAheadOfLeftBoundInMilliseconds / unitTaskTimeConversion
  );
}
