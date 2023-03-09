import type ITaskUnit from "@typing/ITaskUnit";
import type IChainPath from "@typing/Relations/IChainPath";
import type IChainStrainMap from "@typing/Relations/IChainStrainMap";
import type IIsolatedDependencyChain from "@typing/Relations/IIsolatedDepedencyChain";
import type ISimpleChainMap from "@typing/Relations/ISimpleChainMap";
import type IStressManager from "@typing/Relations/IStressManager";
import type IStressTracker from "@typing/Relations/IStressTracker";

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
export default interface ITaskUnitCluster {
  id: string;
  strainMap: IChainStrainMap;
  chainMap: ISimpleChainMap;
  stressTracker: IStressTracker;
  stressManager: IStressManager;
  heads: ITaskUnit[];
  /**
   * The paths determined for this cluster.
   */
  paths: IChainPath[];
  pathsSortedByRanking: IChainPath[];
  /**
   * Gets the path of the chain provided.
   *
   * @throws {@link NoSuchChainPathError} if there is no path for the provided chain in this cluster.
   *
   * @param chain
   * @returns the path of the chain provided, if one exists
   */
  getPathOfChain(chain: IIsolatedDependencyChain): IChainPath;
}
