import {
  prereqsAcceptedColor,
  prereqsPendingColor,
  prerequisitesBoxWidth,
} from "../../constants";

export default function PrerequisitesBox({ started }: { started: boolean }) {
  const backgroundColor = started ? prereqsAcceptedColor : prereqsPendingColor;
  return (
    <div
      className="prerequisiteBox"
      style={{
        width: prerequisitesBoxWidth,
        height: "100%",
        backgroundColor,
      }}
    ></div>
  );
}
