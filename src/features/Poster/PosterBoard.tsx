import { css } from "@emotion/react";
import type { EmotionJSX } from "@emotion/react/types/jsx-namespace";
import { useEffect } from "react";
import { useAppDispatch } from "../../app/hooks";
import Poster from "./Poster";
import { generateCluster } from "./taskUnitsSlice";

export default function PosterBoard(): EmotionJSX.Element {
  const dispatch = useAppDispatch();
  useEffect((): void => {
    dispatch(generateCluster());
  }, []);
  return (
    <div css={styles}>
      <Poster />
    </div>
  );
}

const styles = css({ position: "relative" });
