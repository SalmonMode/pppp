import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { isUndefined } from "primitive-predicates";
import type { ReviewType } from "../../../../types";
import { theme } from "../../../app/theme";
import CoreTaskWrapper from "./CoreTaskWrapper";
import { ExtensionTrail } from "./ExtensionTrail";
import PrerequisitesBox from "./PrerequisitesBox";
import ReviewBox, { reviewVariantClassMap } from "./ReviewBox";

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
export default function StaticTaskBox({
  expectedDurationWidth,
  actualDurationWidth,
  prereqsAccepted,
  reviewVariant,
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
  prereqsAccepted?: boolean;

  /**
   * Can only be a pending review if the task iteration is projected. This means the review box should be placed within
   * the task's expected duration window. If the task iteration were not projected, then a pending review box should be
   * after the duration window. This way, in the latter case, there are no disillusions about when the snail trail will
   * start appearing once we hit the now line and the review box needs to start being pushed back.
   */
  reviewVariant: ReviewType;
  label?: string;
}): EmotionJSX.Element {
  let prereqsBox: EmotionJSX.Element | undefined;
  if (!isUndefined(prereqsAccepted)) {
    // must include the prereqs
    prereqsBox = <PrerequisitesBox started={prereqsAccepted} />;
  } else {
    // won't be providing prereqs box, so this iteration is either after a major or minor review
  }
  let prereqsAdjustmentWidth: number = theme.prerequisitesBoxWidth;
  let prereqClass = "prereqsBoxIncluded";
  if (isUndefined(prereqsAccepted)) {
    prereqsAdjustmentWidth = 0;
    prereqClass = "prereqsBoxNotIncluded";
  } else {
    if (prereqsAccepted) {
      prereqClass += " prereqsAccepted";
    } else {
      prereqClass += " prereqsPending";
    }
  }
  const reviewClass = reviewVariantClassMap[reviewVariant];

  const adjustedCoreWidth =
    expectedDurationWidth - theme.reviewBoxWidth - prereqsAdjustmentWidth;

  return (
    <div
      css={styles}
      className={`taskIteration staticTaskBox ${prereqClass} ${reviewClass}`}
      style={{
        width: actualDurationWidth,
      }}
    >
      {prereqsBox}
      <CoreTaskWrapper
        expectedDurationWidth={adjustedCoreWidth}
        label={label}
      />
      <ExtensionTrail />
      <ReviewBox variant={reviewVariant} />
    </div>
  );
}

const styles = css({
  display: "flex",
  height: "100%",
  flexDirection: "row",
  flexShrink: 0,
});
