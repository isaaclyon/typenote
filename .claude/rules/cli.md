---
paths: apps/cli/src/**/*.ts
---

# CLI Package Rules

The `@typenote/cli` package provides a backend testing and development interface for TypeNote. It allows direct interaction with storage services without the Electron UI.

## Purpose

- **Backend Testing**: Test storage services, block patch operations, and queries
- **Development Utilities**: Create objects, manage types, apply templates
- **Data Management**: Export/import objects, manage attachments, cleanup operations

## Command Organization

### Registration Pattern

Commands should be organized into separate files and registered via functions:

```typescript
// apps/cli/src/commands/myFeature.ts
import { Command } from 'commander';

export function registerMyFeatureCommand(program: Command): void {
  const cmd = program.command('my-feature').description('Feature description');

  cmd
    .command('action')
    .description('Action description')
    .argument('<required>', 'Required argument')
    .option('-o, --optional <value>', 'Optional flag')
    .action((required: string, options: { optional?: string }) => {
      // Implementation
    });
}

// apps/cli/src/index.ts
import { registerMyFeatureCommand } from './commands/myFeature.js';

registerMyFeatureCommand(program);
```

### Command Grouping

Group related commands under subcommands:

- `task` — Task management (today, overdue, inbox, by-status, etc.)
- `dev` — Development utilities (list-types, create-child-type, etc.)
- `export` / `import` — Data portability
- `attachment` — File management
- `template` — Template CRUD

## Database Lifecycle

### Initialization Pattern

All commands must initialize and cleanup the database:

```typescript
import { createFileDb, closeDb, getDbPath, seedBuiltInTypes, seedDailyNoteTemplate } from '@typenote/storage';

function initDb(): TypenoteDb {
  const dbPath = getDbPath();
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

// In action handler:
.action(async (args, options) => {
  const db = initDb();
  try {
    // Command logic
  } catch (error) {
    // Error handling
  } finally {
    closeDb(db);
  }
});
```

**Critical:** Always use `finally` to ensure database cleanup even on errors.

## Error Handling

### Standard Error Handling Pattern

All commands should follow this consistent error handling:

```typescript
try {
  // Operation
  const result = await someOperation(db, input);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  // Check for domain-specific errors first
  if (error instanceof SpecificServiceError) {
    console.error(`Error [${error.code}]: ${error.message}`);
    if (error.details) {
      console.error('Details:', JSON.stringify(error.details, null, 2));
    }
  } else {
    // Generic error fallback
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
  process.exit(1);
} finally {
  closeDb(db);
}
```

### Domain-Specific Errors

Check for specific error types before generic Error:

- `ObjectTypeError` — Object type operations
- `AttachmentServiceError` — Attachment operations
- `TemplateServiceError` — Template operations
- `TagServiceError` — Tag operations

## Options & Arguments

### JSON Option Parsing

When accepting JSON options, validate parsing:

```typescript
.option('-p, --props <json>', 'Properties as JSON string')
.action((options: { props?: string }) => {
  let properties: Record<string, unknown> | undefined;
  if (options.props) {
    try {
      properties = JSON.parse(options.props) as Record<string, unknown>;
    } catch {
      console.error('Error: Invalid JSON for --props');
      process.exit(1);
    }
  }
  // Use properties
});
```

### Option Type Conversion

Convert string options to appropriate types with validation:

```typescript
.option('-l, --limit <number>', 'Maximum results', '10')
.action((options: { limit: string }) => {
  const limit = parseInt(options.limit, 10);
  if (isNaN(limit) || limit < 1) {
    console.error('Error: --limit must be a positive number');
    process.exit(1);
  }
  // Use limit
});
```

### Enum-like Validation

Validate against known values:

```typescript
const validStatuses = ['Backlog', 'Todo', 'InProgress', 'Done'] as const;
if (!validStatuses.includes(status as (typeof validStatuses)[number])) {
  console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  process.exit(1);
}
```

### exactOptionalPropertyTypes Compliance

Build input objects conditionally to respect TypeScript's `exactOptionalPropertyTypes`:

```typescript
// DON'T: This fails with exactOptionalPropertyTypes
const input = {
  key,
  name,
  pluralName: options.plural, // undefined not allowed!
};

// DO: Conditionally add optional properties
const input: CreateObjectTypeInput = { key, name };
if (options.plural !== undefined) input.pluralName = options.plural;
if (options.color !== undefined) input.color = options.color;
```

## Output Format

### JSON Output

Use consistent JSON formatting for structured data:

```typescript
// Single object
console.log(JSON.stringify(result, null, 2));

// List with count
console.log(`Found ${items.length} items:`);
console.log(JSON.stringify(items, null, 2));
```

### User Messages

Provide clear feedback for operations:

```typescript
// Success messages
console.log(`Created object: ${object.id}`);
console.log(`Deleted ${count} orphaned attachments`);

// Progress indicators for long operations
console.log(`Exporting ${objects.length} objects...`);
```

## Package Imports

The CLI can import from all internal packages:

```typescript
// Storage (database operations)
import { createFileDb, closeDb, createObject, applyBlockPatch } from '@typenote/storage';

// Core (ID generation, utilities)
import { generateId } from '@typenote/core';

// API (types, schemas)
import type { SupportedMimeType, TemplateContent } from '@typenote/api';
```

**Prohibited:** Do not import from Electron (`electron` package).

## Anti-Patterns

### Missing Database Cleanup

**Bad:** Not cleaning up database on error

```typescript
// DON'T: Database left open on error
.action(() => {
  const db = initDb();
  const result = riskyOperation(db); // If this throws, db stays open
  closeDb(db);
});
```

**Good:** Use try-finally

```typescript
// DO: Database always closed
.action(() => {
  const db = initDb();
  try {
    const result = riskyOperation(db);
  } finally {
    closeDb(db);
  }
});
```

### Swallowing Errors

**Bad:** Generic error message without details

```typescript
// DON'T: Lose error context
} catch {
  console.error('Something went wrong');
}
```

**Good:** Preserve error details

```typescript
// DO: Show specific error information
} catch (error) {
  if (error instanceof DomainError) {
    console.error(`Error [${error.code}]: ${error.message}`);
  } else {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}
```

### Hardcoded Paths

**Bad:** Hardcoded database paths

```typescript
// DON'T: Hardcoded path
const db = createFileDb('/Users/me/.typenote/data.db');
```

**Good:** Use getDbPath() utility

```typescript
// DO: Use standard path resolution
const dbPath = getDbPath();
const db = createFileDb(dbPath);
```
