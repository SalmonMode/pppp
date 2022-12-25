import { v4 as uuidv4 } from "uuid";
import ChainMap from "./ChainMap";
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
 * around getting the most dense chains figured out first.
 */
export default class TaskUnitCluster {
  public readonly id: string;
  /**
   * The amount of paths that lead to a unit plus the amount of paths it leads to.
   */
  private _strainMap: StrainMap;
  private _chainMap: ChainMap;
  constructor(public readonly units: TaskUnit[]) {
    this.id = uuidv4();
    this._strainMap = new StrainMap(this.units);
    this._chainMap = new ChainMap(this._strainMap);
  }
}
