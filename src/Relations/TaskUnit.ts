import { v4 as uuidv4 } from "uuid";
import { RelationshipMapping } from "../types";
import IsolatedDependencyChain from "./IsolatedDependencyChain";

export default class TaskUnit {
  public readonly id: string;
  /**
   * The direct dependencies of this {@link TaskUnit}.
   */
  private _directDependencies: Set<TaskUnit>;
  private _allDependencies: Set<TaskUnit>;
  private _attachmentMap: RelationshipMapping;
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
    this._allDependencies = this._getAllDependencies();
    this._attachmentMap = this._buildAttachmentMap();
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
    for (let dep of this.getAllDependencies()) {
      if (this.isInirectlyDependentOn(dep)) {
        // This unit is indirectly dependent on the unit, so counting a direct reference to it would be redundant. This
        // should only count the number of paths that could be taken to get to it once drawn out.
        mapping[dep.id] = [...this.directDependencies].reduce(
          (sum, depUnit) => depUnit.getNumberOfPathsToDependency(dep) + sum,
          0
        );
      } else {
        // This must be the earliest point in the chain that this unit is a direct dependency, so there is only 1 path to
        // this unit from here.
        mapping[dep.id] = 1;
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
  /**
   * Check whether or not the passed unit is an indirect dependency of this unit.
   *
   * While this unit may be directly dependent on the passed unit, this will tell if there's an earlier point in the
   * dependencies that is depedent on the passed unit. This is helpful when trying to account for redundant dependency
   * paths.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is indirectly dependent on the passed unit, false, if not
   */
  isInirectlyDependentOn(unit: TaskUnit): boolean {
    return [...this._directDependencies].some((dep) => dep.isDependentOn(unit));
  }
  /**
   * Given a list of "off limits" units, find and return the highest density chain including this unit (greedy).
   *
   * This will traverse as far back in the chain of dependencies as it can until it hits a dead each, or would reach an
   * off limits unit.
   *
   * Units are "off limits" usually because this is called when trying to find all the relevant dependency chains for a
   * cluster and those units were already used to make other chains.
   *
   * @param unavailableUnits the set of units that already have been used for other chains
   * @returns the available chain with the greatest visual density when this unit is included
   */
  getIdealDensityChainWithoutUnits(
    unavailableUnits: TaskUnit[],
    rootUnit?: TaskUnit
  ): IsolatedDependencyChain {
    const referenceUnit: TaskUnit = rootUnit || this;
    let chains: IsolatedDependencyChain[] = [];
    const availableParents = [...this.directDependencies].filter(
      (dep) => !unavailableUnits.includes(dep)
    );
    for (let parent of availableParents) {
      chains.push(
        new IsolatedDependencyChain([
          this,
          ...parent.getIdealDensityChainWithoutUnits(
            unavailableUnits,
            referenceUnit
          ).units,
        ])
      );
    }
    chains.sort((prev, next) => {
      // use density to sort (more preferred)
      const densityDiff = next.visualDensity - prev.visualDensity;
      if (densityDiff === 0) {
        // same density, so use amount of presence (more preferred)
        const presenceDiff = next.presenceTime - prev.presenceTime;
        if (presenceDiff === 0) {
          // same presence, so use number of external dependencies (more preferred)
          const extDepsDiff =
            next.getExternalDependencies().size -
            prev.getExternalDependencies().size;
          if (extDepsDiff === 0) {
            // same number of external dependencies, so use greatest attachment (more preferred)
            const nextAttachment = referenceUnit.getNumberOfPathsToDependency(
              next.getLastUnit()
            );
            const prevAttachment = referenceUnit.getNumberOfPathsToDependency(
              prev.getLastUnit()
            );
            const attachmentDiff = nextAttachment - prevAttachment;
            return attachmentDiff;
          }
          return extDepsDiff;
        }
        return presenceDiff;
      }
      return densityDiff;
    });
    let mostDenseChain = chains[0];
    if (mostDenseChain === undefined) {
      // No available parents, so this is automatically the most ideal chain, i.e. a chain containing only itself,
      // because it has nowhere left to go.
      mostDenseChain = new IsolatedDependencyChain([this]);
    }
    return mostDenseChain;
  }
  /**
   * The number of potential paths this unit can take to all of its dependencies.
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
   * `F` has a collective attachment of 10. The "attachments" are the edges that it can traverse. In this case, those
   * edges are: `F->B`; `B->A`; `B->D`; `F->E`; `E->A`; `E->D`; `E->G`; `F->H`; `H->D`; `H->G`. This can be calculated
   * just by totalling the getting the sum of the paths for each dependency.
   *
   * This is helpful for figuring out where the most noise can come from when trying to visualize the dependencies. It
   * will be helpful to put the most noise at the center of the graph to reduce the amount of intersecting edges. In the
   * above example, depending on how the units get passed as dependencies, without using collective attachment to
   * determine ideal paths, `F->B->A` might be considered the ideal, shoving the rest of the noise to one side of the
   * graph, putting it off balance.
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
   * @returns a number representing the number of potential paths this unit can take across its dependencies
   */
  getCollectiveAttachment(): number {
    return Object.values(this._attachmentMap).reduce(
      (sum, paths) => paths + sum,
      0
    );
  }
}
