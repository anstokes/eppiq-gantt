import React from "react";
import { DatumItemProps } from "../datum-item";

// Styles
import styles from "./milestone.module.css";

export const Milestone: React.FC<DatumItemProps> = ({
  datum,
  isDateChangeable,
  onEventStart,
  isSelected,
}) => {
  const transform = `rotate(45 ${datum.x1 + datum.height * 0.356} 
    ${datum.y + datum.height * 0.85})`;
  const getBarColor = () => {
    return isSelected
      ? datum.styles.backgroundSelectedColor
      : datum.styles.backgroundColor;
  };

  return (
    <g tabIndex={0} className={styles.milestoneWrapper}>
      <rect
        fill={getBarColor()}
        x={datum.x1}
        width={datum.height}
        y={datum.y}
        height={datum.height}
        rx={datum.barCornerRadius}
        ry={datum.barCornerRadius}
        transform={transform}
        className={styles.milestoneBackground}
        onMouseDown={e => {
          isDateChangeable && onEventStart("move", datum, e);
        }}
      />
    </g>
  );
};
