import { css } from "@emotion/react";
import Typography from "@mui/material/Typography";
import { add, sub } from "date-fns";
import { useEffect, useRef } from "react";
import { theme } from "../../app/theme";
import { assertIsObject } from "../../typePredicates";
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
      css={svgStyles}
      style={{ width: svgWidth, height }}
    >
      <g
        data-testid="dateLinesGroup"
        css={dateLinesGroupStyles}
        className={"dateLinesGroup"}
        style={{ width: svgWidth, height }}
      >
        {dateIntervals.map((date, index) => {
          const left = getPixelGapBetweenTimes(
            date.getTime(),
            earliestStartTime
          );
          return (
            <g
              key={index}
              data-testid="singleDateLineGroup"
              className="singleDateLineGroup"
            >
              <Typography
                component={"text"}
                x={left}
                y={"1em"}
                css={singleDateLineLabelStyles}
                className={"singleDateLineLabel"}
              >
                {date.toLocaleDateString()}
              </Typography>
              <line
                x1={left}
                x2={left}
                y1={theme.svgDateTopPadding / 2}
                y2={height}
                css={datedLineStyles}
              ></line>
            </g>
          );
        })}
        <g>
          <Typography
            component={"text"}
            id="nowLineText"
            ref={textNode}
            x={nowLeft}
            y={"2.5em"}
            css={nowDateLineLabelStyles}
          >
            Now
          </Typography>
          <line
            x1={nowLeft}
            x2={nowLeft}
            y1={theme.svgDateTopPadding / 2}
            y2={height}
            css={singleDateLineStyles}
          ></line>
        </g>
      </g>
    </svg>
  );
}

const svgStyles = css({
  position: "absolute",
  left: 0,
  top: 0,
  pointerEvents: "none",
});

const dateLinesGroupStyles = css({ position: "absolute", left: 0, top: 0 });
const singleDateLineLabelStyles = css({
  fill: "black",
  fontSize: 18,
  textAnchor: "middle",
  pointerEvents: "all",
});
const singleDateLineStyles = css({
  stroke: theme.dateLineStrokeColor,
  strokeWidth: "1px",
  fill: "none",
});
const datedLineStyles = css(singleDateLineStyles, {
  strokeDasharray: "12,12",
});

const nowDateLineLabelStyles = css(singleDateLineLabelStyles, {
  fontSize: 15,
});
