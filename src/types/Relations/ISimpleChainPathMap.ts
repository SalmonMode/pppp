import type {
  InterconnectionStrengthMapping,
  RelationshipMapping,
  ResourceID,
} from "@typing/Mapping";
import type IChainPath from "./IChainPath";
import type ISimpleChainMap from "./ISimpleChainMap";

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
export default interface ISimpleChainPathMap {
  paths: IChainPath[];
  connectionStrengthMapping: InterconnectionStrengthMapping;
  chainMap: ISimpleChainMap;
  /**
   *
   * @throws {@link NoSuchChainPathError} when there is no chainpath with that ID.
   *
   * @param pathId
   */
  getPathById(pathId: ResourceID): IChainPath;
  /**
   *
   * @throws {@link NoSuchChainPathError} when there is no chainpath with that ID.
   *
   * @param pathId
   */
  getConnectionsForPathById(pathId: ResourceID): RelationshipMapping;
}
