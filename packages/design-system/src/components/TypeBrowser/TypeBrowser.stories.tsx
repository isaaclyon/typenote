import * as React from 'react';
import type { Story } from '@ladle/react';
import { TypeBrowser } from './TypeBrowser.js';
import type { TypeBrowserColumn } from './types.js';

export default {
  title: 'Components/TypeBrowser',
};

// ============================================================================
// Mock Data Types & Data
// ============================================================================

// Note: Interface needs index signature to satisfy Record<string, unknown> constraint
interface Task {
  [key: string]: unknown;
  id: string;
  title: string;
  status: string;
  priority: number;
  dueDate: string;
  completed: boolean;
  tags: string[];
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Write documentation',
    status: 'In Progress',
    priority: 2,
    dueDate: '2026-01-15',
    completed: false,
    tags: ['docs', 'urgent'],
  },
  {
    id: '2',
    title: 'Review pull request',
    status: 'Todo',
    priority: 1,
    dueDate: '2026-01-14',
    completed: false,
    tags: ['review'],
  },
  {
    id: '3',
    title: 'Fix login bug',
    status: 'Done',
    priority: 3,
    dueDate: '2026-01-10',
    completed: true,
    tags: ['bug', 'auth'],
  },
  {
    id: '4',
    title: 'Update dependencies',
    status: 'Todo',
    priority: 2,
    dueDate: '2026-01-20',
    completed: false,
    tags: [],
  },
  {
    id: '5',
    title: 'Add unit tests',
    status: 'In Progress',
    priority: 1,
    dueDate: '2026-01-16',
    completed: false,
    tags: ['testing'],
  },
];

const columns: TypeBrowserColumn<Task>[] = [
  { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 200 },
  {
    id: 'status',
    header: 'Status',
    accessorKey: 'status',
    type: 'select',
    options: ['Todo', 'In Progress', 'Done'],
    width: 120,
  },
  { id: 'priority', header: 'Priority', accessorKey: 'priority', type: 'number', width: 80 },
  { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', type: 'date', width: 120 },
  { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 60 },
  { id: 'tags', header: 'Tags', accessorKey: 'tags', type: 'multiselect', width: 150 },
];

// Generate many rows for scrolling tests
function generateManyTasks(count: number): Task[] {
  const statuses = ['Todo', 'In Progress', 'Done'];
  const tagOptions = ['docs', 'urgent', 'review', 'bug', 'feature', 'testing', 'refactor'];

  return Array.from({ length: count }, (_, i) => {
    const randomTags = tagOptions
      .filter(() => Math.random() > 0.7)
      .slice(0, Math.floor(Math.random() * 3));

    return {
      id: `task-${i + 1}`,
      title: `Task ${i + 1}: ${['Implement', 'Review', 'Fix', 'Update', 'Add', 'Remove'][i % 6]} ${['feature', 'component', 'bug', 'test', 'docs'][i % 5]}`,
      status: statuses[i % 3] ?? 'Todo',
      priority: (i % 3) + 1,
      dueDate: new Date(2026, 0, 10 + (i % 20)).toISOString().split('T')[0] ?? '2026-01-10',
      completed: i % 4 === 0,
      tags: randomTags,
    };
  });
}

// ============================================================================
// All Cell Types Demo Data
// ============================================================================

interface AllTypesRow {
  [key: string]: unknown;
  id: string;
  textValue: string;
  numberValue: number;
  booleanValue: boolean;
  dateValue: string;
  datetimeValue: string;
  selectValue: string;
  multiselectValue: string[];
}

const allTypesData: AllTypesRow[] = [
  {
    id: '1',
    textValue: 'Sample text content',
    numberValue: 42,
    booleanValue: true,
    dateValue: '2026-01-15',
    datetimeValue: '2026-01-15T14:30:00',
    selectValue: 'Option A',
    multiselectValue: ['Tag 1', 'Tag 2'],
  },
  {
    id: '2',
    textValue: 'Another row of data',
    numberValue: 100,
    booleanValue: false,
    dateValue: '2026-02-20',
    datetimeValue: '2026-02-20T09:15:00',
    selectValue: 'Option B',
    multiselectValue: ['Tag 3'],
  },
  {
    id: '3',
    textValue: 'Third row example',
    numberValue: 0,
    booleanValue: true,
    dateValue: '2026-03-01',
    datetimeValue: '2026-03-01T18:00:00',
    selectValue: 'Option C',
    multiselectValue: [],
  },
  {
    id: '4',
    textValue: '',
    numberValue: -5,
    booleanValue: false,
    dateValue: '',
    datetimeValue: '',
    selectValue: '',
    multiselectValue: ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4'],
  },
];

const allTypesColumns: TypeBrowserColumn<AllTypesRow>[] = [
  { id: 'textValue', header: 'Text', accessorKey: 'textValue', type: 'text', width: 180 },
  { id: 'numberValue', header: 'Number', accessorKey: 'numberValue', type: 'number', width: 80 },
  {
    id: 'booleanValue',
    header: 'Boolean',
    accessorKey: 'booleanValue',
    type: 'boolean',
    width: 80,
  },
  { id: 'dateValue', header: 'Date', accessorKey: 'dateValue', type: 'date', width: 120 },
  {
    id: 'datetimeValue',
    header: 'Datetime',
    accessorKey: 'datetimeValue',
    type: 'datetime',
    width: 180,
  },
  {
    id: 'selectValue',
    header: 'Select',
    accessorKey: 'selectValue',
    type: 'select',
    options: ['Option A', 'Option B', 'Option C'],
    width: 100,
  },
  {
    id: 'multiselectValue',
    header: 'Multiselect',
    accessorKey: 'multiselectValue',
    type: 'multiselect',
    width: 180,
  },
];

// ============================================================================
// Stories
// ============================================================================

/**
 * Default story - Basic table with sample data
 */
export const Default: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser
      data={mockTasks}
      columns={columns}
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  </div>
);

