import ExtensionTrail from "./ExtensionTrail";

export default function TaskBox({
  expectedDurationWidth,
  actualDurationWidth,
  label,
}: {
  /**
   * How wide the normal portion of the box should be. This will have a normal background. If the task is finished
   * within this time, there will be no extension trail shown.
   */
  expectedDurationWidth: number;
  /**
   * How wide the entire box should be. The difference between this and the expectedDurationWidth will be filled with
   * the extension trail showing how long the task is behind what was planned.
   */
  actualDurationWidth: number;
  label?: string;
}) {
  return (
    <div
      className="taskBoxWrapper"
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "row",
        width: actualDurationWidth,
      }}
    >
      <div
        className="taskBox"
        style={{
          display: "flex",
          width: expectedDurationWidth,
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>{label}</div>
      </div>
      <ExtensionTrail />
    </div>
  );
}
