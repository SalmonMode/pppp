import { v4 as uuidv4 } from "uuid";
import { DependencyOrderError } from "../Error";
import type { IsolatedDependencyChain, TaskUnit } from "./";

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
 * on outside of themselves, a single chain will not enforce that it has the most preferred density. It will only manage
 * information about the units passed to it. A chain being created does not mean that it will be used to render the
 * graph. It will, however, at least make sure the units passed are a linear, unbroken chain.
 */
export default class ChainPath {
  public id: string;
  private _chainInitialStartDate: Date;
  private _units: Set<TaskUnit>;
  private _head: IsolatedDependencyChain;
  private _tail: IsolatedDependencyChain[];
  private _lastChain: IsolatedDependencyChain;
  private _pathTotalTime: number;
  private _pathPresenceTime: number;
  public tracks: TaskUnit[][];
  constructor(public readonly chains: IsolatedDependencyChain[]) {
    this.id = uuidv4();
    this._verifyUnitsAreUnbrokenChain();
    const copyOfChains = [...this.chains];
    let chain = copyOfChains.shift();
    if (chain === undefined) {
      throw new RangeError("Must provide at least 1 IsolatedDependencyChain");
    }
    this._head = chain;
    this._tail = copyOfChains;
    this._lastChain = this._tail[this._tail.length - 1] || this.head;
    this._chainInitialStartDate = this._lastChain.initialStartDate;

    this._pathTotalTime =
      this.endDate.getTime() - this.initialStartDate.getTime();
    this._pathPresenceTime = this.chains.reduce(
      (sum, curr) => sum + curr.presenceTime,
      0
    );
    this._units = new Set<TaskUnit>();
    for (let chain of this.chains) {
      for (let unit of chain.units) {
        this._units.add(unit);
      }
    }
    this.tracks = this._buildTracks();
  }
  /**
   * The latest {@link IsolatedDependencyChain} in the path.
   *
   * Where the path ends, is where this chain ends as well. This chain depends on all other chains in this path.
   */
  get head(): IsolatedDependencyChain {
    return this._head;
  }
  /**
   * Make sure all the chains passed to the constructor are an unbroken path, with each chain explicitely depending on
   * the next in the array.
   */
  private _verifyUnitsAreUnbrokenChain(): void {
    const copyOfChains = [...this.chains];
    let chain = copyOfChains.shift();
    while (chain !== undefined) {
      const nextChain = copyOfChains.shift();
      if (nextChain !== undefined) {
        if (!chain.lastUnit.directDependencies.has(nextChain.head)) {
          throw new DependencyOrderError(
            "Chains must be provided in the order they are dependent on each other."
          );
        }
      }
      chain = nextChain;
    }
    // Nothing more to check, so all chains must be a path, and in the proper order.
  }
  /**
   * The final point in time this path has presence.
   */
  get endDate(): Date {
    return this.head.endDate;
  }
  /**
   * The earliest point in time for this path of {@link IsolatedDependencyChain}s that has presence.
   */
  get initialStartDate(): Date {
    return this._chainInitialStartDate;
  }
  /**
   * The amount of milliseconds from the start of the last item in the path to the end date of the head.
   */
  get timeSpan(): number {
    return this._pathTotalTime;
  }
  /**
   * The amount of presence this path of chains has in total.
   */
  get presenceTime(): number {
    return this._pathPresenceTime;
  }
  /**
   * The amount of visual presence the chains in the path collectively have, divided by the timespan of the path.
   *
   * This is exactly what it sounds like. Chains in a given path may not be able to be placed directly to the sides pf
   * each other because of how they've lagged behind, and those snail trails still needing to be displayed without being
   * obscured. This means that the amount of presence the chains in a path can collectively have can exceed 1 unit of
   * space for every 1 unit of time. There can also be other things spacing the units apart, so the density can still be
   * less than one.
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
   * While the first is very clean and preferred, this will almost never be what happens in a real project. The second
   * and third diagrams are far more likely (the third looking this way probably because of other dependencies not in
   * the path).
   */
  get visualDensity(): number {
    return this.presenceTime / this.timeSpan;
  }
  overlapsWithPath(otherPath: ChainPath): boolean {
    if (
      this.initialStartDate <= otherPath.endDate &&
      this.endDate >= otherPath.initialStartDate
    ) {
      return true;
    }
    return false;
  }
  private _buildTracks(): TaskUnit[][] {
    const tracks: TaskUnit[][] = [[]];
    // Units should already be sorted from latest to earliest
    const tasks = [...this._units];
    // Sort them according to initial start date so they go from latest to earliest just to be safe.This is to help
    // layer the tracks in a way that shows them branching away from the center (as needed) as time goes on, rather than
    // starting out in open space and moving towards the center.
    tasks.sort(
      (a, b) => b.initialStartDate.getTime() - a.initialStartDate.getTime()
    );
    let nextTask = tasks.pop();
    while (nextTask) {
      // nextTask is used for loop logic, so track the current task for easier type safety
      const currentTask: TaskUnit = nextTask;
      for (let track of tracks) {
        // check if this can squeeze in after the last task on this track
        const lastItemInTrack = track[track.length - 1];
        if (!lastItemInTrack) {
          // No item in this track, which means this must be the first track and our first run through both loops.
          track.push(currentTask);
          nextTask = tasks.pop();
          break;
        } else if (lastItemInTrack.endDate <= currentTask.initialStartDate) {
          // It can fit in this track, so add it here and move on to the next track.
          track.push(currentTask);
          nextTask = tasks.pop();
          break;
        }
        // Can't fit in this track, so move on to the next track (if there is one).
      }
      if (nextTask === currentTask) {
        // Didn't find a place to put it. It must not fit in any of the tracks, so add a new one with the current task.
        tracks.push([currentTask]);
        nextTask = tasks.pop();
      }
    }
    return tracks;
  }
}
