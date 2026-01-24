# AppShell Renderer Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the design-system AppShell and Sidebar to the desktop renderer, enabling navigation between objects and types with real data.

**Architecture:** Replace placeholder RootLayout with design-system AppShell. Create data-fetching hooks (tested with mocked IPC) that feed the Sidebar with real type counts and pinned objects. Use React Router for navigation.

**Tech Stack:** TanStack Query, React Router (HashRouter), design-system components, Vitest with mocked IPC

---

## Task 1: Set Up Renderer Test Infrastructure

**Files:**

- Create: `apps/desktop/src/renderer/hooks/__tests__/test-utils.tsx`
- Create: `apps/desktop/src/renderer/hooks/__tests__/useTypeCounts.test.ts`

**Step 1: Write test utilities with mocked IPC**

```typescript
// apps/desktop/src/renderer/hooks/__tests__/test-utils.tsx
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, type RenderHookOptions } from '@testing-library/react';

/**
 * Creates a fresh QueryClient for testing with no retries.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
}

/**
 * Wrapper that provides QueryClient context.
 */
export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

/**
 * Renders a hook with QueryClient context.
 */
export function renderHookWithClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) {
  return renderHook(hook, { wrapper: createWrapper(), ...options });
}

/**
 * Creates a mock typenoteAPI that returns success outcomes.
 */
export function createMockTypenoteAPI(overrides: Partial<typeof window.typenoteAPI> = {}) {
  const defaultAPI: Partial<typeof window.typenoteAPI> = {
    version: '1.0.0-test',
    listObjectTypes: async () => ({
      success: true as const,
      result: [],
    }),
    listObjects: async () => ({
      success: true as const,
      result: [],
    }),
    getPinnedObjects: async () => ({
      success: true as const,
      result: [],
    }),
    getDocument: async () => ({
      success: true as const,
      result: { object: null, document: null },
    }),
  };

  return { ...defaultAPI, ...overrides } as typeof window.typenoteAPI;
}

/**
 * Sets up window.typenoteAPI mock for testing.
 * Returns cleanup function.
 */
export function setupMockAPI(api: typeof window.typenoteAPI) {
  const original = window.typenoteAPI;
  window.typenoteAPI = api;
  return () => {
    window.typenoteAPI = original;
  };
}
```

**Step 2: Write failing test for useTypeCounts**

```typescript
// apps/desktop/src/renderer/hooks/__tests__/useTypeCounts.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useTypeCounts } from '../useTypeCounts.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('useTypeCounts', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: async () => ({
          success: true,
          result: [
            { id: '1', key: 'page', name: 'Page', icon: 'File', color: '#6495ED', builtIn: true },
            {
              id: '2',
              key: 'person',
              name: 'Person',
              icon: 'User',
              color: '#32CD32',
              builtIn: false,
            },
          ],
        }),
        listObjects: async (options) => ({
          success: true,
          result:
            options?.typeKey === 'page'
              ? [{ id: 'obj1', title: 'Test Page', typeKey: 'page' }]
              : [],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns type counts from IPC', async () => {
    const { result } = renderHookWithClient(() => useTypeCounts());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      { typeKey: 'page', typeName: 'Page', typeIcon: 'File', typeColor: '#6495ED', count: 1 },
      { typeKey: 'person', typeName: 'Person', typeIcon: 'User', typeColor: '#32CD32', count: 0 },
    ]);
  });

  it('starts in loading state', () => {
    const { result } = renderHookWithClient(() => useTypeCounts());
    expect(result.current.isLoading).toBe(true);
  });
});
```

**Step 3: Run test to verify infrastructure works**

Run: `pnpm --filter @typenote/desktop test -- src/renderer/hooks/__tests__/useTypeCounts.test.ts`
Expected: PASS (useTypeCounts already exists)

**Step 4: Commit test infrastructure**

```bash
git add apps/desktop/src/renderer/hooks/__tests__/
git commit -m "$(cat <<'EOF'
test(renderer): add hook testing utilities with mocked IPC

- createMockTypenoteAPI for stubbing IPC responses
- renderHookWithClient for TanStack Query context
- First test for existing useTypeCounts hook
EOF
)"
```

---

## Task 2: Create usePinnedObjects Hook

**Files:**

- Create: `apps/desktop/src/renderer/hooks/__tests__/usePinnedObjects.test.ts`
- Create: `apps/desktop/src/renderer/hooks/usePinnedObjects.ts`
- Modify: `apps/desktop/src/renderer/hooks/index.ts`
- Modify: `apps/desktop/src/renderer/lib/queryKeys.ts`

**Step 1: Write failing test**

