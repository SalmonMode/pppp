import { unitTaskTimeConversion } from "../../app/theme";

/**
 * Given two times (ms since epoch), find how wide the visual gap should be between them given the time conversion.
 *
 * @param laterTime The point in time that comes later than the earlier time
 * @param earlierTime The point in time that comes earlier than the later time
 * @returns the size of the gap between the two dates in pixels according to the time conversion.
 */
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
