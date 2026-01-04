// TypeNote Storage - SQLite + Drizzle ORM layer

export const STORAGE_VERSION = '0.1.0';

// Schema
export {
  objectTypes,
  objects,
  blocks,
  refs,
  idempotency,
  FTS_BLOCKS_TABLE_NAME,
  FTS_BLOCKS_CREATE_SQL,
} from './schema.js';

// Database
export { createTestDb, createFileDb, closeDb, type TypenoteDb } from './db.js';
