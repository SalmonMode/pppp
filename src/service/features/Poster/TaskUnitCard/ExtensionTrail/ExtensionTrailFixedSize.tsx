import { fixedExtensionTrailStyles } from "./styles";

export default function ExtensionTrailFixedSize({
  width,
}: {
  width: number;
}): JSX.Element {
  return (
    <div
      css={fixedExtensionTrailStyles}
      className="extensionTrail extensionTrailFixedSize"
      style={{ width }}
    ></div>
  );
}
