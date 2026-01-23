# CLI Coverage Analysis

**Created:** 2026-01-10
**Status:** Documentation
**Purpose:** Identify backend functionality lacking CLI commands for testing and development

---

## Executive Summary

Out of **22 major backend services**, TypeNote has **8 CLI command groups** providing good coverage for core workflows (tasks, tags, attachments, export/import). However, several critical backend areas have **no CLI support**, making them difficult to test without running the full Electron app.

**Key Gap:** Backend services added recently (daily notes, calendar, recent objects, unlinked mentions) lack any CLI commands.

---

## Coverage Overview

### ✅ Well-Covered Services

| Service       | Commands   | Coverage                                                                                  |
| ------------- | ---------- | ----------------------------------------------------------------------------------------- |
| Tasks         | 8 commands | Complete (today, overdue, inbox, upcoming, by-status, by-priority, complete, reopen)      |
| Tags          | 9 commands | Complete (create, get, list, update, delete, assign, remove, object-tags, find-or-create) |
| Attachments   | 8 commands | Complete (upload, get, link, unlink, list, cleanup)                                       |
| Export/Import | 6 commands | Complete (object, type, folder export/import)                                             |
| Backlinks     | 1 command  | Complete (get backlinks)                                                                  |
| Core Objects  | 5 commands | Good (create, list, get, search, patch-insert/update/delete)                              |

### 🔴 Tier 1 - Critical Missing Coverage

#### 1. Daily Note Service

**File:** `packages/storage/src/dailyNoteService.ts`
**Functions:** 5 exported
**CLI Commands:** 0

**Missing Commands:**

- `getOrCreateDailyNoteByDate(date)` - Get/create daily note for specific date
- `getOrCreateTodayDailyNote()` - Get/create today's daily note
- `listDailyNotes(options)` - List daily notes with pagination
- `getDailyNoteBySlug(slug)` - Query by slug (daily/YYYY-MM-DD)
- `getDailyNoteSlug(date)` - Generate slug from date

**Development Impact:** HIGH
Cannot test daily note workflows, date-based queries, or slug generation without UI.

**Suggested Commands:**

```bash
typenote daily today                    # Get/create today's note
typenote daily get 2026-01-10          # Get/create specific date
typenote daily list --limit 7          # List recent daily notes
typenote daily list --from 2026-01-01 --to 2026-01-31  # Date range
```

---

#### 2. Calendar Service

**File:** `packages/storage/src/calendarService.ts`
**Functions:** 5 exported
**CLI Commands:** 0

**Missing Commands:**

- `getCalendarTypes()` - Get types with calendar enabled
- `getEventsOnDate(date, typeKeys?)` - Query items for specific date
- `getEventsInDateRange(start, end, typeKeys?)` - Query items in date range
- `getUpcomingEvents(days?, typeKeys?)` - Query items in next N days
- `getAllCalendarItems(options)` - Unified calendar query with filters

**Development Impact:** HIGH
Cannot test calendar features, event queries, or date filtering without UI.

**Suggested Commands:**

```bash
typenote calendar types                           # List calendar-enabled types
typenote calendar on 2026-01-15                   # Events on date
typenote calendar range 2026-01-01 2026-01-31     # Events in range
typenote calendar upcoming --days 7               # Next 7 days
typenote calendar list --type task --limit 20     # Filter by type
```

---

#### 3. Template Application

**File:** `packages/storage/src/applyTemplateToObject.ts`
**Functions:** 1 exported
**CLI Commands:** 0 (template CRUD exists, but not application)

**Missing Commands:**

- `applyTemplateToObject(objectId, templateId, context?)` - Apply template to generate content

**Development Impact:** HIGH
Can create templates via CLI but cannot test the actual template→content flow without UI.

**Current Template Commands (CRUD only):**

```bash
typenote template create <type> <title>
typenote template get <id>
typenote template list [--type <type>]
typenote template update <id> --content <path>
typenote template delete <id>
```

**Suggested Additional Command:**

