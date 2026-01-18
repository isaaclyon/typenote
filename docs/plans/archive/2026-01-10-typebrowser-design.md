# TypeBrowser Design Document

**Date:** 2026-01-10
**Status:** Ready for Implementation
**Component Location:** `packages/design-system/src/components/TypeBrowser/`

---

## Overview

TypeBrowser is a Notion-style data table for browsing objects of a single type. It's a core UI component enabling users to view, filter, sort, and edit large datasets inline.

### Key Characteristics

- **Single-type browsing** — One object type at a time (e.g., all Tasks)
- **Virtual scroll + lazy load** — Handles 1000+ rows efficiently
- **Full inline editing** — Edit any cell directly, auto-save on blur
- **Rich cell types** — 9 property types with custom renderers
- **TanStack Table** — Headless library for sorting, filtering, virtualization

---

## Implementation Approach

**Fork the [TanStack mega example](https://github.com/s-d-le/tanstack-react-table-mega-example)** as a starting point, then:

1. Strip Notion API, use our IPC/storage
2. Add TanStack Virtual for row virtualization
3. Add column pinning (checkbox + title)
4. Add inline editing with our cell types
5. Restyle with our design system tokens

### Dependencies

| Package                       | Purpose              |
| ----------------------------- | -------------------- |
| `@tanstack/react-table`       | Headless table logic |
| `@tanstack/react-virtual`     | Row virtualization   |
| `@dnd-kit/core` + `/sortable` | Column reordering    |

---

## Features Breakdown

### Data Display

| Feature               | Behavior                                          |
| --------------------- | ------------------------------------------------- |
| **Column visibility** | Type defines defaults, user can show/hide/reorder |
| **Column resizing**   | Drag column edges to resize                       |
| **Column reordering** | Drag headers to reorder (except pinned)           |
| **Column pinning**    | Checkbox + title pinned left, others scroll       |
| **Sorting**           | Single-column sort, click header cycles asc/desc  |
| **Grouping**          | Optional group by select/status properties        |
| **Row height**        | Compact (fixed) / Comfortable (auto) toggle       |

### Row Interactions

| Feature           | Behavior                                                    |
| ----------------- | ----------------------------------------------------------- |
| **Click row**     | Navigates to object in editor                               |
| **Hover actions** | Three-dot menu (⋮) with Archive, Duplicate, etc.            |
| **Multi-select**  | Click row selects, Shift+click for range                    |
| **Select all**    | Selects ALL rows matching current filter (not just visible) |
| **Bulk actions**  | Archive, Duplicate, Set property values                     |
| **New row**       | Inline row at bottom + toolbar New button                   |

### Filtering & Search

| Feature          | Behavior                                                       |
| ---------------- | -------------------------------------------------------------- |
| **Quick search** | Text input filters across all columns                          |
| **Filter bar**   | Click + dropdown to add conditions (Property, Operator, Value) |
| **Saved views**  | Named filter/sort presets stored in separate Views table       |
| **Counts**       | Shows "Showing 12 of 47 items" when filtered                   |

### Inline Editing

| Feature      | Behavior                                                 |
| ------------ | -------------------------------------------------------- |
| **Trigger**  | Click cell to enter edit mode                            |
| **Save**     | Auto-save on blur (click away)                           |
| **Cancel**   | Escape key reverts changes                               |
| **Errors**   | Toast notification, cell reverts                         |
| **Keyboard** | Arrow keys move cells, Tab moves right, Enter moves down |

---

## Cell Types

| Type            | Display                       | Editor         | Filter Operators                      |
| --------------- | ----------------------------- | -------------- | ------------------------------------- |
| **text**        | Truncated text                | Text input     | equals, contains, startsWith, isEmpty |
| **number**      | Formatted number              | Number input   | =, ≠, <, >, ≤, ≥, isEmpty             |
| **date**        | Smart ("Yesterday", "Jan 15") | Date picker    | is, before, after, between, isEmpty   |
| **checkbox**    | Checkbox icon                 | Toggle         | is checked, is unchecked              |
| **select**      | Colored pill                  | Dropdown       | is, isNot, isEmpty                    |
| **multiSelect** | Pills (truncate +N)           | Multi-dropdown | contains, doesNotContain, isEmpty     |
| **tags**        | Tag chips                     | Tag picker     | hasTag, doesNotHaveTag, isEmpty       |
| **relation**    | Underlined link + type icon   | Object picker  | links to, doesn't link to, isEmpty    |
| **attachment**  | Icon + filename               | File picker    | has attachment, isEmpty               |

### Relation Cell Styling

Matches editor pane (undocumented but implemented):

- Type icon on left, colored by related type's color
- Underlined text, also in related type's color
- Clickable to navigate

---

## Visual Design

### Table Styling

- **Minimal lines** — Subtle column separators only (like Notion)
- **Row backgrounds** — White default, subtle blue (accent-50) when selected
- **Hover** — Light gray background on row hover
- **Loading** — Skeleton rows with shimmer animation
- **Empty** — Use existing `EmptyState` component

### Toolbar

Located above table with:

1. **Search input** — Quick text filter
2. **Filter bar** — Active filter pills + Add Filter button
3. **View switcher** — Table/List/Kanban/Cards/Masonry icons (only Table active for now)
4. **Column picker** — Dropdown to show/hide columns
5. **Density toggle** — Compact/Comfortable switch
6. **New button** — Creates new object

### Keyboard Navigation (Notion-style)

| Key              | Action                       |
| ---------------- | ---------------------------- |
| Arrow keys       | Move between cells           |
| Tab              | Move right, wrap to next row |
| Enter            | Move down (or start editing) |
| Escape           | Cancel edit, deselect        |
| Cmd+D            | Duplicate selected rows      |
| Delete/Backspace | Archive selected rows        |
| Cmd+A            | Select all                   |

---

## Component Architecture

```
TypeBrowser/
├── index.ts                    # Exports
├── types.ts                    # Shared TypeScript types
├── TypeBrowser.tsx             # Main container component
├── TypeBrowser.stories.tsx     # Ladle stories
│
├── hooks/
│   ├── useTypeBrowserTable.ts  # TanStack Table configuration
│   ├── useVirtualRows.ts       # TanStack Virtual setup
│   ├── useKeyboardNav.ts       # Keyboard navigation logic
│   └── useSavedViews.ts        # Saved views CRUD
│
├── Toolbar/
│   ├── Toolbar.tsx             # Toolbar container
│   ├── SearchInput.tsx         # Quick search
│   ├── FilterBar/
│   │   ├── FilterBar.tsx       # Filter container
│   │   ├── FilterCondition.tsx # Single filter pill
│   │   └── AddFilterPopover.tsx
│   ├── ViewSwitcher.tsx        # View mode icons
│   ├── ColumnPicker.tsx        # Column visibility dropdown
│   └── DensityToggle.tsx       # Compact/Comfortable
│
├── Table/
│   ├── TableContainer.tsx      # Scroll container with refs
│   ├── TableHeader.tsx         # Header row
│   ├── ColumnHeader.tsx        # Single column header with menu
│   ├── TableBody.tsx           # Virtualized body
│   ├── TableRow.tsx            # Data row
│   └── NewRow.tsx              # Inline create row
│
├── Cells/
│   ├── CellRenderer.tsx        # Routes value to correct cell type
│   ├── TextCell.tsx
│   ├── NumberCell.tsx
│   ├── DateCell.tsx
│   ├── CheckboxCell.tsx
│   ├── SelectCell.tsx
│   ├── MultiSelectCell.tsx
│   ├── TagCell.tsx
│   ├── RelationCell.tsx
│   └── AttachmentCell.tsx
│
├── BulkActions/
│   └── BulkActionBar.tsx       # Appears when rows selected
│
└── SavedViews/
    └── SavedViewsDropdown.tsx  # View presets dropdown
```

---

## State Management

```typescript
interface TypeBrowserState {
  // Data
  typeId: string;
  objects: Object[];
  totalCount: number;

  // View settings (persisted per type)
  columns: ColumnConfig[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  filters: FilterCondition[];
  searchQuery: string;
  density: 'compact' | 'comfortable';
  groupBy: string | null;

  // Selection
  selectedIds: Set<string>;
  selectAllMode: boolean; // True = all matching filter

  // UI state
  editingCell: { rowId: string; columnId: string } | null;
  loadingState: 'initial' | 'loading' | 'loaded' | 'error';
}

interface ColumnConfig {
  id: string;
  propertyId: string;
  width: number;
  visible: boolean;
  order: number;
}

interface FilterCondition {
  id: string;
  propertyId: string;
  operator: FilterOperator;
  value: unknown;
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      TypeBrowser                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐   │
│  │ Toolbar  │───▶│  State   │◀───│  TanStack Table  │   │
│  └──────────┘    └────┬─────┘    └──────────────────┘   │
│                       │                                  │
│              ┌────────▼────────┐                        │
│              │  Data Fetcher   │                        │
│              │ (lazy + cache)  │                        │
│              └────────┬────────┘                        │
└───────────────────────┼─────────────────────────────────┘
                        ▼
              ┌──────────────────┐
              │   IPC / Storage  │
              └──────────────────┘
```

### Inline Edit Flow

```
User clicks cell
    ↓
editingCell = { rowId, columnId }
    ↓
Cell renders editor component
    ↓
User types (local state only)
    ↓
User blurs (clicks away or Tab/Enter)
    ↓
onBlur triggers save via IPC
    ↓
┌─────────────┬─────────────────┐
│  Success    │     Failure     │
├─────────────┼─────────────────┤
│ Update data │ Revert cell     │
│ Clear edit  │ Show toast      │
│ state       │ Clear edit state│
└─────────────┴─────────────────┘
```

---

## Saved Views (Backend)

Saved views are stored in a separate `View` table, linked to object types:

```typescript
interface View {
  id: string;
  name: string;
  typeId: string;
  filters: FilterCondition[];
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc';
  columns: ColumnConfig[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Note:** This requires backend work to create the View table and IPC handlers.

---

## Implementation Phases

### Phase 1: Core Table (MVP)

- [ ] Set up TanStack Table with TypeScript
- [ ] Implement basic columns (text, number, checkbox)
- [ ] Add sorting (single column)
- [ ] Add row selection
- [ ] Ladle stories for each state

### Phase 2: Virtualization & Pinning

- [ ] Add TanStack Virtual for row virtualization
- [ ] Implement column pinning (checkbox + title)
- [ ] Horizontal scroll with sticky columns

### Phase 3: Inline Editing

- [ ] Cell edit mode (click to edit)
- [ ] Auto-save on blur
- [ ] Keyboard navigation (arrows, Tab, Enter, Escape)
- [ ] Error handling with toast

### Phase 4: Rich Cell Types

- [ ] Date cell with picker
- [ ] Select/MultiSelect cells
- [ ] Tag cell (reuse Tag component)
- [ ] Relation cell with object picker
- [ ] Attachment cell

### Phase 5: Filtering

- [ ] Quick search input
- [ ] Filter bar with condition builder
- [ ] Filter operators per cell type

### Phase 6: Advanced Features

- [ ] Column reordering with @dnd-kit
- [ ] Column resizing
- [ ] Grouping by property
- [ ] Density toggle
- [ ] Bulk actions bar

### Phase 7: Saved Views (Requires Backend)

- [ ] View table in storage
- [ ] IPC handlers for CRUD
- [ ] SavedViewsDropdown component
- [ ] Default view per type

---

## References

- [TanStack Table Editable Example](https://tanstack.com/table/latest/docs/framework/react/examples/editable-data)
- [TanStack Table Virtualized Rows](https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows)
- [TanStack Table Column Pinning Sticky](https://tanstack.com/table/latest/docs/framework/react/examples/column-pinning-sticky)
- [TanStack Mega Example (GitHub)](https://github.com/s-d-le/tanstack-react-table-mega-example)
- [TypeNote Design System](/docs/system/INDEX.md)

---

## Open Questions

1. **View persistence** — Where should column widths/order be stored? User preferences or per-type?
2. **Saved views ownership** — Are views global or per-user? (Matters for multi-user later)
3. **Attachment cell** — What file types supported? Preview on hover?

---

**Last Updated:** 2026-01-10
