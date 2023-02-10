import { NoSuchChainError } from "../Error";
import type { RelationshipMapping } from "../types";
import type { IsolatedDependencyChain, SimpleChainMap } from "./";
import { ChainPath } from "./";

/**
 * A helper for how much "strain" each {@link IsolatedDependencyChain} is under.
 *
 * "Strain" for a unit is effectively the sum of two numbers for that unit: the number of possible paths to it from the
 * heads of the cluster; and all paths available from it to its dependencies. "Strain" for a chain is effectively the
 * sum of the strain of all units in the chain.
 */
export default class ChainStrainMap {
  /**
   * The amount of paths that lead to a unit plus the amount of paths it leads to.
   */
  private _chainStrainMap: RelationshipMapping = {};
  constructor(public readonly chainMap: SimpleChainMap) {
    this._buildStrainMap();
  }
  /**
   * The preferred path for chains is the one that is most "strained". This is because these paths are the epicenter of
   * what's going on. What makes a unit "strained", is how dependent it is on other units, plus how dependent other
   * units are on it. The former is determined by how many paths through its dependencies it can take to the ends of its
   * tails. The latter is determined by how many paths from the heads of the cluster lead to it.
   *
   * For example:
   *
   * ```text
   *
   *     ┏━━━┓___┏━━━┓___┏━━━┓
   *    A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *           ╳       ╳
   *     ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *    D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *           ╳       ╳
   *     ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *    G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * The preferred path through here is `F->E->D`.
   *
   * Each unit has this many paths leading to it:
   *
   * - `A`: 5
   * - `B`: 2
   * - `C`: 0
   * - `D`: 7
   * - `E`: 3
   * - `F`: 0
   * - `G`: 5
   * - `H`: 2
   * - `I`: 0
   *
   * Each unit also has this many paths available to it:
   *
   * - `A`: 0
   * - `B`: 2
   * - `C`: 5
   * - `D`: 0
   * - `E`: 3
   * - `F`: 7
   * - `G`: 0
   * - `H`: 2
   * - `I`: 5
   *
   * When we add these numbers together for each unit, we get the total strain for each one:
   *
   * - `A`: 5
   * - `B`: 4
   * - `C`: 5
   * - `D`: 7
   * - `E`: 6
   * - `F`: 7
   * - `G`: 5
   * - `H`: 4
   * - `I`: 5
   *
   * The head with the highest strain is `F`, and we follow it's available paths from there that have the greatest
   * strain. Because we're factoring in the available paths from both directions, we focus only on the strain that is
   * relevant to the current potential chain. This is helpful for getting "tangled" things out of the way first.
   *
   * It's possible for there to be a lot of "fluff" inflating a particular unit's strain. "Fluff" is basically a lot of
   * simple, low strain chains attached to a single unit. This can occur in both directions. For example:
   *
   * ```text
   *
   *   ┏━━━┓
   *   ┗━━━┛╲
   *         ╲┏━━━┓
   *         ╱┗━━━┛╲
   *   ┏━━━┓╱       ╲┏━━━┓
   *   ┗━━━┛         ┗━━━┛╲
   *          ┏━━━┓        ╲┏━━━┓
   *          ┗━━━┛╲       ╱┗━━━┛
   *   ┏━━━┓        ╲┏━━━┓╱
   *   ┗━━━┛╲       ╱┗━━━┛
   *         ╲┏━━━┓╱
   *         ╱┗━━━┛
   *   ┏━━━┓╱
   *   ┗━━━┛
   * ```
   *
   * Or:
   *
   * ```text
   *
   *
   *                        ┏━━━┓
   *                       ╱┗━━━┛
   *                 ┏━━━┓╱
   *                ╱┗━━━┛╲
   *          ┏━━━┓╱       ╲┏━━━┓
   *         ╱┗━━━┛         ┗━━━┛
   *   ┏━━━┓╱        ┏━━━┓
   *   ┗━━━┛╲       ╱┗━━━┛
   *         ╲┏━━━┓╱        ┏━━━┓
   *          ┗━━━┛╲       ╱┗━━━┛
   *                ╲┏━━━┓╱
   *                 ┗━━━┛╲
   *                       ╲┏━━━┓
   *                        ┗━━━┛
   * ```
   *
   * While the number of branches can be significant, for the purposes of determining the chains, these sets of units
   * aren't favored by the cumulative strain model because they aren't as tangled, which makes them much easier to order
   * without having to worry about intersecting edges.
   *
   * This is more concerned with where the "meat" of the dependencies is.
   */
  private _buildStrainMap(): void {
    for (const head of this.chainMap.getHeadChains()) {
      // Set head's strain to its attachment to its dependencies. This is the number of paths it can take. Since its a
      // head, there are no paths that lead to, so there's nothing else to add.
      this._chainStrainMap[head.id] = head.lastUnit.attachmentToDependencies;
      // Get all dependencies of this head. Since we know all the units are interconnected, we'll eventually hit all the
      // units that were provided.
      const deps = this.chainMap.getAllDependenciesOfChain(head);
      for (const chain of deps) {
        const numOfPathsFromUnit = chain.attachmentToDependencies;
        // Only include the number of paths from unit if this is the first time hitting this unit. Otherwise, it'll add
        // again if a future head hits it, and we only want to add it once.
        const strainSoFar =
          this._chainStrainMap[chain.id] || numOfPathsFromUnit;
        const attachmentToUnit = head.getNumberOfPathsToDependency(chain);
        const totalStrain = strainSoFar + attachmentToUnit;
        this._chainStrainMap[chain.id] = totalStrain;
      }
    }
  }
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
    head: IsolatedDependencyChain,
    unavailableChains: IsolatedDependencyChain[],
    pathSoFar: IsolatedDependencyChain[] = []
  ): ChainPath[] {
    const root: IsolatedDependencyChain = pathSoFar[0] || head;
    // Filter out the dependencies that we can't use.
    const headDirectDeps = this.chainMap.getDirectDependenciesOfChain(head);
    const availableDeps = [...headDirectDeps].filter(
      (dep: IsolatedDependencyChain): boolean =>
        !unavailableChains.includes(dep)
    );
    // We want any paths with a greater relative familiarity to stand out. We can filter out any deps after the first
    // that would have a lower relative familiarity. This is where we factor in unfamiliar attachment and discourage
    // path selection away from highly contentious routes.
    const sortedAvailableDeps =
      this._getAvailableDependenciesSortedByLeastDiscouraged(
        availableDeps,
        root
      );
    // Get the dependencies that are the least discouraged. Relative familiarity is a good shortcut to avoid stepping on
    // the toes of other potential heads.
    const leastDiscouragedHeads: IsolatedDependencyChain[] =
      this._getLeastDiscouragedHeads(sortedAvailableDeps, root);
    const potentialPaths: ChainPath[] =
      this._getMostFamiliarPathsFromLeastDiscouragedHeads(
        leastDiscouragedHeads,
        unavailableChains,
        pathSoFar,
        head
      );

    // Since there may have been more than one dependency with the same relative familiarity (even when accounting for
    // unfamiliar attachment), we have to sort the paths by their total relative familiarity. Only the greatest will be
    // chosen.
    const sortedPaths = this._getSortedPreferredPaths(potentialPaths);
    const mostPreferredPaths: ChainPath[] =
      this._getMostPreferredPathsFromSortedPotentialPaths(sortedPaths);
    if (mostPreferredPaths.length === 0) {
      // No available deps, so this is automatically the most preferred path, i.e. a path containing only itself,
      // because it has nowhere left to go within its cluster
      mostPreferredPaths.push(new ChainPath([...pathSoFar, head]));
    }
    return mostPreferredPaths;
  }
  /**
   * Paths can be discouraged by competing attachment from other heads. We want to avoid these a bit more than we would
   * other potential paths to get the less tangled areas out of the way first.
   *
   * @param availableDeps the dependencies to sort
   * @param root the root chain to base relative discouragement from
   * @returns an array of chains sorted from least to most discouraged
   */
  private _getAvailableDependenciesSortedByLeastDiscouraged(
    availableDeps: IsolatedDependencyChain[],
    root: IsolatedDependencyChain
  ): IsolatedDependencyChain[] {
    const sortedDeps = [...availableDeps];
    sortedDeps.sort(
      (
        prev: IsolatedDependencyChain,
        next: IsolatedDependencyChain
      ): number => {
        // use the familiarity of the path option relative to the root (more preferred)
        const nextFamiliarity = this.getRelativeFamiliarityOfChainWithChain(
          next,
          root
        );
        const prevFamiliarity = this.getRelativeFamiliarityOfChainWithChain(
          prev,
          root
        );
        const familiarityDiff = nextFamiliarity - prevFamiliarity;
        return familiarityDiff;
      }
    );
    return sortedDeps;
  }
  private _getMostFamiliarPathsFromLeastDiscouragedHeads(
    leastDiscouragedHeads: IsolatedDependencyChain[],
    unavailableChains: IsolatedDependencyChain[],
    pathSoFar: IsolatedDependencyChain[],
    head: IsolatedDependencyChain
  ): ChainPath[] {
    const potentialPaths: ChainPath[] = [];
    for (const dep of leastDiscouragedHeads) {
      const potentialDepPaths = this.getPathsMostFamiliarWithChainWithoutChains(
        dep,
        unavailableChains,
        [...pathSoFar, head]
      );
      for (const path of potentialDepPaths) {
        potentialPaths.push(path);
      }
    }
    return potentialPaths;
  }
  /**
   * We want to discourage pathing through contentious chains to allow for cleaner, more easily organizable paths to be
   * established first. This allows those contentious chains to be positioned more towards the spaces between all the
   * various paths that they're connected to, while also decreasing the risk of edges intersecting.
   *
   * To do this, we consider the root, i.e. the chain we know a path will be starting from, how much attachment there is
   * to it, how much attachment there is to a chain it can potentially path to, and how much attachment the target chain
   * has on it that does not come from the root chain. The latter is "unfamiliar" attachment, while everything else is
   * "familiar" attachment.
   *
   * Relative familiarity is the familiar attachment *minus* the unfamilar attachment. By subtracting the unfamiliar
   * attachment, we discourage chains that have a significant amount of unfamiliar attachment to it, which encourages
   * going to paths with less competition.
   *
   * @param sortedAvailableDeps The available direct dependencies of a single chain (the root, or a dependency of it)
   * @param root The chain to get the familiarity will be relative to
   * @returns the chains from sortedAvailableDeps with the greatest relative familiarity
   */
  private _getLeastDiscouragedHeads(
    sortedAvailableDeps: IsolatedDependencyChain[],
    root: IsolatedDependencyChain
  ): IsolatedDependencyChain[] {
    const leastDiscouragedHeads: IsolatedDependencyChain[] = [];
    let highestRelativeFamiliarity: number | undefined;
    let firstDep: IsolatedDependencyChain | undefined;
    for (const dep of sortedAvailableDeps) {
      if (!firstDep) {
        // first iteration, so grab a reference to it in order to be able to consistently compare against the most
        // preferred chain.
        firstDep = dep;
        // Add it to the most preferred array and move to the next (if there is one)
        leastDiscouragedHeads.push(dep);
        continue;
      }
      if (!highestRelativeFamiliarity) {
        // need to actually grab the highest familiarity because there's another chain we need to check.
        highestRelativeFamiliarity =
          this.getRelativeFamiliarityOfChainWithChain(firstDep, root);
      } else {
        // We must have run through this loop at least twice already to reach this point.
      }
      // Grab the relative familiarity of the next chain to compare against the first.
      const relativeFamiliarity = this.getRelativeFamiliarityOfChainWithChain(
        dep,
        root
      );
      if (relativeFamiliarity < highestRelativeFamiliarity) {
        // Chain can't compete with first chain so end it here.
        break;
      }
      leastDiscouragedHeads.push(dep);
    }
    return leastDiscouragedHeads;
  }

  /**
   * Take the paths that have already been sorted according to the preferences, and return only the top results.
   *
   * These results should all have the same relative familiarity, unfamiliarity, and strain.
   *
   * @param potentialPaths The sorted possible paths
   * @returns an array of the paths that met the strictest criteria
   */
  private _getMostPreferredPathsFromSortedPotentialPaths(
    potentialPaths: ChainPath[]
  ): ChainPath[] {
    let highestPathRelativeFamiliarity: number | undefined;
    let lowestPathUnfamiliarity: number | undefined;
    let highestPathStrain: number | undefined;
    const mostPreferredPaths: ChainPath[] = [];
    let firstPath: ChainPath | undefined;
    for (const path of potentialPaths) {
      if (!firstPath) {
        // first iteration, so grab a reference to it in order to be able to consistently compare against the most
        // preferred path.
        firstPath = path;
        // Add it to the most preferred array and move to the next (if there is one)
        mostPreferredPaths.push(path);
        continue;
      }
      if (!highestPathRelativeFamiliarity) {
        // need to actually grab the highest familiarity because there's another path we need to check.
        highestPathRelativeFamiliarity =
          this.getRelativeFamiliarityOfPath(firstPath);
      }
      // Grab the relative familiarity of the next path to compare against the first.
      const pathRelativeFamiliarity = this.getRelativeFamiliarityOfPath(path);
      if (pathRelativeFamiliarity < highestPathRelativeFamiliarity) {
        // Path can't compete with first path so end it here.
        break;
      }
      // They must have had the same relative familiarity, so we need to check if the next path has more unfamiliarity
      if (!lowestPathUnfamiliarity) {
        // need to actually grab the lowest unfamiliarity because there's another path we need to check.
        lowestPathUnfamiliarity = this.getUnfamiliarityOfPath(firstPath);
      }
      const pathUnfamiliarity = this.getUnfamiliarityOfPath(path);
      if (pathUnfamiliarity > lowestPathUnfamiliarity) {
        // Path can't compete with first path so end it here.
        break;
      }
      // They must have had the same unfamiliarity, so we need to check if the next path has less strain
      if (!highestPathStrain) {
        // need to actually grab the highest strain because there's another path we need to check.
        highestPathStrain = this.getStrainOfPath(firstPath);
      }
      const pathstrain = this.getStrainOfPath(path);
      if (pathstrain < highestPathStrain) {
        // Path can't compete with first path so end it here.
        break;
      }
      // The path can compete on all criteria, so it can be pushed to the list.
      mostPreferredPaths.push(path);
    }
    return mostPreferredPaths;
  }
  private _getSortedPreferredPaths(paths: ChainPath[]): ChainPath[] {
    const sortedPaths = [...paths];
    sortedPaths.sort((prev: ChainPath, next: ChainPath): number => {
      // use the sum of the relative familiarity of all chains in the path (more preferred)
      const nextFamiliarity = this.getRelativeFamiliarityOfPath(next);
      const prevFamiliarity = this.getRelativeFamiliarityOfPath(prev);
      const familiarityDiff = nextFamiliarity - prevFamiliarity;
      if (familiarityDiff === 0) {
        // use the unfamiliarity of each path (less preferred)
        const nextUnfamiliarity = this.getUnfamiliarityOfPath(next);
        const prevUnfamiliarity = this.getUnfamiliarityOfPath(prev);
        const unfamiliarityDiff = prevUnfamiliarity - nextUnfamiliarity;
        if (unfamiliarityDiff === 0) {
          // use the sum of the strain of all units in the chain (more preferred)
          const nextStrain = this.getStrainOfPath(next);
          const prevStrain = this.getStrainOfPath(prev);
          const strainDiff = nextStrain - prevStrain;
          return strainDiff;
        }
        return unfamiliarityDiff;
      }
      return familiarityDiff;
    });
    return sortedPaths;
  }
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
  getStrainOfChain(chain: IsolatedDependencyChain): number {
    const strain = this._chainStrainMap[chain.id];
    if (strain === undefined) {
      throw new NoSuchChainError(
        `No chain exists in this strain map with ID ${chain.id}`
      );
    }
    return strain;
  }
  /**
   * Get the cumulative strain for the path.
   *
   * @param path the path to get the strain of
   * @returns how much strain the path has
   */
  getStrainOfPath(path: ChainPath): number {
    return path.chains.reduce<number>(
      (sum: number, chain: IsolatedDependencyChain): number =>
        sum + this.getStrainOfChain(chain),
      0
    );
  }
  /**
   * Get the total strain for all chains in the path.
   *
   * @param path the path to get the total strain of
   * @returns how much strain the path has
   */
  getRelativeFamiliarityOfPath(path: ChainPath): number {
    return path.chains.reduce<number>(
      (sum: number, chain: IsolatedDependencyChain): number =>
        sum + this.getRelativeFamiliarityOfChainWithChain(chain, path.head),
      0
    );
  }
  /**
   * Get the total unfamiliar strain for all chains in the path.
   *
   * @param path the path to get the total strain of
   * @returns how much strain the path has
   */
  getUnfamiliarityOfPath(path: ChainPath): number {
    return path.chains.reduce<number>(
      (sum: number, chain: IsolatedDependencyChain): number =>
        sum +
        this.getUnfamiliarStrainOnChainRelativeToObservingChain(
          chain,
          path.head
        ),
      0
    );
  }
  /**
   * Get the number of paths to the chain from all head chains.
   *
   * Chains can only ever fork from their heads. So the number of paths to their head is the same number of paths to any
   * other {@link TaskUnit} in the chain. Because of this, we can just use the number of paths to their head unit that
   * the {@link ChainStrainMap} has.
   *
   * @param chain The chain to find the number of paths to
   * @returns how many paths there are to the chain from all heads
   */
  getPathsToChain(chain: IsolatedDependencyChain): number {
    return this.chainMap.getNumberOfPathsToUnit(chain.head);
  }
  /**
   * The attachment the observing chain has on the target chain.
   *
   * This is effectively how much "claim" the observing chain has on the target chain. This is increased exponentially
   * the more chains there are that are depending on the observing chain. The more things that depend on the observing
   * chain, the greater need the observing chain has for what the target chain provides.
   *
   * @param targetChain
   * @param observingChain
   * @returns
   */
  getFamiliarAttachmentToChainRelativeToObservingChain(
    targetChain: IsolatedDependencyChain,
    observingChain: IsolatedDependencyChain
  ): number {
    return (
      observingChain.getNumberOfPathsToDependency(targetChain) *
      this.getPathsToChain(observingChain)
    );
  }
  /**
   * Factors in number of paths to the observing chain because this backs up its attachment to the target chain.
   *
   * @param targetChain
   * @param observingChain
   * @returns
   */
  getUnfamiliarStrainOnChainRelativeToObservingChain(
    targetChain: IsolatedDependencyChain,
    observingChain: IsolatedDependencyChain
  ): number {
    return (
      this.getPathsToChain(targetChain) -
      this.getFamiliarAttachmentToChainRelativeToObservingChain(
        targetChain,
        observingChain
      )
    );
  }
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
    targetChain: IsolatedDependencyChain,
    observingChain: IsolatedDependencyChain
  ): number {
    const unfamiliarInfluence =
      this.getUnfamiliarStrainOnChainRelativeToObservingChain(
        targetChain,
        observingChain
      );
    return (
      this.getFamiliarAttachmentToChainRelativeToObservingChain(
        targetChain,
        observingChain
      ) - unfamiliarInfluence
    );
  }
}
