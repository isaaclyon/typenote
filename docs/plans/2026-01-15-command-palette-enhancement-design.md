# CommandPalette Enhancement Design

**Date:** 2026-01-15
**Status:** Approved
**Goal:** Replace `cmdk` dependency with enhanced design-system CommandPalette

## Summary

Enhance the design-system CommandPalette to support all features currently provided by the cmdk-based implementation in the desktop app, then migrate the desktop app to use it exclusively.

## Design Decisions

| Decision            | Choice                | Rationale                                      |
| ------------------- | --------------------- | ---------------------------------------------- |
| **Scope**           | Replace cmdk entirely | Full control, no external dependency           |
| **Grouping**        | Compound components   | Maximum flexibility, matches existing patterns |
| **Async/Loading**   | Built-in primitives   | Cohesive API while consumer controls state     |
| **Filtering**       | Consumer-controlled   | Design system is presentation layer only       |
| **Item value prop** | Optional              | Future-proofs for client-side filtering/a11y   |
| **Keyboard nav**    | Hook provided         | Clean separation, standardized behavior        |

## Component Architecture

```
CommandPalette
├── CommandPaletteInput      (search input with icon)
├── CommandPaletteList       (scrollable container)
│   ├── CommandPaletteGroup  (NEW: section with heading)
│   │   └── CommandPaletteItem (selectable row)
│   ├── CommandPaletteEmpty  (NEW: empty state message)
│   └── CommandPaletteLoading (NEW: loading indicator)
└── CommandPaletteSeparator  (NEW: visual divider)
```

### New Components

| Component                 | Purpose                            |
| ------------------------- | ---------------------------------- |
| `CommandPaletteGroup`     | Groups items with optional heading |
| `CommandPaletteEmpty`     | Customizable empty state           |
| `CommandPaletteLoading`   | Loading indicator                  |
| `CommandPaletteSeparator` | Visual divider between groups      |

### New Hook

`useCommandPaletteKeyboard` — Handles arrow key navigation, Enter to select, Escape to close.

## API Design

### Root Component

```typescript
interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}
```

### Input

```typescript
interface CommandPaletteInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean; // default: true
}
```

### Group

```typescript
interface CommandPaletteGroupProps {
  heading?: string;
  children: React.ReactNode;
}
```

### Item

```typescript
interface CommandPaletteItemProps {
  value?: string; // Optional: for client-side filtering/a11y
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}
```

### Empty & Loading

```typescript
interface CommandPaletteEmptyProps {
  children: React.ReactNode;
}

interface CommandPaletteLoadingProps {
  children?: React.ReactNode; // defaults to "Searching..."
}
```

### Keyboard Hook

```typescript
interface UseCommandPaletteKeyboardOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onEscape: () => void;
  enabled?: boolean; // default: true
}

interface UseCommandPaletteKeyboardReturn {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

function useCommandPaletteKeyboard(
  options: UseCommandPaletteKeyboardOptions
): UseCommandPaletteKeyboardReturn;
```

## Usage Example

```tsx
function CommandPaletteContainer({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const searchState = useCommandSearch(query);
  const { recentObjects } = useRecentObjects(10);

  // Flatten all items for keyboard navigation
  const allItems = useMemo(
    () => [
      ...recentObjects.map((o) => ({ type: 'recent', data: o })),
      ...searchState.commands.map((c) => ({ type: 'search', data: c })),
    ],
    [recentObjects, searchState.commands]
  );

  const { selectedIndex, setSelectedIndex } = useCommandPaletteKeyboard({
    itemCount: allItems.length,
    onSelect: (index) => handleSelect(allItems[index]),
    onEscape: onClose,
    enabled: isOpen,
  });

  return (
    <CommandPalette open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandPaletteInput
        value={query}
        onValueChange={setQuery}
        placeholder="Search or create..."
      />
      <CommandPaletteList>
        {searchState.status === 'loading' && <CommandPaletteLoading />}

        {searchState.status === 'success' && allItems.length === 0 && (
          <CommandPaletteEmpty>No results found</CommandPaletteEmpty>
        )}

        {recentObjects.length > 0 && !query && (
          <CommandPaletteGroup heading="Recent">
            {recentObjects.map((obj, i) => (
              <CommandPaletteItem
                key={obj.id}
                selected={selectedIndex === i}
                onSelect={() => handleSelect({ type: 'recent', data: obj })}
              >
                <Clock className="h-4 w-4" />
                <span className="flex-1">{obj.title}</span>
                <TypeBadge>{obj.typeKey}</TypeBadge>
              </CommandPaletteItem>
            ))}
          </CommandPaletteGroup>
        )}

        {/* More groups... */}
      </CommandPaletteList>
    </CommandPalette>
  );
}
```

## Migration Strategy

### Phase 1: Build in Design System

1. Enhance `CommandPalette` with compound components (Group, Empty, Loading, Separator)
2. Implement `useCommandPaletteKeyboard` hook
3. Create comprehensive Ladle stories for all states
4. Ensure visual parity with existing desktop implementation

### Phase 2: Migrate Desktop App

1. Update `apps/desktop/src/renderer/components/CommandPalette/index.tsx` to use design-system components
2. Keep existing hooks (`useCommandSearch`, `useRecentObjects`, `useCommandActions`)
3. Delete `apps/desktop/src/renderer/components/ui/command.tsx`
4. Remove `cmdk` from desktop app dependencies

## Files Changed

### Design System (create/modify)

| File                                                                                | Action            |
| ----------------------------------------------------------------------------------- | ----------------- |
| `packages/design-system/src/components/CommandPalette/CommandPalette.tsx`           | Simplify to shell |
| `packages/design-system/src/components/CommandPalette/CommandPaletteGroup.tsx`      | Create            |
| `packages/design-system/src/components/CommandPalette/CommandPaletteEmpty.tsx`      | Create            |
| `packages/design-system/src/components/CommandPalette/CommandPaletteLoading.tsx`    | Create            |
| `packages/design-system/src/components/CommandPalette/CommandPaletteSeparator.tsx`  | Create            |
| `packages/design-system/src/components/CommandPalette/useCommandPaletteKeyboard.ts` | Create            |
| `packages/design-system/src/components/CommandPalette/types.ts`                     | Update            |
| `packages/design-system/src/components/CommandPalette/index.ts`                     | Update exports    |
| `packages/design-system/src/components/CommandPalette/CommandPalette.stories.tsx`   | Expand            |

### Desktop App (modify/delete)

| File                                                            | Action      |
| --------------------------------------------------------------- | ----------- |
| `apps/desktop/src/renderer/components/CommandPalette/index.tsx` | Refactor    |
| `apps/desktop/src/renderer/components/ui/command.tsx`           | Delete      |
| `apps/desktop/package.json`                                     | Remove cmdk |

## Non-Goals

- No built-in filtering (consumer-controlled)
- No animation library (CSS transitions only)
- No virtualization (reasonable item counts expected)

## Success Criteria

1. All current desktop app functionality preserved
2. E2E tests pass without modification
3. Visual design matches current implementation
4. `cmdk` dependency removed
5. Component works in Ladle sandbox with all stories
