# Daily Note Calendar Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate MiniCalendar + NotesCreatedList as a 2-column layout within Daily Note views, removing the calendar from the left sidebar.

**Architecture:** Extend `listObjects` with `createdOnDate` filter, create `DailyNoteLayout` component in desktop app that conditionally renders when viewing a DailyNote, hide right sidebar for Daily Notes.

**Tech Stack:** TypeScript, React, Drizzle ORM, Electron IPC

---

## Task 1: Extend listObjects with createdOnDate Filter

**Files:**

- Modify: `packages/storage/src/objectService.ts:23-28` (ListObjectsOptions interface)
- Modify: `packages/storage/src/objectService.ts:104-150` (listObjects function)
- Test: `packages/storage/src/objectService.test.ts`

**Step 1: Write the failing test**

Add to `packages/storage/src/objectService.test.ts`:

```typescript
describe('listObjects with createdOnDate', () => {
  it('filters objects by creation date', () => {
    // Create objects on different dates
    const jan15 = new Date('2026-01-15T10:00:00Z');
    const jan16 = new Date('2026-01-16T14:00:00Z');

    // Insert test objects with specific createdAt timestamps
    db.run(sql`UPDATE objects SET created_at = ${jan15.getTime()} WHERE id = ${obj1.id}`);
    db.run(sql`UPDATE objects SET created_at = ${jan16.getTime()} WHERE id = ${obj2.id}`);

    const result = listObjects(db, { createdOnDate: '2026-01-15' });

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe(obj1.id);
  });

  it('returns empty array when no objects match date', () => {
    const result = listObjects(db, { createdOnDate: '2020-01-01' });
    expect(result).toHaveLength(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @typenote/storage test -- --grep "createdOnDate"`
Expected: FAIL - `createdOnDate` option not recognized

**Step 3: Extend ListObjectsOptions interface**

In `packages/storage/src/objectService.ts` around line 23:

```typescript
export interface ListObjectsOptions {
  /** Filter by object type key (e.g., 'Page', 'Task') */
  typeKey?: string;
  /** Include properties in the response (for TypeBrowser table) */
  includeProperties?: boolean;
  /** Filter objects created on this date (YYYY-MM-DD format) */
  createdOnDate?: string;
}
```

**Step 4: Implement createdOnDate filter in listObjects**

In `packages/storage/src/objectService.ts`, modify the listObjects function to add date filtering:

```typescript
export function listObjects(
  db: TypenoteDb,
  options?: ListObjectsOptions
): ObjectSummary[] | ObjectSummaryWithProperties[] {
  const { typeKey, includeProperties, createdOnDate } = options ?? {};

  // ... existing selectFields setup ...

  // Build conditions array
  const conditions = [isNull(objects.deletedAt)];

  if (typeKey !== undefined) {
    conditions.push(eq(objectTypes.key, typeKey));
  }

  // Add createdOnDate filter if provided
  if (createdOnDate !== undefined) {
    const [year, month, day] = createdOnDate.split('-').map(Number);
    if (year && month && day) {
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      conditions.push(gte(objects.createdAt, startOfDay));
      conditions.push(lte(objects.createdAt, endOfDay));
    }
  }

  const rows = db
    .select(selectFields)
    .from(objects)
    .innerJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(and(...conditions))
    .orderBy(desc(objects.updatedAt))
    .all();

  // ... rest of function ...
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @typenote/storage test -- --grep "createdOnDate"`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/storage/src/objectService.ts packages/storage/src/objectService.test.ts
git commit -m "feat(storage): add createdOnDate filter to listObjects"
```

---

## Task 2: Add getObjectsCreatedOnDate IPC Handler

**Files:**

- Modify: `apps/desktop/src/main/ipc.ts:580-598` (add new handler)
- Modify: `apps/desktop/src/preload/index.ts` (expose to renderer)
- Modify: `apps/desktop/src/renderer/global.d.ts` (add type)

**Step 1: Add handler to createIpcHandlers**

In `apps/desktop/src/main/ipc.ts`, add to the handlers object (around line 580):

```typescript
getObjectsCreatedOnDate: (dateKey: string) =>
  handleIpcCall(() => {
    const summaries = listObjects(db, { createdOnDate: dateKey });

    // Get object types for icon/color info
    const objectTypesMap = new Map<string, { icon: string | null; color: string | null }>();

    return summaries.map((obj) => {
      // Get type info (cached)
      if (!objectTypesMap.has(obj.typeKey)) {
        const typeInfo = getObjectTypeByKey(db, obj.typeKey);
        objectTypesMap.set(obj.typeKey, {
          icon: typeInfo?.icon ?? null,
          color: typeInfo?.color ?? null,
        });
      }
      const typeInfo = objectTypesMap.get(obj.typeKey);

      return {
        id: obj.id,
        title: obj.title,
        typeIcon: typeInfo?.icon ?? null,
        typeColor: typeInfo?.color ?? null,
      };
    });
  }),
