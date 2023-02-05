import { useEffect } from "react";
import { useAppDispatch } from "../../app/hooks";
import Poster from "./Poster";
import { generateCluster } from "./taskUnitsSlice";

export default function PosterBoard() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(generateCluster());
  }, []);
  return (
    <div style={{ position: "relative" }}>
      <Poster />
    </div>
  );
}
