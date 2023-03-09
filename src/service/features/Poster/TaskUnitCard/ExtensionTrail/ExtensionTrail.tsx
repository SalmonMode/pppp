import { extensionTrailStyles } from "./styles";

export default function ExtensionTrail(): JSX.Element {
  return (
    <div
      css={extensionTrailStyles}
      className="extensionTrail extensionTrailGrow"
    ></div>
  );
}
