import { css } from "@emotion/react";
import { assertIsObject } from "../../typePredicates";
import type { TaskUnitDetails } from "../../types";
import SnailTrailTrack from "./TaskUnitCard/SnailTrailTrack";
import type {
  TaskUnitsLoadingCompleteState,
  TaskUnitsState,
} from "./taskUnitsSlice";

export default function SnailTrailContainer({
  taskUnits,
  earliestStartTime,
}: {
  taskUnits: TaskUnitsLoadingCompleteState;
  earliestStartTime: number;
}) {
  const tracks = taskUnits.unitTrackMap;
  return (
    <div data-testid={"snailTrailContainer"} css={styles}>
      {tracks.map((track, index) => {
        return (
          <SnailTrailTrack
            key={index}
            units={track.map<TaskUnitDetails>((id) => {
              const unitDetails = taskUnits.units[id];
              assertIsObject(unitDetails);
              return unitDetails;
            })}
            trackIndex={index}
            pathStartDate={new Date(earliestStartTime)}
          />
        );
      })}
    </div>
  );
}

const styles = css({ position: "absolute", left: 0, top: 0 });
