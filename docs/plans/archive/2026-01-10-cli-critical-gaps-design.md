# CLI Critical Gaps Implementation Design

**Created:** 2026-01-10
**Status:** Approved
**Purpose:** Implement CLI commands for 4 critical backend gaps (Tier 1 from coverage analysis)

---

## Overview

This design implements CLI support for 4 critical backend areas currently lacking command-line testing capabilities:

1. **Template Application** - Apply templates to objects (extends existing `template.ts`)
2. **Block Move Operation** - Move blocks in document tree (extends existing `core.ts`)
3. **Daily Notes** - Daily note management commands (new `daily.ts`)
4. **Calendar** - Calendar/event query commands (new `calendar.ts`)

**Implementation approach:** Sequential (extensions first, then new command groups)
**Testing strategy:** Integration tests for all new commands using in-memory SQLite
**Date format:** ISO 8601 (YYYY-MM-DD) - simple, unambiguous, machine-friendly

---

## Implementation Sequence

### Phase 1: Extend Existing Commands (Quick Wins)

**Files modified:**

- `apps/cli/src/commands/template.ts` - Add `template apply` subcommand
- `apps/cli/src/commands/core.ts` - Add `patch-move` command

**Rationale:** Smaller scope (~30 lines each), builds momentum, immediate testing value

### Phase 2: Daily Notes Command Group

**Files created:**

- `apps/cli/src/commands/daily.ts` - 5 subcommands for daily note operations

**Rationale:** Highest dev value, foundation for daily workflow testing

### Phase 3: Calendar Command Group

**Files created:**

- `apps/cli/src/commands/calendar.ts` - 5 subcommands for calendar/event queries

**Rationale:** Completes date-based testing capabilities

### Phase 4: Integration Tests

**Files created/modified:**

- Test files for all new commands
- Follow existing CLI test patterns

---

## Phase 1.1: Template Apply Command

### Command Signature

```bash
typenote template apply <templateId> <objectId>
```

### Implementation Details

**File:** `apps/cli/src/commands/template.ts` (extend existing)

**Backend service:**

```typescript
import { applyTemplateToObject } from '@typenote/storage';
```

**Logic:**

1. Fetch object by ID to get `title`, `createdAt`, `properties`
2. Auto-build `ApplyTemplateContext`:
   ```typescript
   {
     title: object.title,
     createdDate: object.createdAt,
     dateKey: object.properties?.date_key  // For DailyNote types
   }
   ```
3. Call `applyTemplateToObject(db, templateId, objectId)`
4. Handle outcome union type (`{ success: true/false }`)
5. Output result as JSON

**Error handling:**

- Template not found → Exit with error message
- Object not found → Exit with error message
- Apply failure → Show ApiError details from backend
- Success → Show applied block patch result

**Example usage:**

```bash
# Apply meeting template to project object
typenote template apply tmpl_01HQ123 obj_01HQ456

# Success output:
{
  "success": true,
  "result": {
    "newDocVersion": 2,
    "blockIds": ["blk_001", "blk_002", "blk_003"]
  }
}

# Failure output:
Error [VALIDATION]: Template content failed validation
Details: { ... }
```

### Test Coverage

**File:** `apps/cli/src/commands/template.test.ts`

**Test cases:**

- ✓ Apply template to object (success)
- ✓ Template not found (error)
- ✓ Object not found (error)
- ✓ Placeholder substitution works (verify {{title}}, {{created_date}}, {{date_key}})

---

## Phase 1.2: Block Move Command

### Command Signature

```bash
typenote patch-move <objectId> <blockId> <newParentId> [--after <siblingId>]
```

### Implementation Details

**File:** `apps/cli/src/commands/core.ts` (extend existing)

**Existing patch commands:**

- `patch-insert` - Insert new block
- `patch-update` - Update block content
- `patch-delete` - Delete block

**New command logic:**

1. Build `block.move` operation patch:
   ```typescript
   {
     operations: [
       {
         op: 'block.move',
         blockId: blockId,
         newParentBlockId: newParentId,
         afterBlockId: options.after ?? null,
       },
     ];
   }
   ```
2. Call `applyBlockPatch(db, objectId, patch)`
3. Handle outcome (success/failure)
4. Output result as JSON

**Error handling:**

- Block not found → Backend error
- Parent not found → Backend error
- Cycle detection → Backend prevents and returns error
- Success → Show new doc version

**Example usage:**

```bash
# Move block to new parent, positioned after sibling
typenote patch-move obj_123 blk_abc blk_parent --after blk_sibling

# Move to top of parent (no --after)
typenote patch-move obj_123 blk_abc blk_parent

# Success output:
{
  "success": true,
  "newDocVersion": 5,
  "movedBlockId": "blk_abc"
}
```

### Test Coverage

