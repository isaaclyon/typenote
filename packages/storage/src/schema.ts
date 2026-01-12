import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/sqlite-core';

// ============================================================================
// object_types - Defines the types of objects (DailyNote, Page, Person, etc.)
// ============================================================================

export const objectTypes = sqliteTable(
  'object_types',
  {
    id: text('id').primaryKey(), // ULID
    key: text('key').notNull().unique(), // e.g., 'DailyNote', 'Page'
    name: text('name').notNull(), // Display name
    icon: text('icon'), // Optional icon identifier
    schema: text('schema'), // JSON schema for properties (stored as text)
    builtIn: integer('built_in', { mode: 'boolean' }).notNull().default(false),
    // Inheritance fields
    parentTypeId: text('parent_type_id'), // Self-reference for type inheritance (max 2 levels)
    pluralName: text('plural_name'), // e.g., "Books" for type "Book"
    color: text('color'), // Hex color (#RRGGBB) for UI
    description: text('description'), // Optional type description
    // Calendar configuration
    showInCalendar: integer('show_in_calendar', { mode: 'boolean' }).default(false),
    calendarDateProperty: text('calendar_date_property'), // Property key to use for calendar date
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('object_types_key_idx').on(table.key),
    index('object_types_parent_type_id_idx').on(table.parentTypeId),
  ]
);

// ============================================================================
// objects - The main entities (notes, pages, people, etc.)
// ============================================================================

export const objects = sqliteTable(
  'objects',
  {
    id: text('id').primaryKey(), // ULID
    typeId: text('type_id')
      .notNull()
      .references(() => objectTypes.id),
    title: text('title').notNull(),
    properties: text('properties'), // JSON properties per type schema
    docVersion: integer('doc_version').notNull().default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('objects_type_id_idx').on(table.typeId),
    index('objects_deleted_at_idx').on(table.deletedAt),
  ]
);

// ============================================================================
// blocks - Tree-structured document content
// ============================================================================

export const blocks = sqliteTable(
  'blocks',
  {
    id: text('id').primaryKey(), // ULID
    objectId: text('object_id')
      .notNull()
      .references(() => objects.id),
    // null for root blocks. Parent validity enforced in applyBlockPatch() (can't use FK due to soft-delete semantics)
    parentBlockId: text('parent_block_id'),
    orderKey: text('order_key').notNull(), // Lexicographic ordering
    blockType: text('block_type').notNull(), // paragraph, heading, list, etc.
    content: text('content').notNull(), // JSON content per block type
    meta: text('meta'), // JSON metadata (collapsed, etc.)
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('blocks_object_id_idx').on(table.objectId),
    index('blocks_parent_block_id_idx').on(table.parentBlockId),
    // Unique constraint: sibling order keys must be unique (same object + parent)
    uniqueIndex('blocks_object_parent_order_idx').on(
      table.objectId,
      table.parentBlockId,
      table.orderKey
    ),
    index('blocks_deleted_at_idx').on(table.deletedAt),
  ]
);

// ============================================================================
// refs - Extracted references from block content (for backlinks)
// ============================================================================

export const refs = sqliteTable(
  'refs',
  {
    id: text('id').primaryKey(), // ULID
    sourceBlockId: text('source_block_id')
      .notNull()
      .references(() => blocks.id),
    sourceObjectId: text('source_object_id')
      .notNull()
      .references(() => objects.id),
    targetObjectId: text('target_object_id')
      .notNull()
      .references(() => objects.id),
    targetBlockId: text('target_block_id'), // Optional: specific block reference
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    index('refs_source_block_id_idx').on(table.sourceBlockId),
    index('refs_source_object_id_idx').on(table.sourceObjectId),
    // For backlink queries
    index('refs_target_object_id_idx').on(table.targetObjectId),
    index('refs_target_block_id_idx').on(table.targetBlockId),
  ]
);

// ============================================================================
// idempotency - Stores patch results for idempotent replays
// ============================================================================

export const idempotency = sqliteTable(
  'idempotency',
  {
    objectId: text('object_id')
      .notNull()
      .references(() => objects.id),
    key: text('key').notNull(),
    resultJson: text('result_json').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    // Composite primary key for (objectId, key) - enforces uniqueness for idempotency
    primaryKey({ columns: [table.objectId, table.key] }),
  ]
);

