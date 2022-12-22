import TaskUnit from "./TaskUnit";
import { v4 as uuidv4 } from "uuid";
import { DependencyOrderError } from "../Error";

/**
 * A set of {@link TaskUnit}s that comprise a single "chain", i.e., one that will be positioned on the graph as a row.
 *
 * In order to make visualizing the dependencies coherent and as organized as possible, the {@link TaskUnit}s must first
 * be broken apart into "isolated" rows that can show a linear dependency between each other. Because there will be
 * issues with this, given that each {@link TaskUnit} can have multiple dependencies, there must be some way to decide
 * how to break things up. The method chosen is to focus on "visual density", with more dense chains being given
 * priority for maintaining their linear sequence.
 *
 * "Chains" are the path from a "head" to the end of a "tail". Heads are {@link TaskUnit}s that either no other
 * {@link TaskUnit} is dependent on, or the ones that depend on it are already used in other chains, making them
 * "unavailable". The ends of tails are the furthest possible task unit in the chain of dependencies that either has no
 * other dependencies, or it is dependent on only units that are already used in other chains.
 *
 * For example, given the following:
 *
 * ```text
 *  A----B---------   ----D-----E
 *                 \ /
 *                  C
 *                 / \
 *          F------   ---------G---H
 * ```
 *
 * The highest density chain would be `F-C-D-E`, so it will be broken out first. This leaves `A-B`, `F`, and `G-H` as
 * their own {@link IsolatedDependencyChain}s. `F-C-D-E` could technically be more dense without `E`, or by excluding
 * `F`, but to simplify things, it goes all the way to whatever tail ends it can, as mentioned before.
 *
 * This is part of a large, complex sorting system to help reduce the amount of edge intersections between chains as
 * well as provide a means of visually balancing how the chains are placed on the graph (so that it doesn't turn into a
 * giant slope, making the graph very tall).
 *
 * Because chains like these can be used for a variety of reasons, and they cannot have ultimate knowledge of what goes
 * on outside of themselves, a single chain will not enforce that it has the most ideal density. It will only manage
 * information about the units passed to it. A chain being created does not mean that it will be used to render the
 * graph. It will, however, at least make sure the units passed are a linear, unbroken chain.
 */
