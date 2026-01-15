/** Supported cell editor types for TypeBrowser columns */
export type CellType =
  | 'title'
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect';

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
  /** Callback when the "Open" button is clicked in a title cell */
  onTitleOpen?: (row: TData) => void;
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
