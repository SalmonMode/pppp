import { css } from "@emotion/react";
import { useEffect } from "react";
import { useAppDispatch } from "@service/app/hooks";
import Poster from "./Poster";
import { generateCluster } from "./taskUnitsSlice";

export default function PosterBoard(): JSX.Element {
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
