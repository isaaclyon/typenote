import { ipcMain } from 'electron';
import { z } from 'zod';
import { typenoteEvents } from './events.js';
import {
  getDocument,
  applyBlockPatch as applyBlockPatchStorage,
  getOrCreateTodayDailyNote as getOrCreateTodayDailyNoteStorage,
  getOrCreateDailyNoteByDate as getOrCreateDailyNoteByDateStorage,
  listObjects as listObjectsStorage,
  getObject as getObjectStorage,
  getObjectTypeByKey as getObjectTypeByKeyStorage,
  searchBlocks as searchBlocksStorage,
  getBacklinks as getBacklinksStorage,
  getUnlinkedMentionsTo as getUnlinkedMentionsToStorage,
  createObject as createObjectStorage,
  duplicateObject as duplicateObjectStorage,
  updateObject as updateObjectStorage,
  UpdateObjectError,
  createTag as createTagStorage,
  getTag as getTagStorage,
  updateTag as updateTagStorage,
  deleteTag as deleteTagStorage,
  listTags as listTagsStorage,
  assignTags as assignTagsStorage,
  removeTags as removeTagsStorage,
  getObjectTags as getObjectTagsStorage,
  // Task service
  getTodaysTasks as getTodaysTasksStorage,
  getOverdueTasks as getOverdueTasksStorage,
  getTasksByStatus as getTasksByStatusStorage,
  getUpcomingTasks as getUpcomingTasksStorage,
  getInboxTasks as getInboxTasksStorage,
  getTasksByPriority as getTasksByPriorityStorage,
  getCompletedTasks as getCompletedTasksStorage,
  getTasksByDueDate as getTasksByDueDateStorage,
  completeTask as completeTaskStorage,
  reopenTask as reopenTaskStorage,
  // Calendar service
  getEventsInDateRange as getEventsInDateRangeStorage,
  // Daily note service
  listDailyNotes as listDailyNotesStorage,
  // Recent objects service
  recordView as recordViewStorage,
  getRecentObjects as getRecentObjectsStorage,
  // Pinned objects service
  pinObject as pinObjectStorage,
  unpinObject as unpinObjectStorage,
  isPinned as isPinnedStorage,
  getPinnedObjects as getPinnedObjectsStorage,
  reorderPinnedObjects as reorderPinnedObjectsStorage,
  type PinnedObjectSummary,
  // Settings service
  getSettings as getSettingsStorage,
  updateSettings as updateSettingsStorage,
  resetSettings as resetSettingsStorage,
  // Attachment service
  uploadAttachment as uploadAttachmentStorage,
  getAttachment as getAttachmentStorage,
  listAttachments as listAttachmentsStorage,
  linkBlockToAttachment as linkBlockToAttachmentStorage,
  unlinkBlockFromAttachment as unlinkBlockFromAttachmentStorage,
  getBlockAttachments as getBlockAttachmentsStorage,
  // Trash service
  listDeletedObjects as listDeletedObjectsStorage,
  restoreObject as restoreObjectStorage,
  AttachmentServiceError,
  TrashServiceError,
  DocumentNotFoundError,
  CreateObjectError,
  DailyNoteError,
  TagServiceError,
  type TypenoteDb,
  type FileService,
  type GetDocumentResult,
  type ApplyBlockPatchOutcome,
  type GetOrCreateResult,
  type ObjectSummary,
  type ObjectSummaryWithProperties,
  type ListObjectsOptions,
  type ObjectDetails,
  type SearchResult,
  type SearchFilters,
  type BacklinkResult,
  type UnlinkedMentionResult,
  type CreatedObject,
  type TaskObject,
  type CompletedTasksOptions,
  type ListAttachmentsOptions,
  type CalendarItem,
  type RecentObjectSummary,
  type DeletedObjectSummary,
  type RestoreObjectResult,
  type ListDeletedObjectsOptions,
} from '@typenote/storage';
import {
  ApplyBlockPatchInputSchema,
  type ApplyBlockPatchResult,
  type Tag,
  type TagWithUsage,
  type CreateTagInput,
  type UpdateTagInput,
  type ListTagsOptions,
  type AssignTagsResult,
  type RemoveTagsResult,
  type TaskStatus,
  type TaskPriority,
  type Attachment,
  type UploadAttachmentResult,
  type UserSettings,
  type DuplicateObjectResponse,
  type ObjectType,
  UpdateObjectRequestSchema,
  type UpdateObjectRequest,
  type UpdateObjectResponse,
} from '@typenote/api';

