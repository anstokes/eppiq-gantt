import React from "react";
import { Datum } from "../../../dist/types/public-types";

// Styles
import styles from "./datum-list-table.module.css";

export function getRows(data: Datum[]): Datum[][] {
  const rows: Datum[][] = [];
  data.forEach((d) => {
    if (typeof (d.row) !== 'undefined') {
      let rowIndex = -1;

      // Loop through rows
      rows.forEach((subRow, i) => {
        // Check if row contains target row
        const foundRow = subRow.find(({ id }) => id === d.row);
        if (foundRow) {
          rowIndex = i;   
        }
      })

      if (rowIndex < 0) {
        // Create new row
        rows.push([d]);
      } else {
        // Add to existing row
        rows[rowIndex].push(d);
      }
    } else {
      // Create new row
      rows.push([d]);
    }
  });
  // console.log(rows);
  return rows;
}

function hoursMinutesSeconds(secs: number) {
  // var sec_num = parseInt(secs, 10);
  var hours = Math.floor(secs / 3600);
  var minutes = Math.floor(secs / 60) % 60;
  // var seconds = secs % 60;

  return [hours,minutes]
      .map(v => v < 10 ? "0" + v : v)
      // .filter((v,i) => v !== "00" || i > 0)
      .join(":")
}

export const DatumListTableDefault: React.FC<{
  data: Datum[];
  fontFamily: string;
  fontSize: string;
  locale: string;
  onExpanderClick: (data: Datum[]) => void;
  rowHeight: number;
  rowWidth: string;
  selectedDatumId: string;
  setSelectedDatum: (datumId: string) => void;
}> = ({
  data,
  fontFamily,
  fontSize,
  onExpanderClick,
  rowHeight,
  rowWidth,
}) => {
  // Read rows from data
  const rows = getRows(data);

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {/* data.map((d) => { */}
      {rows.map((data) => {
        const [d] = data;

        let expanderSymbol = "";
        if (d.type !== 'task') {
          if (d.hideChildren === false) {
            expanderSymbol = "▼";
          } else if (d.hideChildren === true) {
            expanderSymbol = "▶";
          }
        }

        // Padding for row text/label
        let paddingLeft = 0;
        switch (d.type) {
          case 'project':
            paddingLeft = 10;
            break;
          
          case 'task':
            paddingLeft = 20;
            break;
          
          default:
            break;
        }

        let durationSeconds = 0;
        data.forEach((datum) => {
          durationSeconds += (new Date(datum.end).getTime() - new Date(datum.start).getTime());
        });
        const durationString = hoursMinutesSeconds(durationSeconds / 1000);

        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
            key={`${d.id}row`}
          >
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={d.name}
            >
              <div className={styles.taskListNameWrapper}>
                <div
                  className={
                    expanderSymbol
                      ? styles.taskListExpander
                      : styles.taskListEmptyExpander
                  }
                  // onClick={() => onExpanderClick(d)}
                  onClick={() => onExpanderClick(data)}                  
                  style={{ paddingLeft }}
                >
                  {expanderSymbol}
                </div>
                <div
                  style={expanderSymbol ? {} : { paddingLeft }}
                >
                  {d.name}
                </div>
              </div>
            </div>
            <div
              className={styles.taskListCell}
              style={{
                width: '80px'
              }}
            >
              {durationString}
            </div>
          </div>
        );
      })}
    </div>
  );
};
