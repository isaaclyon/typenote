import * as React from 'react';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { DotsThree } from '@phosphor-icons/react/dist/ssr/DotsThree';

import { cn } from '../../lib/utils.js';
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../primitives/Table/Table.js';
import { Spinner } from '../../primitives/Spinner/Spinner.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../primitives/DropdownMenu/DropdownMenu.js';
import {
  DataGridHeaderCheckbox,
  DataGridRowCheckbox,
} from '../../patterns/DataGridSelection/DataGridSelection.js';
import {
  DataGridHeaderCell,
  type DataGridHeaderMenuItem,
} from '../../patterns/DataGridHeaderCell/DataGridHeaderCell.js';
import { ObjectDataGridCell } from './ObjectDataGridCell.js';
import type {
  ObjectDataGridProps,
  EditingCell,
  DataGridColumn,
  ObjectDataGridRowAction,
} from './types.js';

function ObjectDataGrid<T extends { id: string }>({
  data,
  columns,
  selectedIds = new Set(),
  onSelectionChange,
  sortColumn,
  sortDirection = 'asc',
  onSortChange,
  onRowOpen,
  onRowDelete,
  rowActions = [],
  onCellChange,
  loading = false,
  emptyMessage = 'No items found',
  className,
}: ObjectDataGridProps<T>) {
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);

  // Selection state
  const selectionState =
    selectedIds.size === 0 ? 'none' : selectedIds.size === data.length ? 'all' : 'some';

  const handleToggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectionState === 'all') {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((row) => row.id)));
    }
  };

  const handleToggleRow = (rowId: string) => {
    if (!onSelectionChange) return;
    const newSet = new Set(selectedIds);
    if (newSet.has(rowId)) {
      newSet.delete(rowId);
    } else {
      newSet.add(rowId);
    }
    onSelectionChange(newSet);
  };

  // Sorting
  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSortChange(columnKey, newDirection);
  };

  // Cell editing
  const handleStartEdit = (rowId: string, columnKey: string) => {
    setEditingCell({ rowId, columnKey });
  };

  const handleSaveCell = (rowId: string, columnKey: string, value: unknown) => {
    onCellChange?.(rowId, columnKey, value);
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // Get sort state for column
  const getSortState = (columnKey: string): 'none' | 'asc' | 'desc' => {
    if (sortColumn !== columnKey) return 'none';
    return sortDirection;
  };

  // Build header menu items
  const getHeaderMenuItems = (column: DataGridColumn<T>): DataGridHeaderMenuItem[] => {
    const items: DataGridHeaderMenuItem[] = [];
    if (column.sortable !== false && onSortChange) {
      items.push(
        {
          id: 'sort-asc',
          label: 'Sort ascending',
          onClick: () => onSortChange(column.key, 'asc'),
        },
        {
          id: 'sort-desc',
          label: 'Sort descending',
          onClick: () => onSortChange(column.key, 'desc'),
        }
      );
    }
    return items;
  };

  // Get value from row
  const getCellValue = (row: T, column: DataGridColumn<T>): unknown => {
    if (column.getValue) {
      return column.getValue(row);
    }
    return (row as Record<string, unknown>)[column.key];
  };

  // Show selection column?
  const showSelection = Boolean(onSelectionChange);

  // Show actions column?
  const hasRowActions = rowActions.length > 0 || Boolean(onRowDelete);

  // Render row actions dropdown
  const renderRowActions = (row: T) => {
    const allActions: ObjectDataGridRowAction<T>[] = [...rowActions];
    if (onRowDelete) {
      allActions.push({
        id: 'delete',
        label: 'Delete',
        icon: <Trash className="h-4 w-4" />,
        destructive: true,
        onClick: onRowDelete,
      });
    }

    if (allActions.length === 0) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100"
            aria-label="Row actions"
          >
            <DotsThree className="h-4 w-4" weight="bold" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allActions.map((action) => {
            const isDisabled =
              typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;

            return (
              <DropdownMenuItem
                key={action.id}
                onClick={() => action.onClick(row)}
                disabled={isDisabled === true}
                className={cn(action.destructive && 'text-error')}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <TableContainer className={cn('relative', className)}>
      <Table>
        <TableHeader sticky>
          <TableRow>
            {showSelection && (
              <TableHead pinned="left" className="w-10" aria-label="Select">
                <DataGridHeaderCheckbox
                  selection={selectionState}
                  onToggle={handleToggleSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                align={column.align}
                pinned={column.pinned}
                style={{ width: column.width, minWidth: column.minWidth }}
              >
                {column.sortable !== false ? (
                  <DataGridHeaderCell
                    label={column.header}
                    sort={getSortState(column.key)}
                    sortable
                    onSort={() => handleSort(column.key)}
                    menuItems={getHeaderMenuItems(column)}
                  />
                ) : (
                  <DataGridHeaderCell
                    label={column.header}
                    sort="none"
                    sortable={false}
                    menuItems={getHeaderMenuItems(column)}
                  />
                )}
              </TableHead>
            ))}
            {hasRowActions && <TableHead pinned="right" className="w-10" aria-label="Actions" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (showSelection ? 1 : 0) + (hasRowActions ? 1 : 0)}
              >
                <div className="flex items-center justify-center py-8">
                  <Spinner size="md" />
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (showSelection ? 1 : 0) + (hasRowActions ? 1 : 0)}
              >
                <div className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                data-selected={selectedIds.has(row.id) || undefined}
                onDoubleClick={() => onRowOpen?.(row)}
                className={cn(
                  'group',
                  selectedIds.has(row.id) && 'bg-accent-50/50',
                  onRowOpen && 'cursor-pointer hover:bg-muted/30'
                )}
              >
                {showSelection && (
                  <TableCell pinned="left" className="w-10">
                    <DataGridRowCheckbox
                      checked={selectedIds.has(row.id)}
                      onToggle={() => handleToggleRow(row.id)}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <ObjectDataGridCell
                    key={column.key}
                    column={column}
                    row={row}
                    value={getCellValue(row, column)}
                    isEditing={
                      editingCell?.rowId === row.id && editingCell?.columnKey === column.key
                    }
                    onStartEdit={() => handleStartEdit(row.id, column.key)}
                    onSave={(value) => handleSaveCell(row.id, column.key, value)}
                    onCancel={handleCancelEdit}
                  />
                ))}
                {hasRowActions && (
                  <TableCell pinned="right" className="w-10">
                    {renderRowActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

ObjectDataGrid.displayName = 'ObjectDataGrid';

export { ObjectDataGrid };