export default class IsolatedDependencyChain {
  public readonly id: string;
  private _chainInitialStartDate: Date;
  private _head: TaskUnit;
  private _tail: TaskUnit[];
  private _chainTotalTime: number;
  private _chainPresenceTime: number;
  private _externalDependencies: Set<TaskUnit>;
  constructor(public readonly units: TaskUnit[]) {
    this.id = uuidv4();
    this._verifyUnitsAreUnbrokenChain();
    const copyOfUnits = [...this.units];
    let unit = copyOfUnits.shift();
    if (unit === undefined) {
      throw new RangeError("Must provide at least 1 TaskUnit");
    }
    this._head = unit;
    this._tail = copyOfUnits;
    const lastItemInTail = this._tail[this._tail.length - 1] || this.head;
    this._chainInitialStartDate = lastItemInTail.initialStartDate;

    this._chainTotalTime =
      this.endDate.getTime() - this.initialStartDate.getTime();
    this._chainPresenceTime = this.units.reduce(
      (sum, curr) => sum + curr.presenceTime,
      0
    );
    this._externalDependencies = this._getExternalDependencies();
  }
  /**
   * The latest {@link TaskUnit} in the chain.
   *
   * Where the chain ends, is where this unit ends as well. This unit depends on all other units in this chain.
   */
  get head(): TaskUnit {
    return this._head;
  }
  /**
   * make sure all the units passed to the constructor are an unbroken chain, with each unit explicitely depending on
   * the next in the array.
   */
  private _verifyUnitsAreUnbrokenChain(): void {
    const copyOfUnits = [...this.units];
    let unit = copyOfUnits.shift();
    while (unit !== undefined) {
      const nextUnit = copyOfUnits.shift();
      if (nextUnit !== undefined) {
        if (!unit.directDependencies.has(nextUnit)) {
          throw new DependencyOrderError(
            "Units must be provided in the order they are dependent on each other."
          );
        }
      }
      unit = nextUnit;
    }
    // Nothing more to check, so all units must be a chain, and in the proper order.
  }
  /**
   * The final point in time this chain has presence.
   */
  get endDate(): Date {
    return this.head.endDate;
  }
  /**
   * The earliest point in time for this chain of {@link TaskUnit}s that has presence.
   */
  get initialStartDate(): Date {
    return this._chainInitialStartDate;
  }
  /**
   * The amount of milliseconds from the start of the last item in the chain to the end date of the head.
   */
  get timeSpan(): number {
    return this._chainTotalTime;
  }
  /**
   * The amount of presence this chain of units has in total.
   */
  get presenceTime(): number {
    return this._chainPresenceTime;
  }
  /**
   * The amount of visual presence the units in the chain collectively have, divided by the timespan of the chain.
   *
   * This is exactly what it sounds like. Task units in a given chain may not be able to be placed directly to the sides
   * of each other because of how they've lagged behind, and those snail trails still needing to be displayed without
   * being obscured. This means that the amount of presence the units in a chain can collectively have can exceed 1 unit
   * of space for every 1 unit of time. There can also be other things spacing the units apart, so the density can still
   * be less than one.
   *
   * For example, a chain could look like this:
   *
   * ```text
   *     ┏━━━━━━━┳━━━━━━━┳━━━━━━━┓
   *     ┗━━━━━━━┻━━━━━━━┻━━━━━━━┛
   * ```
   *
   * Like this:
   *
   * ```text
   *              ┬┬┬┬┬┬┬┏━━━━━━━┓
   *              ┴┴┴┴┴┴╱┗━━━━━━━┛╲
   *   ┬┬┬┬┬┬┬┏━━━━━━━┓╱     ┬┬┬┬┬┬╲┏━━━━━━━┓
   *   ┴┴┴┴┴┴┴┗━━━━━━━┛      ┴┴┴┴┴┴┴┗━━━━━━━┛
   * ```
   *
   * Or this:
   *
   * ```text
   *     ┏━━━━━━━┓_______┏━━━━━━━┓_______┏━━━━━━━┓
   *     ┗━━━━━━━┛       ┗━━━━━━━┛       ┗━━━━━━━┛
   * ```
   *
   * The first has a density of about 1. The second is much greater than 1. And the third is much lower than 1.
   *
   * While the first is very clean and ideal, this will almost never be what happens in a real project. The second
   * and third diagrams are far more likely (the third looking this way probably because of other dependencies not in
   * the chain). Bringing the most visual density to the center is ideal from an awareness perspective, not only because
   * it gets the most amount of information in the center of the screen as possible, but also because it brings the most
   * problematic things closer to the center.
   */
  get visualDensity(): number {
    return this.presenceTime / this.timeSpan;
  }
  /**
   * All the {@link TaskUnit}s not in this chain that the units in this chain are directly dependent on.
   *
   * For example, given the following chains:
   *
   * ```text
   *  Chain 1:      A---B
   *                 \ /
   *  Chain 2:  F-----C---D-----E
   *                   \ /
   *  Chain 3:     G----H-------I
   * ```
   *
   * Chain 3 is dependent on `C`. It's also connected to Chain 2 through `D`'s dependency on H, but the list of external
   * dependencies for Chain 3 would only include `C`.
   *
   * This is only used in the constructor to get a cached version of this set.
   */
  private _getExternalDependencies(): Set<TaskUnit> {
    const dependencies: Set<TaskUnit> = new Set<TaskUnit>();
    for (let unit of this.units) {
      const unitParents = unit.directDependencies;
      for (let parentalUnit of unitParents) {
        if (!this.units.includes(parentalUnit)) {
          dependencies.add(parentalUnit);
        }
      }
    }
    return dependencies;
  }
  /**
   * All the {@link TaskUnit}s not in this chain that the units in this chain are directly dependent on.
   *
   * For example, given the following chains:
   *
   * ```text
   *  Chain 1:      A---B
   *                 \ /
   *  Chain 2:  F-----C---D-----E
   *                   \ /
   *  Chain 3:     G----H-------I
   * ```
   *
   * Chain 3 is dependent on `C`. It's also connected to Chain 2 through `D`'s dependency on H, but the list of external
   * dependencies for Chain 3 would only include `C`.
   */
  getExternalDependencies(): Set<TaskUnit> {
    return this._externalDependencies;
  }
}
