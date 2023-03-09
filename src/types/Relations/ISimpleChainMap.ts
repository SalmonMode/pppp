import type ITaskUnit from "@typing/ITaskUnit";
import type IIsolatedDependencyChain from "./IIsolatedDepedencyChain";
import type IUnitPathMatrix from "./IUnitPathMatrix";

/**
 * A collection of interconnected {@link ITaskUnit}s, along with helpful functions to make reasoning about them easier.
 *
 * Organizing the many units in a coherent way on a graph will require some work to figure out. There needs to be an
 * orchestrating mechanism between the units and chains, and that's what this class does.
 *
 * One piece of the puzzle is figuring out a helpful way to break up the units into various chains. This will help with
 * creating more abstract chunks of visual information that can be ordered above or below depending on what would be
 * most helpful as well as what would reduce the amount of edge intersections. How these are broken up will be based
 * around getting the most interconnected chains figured out first.
 */
export default interface ISimpleChainMap {
  unitPathMatrix: IUnitPathMatrix;

  get units(): ITaskUnit[];
  /**
   * Check if the provided heads are interconnected.
   *
   * This is useful for checking that all units belong to a single cluster.
   *
   * @param heads The heads to check for interconnectivity
   * @returns true, if the heads are all interconnected somehow, false, if not
   */
  get heads(): ITaskUnit[];
  get chains(): IIsolatedDependencyChain[];
  getHeadChains(): IIsolatedDependencyChain[];
  /**
   * Get the number of paths to the unit from all head units.
   *
   * {@link ITaskUnit}s "fork" when other {@link ITaskUnit}s are dependent on them. "Heads" are the {@link ITaskUnit}s
   * that no other {@link ITaskUnit} depends on. This follows those forks from the heads and all their dependencies to
   * the target unit, and counts the number of possible ways one could navigate to the target unit.
   *
   * A 1 is hardcoded for head units, because no heads lead to them, so this would result in a 0 otherwise, which would
   * be misleading.
   *
   * This may seem expensive, but the values are cached by the {@link ITaskUnit}s themselves when they're instantiated
   * by marking 1 path to their direct dependencies and then for each of those direct dependencies, putting together the
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
  getNumberOfPathsToUnit(unit: ITaskUnit): number;
  /**
   * Get the chain that the passed unit is a part of.
   *
   * @throws {NoSuchChainError} if the passed unit does not belong to any chain in this cluster.
   *
   * @param unit The unit to get the chain for
   * @returns the chain that the passed unit is a part of
   */
  getChainOfUnit(unit: ITaskUnit): IIsolatedDependencyChain;
  /**
   * This uses the last unit of the chain, because if it used the head, it might include itself as a result of there
   * being a possible last unit that it would inherently be dependent on.
   *
   * @param chain The chain to get all the chains of all the dependencies of
   * @returns a set of the chains this chain is dependent on
   */
  getAllDependenciesOfChain(
    chain: IIsolatedDependencyChain
  ): Set<IIsolatedDependencyChain>;
  /**
   *
   * @param chain The chain to get the direct dependencies of
   * @returns the immediate dependencies of the passed chain
   */
  getDirectDependenciesOfChain(
    chain: IIsolatedDependencyChain
  ): Set<IIsolatedDependencyChain>;
  /**
   * Whether or not the chains are directly connected. The result will be the same regardless of the order the chains
   * are passed.
   *
   * @param chainA
   * @param chainB
   * @returns true, if the chains are directly connected, false, if not
   */
  chainsAreConnected(
    chainA: IIsolatedDependencyChain,
    chainB: IIsolatedDependencyChain
  ): boolean;
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
    chain: IIsolatedDependencyChain
  ): Set<IIsolatedDependencyChain>;
}
