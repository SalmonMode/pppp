import { DisjointedUnitsError, NoSuchTaskUnitError } from "../Error";
import { RelationshipMapping } from "../types";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import TaskUnit from "./TaskUnit";

/**
 * A helper for how much "strain" each {@link TaskUnit} is under.
 *
 * "Strain" for a unit is effectively the sum of two numbers for that unit: the number of possible paths to it from the
 * heads of the cluster; and all paths available from it to its dependencies. "Strain" for a chain is effectively the
 * sum of the strain of all units in the chain.
 */
export default class StrainMap {
  /**
   * The amount of paths that lead to a unit plus the amount of paths it leads to.
   */
  private _unitStrainMap: RelationshipMapping = {};
  constructor(public readonly units: TaskUnit[]) {
    this._verifyAllUnitsAreInterconnected();
    this._buildStrainMap();
  }
  getStrainOfUnit(unit: TaskUnit): number {
    const strain = this._unitStrainMap[unit.id];
    if (strain === undefined) {
      throw new NoSuchTaskUnitError(
        `No unit exists in this strain map with ID ${unit.id}`
      );
    }
    return strain;
  }
  /**
   * Make sure all units passed to the constructor have a path to every other unit.
   */
  private _verifyAllUnitsAreInterconnected(): void {
    const undeterminedUnits: TaskUnit[] = [...this.units];
    let undeterminedUnitsBuffer: TaskUnit[] = [];
    const firstUnit = this.units[0];
    if (firstUnit === undefined) {
      throw new RangeError("Must provide at least 1 TaskUnit");
    }
    const interconnectedUnits = new Set<TaskUnit>();
    interconnectedUnits.add(firstUnit);
    firstUnit
      .getAllDependencies()
      .forEach((depUnit) => interconnectedUnits.add(depUnit));
    let unit = undeterminedUnits.shift();
    let foundMatchOnThisRunThrough = false;
    while (unit !== undefined) {
      const deps = unit.getAllDependencies();
      if (interconnectedUnits.has(unit)) {
        // Unit, and thus, all of its dependencies are accounted for. Nothing will change by processing this unit, so we
        // should skip to the next without considering this a match.
      } else if (
        [...deps].some((depUnit) => interconnectedUnits.has(depUnit))
      ) {
        // there is overlap, so merge its dependencies with the established set of interconnected units
        foundMatchOnThisRunThrough = true;
        deps.forEach((depUnit) => interconnectedUnits.add(depUnit));
        // add unit itself
        interconnectedUnits.add(unit);
      } else {
        // no overlap, so add it to the buffer so it can be checked again later
        undeterminedUnitsBuffer.push(unit);
      }
      unit = undeterminedUnits.shift();
      if (unit === undefined) {
        // reached the end of this run through, so check if there was a problem, if followup needs to be done, or we're
        // finished
        if (undeterminedUnitsBuffer.length > 0) {
          // Some things weren't seen as connected.
          if (foundMatchOnThisRunThrough) {
            // There's a chance they may be connected to whatever was recently matched on, so add the buffer units back
            // into the main array and start over.
            undeterminedUnitsBuffer.forEach((undeterminedUnit) =>
              undeterminedUnits.push(undeterminedUnit)
            );
            undeterminedUnitsBuffer = [];
            unit = undeterminedUnits.shift();
          } else {
            // There's no chance they're connected, so throw an error.
            throw new DisjointedUnitsError(
              "All units passed must be interconnected either directly or indirectly."
            );
          }
        } else {
          // Everything is resolved and all units are interconnected.
        }
        foundMatchOnThisRunThrough = false;
      } else {
        // This run through is not complete.
      }
    }
    // Everything is resolved and all units are interconnected.
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
   * aren't favored by the cumulative stress model because they aren't as tangled, which makes them much easier to order
   * without having to worry about intersecting edges.
   *
   * This is more concerned with where the "meat" of the dependencies is.
   */
  private _buildStrainMap(): void {
    const trueHeads = this._getHeads();
    for (let head of trueHeads) {
      // Set head's strain to its attachment to its dependencies. This is the number of paths it can take. Since its a
      // head, there are no paths that lead to, so there's nothing else to add.
      this._unitStrainMap[head.id] = head.attachmentToDependencies;
      // Get all dependencies of this head. Since we know all the units are interconnected, we'll eventually hit all the
      // units that were provided.
      const deps = head.getAllDependencies();
      for (let unit of deps) {
        const numOfPathsFromUnit = unit.attachmentToDependencies;
        // only include the number of paths from unit if this is the first time hitting this unit. Otherwise, it'll add
        // again if a future head hits it.
        const strainSoFar = this._unitStrainMap[unit.id] || numOfPathsFromUnit;
        const attachmentToUnit = head.getNumberOfPathsToDependency(unit);
        const totalStrain = strainSoFar + attachmentToUnit;
        this._unitStrainMap[unit.id] = totalStrain;
      }
    }
  }
  /**
   *
   * @returns The units that no other units are dependent on
   */
  private _getHeads(): TaskUnit[] {
    let mightBeHeads: TaskUnit[] = [];
    for (let unit of this.units) {
      const newMightBeHeads: TaskUnit[] = [];
      for (let potentialHead of mightBeHeads) {
        if (unit.isDependentOn(potentialHead)) {
          // potential head is not actually a head. But unit might be. We can be certain no other unit in 'might be
          // heads' would be dependent on unit, because then the potential head we're currently on would've already been
          // eliminated. But other units may be dependencies of this unit, knocking them out of the running.
        } else {
          // unit is not dependent on the potential head, so the potential head may still be a head when this is all
          // over. The potential head might be dependent on the unit, though, so we can't add the unit to the array of
          // new might be heads yet. We can check all of the remaining potential heads after this for loop to see if the
          // unit is a dependency of theirs.
          newMightBeHeads.push(potentialHead);
        }
      }
      const unitIsInTailOfOtherPotentialHeads: boolean = newMightBeHeads.some(
        (potentialHead) => potentialHead.isDependentOn(unit)
      );
      if (unitIsInTailOfOtherPotentialHeads) {
        // unit is not a potential head.
      } else {
        // unit is a potential head
        newMightBeHeads.push(unit);
      }
      mightBeHeads = [...newMightBeHeads];
    }
    return mightBeHeads;
  }
  /**
   * Iterate over the possible paths from the provided head, finding the ones with the greatest strain.
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
   * This would pull a lot on  `F->E` and `H->G` in terms of sorting, possibly causing a lot of edge intersections
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
   * This result is much more balanced because our mess is contained as much as we can get it.
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
   * @param unavailableUnits The units that are not available for use
   * @returns a list of chains with the same amount of strain
   */
  getMostStrainedPathsFromUnitWithoutUnits(
    head: TaskUnit,
    unavailableUnits: TaskUnit[]
  ): IsolatedDependencyChain[] {
    const potentialPaths: IsolatedDependencyChain[] = [];
    // Filter out the parents that we can't use.
    const availableParents = [...head.directDependencies].filter(
      (dep) => !unavailableUnits.includes(dep)
    );
    // Iterate over the remaining parents to get their potential paths.
    for (let parent of availableParents) {
      const potentialParentPaths =
        this.getMostStrainedPathsFromUnitWithoutUnits(parent, unavailableUnits);
      for (let path of potentialParentPaths) {
        potentialPaths.push(new IsolatedDependencyChain([head, ...path.units]));
      }
    }
    potentialPaths.sort((prev, next) => {
      // use the sum of the strain of all units in the chain (more preferred)
      const nextStrain = this.getStrainOfChain(next);
      const prevStrain = this.getStrainOfChain(prev);
      const strainDiff = nextStrain - prevStrain;
      return strainDiff;
    });
    const mostStrainedChains: IsolatedDependencyChain[] = [];
    for (let chain of potentialPaths) {
      const firstChain = mostStrainedChains[0];
      if (firstChain === undefined) {
        // first iteration so add and move to the next;
        mostStrainedChains.push(chain);
        continue;
      } else if (
        this.getStrainOfChain(chain) < this.getStrainOfChain(firstChain)
      ) {
        // none of the remaining chains can compete, so stop searching
        break;
      }
      // The chain must have the same strain as the first chain, so add it and move to the next
      mostStrainedChains.push(chain);
    }
    if (mostStrainedChains.length === 0) {
      // No available parents, so this is automatically the most preferred chain, i.e. a chain containing only itself,
      // because it has nowhere left to go.
      mostStrainedChains.push(new IsolatedDependencyChain([head]));
    }
    return mostStrainedChains;
  }
  /**
   * Get the total strain for all units in the chain.
   *
   * @param chain the chain to get the total strain of
   * @returns how much strain the chain has
   */
  getStrainOfChain(chain: IsolatedDependencyChain): number {
    return chain.units.reduce(
      (sum, unit) => sum + this.getStrainOfUnit(unit),
      0
    );
  }
}
