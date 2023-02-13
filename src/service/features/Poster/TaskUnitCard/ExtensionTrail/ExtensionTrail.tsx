import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { extensionTrailStyles } from "./styles";

export default function ExtensionTrail(): EmotionJSX.Element {
  return (
    <div
      css={extensionTrailStyles}
      className="extensionTrail extensionTrailGrow"
    ></div>
  );
}