/**
 * Empty state - Table with no data
 */
export const Empty: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser<Task>
      data={[]}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage="No tasks found"
    />
  </div>
);

/**
 * Empty state with custom message
 */
export const EmptyCustomMessage: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser<Task>
      data={[]}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage="Create your first task to get started"
    />
  </div>
);

/**
 * Loading state - Shows skeleton loading UI
 */
export const Loading: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser<Task> data={[]} columns={columns} getRowId={(row) => row.id} isLoading={true} />
  </div>
);

/**
 * Loading state with few columns
 */
export const LoadingFewColumns: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser<Task>
      data={[]}
      columns={columns.slice(0, 3)}
      getRowId={(row) => row.id}
      isLoading={true}
    />
  </div>
);

/**
 * Many rows - Tests scrolling behavior with 50+ rows
 */
export const ManyRows: Story = () => {
  const manyTasks = React.useMemo(() => generateManyTasks(50), []);

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <TypeBrowser
        data={manyTasks}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

/**
 * Extra large dataset - 100 rows for stress testing
 */
export const ExtraLargeDataset: Story = () => {
  const manyTasks = React.useMemo(() => generateManyTasks(100), []);

  return (
    <div className="h-[500px] border rounded-lg overflow-hidden">
      <TypeBrowser
        data={manyTasks}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

/**
 * Sorting - Interactive demo with sorting hint
 */
export const Sorting: Story = () => (
  <div className="space-y-4">
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
      <strong>Tip:</strong> Click on any column header to sort. Click again to toggle between
      ascending, descending, and no sort. The current sort direction is shown with an arrow (↑/↓).
    </div>
    <div className="h-96 border rounded-lg overflow-hidden">
      <TypeBrowser
        data={mockTasks}
        columns={columns}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  </div>
);

/**
 * All Cell Types - Demonstrates each supported cell type
 */
export const AllCellTypes: Story = () => (
  <div className="space-y-4">
    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
      <strong>Cell Types:</strong> This table demonstrates all supported cell types: text, number,
      boolean (checkmark), date, datetime, select, and multiselect. Empty values display as a dash
      (–).
    </div>
    <div className="h-80 border rounded-lg overflow-hidden">
      <TypeBrowser
        data={allTypesData}
        columns={allTypesColumns}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  </div>
);

/**
 * Interactive - With state management for row selection
 */
export const Interactive: Story = () => {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
        <strong>Selected:</strong> {selectedId ? `Task ${selectedId}` : 'None'}
      </div>
      <div className="h-96 border rounded-lg overflow-hidden">
        <TypeBrowser
          data={mockTasks}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => setSelectedId(row.id)}
        />
      </div>
    </div>
  );
};

/**
 * Without row click - No hover state on rows
 */
export const WithoutRowClick: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser data={mockTasks} columns={columns} getRowId={(row) => row.id} />
  </div>
);

/**
 * Narrow columns - Tests column width constraints
 */
export const NarrowColumns: Story = () => {
  const narrowColumns: TypeBrowserColumn<Task>[] = [
    { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 150 },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'select', width: 80 },
    { id: 'priority', header: 'Pri', accessorKey: 'priority', type: 'number', width: 50 },
    { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 50 },
  ];

  return (
    <div className="h-96 border rounded-lg overflow-hidden max-w-md">
      <TypeBrowser
        data={mockTasks}
        columns={narrowColumns}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

/**
 * Wide container - Tests table behavior in wide container
 */
export const WideContainer: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden w-full">
    <TypeBrowser
      data={mockTasks}
      columns={columns}
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  </div>
);

/**
 * Edge cases - Shows various edge cases in one view
 */
