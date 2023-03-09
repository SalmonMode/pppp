import type ITaskUnit from "@typing/ITaskUnit";

/**
 * A simple abstraction around a matrix of the unit relations to perform helpful operations.
 */
export default interface IUnitPathMatrix {
  /**
   * Get the current available head units, after adjusting for any units that may have already been used.
   *
   * @param isolatedUnits the units that have already been isolated, and thus can't be heads
   * @returns a list of the head units that no other units can reach without using any isolated units
   */
  getHeadUnitsWithoutIsolatedUnit(isolatedUnits: ITaskUnit[]): ITaskUnit[];
  /**
   * Given an index, find the unit matching it according to how the matrix manages the indexes.
   *
   * @throws {@link RangeError} when index is not associated with any units
   *
   * @param index the index of the unit to lookup
   */
  getUnitForMatrixIndex(index: number): ITaskUnit;

  /**
   * Get all units connected to the passed unit, whether it is a direct dependency of them, or they are of it.
   *
   * @param unit the unit to find the connected units of
   * @returns a set of units that have a connection to the passed unit
   */
  getUnitsConnectedToUnit(unit: ITaskUnit): Set<ITaskUnit>;
}
