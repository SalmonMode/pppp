import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { isNull, isUndefined } from "primitive-predicates";
import {
  IterationRelativePosition,
  ReviewType,
  type SerializableTaskPrerequisitesReference,
} from "@types";
import { theme } from "@service/app/theme";
import CoreTaskWrapper from "./CoreTaskWrapper";
import { ExtensionTrail } from "./ExtensionTrail";
import PrerequisitesBox from "./PrerequisitesBox/PrerequisitesBox";
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
  prereqs,
  reviewVariant,
  relativeIterationPosition,
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
  /**
   * The prerequisites information to include for the task box. If undefined, it means no prerequisites box should be
   * included. If null, it means there should be one, but no prerequisites exist for it yet. If it's a
   * SerializableTaskPrerequisitesReference object, then the details of the prerequisites are available.
   */
  prereqs?: SerializableTaskPrerequisitesReference | null;

  /**
   * Can only be a pending review if the task iteration is projected. This means the review box should be placed within
   * the task's expected duration window. If the task iteration were not projected, then a pending review box should be
   * after the duration window. This way, in the latter case, there are no disillusions about when the snail trail will
   * start appearing once we hit the now line and the review box needs to start being pushed back.
   */
  reviewVariant: ReviewType;
  relativeIterationPosition: IterationRelativePosition;
  label?: string;
}): EmotionJSX.Element {
  let prereqsBox: EmotionJSX.Element | undefined;
  let prereqsAdjustmentWidth = 0;
  const prereqsClassNameArray: string[] = [];
  if (!isUndefined(prereqs)) {
    // must include the prereqs
    prereqsBox = <PrerequisitesBox prerequisiteDetails={prereqs} />;
    prereqsAdjustmentWidth = theme.prerequisitesBoxWidth;
    prereqsClassNameArray.push("prereqsBoxIncluded");
    if (isNull(prereqs)) {
      prereqsClassNameArray.push("prereqsMissing");
    } else if (prereqs.approved) {
      prereqsClassNameArray.push("prereqsAccepted");
    } else {
      prereqsClassNameArray.push("prereqsPending");
    }
  } else {
    // won't be providing prereqs box, so this iteration is either after a major or minor review
    prereqsClassNameArray.push("prereqsBoxNotIncluded");
  }
  let borderAdjustment: number;
  switch (relativeIterationPosition) {
    case IterationRelativePosition.IntermediateIteration:
      borderAdjustment = 0;
      break;
    case IterationRelativePosition.OnlyKnownIteration:
      borderAdjustment = theme.borderWidth * 2;
      break;

    default:
      borderAdjustment = theme.borderWidth;
      break;
  }
  const reviewClass = reviewVariantClassMap[reviewVariant];

  const adjustedCoreWidth =
    expectedDurationWidth -
    theme.reviewBoxWidth -
    prereqsAdjustmentWidth -
    borderAdjustment;

  const prereqsClassNamesAsString = prereqsClassNameArray.join(" ");

  return (
    <div
      css={styles}
      className={`taskIteration staticTaskBox ${prereqsClassNamesAsString} ${reviewClass}`}
      style={{
        width: actualDurationWidth - borderAdjustment,
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
