import { css, SerializedStyles } from "@emotion/react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import type SvgIcon from "@mui/material/SvgIcon";
import { theme } from "../../../app/theme";
import { ReviewType } from "../../../types";

export default function ReviewBox({ variant }: { variant: ReviewType }) {
  const className = classMap[variant];
  const wrapperStyles = styleMap[variant];
  const IconComponent = iconMap[variant];
  return (
    <div css={wrapperStyles} className={`reviewBox ${className}`}>
      <div css={iconBoxStyles}>
        <IconComponent fontSize="small" />
      </div>
    </div>
  );
}

type ReviewVariantClassMap = {
  [V in ReviewType]: string;
};
type ReviewVariantStyleMap = {
  [V in ReviewType]: SerializedStyles;
};
type ReviewVariantIconMap = {
  [V in ReviewType]: typeof SvgIcon;
};

const classMap: ReviewVariantClassMap = {
  [ReviewType.Pending]: "pendingReview",
  [ReviewType.Accepted]: "acceptedReview",
  [ReviewType.NeedsMinorRevision]: "needsMinorRevisionReview",
  [ReviewType.NeedsMajorRevision]: "needsMajorRevisionReview",
  [ReviewType.NeedsRebuild]: "needsRebuildReview",
};

const baseStyles = css({
  width: theme.reviewBoxWidth,
  flexShrink: 0,
  flexGrow: 0,
  display: "flex",
  height: "100%",
  flexDirection: "row",
});
const pendingStyles = css(
  {
    backgroundColor: theme.reviewPendingColor,
    "path,circle": {
      color: theme.reviewPendingIconColor,
    },
  },
  baseStyles
);
const acceptedStyles = css(
  {
    backgroundColor: theme.reviewAcceptedColor,
    "path,circle": {
      color: theme.reviewAcceptedIconColor,
    },
  },
  baseStyles
);
const minorStyles = css(
  {
    backgroundColor: theme.reviewMinorColor,
    "path,circle": {
      color: theme.reviewMinorIconColor,
    },
  },
  baseStyles
);
const majorStyles = css(
  {
    backgroundColor: theme.reviewMajorColor,
    "path,circle": {
      color: theme.reviewMajorIconColor,
    },
  },
  baseStyles
);
const rebuildStyles = css(
  {
    backgroundColor: theme.reviewRebuildColor,
    "path,circle": {
      color: theme.reviewRebuildIconColor,
    },
  },
  baseStyles
);

const iconBoxStyles = css({
  display: "flex",
  height: "100%",
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
});

const styleMap: ReviewVariantStyleMap = {
  [ReviewType.Pending]: pendingStyles,
  [ReviewType.Accepted]: acceptedStyles,
  [ReviewType.NeedsMinorRevision]: minorStyles,
  [ReviewType.NeedsMajorRevision]: majorStyles,
  [ReviewType.NeedsRebuild]: rebuildStyles,
};
const iconMap: ReviewVariantIconMap = {
  [ReviewType.Pending]: PendingOutlinedIcon,
  [ReviewType.Accepted]: CheckCircleOutlineRoundedIcon,
  [ReviewType.NeedsMinorRevision]: WarningAmberRoundedIcon,
  [ReviewType.NeedsMajorRevision]: ReportGmailerrorredOutlinedIcon,
  [ReviewType.NeedsRebuild]: DeleteOutlineRoundedIcon,
};
