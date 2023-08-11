import React from "react";
import { BarDatum } from "../../types/bar-datum";

type ArrowProps = {
  datumFrom: BarDatum;
  datumTo: BarDatum;
  rowHeight: number;
  taskHeight: number;
  arrowIndent: number;
  rtl: boolean;
};
export const Arrow: React.FC<ArrowProps> = ({
  datumFrom,
  datumTo,
  rowHeight,
  taskHeight,
  arrowIndent,
  rtl,
}) => {
  let path: string;
  let trianglePoints: string;
  if (rtl) {
    [path, trianglePoints] = drownPathAndTriangleRTL(
      datumFrom,
      datumTo,
      rowHeight,
      taskHeight,
      arrowIndent
    );
  } else {
    [path, trianglePoints] = drownPathAndTriangle(
      datumFrom,
      datumTo,
      rowHeight,
      taskHeight,
      arrowIndent
    );
  }

  return (
    <g className="arrow">
      <path strokeWidth="1.5" d={path} fill="none" />
      <polygon points={trianglePoints} />
    </g>
  );
};

const drownPathAndTriangle = (
  datumFrom: BarDatum,
  datumTo: BarDatum,
  rowHeight: number,
  taskHeight: number,
  arrowIndent: number
) => {
  const indexCompare = datumFrom.index > datumTo.index ? -1 : 1;
  const taskToEndPosition = datumTo.y + taskHeight / 2;
  const taskFromEndPosition = datumFrom.x2 + arrowIndent * 2;
  const taskFromHorizontalOffsetValue =
    taskFromEndPosition < datumTo.x1 ? "" : `H ${datumTo.x1 - arrowIndent}`;
  const taskToHorizontalOffsetValue =
    taskFromEndPosition > datumTo.x1
      ? arrowIndent
      : datumTo.x1 - datumFrom.x2 - arrowIndent;

  const path = `M ${datumFrom.x2} ${datumFrom.y + taskHeight / 2} 
  h ${arrowIndent} 
  v ${(indexCompare * rowHeight) / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;

  const trianglePoints = `${datumTo.x1},${taskToEndPosition} 
  ${datumTo.x1 - 5},${taskToEndPosition - 5} 
  ${datumTo.x1 - 5},${taskToEndPosition + 5}`;
  return [path, trianglePoints];
};

const drownPathAndTriangleRTL = (
  datumFrom: BarDatum,
  datumTo: BarDatum,
  rowHeight: number,
  taskHeight: number,
  arrowIndent: number
) => {
  const indexCompare = datumFrom.index > datumTo.index ? -1 : 1;
  const taskToEndPosition = datumTo.y + taskHeight / 2;
  const taskFromEndPosition = datumFrom.x1 - arrowIndent * 2;
  const taskFromHorizontalOffsetValue =
    taskFromEndPosition > datumTo.x2 ? "" : `H ${datumTo.x2 + arrowIndent}`;
  const taskToHorizontalOffsetValue =
    taskFromEndPosition < datumTo.x2
      ? -arrowIndent
      : datumTo.x2 - datumFrom.x1 + arrowIndent;

  const path = `M ${datumFrom.x1} ${datumFrom.y + taskHeight / 2} 
  h ${-arrowIndent} 
  v ${(indexCompare * rowHeight) / 2} 
  ${taskFromHorizontalOffsetValue}
  V ${taskToEndPosition} 
  h ${taskToHorizontalOffsetValue}`;

  const trianglePoints = `${datumTo.x2},${taskToEndPosition} 
  ${datumTo.x2 + 5},${taskToEndPosition + 5} 
  ${datumTo.x2 + 5},${taskToEndPosition - 5}`;
  return [path, trianglePoints];
};
