import { CSSProperties } from "react";

export enum ViewMode {
  Hour = "Hour",
  QuarterDay = "Quarter Day",
  HalfDay = "Half Day",
  Day = "Day",
  /** ISO-8601 week */
  Week = "Week",
  Month = "Month",
  QuarterYear = "QuarterYear",
  Year = "Year",
}

export type DatumType = "client" | "project" | "task" | "milestone";

export interface DatumDateConstraint {
  min?: Date;
  max?: Date;
}

export interface DatumDateConstraints {
  start?: DatumDateConstraint;
  end?: DatumDateConstraint;
}

export interface Datum {
  id: string;
  type: DatumType;
  name: string;
  start: Date;
  end: Date;
  /**
   * From 0 to 100
   */
  progress: number;
  additional?: any;
  dateConstraints?: DatumDateConstraints;
  dependencies?: string[];
  displayOrder?: number;
  hideChildren?: boolean;
  isDisabled?: boolean;
  parent?: string;
  preventOverlap?: boolean;
  row?: string;
  styles?: {
    backgroundColor?: string;
    backgroundSelectedColor?: string;
    progressColor?: string;
    progressSelectedColor?: string;
  };
}

export interface EventOption {
  /**
   * Invokes on bar select on unselect.
   */
  onSelect?: (datum: Datum, isSelected: boolean) => void;
  /**
   * Invokes on bar double click.
   */
  onDoubleClick?: (datum: Datum) => void;
  /**
   * Invokes on bar click.
   */
  onClick?: (datum: Datum) => void;
  /**
   * Invokes on end and start time change. Chart undoes operation if method return false or error.
   */
  onDateChange?: (
    datum: Datum,
    children: Datum[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on progress change. Chart undoes operation if method return false or error.
   */
  onProgressChange?: (
    datum: Datum,
    children: Datum[]
  ) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on delete selected task. Chart undoes operation if method return false or error.
   */
  onDelete?: (datum: Datum) => void | boolean | Promise<void> | Promise<boolean>;
  /**
   * Invokes on expander on task list
   */
  onExpanderClick?: (data: Datum[]) => void;
  /**
   * Time step value for date changes.
   */
  timeStep?: number;
}

export interface DisplayOption {
  /**
   * Specifies the month name language. Able formats: ISO 639-2, Java Locale
   */
  locale?: string;
  preStepsCount?: number;
  postStepsCount?: number;
  rtl?: boolean;
  viewMode?: ViewMode;
  viewDate?: Date;
}

export interface StylingOption {
  arrowColor?: string;
  arrowIndent?: number;
  barCornerRadius?: number;
  /**
   * How many of row width can be taken by datum.
   * From 0 to 100
   */
  barFill?: number;
  barProgressColor?: string;
  barProgressSelectedColor?: string;
  barBackgroundColor?: string;
  barBackgroundSelectedColor?: string;
  columnWidth?: number;
  DatumListHeader?: React.FC<{
    fontFamily: string;
    fontSize: string;
    headerHeight: number;
    rowWidth: string;
  }>;
  DatumListTable?: React.FC<{
    data: Datum[];
    fontFamily: string;
    fontSize: string;
    locale: string;
    onExpanderClick: (data: Datum[]) => void;
    rowHeight: number;
    rowWidth: string;
    selectedDatumId: string;
    /**
     * Sets selected datum by id
     */
    setSelectedDatum: (datumId: string) => void;
  }>;
  fontFamily?: string;
  fontSize?: string;
  ganttHeight?: number;
  handleWidth?: number;
  headerHeight?: number;
  listCellWidth?: string;
  milestoneBackgroundColor?: string;
  milestoneBackgroundSelectedColor?: string;
  projectProgressColor?: string;
  projectProgressSelectedColor?: string;
  projectBackgroundColor?: string;
  projectBackgroundSelectedColor?: string;
  rowHeight?: number;
  todayColor?: string;
  style?: CSSProperties,
  TooltipContent?: React.FC<{
    datum: Datum;
    fontSize: string;
    fontFamily: string;
  }>;
}

export interface GanttProps extends EventOption, DisplayOption, StylingOption {
  data: Datum[];
}
