import Typography from "@mui/material/Typography";
import { useAppSelector } from "../../app/hooks";
import MetricsSummary from "./MetricsSummary";

export default function MetricsPanel() {
  const taskUnits = useAppSelector((state) => state.taskUnits);
  if (taskUnits.loading) {
    return (
      <Typography data-testid={"metrics-panel-loading"}>loading...</Typography>
    );
  }
  const metrics = taskUnits.metrics;

  return <MetricsSummary metrics={metrics}></MetricsSummary>;
}
