# ObjectDataGrid Design

Status: Approved
Created: 2026-01-21

## Overview

ObjectDataGrid is a feature component for displaying and editing objects in a spreadsheet-like interface. It supports inline cell editing, row selection, sorting, and navigation.

## Use Cases

1. **Object list view** — Display all objects of a type (Pages, People, etc.) with editable properties
2. **Search results** — Show search results with relevance and metadata

## Design Decisions

| Decision      | Choice             | Rationale                                                           |
| ------------- | ------------------ | ------------------------------------------------------------------- |
| Column config | Props array        | Dynamic columns per object type; easier to persist user preferences |
| Row click     | Cell editing       | Click enters edit mode; title column has separate "open" button     |
| Selection     | Checkbox only      | Clean separation from cell editing                                  |
| Editing scope | All property types | Full spreadsheet-like experience                                    |
| Date library  | react-day-picker   | Headless, small footprint, handles edge cases                       |

## Build Order

Components must be built in this order (dependencies flow upward):

```
┌──────────────────────────────────────────────────────────────────┐
│                      ObjectDataGrid (feature)                     │
├──────────────────────────────────────────────────────────────────┤
│                        Cell Editors (patterns)                    │
│  DatePicker, RelationPicker, (existing: Select, Input, Checkbox) │
├──────────────────────────────────────────────────────────────────┤
│                   Supporting Patterns (new)                       │
│  Calendar, DismissibleTag                                         │
├──────────────────────────────────────────────────────────────────┤
│                   Primitives (new)                                │
│  Popover                                                          │
├──────────────────────────────────────────────────────────────────┤
│                   Existing (reuse)                                │
│  Table, Input, Select, Checkbox, Badge, SearchInput, etc.         │
└──────────────────────────────────────────────────────────────────┘
```

**Build sequence:**

1. Popover primitive
2. Calendar pattern
3. DatePicker pattern
4. DismissibleTag pattern
5. RelationPicker pattern
6. ObjectDataGrid feature

## Component Specifications

### 1. Popover Primitive

**Location:** `primitives/Popover/`

**Purpose:** Positioned floating content anchored to a trigger element.

**Implementation:** Radix `@radix-ui/react-popover`

```typescript
interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode; // Trigger
  content: React.ReactNode; // Floating content
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}
```

**Behaviors:**

- Closes on outside click
- Closes on Escape
- Focus traps inside when open
- Positions intelligently (flips if near viewport edge)

---

### 2. Calendar Pattern

**Location:** `patterns/Calendar/`

**Purpose:** Month grid for date selection.

**Implementation:** Wraps `react-day-picker` with TypeNote styling.

```typescript
interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  showTime?: boolean;
  timeValue?: { hour: number; minute: number };
  onTimeChange?: (time: { hour: number; minute: number }) => void;
}
```

**Visual structure:**

```
┌─────────────────────────────────┐
│  ←   January 2026   →          │
├─────────────────────────────────┤
│ Su  Mo  Tu  We  Th  Fr  Sa     │
│     [1]  2   3   4   5   6     │
│  7   8   9  10  11  12  13     │
│ ...                            │
├─────────────────────────────────┤
│  Time: [10] : [30]  AM ▼       │  ← Only if showTime
└─────────────────────────────────┘
```

**Behaviors:**

- Arrow keys navigate days
- Enter selects current day
- Today is subtly highlighted
- Selected day has accent background

---

### 3. DatePicker Pattern

**Location:** `patterns/DatePicker/`

**Purpose:** Text input + calendar popover for date/datetime selection.

```typescript
interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  mode?: 'date' | 'datetime';
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}
```

**Visual structure:**

```
┌──────────────────────────────────┐
│  Jan 15, 2026          📅       │
└──────────────────────────────────┘
         │
         ▼ (popover)
┌──────────────────────────────────┐
│      [Calendar component]        │
└──────────────────────────────────┘
```

**Behaviors:**

- Typing parses natural dates ("Jan 15", "2026-01-15")
- Calendar icon opens popover
- Selecting date closes popover
- Escape closes without saving
- Tab commits value

---

### 4. DismissibleTag Pattern

**Location:** `patterns/DismissibleTag/`

**Purpose:** Chip with remove button for multi-relation cells.

```typescript
interface DismissibleTagProps {
  label: string;
  onRemove?: () => void;
  disabled?: boolean;
  color?: string;
  variant?: 'solid' | 'outline';
  size?: 'sm' | 'md';
}
```

**Visual structure:**

```
┌─────────────────────┐
│  Page Title    ✕    │
└─────────────────────┘
```

**Behaviors:**

- Click X calls onRemove
- Keyboard: Backspace/Delete removes when focused
- Truncates long labels with ellipsis

