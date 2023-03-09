import type { ResourceID } from "@typing/Mapping";
import type IStressTracker from "./IStressTracker";

export enum MoveType {
  Stay,
  Swap,
  Below,
  Converge,
  Top,
}

export interface MoveDetails<T extends MoveType> {
  type: T;
  totalDistance: number;
  totalTracks: number;
  pathA: T extends MoveType.Stay ? undefined : ResourceID;
  pathB: T extends MoveType.Top | MoveType.Stay ? undefined : ResourceID;
}

export type NextMove =
  | MoveDetails<MoveType.Stay>
  | MoveDetails<MoveType.Swap>
  | MoveDetails<MoveType.Below>
  | MoveDetails<MoveType.Converge>
  | MoveDetails<MoveType.Top>;

export default interface IStressManager {
  stressTracker: IStressTracker;
  /**
   *
   * @returns the path IDs sorted from top to bottom according to their positions.
   */
  getRankings(): ResourceID[];
}
