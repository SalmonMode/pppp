import type { RelationshipMapping } from "./Mapping";
import type { TaskEvent, ITaskPrerequisites } from "./TaskUnit";

export default interface ITaskUnit {
  /**
   * The unique ID for the task.
   */
  readonly id: string;
  /**
   * A short summary of the task.
   */
  name: string;
  /**
   * When the task was originally planned to start being worked on.
   *
   * When combined with the {@link anticipatedEndDate}, provides the anticipated duration of the task.
   */
  readonly anticipatedStartDate: Date;
  /**
   * When the task was originally anticipated to be completed by.
   *
   * When combined with the {@link anticipatedStartDate}, provides the anticipated duration of the task.
   */
  readonly anticipatedEndDate: Date;
  /**
   * When the task seems like it will first be started, or when it has already started.
   *
   * This is based off of the original anticipated start date and
   */
  apparentStartDate: Date;
  /**
   * When the task seems like it will be completed, or when it has already completed.
   *
   * This is based off a number of factors, including when the perceived final task iteration can start or has already
   * started, what events have already occurred for the task (if any), and how long the original anticipated duration
   * was.
   *
   */
  apparentEndDate: Date;
  /**
   * The series of events that have already happened.
   */
  explicitEventHistory: TaskEvent[];
  /**
   * The series of events that are projected to happen in the future using the {@link anticipatedEndDate} and
   * {@link anticipatedStartDate} (which gives the anticipated duration), along with the latest apparent end date of its
   * direct dependencies, to determine a reasonable best case scenario for how how the task will play out.
   *
   * For example, if the task has just had an {@link EventType.ReviewedAndNeedsRebuild} event, the projected history
   * would be an {@link EventType.TaskIterationStarted} event at the current date and time (because it is assuming the
   * new prerequisites will be signed off on at any moment), and then an {@link EventType.ReviewedAndAccepted} event at
   * the date and time after that date that reflects the original anticipated duration of the task.
   */
  projectedEventHistory: TaskEvent[];
  /**
   * An array of the versions of prerequisites for this task. The latest entry represents the latest version of the
   * prerequisites.
   */
  prerequisitesIterations: ITaskPrerequisites[];
  /**
   * The amount of "presence" this unit would have on a graph.
   *
   * "Presence":
   *
   * Every {@link ITaskUnit} will need to be rendered on a graph more or less as a rectangle, with a "snail trail"
   * directly behind (if it's been delayed) it to show how much it has been delayed from its original start date. Each
   * unit must have a horizontal space available on the graph to be placed without overlapping the space needed for
   * other {@link ITaskUnit}s.
   *
   * "Presence" is the horizontal space a {@link ITaskUnit} would take up.
   */
  presenceTime: number;
  /**
   * The direct dependencies of this {@link ITaskUnit}.
   *
   * Sometimes references to units can be provided redundantly. For example, if `A` depends on `B` and `C`, but `B` also
   * depends on `C`, then `A`'s dependency on C is implied my the transitive property. This property provides access to
   * only the direct dependencies that are not redundant in this way.
   */
  directDependencies: Set<ITaskUnit>;
  /**
   * The direct dependencies of this {@link ITaskUnit} that are no longer relevant because the prerequisites changed.
   */
  staleDirectDependencies: Set<ITaskUnit>;
  /**
   * All task units this unit depends on.
   */
  getAllDependencies(): Set<ITaskUnit>;
  /**
   * A map of the IDs of the units this unit is dependent on to the number of paths it has to those units.
   */
  attachmentMap: RelationshipMapping;
  /**
   * The number of potential paths to a given unit following the chains of dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B╱┗━━━┛C
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛╲E╱┗━━━┛F
   *                ╳       ╳
   *          ┏━━━┓╱_╲┏━━━┓╱_╲┏━━━┓
   *         G┗━━━┛   ┗━━━┛H  ┗━━━┛I
   * ```
   *
   * `B` has 1 path to `D`, but none to `C`, even though `C` is dependent on it. Both `E` and `F` also have a single
   * path to `D`. However, because `F` has a path to `B`, `E, and `F`, the number of potential paths it has to `D` is
   * the sum of all its dependencies paths to it. In this case, it has 3 paths to `D`: `F->B->D`; `F->E->D`; and
   * `F->H->D`.
   *
   * In contrast to this, it has 2 paths to `A`: `F->B->A`; and `F->E->A`.
   *
   * Redundant paths can occur, for example, if `F` also had a direct dependency on `A`, like so:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓___┏━━━┓
   *         A┗━━━┛╲  ┗━━━┛╲B ┗━━━┛C
   *                ╲_______╲
   *                 ╲┏━━━┓__╲┏━━━┓
   *                  ┗━━━┛ E ┗━━━┛F
   * ```
   *
   * These redundant paths should be ignored. So in this example, the only accepted paths to `A` from `F` would still
   * be: `F->B->A`; and `F->E->A`.
   *
   * @param unit The unit to get the number of paths to from this unit
   * @returns a number representing the number of potential paths to a given unit
   */
  getNumberOfPathsToDependency(unit: ITaskUnit): number;
  /**
   * The amount of paths this unit can go through its dependencies.
   *
   * For example:
   *
   * ```text
   *          ┏━━━┓___┏━━━┓
   *         A┗━━━┛╲ ╱┗━━━┛╲B
   *                ╳       ╲
   *          ┏━━━┓╱_╲┏━━━┓__╲┏━━━┓
   *         D┗━━━┛╲ ╱┗━━━┛E ╱┗━━━┛F
   *                ╳       ╱
   *          ┏━━━┓╱_╲┏━━━┓╱
   *         G┗━━━┛   ┗━━━┛H
   * ```
   *
   * `F` has a total attachment of 7 to all of its dependents, because that's the number of paths it can take to the
   * ends of each of its available tails. Those paths are:
   *
   * 1. `F->B->A`
   * 2. `F->B->D`
   * 3. `F->E->A`
   * 4. `F->E->D`
   * 5. `F->E->G`
   * 6. `F->H->D`
   * 7. `F->H->G`
   */
  attachmentToDependencies: number;
  /**
   * Check whether or not the passed unit is a dependency of this unit.
   *
   * @param unit the unit to check if its a dependency
   * @returns true, if this unit is dependent on the passed unit, false, if not
   */
  isDependentOn(unit: ITaskUnit): boolean;
  /**
   * @returns true, if the task has been reviewed and completed, false, if not
   */
  isComplete(): boolean;
}
