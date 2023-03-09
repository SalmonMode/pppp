import { css } from "@emotion/react";
import { assertIsObject } from "primitive-predicates";
import type { TaskUnitDetails } from "@types";
import TaskTrack from "./TaskUnitCard/TaskTrack";
import type { TaskUnitsLoadingCompleteState } from "./taskUnitsSlice";

export default function PosterContent({
  taskUnits,
  earliestStartTime,
}: {
  taskUnits: TaskUnitsLoadingCompleteState;
  earliestStartTime: number;
}): JSX.Element {
  const tracks = taskUnits.unitTrackMap;
  return (
    <div data-testid={"poster"} css={styles}>
      {tracks.map((track: string[], index: number): JSX.Element => {
        return (
          <TaskTrack
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
