import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { Checkbox } from '../Checkbox/Checkbox.js';
import { cn } from '../../utils/cn.js';
import { ScrollArea } from '../ScrollArea/index.js';
import { EmptyState } from '../EmptyState/index.js';
import { Skeleton } from '../Skeleton/index.js';
import { TextCell, NumberCell, BooleanCell } from './cells/index.js';
import type { TypeBrowserProps, TypeBrowserColumn, CellType } from './types.js';

/**
 * Format a cell value based on its type
 */
function formatCellValue(value: unknown, type: CellType): React.ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">–</span>;
  }

  switch (type) {
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
      return <span className="text-gray-400">–</span>;

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
      return <span className="text-gray-400">–</span>;

    case 'multiselect':
      if (Array.isArray(value) && value.length > 0) {
        return value.map(String).join(', ');
      }
      return <span className="text-gray-400">–</span>;

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
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void
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
          case 'text':
          case 'select': // select renders as text for now
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
          default:
            // Other types (date, datetime, multiselect) are read-only for now
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
      <div className="flex gap-4 px-3 py-2 border-b border-gray-200 bg-gray-50">
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
    getRowId,
    isLoading = false,
    emptyMessage = 'No items to display',
    enableRowSelection = false,
    selectedIds,
    onSelectionChange,
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
    const baseCols = createColumnDefs(columns, onCellEdit);
    return enableRowSelection ? [checkboxColumn, ...baseCols] : baseCols;
  }, [columns, onCellEdit, enableRowSelection, checkboxColumn]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: handleRowSelectionChange,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

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

  return (
    <div ref={ref} className="w-full h-full flex flex-col">
      <ScrollArea className="flex-1">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => {
                  const sortDirection = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        'bg-gray-50 border-b border-gray-200',
                        canSort && 'cursor-pointer select-none hover:bg-gray-100 transition-colors'
                      )}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDirection && (
                          <span className="text-gray-400">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-gray-100 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2.5 text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
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