```

**Step 2: Expose in preload**

In `apps/desktop/src/preload/index.ts`, add:

```typescript
getObjectsCreatedOnDate: (dateKey: string) =>
  ipcRenderer.invoke('typenote:getObjectsCreatedOnDate', dateKey),
```

**Step 3: Add TypeScript type**

In `apps/desktop/src/renderer/global.d.ts`, add to TypenoteAPI interface:

```typescript
getObjectsCreatedOnDate: (dateKey: string) =>
  Promise<
    IpcOutcome<
      Array<{
        id: string;
        title: string;
        typeIcon: string | null;
        typeColor: string | null;
      }>
    >
  >;
```

**Step 4: Verify types compile**

Run: `pnpm typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/desktop/src/main/ipc.ts apps/desktop/src/preload/index.ts apps/desktop/src/renderer/global.d.ts
git commit -m "feat(desktop): add getObjectsCreatedOnDate IPC handler"
```

---

## Task 3: Create useObjectsCreatedOnDate Hook

**Files:**

- Create: `apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.ts`
- Create: `apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.test.ts`

**Step 1: Write the test**

Create `apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useObjectsCreatedOnDate } from './useObjectsCreatedOnDate.js';

const mockGetObjectsCreatedOnDate = vi.fn();

beforeEach(() => {
  vi.stubGlobal('window', {
    typenoteAPI: {
      getObjectsCreatedOnDate: mockGetObjectsCreatedOnDate,
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('useObjectsCreatedOnDate', () => {
  it('fetches objects created on the specified date', async () => {
    const mockData = [{ id: '1', title: 'Note 1', typeIcon: 'FileText', typeColor: '#6495ED' }];
    mockGetObjectsCreatedOnDate.mockResolvedValue({ success: true, result: mockData });

    const { result } = renderHook(() => useObjectsCreatedOnDate('2026-01-15'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toEqual(mockData);
    expect(mockGetObjectsCreatedOnDate).toHaveBeenCalledWith('2026-01-15');
  });

  it('refetches when dateKey changes', async () => {
    mockGetObjectsCreatedOnDate.mockResolvedValue({ success: true, result: [] });

    const { result, rerender } = renderHook(({ dateKey }) => useObjectsCreatedOnDate(dateKey), {
      initialProps: { dateKey: '2026-01-15' },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetObjectsCreatedOnDate).toHaveBeenCalledTimes(1);

    rerender({ dateKey: '2026-01-16' });

    await waitFor(() => expect(mockGetObjectsCreatedOnDate).toHaveBeenCalledTimes(2));
    expect(mockGetObjectsCreatedOnDate).toHaveBeenLastCalledWith('2026-01-16');
  });

  it('returns empty array on error', async () => {
    mockGetObjectsCreatedOnDate.mockResolvedValue({
      success: false,
      error: { code: 'ERROR', message: 'Failed' },
    });

    const { result } = renderHook(() => useObjectsCreatedOnDate('2026-01-15'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.objects).toEqual([]);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @typenote/desktop test -- --grep "useObjectsCreatedOnDate"`
Expected: FAIL - module not found

**Step 3: Implement the hook**

Create `apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.ts`:

```typescript
import { useState, useEffect } from 'react';
import type { NotesCreatedItem } from '@typenote/design-system';

interface UseObjectsCreatedOnDateResult {
  objects: NotesCreatedItem[];
  isLoading: boolean;
}

export function useObjectsCreatedOnDate(dateKey: string): UseObjectsCreatedOnDateResult {
  const [objects, setObjects] = useState<NotesCreatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    window.typenoteAPI
      .getObjectsCreatedOnDate(dateKey)
      .then((result) => {
        if (result.success) {
          setObjects(result.result);
        } else {
          setObjects([]);
        }
      })
      .catch(() => {
        setObjects([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dateKey]);

  return { objects, isLoading };
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @typenote/desktop test -- --grep "useObjectsCreatedOnDate"`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.ts apps/desktop/src/renderer/hooks/useObjectsCreatedOnDate.test.ts
git commit -m "feat(desktop): add useObjectsCreatedOnDate hook"
```

---

## Task 4: Create DailyNoteLayout Component

**Files:**

- Create: `apps/desktop/src/renderer/components/DailyNoteLayout.tsx`

**Step 1: Create the component**

Create `apps/desktop/src/renderer/components/DailyNoteLayout.tsx`:

```typescript
import { useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { MiniCalendar, NotesCreatedList } from '@typenote/design-system';
import { useDatesWithNotes } from '../hooks/useDatesWithNotes.js';
import { useObjectsCreatedOnDate } from '../hooks/useObjectsCreatedOnDate.js';

interface DailyNoteLayoutProps {
  /** The date key for this daily note (YYYY-MM-DD) */
  dateKey: string;
  /** Called when user clicks a date in the calendar */
  onNavigateToDate: (dateKey: string) => void;
  /** Called when user clicks an object in the created list */
  onNavigateToObject: (objectId: string) => void;
  /** The main editor content */
  children: ReactElement;
}

/**
 * 2-column layout for Daily Note views.
 * Left column: Editor content
 * Right column: MiniCalendar + NotesCreatedList
 */
export function DailyNoteLayout({
  dateKey,
  onNavigateToDate,
  onNavigateToObject,
  children,
}: DailyNoteLayoutProps): ReactElement {
  const { datesWithNotes, fetchForMonth } = useDatesWithNotes();
  const { objects: createdObjects, isLoading: isLoadingCreated } = useObjectsCreatedOnDate(dateKey);

  // Handle month change in calendar
  const handleMonthChange = useCallback(
    (year: number, month: number) => {
      void fetchForMonth(year, month);
    },
    [fetchForMonth]
  );

  // Fetch dates for the month of the current daily note on mount
  useEffect(() => {
    const [year, month] = dateKey.split('-').map(Number);
    if (year && month) {
      void fetchForMonth(year, month - 1); // month is 0-indexed
    }
  }, [dateKey, fetchForMonth]);

  return (
    <div className="flex h-full">
      {/* Left column: Editor content */}
      <div className="flex-1 overflow-y-auto">{children}</div>

      {/* Right column: Calendar panel */}
      <div className="w-60 flex-shrink-0 border-l border-gray-200 bg-gray-50/50 p-4 overflow-y-auto">
        <MiniCalendar
          selectedDate={dateKey}
          datesWithNotes={datesWithNotes}
          onDateSelect={onNavigateToDate}
          onMonthChange={handleMonthChange}
          className="mb-6"
        />

        <NotesCreatedList
          date={dateKey}
          items={createdObjects}
          isLoading={isLoadingCreated}
          onItemClick={onNavigateToObject}
        />
      </div>
    </div>
  );
}
```

**Step 2: Verify types compile**

Run: `pnpm typecheck`
Expected: PASS

**Step 3: Commit**

```bash
git add apps/desktop/src/renderer/components/DailyNoteLayout.tsx
git commit -m "feat(desktop): add DailyNoteLayout component"
```

---

## Task 5: Remove MiniCalendar from LeftSidebar

**Files:**

- Modify: `apps/desktop/src/renderer/components/LeftSidebar.tsx`

**Step 1: Remove calendar imports and state**

In `apps/desktop/src/renderer/components/LeftSidebar.tsx`:

1. Remove `MiniCalendar` from imports
2. Remove `useDatesWithNotes` import and hook usage
3. Remove `selectedDate` state
4. Remove `handleDateSelect` and `handleMonthChange` callbacks
5. Remove the `useEffect` that fetches dates on mount
6. Remove the JSX block rendering MiniCalendar (lines 106-117)
7. Remove `onNavigateToDailyNote` from props (no longer needed here)

The updated component will only have: search trigger, "Today's Note" button, types section, pinned section, settings.

**Step 2: Update LeftSidebarProps interface**

Remove `onNavigateToDailyNote` from props interface since it's no longer used here.

**Step 3: Verify types compile**

Run: `pnpm typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add apps/desktop/src/renderer/components/LeftSidebar.tsx
git commit -m "refactor(desktop): remove MiniCalendar from LeftSidebar"
```

---

## Task 6: Integrate DailyNoteLayout in App.tsx

**Files:**

- Modify: `apps/desktop/src/renderer/App.tsx`

**Step 1: Import DailyNoteLayout**

```typescript
import { DailyNoteLayout } from './components/DailyNoteLayout.js';
```

**Step 2: Update right sidebar logic**

Change line 78 from:

```typescript
const showRightSidebar = viewMode === 'notes' && selectedObjectId !== null;
```

To:

```typescript
const isDailyNote = selectedObject?.typeKey === 'DailyNote';
const showRightSidebar = viewMode === 'notes' && selectedObjectId !== null && !isDailyNote;
```

**Step 3: Update content area rendering**

Change the content rendering (around line 132) to wrap Daily Notes in DailyNoteLayout:

```typescript
{viewMode === 'calendar' ? (
  <CalendarView onNavigate={(id) => { setSelectedObjectId(id); setViewMode('notes'); }} />
) : viewMode === 'type' && selectedTypeKey ? (
  <TypeBrowserView typeKey={selectedTypeKey} onOpenObject={handleOpenObjectFromTypeBrowser} />
) : selectedObjectId && isDailyNote ? (
  <DailyNoteLayout
    dateKey={selectedObject?.properties?.dateKey as string ?? ''}
    onNavigateToDate={(dateKey) => void handleNavigateToDailyNote(dateKey)}
    onNavigateToObject={setSelectedObjectId}
  >
    <DocumentEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
  </DailyNoteLayout>
) : selectedObjectId ? (
  <DocumentEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
) : (
  <div className="flex items-center justify-center h-full text-muted-foreground">
    Select an object to view
  </div>
)}
```

**Step 4: Remove onNavigateToDailyNote prop from LeftSidebar**

Since calendar is no longer in LeftSidebar, remove that prop.

**Step 5: Verify types compile**

Run: `pnpm typecheck`
Expected: PASS

**Step 6: Manual test**

1. Start the app: `pnpm --filter @typenote/desktop dev`
2. Create/open a Daily Note
3. Verify: Calendar panel appears on right side of editor
4. Verify: Regular notes do NOT show calendar panel
5. Verify: Left sidebar no longer has calendar

**Step 7: Commit**

```bash
git add apps/desktop/src/renderer/App.tsx
git commit -m "feat(desktop): integrate DailyNoteLayout for daily notes"
```

---

## Task 7: Get dateKey from Daily Note Object

**Files:**

- Modify: `apps/desktop/src/renderer/hooks/useSelectedObject.ts` (if needed)
- Check: Daily note object structure for dateKey property

**Step 1: Verify Daily Note has dateKey in properties**

Check how Daily Notes store their date. The `dateKey` should be in the object's properties. If not directly available, we may need to derive it from the title or add it.

Run: `pnpm --filter @typenote/cli dev list --type DailyNote` to inspect structure.

**Step 2: Update App.tsx if needed**

If `dateKey` is stored differently, adjust the `DailyNoteLayout` prop accordingly.

**Step 3: Commit if changes made**

```bash
git add apps/desktop/src/renderer/App.tsx
git commit -m "fix(desktop): correctly extract dateKey from Daily Note"
```

---

## Task 8: Update Migration Checklist

**Files:**

- Modify: `docs/design-system-migration.md`

**Step 1: Mark NotesCreatedList as migrated**

Update the checklist to mark NotesCreatedList as complete.

**Step 2: Update summary counts**

Increment migrated count, update percentages.

**Step 3: Commit**

```bash
git add docs/design-system-migration.md
git commit -m "docs: mark NotesCreatedList as migrated"
```

---

## Task 9: Cleanup and Final Verification

**Step 1: Run full test suite**

```bash
pnpm test
pnpm typecheck
pnpm lint
```

**Step 2: Manual end-to-end test**

1. Open Daily Note → Calendar panel visible on right
2. Click different date → Navigates to that Daily Note
3. Click item in "Created" list → Navigates to that object
4. Open regular Note → Properties/Tags sidebar visible (no calendar)
5. Left sidebar → No calendar, just types/pinned/settings

**Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address review feedback"
```

---

## Summary

| Task | Description                           | Estimated Time |
| ---- | ------------------------------------- | -------------- |
| 1    | Extend listObjects with createdOnDate | 10 min         |
| 2    | Add IPC handler                       | 5 min          |
| 3    | Create useObjectsCreatedOnDate hook   | 10 min         |
| 4    | Create DailyNoteLayout component      | 10 min         |
| 5    | Remove calendar from LeftSidebar      | 5 min          |
| 6    | Integrate in App.tsx                  | 10 min         |
| 7    | Verify dateKey handling               | 5 min          |
| 8    | Update migration checklist            | 2 min          |
| 9    | Final verification                    | 5 min          |

**Total estimated time:** ~60 minutes
