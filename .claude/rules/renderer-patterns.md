---
paths: apps/desktop/src/renderer/**/*.ts, apps/desktop/src/renderer/**/*.tsx
---

# Renderer Patterns

Rules for `apps/desktop/src/renderer/` to prevent architectural debt.

## Data Fetching

**Use TanStack Query for all IPC data fetching. Never use raw useState/useEffect.**

### Required Pattern

```typescript
// DO: TanStack Query
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';

export function useExample(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.example(id),
    queryFn: ipcQuery(() => window.typenoteAPI.getExample(id)),
  });

  return { data, isLoading, error: error ? String(error) : null };
}
```

### Anti-Pattern

```typescript
// DON'T: Manual fetch with useState/useEffect
export function useExample(id: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.typenoteAPI.getExample(id).then((result) => {
      if (result.success) setData(result.result);
      setIsLoading(false);
    });
  }, [id]);

  return { data, isLoading };
}
```

### Why This Matters

- **Caching:** Query automatically caches results, preventing duplicate IPC calls
- **Deduplication:** Multiple components using the same query share one request
- **Invalidation:** Mutations can invalidate queries automatically
- **DevTools:** Query DevTools show cache state for debugging

### Query Keys

All query keys must be defined in `lib/queryKeys.ts`:

```typescript
export const queryKeys = {
  object: (id: string) => ['object', id] as const,
  objects: () => ['objects'] as const,
  // ... add new keys here
} as const;
```

---

## Navigation

**Use React Router for all navigation. Never use component state for "current view."**

### Required Pattern

```typescript
// DO: React Router
import { useNavigate, useParams } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  const { objectId } = useParams();

  const handleClick = () => navigate(`/notes/${objectId}`);
}
```

### Anti-Pattern

```typescript
// DON'T: State-based navigation
const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
const [viewMode, setViewMode] = useState<'notes' | 'calendar'>('notes');

// This breaks browser back/forward and makes deep linking impossible
```

### Route Structure

```
/#/notes              → Notes view (empty state)
/#/notes/:objectId    → Document editor
/#/types/:typeKey     → Type browser
/#/calendar           → Calendar view
```

### Why HashRouter?

Electron loads via `file://` protocol which doesn't support HTML5 history API. **Always use `createHashRouter`, never `createBrowserRouter`.**

---

## Shared Code (DRY)

**Before creating utilities, types, or constants, check if they already exist.**

### Check First

| Creating...        | Check Here First                         |
| ------------------ | ---------------------------------------- |
| Utility functions  | `@typenote/design-system` (e.g., `cn()`) |
| TypeScript types   | `renderer/types/` folder                 |
| Constants/mappings | `renderer/config/` folder                |
| Data hooks         | Existing hooks in `renderer/hooks/`      |

### Shared Locations

```
renderer/
├── types/          # Shared TypeScript types (AsyncData, etc.)
│   └── index.ts    # Barrel export
├── config/         # Constants and mappings
│   └── index.ts    # Barrel export
├── lib/            # Utilities (queryClient, queryKeys, etc.)
└── hooks/          # Data fetching hooks
```

### Anti-Pattern: Local Duplicates

```typescript
// DON'T: Create local type that exists elsewhere
type LoadState = { status: 'loading' } | { status: 'loaded'; data: T };

// DO: Import from shared location
import type { AsyncData } from '../types/index.js';
```

---

## Component Size

**Components over 150 lines should be reviewed for extraction.**

### Warning Signs

- Component has 10+ useState calls
- Component has 10+ props
- Multiple unrelated concerns in one file
- Difficult to test in isolation

### Solutions

| Problem             | Solution                                |
| ------------------- | --------------------------------------- |
| Many useState calls | Extract to custom hook or context       |
| Many props          | Use composition, context, or URL params |
| Multiple concerns   | Split into smaller components           |
| Hard to test        | Extract logic to hooks                  |

### Example: Props Drilling

```typescript
// DON'T: Pass navigation through 5 levels of props
<Sidebar onSelectObject={handleSelect} onSelectType={handleType} ... />

// DO: Use React Router - child components call useNavigate()
<Sidebar /> // Child uses useNavigate() directly
```

---

## Checklist Before Creating Files

- [ ] **Hook:** Does this fetch data? → Use TanStack Query
- [ ] **Type:** Does this type exist in `types/`? → Import it
- [ ] **Utility:** Does this exist in design-system? → Import it
- [ ] **Constant:** Does this belong in `config/`? → Put it there
- [ ] **Navigation:** Am I storing view state? → Use React Router instead
