import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { fixedExtensionTrailStyles } from "./styles";

export default function ExtensionTrailFixedSize({
  width,
}: {
  width: number;
}): EmotionJSX.Element {
  return (
    <div
      css={fixedExtensionTrailStyles}
      className="extensionTrail"
      style={{ flexBasis: width }}
    ></div>
  );
}
