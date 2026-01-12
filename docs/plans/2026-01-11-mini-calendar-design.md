# MiniCalendar Component Design

**Date:** 2026-01-11
**Status:** Approved

## Summary

A compact monthly calendar component for daily note navigation. Shows dot indicators for days with notes, allows clicking any date to navigate/create, and supports configurable week start.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Standalone primitive | Matches DailyNoteNav pattern, reusable anywhere |
| Data interface | `Set<string>` for dates | O(1) lookup, matches `date_key` format from backend |
| Week start | Configurable prop (0/1) | Flexibility for user preferences |
| Click behavior | Creates note if missing | Seamless "just click a date" UX |

## Component Interface

```typescript
interface MiniCalendarProps {
  /** Currently selected/viewing date (YYYY-MM-DD) */
  selectedDate: string;

  /** Set of dates that have notes (YYYY-MM-DD format) */
  datesWithNotes?: Set<string>;

  /** Called when user clicks a date - parent handles navigation/creation */
  onDateSelect?: (date: string) => void;

  /** Called when month changes (for loading note indicators) */
  onMonthChange?: (year: number, month: number) => void;

  /** Week start: 0 = Sunday, 1 = Monday. Default: 0 */
  weekStartsOn?: 0 | 1;

  /** Additional class names */
  className?: string;
}
```

## Visual Layout

```
┌─────────────────────────────────────┐
│  ←    January 2026    →             │
├─────────────────────────────────────┤
│  Su   Mo   Tu   We   Th   Fr   Sa   │
├─────────────────────────────────────┤
│            1    2    3    4         │
│   5    6    7    8    9   10   11   │
│  12  [13]  14   15•  16   17   18   │
│  19   20   21   22   23   24   25   │
│  26   27   28   29   30   31        │
└─────────────────────────────────────┘
```

## Visual States

| State | Style |
|-------|-------|
| Default | `text-gray-700`, no background |
| Today | `text-accent-600 font-medium` |
| Selected | `bg-accent-500 text-white rounded` |
| Has note | Small dot below number (`bg-accent-400`, 4px) |
| Other month | `text-gray-300` |
| Hover | `bg-gray-100 rounded` |

## Sizing

- Container width: `224px` (7 columns × 32px)
- Day cells: `32px × 32px`
- Month arrows: ghost button style (matches DailyNoteNav)
- Minimal padding, compact layout

## Files to Create

```
packages/design-system/src/components/MiniCalendar/
├── MiniCalendar.tsx          # Main component
├── MiniCalendar.stories.tsx  # Ladle stories
├── utils.ts                  # Date calculation helpers
├── index.ts                  # Exports
```

## Implementation Notes

### Date Utilities Needed

```typescript
// Get days to display for a month (including padding from adjacent months)
function getCalendarDays(year: number, month: number, weekStartsOn: 0 | 1): CalendarDay[]

// Format date to YYYY-MM-DD
function formatDateKey(date: Date): string

// Parse YYYY-MM-DD to Date
function parseDateKey(dateKey: string): Date
```

### Month Navigation

- Internal state: `viewingMonth` (year/month being displayed)
- Separate from `selectedDate` (which date is selected)
- Clicking prev/next month updates `viewingMonth` and calls `onMonthChange`

## Stories Required

1. **Default** — Basic calendar with selected date
2. **WithNotes** — Shows dot indicators for dates with notes
3. **Interactive** — Click to select dates, navigate months
4. **MondayStart** — weekStartsOn={1}
5. **AllStates** — Comprehensive showcase of all visual states
6. **InContext** — Shows calendar next to simulated content