```bash
typenote template apply <templateId> <objectId> [--context <json>]
# Example: typenote template apply tmpl_abc123 obj_xyz789 --context '{"project":"TypeNote"}'
```

---

#### 4. Block Move Operation

**File:** `packages/storage/src/applyBlockPatch.ts`
**Operation:** `block.move`
**CLI Commands:** 0 (only insert/update/delete supported)

**Missing Commands:**

- Block move operation in patch framework

**Development Impact:** MEDIUM-HIGH
Block movement is a fundamental editing operation but can only be tested programmatically.

**Current Block Commands:**

```bash
typenote patch-insert <objectId> <parentId> <content> [--after <blockId>]
typenote patch-update <objectId> <blockId> <content>
typenote patch-delete <objectId> <blockId>
```

**Suggested Additional Command:**

```bash
typenote patch-move <objectId> <blockId> <newParentId> [--after <siblingId>]
# Example: typenote patch-move obj_123 blk_abc blk_parent --after blk_sibling
```

---

### 🟡 Tier 2 - Important Utilities

#### 5. Recent Objects Service

**File:** `packages/storage/src/recentObjectsService.ts` (NEW - added in current work)
**Functions:** 3 exported
**CLI Commands:** 0

**Missing Commands:**

- `recordView(objectId)` - Record object view (LRU tracking)
- `getRecentObjects(limit?)` - Get recently viewed objects
- `clearRecentObjects()` - Clear all recent object tracking

**Development Impact:** MEDIUM
Cannot test view history or LRU cache behavior without UI.

**Suggested Commands:**

```bash
typenote recent list [--limit 20]     # List recently viewed objects
typenote recent record <objectId>      # Manually record a view
typenote recent clear                  # Clear all recent objects
```

---

#### 6. Unlinked Mentions

**File:** `packages/storage/src/unlinkedMentions.ts` (NEW - added in current work)
**Functions:** 1 exported
**CLI Commands:** 0

**Missing Commands:**

- `getUnlinkedMentionsTo(targetObjectId, filters?)` - Find text references that aren't linked

**Development Impact:** MEDIUM
Cannot test unlinked mention detection without UI.

**Suggested Commands:**

```bash
typenote unlinked-mentions <objectId> [--limit 20]
# Example: typenote unlinked-mentions obj_abc123 --limit 50
```

---

#### 7. Object Type Management (Partial Coverage)

**File:** `packages/storage/src/objectTypeService.ts`
**Functions:** 6 exported
**CLI Commands:** 3 (dev: list-types, create-child-type, show-resolved-schema)

**Missing Commands:**

- `createObjectType(input)` - Generic create (only child type creation exposed)
- `updateObjectType(typeId, updates)` - Update existing type
- `deleteObjectType(typeId)` - Delete custom type
- `getObjectType(typeId)` - Direct ID lookup (only getObjectTypeByKey available)
- `invalidateSchemaCache()` - Cache invalidation

**Development Impact:** MEDIUM
Can create types but cannot modify or delete them via CLI.

**Current Commands:**

```bash
typenote dev list-types
typenote dev create-child-type <parentKey> <name> <key>
typenote dev show-resolved-schema <typeKey>
```

**Suggested Additional Commands:**

```bash
typenote dev update-type <typeId> --name <name> --schema <path>
typenote dev delete-type <typeId>
typenote dev get-type <typeId>              # Direct ID lookup
typenote dev invalidate-schema-cache        # Force cache refresh
```

---

#### 8. Content Extraction & Indexing

**Files:** `packages/storage/src/indexing.ts`, `packages/storage/src/contentExtraction.ts`
**Functions:** 6+ exported
**CLI Commands:** 0

**Missing Commands:**

- `reindexDocument(objectId)` - Force reindex of a document
- `extractPlaintext(content)` - Extract plain text from content schema
- `extractReferences(content)` - Extract @mentions from block content

**Development Impact:** MEDIUM
Cannot test search indexing or content extraction logic without programmatic tests.

**Suggested Commands:**

```bash
typenote index reindex <objectId>                    # Force reindex single object
typenote index reindex-all                           # Reindex all objects
typenote index extract-plaintext <objectId>          # Show plaintext extraction
typenote index extract-references <objectId>         # Show extracted references
```