---

### 5. RelationPicker Pattern

**Location:** `patterns/RelationPicker/`

**Purpose:** Search popover for selecting object references.

```typescript
interface RelationPickerProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  allowedTypeKeys?: string[];
  excludeIds?: string[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  onSearch: (query: string) => Promise<RelationOption[]>;
  onCreate?: (title: string) => Promise<string>;
}

interface RelationOption {
  id: string;
  title: string;
  typeKey: string;
  typeName: string;
  icon?: string;
}
```

**Visual structure:**

```
┌─────────────────────────────────────┐
│  🔍 Search objects...               │
├─────────────────────────────────────┤
│  Recent                             │
│  │ 📄 Project Roadmap       Page   │
│  │ 👤 John Smith           Person  │
│  + Create "New title"               │
└─────────────────────────────────────┘
```

**Behaviors:**

- Search filters objects by title
- Keyboard navigation (arrows, Enter)
- Multiple mode: toggle checkmarks, stay open
- Single mode: select and close
- "Create" option when no match

**Composition:**

- Popover for positioning
- SearchInput for search field
- CommandPaletteItem for results

---

### 6. ObjectDataGrid Feature

**Location:** `features/ObjectDataGrid/`

**Purpose:** Main data grid for displaying and editing objects.

```typescript
interface ObjectDataGridProps<T extends object> {
  data: T[];
  columns: DataGridColumn<T>[];
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  onRowOpen?: (row: T) => void;
  onRowDelete?: (row: T) => void;
  rowActions?: DataGridRowAction<T>[];
  onCellChange?: (rowId: string, columnKey: string, value: unknown) => void;
  loading?: boolean;
  emptyMessage?: string;
}

interface DataGridColumn<T> {
  key: string;
  header: string;
  type:
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
  isTitle?: boolean;
  options?: string[];
  allowedTypeKeys?: string[];
  onSearch?: (query: string) => Promise<RelationOption[]>;
  onCreate?: (title: string) => Promise<string>;
  width?: number;
  minWidth?: number;
  pinned?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  editable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}
```

**Visual structure:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ ☐ │ Title              ▲ │ Type    │ Created     │ Status  │  ⋮   │
├───┼─────────────────────────┼─────────┼─────────────┼─────────┼──────┤
│ ☐ │ Project Roadmap   [→] │ Page    │ Jan 15, 2026│ Active ▼│ ⋮    │
│ ☐ │ Meeting Notes          │ Page    │ Jan 14, 2026│ Draft   │ ⋮    │
│ ☑ │ John Smith             │ Person  │ Jan 10, 2026│   —     │ ⋮    │
└───┴─────────────────────────┴─────────┴─────────────┴─────────┴──────┘
```

**Behaviors:**

- Title column: "open" icon on hover for navigation
- Cell click: enters edit mode (appropriate editor per type)
- Checkbox column: toggles row selection
- Header click: toggles sort
- Row actions (⋮): context menu
- Keyboard: Tab between cells, Enter commits, Escape cancels

**Internal state:**

- `editingCell: { rowId: string, columnKey: string } | null`

**File structure:**

```
features/ObjectDataGrid/
├── ObjectDataGrid.tsx        # Main component
├── ObjectDataGridCell.tsx    # Cell wrapper with edit mode
├── ObjectDataGridRow.tsx     # Row component
├── useObjectDataGridState.ts # Editing state hook
├── types.ts                  # TypeScript interfaces
├── ObjectDataGrid.stories.tsx
└── index.ts
```

---

## Dependencies

**New packages to install:**

- `@radix-ui/react-popover`
- `react-day-picker`
- `date-fns` (peer dependency of react-day-picker)

---

## Property Type → Editor Mapping

| Property Type | Editor Component           | Notes                                    |
| ------------- | -------------------------- | ---------------------------------------- |
| text          | Input                      | Inline text input                        |
| richtext      | Textarea                   | Multi-line (or read-only link to editor) |
| number        | Input (type=number)        | Numeric input                            |
| boolean       | Checkbox                   | Toggle                                   |
| date          | DatePicker (mode=date)     | Calendar popover                         |
| datetime      | DatePicker (mode=datetime) | Calendar + time                          |
| select        | Select                     | Dropdown                                 |
| multiselect   | Select (multiple)          | Multi-select dropdown                    |
| ref           | RelationPicker             | Single object search                     |
| refs          | RelationPicker (multiple)  | Multi-object with chips                  |

---

## Non-Goals (Future Work)

- Column drag reorder
- Column resize
- Virtualization for large datasets (1000+ rows)
- Inline rich text editing (opens full editor instead)
- Undo/redo within grid
