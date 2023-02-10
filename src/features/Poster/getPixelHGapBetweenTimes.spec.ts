import { expect } from "chai";
import { sub } from "date-fns";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";

const now = new Date();

describe("getPixelGapBetweenTimes", () => {
  describe("Half Day", () => {
    it("should be 86.4", async function (): Promise<void> {
      const halfDayWidth = getPixelGapBetweenTimes(
        now.getTime() - sub(now, { hours: 12 }).getTime(),
        0
      );
      expect(halfDayWidth).to.equal(86.4);
    });
  });
  describe("Full Day", () => {
    it("should be 172.8", async function (): Promise<void> {
      const fullDayWidth = getPixelGapBetweenTimes(
        now.getTime() - sub(sub(now, { hours: 12 }), { hours: 12 }).getTime(),
        0
      );
      expect(fullDayWidth).to.equal(172.8);
    });
  });
});
