import React, { useRef, useEffect, useState } from "react";

import { Datum } from "../../types/public-types";
import { BarDatum } from "../../types/bar-datum";

// Styles
import styles from "./tooltip.module.css";

export type TooltipProps = {
  arrowIndent: number;
  datum: BarDatum;
  datumListWidth: number;
  fontSize: string;
  fontFamily: string;
  headerHeight: number;
  rowHeight: number;
  rtl: boolean;
  scrollX: number;
  scrollY: number;
  svgContainerHeight: number;
  svgContainerWidth: number;
  svgWidth: number;
  TooltipContent: React.FC<{
    datum: Datum;
    fontSize: string;
    fontFamily: string;
  }>;
};
export const Tooltip: React.FC<TooltipProps> = ({
  arrowIndent,
  datum,
  datumListWidth,
  fontSize,
  fontFamily,
  headerHeight,
  rowHeight,
  rtl,
  scrollX,
  scrollY,
  svgContainerHeight,
  svgContainerWidth,
  TooltipContent,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [relatedY, setRelatedY] = useState(0);
  const [relatedX, setRelatedX] = useState(0);
  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipHeight = tooltipRef.current.offsetHeight * 1.1;
      const tooltipWidth = tooltipRef.current.offsetWidth * 1.1;

      let newRelatedY = datum.index * rowHeight - scrollY + headerHeight;
      let newRelatedX: number;
      if (rtl) {
        newRelatedX = datum.x1 - arrowIndent * 1.5 - tooltipWidth - scrollX;
        if (newRelatedX < 0) {
          newRelatedX = datum.x2 + arrowIndent * 1.5 - scrollX;
        }
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        if (tooltipLeftmostPoint > svgContainerWidth) {
          newRelatedX = svgContainerWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      } else {
        newRelatedX = datum.x2 + arrowIndent * 1.5 + datumListWidth - scrollX;
        const tooltipLeftmostPoint = tooltipWidth + newRelatedX;
        const fullChartWidth = datumListWidth + svgContainerWidth;
        if (tooltipLeftmostPoint > fullChartWidth) {
          newRelatedX =
          datum.x1 +
            datumListWidth -
            arrowIndent * 1.5 -
            scrollX -
            tooltipWidth;
        }
        if (newRelatedX < datumListWidth) {
          newRelatedX = svgContainerWidth + datumListWidth - tooltipWidth;
          newRelatedY += rowHeight;
        }
      }

      const tooltipLowerPoint = tooltipHeight + newRelatedY - scrollY;
      if (tooltipLowerPoint > svgContainerHeight - scrollY) {
        newRelatedY = svgContainerHeight - tooltipHeight;
      }
      setRelatedY(newRelatedY);
      setRelatedX(newRelatedX);
    }
  }, [
    arrowIndent,
    datum,
    datumListWidth,
    headerHeight,
    rowHeight,
    rtl,
    scrollX,
    scrollY,
    svgContainerHeight,
    svgContainerWidth,
    tooltipRef,
  ]);

  return (
    <div
      ref={tooltipRef}
      className={
        relatedX
          ? styles.tooltipDetailsContainer
          : styles.tooltipDetailsContainerHidden
      }
      style={{ left: relatedX, top: relatedY }}
    >
      <TooltipContent datum={datum} fontSize={fontSize} fontFamily={fontFamily} />
    </div>
  );
};

export const StandardTooltipContent: React.FC<{
  datum: Datum;
  fontSize: string;
  fontFamily: string;
}> = ({ datum, fontSize, fontFamily }) => {
  const style = {
    fontSize,
    fontFamily,
  };
  return (
    <div className={styles.tooltipDefaultContainer} style={style}>
      <b style={{ fontSize: fontSize + 6 }}>{`${
        datum.name
      }: ${datum.start.getDate()}-${
        datum.start.getMonth() + 1
      }-${datum.start.getFullYear()} - ${datum.end.getDate()}-${
        datum.end.getMonth() + 1
      }-${datum.end.getFullYear()}`}</b>
      {datum.end.getTime() - datum.start.getTime() !== 0 && (
        <p className={styles.tooltipDefaultContainerParagraph}>{`Duration: ${~~(
          (datum.end.getTime() - datum.start.getTime()) /
          (1000 * 60 * 60 * 24)
        )} day(s)`}</p>
      )}

      <p className={styles.tooltipDefaultContainerParagraph}>
        {!!datum.progress && `Progress: ${datum.progress} %`}
      </p>
    </div>
  );
};
