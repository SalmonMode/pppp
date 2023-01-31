import { expect } from "chai";
import { sub } from "date-fns";
import { halfDayDuration } from "../constants";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";

const now = new Date();

describe("getPixelGapBetweenTimes", () => {
  describe("Half Day", () => {
    it("should be 86.4", async function () {
      const halfDayWidth = getPixelGapBetweenTimes(
        now.getTime() - sub(now, halfDayDuration).getTime(),
        0
      );
      expect(halfDayWidth).to.equal(86.4);
    });
  });
  describe("Full Day", () => {
    it("should be 172.8", async function () {
      const fullDayWidth = getPixelGapBetweenTimes(
        now.getTime() -
          sub(sub(now, halfDayDuration), halfDayDuration).getTime(),
        0
      );
      expect(fullDayWidth).to.equal(172.8);
    });
  });
});
