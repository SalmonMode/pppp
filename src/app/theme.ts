export const trackHeight = 60;
export const trackGapHeight = 10;
export const svgDateTopPadding = 100;
export const unitTaskTimeConversion = 500000;
export const halfDayDuration: Duration = {
  hours: 12,
};

export const theme = {
  taskCardBackgroundColor: "lightblue",
  snailTrailColor: "red",
  reviewAcceptedColor: "green",
  reviewPendingColor: "white",
  reviewMinorColor: "yellow",
  reviewMajorColor: "red",
  reviewRebuildColor: "black",
  prereqsAcceptedColor: "green",
  prereqsPendingColor: "white",
  extensionColor: "pink",
  dateLineStrokeColor: "lightgrey",
  connectionPathStrokeColor: "black",
  connectionPathOutlineStrokeColor: "white",
  prerequisitesBoxWidth: 25,
  reviewBoxWidth: 25,
  trackHeight: 60,
  trackGapHeight: 10,
  svgDateTopPadding: 100,
  gradientChartWidth: 400,
} as const;
