import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
  type ColumnPinningState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { cn } from '../../utils/cn.js';
import { EmptyState } from '../EmptyState/index.js';
import { Skeleton } from '../Skeleton/index.js';
import {
  TitleCell,
  TextCell,
  NumberCell,
  BooleanCell,
  DateCell,
  SelectCell,
  MultiselectCell,
} from './cells/index.js';
import { getColumnPinningStyles, buildInitialPinningState } from './pinningStyles.js';
import { ColumnPinMenu } from './ColumnPinMenu.js';
import type { TypeBrowserProps, TypeBrowserColumn, CellType } from './types.js';

// Constants for virtualization
const ROW_HEIGHT = 40;
const OVERSCAN = 5;

/**
 * Format a cell value based on its type
 */
function formatCellValue(value: unknown, type: CellType): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">–</span>;
  }

  switch (type) {
    case 'title':
      // Title type displays same as text in read-only mode
      return String(value);

    case 'boolean':
      return value ? '✓' : '–';

    case 'date':
      if (value instanceof Date) {
        if (!isNaN(value.getTime())) {
          return value.toLocaleDateString();
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      return <span className="text-muted-foreground">–</span>;

    case 'datetime':
      if (value instanceof Date) {
        if (!isNaN(value.getTime())) {
          return value.toLocaleString();
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString();
        }
      }
      return <span className="text-muted-foreground">–</span>;

    case 'multiselect':
      if (Array.isArray(value) && value.length > 0) {
        return value.map(String).join(', ');
      }
      return <span className="text-muted-foreground">–</span>;

    case 'select':
    case 'text':
    case 'number':
    default:
      return String(value);
  }
}

/**
 * Convert TypeBrowserColumn definitions to TanStack Table column definitions
 */
function createColumnDefs<TData extends Record<string, unknown>>(
  columns: TypeBrowserColumn<TData>[],
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void,
  onTitleOpen?: (row: TData) => void
): ColumnDef<TData>[] {
  return columns.map((col) => {
    const columnDef: ColumnDef<TData> = {
      id: col.id,
      accessorKey: col.accessorKey as string,
      header: col.header,
      cell: ({ getValue, row }) => {
        const cellValue = getValue();
        const rowId = row.id;

        // If no onCellEdit, render read-only
        if (!onCellEdit) {
          return formatCellValue(cellValue, col.type);
        }

        // Render editable cell based on type
        switch (col.type) {
          case 'title':
            return (
              <TitleCell
                value={(cellValue as string) ?? ''}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
                onOpen={() => onTitleOpen?.(row.original)}
              />
            );
          case 'text':
            return (
              <TextCell
                value={(cellValue as string) ?? ''}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
              />
            );
          case 'number':
            return (
              <NumberCell
                value={cellValue as number | null}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
              />
            );
          case 'boolean':
            return (
              <BooleanCell
                value={(cellValue as boolean) ?? false}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
              />
            );
          case 'date':
            return (
              <DateCell
                value={(cellValue as string) ?? ''}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
                includeTime={false}
              />
            );
          case 'datetime':
            return (
              <DateCell
                value={(cellValue as string) ?? ''}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
                includeTime={true}
              />
            );
          case 'select':
            return (
              <SelectCell
                value={(cellValue as string) ?? ''}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
                options={col.options ?? []}
              />
            );
          case 'multiselect':
            return (
              <MultiselectCell
                value={(cellValue as string[]) ?? []}
                onSave={(newValue) => onCellEdit(rowId, col.id, newValue)}
                options={col.options ?? []}
              />
            );
          default:
            return formatCellValue(cellValue, col.type);
        }
      },
    };

    // Only set size if width is defined (exactOptionalPropertyTypes compliance)
    if (col.width !== undefined) {
      columnDef.size = col.width;
    }

    return columnDef;
  });
}

/**
 * Loading skeleton for the table
 */
function TableSkeleton({ columnCount }: { columnCount: number }) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex gap-4 px-3 py-2 border-b border-border bg-muted">
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 px-3 py-2.5 border-b border-gray-100">
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * TypeBrowser - A data table component for browsing typed objects
 *
 * Features:
 * - Single-column sorting (click header to toggle asc/desc/none)
 * - Cell rendering based on column type
 * - Loading and empty states
 * - Scrollable with sticky header
 */
function TypeBrowserInner<TData extends Record<string, unknown>>(
  {
    data,
    columns,
    onRowClick,
    onCellEdit,
    onTitleOpen,
    getRowId,
    isLoading = false,
    emptyMessage = 'No items to display',
    enableRowSelection = false,
    selectedIds,
    onSelectionChange,
    onColumnPinningChange,
  }: TypeBrowserProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Convert Set<string> to RowSelectionState object for TanStack Table
  const rowSelection = React.useMemo<RowSelectionState>(() => {
    if (!selectedIds) return {};
    const state: RowSelectionState = {};
    for (const id of selectedIds) {
      state[id] = true;
    }
    return state;
  }, [selectedIds]);

  // Handle row selection changes from TanStack Table
  const handleRowSelectionChange = React.useCallback(
    (updaterOrValue: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      if (!onSelectionChange) return;
      const newState =
        typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
      const newSelectedIds = new Set<string>(Object.keys(newState).filter((key) => newState[key]));
      onSelectionChange(newSelectedIds);
    },
    [onSelectionChange, rowSelection]
  );

  // Build initial pinning state from column definitions
  const initialColumnPinning = React.useMemo(
    () => buildInitialPinningState(columns, enableRowSelection),
    [columns, enableRowSelection]
  );

  // Track column pinning state
  const [columnPinning, setColumnPinning] =
    React.useState<ColumnPinningState>(initialColumnPinning);

  // Handle pinning changes
  const handleColumnPinningChange = React.useCallback(
    (updater: ColumnPinningState | ((old: ColumnPinningState) => ColumnPinningState)) => {
      const newState = typeof updater === 'function' ? updater(columnPinning) : updater;
      setColumnPinning(newState);
      // Convert to required left/right format for external callback
      onColumnPinningChange?.({
        left: newState.left ?? [],
        right: newState.right ?? [],
      });
    },
    [columnPinning, onColumnPinningChange]
  );

  // Create checkbox column for row selection
  const checkboxColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
      id: '_selection',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all rows"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select row ${row.id}`}
        />
      ),
      size: 40,
      enableSorting: false,
    }),
    []
  );

  const columnDefs = React.useMemo(() => {
    const baseCols = createColumnDefs(columns, onCellEdit, onTitleOpen);
    return enableRowSelection ? [checkboxColumn, ...baseCols] : baseCols;
  }, [columns, onCellEdit, onTitleOpen, enableRowSelection, checkboxColumn]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      sorting,
      rowSelection,
      columnPinning,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnPinningChange: handleColumnPinningChange,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

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

  // Create a map of column IDs to original column definitions for pinning info
  // NOTE: This must be BEFORE early returns to satisfy Rules of Hooks
  const columnDefMap = React.useMemo(() => {
    const map = new Map<string, TypeBrowserColumn<TData>>();
    for (const col of columns) {
      map.set(col.id, col);
    }
    return map;
  }, [columns]);

  // Loading state
  if (isLoading) {
    return (
      <div ref={ref} className="w-full h-full">
        <TableSkeleton columnCount={columns.length || 3} />
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center p-8">
        <EmptyState title={emptyMessage} />
      </div>
    );
  }

  // Get virtual items
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div ref={ref} className="w-full h-full flex flex-col">
      <div ref={containerRef} className="flex-1 overflow-auto" style={{ contain: 'strict' }}>
        <table style={{ display: 'grid', minWidth: '100%' }} className="border-collapse">
          <thead style={{ display: 'contents' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border"
                style={{
                  display: 'flex',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const columnDef = columnDefMap.get(header.id);
                  const pinStyles = getColumnPinningStyles(header.column);
                  const isPinned = header.column.getIsPinned();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'group px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                        'bg-muted border-b border-border',
                        canSort && 'cursor-pointer select-none hover:bg-secondary transition-colors'
                      )}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                        minWidth: header.getSize() !== 150 ? header.getSize() : 100,
                        flex: header.getSize() === 150 ? '1 1 0%' : `0 0 ${header.getSize()}px`,
                        ...pinStyles,
                        // Pinned headers need higher z-index
                        zIndex: isPinned ? 11 : undefined,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDirection && (
                          <span className="text-muted-foreground">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                        {header.id !== '_selection' && columnDef?.allowPinning !== false && (
                          <ColumnPinMenu
                            column={header.column}
                            isPermanentlyPinned={
                              header.id === '_selection' || columnDef?.pinned !== undefined
                            }
                          />
                        )}
                      </div>
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
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;

              return (
                <tr
                  key={row.id}
                  data-index={virtualRow.index}
                  data-testid={`type-browser-row-${row.id}`}
                  ref={(node) => rowVirtualizer.measureElement(node)}
                  className={cn(
                    'border-b border-gray-100 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted'
                  )}
                  style={{
                    display: 'flex',
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                    width: '100%',
                    height: `${ROW_HEIGHT}px`,
                  }}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const pinStyles = getColumnPinningStyles(cell.column);

                    return (
                      <td
                        key={cell.id}
                        className="px-3 py-2.5 text-sm text-foreground"
                        style={{
                          width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                          minWidth: cell.column.getSize() !== 150 ? cell.column.getSize() : 100,
                          flex:
                            cell.column.getSize() === 150
                              ? '1 1 0%'
                              : `0 0 ${cell.column.getSize()}px`,
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
}

// Create a properly typed forwardRef component
const TypeBrowser = React.forwardRef(TypeBrowserInner) as <TData extends Record<string, unknown>>(
  props: TypeBrowserProps<TData> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

// Set display name for devtools
(TypeBrowser as React.FC).displayName = 'TypeBrowser';

export { TypeBrowser };