```typescript
// apps/desktop/src/renderer/hooks/__tests__/usePinnedObjects.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { usePinnedObjects } from '../usePinnedObjects.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('usePinnedObjects', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getPinnedObjects: async () => ({
          success: true,
          result: [
            {
              id: 'pin1',
              objectId: 'obj1',
              title: 'My Pinned Page',
              typeKey: 'page',
              typeIcon: 'File',
              typeColor: '#6495ED',
              pinnedAt: '2026-01-23T10:00:00Z',
            },
            {
              id: 'pin2',
              objectId: 'obj2',
              title: 'Important Note',
              typeKey: 'daily-note',
              typeIcon: 'Calendar',
              typeColor: null,
              pinnedAt: '2026-01-22T10:00:00Z',
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns pinned objects from IPC', async () => {
    const { result } = renderHookWithClient(() => usePinnedObjects());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      objectId: 'obj1',
      title: 'My Pinned Page',
      typeKey: 'page',
    });
  });

  it('returns empty array when no pinned objects', async () => {
    cleanup();
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getPinnedObjects: async () => ({
          success: true,
          result: [],
        }),
      })
    );

    const { result } = renderHookWithClient(() => usePinnedObjects());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @typenote/desktop test -- src/renderer/hooks/__tests__/usePinnedObjects.test.ts`
Expected: FAIL with "usePinnedObjects is not exported"

**Step 3: Write minimal implementation**

```typescript
// apps/desktop/src/renderer/hooks/usePinnedObjects.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';

/**
 * Hook to fetch pinned objects for sidebar favorites section.
 */
export function usePinnedObjects() {
  return useQuery({
    queryKey: queryKeys.pinnedObjects(),
    queryFn: ipcQuery(() => window.typenoteAPI.getPinnedObjects()),
    staleTime: 30 * 1000,
  });
}
```

**Step 4: Export from hooks index**

Add to `apps/desktop/src/renderer/hooks/index.ts`:

```typescript
export { usePinnedObjects } from './usePinnedObjects.js';
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @typenote/desktop test -- src/renderer/hooks/__tests__/usePinnedObjects.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/desktop/src/renderer/hooks/usePinnedObjects.ts apps/desktop/src/renderer/hooks/__tests__/usePinnedObjects.test.ts apps/desktop/src/renderer/hooks/index.ts
git commit -m "$(cat <<'EOF'
feat(renderer): add usePinnedObjects hook

TDD: Fetches pinned objects via IPC for sidebar favorites section.
Uses TanStack Query with 30s stale time.
EOF
)"
```

---

## Task 3: Create useSidebarData Composite Hook

**Files:**

- Create: `apps/desktop/src/renderer/hooks/__tests__/useSidebarData.test.ts`
- Create: `apps/desktop/src/renderer/hooks/useSidebarData.ts`
- Modify: `apps/desktop/src/renderer/hooks/index.ts`

**Step 1: Write failing test**

```typescript
// apps/desktop/src/renderer/hooks/__tests__/useSidebarData.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useSidebarData } from '../useSidebarData.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('useSidebarData', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: async () => ({
          success: true,
          result: [
            { id: '1', key: 'page', name: 'Page', icon: 'File', color: '#6495ED', builtIn: true },
          ],
        }),
        listObjects: async () => ({
          success: true,
          result: [{ id: 'obj1', title: 'Test', typeKey: 'page' }],
        }),
        getPinnedObjects: async () => ({
          success: true,
          result: [
            {
              id: 'pin1',
              objectId: 'obj1',
              title: 'Pinned',
              typeKey: 'page',
              typeIcon: 'File',
              typeColor: '#6495ED',
              pinnedAt: '2026-01-23',
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('combines type counts and pinned objects', async () => {
    const { result } = renderHookWithClient(() => useSidebarData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeCounts).toHaveLength(1);
    expect(result.current.pinnedObjects).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('reports loading when either query is loading', () => {
    const { result } = renderHookWithClient(() => useSidebarData());
    expect(result.current.isLoading).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @typenote/desktop test -- src/renderer/hooks/__tests__/useSidebarData.test.ts`
Expected: FAIL with "useSidebarData is not exported"

**Step 3: Write minimal implementation**

```typescript
// apps/desktop/src/renderer/hooks/useSidebarData.ts
import { useTypeCounts } from './useTypeCounts.js';
import { usePinnedObjects } from './usePinnedObjects.js';

/**
 * Composite hook that fetches all data needed for the sidebar.
 * Combines type counts and pinned objects into a single interface.
 */
export function useSidebarData() {
  const typeCountsQuery = useTypeCounts();
  const pinnedQuery = usePinnedObjects();

  return {
    typeCounts: typeCountsQuery.data ?? [],
    pinnedObjects: pinnedQuery.data ?? [],
    isLoading: typeCountsQuery.isLoading || pinnedQuery.isLoading,
    error: typeCountsQuery.error ?? pinnedQuery.error ?? null,
  };
}
```

