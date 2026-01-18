# TypeBrowser Phase 2: Virtualization & Column Pinning — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add row virtualization and sticky column pinning to TypeBrowser for handling 10,000+ rows and wide tables.

**Architecture:** Use @tanstack/react-virtual for row virtualization with CSS Grid layout (keeping semantic table elements). Column pinning uses TanStack Table's built-in state with CSS `position: sticky`. The checkbox column is always pinned left; other columns can be pinned via dropdown menu.

**Tech Stack:** @tanstack/react-virtual, @tanstack/react-table (existing), Floating UI (existing), Tailwind CSS

**Design Doc:** `docs/plans/2026-01-13-typebrowser-phase2-design.md`

---

## Task 1: Add @tanstack/react-virtual Dependency

**Files:**

- Modify: `packages/design-system/package.json`

**Step 1: Install the dependency**

```bash
pnpm --filter @typenote/design-system add @tanstack/react-virtual
```

**Step 2: Verify installation**

```bash
cat packages/design-system/package.json | grep react-virtual
```

Expected: `"@tanstack/react-virtual": "^3.x.x"`

**Step 3: Commit**

```bash
git add packages/design-system/package.json pnpm-lock.yaml
git commit -m "chore(design-system): add @tanstack/react-virtual dependency"
```

---

## Task 2: Add Column Pinning Types

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/types.ts`

**Step 1: Update TypeBrowserColumn interface**

Add `allowPinning` property to the existing interface:

```typescript
// In types.ts, update TypeBrowserColumn interface

/** Column configuration for TypeBrowser */
export interface TypeBrowserColumn<TData extends Record<string, unknown>> {
  /** Unique column identifier */
  id: string;
  /** Column header text */
  header: string;
  /** Key to access row data */
  accessorKey: keyof TData;
  /** Cell type determines rendering and editing behavior */
  type: CellType;
  /** Options for select/multiselect types */
  options?: string[];
  /** Column width in pixels */
  width?: number;
  /** Pin column permanently to left or right edge (cannot be unpinned by user) */
  pinned?: 'left' | 'right';
  /** Allow user to dynamically pin/unpin this column via header menu (default: true) */
  allowPinning?: boolean;
}
```

**Step 2: Update TypeBrowserProps interface**

Add `onColumnPinningChange` callback:

```typescript
// In types.ts, update TypeBrowserProps interface

/** Props for TypeBrowser data table component */
export interface TypeBrowserProps<TData extends Record<string, unknown>> {
  /** Array of data rows to display */
  data: TData[];
  /** Column definitions */
  columns: TypeBrowserColumn<TData>[];
  /** Callback when a row is clicked */
  onRowClick?: (row: TData) => void;
  /** Callback when a cell value is edited */
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;
  /** Function to extract unique ID from each row */
  getRowId: (row: TData) => string;
  /** Show loading state */
  isLoading?: boolean;
  /** Message to display when data is empty */
  emptyMessage?: string;
  /** Enable row selection with checkboxes */
  enableRowSelection?: boolean;
  /** Currently selected row IDs */
  selectedIds?: Set<string>;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: Set<string>) => void;
  /** Callback when column pinning changes (for persistence) */
  onColumnPinningChange?: (pinning: { left: string[]; right: string[] }) => void;
}

/** Column pinning state */
export interface ColumnPinningState {
  left: string[];
  right: string[];
}
```

**Step 3: Run typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 4: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/types.ts
git commit -m "feat(design-system): add column pinning types to TypeBrowser"
```

---

## Task 3: Create Column Pinning Styles Utility

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/pinningStyles.ts`

**Step 1: Create the utility file**

```typescript
// pinningStyles.ts
import type { Column } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

/**
 * Generate CSS styles for a column based on its pinning state.
 * Pinned columns use position: sticky with calculated left/right offsets.
 */
