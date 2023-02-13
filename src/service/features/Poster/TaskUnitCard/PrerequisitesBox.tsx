import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import Tooltip from "@mui/material/Tooltip";
import { theme } from "../../../app/theme";

export default function PrerequisitesBox({
  started,
}: {
  started: boolean;
}): EmotionJSX.Element {
  const [wrapperStyles, className, IconComponent, tooltipText] = started
    ? [
        acceptedStyles,
        "acceptedPrerequisitesBox",
        FactCheckOutlinedIcon,
        "This task's prerequisites have been signed off on",
      ]
    : [
        pendingStyles,
        "pendingPrerequisitesBox",
        PendingOutlinedIcon,
        "This task's prerequisites have not been signed off on",
      ];
  return (
    <Tooltip describeChild title={tooltipText} arrow>
      <div css={wrapperStyles} className={`prerequisitesBox ${className}`}>
        <div css={iconBoxStyles}>
          <IconComponent fontSize="small" />
        </div>
      </div>
    </Tooltip>
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
