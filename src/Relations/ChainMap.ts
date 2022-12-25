import { NoSuchChainError } from "../Error";
import {
  InterconnectionStrengthMapping,
  IsolatedChainMapping,
  RelationshipMapping,
  UnitToChainMap,
} from "../types";
import IsolatedDependencyChain from "./IsolatedDependencyChain";
import StrainMap from "./StrainMap";
import TaskUnit from "./TaskUnit";

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
export default class ChainMap {
  private _chains: IsolatedDependencyChain[] = [];
  private _unitToChainMap: UnitToChainMap = {};
  private _chainMap: IsolatedChainMapping = {};
  private _chainInterconnectionStrengthMap: InterconnectionStrengthMapping = {};
  constructor(public readonly strainMap: StrainMap) {
    this._buildNextMostPreferredChainWithoutIsolatedUnits();
    this._mapChainInterconnections();
  }
  get chains(): IsolatedDependencyChain[] {
    return this._chains;
  }
  /**
   * Build the chains of units that will comprise the horizontal rows on the graph.
   *
   * These chains are based on what is preferred according to each unit. It works by first finding the eligible "heads",
   * i.e., the units that no other units (or at least no already chained units) depend on. Then, of those heads, it
   * finds the one with the greatest preference according to how the sorting works. Whichever chain wins is stored, and
   * its units are marked as "isolated" making them off limits to other chains in recursive calls. Then, the available
   * heads are figured out again, and the process is repeated until no available heads remain.
   */
  private _buildNextMostPreferredChainWithoutIsolatedUnits(
    isolatedUnits: TaskUnit[] = []
  ) {
    let heads = this.getHeadsWithoutUnits(isolatedUnits);
    const chainsForHeads = heads.map((head) =>
      this.strainMap.getMostStrainedPathsFromUnitWithoutUnits(
        head,
        isolatedUnits
      )
    );
    const potentialPreferredChains: IsolatedDependencyChain[] =
      chainsForHeads.reduce((acc, chains) => [...acc, ...chains], []);
    // Sort the chains.
    potentialPreferredChains.sort((prev, next) => {
      // use total strain (more preferred)
      const nextStrain = this.strainMap.getStrainOfChain(next);
      const prevStrain = this.strainMap.getStrainOfChain(prev);
      const strainDiff = nextStrain - prevStrain;
      if (strainDiff === 0) {
        // use density to sort (more preferred)
        const densityDiff = next.visualDensity - prev.visualDensity;
        if (densityDiff === 0) {
          // same density, so use amount of presence (more preferred)
          const presenceDiff = next.presenceTime - prev.presenceTime;
          return presenceDiff;
        }
        return densityDiff;
      }
      return strainDiff;
    });
    const nextMostDenseChain = potentialPreferredChains[0];
    if (nextMostDenseChain === undefined) {
      // There must not have been any remaining heads left, so we're done building the chains.
      return;
    }
    nextMostDenseChain.units.forEach((unit) => {
      isolatedUnits.push(unit);
      this._unitToChainMap[unit.id] = nextMostDenseChain;
    });
    this._chains.push(nextMostDenseChain);
    this._chainMap[nextMostDenseChain.id] = nextMostDenseChain;
    this._buildNextMostPreferredChainWithoutIsolatedUnits(isolatedUnits);
  }
  /**
   * Run through the established chains and figure out how they are connected to each other.
   */
  private _mapChainInterconnections(): void {
    for (let chain of this._chains) {
      // make sure this chain has a strength mapping started.
      const mapForChain = this.getStrengthMapForChain(chain);
      const deps = chain.getExternalDependencies();
      for (let dep of deps) {
        const externalChain = this.getChainOfUnit(dep);
        // Add the number of dependencies this chain has on the chain it is dependent on
        // Set the default relationship details if they haven't been set yet. The strength is set to 0 by default so the
        // following logic can operate assuming the other chain already set it up. If the other other chain hasn't, it's
        // only because it hasn't been iterated over yet or it doesn't have any dependencies on this chain. In the case
        // of the latter, it doesn't need to add anything anyway. In the case of the former, the other chain will still
        // get its chance to add to the total.
        let numOfConnectionsSoFar = this.getNumberOfConnectionsBetweenChains(
          chain,
          externalChain
        );
        // Add 1 to account for this chain being dependent on this 'dep' unit. Since a set is being used to track the
        // dependency units for this chain as a whole, if another unit in this chain were explicitely dependent on this
        // dep, there's no risk of it being counted for twice. This is preferred because the explicit dependency would
        // be redundant anyway, and we're more concerned about minimizing the amount of visual lines being drawn to
        // connect units that would overlap other things.
        numOfConnectionsSoFar += 1;
        mapForChain[externalChain.id] = numOfConnectionsSoFar;
        // Add the reverse connection. Follows the same reasoning as above.
        const otherMapForChain = this.getStrengthMapForChain(externalChain);
        let numOfConnectionsSoFarFromOtherSide =
          this.getNumberOfConnectionsBetweenChains(externalChain, chain);
        numOfConnectionsSoFarFromOtherSide += 1;
        otherMapForChain[chain.id] = numOfConnectionsSoFarFromOtherSide;
      }
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
  getChainById(id: IsolatedDependencyChain["id"]): IsolatedDependencyChain {
    const chain = this._chainMap[id];
    if (chain === undefined) {
      throw new NoSuchChainError(`No chain found with ID: ${id}`);
    }
    return chain;
  }
  getChainsConnectedToChain(
    chain: IsolatedDependencyChain
  ): Set<IsolatedDependencyChain> {
    const map = this.getStrengthMapForChain(chain);
    return new Set(Object.keys(map).map((key) => this.getChainById(key)));
  }
  /**
   *
   * @returns The {@link TaskUnit}s in the cluster that no other {@link TaskUnit}s are dependent on.
   */
  getHeadsWithoutUnits(unavailableUnits: TaskUnit[]): TaskUnit[] {
    const availableUnits = this.strainMap.units.filter(
      (unit) => !unavailableUnits.includes(unit)
    );
    let mightBeHeads: TaskUnit[] = [];
    for (let unit of availableUnits) {
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
   *
   * @param chain The chain to get the strength map for
   * @returns The object detailing how strongly a chain is attached to other chains
   */
  getStrengthMapForChain(chain: IsolatedDependencyChain): RelationshipMapping {
    let chainRelationships = this._chainInterconnectionStrengthMap[chain.id];
    if (chainRelationships === undefined) {
      // chain has no established map yet. But may be part of the cluster.
      if (!this.ownsChain(chain)) {
        // chain is not part of this cluster
        throw new NoSuchChainError(`No chain was found with ID ${chain.id}`);
      }
      // chain is part of this cluster, so set up its strength map
      chainRelationships = this._chainInterconnectionStrengthMap[chain.id] = {};
    }
    return chainRelationships;
  }
  /**
   * Whether or not the passed chain is a part of this cluster or not.
   *
   * @param chain The chain to check for
   * @returns true, if chain is part of this cluster, false, if not
   */
  ownsChain(chain: IsolatedDependencyChain): boolean {
    return chain.id in this._chainMap;
  }
  /**
   * Get the number of direct connections between two chains.
   *
   * This refers to connections going in both directions.
   *
   * @param chain A chain of units
   * @param otherChain A chain of units
   * @returns a number detailing how strongly attached these chains are to each other
   */
  getNumberOfConnectionsBetweenChains(
    chain: IsolatedDependencyChain,
    otherChain: IsolatedDependencyChain
  ): number {
    const chainRelationships = this.getStrengthMapForChain(chain);
    let numOfConnections: number | undefined =
      chainRelationships[otherChain.id];

    if (numOfConnections === undefined) {
      // chain is not connected to other chain, but other chain might still be part of the same cluster
      if (!this.ownsChain(otherChain)) {
        // other chain is not part of this cluster
        throw new NoSuchChainError(`No chain was found with ID ${chain.id}`);
      }
      // other chain is part of this cluster, so we can safely describe its relationship
      numOfConnections = 0;
    }
    return numOfConnections;
  }
}
