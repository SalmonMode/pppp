export function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new TypeError("Value is not a number");
  }
}
