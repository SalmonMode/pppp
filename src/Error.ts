/**
 * This is thrown when a passing a list of sequential dependencies out of order, or when they are not dependencies.
 */
export class DependencyOrderError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, DependencyOrderError.prototype);
    this.name = new.target.name;
  }
}