// ============================================================================
// templates - Object type templates for auto-applying initial content
// ============================================================================

export const templates = sqliteTable(
  'templates',
  {
    id: text('id').primaryKey(), // ULID
    objectTypeId: text('object_type_id')
      .notNull()
      .references(() => objectTypes.id),
    name: text('name').notNull(), // e.g., "Daily Note Default"
    content: text('content').notNull(), // JSON: TemplateContent
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('templates_object_type_id_idx').on(table.objectTypeId)]
);

// ============================================================================
// tags - Global tag entities with rich metadata
// ============================================================================

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(), // ULID
    name: text('name').notNull(), // Display name (e.g., "Project Alpha")
    slug: text('slug').notNull().unique(), // URL-safe identifier (e.g., "project-alpha")
    color: text('color'), // Hex color (#RRGGBB) or CSS color name
    icon: text('icon'), // Emoji or icon library reference
    description: text('description'), // Optional description
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('tags_slug_idx').on(table.slug)]
);

// ============================================================================
// object_tags - Junction table for object-tag many-to-many relationships
// ============================================================================

export const objectTags = sqliteTable(
  'object_tags',
  {
    objectId: text('object_id')
      .notNull()
      .references(() => objects.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    // Composite primary key ensures no duplicate assignments
    primaryKey({ columns: [table.objectId, table.tagId] }),
    // Index for reverse lookups (tag → objects)
    index('object_tags_tag_id_idx').on(table.tagId),
  ]
);

// ============================================================================
// attachments - Content-addressed file storage
// ============================================================================

export const attachments = sqliteTable(
  'attachments',
  {
    id: text('id').primaryKey(), // ULID
    sha256: text('sha256').notNull().unique(), // Content-addressed hash (64 hex chars)
    filename: text('filename').notNull(), // Original filename
    mimeType: text('mime_type').notNull(), // MIME type
    sizeBytes: integer('size_bytes').notNull(), // File size in bytes
    lastReferencedAt: integer('last_referenced_at', { mode: 'timestamp' }).notNull(),
    orphanedAt: integer('orphaned_at', { mode: 'timestamp' }), // When attachment became orphaned
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('attachments_sha256_idx').on(table.sha256)]
);

// ============================================================================
// block_attachments - Junction table for block-attachment relationships
// ============================================================================

export const blockAttachments = sqliteTable(
  'block_attachments',
  {
    blockId: text('block_id')
      .notNull()
      .references(() => blocks.id, { onDelete: 'cascade' }),
    attachmentId: text('attachment_id')
      .notNull()
      .references(() => attachments.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    // Composite primary key ensures no duplicate assignments
    primaryKey({ columns: [table.blockId, table.attachmentId] }),
    // Index for reverse lookups (attachment → blocks)
    index('block_attachments_attachment_id_idx').on(table.attachmentId),
  ]
);

// ============================================================================
// recent_objects - LRU cache of recently viewed objects
// ============================================================================

export const recentObjects = sqliteTable(
  'recent_objects',
  {
    objectId: text('object_id')
      .primaryKey()
      .references(() => objects.id, { onDelete: 'cascade' }),
    viewedAt: integer('viewed_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    // Index for LRU cleanup (ORDER BY viewedAt ASC LIMIT N)
    index('recent_objects_viewed_at_idx').on(table.viewedAt),
  ]
);

// ============================================================================
// user_settings - Key-value store for user preferences
// ============================================================================

export const userSettings = sqliteTable('user_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON stringified value
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// ============================================================================
// fts_blocks - Full-text search virtual table (FTS5)
// Drizzle doesn't support FTS5 natively, so we use raw SQL
// ============================================================================

export const FTS_BLOCKS_TABLE_NAME = 'fts_blocks';

// FTS5 configuration notes:
// - block_id and object_id are UNINDEXED (stored but not searchable)
// - content_text is the only indexed/searchable column
// - We don't use contentless mode because we need to DELETE by block_id
export const FTS_BLOCKS_CREATE_SQL = `
CREATE VIRTUAL TABLE IF NOT EXISTS fts_blocks USING fts5(
  block_id UNINDEXED,
  object_id UNINDEXED,
  content_text
)
`.trim();
