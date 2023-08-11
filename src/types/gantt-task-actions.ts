import { BarDatum } from "./bar-datum";

export type BarMoveAction = "progress" | "end" | "start" | "move";
export type GanttContentMoveAction =
  | "mouseenter"
  | "mouseleave"
  | "delete"
  | "dblclick"
  | "click"
  | "select"
  | ""
  | BarMoveAction;

export type GanttEvent = {
  changedDatum?: BarDatum;
  originalSelectedDatum?: BarDatum;
  action: GanttContentMoveAction;
};
