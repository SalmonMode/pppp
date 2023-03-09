import { NoSuchChainPathError } from "@errors";
import type ITaskUnit from "@typing/ITaskUnit";
import type { ResourceMap } from "@typing/Mapping";
import type IChainPath from "@typing/Relations/IChainPath";
import type IChainStrainMap from "@typing/Relations/IChainStrainMap";
import type IIsolatedDependencyChain from "@typing/Relations/IIsolatedDepedencyChain";
import type ISimpleChainMap from "@typing/Relations/ISimpleChainMap";
import type ISimpleChainPathMap from "@typing/Relations/ISimpleChainPathMap";
import type IStressManager from "@typing/Relations/IStressManager";
import type IStressTracker from "@typing/Relations/IStressTracker";
import type ITaskUnitCluster from "@typing/Relations/ITaskUnitCluster";
import { assertIsObject } from "primitive-predicates";
import { v4 as uuidv4 } from "uuid";
import ChainStrainMap from "./ChainStrainMap";
import SimpleChainMap from "./SimpleChainMap";
import SimpleChainPathMap from "./SimpleChainPathMap";
import StressManager from "./StressManager";
import StressTracker from "./StressTracker";

/**
 * A collection of interconnected {@link ITaskUnit}s, along with helpful functions to make reasoning about them easier.
 *
 * Organizing the many units in a coherent way on a graph will require some work to figure out. There needs to be an
 * orchestrating mechanism between the units and chains, and that's what this class does.
 *
 * One piece of the puzzle is figuring out a helpful way to break up the units into various chains. This will help with
 * creating more abstract chunks of visual information that can be ordered above or below depending on what would be
 * most helpful as well as what would reduce the amount of edge intersections. How these are broken up will be based
 * around getting the most dense chains figured out first.
 */
