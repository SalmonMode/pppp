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
