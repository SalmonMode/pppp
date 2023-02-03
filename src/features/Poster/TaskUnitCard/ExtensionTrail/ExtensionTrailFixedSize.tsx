import { fixedExtensionTrailStyles } from "./styles";

export default function ExtensionTrailFixedSize({ width }: { width: number }) {
  return (
    <div
      css={fixedExtensionTrailStyles}
      className="extensionTrail"
      style={{ flexBasis: width }}
    ></div>
  );
}