export default class TaskUnitCluster implements ITaskUnitCluster {
  public readonly id: string;
  strainMap: IChainStrainMap;
  chainMap: ISimpleChainMap;
  private _chainToPathMap: ResourceMap<IChainPath> = {};
  private _paths: IChainPath[] = [];
  private _pathMap: ResourceMap<IChainPath> = {};
  private _simplePathMap: ISimpleChainPathMap;
  stressTracker: IStressTracker;
  stressManager: IStressManager;
  constructor(public readonly heads: ITaskUnit[]) {
    this.id = uuidv4();
    this.chainMap = new SimpleChainMap(heads);
    this.strainMap = new ChainStrainMap(this.chainMap);
    this._buildPaths([]);
    this._simplePathMap = new SimpleChainPathMap(this._pathMap, this.chainMap);
    this.stressTracker = new StressTracker(this._simplePathMap);
    this.stressManager = new StressManager(this.stressTracker);
  }
  /**
   * The paths determined for this cluster.
   */
  get paths(): IChainPath[] {
    return [...this._paths];
  }
  get pathsSortedByRanking(): IChainPath[] {
    const rankings = this.stressManager.getRankings();
    const paths: IChainPath[] = [];
    for (const rankedId of rankings) {
      const path = this._pathMap[rankedId];
      assertIsObject(path);
      paths.push(path);
    }
    return paths;
  }
  /**
   * Gets the path of the chain provided.
   *
   * @throws {@link NoSuchChainPathError} if there is no path for the provided chain in this cluster.
   *
   * @param chain
   * @returns the path of the chain provided, if one exists
   */
  getPathOfChain(chain: IIsolatedDependencyChain): IChainPath {
    const path = this._chainToPathMap[chain.id];
    if (path === undefined) {
      throw new NoSuchChainPathError(
        `No path exists in this cluster for a chain with ID ${chain.id}`
      );
    }
    return path;
  }
  /**
   *
   * @returns The {@link IIsolatedDependencyChain}s in the cluster that no other chains are dependent on.
   */
  private _getHeadsWithoutChains(
    unavailableChains: IIsolatedDependencyChain[]
  ): IIsolatedDependencyChain[] {
    const unavailableUnits: ITaskUnit[] = unavailableChains.reduce<ITaskUnit[]>(
      (acc: ITaskUnit[], chain: IIsolatedDependencyChain): ITaskUnit[] => {
        return [...acc, ...chain.units];
      },
      []
    );
    const headUnits =
      this.strainMap.chainMap.unitPathMatrix.getHeadUnitsWithoutIsolatedUnit(
        unavailableUnits
      );
    const headChains = headUnits.map(
      (unit: ITaskUnit): IIsolatedDependencyChain =>
        this.strainMap.chainMap.getChainOfUnit(unit)
    );
    return headChains;
  }
  /**
   * Build the paths of chains that will comprise the horizontal rows on the graph.
   *
   * These paths are based on what is preferred from the perspective of each chain. It works by first finding the
   * eligible "heads", i.e., the chains that no other chains in the cluster (or at least no already used chains) depend
   * on. Then, of those heads, it finds the one with the greatest preference according to how the sorting works
   * Whichever chain wins is stored, and its chains are marked as "isolated" making them off limits to other chains in
   * recursive calls. Then, the available heads are figured out again, and the process is repeated until no available
   * heads remain.
   */
  private _buildPaths(isolatedChains: IIsolatedDependencyChain[]): void {
    // start by getting the available heads.
    const heads = this._getHeadsWithoutChains(isolatedChains);
    // Rely on the strain map to figure out the preffered path for that given head. The best path for each head will
    // be compared against the others, finding the most preferred out of all of them. It will then be stored, its chains
    // marked as off limits, and this function will be called again with the updated list of off limits chains.
    const pathsForHeads = heads.map(
      (head: IIsolatedDependencyChain): IChainPath[] =>
        this.strainMap.getPathsMostFamiliarWithChainWithoutChains(
          head,
          isolatedChains
        )
    );
    const potentialPreferredPaths: IChainPath[] = pathsForHeads.reduce<
      IChainPath[]
    >(
      (acc: IChainPath[], chains: IChainPath[]): IChainPath[] => [
        ...acc,
        ...chains,
      ],
      []
    );
    // Sort the chains.
    const sortedPaths = this._getSortedPaths(potentialPreferredPaths);
    const nextMostDensePath = sortedPaths[0];
    if (nextMostDensePath === undefined) {
      // There must not have been any remaining heads left, so we're done building the chains.
      return;
    }
    nextMostDensePath.chains.forEach(
      (chain: IIsolatedDependencyChain): void => {
        isolatedChains.push(chain);
        this._chainToPathMap[chain.id] = nextMostDensePath;
      }
    );
    this._paths.push(nextMostDensePath);
    this._pathMap[nextMostDensePath.id] = nextMostDensePath;
    // Dive back in to get the next path
    this._buildPaths(isolatedChains);
  }
  /**
   * Take a list of paths, and return a new array containing them sorted in the preferred order.
   *
   * @param paths The list of paths to sort in the preferred order
   * @returns a new array of the same paths, in the preferred order
   */
  private _getSortedPaths(paths: IChainPath[]): IChainPath[] {
    const sortedPaths = [...paths];
    sortedPaths.sort((prev: IChainPath, next: IChainPath): number => {
      // use the sum of the relative familiarity of all chains in the path (more preferred)
      const nextFamiliarity = this.strainMap.getRelativeFamiliarityOfPath(next);
      const prevFamiliarity = this.strainMap.getRelativeFamiliarityOfPath(prev);
      const familiarityDiff = nextFamiliarity - prevFamiliarity;
      if (familiarityDiff === 0) {
        // use the sum of the strain of all units in the chain (more preferred)
        const nextStrain = this.strainMap.getStrainOfPath(next);
        const prevStrain = this.strainMap.getStrainOfPath(prev);
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
      }
      return familiarityDiff;
    });
    return sortedPaths;
  }
}