export function getColumnPinningStyles<TData>(column: Column<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return {};
  }

  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    position: 'sticky',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: 1,
    backgroundColor: 'white',
    // Visual separator shadow on the edge of pinned group
    boxShadow: isLastLeftPinned
      ? '-4px 0 4px -4px rgba(0,0,0,0.1) inset'
      : isFirstRightPinned
        ? '4px 0 4px -4px rgba(0,0,0,0.1) inset'
        : undefined,
  };
}

/**
 * Build initial column pinning state from column definitions.
 */
export function buildInitialPinningState<TData extends Record<string, unknown>>(
  columns: Array<{ id: string; pinned?: 'left' | 'right' }>,
  enableRowSelection: boolean
): { left: string[]; right: string[] } {
  const left: string[] = [];
  const right: string[] = [];

  // Selection checkbox is always pinned left when enabled
  if (enableRowSelection) {
    left.push('_selection');
  }

  for (const col of columns) {
    if (col.pinned === 'left') {
      left.push(col.id);
    } else if (col.pinned === 'right') {
      right.push(col.id);
    }
  }

  return { left, right };
}
```

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/pinningStyles.ts
git commit -m "feat(design-system): add column pinning styles utility"
```

---

## Task 4: Create ColumnPinMenu Component

**Files:**

- Create: `packages/design-system/src/components/TypeBrowser/ColumnPinMenu.tsx`

**Step 1: Create the dropdown menu component**

```typescript
// ColumnPinMenu.tsx
import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  offset,
  flip,
  FloatingPortal,
} from '@floating-ui/react';
import { Pin, PinOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface ColumnPinMenuProps {
  /** The column to control pinning for */
  column: Column<unknown, unknown>;
  /** Whether this column is permanently pinned (cannot be changed by user) */
  isPermanentlyPinned: boolean;
}

/**
 * Dropdown menu for pinning/unpinning a column.
 * Shows pin icon that reveals menu on click.
 */
export function ColumnPinMenu({ column, isPermanentlyPinned }: ColumnPinMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const isPinned = column.getIsPinned();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handlePin = (direction: 'left' | 'right' | false) => {
    column.pin(direction);
    setIsOpen(false);
  };

  // Don't show menu for permanently pinned columns
  if (isPermanentlyPinned) {
    return (
      <span className="text-gray-400" title="This column is always pinned">
        <Pin className="w-3 h-3" />
      </span>
    );
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={cn(
          'p-0.5 rounded transition-colors',
          'opacity-0 group-hover:opacity-100',
          isPinned && 'opacity-100 text-accent-600',
          !isPinned && 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          isOpen && 'opacity-100 bg-gray-100'
        )}
        {...getReferenceProps()}
        title={isPinned ? `Pinned ${isPinned}` : 'Pin column'}
      >
        {isPinned ? <Pin className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
          >
            <button
              type="button"
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                'hover:bg-gray-50 transition-colors',
                isPinned === 'left' && 'text-accent-600 bg-accent-50'
              )}
              onClick={() => handlePin('left')}
            >
              <Pin className="w-3.5 h-3.5" />
              Pin Left
            </button>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                'hover:bg-gray-50 transition-colors',
                isPinned === 'right' && 'text-accent-600 bg-accent-50'
              )}
              onClick={() => handlePin('right')}
            >
              <Pin className="w-3.5 h-3.5 rotate-180" />
              Pin Right
            </button>
            {isPinned && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-600"
                  onClick={() => handlePin(false)}
                >
                  <PinOff className="w-3.5 h-3.5" />
                  Unpin
                </button>
              </>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

ColumnPinMenu.displayName = 'ColumnPinMenu';
```

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/ColumnPinMenu.tsx
git commit -m "feat(design-system): add ColumnPinMenu component for dynamic pinning"
```

---

## Task 5: Refactor TypeBrowser to CSS Grid Layout

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx`

This task refactors the table to use CSS Grid while keeping semantic elements. We'll do this in stages.

