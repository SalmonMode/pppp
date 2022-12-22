import { v4 as uuidv4 } from "uuid";

export default class TaskUnit {
  public readonly id: string;
  /**
   * The direct dependencies of this {@link TaskUnit}.
   */
  private _directDependencies: Set<TaskUnit>;
  private _presenceTime: number;
  constructor(
    parentUnits: TaskUnit[],
    public readonly initialStartDate: Date,
    public readonly endDate: Date
  ) {
    this.id = uuidv4();
    this._directDependencies = new Set<TaskUnit>(parentUnits);
    this._presenceTime =
      this.endDate.getTime() - this.initialStartDate.getTime();
  }
  /**
   * The direct dependencies of this {@link TaskUnit}.
   */
  get directDependencies(): Set<TaskUnit> {
    return this._directDependencies;
  }
  /**
   * All task units this unit depends on.
   */
  getAllDependencies(): Set<TaskUnit> {
    const deps = new Set<TaskUnit>(this.directDependencies);
    this.directDependencies.forEach((parentUnit) =>
      parentUnit.getAllDependencies().forEach((depUnit) => deps.add(depUnit))
    );
    return deps;
  }
  /**
   * The amount of "presence" this unit would have on a graph.
   *
   * "Presence":
   *
   * Every {@link TaskUnit} will need to be rendered on a graph more or less as a rectangle, with a "snail trail"
   * directly behind (if it's been delayed) it to show how much it has been delayed from its original start date. Each
   * unit must have a horizontal space available on the graph to be placed without overlapping the space needed for
   * other {@link TaskUnit}s.
   *
   * "Presence" is the horizontal space a {@link TaskUnit} would take up.
   */
  get presenceTime(): number {
    return this._presenceTime;
  }
  /**
   *  Check whether or not the passed unit is a dependency of this unit.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is dependent on the passed unit, false, if not
   */
  isDependentOn(unit: TaskUnit): boolean {
    return (
      this._directDependencies.has(unit) ||
      [...this._directDependencies].some((depUnit) =>
        depUnit.isDependentOn(unit)
      )
    );
  }
}
