import type IChainPath from "./IChainPath";
import type IIsolatedDependencyChain from "./IIsolatedDepedencyChain";
import type ISimpleChainMap from "./ISimpleChainMap";

/**
 * A helper for how much "strain" each {@link IIsolatedDependencyChain} is under.
 *
 * "Strain" for a unit is effectively the sum of two numbers for that unit: the number of possible paths to it from the
 * heads of the cluster; and all paths available from it to its dependencies. "Strain" for a chain is effectively the
 * sum of the strain of all units in the chain.
 */
export default interface IChainStrainMap {
  chainMap: ISimpleChainMap;
  /**
   * Iterate over the possible paths from the provided head, finding the ones with the greatest relative familiarity.
   *
   * This will return a list of paths, each with the same strain, because it's possible there may be ties, and further
   * sorting may be desired. But that is not the responsibility of this class, so this is as far as it goes for that.
   *
   * "Strain" for a unit is effectively the sum of two numbers for that unit: the number of possible paths to it from
   * the heads of the cluster; and all paths available from it to its dependencies. "Strain" for a chain is effectively
   * the sum of the strain of all units in the chain.
   *
   * This is "greedy" and knows that it can always get a greater cumulative strain by going to the very ends of its
   * available chains. However, some units are "off limits", and so it must stop before reaching them. Units are "off
   * limits" usually because this is called when trying to find all the relevant dependency chains for a cluster and
   * those units were already used to make other chains.
   *
   * It will prioritize chains with greater strain from the head unit to the last units of this unit's potential chains.
   * More strain means a certain chain is closer to the epicenter of what's going on in a project. More interconnected
   * paths through the dependencies from the root to the last unit means more attempts at parallelism, which means
   * greater risk of nonlinear perturbations. The more nonlinear perturbations there are, the worse off a project will
   * be, so we want these closer to the center of the graph.
   *
   * Prioritizing by strain also makes ordering the chains and clusters easier because we can get the most "stressed"
   * chains out of the way first, allowing other chains to be more flexible with their positioning.
   *
   * For example:
   *
   * ```text
   *               ┏━━━━━━┓____┏━━━━━━┓
   *              ╱┗━━━━━━┛╲B ╱┗━━━━━━┛╲C
   *             ╱          ╲╱          ╲
   *            ╱           ╱╲           ╲
   *           ╱      ┏━━━┓╱__╲┏━━━┓      ╲
   *          ╱     D╱┗━━━┛╲ E╱┗━━━┛╲      ╲
   *    ┏━━━┓╱______╱       ╲╱       ╲______╲┏━━━┓
   *   A┗━━━┛       ╲       ╱╲       ╱       ┗━━━┛F
   *                 ╲┏━━━┓╱__╲┏━━━┓╱
   *                  ┗━━━┛G   ┗━━━┛H
   * ```
   *
   * `D` has a stronger connection to `A` by going through `F` rather than `C` or `H`, even though `C` provides more
   * visual density. However, if we chose the path `F->C->B->A` as our first chain pick, it would look like this:
   *
   * ```text
   *    ┏━━━┓____┏━━━━━━┓____┏━━━━━━┓____┏━━━┓
   *   A┗━━━┛ ╲ ╲┗━━━━━━┛╲B ╱┗━━━━━━┛╱C╱ ┗━━━┛D
   *           ╲ ╲        ╲╱        ╱ ╱
   *            ╲ ╲       ╱╲       ╱ ╱
   *             ╲ ╲┏━━━┓╱__╲┏━━━┓╱ ╱
   *              | ┗━━━┛╲E ╱┗━━━┛F |
   *              |       ╲╱        |
   *              ╲       ╱╲       ╱
   *               ╲┏━━━┓╱__╲┏━━━┓╱
   *                ┗━━━┛G   ┗━━━┛H
   * ```
   *
   * This would pull a lot on `F->E` and `H->G` in terms of sorting, possibly causing a lot of edge intersections.
   *
   * By using strain, we'd get this:
   *
   * ```text
   *             ┏━━━━━━┓____┏━━━━━━┓
   *            ╱┗━━━━━━┛╲B ╱┗━━━━━━┛╲C
   *           ╱          ╲╱          ╲
   *          ╱           ╱╲           ╲
   *    ┏━━━┓╱______┏━━━┓╱__╲┏━━━┓______╲┏━━━┓
   *   A┗━━━┛   ╲  E┗━━━┛╲ F╱┗━━━┛   ╱   ┗━━━┛D
   *             ╲        ╲╱        ╱
   *              ╲       ╱╲       ╱
   *               ╲┏━━━┓╱__╲┏━━━┓╱
   *                ┗━━━┛G   ┗━━━┛H
   * ```
   *
   * This result is much more balanced because our mess is contained as much as we can get it. As a result, the
   * connection lines between units are shorter overall.
   *
   * Some units are off limits though, and while this still influences the strain on available units, it does mark off
   * potential paths we can take. This isn't necessarily a problem though, because it still helps keep our mess
   * consolidated. For example:
   *
   * ```text
   *            ┏━━━┓
   *            ┗━━━┛╲A
   *                  ╲┏━━━┓
   *                  ╱┗━━━┛B
   *            ┏━━━┓╱
   *           ╱┗━━━┛C
   *     ╔╦╦╦╗╱___╔╦╦╦╗___ More units...
   *    D╚╩╩╩╝    ╚╩╩╩╝E
   *
   * ```
   *
   * `E` and `D` were already taken by another chain. But we need to figure out what `B`'s chain will be. It's path to
   * `A` would only yield a total strain of 3. But if it went to `C`, it would get a total strain of 4.
   *
   * Note: this does not determine the order these chains are placed. It only tries to get the meatiest, most tangled
   * chains figured out first, as those would likely cause the most trouble for sorting otherwise.
   *
   * @param head The starting point of the chains
   * @param unavailableChains The units that are not available for use
   * @returns a list of chains with the same amount of strain
   */
  getPathsMostFamiliarWithChainWithoutChains(
    head: IIsolatedDependencyChain,
    unavailableChains: IIsolatedDependencyChain[],
    pathSoFar?: IIsolatedDependencyChain[]
  ): IChainPath[];
  /**
   * Get the strain for the chain.
   *
   * Because a chain is effectively a collection of units working with the path, with the same strain, the strain of the
   * head unit can be used. There's no need to add the strain of each unit together because a chain could be comprised
   * of units that may as well all be combined into a single unit.
   *
   * @param chain the chain to get the strain of
   * @returns how much strain the chain has
   */
  getStrainOfChain(chain: IIsolatedDependencyChain): number;
  /**
   * Get the cumulative strain for the path.
   *
   * @param path the path to get the strain of
   * @returns how much strain the path has
   */
  getStrainOfPath(path: IChainPath): number;
  /**
   * Get the total strain for all chains in the path.
   *
   * @param path the path to get the total strain of
   * @returns how much strain the path has
   */
  getRelativeFamiliarityOfPath(path: IChainPath): number;
  /**
   * Get the strain of a chain
   *
   * When there's heads competing for the same chain, we want to discourage a head from taking these paths, in favor of
   * less contentious routes. When there are several heads competing for the same chain, each will be equally
   * discouraged. Heads can still take these paths provided they don't have any better alternatives, though.
   *
   * If a path can have the same total strain by avoiding contentious areas, it should do so to allow those contentious
   * areas to eventually becomes their own paths where they can be more easily sorted relative to other paths.
   *
   * You can think of this as the target chain being potentially more familar with one of its dependents than the other.
   * Target chains with a lot of dependents (i.e. chains that depend on the target chain) need to be very familiar. The
   * more other chains are dependent on a particular direct dependent, the more familiar the target chain has to be with
   * that direct dependent. It's almost as if the dependent is saying "I've got a lot of others counting on me, so I
   * really need your help." The target dependent is going to be more inclined to "help" (metaphorically speaking) the
   * dependent that needs its help more. Those dependents of course may instead choose to go to other, less "in demand"
   * dependencies first though.
   *
   * Note: This is primarily used for determining which paths from a particular head should consider going for next. If
   * there's another path it can take with more strain and less unfamiliar influence pulling it, that's the path it
   * should take.
   *
   * @param targetChain The chain we want to find the relative strain for from the observingChain
   * @param observingChain The chain that we want to see how dependent on the target chain it is
   * @returns How much strain the chain is under from the head, minus the attachment from everything else
   */
  getRelativeFamiliarityOfChainWithChain(
    targetChain: IIsolatedDependencyChain,
    observingChain: IIsolatedDependencyChain
  ): number;
}
