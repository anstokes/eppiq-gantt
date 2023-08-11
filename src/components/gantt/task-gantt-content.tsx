import React, { useEffect, useState } from "react";
import { Datum, EventOption } from "../../types/public-types";
import { BarDatum } from "../../types/bar-datum";
import { Arrow } from "../other/arrow";
import { handleTaskBySVGMouseEvent } from "../../helpers/bar-helper";
import { isKeyboardEvent } from "../../helpers/other-helper";
import { DatumItem } from "../datum-item/datum-item";
import {
  BarMoveAction,
  GanttContentMoveAction,
  GanttEvent,
} from "../../types/gantt-task-actions";

export type TaskGanttContentProps = {
  data: BarDatum[];
  dates: Date[];
  ganttEvent: GanttEvent;
  selectedDatum: BarDatum | undefined;
  rowHeight: number;
  columnWidth: number;
  timeStep: number;
  svg?: React.RefObject<SVGSVGElement>;
  svgWidth: number;
  taskHeight: number;
  arrowColor: string;
  arrowIndent: number;
  fontSize: string;
  fontFamily: string;
  rtl: boolean;
  setGanttEvent: (value: GanttEvent) => void;
  setFailedDatum: (value: BarDatum | null) => void;
  setSelectedDatum: (datumId: string) => void;
} & EventOption;

export const sortByField = (field: string, datumA: Datum, datumB: Datum) => {
  const orderA = datumA[field];
  const orderB = datumB[field];
  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};