**Step 4: Export from hooks index**

Add to `apps/desktop/src/renderer/hooks/index.ts`:

```typescript
export { useSidebarData } from './useSidebarData.js';
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @typenote/desktop test -- src/renderer/hooks/__tests__/useSidebarData.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add apps/desktop/src/renderer/hooks/useSidebarData.ts apps/desktop/src/renderer/hooks/__tests__/useSidebarData.test.ts apps/desktop/src/renderer/hooks/index.ts
git commit -m "$(cat <<'EOF'
feat(renderer): add useSidebarData composite hook

Combines useTypeCounts and usePinnedObjects into single interface
for sidebar data consumption. Reports loading when either is pending.
EOF
)"
```

---

## Task 4: Wire AppShell to RootLayout

**Files:**

- Modify: `apps/desktop/src/renderer/layouts/RootLayout.tsx`

**Step 1: Write the implementation (no separate test - E2E will cover)**

Replace `apps/desktop/src/renderer/layouts/RootLayout.tsx`:

```typescript
// apps/desktop/src/renderer/layouts/RootLayout.tsx
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppShell,
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarItem,
  SidebarFooter,
} from '@typenote/design-system';
import {
  File,
  Calendar,
  Gear,
  PushPin,
  Trash,
} from '@phosphor-icons/react';
import { useSidebarData } from '../hooks/useSidebarData.js';
import { useState } from 'react';

/** Map type keys to Phosphor icons */
function getTypeIcon(iconName: string | null): typeof File {
  // For now, use File as default. Can expand icon mapping later.
  return File;
}

export function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { objectId, typeKey } = useParams();
  const { typeCounts, pinnedObjects, isLoading } = useSidebarData();
  const [collapsed, setCollapsed] = useState(false);

  // Determine which route is active
  const isCalendarActive = location.pathname === '/calendar';
  const activeTypeKey = typeKey ?? (location.pathname.startsWith('/notes') ? 'page' : null);

  const handleNewClick = () => {
    // TODO: Open command palette or create new page
    console.log('New clicked');
  };

  const handleSearchClick = () => {
    // TODO: Open command palette
    console.log('Search clicked');
  };

  return (
    <AppShell
      sidebar={
        <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
          <SidebarHeader
            onNewClick={handleNewClick}
            newLabel="New"
            onSearchClick={handleSearchClick}
            searchShortcut="⌘K"
          />

          {/* Pinned Objects */}
          {pinnedObjects.length > 0 && (
            <SidebarSection label="Favorites">
              {pinnedObjects.map((pinned) => (
                <SidebarItem
                  key={pinned.objectId}
                  icon={PushPin}
                  label={pinned.title}
                  iconColor={pinned.typeColor ?? undefined}
                  active={objectId === pinned.objectId}
                  onClick={() => navigate(`/notes/${pinned.objectId}`)}
                />
              ))}
            </SidebarSection>
          )}

          {/* Object Types */}
          <SidebarSection label="Types">
            {isLoading ? (
              <div className="px-2 py-1 text-xs text-muted-foreground">Loading...</div>
            ) : (
              typeCounts.map((type) => (
                <SidebarItem
                  key={type.typeKey}
                  icon={getTypeIcon(type.typeIcon)}
                  label={type.typeName}
                  count={type.count}
                  iconColor={type.typeColor ?? undefined}
                  active={activeTypeKey === type.typeKey}
                  onClick={() => navigate(`/types/${type.typeKey}`)}
                />
              ))
            )}
          </SidebarSection>

          {/* Calendar */}
          <SidebarSection>
            <SidebarItem
              icon={Calendar}
              label="Calendar"
              active={isCalendarActive}
              onClick={() => navigate('/calendar')}
            />
          </SidebarSection>

          <SidebarFooter
            actions={[
              {
                icon: Trash,
                label: 'Trash',
                onClick: () => console.log('Trash clicked'),
              },
              {
                icon: Gear,
                label: 'Settings',
                onClick: () => console.log('Settings clicked'),
              },
            ]}
          />
        </Sidebar>
      }
    >
      <Outlet />
    </AppShell>
  );
}
```

**Step 2: Run typecheck to verify imports work**

Run: `pnpm --filter @typenote/desktop typecheck`
Expected: PASS

**Step 3: Run dev server to visually verify**

Run: `pnpm dev`
Expected: Sidebar renders with types and navigation works

**Step 4: Commit**

```bash
git add apps/desktop/src/renderer/layouts/RootLayout.tsx
git commit -m "$(cat <<'EOF'
feat(renderer): wire AppShell and Sidebar to RootLayout

- Import design-system AppShell, Sidebar, and related components
- Use useSidebarData hook for type counts and pinned objects
- Wire navigation via React Router useNavigate
- Add calendar and footer actions (settings/trash placeholders)
EOF
)"
```

