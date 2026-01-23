# TypeBrowser Phase 2: Virtualization & Column Pinning

**Date:** 2026-01-13
**Status:** Approved
**Author:** Claude Code

## Overview

Add row virtualization and sticky column pinning to TypeBrowser for handling large datasets (10,000+ rows) and wide tables with many columns.

## Goals

1. **Performance at scale** — Render only visible rows using `@tanstack/react-virtual`
2. **Column pinning** — Pin columns to left/right edges with sticky positioning
3. **Always-on virtualization** — No opt-in required, works for all datasets
4. **Mixed pinning model** — Some columns always-pinned, others user-pinnable

## Dependencies

```bash
pnpm --filter @typenote/design-system add @tanstack/react-virtual
```

## Architecture

### Table Layout Change

Switch from semantic `<table>` display to CSS Grid while keeping semantic HTML elements:

```tsx
// Keep <table>/<tr>/<td> for accessibility, override display for virtualization
<table style={{ display: 'grid' }}>
  <thead style={{ display: 'contents' }}>
    <tr style={{ display: 'flex' }}>...</tr>
  </thead>
  <tbody
    style={{
      display: 'grid',
      height: `${rowVirtualizer.getTotalSize()}px`,
      position: 'relative',
    }}
  >
    {/* Absolutely positioned rows */}
  </tbody>
</table>
```

This hybrid approach preserves screen reader compatibility while enabling virtualization.

### Row Virtualization

```tsx
const ROW_HEIGHT = 40; // Fixed row height for performance
const OVERSCAN = 5; // Rows rendered above/below viewport

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  estimateSize: () => ROW_HEIGHT,
  getScrollElement: () => containerRef.current,
  overscan: OVERSCAN,
});

// Render only visible rows
{
  rowVirtualizer.getVirtualItems().map((virtualRow) => {
    const row = rows[virtualRow.index];
    return (
      <tr
        key={row.id}
        style={{
          position: 'absolute',
          transform: `translateY(${virtualRow.start}px)`,
          width: '100%',
        }}
      >
        {/* cells */}
      </tr>
    );
  });
}
```

### Column Pinning Styles

New utility function for sticky column positioning:

```tsx
// pinningStyles.ts
function getColumnPinningStyles(column: Column<TData>): CSSProperties {
  const isPinned = column.getIsPinned();
  const isLastLeft = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRight = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    position: isPinned ? 'sticky' : 'relative',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: isPinned ? 1 : 0,
    backgroundColor: 'white',
    boxShadow: isLastLeft
      ? '-4px 0 4px -4px rgba(0,0,0,0.1) inset'
      : isFirstRight
        ? '4px 0 4px -4px rgba(0,0,0,0.1) inset'
        : undefined,
  };
}
```

### Pinning Categories

1. **Always-pinned columns:**
   - `_selection` checkbox column (hardcoded, always left)
   - Columns with `pinned: 'left' | 'right'` in definition

2. **User-pinnable columns:**
   - All other columns (default `allowPinning: true`)
   - Dropdown menu in header: "Pin Left" / "Pin Right" / "Unpin"

### Type Changes

```tsx
// types.ts
interface TypeBrowserColumn<TData> {
  // ... existing props ...

  /** Pin column permanently to left or right edge (cannot be unpinned by user) */
  pinned?: 'left' | 'right';

  /** Allow user to dynamically pin/unpin this column (default: true) */
  allowPinning?: boolean;
}

interface TypeBrowserProps<TData> {
  // ... existing props ...

  /** Callback when column pinning changes (for persistence) */
  onColumnPinningChange?: (pinning: { left: string[]; right: string[] }) => void;
}
```

## New Components

### ColumnPinMenu

Dropdown menu component for pin/unpin actions:

```tsx
interface ColumnPinMenuProps {
  column: Column<unknown>;
  isPermanentlyPinned: boolean;
}
```

Features:

- Pin icon button in column header (appears on hover for non-pinned)
- Dropdown with: "Pin Left" / "Pin Right" / "Unpin"
- Disabled state for permanently pinned columns

## Files to Create/Modify

| File                      | Change                                      |
| ------------------------- | ------------------------------------------- |
| `TypeBrowser.tsx`         | Add virtualization + pinning styles         |
| `types.ts`                | Add `allowPinning`, `onColumnPinningChange` |
| `ColumnPinMenu.tsx`       | **New:** Dropdown for pin options           |
| `pinningStyles.ts`        | **New:** `getColumnPinningStyles()` utility |
| `TypeBrowser.stories.tsx` | Add 7 new stories                           |

## New Stories

1. **VirtualizedManyRows** — 1,000 rows, smooth scrolling demo
2. **VirtualizedHugeDataset** — 10,000 rows, stress test
3. **ColumnPinning** — Title pinned left, basic demo
4. **ColumnPinningWithSelection** — Checkbox + Title both pinned
5. **DynamicColumnPinning** — Interactive pin/unpin UI
6. **VirtualizedWithColumnPinning** — Combined: 1,000 rows + pinned columns
7. **HorizontalScroll** — Wide table with many columns

## Implementation Order

1. Add `@tanstack/react-virtual` dependency
2. Refactor table layout to CSS Grid (hybrid approach)
3. Add `useVirtualizer` integration
4. Add column pinning styles utility
5. Add ColumnPinMenu component
6. Wire up to TypeBrowser
7. Add new stories

## References

- [TanStack Table Virtualized Rows Example](https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows)
- [TanStack Table Column Pinning Sticky Example](https://tanstack.com/table/latest/docs/framework/react/examples/column-pinning-sticky)
- [TanStack Virtual Documentation](https://tanstack.com/virtual/latest)
