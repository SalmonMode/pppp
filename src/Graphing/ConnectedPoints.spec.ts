import { expect } from "chai";
import ConnectedPoints from "./ConnectedPoints";

describe("ConnectedPoints", function (): void {
  describe("Normal", function (): void {
    it("should produce cubic bezier curve string", function (): void {
      const points = new ConnectedPoints({ x: 0, y: 0 }, { x: 60, y: 80 });
      expect(points.getCubicBezierCurvePathShape()).to.equal(
        "M0,0 C25,0 -15,80 60,80"
      );
    });
  });
  describe("From Coords", function (): void {
    it("should produce expected points", function (): void {
      expect(ConnectedPoints.fromCurve("M1,1 C2,2 3,3 4,4")).to.deep.equal(
        new ConnectedPoints({ x: 1, y: 1 }, { x: 4, y: 4 })
      );
    });
  });
  describe("From Coords (Not Numbers", function (): void {
    it("should throw TypeError", function (): void {
      expect(() => ConnectedPoints.fromCurve("MA,1 C2,2 3,3 4,4")).to.throw(
        TypeError
      );
    });
  });
});
