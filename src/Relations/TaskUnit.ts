import { v4 as uuidv4 } from "uuid";
import type { RelationshipMapping } from "../types";

export default class TaskUnit {
  public readonly id: string;
  /**
   * The direct dependencies of this {@link TaskUnit}.
   */
  private _providedDirectDependencies: TaskUnit[];
  private _directDependencies: Set<TaskUnit>;
  private _allDependencies: Set<TaskUnit>;
  private _attachmentMap: RelationshipMapping;
  private _attachmentToDependencies: number;
  private _presenceTime: number;
  constructor(
    parentUnits: TaskUnit[],
    public readonly initialStartDate: Date,
    public readonly endDate: Date,
    public readonly name: string = "unknown"
  ) {
    this.id = uuidv4();
    this._providedDirectDependencies = parentUnits;
    this._directDependencies = this._getTrueDirectDependencies();
    this._presenceTime =
      this.endDate.getTime() - this.initialStartDate.getTime();
    this._allDependencies = this._getAllDependencies();
    this._attachmentMap = this._buildAttachmentMap();
    this._attachmentToDependencies = this._calculateAttachmentToDependencies();
  }
  /**
   * Sometimes, provided dependencies may be redundant. This can occur if a provided direct dependency is provided by
   * another direct dependency. This function strips out those redundancies and returns a set of units without the
   * redundant ones.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ D ┗━━━┛E
   * ```
   *
   * `E` has a redundant dependency on `A`, because it is provided through either `B` or `D`.
   *
   * @returns a set of task units that aren't dependent on each other
   */
  private _getTrueDirectDependencies(): Set<TaskUnit> {
    const trueDirect = this._providedDirectDependencies.filter(
      (unit) =>
        !this._providedDirectDependencies.some((dep) => dep.isDependentOn(unit))
    );
    return new Set(trueDirect);
  }
  /**
   * The direct dependencies of this {@link TaskUnit}.
   *
   * Sometimes references to units can be provided redundantly. For example, if `A` depends on `B` and `C`, but `B` also
   * depends on `C`, then `A`'s dependency on C is implied my the transitive property. This property provides access to
   * only the direct dependencies that are not redundant in this way.
   */
  get directDependencies(): Set<TaskUnit> {
    return this._directDependencies;
  }
  /**
   * All task units this unit depends on.
   */
  private _getAllDependencies(): Set<TaskUnit> {
    const deps = new Set<TaskUnit>(this.directDependencies);
    this.directDependencies.forEach((parentUnit) =>
      parentUnit.getAllDependencies().forEach((depUnit) => deps.add(depUnit))
    );
    return deps;
  }
  /**
   * All task units this unit depends on.
   */
  getAllDependencies(): Set<TaskUnit> {
    return this._allDependencies;
  }
  /**
   * A map of the IDs of the units this unit is dependent on to the number of paths it has to those units.
   */
  get attachmentMap(): RelationshipMapping {
    return this._attachmentMap;
  }
  /**
   * Determine the numer of possible paths this unit can take to each of its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * `B` has 1 path to `D`, but none to `C`, even though `C` is dependent on it. Both `E` and `F` also have a single
   * path to `D`. However, because `F` has a path to `B`, `E, and `F`, the number of potential paths it has to `D` is
   * the sum of all its dependencies paths to it. In this case, it has 3 paths to `D`: `F->B->D`; `F->E->D`; and
   * `F->H->D`.
   *
   * In contrast to this, it has 2 paths to `A`: `F->B->A`; and `F->E->A`.
   *
   * Redundant paths can occur, for example, if `F` also had a direct dependency on `A`, like so:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ E ┗━━━┛F
   * ```
   *
   * These redundant paths should be ignored. So in this example, the only accepted paths to `A` from `F` would still
   * be: `F->B->A`; and `F->E->A`.
   */
  private _buildAttachmentMap(): RelationshipMapping {
    const mapping: RelationshipMapping = {};
    for (let dep of this.directDependencies) {
      // This must be the earliest point in the chain that this unit is a direct dependency, so there is only 1 path
      // to this unit from here.
      mapping[dep.id] = 1;
      // Additionally, any paths to its dependencies can be reached from here, so lets add its total paths to those
      // depencies to any other paths to them that we've seen from other dependencies.
      for (let [key, value] of Object.entries(dep.attachmentMap)) {
        // assign it to 0 if it's not already set
        mapping[key] ??= 0;
        mapping[key] += value;
      }
    }
    return mapping;
  }
  /**
   * The number of potential paths to a given unit following the chains of dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * `B` has 1 path to `D`, but none to `C`, even though `C` is dependent on it. Both `E` and `F` also have a single
   * path to `D`. However, because `F` has a path to `B`, `E, and `F`, the number of potential paths it has to `D` is
   * the sum of all its dependencies paths to it. In this case, it has 3 paths to `D`: `F->B->D`; `F->E->D`; and
   * `F->H->D`.
   *
   * In contrast to this, it has 2 paths to `A`: `F->B->A`; and `F->E->A`.
   *
   * Redundant paths can occur, for example, if `F` also had a direct dependency on `A`, like so:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ E ┗━━━┛F
   * ```
   *
   * These redundant paths should be ignored. So in this example, the only accepted paths to `A` from `F` would still
   * be: `F->B->A`; and `F->E->A`.
   *
   * @param unit The unit to get the number of paths to from this unit
   * @returns a number representing the number of potential paths to a given unit
   */
  getNumberOfPathsToDependency(unit: TaskUnit): number {
    const pathCount = this._attachmentMap[unit.id];
    if (pathCount === undefined) {
      // there must not be a path
      return 0;
    }
    return pathCount;
  }
  /**
   * The amount of paths this unit can go through its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B
   *                ╳       ╲
   *          ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *                ╳       ╱
   *          ┏━━━┓╱_╲┏━━━┓╱
   *         G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `F` has a total attachment of 7 to all of its dependents, because that's the number of paths it can take to the
   * ends of each of its available tails. Those paths are:
   *
   * 1. `F->B->A`
   * 2. `F->B->D`
   * 3. `F->E->A`
   * 4. `F->E->D`
   * 5. `F->E->G`
   * 6. `F->H->D`
   * 7. `F->H->G`
   */
  get attachmentToDependencies(): number {
    return this._attachmentToDependencies;
  }
  /**
   * Claculate the amount of paths this unit can go through its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B
   *                ╳       ╲
   *          ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *                ╳       ╱
   *          ┏━━━┓╱_╲┏━━━┓╱
   *         G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `F` has a total attachment of 7 to all of its dependents, because that's the number of paths it can take to the
   * ends of each of its available tails. Those paths are:
   *
   * 1. `F->B->A`
   * 2. `F->B->D`
   * 3. `F->E->A`
   * 4. `F->E->D`
   * 5. `F->E->G`
   * 6. `F->H->D`
   * 7. `F->H->G`
   *
   * Note: This is only used in the constructor to cache the value.
   *
   */
  private _calculateAttachmentToDependencies(): number {
    return [...this.directDependencies].reduce(
      (acc, dep) => acc + (dep.attachmentToDependencies || 1),
      0
    );
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
   * Check whether or not the passed unit is a dependency of this unit.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is dependent on the passed unit, false, if not
   */
  isDependentOn(unit: TaskUnit): boolean {
    return this._allDependencies.has(unit);
  }
}
