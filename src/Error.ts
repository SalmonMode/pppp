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
/**
 * This is thrown when the set of units are not entirely interconnected.
 */
export class DisjointedUnitsError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, DisjointedUnitsError.prototype);
    this.name = new.target.name;
  }
}
/**
 * This is thrown when the desired {@link TaskUnit} cannot be found.
 */
export class NoSuchTaskUnitError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, NoSuchTaskUnitError.prototype);
    this.name = new.target.name;
  }
}
/**
 * This is thrown when the desired {@link IsolatedDependencyChain} cannot be found.
 */
export class NoSuchChainError extends Error {
  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, NoSuchChainError.prototype);
    this.name = new.target.name;
  }
}
