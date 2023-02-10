import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Typography from "@mui/material/Typography";
import { ExtensionTrail } from "./ExtensionTrail";

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
}): EmotionJSX.Element {
  return (
    <div
      css={wrapperStyles}
      className={"taskBoxWrapper"}
      style={{
        flexBasis: actualDurationWidth,
      }}
    >
      <div
        css={boxStyles}
        className={"taskBox"}
        style={{
          flexBasis: expectedDurationWidth,
        }}
      >
        <Typography>{label}</Typography>
      </div>
      <ExtensionTrail />
    </div>
  );
}

const wrapperStyles = css({
  display: "flex",
  height: "100%",
  flexDirection: "row",
  flexShrink: 1,
});
const boxStyles = css({
  display: "flex",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
});
