import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Typography from "@mui/material/Typography";
import { add, eachDayOfInterval, sub } from "date-fns";
import { useAppSelector } from "../../app/hooks";
import { theme } from "../../app/theme";
import type { AppState } from "../../app/types";
import { assertIsObject } from "primitive-predicates";
import type { TaskUnitDetails } from "../../../types";
import DateLinesSvg from "./DateLinesSvg";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";
import PosterContent from "./PosterContent";
import PosterSvg from "./PosterSvg";
import SnailTrailContainer from "./SnailTrailContainer";
import type { TaskUnitsState } from "./taskUnitsSlice";

export default function Poster(): EmotionJSX.Element {
  const taskUnits = useAppSelector(
    (state: AppState): TaskUnitsState => state.taskUnits
  );
  if (taskUnits.loading) {
    return <Typography data-testid={"poster-loading"}>loading...</Typography>;
  }
  const unitStartTimes = Object.values(taskUnits.units).map(
    (unit: TaskUnitDetails): number => unit.anticipatedStartTime
  );
  const earliestTaskStartTime = Math.min(...unitStartTimes);
  const earliestStartDate = new Date(earliestTaskStartTime);
  const unitEndTimes = Object.values(taskUnits.units).map(
    (unit: TaskUnitDetails): number => unit.apparentEndTime
  );
  const latestTaskEndTime = Math.max(...unitEndTimes);
  const latestEndDate = new Date(latestTaskEndTime);
  const dateIntervals = eachDayOfInterval({
    start: earliestStartDate,
    end: add(latestEndDate, { days: 1 }),
  });
  const firstDate = dateIntervals[0];
  assertIsObject(firstDate);
  const lastDate = dateIntervals[dateIntervals.length - 1];
  assertIsObject(lastDate);
  const earliestStartTime = sub(firstDate, { hours: 12 }).getTime();
  const trackCount =
    Math.max(
      ...Object.values(taskUnits.units).map(
        (unit: TaskUnitDetails): number => unit.trackIndex
      )
    ) + 1;
  const svgHeight =
    trackCount * theme.trackHeight +
    trackCount * theme.trackGapHeight +
    theme.svgDateTopPadding;
  const svgWidth = getPixelGapBetweenTimes(
    add(lastDate, { hours: 12 }).getTime(),
    earliestStartTime
  );
  const now = new Date();
  return (
    <div data-testid={"poster-container"} css={styles}>
      <SnailTrailContainer
        earliestStartTime={earliestStartTime}
        taskUnits={taskUnits}
      />
      <PosterSvg
        earliestStartTime={earliestStartTime}
        height={svgHeight}
        width={svgWidth}
        taskUnits={taskUnits}
      />

      <DateLinesSvg
        now={now}
        dateIntervals={dateIntervals}
        height={svgHeight}
      />
      <PosterContent
        earliestStartTime={earliestStartTime}
        taskUnits={taskUnits}
      />
    </div>
  );
}
const styles = css({ position: "relative", margin: 10 });