/**
 * IPC-specific schema for uploadAttachment that includes base64-encoded data.
 * This schema is intentionally less strict than UploadAttachmentInputSchema to let
 * the storage layer handle domain-specific validation (MIME type, file size limits).
 * This way, specific error codes like UNSUPPORTED_FILE_TYPE and FILE_TOO_LARGE
 * are returned instead of generic VALIDATION errors.
 */
const IpcUploadAttachmentInputSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1), // Don't restrict to supported types - let storage layer validate
  sizeBytes: z.number().int().min(1), // Don't enforce max - let storage layer validate
  data: z.string().min(1, 'Data is required'),
});

interface IpcSuccess<T> {
  success: true;
  result: T;
}

interface IpcError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IpcOutcome<T> = IpcSuccess<T> | IpcError;

/**
 * Interface for service errors that have a code property.
 * Used by handleIpcCall to extract error codes.
 */
interface ServiceError extends Error {
  readonly code: string;
}

/**
 * Type guard to check if an error is a ServiceError (has code property)
 */
function isServiceError(error: unknown): error is ServiceError {
  return (
    error instanceof Error && 'code' in error && typeof (error as ServiceError).code === 'string'
  );
}

/**
 * Wraps an IPC handler function with standardized error handling.
 * Catches service errors and converts them to IpcError format.
 *
 * @param fn - The function to execute
 * @param errorClass - Optional specific error class to catch. If not provided, catches any ServiceError.
 * @param fallbackCode - Code to use when error doesn't have a code property (e.g., for DocumentNotFoundError)
 */
function handleIpcCall<T>(
  fn: () => T,
  errorClass?: new (...args: never[]) => Error,
  fallbackCode?: string
): IpcOutcome<T> {
  try {
    const result = fn();
    return { success: true, result };
  } catch (error) {
    // If a specific error class is provided, only catch that type
    if (errorClass !== undefined) {
      if (error instanceof errorClass) {
        const code = isServiceError(error) ? error.code : (fallbackCode ?? 'UNKNOWN');
        return {
          success: false,
          error: { code, message: error.message },
        };
      }
      throw error;
    }

    // If no error class specified, catch any ServiceError
    if (isServiceError(error)) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }
    throw error;
  }
}

