import { css } from "@emotion/react";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "@service/app/hooks";
import type { AppState } from "@service/app/types";
import type { SerializableTaskPrerequisitesReference } from "@typing/TaskUnit";
import { assertIsObject, isNull } from "primitive-predicates";
import React from "react";
import type { TaskUnitMap } from "../../taskUnitsSlice";
import { setTaskUnitCardAttention } from "../taskUnitCardAttentionSlice";

export default function PrerequisitesBoxTooltipTitle({
  prerequisiteDetails,
}: {
  prerequisiteDetails: SerializableTaskPrerequisitesReference | null;
}): JSX.Element {
  const units = useAppSelector((state: AppState): TaskUnitMap => {
    if (!state.taskUnits.loading) {
      return state.taskUnits.units;
    }
    throw new Error(
      "This component should only be used if the state has finished loading"
    );
  });
  const dispatch = useAppDispatch();

  let tooltipText: string;
  let tooltipTitleDeps: JSX.Element | undefined;
  if (isNull(prerequisiteDetails)) {
    tooltipText =
      "The prerequisites for this iteration have not been drafted yet";
  } else {
    const depsTexts: JSX.Element[] = prerequisiteDetails.parentUnits.map(
      (depId: string, index: number) => {
        const unitDetails = units[depId];
        assertIsObject(unitDetails);
        return (
          <div css={depListItemStyles} key={index}>
            <div>
              <Link
                href={`#task-${depId}`}
                title={`Jump to task: ${unitDetails.name}`}
                onClick={(_event): void => {
                  dispatch(setTaskUnitCardAttention(depId));
                }}
              >
                <ArrowCircleRightIcon />
              </Link>
            </div>
            <div>
              <Typography color="inherit">{unitDetails.name}</Typography>
            </div>
          </div>
        );
      }
    );
    let depsTextContent: JSX.Element;
    if (depsTexts.length === 0) {
      depsTextContent = (
        <Typography color="inherit" key={0}>
          N/A
        </Typography>
      );
    } else {
      depsTextContent = <div css={depListStyles}>{depsTexts}</div>;
    }
    tooltipTitleDeps = (
      <React.Fragment>
        <Typography color="inherit">Dependencies:</Typography>
        {depsTextContent}
      </React.Fragment>
    );
    if (prerequisiteDetails.approved) {
      tooltipText = "This task's prerequisites have been signed off on";
    } else {
      tooltipText = "This task's prerequisites have not been signed off on";
    }
  }

  return (
    <React.Fragment>
      <Typography color="inherit">{tooltipText}</Typography>
      {tooltipTitleDeps}
    </React.Fragment>
  );
}

const depListStyles = css({
  display: "flex",
  flexDirection: "column",
  paddingTop: 10,
});
const depListItemStyles = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  p: {
    paddingLeft: 5,
  },
});
