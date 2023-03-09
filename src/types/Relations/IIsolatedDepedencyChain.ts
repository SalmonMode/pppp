import type ITaskUnit from "@typing/ITaskUnit";

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
export default interface IIsolatedDependencyChain {
  id: string;
  /**
   * The units within the chain.
   */
  units: ITaskUnit[];
  /**
   * The latest {@link ITaskUnit} in the chain.
   *
   * Where the chain ends, is where this unit ends as well. This unit depends on all other units in this chain.
   */
  head: ITaskUnit;
  /**
   * The final point in time this chain has presence.
   */
  endDate: Date;
  /**
   * The earliest point in time for this chain of {@link ITaskUnit}s that has presence.
   */
  anticipatedStartDate: Date;
  /**
   * The amount of milliseconds from the start of the last item in the chain to the end date of the head.
   */
  timeSpan: number;
  /**
   * The amount of presence this chain of units has in total.
   */
  presenceTime: number;
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
   * While the first is very clean and preferred, this will almost never be what happens in a real project. The second
   * and third diagrams are far more likely (the third looking this way probably because of other dependencies not in
   * the chain).
   */
  visualDensity: number;
  /**
   * All the {@link ITaskUnit}s not in this chain that the units in this chain are directly dependent on.
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
  getExternalDependencies(): Set<ITaskUnit>;
  /**
   * The last unit in the chain. This refers to the unit that is earliest in the timeline. All other units in the chain
   * are dependent on this one.
   */
  lastUnit: ITaskUnit;
  /**
   * The number of paths to a given dependency.
   */
  attachmentToDependencies: number;
  /**
   * Given a chain that this chain is dependent on, return the number of paths to that chain from this chain.
   *
   * @param chain the dependency
   */
  getNumberOfPathsToDependency(chain: IIsolatedDependencyChain): number;
  /**
   * Check whether or not the passed chain is a dependency of this chain.
   *
   * @param chain the chain to check if its a dependency
   * @returns true, if this chain is dependent on the passed chain, false, if not
   */
  isDirectlyDependentOn(chain: IIsolatedDependencyChain): boolean;
  /**
   * The units this chain is directly dependent on.
   *
   * This is just a shortcut to reference the direct dependencies of the last unit.
   */
  unitsDirectlyDependentOn: Set<ITaskUnit>;
}
