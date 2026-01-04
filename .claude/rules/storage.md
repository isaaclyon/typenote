---
paths: packages/storage/**/*.ts
---

# Storage Package Rules

The `@typenote/storage` package owns SQLite schema, migrations, and data access. All database operations must go through this package.

## Required Patterns

### Single Transaction Per Patch

**Bad:** Multiple separate transactions

```typescript
// DON'T: Multiple transactions can leave inconsistent state
await db.insert(blocks).values(newBlock);
await db.update(objects).set({ docVersion: newVersion });
await db.insert(refs).values(newRefs);
```

**Good:** Single transaction for atomic operations

```typescript
// DO: Single transaction
await db.transaction(async (tx) => {
  await tx.insert(blocks).values(newBlock);
  await tx.update(objects).set({ docVersion: newVersion });
  await tx.insert(refs).values(newRefs);
});
```

### Drizzle Schema Conventions

Use explicit column definitions with proper constraints:

```typescript
export const objects = sqliteTable('objects', {
  id: text('id').primaryKey(),
  typeId: text('type_id')
    .notNull()
    .references(() => objectTypes.id),
  title: text('title').notNull(),
  docVersion: integer('doc_version').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});
```

### Always Index Foreign Keys

**Bad:** Unindexed foreign key columns

```typescript
// DON'T: Missing index on FK
export const blocks = sqliteTable('blocks', {
  objectId: text('object_id')
    .notNull()
    .references(() => objects.id),
});
```

**Good:** Explicit index on FK

```typescript
// DO: Index foreign keys
export const blocks = sqliteTable(
  'blocks',
  {
    objectId: text('object_id')
      .notNull()
      .references(() => objects.id),
  },
  (table) => ({
    objectIdIdx: index('blocks_object_id_idx').on(table.objectId),
  })
);
```

### Soft Delete Pattern

Use `deletedAt` timestamp, not hard deletes:

```typescript
// Soft delete a block and its subtree
await tx
  .update(blocks)
  .set({ deletedAt: new Date() })
  .where(and(eq(blocks.objectId, objectId), inArray(blocks.id, subtreeIds)));
```

### In-Memory SQLite for Tests

Use `:memory:` database for fast isolated tests:

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export function createTestDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite);
  // Run migrations
  return db;
}
```

## Migration Rules

- Migrations must be idempotent
- Never modify existing migrations after they've been applied
- Use timestamp prefixes: `0001_create_objects.sql`
- Test migrations on fresh DB and on DB with existing data
