import { BarDatum } from "../types/bar-datum";
import { Datum } from "../types/public-types";

export function isKeyboardEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.KeyboardEvent {
  return (event as React.KeyboardEvent).key !== undefined;
}

export function isMouseEvent(
  event: React.MouseEvent | React.KeyboardEvent | React.FocusEvent
): event is React.MouseEvent {
  return (event as React.MouseEvent).clientX !== undefined;
}

export function isBarTask(datum: Datum | BarDatum): datum is BarDatum {
  return (datum as BarDatum).x1 !== undefined;
}

export function removeHiddenData(data: Datum[]) {
  const groupedTasks = data.filter(t => t.hideChildren);
  if (groupedTasks.length > 0) {
    for (let i = 0; groupedTasks.length > i; i++) {
      const groupedTask = groupedTasks[i];
      const children = getChildren(data, groupedTask);
      data = data.filter(d => children.indexOf(d) === -1);
    }
  }
  return data;
}

export function getChildren(dataList: Datum[], datum: Datum) {
  let data: Datum[] = dataList.filter(d => d.parent && (d.parent === datum.id));
  var dataChildren: Datum[] = [];
  data.forEach(d => {
    dataChildren.push(...getChildren(dataList, d));
  })
  data = data.concat(dataChildren);
  return data;
}

export function getParents(dataList: Datum[], datum: Datum) {
  let data: Datum[] = [];
  var dataParents: Datum[] = [];
  if (datum.parent) {
    data = dataList.filter(d => d.id === datum.parent);
    data.forEach(d => {
      dataParents.push(...getParents(dataList, d));
    })
  }
  data = data.concat(dataParents);
  return data;
}

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

export const sortData = (datumA: Datum, datumB: Datum) => {
  const orderA = datumA.displayOrder || Number.MAX_VALUE;
  const orderB = datumB.displayOrder || Number.MAX_VALUE;
  if (orderA > orderB) {
    return 1;
  } else if (orderA < orderB) {
    return -1;
  } else {
    return 0;
  }
};