export const TaskGanttContent: React.FC<TaskGanttContentProps> = ({
  data,
  dates,
  ganttEvent,
  selectedDatum,
  rowHeight,
  columnWidth,
  timeStep,
  svg,
  taskHeight,
  arrowColor,
  arrowIndent,
  fontFamily,
  fontSize,
  rtl,
  setGanttEvent,
  setFailedDatum,
  setSelectedDatum,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
}) => {
  const point = svg?.current?.createSVGPoint();
  const [xStep, setXStep] = useState(0);
  const [initEventX1Delta, setInitEventX1Delta] = useState(0);
  const [isMoving, setIsMoving] = useState(false);

  // create xStep
  useEffect(() => {
    const dateDelta =
      dates[1].getTime() -
      dates[0].getTime() -
      dates[1].getTimezoneOffset() * 60 * 1000 +
      dates[0].getTimezoneOffset() * 60 * 1000;
    const newXStep = (timeStep * columnWidth) / dateDelta;
    setXStep(newXStep);
  }, [columnWidth, dates, timeStep]);

  useEffect(() => {
    // Check if preventing overlap of bars
    if (selectedDatum?.preventOverlap) {
      let topLevelDatum = selectedDatum;
      while (topLevelDatum.parent) {
        const parentDatum = data.find(({ id }) => id === topLevelDatum.parent);
        if (parentDatum) {
          topLevelDatum = parentDatum;
        }
      }

      // Ensure dateConstraints is populated
      if (!selectedDatum.dateConstraints) {
        selectedDatum.dateConstraints = {};
      }

      // Find bars of the same type
      const sameTypes = data
        .filter(({ id, type }) => type === topLevelDatum.type && id !== topLevelDatum.id);
      // console.log(sameTypes);
      
      if (sameTypes.length) {
        // Find any that end BEFORE the selected starts
        const earlierTypes = sameTypes
          .filter(({ end }) => end <= topLevelDatum.start)
          .sort((a, b) => sortByField('end', a, b))
          .reverse();
        if (earlierTypes.length) {
          selectedDatum.dateConstraints.start = {
            min: earlierTypes[0].end,
          }
        }

        // Find any that start AFTER the selected ends
        const laterTypes = sameTypes
          .filter(({ start }) => start >= topLevelDatum.end)
          .sort((a, b) => sortByField('start', a, b));
        if (laterTypes.length) {
          selectedDatum.dateConstraints.end = {
            max: laterTypes[0].start,
          }
        }
      }
    }
  }, [data, selectedDatum]);

  useEffect(() => {
    const handleMouseMove = async (event: MouseEvent) => {
      if (!ganttEvent.changedDatum || !point || !svg?.current) return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );

      const { isChanged, changedDatum } = handleTaskBySVGMouseEvent(
        cursor.x,
        ganttEvent.action as BarMoveAction,
        ganttEvent.changedDatum, // This is the datum
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      if (isChanged) {
        setGanttEvent({ action: ganttEvent.action, changedDatum });
      }
    };

    const handleMouseUp = async (event: MouseEvent) => {
      const { action, originalSelectedDatum, changedDatum } = ganttEvent;
      if (!changedDatum || !point || !svg?.current || !originalSelectedDatum)
        return;
      event.preventDefault();

      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg?.current.getScreenCTM()?.inverse()
      );
      const { changedDatum: newChangedDatum } = handleTaskBySVGMouseEvent(
        cursor.x,
        action as BarMoveAction,
        changedDatum,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );

      const isNotLikeOriginal =
        originalSelectedDatum.start !== newChangedDatum.start ||
        originalSelectedDatum.end !== newChangedDatum.end ||
        originalSelectedDatum.progress !== newChangedDatum.progress;

      // remove listeners
      svg.current.removeEventListener("mousemove", handleMouseMove);
      svg.current.removeEventListener("mouseup", handleMouseUp);
      setGanttEvent({ action: "" });
      setIsMoving(false);

      // custom operation start
      let operationSuccess = true;
      if (
        (action === "move" || action === "end" || action === "start") &&
        onDateChange &&
        isNotLikeOriginal
      ) {
        try {
          const result = await onDateChange(
            newChangedDatum,
            newChangedDatum.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      } else if (onProgressChange && isNotLikeOriginal) {
        try {
          const result = await onProgressChange(
            newChangedDatum,
            newChangedDatum.barChildren
          );
          if (result !== undefined) {
            operationSuccess = result;
          }
        } catch (error) {
          operationSuccess = false;
        }
      }

      // If operation is failed - return old state
      if (!operationSuccess) {
        setFailedDatum(originalSelectedDatum);
      }
    };

    if (
      !isMoving &&
      (ganttEvent.action === "move" ||
        ganttEvent.action === "end" ||
        ganttEvent.action === "start" ||
        ganttEvent.action === "progress") &&
      svg?.current
    ) {
      svg.current.addEventListener("mousemove", handleMouseMove);
      svg.current.addEventListener("mouseup", handleMouseUp);
      setIsMoving(true);
    }
  }, [
    ganttEvent,
    xStep,
    initEventX1Delta,
    onProgressChange,
    timeStep,
    onDateChange,
    svg,
    isMoving,
    point,
    rtl,
    setFailedDatum,
    setGanttEvent,
  ]);

  /**
   * Method is start point of datum change
   */
  const handleBarEventStart = async (
    action: GanttContentMoveAction,
    datum: BarDatum,
    event?: React.MouseEvent | React.KeyboardEvent
  ) => {
    if (!event) {
      if (action === "select") {
        setSelectedDatum(datum.id);
      }
    }

    // Keyboard events
    else if (isKeyboardEvent(event)) {
      if (action === "delete") {
        if (onDelete) {
          try {
            const result = await onDelete(datum);
            if (result !== undefined && result) {
              setGanttEvent({ action, changedDatum: datum });
            }
          } catch (error) {
            console.error("Error on Delete. " + error);
          }
        }
      }
    }
      
    // Mouse Events
    else if (action === "mouseenter") {
      if (!ganttEvent.action) {
        setGanttEvent({
          action,
          changedDatum: datum,
          originalSelectedDatum: datum,
        });
      }
    } else if (action === "mouseleave") {
      if (ganttEvent.action === "mouseenter") {
        setGanttEvent({ action: "" });
      }
    } else if (action === "dblclick") {
      !!onDoubleClick && onDoubleClick(datum);
    } else if (action === "click") {
      !!onClick && onClick(datum);
    }
      
    // Change task event start
    else if (action === "move") {
      if (!svg?.current || !point) return;
      point.x = event.clientX;
      const cursor = point.matrixTransform(
        svg.current.getScreenCTM()?.inverse()
      );
      setInitEventX1Delta(cursor.x - datum.x1);
      setGanttEvent({
        action,
        changedDatum: datum,
        originalSelectedDatum: datum,
      });
    } else {
      setGanttEvent({
        action,
        changedDatum: datum,
        originalSelectedDatum: datum,
      });
    }
  };

  return (
    <g className="content">
      <g className="arrows" fill={arrowColor} stroke={arrowColor}>
        {data.map(datum => {
          return datum.barChildren.map(child => {
            return (
              <Arrow
                key={`Arrow from ${datum.id} to ${data[child.index].id}`}
                arrowIndent={arrowIndent}
                datumFrom={datum}
                datumTo={data[child.index]}
                rowHeight={rowHeight}
                rtl={rtl}
                taskHeight={taskHeight}
              />
            );
          });
        })}
      </g>
      <g className="bar" fontFamily={fontFamily} fontSize={fontSize}>
        {data.map(datum => {
          return (
            <DatumItem
              key={datum.id}
              arrowIndent={arrowIndent}
              datum={datum}
              isDateChangeable={!!onDateChange && !datum.isDisabled}
              isDelete={!datum.isDisabled}
              isProgressChangeable={!!onProgressChange && !datum.isDisabled}
              isSelected={!!selectedDatum && datum.id === selectedDatum.id}
              onEventStart={handleBarEventStart}
              rtl={rtl}
              taskHeight={taskHeight}
            />
          );
        })}
      </g>
    </g>
  );
};
