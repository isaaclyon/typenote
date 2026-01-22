# Data Grid Pattern Contract

Status: Draft
Last Updated: 2026-01-21
Related Plan: `docs/plans/2026-01-21-mvp-design-system-gaps.md`

## Purpose

Define a consistent data-attribute and class hook contract for the Table primitives
and DataGrid patterns. This keeps Table primitives generic while enabling rich
grid behaviors (sorting, selection, pinned columns, drag reorder) in patterns and
features.

## Scope

- Table primitive data attributes for layout states.
- DataGridHeaderCell attributes for sort + drag state.
- DataGridRowActions and DataGridSelection attributes.
- Styling guidance for sticky headers and pinned columns.

## Non-Goals

- TanStack table behavior wiring.
- Column reorder logic or drag-and-drop implementation details.
- Token values or palette decisions.

## Table Primitives: Data Attributes

Table and region

- `Table`: `data-variant="default|ghost"` (optional hook)
- `TableHeader`: `data-sticky="true"`
- `TableBody`: no required attributes

Row state

- `TableRow`: `data-hover="true"`
- `TableRow`: `data-selected="true"`
- `TableRow`: `data-active="true"`
- `TableRow`: `data-disabled="true"`

Cell state

- `TableHead` / `TableCell`: `data-align="left|center|right"`
- `TableHead` / `TableCell`: `data-pinned="left|right"`
- `TableHead` / `TableCell`: `data-cell-type="title|meta|actions|selection"`
- `TableHead` / `TableCell`: `data-truncate="true"`

## DataGridHeaderCell: Data Attributes

Core state

- `data-sort="none|asc|desc"`
- `data-sortable="true|false"`
- `data-draggable="true|false"`
- `data-dragging="true"`
- `data-drop-target="before|after"`

Display hints

- `data-align="left|center|right"`
- `data-pinned="left|right"`
- `data-resizable="true|false"`

## DataGridRowActions: Data Attributes

Core state

- `data-visible="always|hover|focus"`
- `data-has-actions="true|false"`
- `data-row-state="default|selected|disabled"`
- `data-align="left|right"`

Optional

- `data-sticky="true"`
- `data-compact="true"`

## DataGridSelection: Data Attributes

Header state

- `data-selection="none|some|all"`

Row state

- `data-checked="true|false"`
- `data-indeterminate="true|false"`
- `data-disabled="true"`

Optional

- `data-align="center"`
- `data-sticky="true"`

## Class Hooks (semantic)

These are optional and should complement data attributes.

- `tn-table`, `tn-table-row`, `tn-table-cell`, `tn-table-head`
- `tn-table-sticky-header`, `tn-table-pinned-left`, `tn-table-pinned-right`
- `tn-table-row-selected`, `tn-table-row-active`, `tn-table-row-disabled`
- `tn-grid-head`, `tn-grid-head-label`, `tn-grid-head-sort`, `tn-grid-head-handle`
- `tn-grid-head-menu`, `tn-grid-head-drop-before`, `tn-grid-head-drop-after`
- `tn-grid-actions`, `tn-grid-actions-button`, `tn-grid-actions-menu`, `tn-grid-actions-open`
- `tn-grid-select`, `tn-grid-select-checkbox`, `tn-grid-select-header`

## Styling Guidance

- Sticky headers: `position: sticky; top: 0; z-index: 10`.
- Pinned columns: `position: sticky; left/right: 0; z-index: 5; background: surface`.
- Selected rows: use accent-tint background + stronger border.
- Active rows: subtle outline or inset shadow.
- Actions column: fixed width, icon-only by default, visible on hover unless
  overridden by `data-visible`.

## Notes

- Table primitives remain dumb; grid behavior is expressed in patterns and features.
- Visual cues can borrow from shadcn/Dice UI references, but must stay tokenized.
