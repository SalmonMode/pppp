import { add, sub } from "date-fns";
import { useEffect, useRef } from "react";
import { assertIsObject } from "../../typePredicates";
import { svgDateTopPadding } from "../constants";
import getPixelGapBetweenTimes from "./getPixelGapBetweenTimes";

export default function DateLinesSvg({
  now,
  dateIntervals,
  height,
}: {
  now: Date;
  dateIntervals: Date[];
  height: number;
}) {
  const firstDate = dateIntervals[0];
  assertIsObject(firstDate);
  const lastDate = dateIntervals[dateIntervals.length - 1];
  assertIsObject(lastDate);
  const earliestStartTime = sub(firstDate, { hours: 12 }).getTime();
  const svgWidth = getPixelGapBetweenTimes(
    add(lastDate, { hours: 12 }).getTime(),
    earliestStartTime
  );
  const nowLeft = getPixelGapBetweenTimes(now.getTime(), earliestStartTime);
  const textNode = useRef<SVGTextElement>(null);
  useEffect(() => {
    assertIsObject(textNode.current);
    textNode.current.scrollIntoView({
      inline: "center",
    });
  }, []);
  return (
    <svg
      data-testid="dateLinesSvg"
      style={{
        position: "absolute",
        width: svgWidth,
        height,
        left: 0,
        top: 0,
        pointerEvents: "none",
      }}
    >
      <g
        className="dateLines"
        data-testid="dateLinesGroup"
        style={{
          position: "absolute",
          width: svgWidth,
          height,
          left: 0,
          top: 0,
        }}
      >
        {dateIntervals.map((date, index) => {
          const left = getPixelGapBetweenTimes(
            date.getTime(),
            earliestStartTime
          );
          return (
            <g key={index} className="singleDateLineGroup">
              <text
                x={left}
                y={"1em"}
                style={{
                  fill: "black",
                  fontSize: 20,
                  textAnchor: "middle",
                }}
              >
                {date.toLocaleDateString()}
              </text>
              <line
                x1={left}
                x2={left}
                y1={svgDateTopPadding / 2}
                y2={height}
                style={{
                  stroke: "lightgrey",
                  strokeWidth: "1px",
                  fill: "none",
                  strokeDasharray: "10,10",
                }}
              ></line>
            </g>
          );
        })}
        <g>
          <text
            id="nowLineText"
            ref={textNode}
            x={nowLeft}
            y={"3em"}
            style={{
              fill: "black",
              fontSize: 15,
              textAnchor: "middle",
              pointerEvents: "all",
            }}
          >
            Now
          </text>
          <path
            d={`M${nowLeft},${svgDateTopPadding / 2} V ${height}`}
            style={{
              stroke: "lightgrey",
              strokeWidth: "1px",
              fill: "none",
            }}
          ></path>
        </g>
      </g>
    </svg>
  );
}
