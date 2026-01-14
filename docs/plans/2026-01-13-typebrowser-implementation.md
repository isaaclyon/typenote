# TypeBrowser Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Notion-style data table for browsing objects of a single type with sorting, row selection, and inline editing.

**Architecture:** TanStack Table (headless) provides sorting/filtering/selection logic. Custom styled components render the UI using existing design system primitives. PropertyItem's editing patterns are extracted into reusable cell editors.

**Tech Stack:** @tanstack/react-table, @tanstack/react-virtual (Phase 2), existing design-system components (Input, Checkbox, Select, MultiselectDropdown)

**Design Doc:** `docs/plans/2026-01-10-typebrowser-design.md`

---

## Phase 1: Core Table (MVP)

### Task 1.1: Install TanStack Table

**Files:**

- Modify: `packages/design-system/package.json`

**Step 1: Add TanStack Table dependency**

```bash
cd packages/design-system && pnpm add @tanstack/react-table
```

**Step 2: Verify installation**

Run: `pnpm --filter @typenote/design-system exec -- node -e "require('@tanstack/react-table')"`
Expected: No error (module resolves)

**Step 3: Commit**

```bash
git add packages/design-system/package.json pnpm-lock.yaml
git commit -m "chore(design-system): add @tanstack/react-table dependency"
```

---

### Task 1.2: Create TypeBrowser folder structure and types

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/index.ts`
- Create: `packages/design-system/src/components/TypeBrowser/types.ts`

**Step 1: Create types.ts with core interfaces**

```typescript
// packages/design-system/src/components/TypeBrowser/types.ts
import type { ColumnDef } from '@tanstack/react-table';

export type CellType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect';

export interface TypeBrowserColumn<TData> {
  id: string;
  header: string;
  accessorKey: keyof TData;
  type: CellType;
  options?: string[]; // For select/multiselect
  width?: number;
  pinned?: 'left' | 'right';
}

