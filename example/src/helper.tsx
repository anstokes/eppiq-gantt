import { Datum, DatumType } from "../../dist/types/public-types";

import clientEntries from "./clients.json";
import trackerLogEntries from "./tracker-log-entries.json";

export const defaultUuid = '00000000-0000-0000-0000-000000000000';

interface hashIndex {
  hash: string,
  index: number,
  entryIndex: number,
}

interface tag {
  id: string,
  name: string,
  active: number,
}

interface trackerLogEntry {
  organisation_id: string,
  user_id: string,
  client_id?: string | null,
  project_id?: string | null,
  project_task_id?: string | null,
  start_at: string | Date,
  end_at: string | Date,
  tags?: tag[],
  // Properties added during extrapolation
  id: string,
  name: string,
  hash: string,
  type: DatumType,
  parent?: string,
  row?: string,
}

export function initData() {
  const currentDate = new Date();

  let data: Datum[] = [
    /**/
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
      /*
      dateConstraints: {
        start: {
          min: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 
          max: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2), 
        },
        end: {
          min: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
          max: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
        },
      },
      */
      name: "eppiq",
      id: "e1",
      preventOverlap: true,
      progress: 25,
      type: "client",
      // hideChildren: true,
      displayOrder: 1,
      // row: 0,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 6),
      name: "eppiq",
      id: "e2",
      preventOverlap: true,
      progress: 25,
      type: "client",
      // hideChildren: true,
      displayOrder: 1,
      row: 'e1',
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 3),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      name: "abc",
      id: "a1",
      preventOverlap: true,
      progress: 25,
      type: "client",
      // hideChildren: true,
      displayOrder: 1,
      // row: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5),
      name: "def",
      id: "d1",
      preventOverlap: true,
      progress: 25,
      type: "client",
      // hideChildren: true,
      displayOrder: 1,
      // row: 2,
    },
  /*
  /*
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Some Project",
      id: "ProjectSample",
      progress: 25,
      type: "task",
      hideChildren: true,
      displayOrder: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "Idea",
      id: "Task 0",
      progress: 45,
      type: "project",
      parent: "ProjectSample",
      displayOrder: 2,
      hideChildren: true,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      end: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        2,
        12,
        28
      ),
      name: "Idea Sub",
      id: "Subtask 0",
      progress: 45,
      type: "task",
      parent: "Task 0",
      displayOrder: 3,
      // row: 1,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4, 0, 0),
      name: "Research",
      id: "Task 1",
      progress: 25,
      // dependencies: ["Task 0"],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 4,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 4),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8, 0, 0),
      name: "Discussion with team",
      id: "Task 2",
      progress: 10,
      dependencies: ["Task 1"],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 5,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 9, 0, 0),
      name: "Developing",
      id: "Task 3",
      progress: 2,
      dependencies: ["Task 2"],
      type: "task",
      parent: "ProjectSample",
      displayOrder: 6,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 8),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
      name: "Review",
      id: "Task 4",
      type: "task",
      progress: 70,
      dependencies: ["Task 2"],
      parent: "ProjectSample",
      displayOrder: 7,
      // row: 2,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      name: "Release",
      id: "Task 6",
      progress: currentDate.getMonth(),
      type: "milestone",
      dependencies: ["Task 4"],
      parent: "ProjectSample",
      displayOrder: 8,
    },
    {
      start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      end: new Date(currentDate.getFullYear(), currentDate.getMonth(), 19),
      name: "Party Time",
      id: "Task 9",
      progress: 0,
      isDisabled: true,
      type: "task",
    },
    /**/
  ];

  // const minimumDurationSeconds = 0;
  const minimumDurationSeconds = 300;

  // Parse raw trackerLogEntries into clients, projects and tasks
  /*
  const clientList: string[] = [];
  const clientData: trackerLogEntry[] = [];

  const projectList: string[] = [];
  const projectData: trackerLogEntry[] = [];

  const taskList: string[] = [];
  // const taskData: trackerLogEntry[] = [];
  */
  
  // Read, and convert, clients
  const clientHashes = new Map();
  clientHashes.set(defaultUuid, 'Unallocated');
  clientEntries.forEach(({ id, name }) => {
    clientHashes.set(id, name);
  })

  // Loop through entries to build tree / heirarchy
  const groupBy = [{
    field: 'client_id',
    label: 'Client: ',
    type: 'client',
  }/*, {
    field: 'project_id',
    label: 'Project: ',
    type: 'project',
  }, {
    field: 'project_task_id',
    label: 'Task: ',
    type: 'task',
  }*/];

  const extrapolatedEntries: trackerLogEntry[] = [];
  while (groupBy.length) {
    trackerLogEntries
      // Filter to remove entry of less than 'x' seconds
      .filter(({
        client_id: clientId,
        start_at: start,
        end_at: end,
      }) => clientId
        && (
          (new Date(end).getTime() - new Date(start).getTime())
          > (minimumDurationSeconds * 1000)
        )
      )
      .forEach((trackerLogEntry) => {
        let hash = groupBy
          .map(({ field }) => trackerLogEntry[field] || defaultUuid)
          .join('|');

        let parent = undefined;
        const hashParts = hash.split('|');
        if (hashParts.length > 1) {
          hashParts.pop();
          parent = hashParts.join('|');
          // console.log(`${hash} is a child of: ${parent}`);
        }

        // Last part of group
        const lastGroup = groupBy[(groupBy.length - 1)];
        let fieldValue;
        switch (lastGroup.field) {
          case 'client_id':
            fieldValue = clientHashes.get(trackerLogEntry[lastGroup.field]);
            break;
          
          default:
            fieldValue = trackerLogEntry[lastGroup.field] || 'Unallocated';
        }

        // Type for group
        const type: DatumType = lastGroup.type as DatumType;

        extrapolatedEntries.push({
          ...trackerLogEntry,
          id: '',
          name: `${lastGroup.label} ${fieldValue}`,
          hash,
          type,
          parent,
        });
        // console.log(entryHash);
      });
      
    groupBy.pop();
  }

  function localeHash(hash: string) {
    const partLookups = [clientHashes, null, null];
    const hashParts = hash.split('|');
    let localeHash: string[] = [];
    for (let x = 0; x < hashParts.length; x += 1) {
      const localePart = partLookups[x]?.get(hashParts[x]);
      if (localePart) {
        // Use lookup value
        localeHash.push(localePart.toLowerCase());
      } else {
        // Use hash
        localeHash.push(hashParts[x])
      }
    }
    return localeHash.join('|');
  }

  // Sort extrapolated entries
  extrapolatedEntries.sort((a, b) => {
    const localeA = localeHash(a.hash);
    const localeB = localeHash(b.hash);

    // Sort by hash first
    if (localeA < localeB) {
      return -1;
    } else if (localeA > localeB) {
      return 1;
    }

    // If hash is equal, order by date/time
    if (a.start_at < b.start_at) {
      return -1;
    } else if (a.start_at > b.start_at) {
      return 1;
    }

    return 0;
  });

  // console.log(extrapolatedEntries);

  // Add unique IDs
  let indexedEntries = extrapolatedEntries.map((trackerLogEntry, i) => ({
    ...trackerLogEntry,
    id: `id:${i}`,
  }));

  // Re-link the parents
  indexedEntries = indexedEntries.map((trackerLogEntry) => {
    if (!trackerLogEntry.parent) {
      return trackerLogEntry;
    }

    return {
      ...trackerLogEntry,
      parent: indexedEntries.find(({ hash, start_at: startAt, end_at: endAt }) => (
        (hash === trackerLogEntry.parent)
        && (new Date(startAt).getTime() === new Date(trackerLogEntry.start_at).getTime())
        && (new Date(endAt).getTime() === new Date(trackerLogEntry.end_at).getTime())
      ))?.id
    };
  });

  const flattenedEntries: trackerLogEntry[] = [];
  const hashIndexes: hashIndex[] = [];

  // Flatten the indexed entries
  const mergeSeconds = 0;
  indexedEntries.forEach((trackerLogEntry) => {
    const {
      hash,
      start_at: startAt,
      end_at: endAt,
    } = trackerLogEntry;

    // Find hash index
    const hashIndex = hashIndexes.find(({ hash: h }) => h === hash);
    if (!hashIndex) {
      const index = hashIndexes.length;
      hashIndexes.push({
        hash,
        index,
        entryIndex: flattenedEntries.length,
      });
      flattenedEntries.push(trackerLogEntry);
    } else {
      const { entryIndex, index } = hashIndex;
      if (new Date(flattenedEntries[entryIndex].end_at).getTime() >= (new Date(startAt).getTime() - (mergeSeconds * 1000))) {
        // console.log('Extending previous entry');
        // Extend previous entry
        flattenedEntries[entryIndex].end_at = endAt;
      } else {
        // Update previous entry reference
        hashIndexes[index].entryIndex = flattenedEntries.length;
        
        // New entry, on existing row
        flattenedEntries.push({
          ...trackerLogEntry,
          row: flattenedEntries[entryIndex].id,
        });
      }
    }
  });

  // console.log(flattenedEntries);
    
  // data = [...clientData, ...projectData]
  data = flattenedEntries
    .filter(({ client_id: clientId }) => clientId)
    .map(({
      id,
      hash,
      name,
      type,
      start_at: start,
      end_at: end,
      parent,
      row,
      organisation_id: organisationId,
      user_id: userId,
      client_id: clientId,
      project_id: projectId,
      project_task_id: taskId,
    }) => {
      return {
        id,
        name,
        type,
        start: new Date(start),
        end: new Date(end),
        additional: {
          hash,
          organisationId,
          userId,
          clientId,
          projectId,
          taskId,
        },
        parent,
        // Hide children by default
        hideChildren: true,
        // Prevent overlap by default
        preventOverlap: true,
        // Fill percentage
        progress: 100,
        row,
      }
    });

  return data;
}

export function getStartEndDateForParent(data: Datum[], parentId: string) {
  const parentData = data.filter(d => d.parent === parentId);
  let start = parentData[0].start;
  let end = parentData[0].end;

  for (let i = 0; i < parentData.length; i += 1) {
    const parent = parentData[i];
    if (start.getTime() > parent.start.getTime()) {
      start = parent.start;
    }
    if (end.getTime() < parent.end.getTime()) {
      end = parent.end;
    }
  }
  return [start, end];
}
