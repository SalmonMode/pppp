import { css } from "@emotion/react";
import { theme } from "../../../app/theme";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";

export default function PrerequisitesBox({ started }: { started: boolean }) {
  const wrapperStyles = started ? acceptedStyles : pendingStyles;
  const [className, IconComponent] = started
    ? ["acceptedPrerequisiteBox", FactCheckOutlinedIcon]
    : ["pendingPrerequisiteBox", PendingOutlinedIcon];
  return (
    <div css={wrapperStyles} className={`prerequisiteBox ${className}`}>
      <div css={iconBoxStyles}>
        <IconComponent fontSize="small" />
      </div>
    </div>
  );
}

const baseStyles = css({
  width: theme.prerequisitesBoxWidth,
  flexShrink: 0,
  flexGrow: 0,
  display: "flex",
  height: "100%",
  flexDirection: "row",
});
const iconBoxStyles = css({
  display: "flex",
  height: "100%",
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
});
const acceptedStyles = css(
  {
    backgroundColor: theme.prereqsAcceptedColor,
    "path,circle": {
      color: theme.prereqsAcceptedIconColor,
    },
  },
  baseStyles
);
const pendingStyles = css(
  {
    backgroundColor: theme.prereqsPendingColor,
    "path,circle": {
      color: theme.prereqsPendingIconColor,
    },
  },
  baseStyles
);
