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
