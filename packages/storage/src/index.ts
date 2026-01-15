// TypeNote Storage - SQLite + Drizzle ORM layer

export const STORAGE_VERSION = '0.1.0';

// Error Factory
export { createServiceError, type ServiceError, type ServiceErrorConstructor } from './errors.js';

// Schema
export {
  objectTypes,
  objects,
  blocks,
  refs,
  idempotency,
  templates,
  tags,
  objectTags,
  attachments,
  blockAttachments,
  recentObjects,
  pinnedObjects,
  userSettings,
  FTS_BLOCKS_TABLE_NAME,
  FTS_BLOCKS_CREATE_SQL,
} from './schema.js';

// Database
export { createTestDb, createFileDb, closeDb, getDbPath, type TypenoteDb } from './db.js';

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

// Backlinks, Unlinked Mentions & Search
export { getBacklinks, type BacklinkResult } from './backlinks.js';
export { getUnlinkedMentionsTo, type UnlinkedMentionResult } from './unlinkedMentions.js';
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
  getResolvedSchema,
  invalidateSchemaCache,
  type ObjectTypeErrorCode,
  type ResolvedTypeSchema,
} from './objectTypeService.js';

// Property Validation
export {
  validateProperties,
  validatePropertiesForType,
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
  type DailyNoteErrorCode,
  type DailyNote,
  type GetOrCreateResult,
  type ListDailyNotesOptions,
  type ListDailyNotesResult,
} from './dailyNoteService.js';

// Object Service
export {
  listObjects,
  getObject,
  createObject,
  updateObject,
  CreateObjectError,
  UpdateObjectError,
  type CreateObjectErrorCode,
  type UpdateObjectErrorCode,
  type ObjectSummary,
  type ObjectDetails,
  type CreatedObject,
  type CreateObjectOptions,
  type UpdateObjectOptions,
  type UpdateObjectResult,
} from './objectService.js';

// Object Duplication Service
export { duplicateObject } from './duplicateObjectService.js';

// Export/Import Service
export {
  deterministicStringify,
  exportObject,
  exportObjectsByType,
  exportToFolder,
  importObject,
  importFromFolder,
  type ExportedBlock,
  type ExportedObject,
  type ExportManifest,
  type ExportedType,
  type ImportOptions,
  type ImportObjectResult,
  type ImportResult,
} from './exportService.js';

// Template Service
export {
  createTemplate,
  getTemplate,
  getDefaultTemplateForType,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  seedDailyNoteTemplate,
  DAILY_NOTE_DEFAULT_TEMPLATE,
} from './templateService.js';

// Template Application
export {
  applyTemplateToObject,
  type ApplyTemplateContext,
  type ApplyTemplateOutcome,
} from './applyTemplateToObject.js';

// Tag Service
export {
  createTag,
  getTag,
  getTagBySlug,
  updateTag,
  deleteTag,
  listTags,
  assignTags,
  removeTags,
  getObjectTags,
  findOrCreateTag,
  TagServiceError,
  type TagServiceErrorCode,
} from './tagService.js';

// Task Service
export {
  getTodaysTasks,
  getOverdueTasks,
  getTasksByStatus,
  getUpcomingTasks,
  getInboxTasks,
  getTasksByPriority,
  getCompletedTasks,
  getTasksByDueDate,
  completeTask,
  reopenTask,
  type TaskObject,
  type CompletedTasksOptions,
} from './taskService.js';

// File Service
export { type FileService, FilesystemFileService, InMemoryFileService } from './fileService.js';

// Attachment Service
export {
  uploadAttachment,
  getAttachment,
  getAttachmentByHash,
  linkBlockToAttachment,
  unlinkBlockFromAttachment,
  getBlockAttachments,
  getAttachmentBlocks,
  listAttachments,
  cleanupOrphanedAttachments,
  AttachmentServiceError,
  type AttachmentServiceErrorCode,
  type UploadAttachmentInput,
  type ListAttachmentsOptions,
} from './attachmentService.js';

// Calendar Service
export {
  getCalendarTypes,
  getEventsOnDate,
  getEventsInDateRange,
  getUpcomingEvents,
  getAllCalendarItems,
  type CalendarItem,
  type CalendarTypeMetadata,
  type GetAllCalendarItemsOptions,
} from './calendarService.js';

// Recent Objects Service
export {
  recordView,
  getRecentObjects,
  clearRecentObjects,
  type RecentObjectSummary,
} from './recentObjectsService.js';

// Pinned Objects Service
export {
  pinObject,
  unpinObject,
  isPinned,
  getPinnedObjects,
  reorderPinnedObjects,
  clearPinnedObjects,
  type PinnedObjectSummary,
} from './pinnedObjectsService.js';

// Settings Service
export {
  getSettings,
  getSetting,
  updateSettings,
  updateSetting,
  resetSettings,
} from './settingsService.js';

// Trash Service
export {
  listDeletedObjects,
  restoreObject,
  TrashServiceError,
  type TrashServiceErrorCode,
  type DeletedObjectSummary,
  type RestoreObjectResult,
  type ListDeletedObjectsOptions,
} from './trashService.js';
