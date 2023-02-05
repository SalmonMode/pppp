import { useAppSelector } from "../../app/hooks";
import MetricsSummary from "./MetricsSummary";

export default function MetricsPanel() {
  const taskUnits = useAppSelector((state) => state.taskUnits);
  if (taskUnits.loading) {
    return <div data-testid={"metrics-panel-loading"}>loading...</div>;
  }
  const metrics = taskUnits.metrics;

  return <MetricsSummary metrics={metrics}></MetricsSummary>;
}