export interface IpcHandlers {
  getDocument: (objectId: string) => IpcOutcome<GetDocumentResult>;
  applyBlockPatch: (request: unknown) => IpcOutcome<ApplyBlockPatchResult>;
  getOrCreateTodayDailyNote: () => IpcOutcome<GetOrCreateResult>;
  getOrCreateDailyNoteByDate: (dateKey: string) => IpcOutcome<GetOrCreateResult>;
  listObjects: (
    options?: ListObjectsOptions
  ) => IpcOutcome<ObjectSummary[] | ObjectSummaryWithProperties[]>;
  getObject: (objectId: string) => IpcOutcome<ObjectDetails | null>;
  getObjectTypeByKey: (typeKey: string) => IpcOutcome<ObjectType | null>;
  searchBlocks: (query: string, filters?: SearchFilters) => IpcOutcome<SearchResult[]>;
  getBacklinks: (objectId: string) => IpcOutcome<BacklinkResult[]>;
  getUnlinkedMentions: (objectId: string) => IpcOutcome<UnlinkedMentionResult[]>;
  createObject: (
    typeKey: string,
    title: string,
    properties?: Record<string, unknown>
  ) => IpcOutcome<CreatedObject>;
  duplicateObject: (objectId: string) => IpcOutcome<DuplicateObjectResponse>;
  updateObject: (request: UpdateObjectRequest) => IpcOutcome<UpdateObjectResponse>;
  // Tag operations
  createTag: (input: CreateTagInput) => IpcOutcome<Tag>;
  getTag: (tagId: string) => IpcOutcome<Tag | null>;
  updateTag: (tagId: string, input: UpdateTagInput) => IpcOutcome<Tag>;
  deleteTag: (tagId: string) => IpcOutcome<void>;
  listTags: (options?: ListTagsOptions) => IpcOutcome<TagWithUsage[]>;
  assignTags: (objectId: string, tagIds: string[]) => IpcOutcome<AssignTagsResult>;
  removeTags: (objectId: string, tagIds: string[]) => IpcOutcome<RemoveTagsResult>;
  getObjectTags: (objectId: string) => IpcOutcome<Tag[]>;
  // Task operations
  getTodaysTasks: () => IpcOutcome<TaskObject[]>;
  getOverdueTasks: () => IpcOutcome<TaskObject[]>;
  getTasksByStatus: (status: TaskStatus) => IpcOutcome<TaskObject[]>;
  getUpcomingTasks: (days: number) => IpcOutcome<TaskObject[]>;
  getInboxTasks: () => IpcOutcome<TaskObject[]>;
  getTasksByPriority: (priority: TaskPriority) => IpcOutcome<TaskObject[]>;
  getCompletedTasks: (options?: CompletedTasksOptions) => IpcOutcome<TaskObject[]>;
  getTasksByDueDate: (dateKey: string) => IpcOutcome<TaskObject[]>;
  completeTask: (taskId: string) => IpcOutcome<void>;
  reopenTask: (taskId: string) => IpcOutcome<void>;
  // Attachment operations
  uploadAttachment: (request: unknown) => IpcOutcome<UploadAttachmentResult>;
  getAttachment: (attachmentId: string) => IpcOutcome<Attachment | null>;
  listAttachments: (options?: ListAttachmentsOptions) => IpcOutcome<Attachment[]>;
  linkBlockToAttachment: (blockId: string, attachmentId: string) => IpcOutcome<void>;
  unlinkBlockFromAttachment: (blockId: string, attachmentId: string) => IpcOutcome<void>;
  getBlockAttachments: (blockId: string) => IpcOutcome<Attachment[]>;
  // Calendar operations
  getEventsInDateRange: (startDate: string, endDate: string) => IpcOutcome<CalendarItem[]>;
  // Daily note operations
  getDatesWithDailyNotes: (startDate: string, endDate: string) => IpcOutcome<string[]>;
  // Recent objects operations
  recordView: (objectId: string) => IpcOutcome<void>;
  getRecentObjects: (limit?: number) => IpcOutcome<RecentObjectSummary[]>;
  // Pinned objects operations
  pinObject: (objectId: string) => IpcOutcome<void>;
  unpinObject: (objectId: string) => IpcOutcome<void>;
  isPinned: (objectId: string) => IpcOutcome<boolean>;
  getPinnedObjects: () => IpcOutcome<PinnedObjectSummary[]>;
  reorderPinnedObjects: (orderedIds: string[]) => IpcOutcome<void>;
  // Settings operations
  getSettings: () => IpcOutcome<UserSettings>;
  updateSettings: (updates: Partial<UserSettings>) => IpcOutcome<void>;
  resetSettings: () => IpcOutcome<void>;
  // Trash operations
  listDeletedObjects: (options?: ListDeletedObjectsOptions) => IpcOutcome<DeletedObjectSummary[]>;
  restoreObject: (objectId: string) => IpcOutcome<RestoreObjectResult>;
}

