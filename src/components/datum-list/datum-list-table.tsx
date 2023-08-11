import React, { useMemo } from "react";
import { Datum } from "../../types/public-types";
import { getRows } from "../../helpers/other-helper";

// Styles
import styles from "./datum-list-table.module.css";

const localeDateStringCache = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  /*
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  */
  // weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

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
  locale,
  onExpanderClick,
  rowHeight,
  rowWidth,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

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
      {rows.map((rowData) => {
        // Use first datum from row
        const [d] = rowData;

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
                  onClick={() => onExpanderClick(rowData)}
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
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(d.start, dateTimeOptions)}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(d.end, dateTimeOptions)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
