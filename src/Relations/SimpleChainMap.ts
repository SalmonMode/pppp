import { DependencyOrderError, NoSuchChainError } from "../Error";
import type { ConnectedResourcesSetMap, ResourceMap } from "../types";
import type { TaskUnit } from "./";
import { IsolatedDependencyChain, UnitPathMatrix } from "./";

/**
 * A collection of interconnected {@link TaskUnit}s, along with helpful functions to make reasoning about them easier.
 *
 * Organizing the many units in a coherent way on a graph will require some work to figure out. There needs to be an
 * orchestrating mechanism between the units and chains, and that's what this class does.
 *
 * One piece of the puzzle is figuring out a helpful way to break up the units into various chains. This will help with
 * creating more abstract chunks of visual information that can be ordered above or below depending on what would be
 * most helpful as well as what would reduce the amount of edge intersections. How these are broken up will be based
 * around getting the most interconnected chains figured out first.
 */
export default class SimpleChainMap {
  private _chains: IsolatedDependencyChain[] = [];
  private _unitToChainMap: ResourceMap<IsolatedDependencyChain> = {};
  private _chainMap: ResourceMap<IsolatedDependencyChain> = {};
  private _chainConnections: ConnectedResourcesSetMap<IsolatedDependencyChain> =
    {};
  unitPathMatrix: UnitPathMatrix;
  private _headChains: IsolatedDependencyChain[];
  private _heads: Set<TaskUnit>;
  private _units: Set<TaskUnit>;
  constructor(heads: TaskUnit[]) {
    this._heads = new Set(heads);
    this._units = this._getAllUnits();
    this.unitPathMatrix = new UnitPathMatrix([...this._units]);
    this._verifyAreTrueHeads();
    this._buildChains();
    this._headChains = this._getHeadChains();
    this._buildChainConnections();
  }
  /**
   * Heads cannot be dependencies of other heads. Make sure this is the case.
   */
  private _verifyAreTrueHeads(): void {
    for (let head of this.heads) {
      for (let otherHead of this.heads) {
        if (head === otherHead) {
          // same head, so irrelevant
          continue;
        }
        if (otherHead.isDependentOn(head)) {
          throw new DependencyOrderError(
            "Heads cannot be dependent on each other."
          );
        }
      }
    }
  }
  /**
   * Check if the provided heads are interconnected.
   *
   * This is useful for checking that all units belong to a single cluster.
   *
   * @param heads The heads to check for interconnectivity
   * @returns true, if the heads are all interconnected somehow, false, if not
   */
  get heads(): TaskUnit[] {
    return [...this._heads];
  }
  get chains(): IsolatedDependencyChain[] {
    return this._chains;
  }
  /**
   *
   * @returns The units that no other units are dependent on
   */
  private _getAllUnits(): Set<TaskUnit> {
    const allUnits = new Set<TaskUnit>();
    for (let head of this.heads) {
      allUnits.add(head);
      for (let dep of head.getAllDependencies()) {
        allUnits.add(dep);
      }
    }
    return allUnits;
  }
  /**
   * Iterate through all the units building out the chains.
   */
  private _buildChains() {
    for (let head of this.getHeadUnits()) {
      this._buildForklessChains(head, []);
    }
    this._chains = [...new Set(Object.values(this._unitToChainMap))];
    for (let chain of this._chains) {
      this._chainMap[chain.id] = chain;
    }
  }
  getHeadUnits(): TaskUnit[] {
    return [...this._heads];
  }
  getHeadChains(): IsolatedDependencyChain[] {
    return [...this._headChains];
  }
  /**
   *
   * @returns The chains that no other chains are dependent on
   */
  private _getHeadChains(): IsolatedDependencyChain[] {
    return this.getHeadUnits().map((unit) => this.getChainOfUnit(unit));
  }
  /**
   * This can be tricky, because if there are units between the two passed units, but no branching dependencies, it will
   * still return true. This is very useful for determining the simple chains, but may be misleading for other purposes.
   * It will also return false if it does not even depend on the dependencyUnit.
   *
   * For example:
   *
   * ```text
   *                            ┏━━━┓
   *                           F┗━━━┛╲
   *                                  ╲
   *    ┏━━━┓___┏━━━┓___┏━━━┓___┏━━━┓__╲┏━━━┓
   *   A┗━━━┛╲  ┗━━━┛B  ┗━━━┛C  ┗━━━┛D  ┗━━━┛E
   *          ╲
   *           ╲┏━━━┓
   *            ┗━━━┛G
   * ```
   * Nothing is the only pure lineage of `A`, because it branches. But `C` and `D` are both the only lineage of `B`
   * because there is no branching. However, `E` is not, because it is also dependent on `F`.
   *
   * `B` is also not a pure lineage of itself.
   *
   * @param descendentUnit The unit we want to check if it is the only one that depends on the ancestorUnit
   * @param ancestorUnit The unit we want to see if its own dependent is the descendentUnit
   * @returns true, if there is onlya straight line from the ancestorUnit to the descendentUnit, false, if not
   */
  unitIsOnlyPureLineageOfUnit(
    descendentUnit: TaskUnit,
    ancestorUnit: TaskUnit
  ): boolean {
    const pathsDiff =
      this.getNumberOfPathsToUnit(ancestorUnit) -
      this.getNumberOfPathsToUnit(descendentUnit);
    // The diff being 0 only matters if there's a dependency, otherwise they could just be unrelated and it would be a
    // coincidence.
    return pathsDiff === 0 && descendentUnit.isDependentOn(ancestorUnit);
  }
  /**
   * Get the number of paths to the unit from all head units.
   *
   * {@link TaskUnit}s "fork" when other {@link TaskUnit}s are dependent on them. "Heads" are the {@link TaskUnit}s that
   * no other {@link TaskUnit} depends on. This follows those forks from the heads and all their dependencies to the
   * target unit, and counts the number of possible ways one could navigate to the target unit.
   *
   * A 1 is hardcoded for head units, because no heads lead to them, so this would result in a 0 otherwise, which would
   * be misleading.
   *
   * This may seem expensive, but the values are cached by the {@link TaskUnit}s themselves when they're instantiated by
   * marking 1 path to their direct dependencies and then for each of those direct dependencies, putting together the
   * paths each of them had to all of their dependencies. They can do this, because dependencies need to be instantiated
   * before the units that depend on them.
   *
   * For example:
   *
   * ```text
   *    ┏━━━┓___┏━━━┓___┏━━━┓___┏━━━┓
   *   A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C ╱┗━━━┛I
   *          ╳       ╳       ╱
   *    ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓╱
   *   D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *          ╳       ╱
   *    ┏━━━┓╱_╲┏━━━┓╱
   *   G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `A` has no direct dependencies, but must be figured out first. The same is true for `D` and `G`. `B` has 1 path to
   * `A` and 1 path to `D` (because these are `B` direct dependencies). `E` has 1 path to `A`, `D`, and `G` each. And
   * `H` has 1 path to `D` and `G` each.
   *
   * `C` has 1 path to `B` and `E` each, but it sees they have dependencies so it grabs 1 path to `A` and `D` each from
   * `B` and 1 path to `A`, `D`, and `G` each from `E`. Totalling these, gives `C` 2 paths to `A`, 2 paths to `D`, and 1
   * path to `G`.
   *
   * `F` does something similar, giving it 1 path to `B`, `E`, and `H` each, but also 2 paths to `A`, 3 paths to `D` (it
   * got an extra one through `H`), and 2 paths to `G`.
   *
   * `I` then totals these, giving it the following number of paths to each unit:
   *  - A: 4
   *  - B: 2
   *  - C: 1
   *  - D: 5
   *  - E: 2
   *  - F: 1
   *  - G: 3
   *  - H: 1
   *
   * Since there's no heads leading to I, we just respond with a 1 for it, since it is a head itself.
   *
   * @param unit The unit to find the number of paths to
   * @returns how many paths there are to the unit from all heads
   */
  getNumberOfPathsToUnit(unit: TaskUnit) {
    if (this._heads.has(unit)) {
      return 1;
    }
    return [...this._heads].reduce(
      (sum, head) => sum + head.getNumberOfPathsToDependency(unit),
      0
    );
  }
  /**
   *
   * @param possibleTail The unit that will potentially be added to the buffered chain so far
   * @param bufferedChainSoFar The units that have been found so far to not fork or merge
   * @param discoveringUnit The unit just before the possible tail (used for determining purity of lineage)
   */
  private _buildForklessChains(
    possibleTail: TaskUnit,
    bufferedChainSoFar: TaskUnit[],
    discoveringUnit?: TaskUnit
  ): void {
    const alreadyProcessedPossibleTail =
      !!this._unitToChainMap[possibleTail.id];
    if (alreadyProcessedPossibleTail) {
      return;
    }
    /**
     * When multiple dependencies are coming together for this unit.
     *
     * For example, `A` and `B` are merging into `C`. `C` is the merging point. However, `D` would be the
     * discoveringUnit and `C` would be the possibleTail. This is determined by looking at the number of dependencies
     * `C` would have. If it has 0 dependencies, it's just a dead end. If it has more than one dependency, it's a
     * forking point. If it has 1 dependency, then it might (but not necessarily) be eligible to continue the chain.
     *
     * ```text
     *   ┏━━━┓
     *  A┗━━━┛╲
     *         ╲┏━━━┓_____┏━━━┓
     *        C╱┗━━━┛     ┗━━━┛D
     *   ┏━━━┓╱
     *  B┗━━━┛
     * ```
     */
    let isMergingPoint: boolean = false;
    /**
     * When this unit is a direct dependency of more than one other unit.
     *
     * For example, `B` is forking into `C` and `D`. `B` is the forking point. However, `C` or `D` would be the
     * discoveringUnit and `B` would be the possibleTail. This is determinged by looking at the number of paths to `B`
     * compared to the number of paths to the discoveringUnit (`C` for example). There's only 1 path to `C`, but there
     * are 2 paths to `B`. Because there's a difference, they are not a pure lineage.
     *
     * ```text
     *                   ┏━━━┓
     *                  ╱┗━━━┛C
     *  ┏━━━┓_____┏━━━┓╱
     * A┗━━━┛     ┗━━━┛╲B
     *                  ╲┏━━━┓
     *                   ┗━━━┛D
     * ```
     */
    const isForkingPoint = !!(
      discoveringUnit &&
      !this.unitIsOnlyPureLineageOfUnit(discoveringUnit, possibleTail)
    );
    if (!isForkingPoint) {
      const deps = [...possibleTail.directDependencies];
      const firstDep = deps.pop();
      if (firstDep) {
        const hasOnlyOneDep = deps.length === 0;
        if (hasOnlyOneDep) {
          const alreadyProcessedFirstDep = !!this._unitToChainMap[firstDep.id];
          if (!alreadyProcessedFirstDep) {
            // has only one dep that might be good, and is not a forking point itself, so continue the chain
            this._buildForklessChains(
              firstDep,
              [...bufferedChainSoFar, possibleTail],
              possibleTail
            );
            return;
          } else {
            // We've already processed the only dep of this chainable possibleTail, which means we know ahead of time
            // that firstDep is a forking point. Since it's already been processed, there's no reason to delve into it
            // again, but we do want to make sure that the current possibleTail, along with whatever chain was being put
            // together so far, are put into their own chain. As long as we push the possibleTail to bufferedChainSoFar,
            // the logic below will take care of it.
            bufferedChainSoFar.push(possibleTail);
          }
        } else {
          // has multiple deps
          isMergingPoint = true;
        }
      } else {
        // has zero deps, so its a dead end. The logic below will take care of building the chain. This can only be
        // reached if we're at the end of a mergeless chain that went on for at least one unit prior to the possibleTail,
        // or the possibleTail is a standalone head with no dependencies and no units that are dependent on it.
        isMergingPoint = false;
        bufferedChainSoFar.push(possibleTail);
      }
    } else {
      // it's a forking point, so the logic below will handle it appropriately.
    }
    if (bufferedChainSoFar.length > 0) {
      // Take what we have so far (if anything). This can only be reached if we're at the end of a mergeless chain that
      // went on for at least one unit prior to the possibleTail, or the possibleTail is a standalone head with no
      // dependencies and no units that are dependent on it.
      const bufferedChain = new IsolatedDependencyChain(bufferedChainSoFar);
      bufferedChainSoFar.forEach(
        (unit) => (this._unitToChainMap[unit.id] = bufferedChain)
      );
    }

    if (isForkingPoint || isMergingPoint) {
      // task belongs in its own chain
      this._unitToChainMap[possibleTail.id] = new IsolatedDependencyChain([
        possibleTail,
      ]);
    }

    for (let dep of possibleTail.directDependencies) {
      // will not reach inside of this loop if there were zero dependencies. If there was only one dep, the possibleTail
      // must've been a forking point, so its dependencies won't be in the same chain as it.
      this._buildForklessChains(dep, [], possibleTail);
    }
  }
  /**
   * Get the chain that the passed unit is a part of.
   *
   * @throws {NoSuchChainError} if the passed unit does not belong to any chain in this cluster.
   *
   * @param unit The unit to get the chain for
   * @returns the chain that the passed unit is a part of
   */
  getChainOfUnit(unit: TaskUnit): IsolatedDependencyChain {
    const chain = this._unitToChainMap[unit.id];
    if (chain === undefined) {
      throw new NoSuchChainError(`No chain found for unit with ID: ${unit.id}`);
    }
    return chain;
  }
  /**
   * This uses the last unit of the chain, because if it used the head, it might include itself as a result of there
   * being a possible last unit that it would inherently be dependent on.
   *
   * @param chain The chain to get all the chains of all the dependencies of
   * @returns a set of the chains this chain is dependent on
   */
  getAllDependenciesOfChain(
    chain: IsolatedDependencyChain
  ): Set<IsolatedDependencyChain> {
    const allDependencyUnits = chain.lastUnit.getAllDependencies();
    return new Set<IsolatedDependencyChain>(
      [...allDependencyUnits].map((unit) => this.getChainOfUnit(unit))
    );
  }
  /**
   *
   * @param chain The chain to get the direct dependencies of
   * @returns the immediate dependencies of the passed chain
   */
  getDirectDependenciesOfChain(
    chain: IsolatedDependencyChain
  ): Set<IsolatedDependencyChain> {
    return new Set(
      [...chain.lastUnit.directDependencies].map((unit) =>
        this.getChainOfUnit(unit)
      )
    );
  }
  /**
   * Whether or not the chains are directly connected. The result will be the same regardless of the order the chains
   * are passed.
   *
   * @param chainA
   * @param chainB
   * @returns true, if the chains are directly connected, false, if not
   */
  chainsAreConnected(
    chainA: IsolatedDependencyChain,
    chainB: IsolatedDependencyChain
  ): boolean {
    return (
      chainA.isDirectlyDependentOn(chainB) ||
      chainB.isDirectlyDependentOn(chainA)
    );
  }
  /**
   * Build the map of how the chains are connected to each other.
   *
   * This details which chains are dependent on which chains, and the reverse. If A is dependent on B, then A is
   * connected to B and B is connected to A.
   */
  private _buildChainConnections(): void {
    for (let chain of this.chains) {
      const mappingForChain = (this._chainConnections[chain.id] ??=
        new Set<IsolatedDependencyChain>());
      for (let dep of this.getDirectDependenciesOfChain(chain)) {
        const mappingForDepChain = (this._chainConnections[dep.id] ??=
          new Set<IsolatedDependencyChain>());
        mappingForChain.add(dep);
        mappingForDepChain.add(chain);
      }
    }
  }
  /**
   * Get all chains directly connected to the provided chain.
   *
   * This includes chains that the provided chain is directly dependent on and chains that directly depend on the chain
   * that was provided.
   *
   * @param chain The chain to get the units that are attached to it
   * @returns the chains that are either a direct dependent of the provided chain, or are direct dependencies of it.
   */
  getChainsConnectedToChain(
    chain: IsolatedDependencyChain
  ): Set<IsolatedDependencyChain> {
    const connectedChains = this._chainConnections[chain.id];
    if (!connectedChains) {
      throw new NoSuchChainError(`Could not find chain with ID ${chain.id}`);
    }
    return connectedChains;
  }
}
