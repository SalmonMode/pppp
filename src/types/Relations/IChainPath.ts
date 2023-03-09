import type ITaskUnit from "@typing/ITaskUnit";
import type IIsolatedDependencyChain from "./IIsolatedDepedencyChain";

/**
 * A set of {@link ITaskUnit}s that comprise a single "chain", i.e., one that will be positioned on the graph as a row.
 *
 * In order to make visualizing the dependencies coherent and as organized as possible, the {@link ITaskUnit}s must
 * first be broken apart into "isolated" rows that can show a linear dependency between each other. Because there will
 * be issues with this, given that each {@link ITaskUnit} can have multiple dependencies, there must be some way to
 * decide how to break things up. The method chosen is to focus on "visual density", with more dense chains being given
 * priority for maintaining their linear sequence.
 *
 * "Chains" are the path from a "head" to the end of a "tail". Heads are {@link ITaskUnit}s that either no other
 * {@link ITaskUnit} is dependent on, or the ones that depend on it are already used in other chains, making them
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
 * their own {@link IIsolatedDependencyChain}s. `F-C-D-E` could technically be more dense without `E`, or by excluding
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
export default interface IChainPath {
  id: string;
  chains: IIsolatedDependencyChain[];
  tracks: ITaskUnit[][];
  /**
   * The latest {@link IsolatedDependencyChain} in the path.
   *
   * Where the path ends, is where this chain ends as well. This chain depends on all other chains in this path.
   */
  head: IIsolatedDependencyChain;
  /**
   * The final point in time this path has presence.
   */
  endDate: Date;
  /**
   * The earliest point in time for this path of {@link IIsolatedDependencyChain}s that has presence.
   */
  anticipatedStartDate: Date;
  /**
   * The amount of milliseconds from the start of the last item in the path to the end date of the head.
   */
  timeSpan: number;
  /**
   * The amount of presence this path of chains has in total.
   */
  presenceTime: number;
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
  visualDensity: number;
  /**
   * Tells whether or not this chain path's date range overlaps with the other chain path's date range.
   *
   * NOTE: If one date range ends at the same time that the other begins, they are not considered overlapping.
   *
   * @param otherPath The other chain path to compare against
   *
   * @returns true, if their dates overlap, false, if not
   */
  overlapsWithPath(otherPath: IChainPath): boolean;
}
