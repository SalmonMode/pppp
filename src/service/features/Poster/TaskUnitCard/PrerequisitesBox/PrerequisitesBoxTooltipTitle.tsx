import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import Typography from "@mui/material/Typography";
import { assertIsObject, isNull } from "primitive-predicates";
import React from "react";
import type { SerializableTaskPrerequisitesReference } from "../../../../../types";
import { useAppSelector } from "../../../../app/hooks";
import type { AppState } from "../../../../app/types";
import type { TaskUnitMap } from "../../taskUnitsSlice";

export default function PrerequisitesBoxTooltipTitle({
  prerequisiteDetails,
}: {
  prerequisiteDetails: SerializableTaskPrerequisitesReference | null;
}): EmotionJSX.Element {
  const units = useAppSelector((state: AppState): TaskUnitMap => {
    if (!state.taskUnits.loading) {
      return state.taskUnits.units;
    }
    throw new Error(
      "This component should only be used if the state has finished loading"
    );
  });

  let tooltipText: string;
  let tooltipTitleDeps: EmotionJSX.Element | undefined;
  if (isNull(prerequisiteDetails)) {
    tooltipText =
      "The prerequisites for this iteration have not been drafted yet";
  } else {
    const depsTexts: EmotionJSX.Element[] = prerequisiteDetails.parentUnits.map(
      (depId: string, index: number) => {
        const unitDetails = units[depId];
        assertIsObject(unitDetails);
        return (
          <Typography color="inherit" key={index}>
            {unitDetails.name}
          </Typography>
        );
      }
    );
    if (depsTexts.length === 0) {
      depsTexts.push(
        <Typography color="inherit" key={0}>
          N/A
        </Typography>
      );
    }
    tooltipTitleDeps = (
      <React.Fragment>
        <Typography color="inherit">Dependencies:</Typography>
        {depsTexts}
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
