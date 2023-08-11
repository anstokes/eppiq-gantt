// Core component
export { Gantt } from "./components/gantt/gantt";

// Helpers
export {
  getChildren,
  getParents,
  getRows,
} from "./helpers/other-helper"

export {
  ViewMode,
} from "./types/public-types";

// Public types
export type {
  GanttProps,
  Datum,
  StylingOption,
  DisplayOption,
  EventOption,
} from "./types/public-types";
