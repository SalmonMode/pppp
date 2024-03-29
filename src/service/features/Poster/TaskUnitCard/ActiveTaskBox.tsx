import { css } from "@emotion/react";
import { theme } from "@service/app/theme";
import {
  IterationRelativePosition,
  ReviewType,
  type SerializableTaskPrerequisitesReference,
} from "@typing/TaskUnit";
import { isUndefined } from "primitive-predicates";
import CoreTaskWrapper from "./CoreTaskWrapper";
import { ExtensionTrail } from "./ExtensionTrail";
import PrerequisitesBox from "./PrerequisitesBox/PrerequisitesBox";
import ReviewBox from "./ReviewBox";

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
export default function ActiveTaskBox({
  expectedDurationWidth,
  actualDurationWidth,
  prereqs,
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
  relativeIterationPosition: IterationRelativePosition;
  label?: string;
}): JSX.Element {
  let prereqsBox: JSX.Element | undefined;
  let prereqsAdjustmentWidth = 0;
  let prereqsClassName = "prereqsBoxNotIncluded";
  if (!isUndefined(prereqs)) {
    // must include the prereqs
    prereqsBox = <PrerequisitesBox prerequisiteDetails={prereqs} />;
    prereqsAdjustmentWidth = theme.prerequisitesBoxWidth;
    prereqsClassName = "prereqsBoxIncluded prereqsAccepted";
  } else {
    // won't be providing prereqs box, so this iteration is either after a major or minor review
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

  const adjustedActualDurationWidth =
    actualDurationWidth + theme.reviewBoxWidth;
  const adjustedCoreWidth =
    expectedDurationWidth - prereqsAdjustmentWidth - borderAdjustment;
  return (
    <div
      css={styles}
      className={`taskIteration activeTaskBox pendingReview ${prereqsClassName}`}
      style={{
        width: adjustedActualDurationWidth - borderAdjustment,
      }}
    >
      {prereqsBox}
      <CoreTaskWrapper
        expectedDurationWidth={adjustedCoreWidth}
        label={label}
      />
      <ExtensionTrail />
      <ReviewBox variant={ReviewType.Pending} />
    </div>
  );
}

const styles = css({
  display: "flex",
  height: "100%",
  flexDirection: "row",
  flexShrink: 0,
});