---

## Task 5: Update NotesView with Document Placeholder

**Files:**

- Modify: `apps/desktop/src/renderer/routes/NotesView.tsx`

**Step 1: Write minimal implementation**

```typescript
// apps/desktop/src/renderer/routes/NotesView.tsx
import { useParams } from 'react-router-dom';
import { File } from '@phosphor-icons/react';

/**
 * Notes view - displays document editor or empty state.
 * Route: /#/notes and /#/notes/:objectId
 */
export function NotesView() {
  const { objectId } = useParams<{ objectId: string }>();

  if (!objectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <File className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p className="text-sm">Select a document from the sidebar</p>
          <p className="text-xs mt-1">or create a new one with ⌘N</p>
        </div>
      </div>
    );
  }

  // TODO: Replace with Editor component and useDocument hook
  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="text-lg font-semibold">Document: {objectId}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        Editor will be wired in next phase
      </p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/desktop/src/renderer/routes/NotesView.tsx
git commit -m "$(cat <<'EOF'
feat(renderer): add NotesView empty state and document placeholder

Shows helpful empty state when no document selected.
Document editing placeholder for next phase.
EOF
)"
```

---

## Task 6: Update TypesView with ObjectDataGrid Placeholder

**Files:**

- Modify: `apps/desktop/src/renderer/routes/TypesView.tsx`

**Step 1: Write minimal implementation**

```typescript
// apps/desktop/src/renderer/routes/TypesView.tsx
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';

/**
 * Types view - displays type browser (table of objects).
 * Route: /#/types/:typeKey
 */
export function TypesView() {
  const { typeKey } = useParams<{ typeKey: string }>();

  const { data: typeInfo } = useQuery({
    queryKey: queryKeys.type(typeKey ?? ''),
    queryFn: ipcQuery(() => window.typenoteAPI.getObjectTypeByKey(typeKey ?? '')),
    enabled: !!typeKey,
  });

  const { data: objects, isLoading } = useQuery({
    queryKey: queryKeys.objectsByType(typeKey ?? ''),
    queryFn: ipcQuery(() =>
      window.typenoteAPI.listObjects({ typeKey, includeProperties: true })
    ),
    enabled: !!typeKey,
  });

  if (!typeKey) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a type from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">{typeInfo?.name ?? typeKey}</h1>
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Loading...' : `${objects?.length ?? 0} objects`}
        </p>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading objects...</p>
        ) : objects && objects.length > 0 ? (
          <div className="text-sm text-muted-foreground">
            {/* TODO: Replace with ObjectDataGrid */}
            <p>ObjectDataGrid will be wired here</p>
            <ul className="mt-2 space-y-1">
              {objects.slice(0, 10).map((obj) => (
                <li key={obj.id} className="text-foreground">
                  {obj.title}
                </li>
              ))}
              {objects.length > 10 && (
                <li className="text-muted-foreground">
                  ... and {objects.length - 10} more
                </li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No objects of this type yet</p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/desktop/src/renderer/routes/TypesView.tsx
git commit -m "$(cat <<'EOF'
feat(renderer): add TypesView with object listing

- Fetches type info and objects via IPC
- Shows object count and basic list
- Placeholder for ObjectDataGrid integration
EOF
)"
```

---

## Task 7: Run Full Verification

**Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS

**Step 2: Run all tests**

Run: `pnpm test`
Expected: PASS

**Step 3: Run linter**

Run: `pnpm lint`
Expected: PASS (or minor warnings)

**Step 4: Manual verification**

Run: `pnpm dev`
Verify:

- [ ] Sidebar shows types with counts
- [ ] Clicking a type navigates to TypesView
- [ ] TypesView shows objects for that type
- [ ] NotesView shows empty state when no document selected
- [ ] Calendar link in sidebar works
- [ ] Sidebar collapses correctly

**Step 5: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: lint fixes"
```

---

## Summary

| Task | Files                                 | Purpose                    |
| ---- | ------------------------------------- | -------------------------- |
| 1    | test-utils.tsx, useTypeCounts.test.ts | Test infrastructure        |
| 2    | usePinnedObjects.ts + test            | Fetch pinned objects       |
| 3    | useSidebarData.ts + test              | Composite hook for sidebar |
| 4    | RootLayout.tsx                        | Wire AppShell + Sidebar    |
| 5    | NotesView.tsx                         | Empty state + placeholder  |
| 6    | TypesView.tsx                         | Object listing placeholder |
| 7    | -                                     | Full verification          |

**Total commits:** 7
**Estimated time:** 45-60 minutes with TDD discipline
