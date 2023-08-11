import React, { useEffect, useRef } from "react";
import { BarDatum } from "../../types/bar-datum";
import { Datum } from "../../types/public-types";

export type DatumListProps = {
  data: Datum[];
  datumListRef: React.RefObject<HTMLDivElement>;
  DatumListHeader: React.FC<{
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
  }>;
  DatumListTable: React.FC<{
    data: Datum[];
    fontFamily: string;
    fontSize: string;
    locale: string;
    onExpanderClick: (data: Datum[]) => void;
    rowHeight: number;
    rowWidth: string;
    selectedDatumId: string;
    setSelectedDatum: (datumId: string) => void;
  }>;
  fontFamily: string;
  fontSize: string;
  ganttHeight: number;
  headerHeight: number;
  horizontalContainerClass?: string;
  locale: string;
  onExpanderClick: (data: Datum[]) => void;
  rowHeight: number;
  rowWidth: string;
  scrollY: number;
  selectedDatum: BarDatum | undefined;
  setSelectedDatum: (datum: string) => void;
};

export const DatumList: React.FC<DatumListProps> = ({
  data,
  datumListRef,
  DatumListHeader,
  DatumListTable,
  horizontalContainerClass,
  fontFamily,
  fontSize,
  ganttHeight,
  headerHeight,
  locale,
  onExpanderClick,
  rowWidth,
  rowHeight,
  scrollY,
  selectedDatum,
  setSelectedDatum,
}) => {
  const horizontalContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (horizontalContainerRef.current) {
      horizontalContainerRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  const headerProps = {
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth,
  };
  const selectedDatumId = selectedDatum ? selectedDatum.id : "";
  const tableProps = {
    data,
    fontFamily,
    fontSize,
    locale,
    onExpanderClick,
    rowHeight,
    rowWidth,
    selectedDatumId,
    setSelectedDatum,
  };

  return (
    <div ref={datumListRef}>
      <DatumListHeader {...headerProps} />
      <div
        ref={horizontalContainerRef}
        className={horizontalContainerClass}
        style={ganttHeight ? { height: ganttHeight } : {}}
      >
        <DatumListTable {...tableProps} />
      </div>
    </div>
  );
};
