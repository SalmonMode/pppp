import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { assertIsObject } from "../../typePredicates";
import type { TaskUnitDetails } from "../../types";
import SnailTrailTrack from "./TaskUnitCard/SnailTrailTrack";
import type { TaskUnitsLoadingCompleteState } from "./taskUnitsSlice";

export default function SnailTrailContainer({
  taskUnits,
  earliestStartTime,
}: {
  taskUnits: TaskUnitsLoadingCompleteState;
  earliestStartTime: number;
}): EmotionJSX.Element {
  const tracks = taskUnits.unitTrackMap;
  return (
    <div data-testid={"snailTrailContainer"} css={styles}>
      {tracks.map((track: string[], index: number): EmotionJSX.Element => {
        return (
          <SnailTrailTrack
            key={index}
            units={track.map<TaskUnitDetails>((id: string): TaskUnitDetails => {
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