**File:** `apps/cli/src/commands/core.test.ts`

**Test cases:**

- ✓ Move block to new parent (success)
- ✓ Move block with --after positioning
- ✓ Block not found (error)
- ✓ Parent not found (error)
- ✓ Cycle detection prevents invalid move

---

## Phase 2: Daily Notes Command Group

### Command Structure

```bash
typenote daily <subcommand>
```

### Implementation Details

**File:** `apps/cli/src/commands/daily.ts` (new)

**Backend services:**

```typescript
import {
  getOrCreateDailyNoteByDate,
  getOrCreateTodayDailyNote,
  listDailyNotes,
  getDailyNoteBySlug,
  getDailyNoteSlug,
} from '@typenote/storage';
```

### Subcommands

#### 1. `daily today`

Get or create today's daily note.

```bash
typenote daily today

# Output:
{
  "id": "obj_01HQ789",
  "title": "2026-01-10",
  "slug": "daily/2026-01-10",
  "typeKey": "daily-note",
  "created": true  // false if already existed
}
```

**Implementation:** Call `getOrCreateTodayDailyNote(db)`

---

#### 2. `daily get <date>`

Get or create daily note for specific date.

```bash
typenote daily get 2026-01-15

# Output: Same structure as 'today'
```

**Implementation:**

- Parse ISO 8601 date string (YYYY-MM-DD)
- Validate format
- Call `getOrCreateDailyNoteByDate(db, new Date(dateString))`

**Error handling:**

- Invalid date format → Error message with example

---

#### 3. `daily list [options]`

List daily notes with pagination and date filtering.

```bash
typenote daily list --limit 7                           # Last 7 notes
typenote daily list --from 2026-01-01 --to 2026-01-31  # Date range
typenote daily list --limit 30 --offset 10              # Pagination

# Output:
{
  "notes": [
    { "id": "...", "title": "2026-01-10", "slug": "daily/2026-01-10", "createdAt": "..." },
    { "id": "...", "title": "2026-01-09", "slug": "daily/2026-01-09", "createdAt": "..." }
  ],
  "total": 42
}
```

**Options:**

- `--limit <number>` - Max notes to return (default: 10)
- `--offset <number>` - Skip N notes (default: 0)
- `--from <date>` - Start date (ISO 8601)
- `--to <date>` - End date (ISO 8601)

**Implementation:** Call `listDailyNotes(db, options)`

---

#### 4. `daily slug <date>`

Generate slug for a date (utility command).

```bash
typenote daily slug 2026-01-10

# Output:
"daily/2026-01-10"
```

**Implementation:** Call `getDailyNoteSlug(new Date(dateString))`

### Registration

```typescript
// apps/cli/src/index.ts
import { registerDailyCommand } from './commands/daily.js';

registerDailyCommand(program);
```

### Test Coverage

**File:** `apps/cli/src/commands/daily.test.ts`

**Test cases:**

- ✓ Get/create today's note
- ✓ Get/create specific date note
- ✓ List with pagination
- ✓ List with date range (--from, --to)
- ✓ Generate slug utility
- ✓ Invalid date format error

---

## Phase 3: Calendar Command Group

### Command Structure

```bash
typenote calendar <subcommand>
```

### Implementation Details

**File:** `apps/cli/src/commands/calendar.ts` (new)

**Backend services:**

```typescript
import {
  getCalendarTypes,
  getEventsOnDate,
  getEventsInDateRange,
  getUpcomingEvents,
  getAllCalendarItems,
} from '@typenote/storage';
```

### Subcommands

#### 1. `calendar types`

List object types with calendar enabled.

```bash
typenote calendar types

# Output:
{
  "types": [
    { "key": "task", "name": "Task", "calendarEnabled": true },
    { "key": "event", "name": "Event", "calendarEnabled": true }
  ]
}
```

**Implementation:** Call `getCalendarTypes(db)`

---

#### 2. `calendar on <date>`

Get calendar items on a specific date.

```bash
typenote calendar on 2026-01-15
typenote calendar on 2026-01-15 --type task  # Filter by type

# Output:
{
  "date": "2026-01-15",
  "items": [
    { "id": "obj_123", "title": "Team meeting", "typeKey": "event", "date": "2026-01-15" },
    { "id": "obj_456", "title": "Finish report", "typeKey": "task", "dueDate": "2026-01-15" }
  ]
}
```

**Implementation:**

- Parse date (ISO 8601)
- Convert `--type <typeKey>` to `typeKeys: [typeKey]` array
- Call `getEventsOnDate(db, new Date(dateString), typeKeys?)`

---

#### 3. `calendar range <startDate> <endDate>`

Get calendar items in a date range.

