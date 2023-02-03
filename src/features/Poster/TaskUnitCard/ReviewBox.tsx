import { css, SerializedStyles } from "@emotion/react";
import { theme } from "../../../app/theme";
import { ReviewType } from "../../../types";

export default function ReviewBox({ variant }: { variant: ReviewType }) {
  const className = classMap[variant];
  const styles = styleMap[variant];
  return <div css={styles} className={`reviewBox ${className}`}></div>;
}

type ReviewVariantClassMap = {
  [V in ReviewType]: string;
};
type ReviewVariantStyleMap = {
  [V in ReviewType]: SerializedStyles;
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
  height: "100%",
});
const pendingStyles = css(
  {
    backgroundColor: theme.reviewPendingColor,
  },
  baseStyles
);
const acceptedStyles = css(
  {
    backgroundColor: theme.reviewAcceptedColor,
  },
  baseStyles
);
const minorStyles = css(
  {
    backgroundColor: theme.reviewMinorColor,
  },
  baseStyles
);
const majorStyles = css(
  {
    backgroundColor: theme.reviewMajorColor,
  },
  baseStyles
);
const rebuildStyles = css(
  {
    backgroundColor: theme.reviewRebuildColor,
  },
  baseStyles
);

const styleMap: ReviewVariantStyleMap = {
  [ReviewType.Pending]: pendingStyles,
  [ReviewType.Accepted]: acceptedStyles,
  [ReviewType.NeedsMinorRevision]: minorStyles,
  [ReviewType.NeedsMajorRevision]: majorStyles,
  [ReviewType.NeedsRebuild]: rebuildStyles,
};
