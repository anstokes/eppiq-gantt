import React from "react";
import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarDateHandle } from "./bar-date-handle";
import { BarProgressHandle } from "./bar-progress-handle";
import { DatumItemProps } from "../datum-item";

// Styles
import styles from "./bar.module.css";

export const Bar: React.FC<DatumItemProps> = ({
  datum,
  isProgressChangeable,
  isDateChangeable,
  rtl,
  onEventStart,
  isSelected,
}) => {
  const progressPoint = getProgressPoint(
    +!rtl * datum.progressWidth + datum.progressX,
    datum.y,
    datum.height
  );
  const handleHeight = datum.height - 2;

  return (
    <g className={styles.barWrapper} tabIndex={0}>
      <BarDisplay
        x={datum.x1}
        y={datum.y}
        width={datum.x2 - datum.x1}
        height={datum.height}
        progressX={datum.progressX}
        progressWidth={datum.progressWidth}
        barCornerRadius={datum.barCornerRadius}
        styles={datum.styles}
        isSelected={isSelected}
        onMouseDown={e => {
          isDateChangeable && onEventStart("move", datum, e);
        }}
      />
      <g className="handleGroup">
        {isDateChangeable && (
          <g>
            {/* left */}
            <BarDateHandle
              x={datum.x1 + 1}
              y={datum.y + 1}
              width={datum.handleWidth}
              height={handleHeight}
              barCornerRadius={datum.barCornerRadius}
              onMouseDown={e => {
                onEventStart("start", datum, e);
              }}
            />
            {/* right */}
            <BarDateHandle
              x={datum.x2 - datum.handleWidth - 1}
              y={datum.y + 1}
              width={datum.handleWidth}
              height={handleHeight}
              barCornerRadius={datum.barCornerRadius}
              onMouseDown={e => {
                onEventStart("end", datum, e);
              }}
            />
          </g>
        )}
        {isProgressChangeable && (
          <BarProgressHandle
            progressPoint={progressPoint}
            onMouseDown={e => {
              onEventStart("progress", datum, e);
            }}
          />
        )}
      </g>
    </g>
  );
};
