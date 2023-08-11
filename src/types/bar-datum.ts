import { Datum, DatumType } from "./public-types";

export type DatumTypeInternal = DatumType | "smalltask";

export interface BarDatum extends Datum {
  index: number;
  typeInternal: DatumTypeInternal;
  x1: number;
  x2: number;
  y: number;
  height: number;
  progressX: number;
  progressWidth: number;
  barCornerRadius: number;
  handleWidth: number;
  barChildren: BarDatum[];
  styles: {
    backgroundColor: string;
    backgroundSelectedColor: string;
    progressColor: string;
    progressSelectedColor: string;
  };
}
