import React, { useEffect } from "react";
import { getChildren, getParents, Datum, ViewMode, Gantt } from "gantt-task-react";
import { ViewSwitcher } from "./components/view-switcher";
import { initData } from "./helper";
import "gantt-task-react/dist/index.css";

// Summary table
import { DatumListHeaderDefault } from "./components/DatumListHeader";
import { DatumListTableDefault } from "./components/DatumListTable";

const equal = require('fast-deep-equal');

const supportedViewModes = [
  {
    defaultWidth: 60,
    minimumWidth: 60,
    maximumWidth: 480,
    view: ViewMode.Hour,
  },
  {
    defaultWidth: 240,
    minimumWidth: 120,
    maximumWidth: 240,
    view: ViewMode.Day,
  },
  {
    defaultWidth: 300,
    minimumWidth: 75,
    maximumWidth: 300,
    view: ViewMode.Month,
  }
];

const initialData = initData();

function dataComparisonFields(datum: Datum) {
  const { id, name, start, end } = datum;
  return ({
    id,
    name,
    start: new Date(start).getTime(),
    end: new Date(end).getTime(),
  });
}

// Init
const App = () => {
  // Data
  const [data, setData] = React.useState<Datum[]>(initialData);
  const [dataChanged, setDataChanged] = React.useState(false);

  // View variables; zoom etc.
  const [columnWidth, setColumnWidth] = React.useState(60);
  const [timeStep, setTimeStep] = React.useState(300);
  const [view, setView] = React.useState<ViewMode>(ViewMode.Hour);

  const [isChecked, setIsChecked] = React.useState(true);

  useEffect(() => {
    let changed = false;

    // Convert data to comparison format
    const comparisonData = initialData.map(dataComparisonFields);  
    const currentData = data.map(dataComparisonFields);

    if (!equal(currentData, comparisonData)) {
      changed = true;
      /*
      currentData.forEach((d, i) => {
        if (!equal(d, comparisonData[i])) {        
          console.log("Difference: ", d, comparisonData[i]);
        }
      })
      */
    } else {
      changed = false;
    }

    if (changed !== dataChanged) {
      setDataChanged(changed);
    }
  }, [data, dataChanged, setDataChanged])
  
  useEffect(() => {
    const supportedViewMode = supportedViewModes.find(({ view: v }) => v === view);
    if (supportedViewMode) {
      if (columnWidth > supportedViewMode.defaultWidth) {
        // Zooming in, use minimum width
        setColumnWidth(supportedViewMode.minimumWidth);
      } else if (columnWidth < supportedViewMode.defaultWidth) {
        // Zooming out, use maximum width
        setColumnWidth(supportedViewMode.maximumWidth);
      } else {
        // Use default width
        setColumnWidth(supportedViewMode.defaultWidth);
      }
    }
  }, [view, setColumnWidth]);

  useEffect(() => {
    // Default timestep
    let newTimeStep = 300;

    // If sufficiently zoomed in
    if ((view === ViewMode.Hour) && (columnWidth > 60)) {
      // Allow 60s time steps
      newTimeStep = 60
    }

    // Only change if required
    if (timeStep !== newTimeStep) {
      setTimeStep(newTimeStep);
    }
  }, [columnWidth, timeStep, view, setTimeStep]);

  const handleDateChange = (datum: Datum) => {
    console.log("On date change id: " + datum.id);

    // Change the data on the selected datum
    let newData = data.map((d) => ((d.id === datum.id) ? datum : d));

    // Find the original data
    const originalDatum = data.find(({ id }) => (id === datum.id));
    let originalStartTime: number, originalEndTime: number;
    if (originalDatum) {
      const { start: originalStart, end: originalEnd } = originalDatum;
      // Convert date to time
      originalStartTime = new Date(originalStart).getTime();
      originalEndTime = new Date(originalEnd).getTime();
    }
    
    // Loop through related entries (children / parents)
    const children = getChildren(data, datum);
    const parents = getParents(data, datum);
    [...children, ...parents].forEach((related) => {
      const relatedIndex = newData.findIndex((d) => (d.id === related.id));
      // Update related if times match
      if (
        related.start.getTime() === originalStartTime
        || related.end.getTime() === originalEndTime
      ) {
        const newRelatedData = { ...newData[relatedIndex] };
        // Change start time on related
        if (related.start.getTime() === originalStartTime) {
          newRelatedData.start = datum.start;
        }
        // Change end time on related
        if (related.end.getTime() === originalEndTime) {
          newRelatedData.end = datum.end;
        }
        // Update related
        newData[relatedIndex] = newRelatedData;
      }
    });

    setData(newData);
  };

  const handleClick = (datum: Datum) => {
    console.log("On click event id: " + datum.id);
  };

  const handleDblClick = (datum: Datum) => {
    alert("On double-click event id: " + datum.id);
  };

  const handleDelete = (datum: Datum) => {
    const conf = window.confirm("Are you sure about " + datum.name + " ?");
    if (conf) {
      setData(data.filter((d) => d.id !== datum.id));
    }
    return conf;
  };

  const handleProgressChange = async (datum: Datum) => {
    setData(data.map((d) => (d.id === datum.id ? datum : d)));
    console.log("On progress change id: " + datum.id);
  };

  const handleSelect = (datum: Datum, isSelected: boolean) => {
    console.log(datum.name + " has " + (isSelected ? "selected" : "unselected"));
  };

  const handleExpanderClick = (rowData: Datum[]) => {
    const expandIds = rowData.map(({ id }) => id);
    setData(data.map((d) => (
      expandIds.includes(d.id)
        ? ({ ...d, hideChildren: !d.hideChildren })
        : d
    )));
  };

  const handleIncreaseZoom = () => {
    // console.log(view, columnWidth);
    const newColumnWidth = columnWidth * 2;
    const viewIndex = supportedViewModes.findIndex(({ view: v }) => v === view);
    if (
      (viewIndex !== -1)
      && (viewIndex > 0)
      && (newColumnWidth > supportedViewModes[viewIndex].maximumWidth)
    ) {
      return setView(supportedViewModes[viewIndex - 1].view);
    }
    setColumnWidth(Math.min(newColumnWidth, supportedViewModes[viewIndex].maximumWidth));
  }

  const handleDecreaseZoom = () => {
    // console.log(view, columnWidth);
    const newColumnWidth = columnWidth / 2;
    const viewIndex = supportedViewModes.findIndex(({ view: v }) => v === view);
    if (
      (viewIndex !== -1)
      && (viewIndex < (supportedViewModes.length - 1))
      && (newColumnWidth < supportedViewModes[viewIndex].minimumWidth)
    ) {
        return setView(supportedViewModes[viewIndex + 1].view);
    }
    setColumnWidth(Math.max(newColumnWidth, supportedViewModes[viewIndex].minimumWidth));
  }

  const revertData = () => {
    setData(initialData);
  }

  const saveData = () => {
    const toSave = data
      .map((datum) => {
        // Read relevant fields from datum
        const { id, additional, start, end } = datum;

        // Check that entry is base level of heirarchy, to avoid duplication
        if (additional && additional.hash && (additional.hash.split("|").length === 3)) {
          // Check if modified from original entry
          let modified = true;
          const originalData = initialData.find(({ id: i }) => i === id);
          if (originalData && equal(dataComparisonFields(originalData), dataComparisonFields(datum))) {
            modified = false;
          }

          // Read fields from additional
          const { organisationId, userId, clientId, projectId, taskId } = additional;
          return ({
            organisationId,
            userId,
            clientId,
            projectId,
            taskId,
            start,
            end,
            modified,
          })
        }

        return null;
      })
      // Remove null entries
      .filter((entry) => entry);
    
    console.log(toSave);
  }

  return (
    <div className="Wrapper">
      <div>
        Data changed: {dataChanged ? "YES" : "NO"}
        {
          dataChanged
          ? (
            <div>
              <button onClick={revertData}>Revert</button>
              <button onClick={saveData}>Save</button>
            </div>
          )
          : null
        }
      </div>
      <ViewSwitcher
        onIncreaseZoom={handleIncreaseZoom}
        onDecreaseZoom={handleDecreaseZoom}
        onViewModeChange={viewMode => setView(viewMode)}
        onViewListChange={setIsChecked}
        isChecked={isChecked}
      />
      <Gantt
        columnWidth={columnWidth}
        data={data}
        DatumListHeader={DatumListHeaderDefault}
        DatumListTable={DatumListTableDefault}
        listCellWidth={isChecked ? "250px" : ""}
        onClick={handleClick}
        onDateChange={handleDateChange}
        onDelete={handleDelete}
        onDoubleClick={handleDblClick}
        onExpanderClick={handleExpanderClick}
        onProgressChange={handleProgressChange}
        onSelect={handleSelect}
        timeStep={(timeStep * 1000)}
        viewMode={view}
      />
    </div>
  );
};

export default App;
