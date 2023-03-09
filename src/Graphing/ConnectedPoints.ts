import { assertIsNumber, assertIsString } from "primitive-predicates";
import type {
  Coordinate,
  CoordinateString,
  CubicBezierCurve,
  CubicBezierCurveString,
} from "@types";

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
   * Take a string representing a cubic bezier curve, and return a ConnectedPoints instance representing the two points
   * it refers to.
   *
   * Note: this is only used in testing.
   *
   * @param curve the curve string as seen in the `d` attribute of a `path` tag
   * @returns ConnectedPoints instance
   */
  static fromCurve(curve: string): ConnectedPoints {
    const [startPointString, , , endPointString] = curve.split(" ");
    assertIsString(startPointString);
    assertIsString(endPointString);
    const [startPointXString, startPointYString] = startPointString
      .replace("M", "")
      .split(",");
    const [endPointXString, endPointYString] = endPointString.split(",");
    let coords: number[];
    const [startPointX, startPointY, endPointX, endPointY] = (coords = [
      Number(startPointXString),
      Number(startPointYString),
      Number(endPointXString),
      Number(endPointYString),
    ]);
    assertIsNumber(startPointX);
    assertIsNumber(startPointY);
    assertIsNumber(endPointX);
    assertIsNumber(endPointY);
    for (const num of [startPointX, startPointY, endPointX, endPointY]) {
      if (Number.isNaN(num)) {
        throw TypeError(
          `Coordinates found were: ${coords.join(
            ", "
          )}. All must be real numbers.`
        );
      }
    }
    const startPoint: Coordinate = {
      x: startPointX,
      y: startPointY,
    };
    const endPoint: Coordinate = {
      x: endPointX,
      y: endPointY,
    };
    return new ConnectedPoints(startPoint, endPoint);
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
  getCubicBezierCurvePathShape(): CubicBezierCurveString {
    const curve = this.getCubicBezierPathBetweenPoints();
    const startPoint: CoordinateString = `${curve.startPoint.x},${curve.startPoint.y}`;
    const startControlPoint: CoordinateString = `${curve.startControlPoint.x},${curve.startControlPoint.y}`;
    const endControlPoint: CoordinateString = `${curve.endControlPoint.x},${curve.endControlPoint.y}`;
    const endPoint: CoordinateString = `${curve.endPoint.x},${curve.endPoint.y}`;
    return `M${startPoint} C${startControlPoint} ${endControlPoint} ${endPoint}`;
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