```bash
typenote calendar range 2026-01-01 2026-01-31
typenote calendar range 2026-01-01 2026-01-31 --type event

# Output:
{
  "startDate": "2026-01-01",
  "endDate": "2026-01-31",
  "items": [ /* ... */ ]
}
```

**Implementation:**

- Parse both dates (ISO 8601)
- Validate startDate <= endDate
- Call `getEventsInDateRange(db, startDate, endDate, typeKeys?)`

---

#### 4. `calendar upcoming [--days N]`

Get upcoming calendar items.

```bash
typenote calendar upcoming              # Default: next 7 days
typenote calendar upcoming --days 14    # Next 14 days
typenote calendar upcoming --type task  # Only tasks

# Output:
{
  "days": 7,
  "items": [ /* ... */ ]
}
```

**Options:**

- `--days <number>` - Number of days to look ahead (default: 7)
- `--type <typeKey>` - Filter by object type

**Implementation:** Call `getUpcomingEvents(db, days?, typeKeys?)`

---

#### 5. `calendar list [options]`

Unified calendar query with all filters.

```bash
typenote calendar list --limit 20
typenote calendar list --type task --limit 50
typenote calendar list --from 2026-01-01 --to 2026-12-31

# Output:
{
  "items": [ /* ... */ ],
  "total": 123
}
```

**Options:**

- `--limit <number>` - Max items to return
- `--offset <number>` - Pagination offset
- `--type <typeKey>` - Filter by type
- `--from <date>` - Start date
- `--to <date>` - End date

**Implementation:** Call `getAllCalendarItems(db, options)`

### Registration

```typescript
// apps/cli/src/index.ts
import { registerCalendarCommand } from './commands/calendar.js';

registerCalendarCommand(program);
```

### Test Coverage

**File:** `apps/cli/src/commands/calendar.test.ts`

**Test cases:**

- ✓ List calendar types
- ✓ Get events on specific date
- ✓ Get events in date range
- ✓ Get upcoming events with days filter
- ✓ Type filtering works (--type option)
- ✓ Unified list with all filters

---

## Phase 4: Integration Testing

### Testing Approach

All CLI command tests follow this pattern:

1. **Setup:** Create in-memory SQLite database (`initDb(':memory:')`)
2. **Arrange:** Create test data (objects, types, templates)
3. **Act:** Execute command logic (call service functions directly)
4. **Assert:** Verify JSON output and database state
5. **Cleanup:** Close database (`closeDb(db)`)

### Test File Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initDb, closeDb } from './db.js';
import type { TypenoteDb } from '@typenote/storage';

describe('daily commands', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = initDb(':memory:');
  });

  afterEach(() => {
    closeDb(db);
  });

  it('should get or create today daily note', () => {
    const result = getOrCreateTodayDailyNote(db);

    expect(result).toMatchObject({
      typeKey: 'daily-note',
      slug: expect.stringMatching(/^daily\/\d{4}-\d{2}-\d{2}$/),
    });
  });
});
```

### Test Coverage Summary

**Template apply (template.test.ts):**

- Apply template to object (success)
- Template not found (error)
- Object not found (error)
- Placeholder substitution

**Block move (core.test.ts):**

- Move block to new parent
- Move with --after positioning
- Block not found error
- Cycle detection

**Daily notes (daily.test.ts):**

- Get/create today's note
- Get/create specific date
- List with pagination
- List with date range
- Generate slug

**Calendar (calendar.test.ts):**

- List calendar types
- Get events on date
- Get events in range
- Get upcoming events
- Type filtering

---

## Architecture Patterns

### Error Handling Pattern

All commands follow this structure:

```typescript
.action(async (arg, options) => {
  const db = initDb();
  try {
    const result = await serviceFunction(db, arg, options);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    closeDb(db);
  }
});
```

### Date Parsing Pattern

```typescript
function parseIsoDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD format.`);
  }
  return date;
}
```

### Type Filtering Pattern

```typescript
// Convert --type option to typeKeys array for backend
const typeKeys = options.type ? [options.type] : undefined;
const result = getEventsOnDate(db, date, typeKeys);
```

---

## Success Criteria

**Implementation complete when:**

1. ✓ All 4 phases implemented
2. ✓ All commands registered in `apps/cli/src/index.ts`
3. ✓ All integration tests passing
4. ✓ Commands follow existing CLI patterns
5. ✓ JSON output format consistent
6. ✓ Error handling comprehensive
7. ✓ Date parsing robust (ISO 8601 only)
8. ✓ Type checks pass (`pnpm typecheck`)
9. ✓ Linter passes (`pnpm lint`)

---

## References

- **CLI Coverage Analysis:** `docs/plans/2026-01-10-cli-coverage-analysis.md`
- **Backend Services:** `packages/storage/src/`
- **Existing CLI Commands:** `apps/cli/src/commands/`
- **Backend Contract:** `docs/foundational/backend_contract.md`
