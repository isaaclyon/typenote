# Recent Objects Tracking - Design Document

**Date:** 2026-01-10
**Status:** Approved
**Implementation:** TDD approach required

## Overview

Add a recently viewed objects tracking system that records the 100 most recently accessed objects and surfaces them in the command palette for quick navigation.

## Requirements

- Track last 100 viewed objects with LRU eviction
- Store in SQLite for persistence across sessions
- Surface in command palette (⌘K) for fast switching
- Update timestamp when same object viewed multiple times (no duplicates)
- Automatically exclude soft-deleted objects from results

## Architecture

### 1. Database Schema

**New table:** `recent_objects`

```sql
CREATE TABLE recent_objects (
  object_id TEXT PRIMARY KEY REFERENCES objects(id) ON DELETE CASCADE,
  viewed_at TEXT NOT NULL -- ISO 8601 timestamp
);

CREATE INDEX idx_recent_objects_viewed_at ON recent_objects(viewed_at DESC);
```

**Design decisions:**

- Primary key on `object_id` enforces one entry per object (LRU behavior)
- Foreign key with CASCADE auto-deletes history when object deleted
- Index on `viewed_at DESC` optimizes "get most recent" query
- No synthetic `id` column needed since `object_id` is unique identifier

**Cleanup strategy:**

- After each UPSERT, check row count
- If count > 100, delete oldest entries beyond limit
- Handled in application code (not SQLite trigger) for testability

### 2. Service Layer

**File:** `packages/storage/src/recentObjectsService.ts`

```typescript
export interface RecentObjectEntry {
  objectId: string;
  viewedAt: string; // ISO 8601
  title: string; // Joined from objects table
  typeName: string; // Joined from object_types
}

export class RecentObjectsService {
  async recordView(objectId: string): Promise<void>;
  async getRecentObjects(limit: number = 100): Promise<RecentObjectEntry[]>;
  async clear(): Promise<void>;
}
```

**Key behaviors:**

- `recordView`: UPSERT with timestamp update + auto-cleanup in transaction
- `getRecentObjects`: Join with objects/types tables, filter soft-deleted, order by recency
- `clear`: Delete all entries (for testing and potential user feature)

**Testing coverage:**

- Record first view → entry created
- Record duplicate view → timestamp updated, no duplicate rows
- Record 101st view → oldest entry deleted automatically
- Get recent objects → returns joined data, ordered by recency
- Soft-deleted objects excluded from results

### 3. API Contracts

**File:** `packages/api/src/recentObjects.ts`

```typescript
// Zod schemas for validation
RecordObjectViewRequestSchema = z.object({
  objectId: z.string().length(26), // ULID
});

GetRecentObjectsRequestSchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(100),
});

RecentObjectEntrySchema = z.object({
  objectId: z.string(),
  viewedAt: z.string(),
  title: z.string(),
  typeName: z.string(),
});

GetRecentObjectsResponseSchema = z.object({
  objects: z.array(RecentObjectEntrySchema),
});
```

### 4. IPC Layer

**Handlers:** `apps/desktop/src/main/ipc.ts`

- `recent-objects:record-view` → `recordView(objectId)`
- `recent-objects:get-recent` → `getRecentObjects(limit?)`
- `recent-objects:clear` → `clear()`

**Preload API:** `apps/desktop/src/preload/index.ts`

```typescript
recentObjects: {
  recordView: (objectId: string) => Promise<{ success: boolean }>;
  getRecent: (limit?: number) => Promise<GetRecentObjectsResponse>;
  clear: () => Promise<{ success: boolean }>;
}
```

### 5. UI Integration

**View tracking:** Hook into object navigation handler (likely `App.tsx` or `ObjectList.tsx`)

```typescript
const handleOpenObject = async (objectId: string) => {
  await window.typenoteAPI.recentObjects.recordView(objectId);
  setCurrentObjectId(objectId); // existing logic
};
```

**Command Palette:** Integrate with existing `cmdk` implementation

- Load top 10 recent objects on palette mount
- Display in dedicated "Recent" group with type icons
- Show relative timestamps ("2 minutes ago", "yesterday")
- Make searchable within unified command palette search

**Display details:**

- Limit to top 10 in palette (full 100 would be overwhelming)
- Visual format: `[TypeIcon] Title [RelativeTime]`
- Clicking item opens object and records new view

## Implementation Phases (TDD)

1. **Phase 1: API Contracts** — Zod schemas in `packages/api`
2. **Phase 2: Database Migration** — Add `recent_objects` table
3. **Phase 3: Service Layer** — `RecentObjectsService` with full test coverage
4. **Phase 4: IPC Layer** — Handlers + preload API
5. **Phase 5: UI Integration** — Command palette display + view tracking
6. **Phase 6: CLI Commands** (optional) — `recent list`, `recent clear`

## Success Criteria

- ✅ 100 most recent objects persisted in SQLite
- ✅ Duplicate views update timestamp (LRU behavior)
- ✅ Automatic cleanup keeps table at max 100 entries
- ✅ Soft-deleted objects excluded from results
- ✅ Command palette shows top 10 recent objects
- ✅ Clicking recent object opens it and updates timestamp
- ✅ Full test coverage (unit + integration + IPC)

## Non-Goals (Deferred)

- Dedicated keyboard shortcut for recent objects (⌘R)
- Sidebar section for recent objects
- "Clear history" user command in palette
- Pin/unpin objects from recent list
- Multiple history types (created/modified vs viewed)
- Analytics on view frequency or patterns

## Open Questions

None — design validated and approved.