**Step 1: Add imports and constants**

At the top of TypeBrowser.tsx, add:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';
import { getColumnPinningStyles, buildInitialPinningState } from './pinningStyles.js';
import { ColumnPinMenu } from './ColumnPinMenu.js';
import type { ColumnPinningState } from '@tanstack/react-table';

// Constants for virtualization
const ROW_HEIGHT = 40;
const OVERSCAN = 5;
```

**Step 2: Update useReactTable configuration**

Inside `TypeBrowserInner`, update the table initialization to include column pinning:

```typescript
// Build initial pinning state from column definitions
const initialColumnPinning = React.useMemo(
  () => buildInitialPinningState(columns, enableRowSelection),
  [columns, enableRowSelection]
);

// Track column pinning state
const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>(initialColumnPinning);

// Handle pinning changes
const handleColumnPinningChange = React.useCallback(
  (updater: ColumnPinningState | ((old: ColumnPinningState) => ColumnPinningState)) => {
    const newState = typeof updater === 'function' ? updater(columnPinning) : updater;
    setColumnPinning(newState);
    onColumnPinningChange?.(newState);
  },
  [columnPinning, onColumnPinningChange]
);

const table = useReactTable({
  data,
  columns: columnDefs,
  state: {
    sorting,
    rowSelection,
    columnPinning, // Add this
  },
  onSortingChange: setSorting,
  onRowSelectionChange: handleRowSelectionChange,
  onColumnPinningChange: handleColumnPinningChange, // Add this
  enableRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getRowId,
});
```

**Step 3: Add virtualizer**

After the table initialization, add:

```typescript
// Container ref for virtualization
const containerRef = React.useRef<HTMLDivElement>(null);

// Get rows for virtualization
const { rows } = table.getRowModel();

