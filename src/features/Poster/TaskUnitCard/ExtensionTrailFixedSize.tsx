import { extensionColor } from "../../constants";

export default function ExtensionTrailFixedSize({ width }: { width: number }) {
  return (
    <div
      className="extensionTrail"
      style={{
        flex: `0 0 ${width}px`,
        height: "100%",
        backgroundColor: extensionColor,
      }}
    ></div>
  );
}
