export interface Coordinate {
  x: number;
  y: number;
}

export interface CubicBezierCurve {
  startPoint: Coordinate;
  startControlPoint: Coordinate;
  endControlPoint: Coordinate;
  endPoint: Coordinate;
}

export type CoordinateString = `${number},${number}`;

export type CubicBezierCurveString =
  `M${CoordinateString} C${CoordinateString} ${CoordinateString} ${CoordinateString}`;
