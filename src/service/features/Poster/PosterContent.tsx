import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { assertIsObject } from "primitive-predicates";
import type { TaskUnitDetails } from "../../../types";
import TaskTrack from "./TaskUnitCard/TaskTrack";
import type { TaskUnitsLoadingCompleteState } from "./taskUnitsSlice";

export default function PosterContent({
  taskUnits,
  earliestStartTime,
}: {
  taskUnits: TaskUnitsLoadingCompleteState;
  earliestStartTime: number;
}): EmotionJSX.Element {
  const tracks = taskUnits.unitTrackMap;
  return (
    <div data-testid={"poster"} css={styles}>
      {tracks.map((track: string[], index: number): EmotionJSX.Element => {
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
