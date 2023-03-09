import { css } from "@emotion/react";
import { theme } from "@service/app/theme";

const baseStyles = css({
  flexShrink: 0,
  height: "100%",
  backgroundColor: theme.extensionColor,
});
export const extensionTrailStyles = css(
  {
    flexGrow: 1,
    flexBasis: 0,
  },
  baseStyles
);

export const fixedExtensionTrailStyles = css(
  {
    flexGrow: 0,
  },
  baseStyles
);