// Row virtualizer
const rowVirtualizer = useVirtualizer({
  count: rows.length,
  estimateSize: () => ROW_HEIGHT,
  getScrollElement: () => containerRef.current,
  overscan: OVERSCAN,
});
```

**Step 4: Update the JSX structure**

Replace the return statement's JSX with the new grid-based layout. This is the key refactor.

The full refactored component is large, so here's the structure:

```typescript
return (
  <div ref={ref} className="w-full h-full flex flex-col">
    <div
      ref={containerRef}
      className="flex-1 overflow-auto"
      style={{ contain: 'strict' }}
    >
      <table
        style={{ display: 'grid', minWidth: '100%' }}
        className="border-collapse"
      >
        <thead style={{ display: 'contents' }}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              style={{ display: 'flex', width: '100%' }}
              className="sticky top-0 z-20 bg-gray-50 border-b border-gray-200"
            >
              {headerGroup.headers.map((header) => {
                const pinStyles = getColumnPinningStyles(header.column);
                const columnDef = columns.find((c) => c.id === header.id);
                const isPermanentlyPinned =
                  header.id === '_selection' ||
                  (columnDef?.pinned !== undefined);
                const allowPinning = columnDef?.allowPinning !== false;

                return (
                  <th
                    key={header.id}
                    className={cn(
                      'group px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      'bg-gray-50 flex items-center gap-1',
                      header.column.getCanSort() && 'cursor-pointer hover:bg-gray-100 transition-colors'
                    )}
                    style={{
                      width: header.getSize(),
                      flexShrink: 0,
                      ...pinStyles,
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                    {header.column.getIsSorted() && (
                      <span className="text-gray-400">
                        {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                    {/* Pin menu for non-selection columns */}
                    {header.id !== '_selection' && allowPinning && (
                      <ColumnPinMenu
                        column={header.column}
                        isPermanentlyPinned={isPermanentlyPinned}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody
          style={{
            display: 'grid',
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;

            return (
              <tr
                key={row.id}
                data-index={virtualRow.index}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  transform: `translateY(${virtualRow.start}px)`,
                  width: '100%',
                }}
                className={cn(
                  'border-b border-gray-100 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => {
                  const pinStyles = getColumnPinningStyles(cell.column);

                  return (
                    <td
                      key={cell.id}
                      className="px-3 py-2.5 text-sm text-gray-900"
                      style={{
                        width: cell.column.getSize(),
                        flexShrink: 0,
                        ...pinStyles,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
```

**Step 5: Remove ScrollArea import**

Remove the `ScrollArea` import since we're now using native overflow scrolling:

```typescript
// Remove this line:
// import { ScrollArea } from '../ScrollArea/index.js';
```

**Step 6: Run typecheck and fix any issues**

```bash
pnpm typecheck
```

Fix any type errors that arise.

**Step 7: Run Ladle to verify visually**

```bash
pnpm --filter @typenote/design-system sandbox
```

Open http://localhost:61000 and verify existing stories still work.

**Step 8: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx
git commit -m "feat(design-system): refactor TypeBrowser to CSS Grid with virtualization"
```

---

## Task 6: Update Exports

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/index.ts`

**Step 1: Add new exports**

```typescript
export * from './types.js';
export { TypeBrowser } from './TypeBrowser.js';
export { ColumnPinMenu } from './ColumnPinMenu.js';
export { getColumnPinningStyles, buildInitialPinningState } from './pinningStyles.js';
```

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

**Step 3: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/index.ts
git commit -m "feat(design-system): export column pinning utilities from TypeBrowser"
```

---

## Task 7: Add Virtualization Stories

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx`

**Step 1: Add VirtualizedManyRows story**

```typescript
/**
 * Virtualized Many Rows - 1,000 rows for smooth scrolling demo
 */
export const VirtualizedManyRows: Story = () => {
  const manyTasks = React.useMemo(() => generateManyTasks(1000), []);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
        <strong>Virtualization Demo:</strong> This table has 1,000 rows but only renders
        ~20 visible rows at a time. Scroll to see smooth performance.
      </div>
      <div className="h-[500px] border rounded-lg overflow-hidden">
        <TypeBrowser
          data={manyTasks}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => console.log('Clicked:', row)}
        />
      </div>
    </div>
  );
};
```

**Step 2: Add VirtualizedHugeDataset story**

```typescript
/**
 * Virtualized Huge Dataset - 10,000 rows stress test
 */
export const VirtualizedHugeDataset: Story = () => {
  const hugeTasks = React.useMemo(() => generateManyTasks(10000), []);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-800">
        <strong>Stress Test:</strong> This table has 10,000 rows. Virtualization keeps
        it smooth by only rendering visible rows. Check the scrollbar for scale.
      </div>
      <div className="h-[500px] border rounded-lg overflow-hidden">
        <TypeBrowser
          data={hugeTasks}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(row) => console.log('Clicked:', row)}
        />
      </div>
    </div>
  );
};
```

**Step 3: Verify in Ladle**

```bash
pnpm --filter @typenote/design-system sandbox
```

Open http://localhost:61000 and test scrolling in both new stories.

**Step 4: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx
git commit -m "feat(design-system): add virtualization stories to TypeBrowser"
```

---

## Task 8: Add Column Pinning Stories

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx`

**Step 1: Add ColumnPinning story**

```typescript
/**
 * Column Pinning - Title column pinned to left
 */
export const ColumnPinning: Story = () => {
  const pinnedColumns: TypeBrowserColumn<Task>[] = [
    { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 200, pinned: 'left' },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'select', options: ['Todo', 'In Progress', 'Done'], width: 120 },
    { id: 'priority', header: 'Priority', accessorKey: 'priority', type: 'number', width: 80 },
    { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', type: 'date', width: 120 },
    { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 60 },
    { id: 'tags', header: 'Tags', accessorKey: 'tags', type: 'multiselect', width: 150 },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Column Pinning:</strong> The Title column is pinned to the left.
        Scroll horizontally to see it stay fixed while other columns scroll.
      </div>
      <div className="h-96 border rounded-lg overflow-hidden max-w-xl">
        <TypeBrowser
          data={mockTasks}
          columns={pinnedColumns}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
};
```

**Step 2: Add ColumnPinningWithSelection story**

```typescript
/**
 * Column Pinning with Selection - Both checkbox and title pinned left
 */
export const ColumnPinningWithSelection: Story = () => {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set(['2']));

  const pinnedColumns: TypeBrowserColumn<Task>[] = [
    { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 200, pinned: 'left' },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'select', options: ['Todo', 'In Progress', 'Done'], width: 120 },
    { id: 'priority', header: 'Priority', accessorKey: 'priority', type: 'number', width: 80 },
    { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', type: 'date', width: 120 },
    { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 60 },
    { id: 'tags', header: 'Tags', accessorKey: 'tags', type: 'multiselect', width: 150 },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Selection + Pinning:</strong> Both the checkbox column and Title are
        pinned left. Selected: {selectedIds.size} items.
      </div>
      <div className="h-96 border rounded-lg overflow-hidden max-w-xl">
        <TypeBrowser
          data={mockTasks}
          columns={pinnedColumns}
          getRowId={(row) => row.id}
          enableRowSelection
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
};
```

**Step 3: Add DynamicColumnPinning story**

```typescript
/**
 * Dynamic Column Pinning - Interactive pin/unpin via header menu
 */
export const DynamicColumnPinning: Story = () => {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <strong>Dynamic Pinning:</strong> Hover over any column header to see the pin icon.
        Click it to pin the column left or right. Currently pinned columns show a highlighted pin.
      </div>
      <div className="h-96 border rounded-lg overflow-hidden max-w-2xl">
        <TypeBrowser
          data={mockTasks}
          columns={columns}
          getRowId={(row) => row.id}
          onColumnPinningChange={(pinning) => console.log('Pinning changed:', pinning)}
        />
      </div>
    </div>
  );
};
```

**Step 4: Verify in Ladle**

```bash
pnpm --filter @typenote/design-system sandbox
```

Test horizontal scrolling and pinning behavior.

**Step 5: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx
git commit -m "feat(design-system): add column pinning stories to TypeBrowser"
```

---

## Task 9: Add Combined Virtualization + Pinning Story

**Files:**

- Modify: `packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx`

**Step 1: Add VirtualizedWithColumnPinning story**

```typescript
/**
 * Virtualized with Column Pinning - 1,000 rows + pinned columns
 */
export const VirtualizedWithColumnPinning: Story = () => {
  const manyTasks = React.useMemo(() => generateManyTasks(1000), []);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const pinnedColumns: TypeBrowserColumn<Task>[] = [
    { id: 'title', header: 'Title', accessorKey: 'title', type: 'text', width: 200, pinned: 'left' },
    { id: 'status', header: 'Status', accessorKey: 'status', type: 'select', options: ['Todo', 'In Progress', 'Done'], width: 120 },
    { id: 'priority', header: 'Priority', accessorKey: 'priority', type: 'number', width: 80 },
    { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', type: 'date', width: 120 },
    { id: 'completed', header: 'Done', accessorKey: 'completed', type: 'boolean', width: 60 },
    { id: 'tags', header: 'Tags', accessorKey: 'tags', type: 'multiselect', width: 180 },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
        <strong>Full Power:</strong> 1,000 virtualized rows with checkbox + title pinned left.
        Both vertical and horizontal scrolling work smoothly. Selected: {selectedIds.size}
      </div>
      <div className="h-[500px] border rounded-lg overflow-hidden max-w-2xl">
        <TypeBrowser
          data={manyTasks}
          columns={pinnedColumns}
          getRowId={(row) => row.id}
          enableRowSelection
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>
    </div>
  );
};
```

**Step 2: Add HorizontalScroll story**

```typescript
/**
 * Horizontal Scroll - Wide table with many columns
 */
export const HorizontalScroll: Story = () => {
  interface WideRow {
    [key: string]: unknown;
    id: string;
    name: string;
    col1: string;
    col2: number;
    col3: boolean;
    col4: string;
    col5: string;
    col6: number;
    col7: string;
    col8: boolean;
  }

  const wideData: WideRow[] = Array.from({ length: 20 }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `Item ${i + 1}`,
    col1: `Value A${i}`,
    col2: i * 10,
    col3: i % 2 === 0,
    col4: `Value B${i}`,
    col5: `Value C${i}`,
    col6: i * 100,
    col7: `Value D${i}`,
    col8: i % 3 === 0,
  }));

  const wideColumns: TypeBrowserColumn<WideRow>[] = [
    { id: 'name', header: 'Name', accessorKey: 'name', type: 'text', width: 150, pinned: 'left' },
    { id: 'col1', header: 'Column 1', accessorKey: 'col1', type: 'text', width: 120 },
    { id: 'col2', header: 'Column 2', accessorKey: 'col2', type: 'number', width: 100 },
    { id: 'col3', header: 'Column 3', accessorKey: 'col3', type: 'boolean', width: 80 },
    { id: 'col4', header: 'Column 4', accessorKey: 'col4', type: 'text', width: 120 },
    { id: 'col5', header: 'Column 5', accessorKey: 'col5', type: 'text', width: 120 },
    { id: 'col6', header: 'Column 6', accessorKey: 'col6', type: 'number', width: 100 },
    { id: 'col7', header: 'Column 7', accessorKey: 'col7', type: 'text', width: 120 },
    { id: 'col8', header: 'Column 8', accessorKey: 'col8', type: 'boolean', width: 80 },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
        <strong>Wide Table:</strong> 9 columns with Name pinned left. Scroll horizontally
        to see the pinned column stay fixed. The shadow indicates the pin boundary.
      </div>
      <div className="h-96 border rounded-lg overflow-hidden max-w-2xl">
        <TypeBrowser
          data={wideData}
          columns={wideColumns}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
};
```

**Step 3: Verify in Ladle**

```bash
pnpm --filter @typenote/design-system sandbox
```

Test all new stories work correctly.

**Step 4: Commit**

```bash
git add packages/design-system/src/components/TypeBrowser/TypeBrowser.stories.tsx
git commit -m "feat(design-system): add combined virtualization + pinning stories"
```

---

## Task 10: Final Verification and Cleanup

**Step 1: Run full test suite**

```bash
pnpm test
```

All tests should pass.

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

No errors.

**Step 3: Run lint**

```bash
pnpm lint
```

No errors or warnings.

**Step 4: Manual verification in Ladle**

```bash
pnpm --filter @typenote/design-system sandbox
```

Verify:

- [ ] Default story still works
- [ ] VirtualizedManyRows scrolls smoothly (1,000 rows)
- [ ] VirtualizedHugeDataset handles 10,000 rows
- [ ] ColumnPinning shows sticky behavior
- [ ] DynamicColumnPinning pin menu works
- [ ] VirtualizedWithColumnPinning combines both features
- [ ] HorizontalScroll shows shadow separator

**Step 5: Final commit with all changes**

```bash
git status
```

If there are any uncommitted changes, add and commit them.

**Step 6: Update up_next.md**

Mark TypeBrowser Phase 2 as complete in `claude-docs/up_next.md`.

---

## Summary

This plan implements:

1. **Row virtualization** using @tanstack/react-virtual — renders only visible rows for 10,000+ row performance
2. **Sticky column pinning** — CSS `position: sticky` with TanStack Table's pinning state
3. **Dynamic pin/unpin UI** — Dropdown menu on column headers
4. **7 new Ladle stories** — Comprehensive coverage of new features

Total: 10 tasks, ~60 steps
