import React, {
  useState,
  SyntheticEvent,
  useRef,
  useEffect,
  useMemo,
} from "react";

import { Datum, GanttProps, ViewMode } from "../../types/public-types";
import { GridProps } from "../grid/grid";
import { ganttDateRange, seedDates } from "../../helpers/date-helper";
import { CalendarProps } from "../calendar/calendar";
import { TaskGanttContentProps } from "./task-gantt-content";
import { DatumListProps, DatumList } from "../datum-list/datum-list";
import { DatumListHeaderDefault } from "../datum-list/datum-list-header";
import { DatumListTableDefault } from "../datum-list/datum-list-table";
import { StandardTooltipContent, Tooltip } from "../other/tooltip";
import { VerticalScroll } from "../other/vertical-scroll";
import { TaskGantt } from "./task-gantt";
import { BarDatum } from "../../types/bar-datum";
import { convertToBarData } from "../../helpers/bar-helper";
import { GanttEvent } from "../../types/gantt-task-actions";
import { DateSetup } from "../../types/date-setup";
import { HorizontalScroll } from "../other/horizontal-scroll";
import { getRows, removeHiddenData, sortData } from "../../helpers/other-helper";

// Styles
import styles from "./gantt.module.css";

export const Gantt: React.FunctionComponent<GanttProps> = ({
  data,
  headerHeight = 50,
  columnWidth = 60,
  listCellWidth = "155px",
  rowHeight = 50,
  ganttHeight = 0,
  viewMode = ViewMode.Day,
  preStepsCount = 1,
  postStepsCount = 1,
  locale = "en-GB",
  barFill = 60,
  barCornerRadius = 3,
  barProgressColor = "#a3a3ff",
  barProgressSelectedColor = "#8282f5",
  barBackgroundColor = "#b8c2cc",
  barBackgroundSelectedColor = "#aeb8c2",
  projectProgressColor = "#7db59a",
  projectProgressSelectedColor = "#59a985",
  projectBackgroundColor = "#fac465",
  projectBackgroundSelectedColor = "#f7bb53",
  milestoneBackgroundColor = "#f1c453",
  milestoneBackgroundSelectedColor = "#f29e4c",
  rtl = false,
  handleWidth = 8,
  timeStep = 300000,
  arrowColor = "grey",
  fontFamily = "Arial, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue",
  fontSize = "14px",
  arrowIndent = 20,
  todayColor = "rgba(252, 248, 227, 0.5)",
  viewDate,
  TooltipContent = StandardTooltipContent,
  DatumListHeader = DatumListHeaderDefault,
  DatumListTable = DatumListTableDefault,
  onDateChange,
  onProgressChange,
  onDoubleClick,
  onClick,
  onDelete,
  onSelect,
  onExpanderClick,
}) => {
  // console.log('Rendered Gantt');
  const datumListRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [dateSetup, setDateSetup] = useState<DateSetup>(() => {
    const [startDate, endDate] = ganttDateRange(data, viewMode, preStepsCount, postStepsCount,);
    return { viewMode, dates: seedDates(startDate, endDate, viewMode) };
  });
  const [currentViewDate, setCurrentViewDate] = useState<Date | undefined>(
    undefined
  );

  const [datumListWidth, setDatumListWidth] = useState(0);
  const [svgContainerWidth, setSvgContainerWidth] = useState(0);
  const [svgContainerHeight, setSvgContainerHeight] = useState(ganttHeight);
  const [barData, setBarData] = useState<BarDatum[]>([]);
  const [ganttEvent, setGanttEvent] = useState<GanttEvent>({
    action: "",
  });
  const taskHeight = useMemo(
    () => (rowHeight * barFill) / 100,
    [rowHeight, barFill]
  );

  const [selectedDatum, setSelectedDatum] = useState<BarDatum>();
  const [failedDatum, setFailedDatum] = useState<BarDatum | null>(null);

  const svgWidth = dateSetup.dates.length * columnWidth;
  const ganttFullHeight = barData.length * rowHeight;

  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(-1);
  const [ignoreScrollEvent, setIgnoreScrollEvent] = useState(false);

  // task change events
  useEffect(() => {
    let filteredData: Datum[];
    if (onExpanderClick) {
      filteredData = removeHiddenData(data);
    } else {
      filteredData = data;
    }
    filteredData = filteredData.sort(sortData);
    // console.log(filteredData);
    const [startDate, endDate] = ganttDateRange(
      filteredData,
      viewMode,
      preStepsCount,
      postStepsCount,
    );
    let newDates = seedDates(startDate, endDate, viewMode);
    if (rtl) {
      newDates = newDates.reverse();
      if (scrollX === -1) {
        setScrollX(newDates.length * columnWidth);
      }
    }
    setDateSetup({ dates: newDates, viewMode });
    setBarData(
      convertToBarData(
        filteredData,
        newDates,
        columnWidth,
        rowHeight,
        taskHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor,
        /*
        projectProgressColor,
        projectProgressSelectedColor,
        projectBackgroundColor,
        projectBackgroundSelectedColor,
        */
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor
      )
    );
  }, [
    data,
    viewMode,
    preStepsCount,
    postStepsCount,
    rowHeight,
    barCornerRadius,
    columnWidth,
    taskHeight,
    handleWidth,
    barProgressColor,
    barProgressSelectedColor,
    barBackgroundColor,
    barBackgroundSelectedColor,
    projectProgressColor,
    projectProgressSelectedColor,
    projectBackgroundColor,
    projectBackgroundSelectedColor,
    milestoneBackgroundColor,
    milestoneBackgroundSelectedColor,
    rtl,
    scrollX,
    onExpanderClick,
  ]);

  useEffect(() => {
    if (
      viewMode === dateSetup.viewMode &&
      ((viewDate && !currentViewDate) ||
        (viewDate && currentViewDate?.valueOf() !== viewDate.valueOf()))
    ) {
      const dates = dateSetup.dates;
      const index = dates.findIndex(
        (d, i) =>
          viewDate.valueOf() >= d.valueOf() &&
          i + 1 !== dates.length &&
          viewDate.valueOf() < dates[i + 1].valueOf()
      );
      if (index === -1) {
        return;
      }
      setCurrentViewDate(viewDate);
      setScrollX(columnWidth * index);
    }
  }, [
    viewDate,
    columnWidth,
    dateSetup.dates,
    dateSetup.viewMode,
    viewMode,
    currentViewDate,
    setCurrentViewDate,
  ]);

  useEffect(() => {
    const { changedDatum, action } = ganttEvent;
    if (changedDatum) {
      if (action === "delete") {
        setGanttEvent({ action: "" });
        setBarData(barData.filter(d => d.id !== changedDatum.id));
      } else if (
        action === "move" ||
        action === "end" ||
        action === "start" ||
        action === "progress"
      ) {
        const prevStateTask = barData.find(t => t.id === changedDatum.id);
        if (
          prevStateTask &&
          (prevStateTask.start.getTime() !== changedDatum.start.getTime() ||
            prevStateTask.end.getTime() !== changedDatum.end.getTime() ||
            prevStateTask.progress !== changedDatum.progress)
        ) {
          // actions for change
          const newData = barData.map(d =>
            d.id === changedDatum.id ? changedDatum : d
          );
          setBarData(newData);
        }
      }
    }
  }, [ganttEvent, barData]);

  useEffect(() => {
    if (failedDatum) {
      setBarData(barData.map(d => (d.id !== failedDatum.id ? d : failedDatum)));
      setFailedDatum(null);
    }
  }, [failedDatum, barData]);

  useEffect(() => {
    if (!listCellWidth) {
      setDatumListWidth(0);
    }
    if (datumListRef.current) {
      setDatumListWidth(datumListRef.current.offsetWidth);
    }
  }, [datumListRef, listCellWidth]);

  useEffect(() => {
    if (wrapperRef.current) {
      setSvgContainerWidth(wrapperRef.current.offsetWidth - datumListWidth);
    }
  }, [wrapperRef, datumListWidth]);

  useEffect(() => {
    if (ganttHeight) {
      setSvgContainerHeight(ganttHeight + headerHeight);
    } else {
      // Length is now based on unique row count (not data length)
      const rowCount = getRows(data).length;
      // console.log(rowCount, data.length);
      setSvgContainerHeight(rowCount * rowHeight + headerHeight);
    }
  }, [ganttHeight, data, headerHeight, rowHeight]);

  // scroll events
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.shiftKey || event.deltaX) {
        const scrollMove = event.deltaX ? event.deltaX : event.deltaY;
        let newScrollX = scrollX + scrollMove;
        if (newScrollX < 0) {
          newScrollX = 0;
        } else if (newScrollX > svgWidth) {
          newScrollX = svgWidth;
        }
        setScrollX(newScrollX);
        event.preventDefault();
      } else if (ganttHeight) {
        let newScrollY = scrollY + event.deltaY;
        if (newScrollY < 0) {
          newScrollY = 0;
        } else if (newScrollY > ganttFullHeight - ganttHeight) {
          newScrollY = ganttFullHeight - ganttHeight;
        }
        if (newScrollY !== scrollY) {
          setScrollY(newScrollY);
          event.preventDefault();
        }
      }

      setIgnoreScrollEvent(true);
    };

    // subscribe if scroll is necessary
    wrapperRef.current?.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () => {
      wrapperRef.current?.removeEventListener("wheel", handleWheel);
    };
  }, [
    wrapperRef,
    scrollY,
    scrollX,
    ganttHeight,
    svgWidth,
    rtl,
    ganttFullHeight,
  ]);

  const handleScrollY = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollY !== event.currentTarget.scrollTop && !ignoreScrollEvent) {
      setScrollY(event.currentTarget.scrollTop);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  const handleScrollX = (event: SyntheticEvent<HTMLDivElement>) => {
    if (scrollX !== event.currentTarget.scrollLeft && !ignoreScrollEvent) {
      setScrollX(event.currentTarget.scrollLeft);
      setIgnoreScrollEvent(true);
    } else {
      setIgnoreScrollEvent(false);
    }
  };

  /**
   * Handles arrow keys events and transform it to new scroll
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newScrollY = scrollY;
    let newScrollX = scrollX;
    let isX = true;
    switch (event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        newScrollY += rowHeight;
        isX = false;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        newScrollY -= rowHeight;
        isX = false;
        break;
      case "Left":
      case "ArrowLeft":
        newScrollX -= columnWidth;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
        newScrollX += columnWidth;
        break;
    }
    if (isX) {
      if (newScrollX < 0) {
        newScrollX = 0;
      } else if (newScrollX > svgWidth) {
        newScrollX = svgWidth;
      }
      setScrollX(newScrollX);
    } else {
      if (newScrollY < 0) {
        newScrollY = 0;
      } else if (newScrollY > ganttFullHeight - ganttHeight) {
        newScrollY = ganttFullHeight - ganttHeight;
      }
      setScrollY(newScrollY);
    }
    setIgnoreScrollEvent(true);
  };

  /**
   * Task select event
   */
  const handleSelectedDatum = (datumId: string) => {
    const newSelectedDatum = barData.find(d => d.id === datumId);
    const oldSelectedDatum = barData.find(
      d => !!selectedDatum && d.id === selectedDatum.id
    );
    if (onSelect) {
      if (oldSelectedDatum) {
        onSelect(oldSelectedDatum, false);
      }
      if (newSelectedDatum) {
        onSelect(newSelectedDatum, true);
      }
    }
    setSelectedDatum(newSelectedDatum);
  };

  const handleExpanderClick = (data: Datum[]) => {
    const dataWithChildren: Datum[] = data
      .filter(({ hideChildren }) => hideChildren !== undefined);

    if (onExpanderClick && dataWithChildren.length) {
      onExpanderClick(dataWithChildren);
    }
  };

  const gridProps: GridProps = {
    columnWidth,
    data,
    dates: dateSetup.dates,
    rowHeight,
    rtl,
    svgWidth,
    todayColor,
  };

  const calendarProps: CalendarProps = {
    columnWidth,
    dateSetup,
    fontFamily,
    fontSize,
    headerHeight,
    locale,
    rtl,
    viewMode,
  };

  const barProps: TaskGanttContentProps = {
    arrowColor,
    arrowIndent,
    columnWidth,
    data: barData,
    dates: dateSetup.dates,
    fontFamily,
    fontSize,
    ganttEvent,
    onDateChange,
    onProgressChange,
    onDoubleClick,
    onClick,
    onDelete,
    rowHeight,
    rtl,
    selectedDatum,
    setGanttEvent,
    setFailedDatum,
    setSelectedDatum: handleSelectedDatum,
    svgWidth,
    taskHeight,
    timeStep,
  };

  const tableProps: DatumListProps = {
    data: barData,
    datumListRef,
    DatumListHeader,
    DatumListTable,
    fontFamily,
    fontSize,
    ganttHeight,
    headerHeight,
    horizontalContainerClass: styles.horizontalContainer,
    locale,
    onExpanderClick: handleExpanderClick,
    rowHeight,
    rowWidth: listCellWidth,
    scrollY,
    selectedDatum,
    setSelectedDatum: handleSelectedDatum,
  };

  return (
    <div>
      <div
        className={styles.wrapper}
        onKeyDown={handleKeyDown}
        ref={wrapperRef}
        tabIndex={0}
      >
        {listCellWidth && <DatumList {...tableProps} />}
        <TaskGantt
          barProps={barProps}
          calendarProps={calendarProps}
          ganttHeight={ganttHeight}
          gridProps={gridProps}
          scrollY={scrollY}
          scrollX={scrollX}
        />
        {ganttEvent.changedDatum && (
          <Tooltip
            arrowIndent={arrowIndent}
            datum={ganttEvent.changedDatum}
            datumListWidth={datumListWidth}
            fontFamily={fontFamily}
            fontSize={fontSize}
            headerHeight={headerHeight}
            rowHeight={rowHeight}
            rtl={rtl}
            scrollX={scrollX}
            scrollY={scrollY}
            svgContainerHeight={svgContainerHeight}
            svgContainerWidth={svgContainerWidth}
            svgWidth={svgWidth}
            TooltipContent={TooltipContent}
          />
        )}
        <VerticalScroll
          ganttFullHeight={ganttFullHeight}
          ganttHeight={ganttHeight}
          headerHeight={headerHeight}
          onScroll={handleScrollY}
          rtl={rtl}
          scroll={scrollY}
        />
      </div>
      <HorizontalScroll
        datumListWidth={datumListWidth}
        onScroll={handleScrollX}
        rtl={rtl}
        scroll={scrollX}
        svgWidth={svgWidth}
      />
    </div>
  );
};
