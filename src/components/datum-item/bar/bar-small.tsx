import React from "react";
import { getProgressPoint } from "../../../helpers/bar-helper";
import { BarDisplay } from "./bar-display";
import { BarProgressHandle } from "./bar-progress-handle";
import { DatumItemProps } from "../datum-item";

// Styles
import styles from "./bar.module.css";

export const BarSmall: React.FC<DatumItemProps> = ({
  datum,
  isProgressChangeable,
  isDateChangeable,
  onEventStart,
  isSelected,
}) => {
  const progressPoint = getProgressPoint(
    datum.progressWidth + datum.x1,
    datum.y,
    datum.height
  );

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
