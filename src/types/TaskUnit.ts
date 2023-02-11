import type { RelationshipMapping } from "./Mapping";

export interface ITaskUnit {
  readonly id: string;
  projectedHistory: TaskEvent[];
  interpolatedEventHistory: InterpolatedTaskEvent[];
  readonly anticipatedStartDate: Date;
  readonly anticipatedEndDate: Date;
  readonly name: string;
  eventHistory: TaskEvent[];
  apparentEndDate: Date;
  apparentStartDate: Date;
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

export interface TaskUnitDetails {
  id: ITaskUnit["id"];
  directDependencies: ITaskUnit["id"][];
  /**
   * The time the task was anticipated to start when it was first made.
   */
  anticipatedStartTime: number;
  /**
   * The time the task seems to be started according to the graph. If the time is in the future, then this is a
   * projected start time based on the tasks it is dependent on. If the start time is in the past, then it means the
   * task was actually started at that time.
   */
  apparentStartTime: number;
  /**
   * The time the task was anticipated to be finished when it was first made.
   */
  anticipatedEndTime: number;
  /**
   * The time the task seems to be finished according to the graph. If the time is in the future, then this is a
   * projected completion time based on the tasks it is dependent on and other factors. If the end time is in the past,
   * then it means the task was actually finished at that time.
   */
  apparentEndTime: number;
  trackIndex: number;
  name: string;
  eventHistory: SerializableTaskEvent[];
}

export enum EventType {
  TaskIterationStarted,
  MinorRevisionComplete,
  ReviewedAndAccepted,
  ReviewedAndNeedsMinorRevision,
  ReviewedAndNeedsMajorRevision,
  ReviewedAndNeedsRebuild,
}
export enum ReviewType {
  Pending,
  Accepted,
  NeedsMinorRevision,
  NeedsMajorRevision,
  NeedsRebuild,
}

export interface TaskEvent {
  type: EventType;
  date: Date;
}
export interface InterpolatedTaskEvent extends TaskEvent {
  projected: boolean;
}
export interface SerializableTaskEvent {
  type: EventType;
  time: number;
  projected: boolean;
}
