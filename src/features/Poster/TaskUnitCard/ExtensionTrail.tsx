import { extensionColor } from "../../constants";

export default function ExtensionTrail() {
  return (
    <div
      className="extensionTrail"
      style={{
        flex: "1 0 0px",
        height: "100%",
        backgroundColor: extensionColor,
      }}
    ></div>
  );
}
