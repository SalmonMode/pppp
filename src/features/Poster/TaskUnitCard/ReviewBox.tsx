import { ReviewType } from "../../../types";
import {
  reviewAcceptedColor,
  reviewBoxWidth,
  reviewMajorColor,
  reviewMinorColor,
  reviewPendingColor,
  reviewRebuildColor,
} from "../../constants";

type ReviewVariantMap = {
  [V in ReviewType]: string;
};

const colorMap: ReviewVariantMap = {
  [ReviewType.Pending]: reviewPendingColor,
  [ReviewType.Accepted]: reviewAcceptedColor,
  [ReviewType.NeedsMinorRevision]: reviewMinorColor,
  [ReviewType.NeedsMajorRevision]: reviewMajorColor,
  [ReviewType.NeedsRebuild]: reviewRebuildColor,
};
const classMap: ReviewVariantMap = {
  [ReviewType.Pending]: "pendingReview",
  [ReviewType.Accepted]: "acceptedReview",
  [ReviewType.NeedsMinorRevision]: "needsMinorRevisionReview",
  [ReviewType.NeedsMajorRevision]: "needsMajorRevisionReview",
  [ReviewType.NeedsRebuild]: "needsRebuildReview",
};

export default function ReviewBox({ variant }: { variant: ReviewType }) {
  return (
    <div
      className={`reviewBox ${classMap[variant]}`}
      style={{
        width: reviewBoxWidth,
        height: "100%",
        backgroundColor: colorMap[variant],
      }}
    ></div>
  );
}
