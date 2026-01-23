# MVP Design System Gaps Plan

Status: Active
Last Updated: 2026-01-21

## Context

The design-system rebuild reset most UI work. We need a focused plan for the MVP design-system gaps that support three core flows:

- Notes + editor
- Object browsing (data grid)
- Search + command palette

This plan is design-system only. Renderer wiring, IPC, and data fetching remain out of scope.

## Goals

- Provide a stable object browser data grid built on TanStack table state.
- Define a consistent object detail layout: header, read-only properties, editor.
- Add a command palette overlay feature using DS primitives.
- Close the remaining editor UI gap for image insertion.

## Non-Goals

- Renderer integration or routing.
- Editable properties or property mutation UI.
- Data grid column management (reorder, pin, filter, sort UI) beyond visual affordances.
- NotateDoc converters or Markdown import/export.

## Constraints

- Ladle-first development for every primitive/pattern/feature.
- Use tokens, 4px grid, and avoid arbitrary values except dynamic sizing.
- No default exports; use `forwardRef` with `displayName`.

## Current Baseline

Existing features: `AppShell`, `Sidebar`, `HeaderBar`, `TitleBar`, `Editor`.

Key primitives and patterns already exist (Button, Input, Select, Menu, Tooltip, SearchInput, Breadcrumbs, EmptyState, etc). The missing pieces are table, dialog/overlay, data grid patterns, and object detail composition.

## Component Gaps

### New Primitives

1. Table
   - `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`.
   - Sticky header support, pinned column styling hooks.
2. Dialog
   - Overlay + content primitive for global panels (Command Palette).
   - Accessible focus trap and escape to close (Radix-backed).

### New Patterns

1. DataGridHeaderCell
   - Label + sort icon + optional menu trigger slot.
2. DataGridSelection
   - Checkbox header + row checkbox styles (indeterminate).
3. DataGridRowActions
   - Compact icon button cluster (Open, More).
4. PropertyList + PropertyRow
   - Read-only display rows, label/value columns.
   - Value rendering for text, date, select badge, tag list, relation summary.
5. TableEmptyState + TableLoadingState
   - Empty row messaging and skeleton row patterns.

### New Features

1. ObjectDataGrid
   - DS wrapper around `@tanstack/react-table` table instance.
   - Pinned title column, selection column, row actions.
   - Supports empty/loading state slots.
2. ObjectDetailHeader
   - Icon + title + type badge + optional actions.
3. ObjectPropertiesSection
   - Read-only property list placed below header and above editor.
   - Empty state for objects with no properties.
4. CommandPalette
   - Dialog overlay with SearchInput and sectioned list (Recent, Create, Results).
5. Editor Gap: Image Insert
   - Wire `/image` to open the ImageInsertPopover and enable URL/file insert.

## Data Grid Approach

- The renderer owns TanStack table state and data; the DS renders table UI only.
- Pinned title column uses sticky positioning with tokenized backgrounds.
- Selection is visual only in DS; event handlers are passed as props.

## Object Detail Layout

Layout order is fixed:

1. ObjectDetailHeader
2. ObjectPropertiesSection (read-only)
3. Editor

Properties should resemble Capacities/Obsidian: compact label/value rows with muted labels and strong values.

## Story Coverage (Ladle)

- Table: default, sticky header, pinned column example.
- Dialog: basic, wide, scrollable.
- DataGridHeaderCell: sort states (none/asc/desc).
- DataGridSelection: unchecked/checked/indeterminate.
- DataGridRowActions: Open + overflow.
- PropertyList: mixed values and empty state.
- ObjectDataGrid: sample data with pinned title + selection.
- ObjectDetailHeader: with/without icon, actions.
- ObjectPropertiesSection: realistic property stack.
- CommandPalette: Recent/Create/Results + empty state.

## Acceptance Criteria

- All new components live in `packages/design-system` with stories.
- No app wiring or IPC inside the design system.
- Each feature has at least one realistic story and one edge-state story.
- Table and dialog primitives are reusable beyond these features.

## Implementation Order

1. Primitives: Table, Dialog.
2. Patterns: DataGridHeaderCell, Selection, RowActions, PropertyList, Table states.
3. Features: ObjectDataGrid, ObjectDetailHeader, ObjectPropertiesSection, CommandPalette.
4. Editor: ImageInsertPopover wiring for `/image`.