export const EdgeCases: Story = () => {
  interface EdgeCaseRow {
    [key: string]: unknown;
    id: string;
    text: string;
    number: number;
    bool: boolean;
    date: string;
    tags: string[];
  }

  const edgeCaseData: EdgeCaseRow[] = [
    {
      id: '1',
      text: 'Normal value',
      number: 42,
      bool: true,
      date: '2026-01-15',
      tags: ['tag1', 'tag2'],
    },
    { id: '2', text: '', number: 0, bool: false, date: '', tags: [] },
    {
      id: '3',
      text: 'Very long text that might need to be truncated in narrow columns to prevent overflow issues',
      number: 999999,
      bool: true,
      date: '2099-12-31',
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    },
    { id: '4', text: 'Negative', number: -100, bool: false, date: 'invalid-date', tags: ['only'] },
  ];

  const edgeCaseColumns: TypeBrowserColumn<EdgeCaseRow>[] = [
    { id: 'text', header: 'Text (with empties)', accessorKey: 'text', type: 'text', width: 200 },
    { id: 'number', header: 'Number', accessorKey: 'number', type: 'number', width: 80 },
    { id: 'bool', header: 'Boolean', accessorKey: 'bool', type: 'boolean', width: 70 },
    { id: 'date', header: 'Date', accessorKey: 'date', type: 'date', width: 120 },
    { id: 'tags', header: 'Tags', accessorKey: 'tags', type: 'multiselect', width: 200 },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Edge Cases:</strong> Empty values, zero/negative numbers, very long text, invalid
        dates, many tags, and single tags.
      </div>
      <div className="h-80 border rounded-lg overflow-hidden">
        <TypeBrowser
          data={edgeCaseData}
          columns={edgeCaseColumns}
          getRowId={(row) => row.id}
          onRowClick={(row) => console.log('Clicked:', row)}
        />
      </div>
    </div>
  );
};

/**
 * Single column - Minimal table configuration
 */
export const SingleColumn: Story = () => {
  const singleColumn: TypeBrowserColumn<Task>[] = [
    { id: 'title', header: 'Tasks', accessorKey: 'title', type: 'text' },
  ];

  return (
    <div className="h-96 border rounded-lg overflow-hidden max-w-sm">
      <TypeBrowser
        data={mockTasks}
        columns={singleColumn}
        getRowId={(row) => row.id}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

/**
 * Single row - Minimal data
 */
export const SingleRow: Story = () => (
  <div className="h-48 border rounded-lg overflow-hidden">
    <TypeBrowser
      data={mockTasks.slice(0, 1)}
      columns={columns}
      getRowId={(row) => row.id}
      onRowClick={(row) => console.log('Clicked:', row)}
    />
  </div>
);

/**
 * With Selection - Row selection with checkboxes
 */
export const WithSelection: Story = () => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(['2', '4']));

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
        Selected: {selectedIds.size} items ({[...selectedIds].join(', ')})
      </div>
      <TypeBrowser
        data={mockTasks}
        columns={columns}
        getRowId={(row) => row.id}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
};

/**
 * Selection with Many Rows - Tests selection with large datasets
 */
export const SelectionWithManyRows: Story = () => {
  const manyTasks = React.useMemo(() => generateManyTasks(50), []);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(['task-1', 'task-5', 'task-10'])
  );

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
        Selected: {selectedIds.size} items
      </div>
      <TypeBrowser
        data={manyTasks}
        columns={columns}
        getRowId={(row) => row.id}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
};

/**
 * Selection with Row Click - Both selection and row click work together
 */
export const SelectionWithRowClick: Story = () => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [lastClicked, setLastClicked] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Note:</strong> Clicking the checkbox selects the row. Clicking anywhere else on the
        row triggers onRowClick. Both work independently.
      </div>
      <div className="h-96 border rounded-lg overflow-hidden">
        <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b flex gap-4">
          <span>Selected: {selectedIds.size} items</span>
          <span>Last clicked: {lastClicked ?? 'None'}</span>
        </div>
        <TypeBrowser
          data={mockTasks}
          columns={columns}
          getRowId={(row) => row.id}
          enableRowSelection
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRowClick={(row) => setLastClicked(row.id)}
        />
      </div>
    </div>
  );
};

/**
 * With Editing - Inline cell editing for text, number, and boolean types
 */
export const WithEditing: Story = () => {
  const [data, setData] = React.useState(mockTasks);

  const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    console.log('Cell edited:', { rowId, columnId, value });
  };

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
        Click any text/number cell to edit. Checkboxes toggle immediately.
      </div>
      <TypeBrowser
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        onCellEdit={handleCellEdit}
      />
    </div>
  );
};

/**
 * With Editing and Selection - Editing and row selection work together
 */
export const WithEditingAndSelection: Story = () => {
  const [data, setData] = React.useState(mockTasks);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
    setData((prev) => prev.map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    console.log('Cell edited:', { rowId, columnId, value });
  };

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
        Selected: {selectedIds.size} items. Click cells to edit, checkboxes to select.
      </div>
      <TypeBrowser
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        onCellEdit={handleCellEdit}
        enableRowSelection
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />
    </div>
  );
};
