import { css } from "@emotion/react";
import Typography from "@mui/material/Typography";

/**
 * This is for task boxes that aren't active. These are separate than active task boxes, because the width of static
 * task boxes isn't dependent on the current time, so the review box can be included without needing to do lots of math
 * in runtime to calculate the width of each box. By leveraging flex styling, that burden can be offloaded onto the
 * browser to figure out.
 *
 * This is important because pending review boxes for currently active task iterations should not be allowed to be
 * positioned to the left of the now date line. This is to help prevent disillusions about when the snail trail will
 * start appearing once we hit the now line and the review box needs to start being pushed back.
 */
export default function CoreTaskWrapper({
  expectedDurationWidth,
  label,
}: {
  /**
   * How wide the normal portion of the box should be. This will have a normal background.
   */
  expectedDurationWidth: number;
  label?: string;
}): JSX.Element {
  return (
    <div
      css={durationStyles}
      className={"anticipatedTaskDurationLabel"}
      style={{
        flexBasis: expectedDurationWidth,
      }}
    >
      <Typography>{label}</Typography>
    </div>
  );
}
// Because it *cannot* grow, it will only take up as much space as it can be afforded, when accounting for the prereqs
// box (if present).
const durationStyles = css({
  display: "flex",
  flexDirection: "row",
  height: "100%",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 1,
});
