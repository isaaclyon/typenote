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

// Block Patch Operations
export { applyBlockPatch, type ApplyBlockPatchOutcome } from './applyBlockPatch.js';

// Document Queries
export {
  getDocument,
  type DocumentBlock,
  type GetDocumentResult,
  type GetDocumentOptions,
  DocumentNotFoundError,
} from './getDocument.js';

// Backlinks & Search
export { getBacklinks, type BacklinkResult } from './backlinks.js';
export { searchBlocks, type SearchResult, type SearchFilters } from './search.js';

// Object Type Service
export {
  createObjectType,
  getObjectType,
  getObjectTypeByKey,
  listObjectTypes,
  updateObjectType,
  deleteObjectType,
  seedBuiltInTypes,
  isBuiltInTypeKey,
  ObjectTypeError,
  BUILT_IN_TYPES,
} from './objectTypeService.js';

// Property Validation
export {
  validateProperties,
  getDefaultProperties,
  mergeWithDefaults,
  type PropertyValidationError,
  type PropertyValidationResult,
} from './propertyValidation.js';

// DailyNote Service
export {
  getOrCreateDailyNoteByDate,
  getOrCreateTodayDailyNote,
  listDailyNotes,
  getDailyNoteBySlug,
  getDailyNoteSlug,
  DailyNoteError,
  type DailyNote,
  type GetOrCreateResult,
  type ListDailyNotesOptions,
  type ListDailyNotesResult,
} from './dailyNoteService.js';
