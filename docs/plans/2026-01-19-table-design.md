# Table Design

**Date:** 2026-01-19  
**Status:** Complete (Phase 1)

## Overview

Add simple data tables to the TypeNote editor using TipTap's official table extensions.

## Scope

**In scope:**

- Basic table structure (rows, columns, cells)
- First row as header (bold, subtle background)
- Tab/Shift+Tab navigation between cells
- `/table` slash command

**Deferred (Phase 2):**

- Column resizing (disabled due to prosemirror-tables widget layout issues)
- Hover buttons to add rows/columns
- Context menu for table operations

**Out of scope:**

- Cell merging/splitting (TipTap supports it, but not exposed)
- Formulas or calculations
- Sorting/filtering
- Database-style typed columns

## Dependencies

```bash
pnpm --filter @typenote/design-system add \
  @tiptap/extension-table \
  @tiptap/extension-table-row \
  @tiptap/extension-table-cell \
  @tiptap/extension-table-header
```

## Visual Design

### Table Styling

- Full width within 650px editor content area
- Clean 1px borders using `--border` token
- Cell padding: 8px 12px
- Minimum column width: 50px

### Header Row

- Background: `--muted` (subtle gray)
- Font weight: 600 (semibold)
- Text color: `--foreground`

### Hover Controls

- **Right edge:** `+` button to add column
- **Bottom edge:** `+` button to add row
- Appear on table hover
- Style: 20px circle, muted background, centered `+` icon
- Position: absolutely positioned outside table bounds

### Column Resize

- Drag vertical border between columns
- Cursor: `col-resize` on hover
- Visual handle: 4px wide hit area
- Min width enforced: 50px

## Context Menu

Right-click on any cell shows:

1. Insert row above
2. Insert row below
3. Insert column left
4. Insert column right
5. Divider
6. Delete row
7. Delete column
8. Delete table

## Slash Command

- Trigger: `/table`
- Keywords: `table`, `grid`
- Action: Insert 3x3 table with header row
- Icon: `Table` from Phosphor

## Keyboard Behavior

- `Tab` — Move to next cell (wraps to next row)
- `Shift+Tab` — Move to previous cell
- `Enter` — New line within cell (not new row)
- Arrow keys — Navigate within cell content

## Implementation

### Files to Create

1. `extensions/Table.ts` — Configure and export table extensions
2. `extensions/TableView.tsx` — Custom wrapper for hover controls

### Files to Modify

1. `Editor.tsx` — Register table extensions
2. `extensions/SlashCommand.ts` — Add `/table` command
3. `extensions/index.ts` — Export table extensions
4. `editor.css` — Table styling

### Stories

1. `WithTable` — Basic table with sample data
2. `TableViaSlash` — Insert via slash command
3. `TableOperations` — Row/column add/remove
4. `TableResize` — Column resizing demo

## Technical Notes

TipTap's table extensions use prosemirror-tables under the hood. Key features:

- `Table` node contains `TableRow` nodes
- `TableRow` contains `TableCell` or `TableHeader` cells
- `TableHeader` cells are used for the first row
- Column resizing requires `prosemirror-tables` CSS

The custom `TableView` wraps the table to add hover controls without
interfering with ProseMirror's table editing behavior.
