import { NoSuchChainPathError } from "@errors";
import type {
  InterconnectionStrengthMapping,
  ITaskUnit,
  RelationshipMapping,
  ResourceMap,
} from "@types";
import type { ChainPath, IsolatedDependencyChain, SimpleChainMap } from "./";

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
export default class SimpleChainPathMap {
  paths: ChainPath[];
  connectionStrengthMapping: InterconnectionStrengthMapping = {};
  constructor(
    private _pathMap: ResourceMap<ChainPath>,
    public chainMap: SimpleChainMap
  ) {
    this.paths = [...Object.values(this._pathMap)];
    this._buildPathInterconnections();
  }
  getPathById(pathId: ChainPath["id"]): ChainPath {
    const path = this._pathMap[pathId];
    if (!path) {
      throw new NoSuchChainPathError(
        `No chain path could be found with the ID ${pathId}`
      );
    }
    return path;
  }
  getConnectionsForPathById(pathId: ChainPath["id"]): RelationshipMapping {
    const connections = this.connectionStrengthMapping[pathId];
    if (!connections) {
      throw new NoSuchChainPathError(
        `No chain path could be found with the ID ${pathId}`
      );
    }
    return connections;
  }
  /**
   * Build a map showing which paths are connected to which paths.
   */
  private _buildPathInterconnections(): void {
    for (const path of this.paths) {
      // Get the units that the units in this path have a connection to. This will tell us which other paths this path
      // is connected to, and in how many ways. The number of units it's connected to in another path is equal to the
      // amount of connections, and thus, the amount of edges we'd need to draw between the two paths.
      const unitsConnectedToUnitsInPath = this._getUnitsConnectedToPath(path);
      const pathsUnits = this._getUnitsInPath(path);
      // make sure the mapping exists
      const mapping: RelationshipMapping = (this.connectionStrengthMapping[
        path.id
      ] = {});
      for (const otherPath of this.paths) {
        if (path === otherPath) {
          // same path so don't need to do anything
          continue;
        }
        let connections = 0;
        if (unitsConnectedToUnitsInPath.size > 0) {
          // make sure the other path's mapping exists
          const otherMapping = this.connectionStrengthMapping[otherPath.id];
          if (otherMapping) {
            // otherPath was already iterated over, so if it has a connection to the main path, then we can just copy
            // it. If it has no connections, then we can move on to the next otherPath.
            const otherPathRelationshipToPath = otherMapping[path.id];
            if (otherPathRelationshipToPath) {
              // otherPath has connections to main path, so let's copy it, remove the units it has from the main path's
              // set of connected units (to speed up the next iterations), and then move on to the next otherPath.
              mapping[otherPath.id] = otherPathRelationshipToPath;
              const otherPathsUnits = this._getUnitsInPath(otherPath);
              otherPathsUnits.forEach((unit: ITaskUnit): void => {
                unitsConnectedToUnitsInPath.delete(unit);
              });
            } else {
              // otherPath has no connections to main path, so we can move on to the next otherPath
            }
            continue;
          }
          // otherPath has not been iterated over yet, so we have to figure out the relationship.
          const otherPathsUnits = this._getUnitsInPath(otherPath);
          // Use a copy of the connected units set to avoid issues with modification while iterating
          for (const connectedUnit of [...unitsConnectedToUnitsInPath]) {
            if (otherPathsUnits.has(connectedUnit)) {
              // Found a connection, so check how many connections there are before removing the unit from the set to
              // speed up the next iterations.
              for (const unit of pathsUnits) {
                if (unit.directDependencies.has(connectedUnit)) {
                  connections += 1;
                } else if (connectedUnit.directDependencies.has(unit)) {
                  connections += 1;
                }
              }
              // We can remove the connected unit, because it can only exist in otherPath, and if we already know it
              // exists in otherPath, we don't need to check if it exists in the other paths we have yet to iterate
              // over. Removing it speeds up the remaining iterations of the inner loop.
              unitsConnectedToUnitsInPath.delete(connectedUnit);
            }
          }
          if (connections > 0) {
            // There were at least some connections to otherPath, so record them.
            mapping[otherPath.id] = connections;
          }
        } else {
          // Either the path has nothing connected to it at all, or we already know all the other paths it's connected
          // to and by how many connections. Either way, it has zero connections to otherPath, so we don't need to add
          // an entry for it.
        }
      }
    }
  }
  /**
   * Get all the units not in the provided path that have a direct connection to/from the units in the path.
   *
   * @param path
   * @returns a set of units not in the provided path that have a direct connection to/from the units in the path
   */
  private _getUnitsConnectedToPath(path: ChainPath): Set<ITaskUnit> {
    const unitsInPath = this._getUnitsInPath(path);
    const unitsConnectedToUnitsInPath = new Set<ITaskUnit>();
    for (const unit of unitsInPath) {
      const connectedUnitsOfUnit =
        this.chainMap.unitPathMatrix.getUnitsConnectedToUnit(unit);
      for (const connectedUnit of connectedUnitsOfUnit) {
        if (unitsInPath.has(connectedUnit)) {
          // Filtering out units already in the path
          continue;
        }
        unitsConnectedToUnitsInPath.add(connectedUnit);
      }
    }
    return unitsConnectedToUnitsInPath;
  }
  /**
   * Get all the units in the path.
   *
   * @param path
   * @returns A set of task units that are a part of the provided path
   */
  private _getUnitsInPath(path: ChainPath): Set<ITaskUnit> {
    return new Set<ITaskUnit>(
      path.chains.reduce<ITaskUnit[]>(
        (acc: ITaskUnit[], chain: IsolatedDependencyChain): ITaskUnit[] => [
          ...acc,
          ...chain.units,
        ],
        []
      )
    );
  }
}
