# Daily Note Header Design

## Goal

Replace the editable raw date title ("2026-01-16") in Daily Notes with a polished, immutable formatted header that shows the day name and date with proper visual hierarchy.

## Visual Design

```
Thursday          ← text-xs text-gray-400 font-normal (subtle label)
January 16, 2026  ← text-2xl text-gray-900 font-semibold (main heading)
```

**Key characteristics:**

- Immutable — not editable, purely display
- Two-line layout with day name as subtle label above
- Only appears for Daily Notes (typeKey === 'DailyNote')
- Parses `date_key` property (e.g., "2026-01-16") into formatted display

## Architecture

### Approach

Use CSS hiding to suppress the existing title block while rendering a new formatted header above the editor. This keeps the document structure intact while changing the visual presentation.

### Components

**1. DailyNoteHeader (new component in design-system)**

```typescript
interface DailyNoteHeaderProps {
  dateKey: string; // "2026-01-16" format
  className?: string;
}
```

Location: `packages/design-system/src/components/DailyNoteHeader/`

Responsibilities:

- Parse dateKey into day name and formatted date
- Render two-line display with proper typography
- No interactivity

**2. InteractiveEditor enhancement**

Add `hideTitle` prop to hide the first heading block via CSS:

```typescript
interface InteractiveEditorProps {
  // ... existing props
  hideTitle?: boolean;
}
```

Implementation: Apply CSS rule when `hideTitle` is true:

```css
[data-node-type='heading']:first-child {
  display: none;
}
```

**3. DocumentEditor integration**

In `apps/desktop/src/renderer/components/DocumentEditor.tsx`:

- Detect when viewing a Daily Note
- Render `DailyNoteHeader` above the editor
- Pass `hideTitle={true}` to InteractiveEditor

## Files to Modify

| File                                                                                | Action                       |
| ----------------------------------------------------------------------------------- | ---------------------------- |
| `packages/design-system/src/components/DailyNoteHeader/DailyNoteHeader.tsx`         | Create                       |
| `packages/design-system/src/components/DailyNoteHeader/DailyNoteHeader.stories.tsx` | Create                       |
| `packages/design-system/src/components/DailyNoteHeader/index.ts`                    | Create                       |
| `packages/design-system/src/components/index.ts`                                    | Export new component         |
| `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx`     | Add hideTitle prop           |
| `apps/desktop/src/renderer/components/DocumentEditor.tsx`                           | Conditional header rendering |

## Out of Scope

- Navigation arrows (← Today →) for jumping between daily notes
- Other visual hierarchy improvements (backlinks sections, typography, etc.)
- Regular note title styling changes

## Date Formatting

Using native `Intl.DateTimeFormat` for localization:

```typescript
function formatDayName(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

function formatFullDate(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
```