export interface TypeBrowserProps<TData> {
  data: TData[];
  columns: TypeBrowserColumn<TData>[];
  onRowClick?: (row: TData) => void;
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;
  getRowId: (row: TData) => string;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

**Step 2: Create index.ts with placeholder export**

```typescript
// packages/design-system/src/components/TypeBrowser/index.ts
export * from './types.js';
// TypeBrowser component will be added in Task 1.3
```

**Step 3: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/
git commit -m "feat(design-system): add TypeBrowser types and folder structure"
```

---

### Task 1.3: Build basic TypeBrowser component (read-only)

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx`
- Modify: `packages/design-system/src/components/TypeBrowser/index.ts`

**Step 1: Create TypeBrowser.tsx with TanStack Table**

```typescript
// packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx
import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn.js';
import { ScrollArea } from '../ScrollArea/ScrollArea.js';
import { EmptyState } from '../EmptyState/EmptyState.js';
import type { TypeBrowserProps, TypeBrowserColumn } from './types.js';

function TypeBrowser<TData>({
  data,
  columns: columnConfig,
  onRowClick,
  getRowId,
  isLoading = false,
  emptyMessage = 'No items found',
}: TypeBrowserProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Convert our column config to TanStack column definitions
  const columns = React.useMemo(
    () =>
      columnConfig.map((col) => ({
        id: col.id,
        accessorKey: col.accessorKey as string,
        header: col.header,
        size: col.width ?? 150,
        cell: ({ getValue }) => {
          const value = getValue();
          // Simple display for now - editing comes in Task 1.5
          if (col.type === 'boolean') {
            return value ? '✓' : '–';
          }
          if (col.type === 'date' && value) {
            return new Date(value as string).toLocaleDateString();
          }
          if (col.type === 'datetime' && value) {
            return new Date(value as string).toLocaleString();
          }
          if (col.type === 'multiselect' && Array.isArray(value)) {
            return value.join(', ') || '–';
          }
          return value ?? '–';
        },
      })),
    [columnConfig]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <ScrollArea className="h-full">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-50'
                  )}
                  style={{ width: header.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={cn(
                'border-b border-gray-100 transition-colors',
                'hover:bg-gray-50',
                onRowClick && 'cursor-pointer'
              )}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-3 py-2 text-sm text-gray-900"
                  style={{ width: cell.column.getSize() }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

TypeBrowser.displayName = 'TypeBrowser';

export { TypeBrowser };
```

**Step 2: Update index.ts to export component**

```typescript
// packages/design-system/src/components/TypeBrowser/index.ts
export * from './types.js';
export { TypeBrowser } from './TypeBrowser.js';
```

**Step 3: Export from main components index**

In `packages/design-system/src/components/index.ts`, add:

```typescript
export * from './TypeBrowser/index.js';
```

**Step 4: Run typecheck**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/ packages/design-system/src/components/index.ts
git commit -m "feat(design-system): add basic TypeBrowser component with sorting"
```

---

### Task 1.4: Add Ladle stories for TypeBrowser

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx`

**Step 1: Create stories with mock data**

```typescript
// packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx
import type { Story } from '@ladle/react';
import { TypeBrowser } from './TypeBrowser.js';
import type { TypeBrowserColumn } from './types.js';

// Mock data type
interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
  dueDate: string;
  completed: boolean;
}

// Sample data
const mockTasks: Task[] = [
  { id: '1', title: 'Write documentation', status: 'In Progress', priority: 2, dueDate: '2026-01-15', completed: false },
  { id: '2', title: 'Review pull request', status: 'Todo', priority: 1, dueDate: '2026-01-14', completed: false },
  { id: '3', title: 'Fix login bug', status: 'Done', priority: 3, dueDate: '2026-01-10', completed: true },
  { id: '4', title: 'Update dependencies', status: 'Todo', priority: 2, dueDate: '2026-01-20', completed: false },
  { id: '5', title: 'Add unit tests', status: 'In Progress', priority: 1, dueDate: '2026-01-16', completed: false },
];

const columns: TypeBrowserColumn<Task>[] = [
  { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 200 },
  { id: 'status', header: 'Status', accessorKey: 'status', type: 'select', options: ['Todo', 'In Progress', 'Done'], width: 120 },
  { id: 'priority', header: 'Priority', accessorKey: 'priority', type: 'number', width: 80 },
  { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', type: 'date', width: 120 },
  { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 60 },
];

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

export const Empty: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser
      data={[]}
      columns={columns}
      getRowId={(row) => row.id}
      emptyMessage="No tasks found. Create one to get started!"
    />
  </div>
);

export const Loading: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <TypeBrowser
      data={[]}
      columns={columns}
      getRowId={(row) => row.id}
      isLoading
    />
  </div>
);

export const ManyRows: Story = () => {
  const manyTasks = Array.from({ length: 50 }, (_, i) => ({
    id: String(i + 1),
    title: `Task ${i + 1}`,
    status: ['Todo', 'In Progress', 'Done'][i % 3] as string,
    priority: (i % 3) + 1,
    dueDate: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
    completed: i % 4 === 0,
  }));

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <TypeBrowser
        data={manyTasks}
        columns={columns}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

export const Sorting: Story = () => (
  <div className="h-96 border rounded-lg overflow-hidden">
    <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
      Click column headers to sort
    </div>
    <TypeBrowser
      data={mockTasks}
      columns={columns}
      getRowId={(row) => row.id}
    />
  </div>
);
```

**Step 2: Start Ladle and verify stories render**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Stories visible at http://localhost:61000, table renders with mock data

**Step 3: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx
git commit -m "feat(design-system): add TypeBrowser Ladle stories"
```

---

### Task 1.5: Add row selection with checkbox column

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/types.ts`
- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx`
- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx`

**Step 1: Update types.ts to add selection props**

Add to `TypeBrowserProps` interface:

```typescript
export interface TypeBrowserProps<TData> {
  // ... existing props
  enableRowSelection?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}
```

**Step 2: Update TypeBrowser.tsx to support selection**

Add imports:

```typescript
import { getFilteredSelectedRowModel, type RowSelectionState } from '@tanstack/react-table';
import { Checkbox } from '../Checkbox/Checkbox.js';
```

Add selection state and checkbox column:

```typescript
function TypeBrowser<TData>({
  // ... existing props
  enableRowSelection = false,
  selectedIds,
  onSelectionChange,
}: TypeBrowserProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Convert selectedIds Set to TanStack's RowSelectionState
  const rowSelection = React.useMemo(() => {
    if (!selectedIds) return {};
    const selection: RowSelectionState = {};
    selectedIds.forEach((id) => {
      selection[id] = true;
    });
    return selection;
  }, [selectedIds]);

  // Checkbox column definition
  const checkboxColumn = React.useMemo(
    () => ({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()} // Prevent row click
        />
      ),
      size: 40,
    }),
    []
  );

  const columns = React.useMemo(() => {
    const dataCols = columnConfig.map((col) => ({
      // ... existing column mapping
    }));

    return enableRowSelection ? [checkboxColumn, ...dataCols] : dataCols;
  }, [columnConfig, enableRowSelection, checkboxColumn]);

  const table = useReactTable({
    // ... existing config
    state: { sorting, rowSelection },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function'
        ? updater(rowSelection)
        : updater;
      onSelectionChange?.(new Set(Object.keys(newSelection).filter(k => newSelection[k])));
    },
    getFilteredSelectedRowModel: getFilteredSelectedRowModel(),
  });

  // ... rest of component
}
```

**Step 3: Add selection story**

```typescript
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
```

**Step 4: Run typecheck and verify in Ladle**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/
git commit -m "feat(design-system): add row selection to TypeBrowser"
```

---

### Task 1.6: Add inline cell editing

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/cells/TextCell.tsx`
- Create: `packages/design-system/src/components/TypeBrowser/cells/NumberCell.tsx`
- Create: `packages/design-system/src/components/TypeBrowser/cells/BooleanCell.tsx`
- Create: `packages/design-system/src/components/TypeBrowser/cells/index.ts`
- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx`

**Step 1: Create cells/TextCell.tsx**

```typescript
// packages/design-system/src/components/TypeBrowser/cells/TextCell.tsx
import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface TextCellProps {
  value: string;
  onSave: (value: string) => void;
}

export function TextCell({ value, onSave }: TextCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 -my-1"
      />
    );
  }

  return (
    <div
      className={cn(
        'truncate cursor-text px-1 -mx-1 rounded',
        'hover:bg-gray-100'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value || <span className="text-gray-400">–</span>}
    </div>
  );
}
```

**Step 2: Create cells/NumberCell.tsx**

```typescript
// packages/design-system/src/components/TypeBrowser/cells/NumberCell.tsx
import * as React from 'react';
import { cn } from '../../../utils/cn.js';
import { Input } from '../../Input/Input.js';

