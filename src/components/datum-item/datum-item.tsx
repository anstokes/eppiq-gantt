import React, { useEffect, useRef, useState } from "react";
import { BarDatum } from "../../types/bar-datum";
import { GanttContentMoveAction } from "../../types/gantt-task-actions";
import { Bar } from "./bar/bar";
import { BarSmall } from "./bar/bar-small";
import { Milestone } from "./milestone/milestone";
// import { Project } from "./project/project";

// Styles
import style from "./datum-item.module.css";

export type DatumItemProps = {
  arrowIndent: number;
  datum: BarDatum;
  isProgressChangeable: boolean;
  isDateChangeable: boolean;
  isDelete: boolean;
  isSelected: boolean;
  onEventStart: (
    action: GanttContentMoveAction,
    selectedDatum: BarDatum,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => any;
  rtl: boolean;
  taskHeight: number;
};

export const DatumItem: React.FC<DatumItemProps> = props => {
  const {
    arrowIndent,
    datum,
    isDelete,
    isSelected,
    onEventStart,
    rtl,
    taskHeight,
  } = {
    ...props,
  };
  const textRef = useRef<SVGTextElement>(null);
  const [datumItem, setDatumItem] = useState<JSX.Element>(<div />);
  const [isTextInside, setIsTextInside] = useState(true);

  useEffect(() => {
    // Item based on type
    switch (datum.typeInternal) {
      case "milestone":
        setDatumItem(<Milestone {...props} />);
        break;
      
      /*
      case "project":
        setDatumItem(<Project {...props} />);
        break;
      */
      
      case "smalltask":
        setDatumItem(<BarSmall {...props} />);
        break;
      
      default:
        setDatumItem(<Bar {...props} />);
        break;
    }
  }, [datum, isSelected]);

  // Check text length
  useEffect(() => {
    if (textRef.current) {
      setIsTextInside(textRef.current.getBBox().width < datum.x2 - datum.x1);
    }
  }, [textRef, datum]);

  const getX = () => {
    const width = datum.x2 - datum.x1;
    const hasChild = datum.barChildren.length > 0;
    if (isTextInside) {
      return datum.x1 + width * 0.5;
    }
    if (rtl && textRef.current) {
      return (
        datum.x1 -
        textRef.current.getBBox().width -
        arrowIndent * +hasChild -
        arrowIndent * 0.2
      );
    } else {
      return datum.x1 + width + arrowIndent * +hasChild + arrowIndent * 0.2;
    }
  };

  // Bar label
  let barLabelClass = style.barLabel;
  switch (datum.typeInternal) {
    default:
      if (!isTextInside) {
        barLabelClass = style.barLabel && style.barLabelHidden;
        // barLabelClass = style.barLabel && style.barLabelOutside;
      }
  }

  return (
    <g
      onKeyDown={e => {
        switch (e.key) {
          case "Delete": {
            if (isDelete) onEventStart("delete", datum, e);
            break;
          }
        }
        e.stopPropagation();
      }}
      onMouseEnter={e => {
        onEventStart("mouseenter", datum, e);
      }}
      onMouseLeave={e => {
        onEventStart("mouseleave", datum, e);
      }}
      onDoubleClick={e => {
        onEventStart("dblclick", datum, e);
      }}
      onClick={e => {
        onEventStart("click", datum, e);
      }}
      onFocus={() => {
        onEventStart("select", datum);
      }}
    >
      {datumItem}
      <text
        x={getX()}
        y={datum.y + (taskHeight / 2)}
        className={barLabelClass}
        ref={textRef}
      >
        {datum.name}
      </text>
    </g>
  );
};
