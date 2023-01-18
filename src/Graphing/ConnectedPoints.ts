import type { Coordinate, CubicBezierCurve } from "../types";

export default class ConnectedPoints {
  /**
   * The cached value of the distance between the two points. Stored privately to prevent modification, and cached to
   * avoid having to calculate it multiple times as the bezier curve is determined.
   */
  private _distance: number;
  constructor(
    public readonly startPoint: Coordinate,
    public readonly endPoint: Coordinate
  ) {
    this._distance = this.calculateDistanceBetweenPoints();
  }
  /**
   * The distance between the two points.
   */
  get distance(): number {
    return this._distance;
  }
  private calculateDistanceBetweenPoints(): number {
    const xDistance: number = this.endPoint.x - this.startPoint.x;
    const xDistanceSquared: number = Math.pow(xDistance, 2);
    const yDistance: number = this.endPoint.y - this.startPoint.y;
    const yDistanceSquared: number = Math.pow(yDistance, 2);
    return Math.sqrt(xDistanceSquared + yDistanceSquared);
  }
  /**
   * Find the control point for the start point of the path to form a cubic bezier curve.
   *
   * The control point is placed laterally from the end point.
   *
   * @returns coordinate of the end control point
   */
  private _getCubicBezierCurveStartControlPoint(): Coordinate {
    return {
      x: this.startPoint.x + this.distance * 0.25,
      y: this.startPoint.y,
    };
  }
  /**
   * Find the control point for the end point of the path to form a cubic bezier curve.
   *
   * The control point is placed laterally from the end point.
   *
   * @returns coordinate of the end control point
   */
  private _getCubicBezierCurveEndControlPoint(): Coordinate {
    return {
      x: this.endPoint.x - this.distance * 0.75,
      y: this.endPoint.y,
    };
  }
  getCubicBezierPathBetweenPoints(): CubicBezierCurve {
    return {
      startPoint: this.startPoint,
      startControlPoint: this._getCubicBezierCurveStartControlPoint(),
      endControlPoint: this._getCubicBezierCurveEndControlPoint(),
      endPoint: this.endPoint,
    };
  }
}
export {};