interface NumberCellProps {
  value: number | null;
  onSave: (value: number) => void;
}

export function NumberCell({ value, onSave }: NumberCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value?.toString() ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const num = parseFloat(editValue);
    if (!isNaN(num) && num !== value) {
      onSave(num);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value?.toString() ?? '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-7 -my-1"
      />
    );
  }

  return (
    <div
      className={cn(
        'truncate cursor-text px-1 -mx-1 rounded',
        'hover:bg-gray-100'
      )}
      onClick={() => setIsEditing(true)}
    >
      {value ?? <span className="text-gray-400">–</span>}
    </div>
  );
}
```

**Step 3: Create cells/BooleanCell.tsx**

```typescript
// packages/design-system/src/components/TypeBrowser/cells/BooleanCell.tsx
import * as React from 'react';
import { Checkbox } from '../../Checkbox/Checkbox.js';

interface BooleanCellProps {
  value: boolean;
  onSave: (value: boolean) => void;
}

export function BooleanCell({ value, onSave }: BooleanCellProps) {
  return (
    <Checkbox
      checked={value}
      onChange={(e) => onSave(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
```

**Step 4: Create cells/index.ts**

```typescript
// packages/design-system/src/components/TypeBrowser/cells/index.ts
export { TextCell } from './TextCell.js';
export { NumberCell } from './NumberCell.js';
export { BooleanCell } from './BooleanCell.js';
```

**Step 5: Update TypeBrowser.tsx to use editable cells**

Replace the cell rendering logic with:

```typescript
import { TextCell, NumberCell, BooleanCell } from './cells/index.js';

// In column mapping:
cell: ({ getValue, row }) => {
  const value = getValue();
  const rowId = row.id;

  if (col.type === 'boolean') {
    return (
      <BooleanCell
        value={value as boolean}
        onSave={(newValue) => onCellEdit?.(rowId, col.id, newValue)}
      />
    );
  }

  if (col.type === 'number') {
    return (
      <NumberCell
        value={value as number | null}
        onSave={(newValue) => onCellEdit?.(rowId, col.id, newValue)}
      />
    );
  }

  if (col.type === 'text') {
    return (
      <TextCell
        value={value as string}
        onSave={(newValue) => onCellEdit?.(rowId, col.id, newValue)}
      />
    );
  }

  // Fallback for types without editors yet
  return value ?? '–';
};
```

**Step 6: Add editing story**

```typescript
export const WithEditing: Story = () => {
  const [data, setData] = React.useState(mockTasks);

  const handleCellEdit = (rowId: string, columnId: string, value: unknown) => {
    setData((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, [columnId]: value } : row
      )
    );
    console.log('Cell edited:', { rowId, columnId, value });
  };

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <div className="p-2 bg-gray-50 text-xs text-gray-600 border-b">
        Click any text/number cell to edit. Changes log to console.
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
```

**Step 7: Run typecheck and verify in Ladle**

Run: `pnpm --filter @typenote/design-system typecheck`
Expected: No errors

**Step 8: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/
git commit -m "feat(design-system): add inline cell editing to TypeBrowser"
```

---

## Phase 1 Complete Checkpoint

At this point you have:

- ✅ TanStack Table integration
- ✅ Basic columns (text, number, boolean)
- ✅ Single-column sorting
- ✅ Row selection with checkboxes
- ✅ Inline cell editing
- ✅ Ladle stories for all states

**Before continuing to Phase 2, verify:**

1. Run `pnpm typecheck` — all packages pass
2. Run `pnpm lint` — no errors
3. All 6 stories render correctly in Ladle

---

## Phase 2: Virtualization & Column Pinning (Optional)

> Only needed if table will have 100+ rows. Can be deferred.

### Task 2.1: Install TanStack Virtual

```bash
cd packages/design-system && pnpm add @tanstack/react-virtual
```

### Task 2.2: Add virtualized row rendering

Use `useVirtualizer` hook in TypeBrowser to virtualize the `<tbody>` rows.

### Task 2.3: Add column pinning

Add `pinnedLeft` support for checkbox + first column to stay visible during horizontal scroll.

---

## Phase 3: Rich Cell Types

### Task 3.1: DateCell component

Similar to TextCell but renders `<Input type="date">`.

### Task 3.2: SelectCell component

Uses existing `Select` component from design-system.

### Task 3.3: MultiselectCell component

Uses existing `MultiselectDropdown` component.

---

## Testing Notes

- **Ladle stories are the primary test** for visual components
- Unit tests optional but recommended for cell editor logic
- Integration tests when TypeBrowser is wired to real IPC data

---

## Files Summary

| File                                  | Purpose               |
| ------------------------------------- | --------------------- |
| `TypeBrowser/types.ts`                | TypeScript interfaces |
| `TypeBrowser/TypeBrowser.tsx`         | Main component        |
| `TypeBrowser/TypeBrowser.stories.tsx` | Ladle stories         |
| `TypeBrowser/cells/TextCell.tsx`      | Text editor cell      |
| `TypeBrowser/cells/NumberCell.tsx`    | Number editor cell    |
| `TypeBrowser/cells/BooleanCell.tsx`   | Checkbox cell         |
| `TypeBrowser/cells/index.ts`          | Cell exports          |
| `TypeBrowser/index.ts`                | Public API exports    |

---

**Last Updated:** 2026-01-13
