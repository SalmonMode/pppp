import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Typography from "@mui/material/Typography";
import { useAppSelector } from "../../app/hooks";
import type { AppState } from "../../app/types";
import type { TaskUnitsState } from "../Poster/taskUnitsSlice";
import MetricsSummary from "./MetricsSummary";

export default function MetricsPanel(): EmotionJSX.Element {
  const taskUnits = useAppSelector(
    (state: AppState): TaskUnitsState => state.taskUnits
  );
  if (taskUnits.loading) {
    return (
      <Typography data-testid={"metrics-panel-loading"}>loading...</Typography>
    );
  }
  const metrics = taskUnits.metrics;

  return <MetricsSummary metrics={metrics}></MetricsSummary>;
}
