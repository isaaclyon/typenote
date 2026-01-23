import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';

import { ObjectDataGrid } from './ObjectDataGrid.js';
import type { DataGridColumn } from './types.js';

export default {
  title: 'Features/ObjectDataGrid',
};

// Sample data type
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: number;
  tags: string[];
  dueDate: Date | null;
  completed: boolean;
  assigneeId: string | null;
}

// Sample data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design new dashboard',
    status: 'in_progress',
    priority: 1,
    tags: ['design', 'ui'],
    dueDate: new Date('2026-02-01'),
    completed: false,
    assigneeId: 'user-1',
  },
  {
    id: '2',
    title: 'Fix authentication bug',
    status: 'done',
    priority: 2,
    tags: ['bug', 'security'],
    dueDate: new Date('2026-01-20'),
    completed: true,
    assigneeId: 'user-2',
  },
  {
    id: '3',
    title: 'Write documentation',
    status: 'todo',
    priority: 3,
    tags: ['docs'],
    dueDate: null,
    completed: false,
    assigneeId: null,
  },
  {
    id: '4',
    title: 'Code review PR #42',
    status: 'todo',
    priority: 2,
    tags: ['review'],
    dueDate: new Date('2026-01-25'),
    completed: false,
    assigneeId: 'user-1',
  },
];

// Column definitions
const columns: DataGridColumn<Task>[] = [
  { key: 'title', header: 'Title', type: 'title', isTitle: true },
  {
    key: 'status',
    header: 'Status',
    type: 'select',
    options: ['todo', 'in_progress', 'done'],
  },
  { key: 'priority', header: 'Priority', type: 'number', align: 'center' },
  {
    key: 'tags',
    header: 'Tags',
    type: 'multiselect',
    options: ['design', 'ui', 'bug', 'security', 'docs', 'review'],
  },
  { key: 'dueDate', header: 'Due Date', type: 'date' },
  { key: 'completed', header: 'Done', type: 'boolean', align: 'center' },
];

export const Default: Story = () => {
  const [data, setData] = React.useState(sampleTasks);
  const [sortColumn, setSortColumn] = React.useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleCellChange = (rowId: string, columnKey: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnKey]: value } : row)));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    setData((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const aVal = a[column as keyof Task];
        const bVal = b[column as keyof Task];
        if (aVal === null) return 1;
        if (bVal === null) return -1;
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  };

  return (
    <div className="p-6">
      <ObjectDataGrid
        data={data}
        columns={columns}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        onCellChange={handleCellChange}
        onRowOpen={(row) => console.log('Open row:', row)}
      />
    </div>
  );
};

export const WithSelection: Story = () => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  return (
    <div className="p-6">
      <div className="mb-4 text-sm text-muted-foreground">
        Selected: {selectedIds.size > 0 ? Array.from(selectedIds).join(', ') : 'None'}
      </div>
      <ObjectDataGrid
        data={sampleTasks}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowOpen={(row) => console.log('Open row:', row)}
      />
    </div>
  );
};

export const WithRowActions: Story = () => {
  const [data, setData] = React.useState(sampleTasks);

  const handleDelete = (row: Task) => {
    setData((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div className="p-6">
      <ObjectDataGrid
        data={data}
        columns={columns}
        onRowDelete={handleDelete}
        rowActions={[
          {
            id: 'archive',
            label: 'Archive',
            icon: <File className="h-4 w-4" />,
            onClick: (row) => console.log('Archive:', row),
          },
          {
            id: 'assign',
            label: 'Assign',
            icon: <User className="h-4 w-4" />,
            onClick: (row) => console.log('Assign:', row),
          },
        ]}
      />
    </div>
  );
};

export const Loading: Story = () => (
  <div className="p-6">
    <ObjectDataGrid data={[]} columns={columns} loading />
  </div>
);

export const Empty: Story = () => (
  <div className="p-6">
    <ObjectDataGrid data={[]} columns={columns} emptyMessage="No tasks found. Create one!" />
  </div>
);

export const FullFeatured: Story = () => {
  const [data, setData] = React.useState(sampleTasks);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortColumn, setSortColumn] = React.useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleCellChange = (rowId: string, columnKey: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnKey]: value } : row)));
  };

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleDelete = (row: Task) => {
    setData((prev) => prev.filter((r) => r.id !== row.id));
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(row.id);
      return newSet;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-4 text-sm text-muted-foreground">Selected: {selectedIds.size} items</div>
      <ObjectDataGrid
        data={data}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSortChange={handleSort}
        onCellChange={handleCellChange}
        onRowOpen={(row) => console.log('Open:', row)}
        onRowDelete={handleDelete}
      />
    </div>
  );
};
