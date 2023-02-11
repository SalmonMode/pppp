import chroma from "chroma-js";

export default chroma
  .bezier(["darkred", "deeppink", "orangered", "lightyellow"])
  .scale()
  .correctLightness();
