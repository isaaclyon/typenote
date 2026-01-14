# NotesCreatedList Component Design

**Date:** 2026-01-11
**Status:** Approved

## Summary

A compact list showing objects created on a selected date. Sits below the MiniCalendar in the daily note sidebar, giving context about what else was created that day.

## Design Decisions

| Decision      | Choice                 | Rationale                         |
| ------------- | ---------------------- | --------------------------------- |
| Content scope | Non-daily notes only   | Daily note is already the context |
| Item display  | Title + type icon      | Compact, scannable                |
| Click action  | Navigate to object     | Simple, expected behavior         |
| Long lists    | Scrollable (200px max) | Better to have scroll ready       |

## Component Interface

```typescript
interface NotesCreatedListProps {
  /** Date to show creations for (YYYY-MM-DD) */
  date: string;

  /** Objects created on this date */
  items: Array<{
    id: string;
    title: string;
    typeIcon: React.ComponentType<{ className?: string }>;
    typeColor?: string;
  }>;

  /** Called when user clicks an item */
  onItemClick?: (id: string) => void;

  /** Show header with date? Default: true */
  showHeader?: boolean;

  /** Loading state */
  isLoading?: boolean;

  /** Additional class names */
  className?: string;
}
```

## Visual Layout

```
┌─────────────────────────────────┐
│  Created Jan 11                 │
├─────────────────────────────────┤
│  📄 Project kickoff notes       │
│  ✓  Review API design           │
│  📄 Meeting with Sarah          │
│  👤 Alex Thompson               │
│  ... (scrollable if more)       │
└─────────────────────────────────┘
```

## Styling

| Element    | Classes                                                        |
| ---------- | -------------------------------------------------------------- |
| Container  | `w-56` (224px, matches MiniCalendar)                           |
| Header     | `text-xs font-medium text-gray-500 mb-2`                       |
| List area  | `max-h-[200px]` with ScrollArea                                |
| Item row   | `flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50` |
| Type icon  | `w-4 h-4 flex-shrink-0` with type color                        |
| Title      | `text-sm text-gray-700 truncate`                               |
| Empty text | `text-sm text-gray-400 text-center py-4`                       |

## States

### Empty

- Shows "No notes created" centered, muted gray

### Loading

- 3 skeleton rows using existing Skeleton component

### With items

- Scrollable list with hover states

## Files to Create

```
packages/design-system/src/components/NotesCreatedList/
├── NotesCreatedList.tsx
├── NotesCreatedList.stories.tsx
└── index.ts
```

## Stories Required

1. **Default** — List with a few items
2. **Empty** — No items created that day
3. **Loading** — Skeleton loading state
4. **ManyItems** — Long scrollable list
5. **Interactive** — Click to see navigation callback
6. **WithMiniCalendar** — Combined view showing both components
