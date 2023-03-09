import { css, type SerializedStyles } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import IconButton from "@mui/material/IconButton";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import type SvgIcon from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";
import { isNull } from "primitive-predicates";
import React from "react";
import type { SerializableTaskPrerequisitesReference } from "@types";
import { theme } from "@service/app/theme";
import PrerequisitesBoxTooltipTitle from "./PrerequisitesBoxTooltipTitle";

export default function PrerequisitesBox({
  prerequisiteDetails,
}: {
  prerequisiteDetails: SerializableTaskPrerequisitesReference | null;
}): EmotionJSX.Element {
  const [open, setOpen] = React.useState(false);
  const handleTooltipClose = (): void => {
    setOpen(false);
  };
  const handleTooltipOpen = (): void => {
    setOpen(true);
  };
  let wrapperStyles: SerializedStyles;
  let className: string;
  let IconComponent: typeof SvgIcon;

  if (isNull(prerequisiteDetails)) {
    // Missing prerequisites
    wrapperStyles = pendingStyles;
    className = "missingPrerequisitesBox";
    IconComponent = QuestionMarkIcon;
  } else if (prerequisiteDetails.approved) {
    // Accepted prerequisites
    wrapperStyles = acceptedStyles;
    className = "acceptedPrerequisitesBox";
    IconComponent = FactCheckOutlinedIcon;
  } else {
    // Pending approval prerequisites
    wrapperStyles = pendingStyles;
    className = "pendingPrerequisitesBox";
    IconComponent = PendingOutlinedIcon;
  }

  const tooltipTitle = (
    <PrerequisitesBoxTooltipTitle prerequisiteDetails={prerequisiteDetails} />
  );
  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        describeChild
        title={tooltipTitle}
        arrow
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        data-testid="prerequisite-tooltip"
      >
        <div css={wrapperStyles} className={`prerequisitesBox ${className}`}>
          <IconButton
            onClick={handleTooltipOpen}
            css={iconBoxStyles}
            aria-label="Prerequisites"
          >
            <IconComponent fontSize="small" />
          </IconButton>
        </div>
      </Tooltip>
    </ClickAwayListener>
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
  minWidth: 0,
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
