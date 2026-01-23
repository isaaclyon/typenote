import type { RelationOption } from '../../patterns/RelationPicker/RelationPicker.js';

export type DataGridColumnType =
  | 'title'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'ref'
  | 'refs';

export interface ObjectDataGridRowAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode | undefined;
  destructive?: boolean | undefined;
  disabled?: boolean | ((row: T) => boolean) | undefined;
  onClick: (row: T) => void;
}

export interface DataGridColumn<T> {
  key: string;
  header: string;
  type: DataGridColumnType;
  isTitle?: boolean | undefined;
  options?: string[] | undefined;
  allowedTypeKeys?: string[] | undefined;
  onSearch?: ((query: string) => Promise<RelationOption[]>) | undefined;
  onCreate?: ((title: string) => Promise<string>) | undefined;
  width?: number | undefined;
  minWidth?: number | undefined;
  pinned?: 'left' | 'right' | undefined;
  align?: 'left' | 'center' | 'right' | undefined;
  sortable?: boolean | undefined;
  editable?: boolean | undefined;
  render?: ((value: unknown, row: T) => React.ReactNode) | undefined;
  getValue?: ((row: T) => unknown) | undefined;
}

export interface ObjectDataGridProps<T extends { id: string }> {
  data: T[];
  columns: DataGridColumn<T>[];
  selectedIds?: Set<string> | undefined;
  onSelectionChange?: ((ids: Set<string>) => void) | undefined;
  sortColumn?: string | undefined;
  sortDirection?: 'asc' | 'desc' | undefined;
  onSortChange?: ((column: string, direction: 'asc' | 'desc') => void) | undefined;
  onRowOpen?: ((row: T) => void) | undefined;
  onRowDelete?: ((row: T) => void) | undefined;
  rowActions?: ObjectDataGridRowAction<T>[] | undefined;
  onCellChange?: ((rowId: string, columnKey: string, value: unknown) => void) | undefined;
  loading?: boolean | undefined;
  emptyMessage?: string | undefined;
  className?: string | undefined;
}

export interface EditingCell {
  rowId: string;
  columnKey: string;
}
