import { Datum, DatumDateConstraint } from "../types/public-types";
import { BarDatum, DatumTypeInternal } from "../types/bar-datum";
import { BarMoveAction } from "../types/gantt-task-actions";
import { getRows } from "./other-helper";
// import { getRows } from "./other-helper";

export const convertToBarData = (
  data: Datum[],
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  datumHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string,
  /*
  projectProgressColor: string,
  projectProgressSelectedColor: string,
  projectBackgroundColor: string,
  projectBackgroundSelectedColor: string,
  */
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
) => {
  
  // let barCounter = 0;
  let barData: BarDatum[] = [];
  getRows(data)
    .forEach((rows, i) => {
      rows.forEach((d) => {    
        barData.push(convertToBarDatum(
          d,
          i,
          dates,
          columnWidth,
          rowHeight,
          datumHeight,
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
        ));
      })
    });

  // Set dependencies
  barData = barData.map(datum => {
    const dependencies = datum.dependencies || [];
    for (let j = 0; j < dependencies.length; j++) {
      const dependence = barData.findIndex(
        value => value.id === dependencies[j]
      );
      if (dependence !== -1) {
        barData[dependence].barChildren.push(datum);
      }
    }
    return datum;
  });

  return barData;
};

const convertToBarDatum = (
  datum: Datum,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  datumHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string,
  /*
  projectProgressColor: string,
  projectProgressSelectedColor: string,
  projectBackgroundColor: string,
  projectBackgroundSelectedColor: string,
  */
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
): BarDatum => {
  let barDatum: BarDatum;

  switch (datum.type) {
    case "milestone":
      barDatum = convertToMilestone(
        datum,
        index,
        dates,
        columnWidth,
        rowHeight,
        datumHeight,
        barCornerRadius,
        handleWidth,
        milestoneBackgroundColor,
        milestoneBackgroundSelectedColor
      );
      break;
    
    /*
    case "project":
      barDatum = convertToBar(
        datum,
        index,
        dates,
        columnWidth,
        rowHeight,
        datumHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        projectProgressColor,
        projectProgressSelectedColor,
        projectBackgroundColor,
        projectBackgroundSelectedColor
      );
      break;
    */
    
    default:
      barDatum = convertToBar(
        datum,
        index,
        dates,
        columnWidth,
        rowHeight,
        datumHeight,
        barCornerRadius,
        handleWidth,
        rtl,
        barProgressColor,
        barProgressSelectedColor,
        barBackgroundColor,
        barBackgroundSelectedColor
      );
      break;
  }

  return barDatum;
};

const convertToBar = (
  datum: Datum,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  datumHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  rtl: boolean,
  barProgressColor: string,
  barProgressSelectedColor: string,
  barBackgroundColor: string,
  barBackgroundSelectedColor: string
): BarDatum => {
  let x1: number;
  let x2: number;
  if (rtl) {
    x2 = datumXCoordinateRTL(datum.start, dates, columnWidth);
    x1 = datumXCoordinateRTL(datum.end, dates, columnWidth);
  } else {
    x1 = datumXCoordinate(datum.start, dates, columnWidth);
    x2 = datumXCoordinate(datum.end, dates, columnWidth);
  }

  let typeInternal: DatumTypeInternal = datum.type;
  if (typeInternal === "task" && x2 - x1 < handleWidth * 2) {
    typeInternal = "smalltask";
    x2 = x1 + handleWidth * 2;
  }

  const [progressWidth, progressX] = progressWithByParams(
    x1,
    x2,
    datum.progress,
    rtl
  );

  const y = datumYCoordinate(index, rowHeight, datumHeight);

  // const hideChildren = datum.type === "project" ? datum.hideChildren : undefined;
  const hideChildren = datum.hideChildren;

  const styles = {
    backgroundColor: barBackgroundColor,
    backgroundSelectedColor: barBackgroundSelectedColor,
    progressColor: barProgressColor,
    progressSelectedColor: barProgressSelectedColor,
    ...datum.styles,
  };

  return {
    ...datum,
    typeInternal,
    x1,
    x2,
    y,
    index,
    progressX,
    progressWidth,
    barCornerRadius,
    handleWidth,
    hideChildren,
    height: datumHeight,
    barChildren: [],
    styles,
  };
};

