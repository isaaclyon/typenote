# Daily Note Calendar Integration Design

## Overview

Integrate MiniCalendar + NotesCreatedList as a combined widget for Daily Note views, following Capacities-style layout where Daily Notes have a unique 2-column content area instead of the standard Properties/Tags right sidebar.

## Current State (Wrong)

- MiniCalendar lives in `LeftSidebar.tsx` (lines 106-117)
- NotesCreatedList is exported from design-system but not used
- Right sidebar shows same content (Properties/Tags) for all object types

## Target State

### Daily Note View

```
┌─────────────┬──────────────────────────────────────────┐
│   Left      │            Main Content Area              │
│  Sidebar    │  ┌────────────────────┬───────────────┐  │
│             │  │ DailyNoteNav       │ MiniCalendar  │  │
│  Types      │  │ "January 15, 2026" │               │  │
│  Pinned     │  │                    │ NotesCreated  │  │
│  Settings   │  │ [Editor Content]   │ List          │  │
│             │  │                    │               │  │
│  (no cal)   │  │ [Backlinks]        │               │  │
│             │  └────────────────────┴───────────────┘  │
└─────────────┴──────────────────────────────────────────┘
                                    ↑ No right sidebar
```

### Regular Note View (unchanged)

```
┌─────────────┬──────────────────────────┬─────────────┐
│   Left      │     Main Content Area    │   Right     │
│  Sidebar    │                          │  Sidebar    │
│             │  Title                   │  Properties │
│  Types      │  [Editor Content]        │  Tags       │
│  Pinned     │  [Backlinks]             │             │
│  Settings   │                          │             │
└─────────────┴──────────────────────────┴─────────────┘
```

## Component Architecture

### New Components (Desktop App)

**`DailyNoteLayout.tsx`** — 2-column wrapper for Daily Notes only

```
DailyNoteLayout
├── Left Column (flex-1)
│   ├── DailyNoteNav
│   ├── Date Title
│   ├── DocumentEditor
│   └── Backlinks
└── Right Column (fixed ~240px)
    ├── MiniCalendar
    └── NotesCreatedList
```

**`useObjectsCreatedOnDate.ts`** — Hook to fetch objects created on a date

### Modified Components

- **LeftSidebar.tsx** — Remove MiniCalendar (keep "Today's Note" button)
- **App.tsx** — Conditionally hide right sidebar for Daily Notes, use DailyNoteLayout

## Data Flow

### New IPC: `getObjectsCreatedOnDate(dateKey: string)`

Returns:

```typescript
{
  id: string;
  title: string;
  typeIcon: string | null; // Lucide icon name
  typeColor: string | null; // Color from object type
}
[];
```

### Flow

1. User views Daily Note → `DailyNoteLayout` renders
2. MiniCalendar shows with selected date matching Daily Note's date
3. `useObjectsCreatedOnDate(dateKey)` fetches objects (eager, on mount)
4. NotesCreatedList displays results
5. Click date in calendar → navigate to that Daily Note
6. Click item in NotesCreatedList → navigate to that object

### State Management

- Selected date derived from Daily Note being viewed (not separate state)
- `datesWithNotes` fetched via existing `useDatesWithNotes` hook (moved from LeftSidebar)

## Implementation Phases

### Phase 1: Backend/IPC

1. Add `getObjectsCreatedOnDate(dateKey)` to storage package
2. Wire IPC handler in main process
3. Expose via preload API

### Phase 2: Remove Calendar from Left Sidebar

4. Delete MiniCalendar from `LeftSidebar.tsx`
5. Remove `useDatesWithNotes` hook usage from LeftSidebar
6. Keep "Today's Note" button

### Phase 3: Daily Note Layout

7. Create `DailyNoteLayout.tsx`
8. 2-column flex layout
9. Wire `useDatesWithNotes` hook
10. Create `useObjectsCreatedOnDate` hook

### Phase 4: App Integration

11. Modify `App.tsx`:
    - Hide right sidebar when `typeKey === 'DailyNote'`
    - Render `DailyNoteLayout` for Daily Notes
    - Normal layout for other types

### Phase 5: Cleanup

12. Update migration checklist
13. Update Ladle stories if needed

## Design Decisions

| Decision                      | Choice      | Rationale                                   |
| ----------------------------- | ----------- | ------------------------------------------- |
| DailyNoteLayout location      | Desktop app | App-specific wiring, not reusable primitive |
| Data loading                  | Eager       | Panel always visible, query fast, better UX |
| Right sidebar for Daily Notes | Hidden      | Calendar panel replaces it conceptually     |
| Calendar in left sidebar      | Removed     | Moved to Daily Note content area            |

## Reference

- Capacities daily note UI (visual inspiration)
- Design system `WithDailyNoteEditor` story
- `NotesCreatedList.stories.tsx` → `WithMiniCalendar` story
