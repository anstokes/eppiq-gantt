import React from "react";
import { DatumItemProps } from "../datum-item";

// Styles
import styles from "./project.module.css";

export const Project: React.FC<DatumItemProps> = ({ datum, isSelected }) => {
  const barColor = isSelected
    ? datum.styles.backgroundSelectedColor
    : datum.styles.backgroundColor;
  const processColor = isSelected
    ? datum.styles.progressSelectedColor
    : datum.styles.progressColor;
  const projectWidth = datum.x2 - datum.x1;

  const projectLeftTriangle = [
    datum.x1,
    datum.y + datum.height / 2 - 1,
    datum.x1,
    datum.y + datum.height,
    datum.x1 + 15,
    datum.y + datum.height / 2 - 1,
  ].join(",");
  const projectRightTriangle = [
    datum.x2,
    datum.y + datum.height / 2 - 1,
    datum.x2,
    datum.y + datum.height,
    datum.x2 - 15,
    datum.y + datum.height / 2 - 1,
  ].join(",");

  return (
    <g tabIndex={0} className={styles.projectWrapper}>
      <rect
        fill={barColor}
        x={datum.x1}
        width={projectWidth}
        y={datum.y}
        height={datum.height}
        rx={datum.barCornerRadius}
        ry={datum.barCornerRadius}
        className={styles.projectBackground}
      />
      <rect
        x={datum.progressX}
        width={datum.progressWidth}
        y={datum.y}
        height={datum.height}
        ry={datum.barCornerRadius}
        rx={datum.barCornerRadius}
        fill={processColor}
      />
      <rect
        fill={barColor}
        x={datum.x1}
        width={projectWidth}
        y={datum.y}
        height={datum.height / 2}
        rx={datum.barCornerRadius}
        ry={datum.barCornerRadius}
        className={styles.projectTop}
      />
      <polygon
        className={styles.projectTop}
        points={projectLeftTriangle}
        fill={barColor}
      />
      <polygon
        className={styles.projectTop}
        points={projectRightTriangle}
        fill={barColor}
      />
    </g>
  );
};