const convertToMilestone = (
  datum: Datum,
  index: number,
  dates: Date[],
  columnWidth: number,
  rowHeight: number,
  datumHeight: number,
  barCornerRadius: number,
  handleWidth: number,
  milestoneBackgroundColor: string,
  milestoneBackgroundSelectedColor: string
): BarDatum => {
  const x = datumXCoordinate(datum.start, dates, columnWidth);
  const y = datumYCoordinate(index, rowHeight, datumHeight);

  const x1 = x - datumHeight * 0.5;
  const x2 = x + datumHeight * 0.5;

  const rotatedHeight = datumHeight / 1.414;
  const styles = {
    backgroundColor: milestoneBackgroundColor,
    backgroundSelectedColor: milestoneBackgroundSelectedColor,
    progressColor: "",
    progressSelectedColor: "",
    ...datum.styles,
  };
  return {
    ...datum,
    end: datum.start,
    x1,
    x2,
    y,
    index,
    progressX: 0,
    progressWidth: 0,
    barCornerRadius,
    handleWidth,
    typeInternal: datum.type,
    progress: 0,
    height: rotatedHeight,
    hideChildren: undefined,
    barChildren: [],
    styles,
  };
};

const datumXCoordinate = (xDate: Date, dates: Date[], columnWidth: number) => {
  const index = dates.findIndex(d => d.getTime() >= xDate.getTime()) - 1;

  const remainderMillis = xDate.getTime() - dates[index].getTime();
  const percentOfInterval =
    remainderMillis / (dates[index + 1].getTime() - dates[index].getTime());
  const x = index * columnWidth + percentOfInterval * columnWidth;
  return x;
};

const datumXCoordinateRTL = (
  xDate: Date,
  dates: Date[],
  columnWidth: number
) => {
  let x = datumXCoordinate(xDate, dates, columnWidth);
  x += columnWidth;
  return x;
};
const datumYCoordinate = (
  index: number,
  rowHeight: number,
  datumHeight: number
) => {
  const y = index * rowHeight + (rowHeight - datumHeight) / 2;
  return y;
};

export const progressWithByParams = (
  datumX1: number,
  datumX2: number,
  progress: number,
  rtl: boolean
) => {
  const progressWidth = (datumX2 - datumX1) * progress * 0.01;
  let progressX: number;
  if (rtl) {
    progressX = datumX2 - progressWidth;
  } else {
    progressX = datumX1;
  }
  return [progressWidth, progressX];
};

export const progressByProgressWidth = (
  progressWidth: number,
  barDatum: BarDatum
) => {
  const barWidth = barDatum.x2 - barDatum.x1;
  const progressPercent = Math.round((progressWidth * 100) / barWidth);
  if (progressPercent >= 100) return 100;
  else if (progressPercent <= 0) return 0;
  else return progressPercent;
};

const progressByX = (x: number, datum: BarDatum) => {
  if (x >= datum.x2) return 100;
  else if (x <= datum.x1) return 0;
  else {
    const barWidth = datum.x2 - datum.x1;
    const progressPercent = Math.round(((x - datum.x1) * 100) / barWidth);
    return progressPercent;
  }
};

const progressByXRTL = (x: number, datum: BarDatum) => {
  if (x >= datum.x2) return 0;
  else if (x <= datum.x1) return 100;
  else {
    const barWidth = datum.x2 - datum.x1;
    const progressPercent = Math.round(((datum.x2 - x) * 100) / barWidth);
    return progressPercent;
  }
};

export const getProgressPoint = (
  progressX: number,
  datumY: number,
  datumHeight: number
) => {
  const point = [
    progressX - 5,
    datumY + datumHeight,
    progressX + 5,
    datumY + datumHeight,
    progressX,
    datumY + datumHeight - 8.66,
  ];
  return point.join(",");
};

