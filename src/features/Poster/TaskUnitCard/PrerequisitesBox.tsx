import { css } from "@emotion/react";
import { theme } from "../../../app/theme";

export default function PrerequisitesBox({ started }: { started: boolean }) {
  const styles = started ? acceptedStyles : pendingStyles;
  const className = started
    ? "acceptedPrerequisiteBox"
    : "pendingPrerequisiteBox";
  return <div css={styles} className={`prerequisiteBox ${className}`}></div>;
}

const baseStyles = css({
  width: theme.prerequisitesBoxWidth,
  flexShrink: 0,
  flexGrow: 0,
  height: "100%",
});
const acceptedStyles = css(
  {
    backgroundColor: theme.prereqsAcceptedColor,
  },
  baseStyles
);
const pendingStyles = css(
  {
    backgroundColor: theme.prereqsPendingColor,
  },
  baseStyles
);