---

### 🔵 Tier 3 - Low-Level Utilities (Internal)

#### 9. Property Validation

**File:** `packages/storage/src/propertyValidation.ts`
**Functions:** 4 exported
**CLI Commands:** 0

**Missing Commands:**

- `validateProperties(properties, typeSchema)` - Validate against schema
- `validatePropertiesForType(properties, typeKey)` - Validate for specific type
- `getDefaultProperties(typeSchema)` - Get defaults
- `mergeWithDefaults(properties, defaults)` - Merge with defaults

**Development Impact:** LOW
Internal validation logic; better tested via unit tests than CLI.

---

#### 10. Order Key Management

**File:** `packages/storage/src/orderKeys.ts`
**Functions:** 2+ exported
**CLI Commands:** 0

**Development Impact:** LOW
Fractional indexing utilities; better tested via unit tests.

---

#### 11. Cycle Detection

**File:** `packages/storage/src/cycleDetection.ts`
**Functions:** 2+ exported
**CLI Commands:** 0

**Development Impact:** LOW
Invariant enforcement utilities; better tested via unit tests.

---

## Implementation Priority

### Phase 1 - Essential Testing Tools (Implement First)

1. **Daily Notes** - Foundation for daily workflow testing
2. **Calendar** - Foundation for event/task calendar views
3. **Template Application** - Complete the template testing story
4. **Block Move** - Core editing operation

**Rationale:** These are user-facing features that are hard to test without CLI support.

### Phase 2 - Developer Utilities

5. **Recent Objects** - View history and LRU testing
6. **Unlinked Mentions** - Reference discovery testing
7. **Object Type Updates/Deletes** - Complete type management CRUD
8. **Content Extraction/Indexing** - Search and plaintext conversion testing

**Rationale:** Important for development workflow but less critical than Phase 1.

### Phase 3 - Internal Utilities (Optional)

9. Property Validation, Order Keys, Cycle Detection - Better tested via unit tests

---

## Architecture Notes

### CLI Structure

**Location:** `apps/cli/src/`

**Current Command Groups:**

- `core.ts` - Core object operations (create, list, get, search)
- `task.ts` - Task-specific queries and operations
- `tag.ts` - Tag CRUD and assignment
- `template.ts` - Template CRUD (missing: application)
- `attachment.ts` - Attachment operations
- `export.ts` / `import.ts` - Data portability
- `backlinks.ts` - Backlink queries
- `dev.ts` - Developer utilities (type management)

**Suggested New Command Groups:**

- `daily.ts` - Daily note operations
- `calendar.ts` - Calendar/event queries
- `recent.ts` - Recent objects tracking
- `mentions.ts` - Unlinked mention discovery
- `index.ts` - Search indexing utilities

### Implementation Pattern

All CLI commands follow this pattern:

```typescript
import { Command } from 'commander';
import { getDb } from './utils/db.js';
import { someService } from '@typenote/storage';

export const someCommand = new Command('some')
  .description('Description of command')
  .argument('<arg>', 'Description of arg')
  .option('--flag <value>', 'Description of flag')
  .action(async (arg, options) => {
    const db = getDb();
    try {
      const result = await someService.someFunction(db, arg, options);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });
```

**Key Patterns:**

- Import storage service functions directly
- Use `getDb()` utility for database connection
- JSON output for structured data
- Error handling with process.exit(1) on failure

---

## Next Steps

1. **Decide Phase 1 Priority** - Which of the 4 critical areas to tackle first
2. **Create Implementation Plan** - Design CLI commands for chosen area
3. **Implement & Test** - Add commands + integration tests
4. **Update Documentation** - Add to CLI help text and CLAUDE.md commands table
5. **Repeat** - Continue with remaining Phase 1 items

---

## References

- **Storage Services:** `packages/storage/src/`
- **CLI Commands:** `apps/cli/src/`
- **Backend Contract:** `docs/foundational/backend_contract.md`
- **Service Exports:** `packages/storage/src/index.ts`
