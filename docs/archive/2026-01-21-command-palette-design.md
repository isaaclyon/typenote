# CommandPalette Design

Status: Approved
Last Updated: 2026-01-21

## Overview

The CommandPalette is a Dialog-based overlay providing quick access to objects and actions. It combines object search with an action launcher in one unified UI, triggered via `Cmd+K`.

## Anatomy

```
┌─────────────────────────────────────────┐
│  🔍 [Search or jump to...______] [×]    │  ← SearchInput (autofocused)
├─────────────────────────────────────────┤
│  Recent                                 │  ← Section header
│  ┌─────────────────────────────────┐    │
│  │ 📄 Meeting Notes       [Page]   │←── │  ← Item: icon + title + badge
│  │ 📅 2026-01-21          [Daily]  │    │
│  │ 👤 John Smith          [Person] │    │
│  └─────────────────────────────────┘    │
│  Quick Actions                          │  ← Section header
│  ┌─────────────────────────────────┐    │
│  │ ➕ New Page              ⌘N     │    │  ← Action with shortcut
│  │ 📅 New Daily Note               │    │
│  │ ⚙️ Settings                      │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Behavior

- Opens centered with `max-w-lg` (~512px)
- SearchInput autofocused on open
- Arrow keys navigate through all items (sections are visual grouping only)
- Enter activates selected item (navigate to object or execute action)
- Escape closes the palette
- Typing filters results and replaces sections with unified "Search Results" section

## Sections

1. **Recent Objects** — Recently viewed/edited objects
2. **Quick Actions** — Commands like 'New Page', 'New Daily Note', 'Settings'
3. **Search Results** — Replaces other sections when user types a query

No inline object creation — use Quick Actions which navigate to appropriate flows.

## Component Architecture

### Reusing Existing

- `Dialog`, `DialogContent`, `DialogOverlay` — Container and overlay
- `SearchInput` — Search field at top

### New Patterns

**CommandPaletteItem** — Single result row

- Props: `icon`, `title`, `badge?`, `shortcut?`, `selected`, `disabled`, `onClick`
- Renders: icon (16px), title, optional badge/shortcut on right
- Hover/selected states via CSS

**CommandPaletteSection** — Labeled group of items

- Props: `label`, `children`
- Renders: muted section header + items
- Purely visual grouping

**CommandPaletteList** — Scrollable results container

- Props: `children`, `emptyState?`
- Max-height with overflow scroll
- Shows empty state when no results

### Feature Component

**CommandPalette** — Composed feature

- Combines Dialog + SearchInput + List + Sections
- Manages keyboard navigation internally
- Design-system only: no IPC, no data fetching

## TypeScript API

```typescript
// Item types (discriminated union)
interface CommandPaletteObjectItem {
  type: 'object';
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  objectType: string; // "Page", "Daily Note", "Person", etc.
}

interface CommandPaletteActionItem {
  type: 'action';
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  shortcut?: string; // Optional keyboard shortcut hint
}

type CommandPaletteItem = CommandPaletteObjectItem | CommandPaletteActionItem;

// Main component props
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Data (provided by renderer)
  recentItems: CommandPaletteObjectItem[];
  actions: CommandPaletteActionItem[];
  searchResults?: CommandPaletteObjectItem[];

  // Callbacks
  onSearch: (query: string) => void;
  onSelect: (item: CommandPaletteItem) => void;

  // Optional
  searchPlaceholder?: string;
  emptySearchMessage?: string;
}
```

## Keyboard Navigation

Managed via internal `useKeyboardListNavigation` hook:

- **Arrow Down / Arrow Up** — Move selection (wraps at ends)
- **Enter** — Activate selected item
- **Escape** — Close palette

Items from all sections flattened into one array. Sections are purely visual.

```typescript
function useKeyboardListNavigation(items: CommandPaletteItem[]) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (items[selectedIndex]) onSelect(items[selectedIndex]);
        break;
    }
  };

  return { selectedIndex, handleKeyDown };
}
```

## Visual Styling

Following TypeNote's "focused calm" aesthetic:

**Container:**

- Dialog `size="lg"` (512px max-width)
- No visible close button (Escape is sufficient)
- Custom padding for tighter layout

**SearchInput:**

- Flush to top, full width, `size="md"`
- Placeholder: "Search or jump to..."

**Section Headers:**

- `text-xs`, `text-muted-foreground`, `font-medium`
- Uppercase with slight letter-spacing
- Padding: `px-3 py-2`

**Items:**

- Height: 36px (compact)
- Icon: 16px, `text-muted-foreground`
- Title: `text-sm`, `text-foreground`
- Badge/Shortcut: `text-xs`, `text-muted-foreground`, right-aligned
- Hover: `bg-muted/50`
- Selected: `bg-accent-50`, `text-accent-700`

**Scrollable Area:**

- Max-height: ~320px (8-9 items visible)
- Thin, muted scrollbar

**Transitions:**

- Selection: instant (keyboard speed)
- Hover: `transition-colors duration-100`

## File Structure

```
packages/design-system/src/
├── patterns/
│   ├── CommandPaletteItem/
│   │   ├── CommandPaletteItem.tsx
│   │   ├── CommandPaletteItem.stories.tsx
│   │   └── index.ts
│   ├── CommandPaletteSection/
│   │   ├── CommandPaletteSection.tsx
│   │   ├── CommandPaletteSection.stories.tsx
│   │   └── index.ts
│   └── CommandPaletteList/
│       ├── CommandPaletteList.tsx
│       ├── CommandPaletteList.stories.tsx
│       └── index.ts
└── features/
    └── CommandPalette/
        ├── CommandPalette.tsx
        ├── CommandPalette.stories.tsx
        ├── useKeyboardListNavigation.ts
        ├── types.ts
        └── index.ts
```

## Ladle Stories Required

1. **Default** — Initial state with Recent + Quick Actions
2. **WithSearchResults** — Query entered, showing search results
3. **EmptySearch** — No matches for query
4. **ManyItems** — Scroll behavior with 20+ items
5. **ActionsOnly** — No recent items
6. **KeyboardNavigation** — Interactive demo
7. **WithShortcuts** — Actions with keyboard hints

## Build Order

1. `CommandPaletteItem` pattern
2. `CommandPaletteSection` pattern
3. `CommandPaletteList` pattern
4. `CommandPalette` feature (composes all + keyboard hook)

## Non-Goals

- Inline object creation (use Quick Actions)
- IPC or data fetching (renderer responsibility)
- Fuzzy matching logic (renderer provides filtered results)
- Global keyboard shortcut binding (renderer wires Cmd+K)