export function createIpcHandlers(db: TypenoteDb, fileService: FileService): IpcHandlers {
  return {
    getDocument: (objectId) =>
      handleIpcCall(() => getDocument(db, objectId), DocumentNotFoundError, 'NOT_FOUND_OBJECT'),

    applyBlockPatch: (request) => {
      const parseResult = ApplyBlockPatchInputSchema.safeParse(request);
      if (!parseResult.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION',
            message: parseResult.error.errors[0]?.message ?? 'Validation failed',
          },
        };
      }

      const outcome: ApplyBlockPatchOutcome = applyBlockPatchStorage(db, parseResult.data);
      if (outcome.success) {
        return { success: true, result: outcome.result };
      }
      return {
        success: false,
        error: { code: outcome.error.code, message: outcome.error.message },
      };
    },

    getOrCreateTodayDailyNote: () => handleIpcCall(() => getOrCreateTodayDailyNoteStorage(db)),

    getOrCreateDailyNoteByDate: (dateKey) =>
      handleIpcCall(() => getOrCreateDailyNoteByDateStorage(db, dateKey), DailyNoteError),

    listObjects: (options) => handleIpcCall(() => listObjectsStorage(db, options)),

    getObject: (objectId) => handleIpcCall(() => getObjectStorage(db, objectId)),

    getObjectTypeByKey: (typeKey) => handleIpcCall(() => getObjectTypeByKeyStorage(db, typeKey)),

    searchBlocks: (query, filters) => handleIpcCall(() => searchBlocksStorage(db, query, filters)),

    getBacklinks: (objectId) => handleIpcCall(() => getBacklinksStorage(db, objectId)),

    getUnlinkedMentions: (objectId) =>
      handleIpcCall(() => getUnlinkedMentionsToStorage(db, objectId)),

    createObject: (typeKey, title, properties) => {
      // Special case: needs to emit event after successful creation
      const outcome = handleIpcCall(
        () => createObjectStorage(db, typeKey, title, properties),
        CreateObjectError
      );

      if (outcome.success) {
        typenoteEvents.emit({
          type: 'object:created',
          payload: {
            id: outcome.result.id,
            typeKey: outcome.result.typeKey,
            title: outcome.result.title,
            createdAt: outcome.result.createdAt,
          },
        });
      }

      return outcome;
    },

    duplicateObject: (objectId) => {
      // duplicateObject throws plain ApiError objects (not Error instances)
      // so we need to handle it manually instead of using handleIpcCall
      try {
        const result = duplicateObjectStorage(db, objectId);
        return { success: true, result };
      } catch (error) {
        // Check if it's an ApiError object (has code and message properties)
        if (
          error !== null &&
          typeof error === 'object' &&
          'code' in error &&
          'message' in error &&
          typeof error.code === 'string' &&
          typeof error.message === 'string'
        ) {
          const apiError = error as { code: string; message: string };
          return {
            success: false,
            error: { code: apiError.code, message: apiError.message },
          };
        }
        // Unexpected error type - rethrow
        throw error;
      }
    },

    updateObject: (request) => {
      // Validate request with Zod
      const parseResult = UpdateObjectRequestSchema.safeParse(request);
      if (!parseResult.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION',
            message: parseResult.error.errors[0]?.message ?? 'Validation failed',
          },
        };
      }

      const { objectId, baseDocVersion, patch, propertyMapping } = parseResult.data;

      const outcome = handleIpcCall(
        () =>
          updateObjectStorage(db, {
            objectId,
            baseDocVersion,
            patch,
            propertyMapping,
          }),
        UpdateObjectError
      );

      if (!outcome.success) {
        return outcome;
      }

      // Transform to API response format
      const result = outcome.result;
      const response: UpdateObjectResponse = {
        object: {
          id: result.id,
          typeId: result.typeId,
          typeKey: result.typeKey,
          title: result.title,
          properties: result.properties,
          docVersion: result.docVersion,
          updatedAt: result.updatedAt.toISOString(),
        },
      };

      if (result.droppedProperties !== undefined) {
        response.droppedProperties = result.droppedProperties;
      }

      return { success: true, result: response };
    },

    // Tag operations
    createTag: (input) => handleIpcCall(() => createTagStorage(db, input), TagServiceError),

    getTag: (tagId) => handleIpcCall(() => getTagStorage(db, tagId)),

    updateTag: (tagId, input) =>
      handleIpcCall(() => updateTagStorage(db, tagId, input), TagServiceError),

    deleteTag: (tagId) =>
      handleIpcCall(() => {
        deleteTagStorage(db, tagId);
        return undefined;
      }, TagServiceError),

    listTags: (options) => handleIpcCall(() => listTagsStorage(db, options)),

    assignTags: (objectId, tagIds) =>
      handleIpcCall(() => assignTagsStorage(db, { objectId, tagIds }), TagServiceError),

    removeTags: (objectId, tagIds) =>
      handleIpcCall(() => removeTagsStorage(db, { objectId, tagIds }), TagServiceError),

    getObjectTags: (objectId) => handleIpcCall(() => getObjectTagsStorage(db, objectId)),

    // Task operations
    getTodaysTasks: () => handleIpcCall(() => getTodaysTasksStorage(db)),

    getOverdueTasks: () => handleIpcCall(() => getOverdueTasksStorage(db)),

    getTasksByStatus: (status) => handleIpcCall(() => getTasksByStatusStorage(db, status)),

    getUpcomingTasks: (days) => handleIpcCall(() => getUpcomingTasksStorage(db, days)),

    getInboxTasks: () => handleIpcCall(() => getInboxTasksStorage(db)),

    getTasksByPriority: (priority) => handleIpcCall(() => getTasksByPriorityStorage(db, priority)),

    getCompletedTasks: (options) => handleIpcCall(() => getCompletedTasksStorage(db, options)),

    getTasksByDueDate: (dateKey) => handleIpcCall(() => getTasksByDueDateStorage(db, dateKey)),

    completeTask: (taskId) =>
      handleIpcCall(
        () => {
          completeTaskStorage(db, taskId);
          return undefined;
        },
        Error,
        'NOT_FOUND'
      ),

    reopenTask: (taskId) =>
      handleIpcCall(
        () => {
          reopenTaskStorage(db, taskId);
          return undefined;
        },
        Error,
        'NOT_FOUND'
      ),

    // Attachment operations
    uploadAttachment: (request) => {
      const parseResult = IpcUploadAttachmentInputSchema.safeParse(request);
      if (!parseResult.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION',
            message: parseResult.error.errors[0]?.message ?? 'Validation failed',
          },
        };
      }

      const { filename, mimeType, sizeBytes, data } = parseResult.data;
      const fileData = Buffer.from(data, 'base64');

      return handleIpcCall(
        () =>
          uploadAttachmentStorage(db, fileService, {
            filename,
            mimeType: mimeType as import('@typenote/api').SupportedMimeType,
            sizeBytes,
            fileData,
          }),
        AttachmentServiceError
      );
    },

    getAttachment: (attachmentId) => handleIpcCall(() => getAttachmentStorage(db, attachmentId)),

    listAttachments: (options) => handleIpcCall(() => listAttachmentsStorage(db, options)),

    linkBlockToAttachment: (blockId, attachmentId) =>
      handleIpcCall(() => {
        linkBlockToAttachmentStorage(db, blockId, attachmentId);
        return undefined;
      }, AttachmentServiceError),

    unlinkBlockFromAttachment: (blockId, attachmentId) =>
      handleIpcCall(() => {
        unlinkBlockFromAttachmentStorage(db, blockId, attachmentId);
        return undefined;
      }),

    getBlockAttachments: (blockId) => handleIpcCall(() => getBlockAttachmentsStorage(db, blockId)),

    // Calendar operations
    getEventsInDateRange: (startDate, endDate) =>
      handleIpcCall(() => getEventsInDateRangeStorage(db, startDate, endDate)),

    // Daily note operations
    getDatesWithDailyNotes: (startDate, endDate) =>
      handleIpcCall(() => {
        const result = listDailyNotesStorage(db, { startDate, endDate });
        return result.items.map((item) => item.properties.date_key);
      }),

    // Recent objects operations
    recordView: (objectId) => {
      recordViewStorage(db, objectId);
      return { success: true, result: undefined };
    },

    getRecentObjects: (limit) => handleIpcCall(() => getRecentObjectsStorage(db, limit)),

    // Pinned objects operations
    pinObject: (objectId) =>
      handleIpcCall(() => {
        pinObjectStorage(db, objectId);
        return undefined;
      }),

    unpinObject: (objectId) =>
      handleIpcCall(() => {
        unpinObjectStorage(db, objectId);
        return undefined;
      }),

    isPinned: (objectId) => handleIpcCall(() => isPinnedStorage(db, objectId)),

    getPinnedObjects: () => handleIpcCall(() => getPinnedObjectsStorage(db)),

    reorderPinnedObjects: (orderedIds) =>
      handleIpcCall(() => {
        reorderPinnedObjectsStorage(db, orderedIds);
        return undefined;
      }),

    // Settings operations
    getSettings: () => handleIpcCall(() => getSettingsStorage(db)),

    updateSettings: (updates) =>
      handleIpcCall(() => {
        updateSettingsStorage(db, updates);
        return undefined;
      }),

    resetSettings: () =>
      handleIpcCall(() => {
        resetSettingsStorage(db);
        return undefined;
      }),

    // Trash operations
    listDeletedObjects: (options) => handleIpcCall(() => listDeletedObjectsStorage(db, options)),

    restoreObject: (objectId) => {
      const outcome = handleIpcCall(() => restoreObjectStorage(db, objectId), TrashServiceError);
      if (outcome.success) {
        typenoteEvents.emit({
          type: 'object:restored',
          payload: {
            id: outcome.result.id,
            title: outcome.result.title,
            typeKey: outcome.result.typeKey,
          },
        });
      }
      return outcome;
    },
  };
}

/**
 * Sets up IPC handlers with auto-registration.
 * This is the single source of truth - adding a handler here automatically registers it.
 */
export function setupIpcHandlers(db: TypenoteDb, fileService: FileService): void {
  const handlers = createIpcHandlers(db, fileService);

  // Auto-register all handlers with the typenote: prefix
  for (const [name, handler] of Object.entries(handlers)) {
    ipcMain.handle(`typenote:${name}`, (_event, ...args: unknown[]) =>
      (handler as (...args: unknown[]) => unknown)(...args)
    );
  }
}
