import {
  prereqsAcceptedColor,
  prereqsPendingColor,
  prerequisitesBoxWidth
} from "../../constants";

export default function PrerequisitesBox({ started }: { started: boolean }) {
  const backgroundColor = started ? prereqsAcceptedColor : prereqsPendingColor;
  return (
    <div
      className="prerequisiteBox"
      style={{
        width: prerequisitesBoxWidth,
        flexShrink: 0,
        flexGrow: 0,
        height: "100%",
        backgroundColor,
      }}
    ></div>
  );
}