const startByX = (x: number, xStep: number, datum: BarDatum) => {
  if (x >= datum.x2 - datum.handleWidth * 2) {
    x = datum.x2 - datum.handleWidth * 2;
  }
  const steps = Math.round((x - datum.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX = datum.x1 + additionalXValue;
  return newX;
};

const endByX = (x: number, xStep: number, datum: BarDatum) => {
  if (x <= datum.x1 + datum.handleWidth * 2) {
    x = datum.x1 + datum.handleWidth * 2;
  }
  const steps = Math.round((x - datum.x2) / xStep);
  const additionalXValue = steps * xStep;
  const newX = datum.x2 + additionalXValue;
  return newX;
};

const moveByX = (x: number, xStep: number, datum: BarDatum) => {
  const steps = Math.round((x - datum.x1) / xStep);
  const additionalXValue = steps * xStep;
  const newX1 = datum.x1 + additionalXValue;
  const newX2 = newX1 + datum.x2 - datum.x1;
  return [newX1, newX2];
};

const dateByX = (
  x: number,
  datumX: number,
  datumDate: Date,
  xStep: number,
  timeStep: number,
  dateConstraint?: DatumDateConstraint,
) => {
  let newDate = new Date((((x - datumX) / xStep) * timeStep) + datumDate.getTime());

  // Check for minimum / maximum dates
  let constrained = false;
  const minDate = dateConstraint?.min;
  if (minDate && (minDate.getTime() > newDate.getTime())) {
    constrained = true;
    newDate = minDate;
  }
  const maxDate = dateConstraint?.max;
  if (maxDate && (maxDate.getTime() < newDate.getTime())) {
    constrained = true;
    newDate = maxDate;
  }

  newDate = new Date(
    newDate.getTime() +
      (newDate.getTimezoneOffset() - datumDate.getTimezoneOffset()) * 60000
  );

  return { date: newDate, constrained };
};

const xByDate = (
  date: Date,
  datumX: number,
  datumDate: Date,
  xStep: number,
  timeStep: number,
) => {
  return (((date.getTime() - datumDate.getTime()) / timeStep) * xStep) + datumX;
}

/**
 * Method handles event in real time(mousemove) and on finish(mouseup)
 */
export const handleTaskBySVGMouseEvent = (
  svgX: number,
  action: BarMoveAction,
  selectedDatum: BarDatum,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number,
  rtl: boolean
): { isChanged: boolean; changedDatum: BarDatum } => {
  let result: { isChanged: boolean; changedDatum: BarDatum };

  switch (selectedDatum.type) {
    case "milestone":
      result = handleTaskBySVGMouseEventForMilestone(
        svgX,
        action,
        selectedDatum,
        xStep,
        timeStep,
        initEventX1Delta
      );
      break;
    
    default:
      result = handleTaskBySVGMouseEventForBar(
        svgX,
        action,
        selectedDatum,
        xStep,
        timeStep,
        initEventX1Delta,
        rtl
      );
      break;
  }

  return result;
};

const handleTaskBySVGMouseEventForBar = (
  svgX: number,
  action: BarMoveAction,
  selectedDatum: BarDatum,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number,
  rtl: boolean
): { isChanged: boolean; changedDatum: BarDatum } => {
  const changedDatum: BarDatum = { ...selectedDatum };
  let isChanged = false;

  switch (action) {
    case "progress":
      if (rtl) {
        changedDatum.progress = progressByXRTL(svgX, selectedDatum);
      } else {
        changedDatum.progress = progressByX(svgX, selectedDatum);
      }
      isChanged = changedDatum.progress !== selectedDatum.progress;
      if (isChanged) {
        const [progressWidth, progressX] = progressWithByParams(
          changedDatum.x1,
          changedDatum.x2,
          changedDatum.progress,
          rtl
        );
        changedDatum.progressWidth = progressWidth;
        changedDatum.progressX = progressX;
      }
      break;
    
    case "start": {
      const newX1 = startByX(svgX, xStep, selectedDatum);
      changedDatum.x1 = newX1;
      isChanged = changedDatum.x1 !== selectedDatum.x1;
      if (isChanged) {
        if (rtl) {
          ({ date: changedDatum.end } = dateByX(
            newX1,
            selectedDatum.x1,
            selectedDatum.end,
            xStep,
            timeStep,
            selectedDatum.dateConstraints?.end,
          ));
        } else {
          ({ date: changedDatum.start } = dateByX(
            newX1,
            selectedDatum.x1,
            selectedDatum.start,
            xStep,
            timeStep,
            selectedDatum.dateConstraints?.start,
          ));
        }

        const [progressWidth, progressX] = progressWithByParams(
          changedDatum.x1,
          changedDatum.x2,
          changedDatum.progress,
          rtl
        );

        changedDatum.progressWidth = progressWidth;
        changedDatum.progressX = progressX;
      }
      break;
    }
    
    case "end": {
      const newX2 = endByX(svgX, xStep, selectedDatum);
      changedDatum.x2 = newX2;
      isChanged = changedDatum.x2 !== selectedDatum.x2;
      if (isChanged) {
        if (rtl) {
          ({ date: changedDatum.start } = dateByX(
            newX2,
            selectedDatum.x2,
            selectedDatum.start,
            xStep,
            timeStep,
            selectedDatum.dateConstraints?.start,
          ));
        } else {
          ({ date: changedDatum.end } = dateByX(
            newX2,
            selectedDatum.x2,
            selectedDatum.end,
            xStep,
            timeStep,
            selectedDatum.dateConstraints?.end,
          ));
        }

        const [progressWidth, progressX] = progressWithByParams(
          changedDatum.x1,
          changedDatum.x2,
          changedDatum.progress,
          rtl
        );

        changedDatum.progressWidth = progressWidth;
        changedDatum.progressX = progressX;
      }
      break;
    }
      
    case "move": {
      let [newMoveX1, newMoveX2] = moveByX(
        svgX - initEventX1Delta,
        xStep,
        selectedDatum
      );
      isChanged = newMoveX1 !== selectedDatum.x1;
      if (isChanged) {
        let constrainedStart = false;
        let constrainedEnd = false;

        ({ date: changedDatum.start, constrained: constrainedStart } = dateByX(
          newMoveX1,
          selectedDatum.x1,
          selectedDatum.start,
          xStep,
          timeStep,
          selectedDatum.dateConstraints?.start
        ));

        ({ date: changedDatum.end, constrained: constrainedEnd } = dateByX(
          newMoveX2,
          selectedDatum.x2,
          selectedDatum.end,
          xStep,
          timeStep,
          selectedDatum.dateConstraints?.end
        ));

        // Check if move was constrained
        if (constrainedStart || constrainedEnd) {
          // Ensure duration is still correct
          const selectedDuration = selectedDatum.end.getTime() - selectedDatum.start.getTime();
          const changedDuration = changedDatum.end.getTime() - changedDatum.start.getTime();
          if (selectedDuration !== changedDuration) {
            if (changedDatum.end.getTime() >= selectedDatum.end.getTime()) {
              // Moving forward
              changedDatum.start = new Date(changedDatum.end.getTime() - selectedDuration);
            } else {
              // Moving backward
              changedDatum.end = new Date(changedDatum.start.getTime() + selectedDuration);
            }
          }

          // Recalculate x positions, based on constraints
          newMoveX1 = xByDate(
            changedDatum.start,
            selectedDatum.x1,
            selectedDatum.start,
            xStep,
            timeStep,
          );
          newMoveX2 = xByDate(
            changedDatum.end,
            selectedDatum.x1,
            selectedDatum.end,
            xStep,
            timeStep,
          );
        }

        changedDatum.x1 = newMoveX1;
        changedDatum.x2 = newMoveX2;

        const [progressWidth, progressX] = progressWithByParams(
          changedDatum.x1,
          changedDatum.x2,
          changedDatum.progress,
          rtl
        );

        changedDatum.progressWidth = progressWidth;
        changedDatum.progressX = progressX;
      }
      break;
    }
  }

  return { isChanged, changedDatum };
};

const handleTaskBySVGMouseEventForMilestone = (
  svgX: number,
  action: BarMoveAction,
  selectedDatum: BarDatum,
  xStep: number,
  timeStep: number,
  initEventX1Delta: number
): { isChanged: boolean; changedDatum: BarDatum } => {
  const changedDatum: BarDatum = { ...selectedDatum };
  let isChanged = false;

  switch (action) {
    case "move": {
      const [newMoveX1, newMoveX2] = moveByX(
        svgX - initEventX1Delta,
        xStep,
        selectedDatum
      );
      isChanged = newMoveX1 !== selectedDatum.x1;
      if (isChanged) {
        ({ date: changedDatum.start } = dateByX(
          newMoveX1,
          selectedDatum.x1,
          selectedDatum.start,
          xStep,
          timeStep,
          selectedDatum.dateConstraints?.start
        ));
        changedDatum.end = changedDatum.start;
        changedDatum.x1 = newMoveX1;
        changedDatum.x2 = newMoveX2;
      }
      break;
    }
  }
  
  return { isChanged, changedDatum };
};
