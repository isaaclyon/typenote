import { ipcMain } from 'electron';
import {
  getDocument,
  applyBlockPatch as applyBlockPatchStorage,
  getOrCreateTodayDailyNote as getOrCreateTodayDailyNoteStorage,
  getOrCreateDailyNoteByDate as getOrCreateDailyNoteByDateStorage,
  listObjects as listObjectsStorage,
  getObject as getObjectStorage,
  searchBlocks as searchBlocksStorage,
  getBacklinks as getBacklinksStorage,
  createObject as createObjectStorage,
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
  DocumentNotFoundError,
  CreateObjectError,
  DailyNoteError,
  TagServiceError,
  type TypenoteDb,
  type GetDocumentResult,
  type ApplyBlockPatchOutcome,
  type GetOrCreateResult,
  type ObjectSummary,
  type ObjectDetails,
  type SearchResult,
  type SearchFilters,
  type BacklinkResult,
  type CreatedObject,
  type TaskObject,
  type CompletedTasksOptions,
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
} from '@typenote/api';

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

export interface IpcHandlers {
  getDocument: (objectId: string) => IpcOutcome<GetDocumentResult>;
  applyBlockPatch: (request: unknown) => IpcOutcome<ApplyBlockPatchResult>;
  getOrCreateTodayDailyNote: () => IpcOutcome<GetOrCreateResult>;
  getOrCreateDailyNoteByDate: (dateKey: string) => IpcOutcome<GetOrCreateResult>;
  listObjects: () => IpcOutcome<ObjectSummary[]>;
  getObject: (objectId: string) => IpcOutcome<ObjectDetails | null>;
  searchBlocks: (query: string, filters?: SearchFilters) => IpcOutcome<SearchResult[]>;
  getBacklinks: (objectId: string) => IpcOutcome<BacklinkResult[]>;
  createObject: (
    typeKey: string,
    title: string,
    properties?: Record<string, unknown>
  ) => IpcOutcome<CreatedObject>;
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
}

export function createIpcHandlers(db: TypenoteDb): IpcHandlers {
  return {
    getDocument: (objectId: string): IpcOutcome<GetDocumentResult> => {
      try {
        const result = getDocument(db, objectId);
        return { success: true, result };
      } catch (error) {
        if (error instanceof DocumentNotFoundError) {
          return {
            success: false,
            error: { code: 'NOT_FOUND_OBJECT', message: error.message },
          };
        }
        throw error;
      }
    },
    applyBlockPatch: (request: unknown): IpcOutcome<ApplyBlockPatchResult> => {
      // Validate input with Zod
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

      // Apply the patch
      const outcome: ApplyBlockPatchOutcome = applyBlockPatchStorage(db, parseResult.data);

      if (outcome.success) {
        return { success: true, result: outcome.result };
      } else {
        return {
          success: false,
          error: { code: outcome.error.code, message: outcome.error.message },
        };
      }
    },
    getOrCreateTodayDailyNote: (): IpcOutcome<GetOrCreateResult> => {
      const result = getOrCreateTodayDailyNoteStorage(db);
      return { success: true, result };
    },
    getOrCreateDailyNoteByDate: (dateKey: string): IpcOutcome<GetOrCreateResult> => {
      try {
        const result = getOrCreateDailyNoteByDateStorage(db, dateKey);
        return { success: true, result };
      } catch (error) {
        if (error instanceof DailyNoteError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    listObjects: (): IpcOutcome<ObjectSummary[]> => {
      const result = listObjectsStorage(db);
      return { success: true, result };
    },
    getObject: (objectId: string): IpcOutcome<ObjectDetails | null> => {
      const result = getObjectStorage(db, objectId);
      return { success: true, result };
    },
    searchBlocks: (query: string, filters?: SearchFilters): IpcOutcome<SearchResult[]> => {
      const results = searchBlocksStorage(db, query, filters);
      return { success: true, result: results };
    },
    getBacklinks: (objectId: string): IpcOutcome<BacklinkResult[]> => {
      const results = getBacklinksStorage(db, objectId);
      return { success: true, result: results };
    },
    createObject: (
      typeKey: string,
      title: string,
      properties?: Record<string, unknown>
    ): IpcOutcome<CreatedObject> => {
      try {
        const result = createObjectStorage(db, typeKey, title, properties);
        return { success: true, result };
      } catch (error) {
        if (error instanceof CreateObjectError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    // Tag operations
    createTag: (input: CreateTagInput): IpcOutcome<Tag> => {
      try {
        const result = createTagStorage(db, input);
        return { success: true, result };
      } catch (error) {
        if (error instanceof TagServiceError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    getTag: (tagId: string): IpcOutcome<Tag | null> => {
      const result = getTagStorage(db, tagId);
      return { success: true, result };
    },
    updateTag: (tagId: string, input: UpdateTagInput): IpcOutcome<Tag> => {
      try {
        const result = updateTagStorage(db, tagId, input);
        return { success: true, result };
      } catch (error) {
        if (error instanceof TagServiceError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    deleteTag: (tagId: string): IpcOutcome<void> => {
      try {
        deleteTagStorage(db, tagId);
        return { success: true, result: undefined };
      } catch (error) {
        if (error instanceof TagServiceError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    listTags: (options?: ListTagsOptions): IpcOutcome<TagWithUsage[]> => {
      const result = listTagsStorage(db, options);
      return { success: true, result };
    },
    assignTags: (objectId: string, tagIds: string[]): IpcOutcome<AssignTagsResult> => {
      try {
        const result = assignTagsStorage(db, { objectId, tagIds });
        return { success: true, result };
      } catch (error) {
        if (error instanceof TagServiceError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    removeTags: (objectId: string, tagIds: string[]): IpcOutcome<RemoveTagsResult> => {
      try {
        const result = removeTagsStorage(db, { objectId, tagIds });
        return { success: true, result };
      } catch (error) {
        if (error instanceof TagServiceError) {
          return {
            success: false,
            error: { code: error.code, message: error.message },
          };
        }
        throw error;
      }
    },
    getObjectTags: (objectId: string): IpcOutcome<Tag[]> => {
      const result = getObjectTagsStorage(db, objectId);
      return { success: true, result };
    },
    // Task operations
    getTodaysTasks: (): IpcOutcome<TaskObject[]> => {
      const result = getTodaysTasksStorage(db);
      return { success: true, result };
    },
    getOverdueTasks: (): IpcOutcome<TaskObject[]> => {
      const result = getOverdueTasksStorage(db);
      return { success: true, result };
    },
    getTasksByStatus: (status: TaskStatus): IpcOutcome<TaskObject[]> => {
      const result = getTasksByStatusStorage(db, status);
      return { success: true, result };
    },
    getUpcomingTasks: (days: number): IpcOutcome<TaskObject[]> => {
      const result = getUpcomingTasksStorage(db, days);
      return { success: true, result };
    },
    getInboxTasks: (): IpcOutcome<TaskObject[]> => {
      const result = getInboxTasksStorage(db);
      return { success: true, result };
    },
    getTasksByPriority: (priority: TaskPriority): IpcOutcome<TaskObject[]> => {
      const result = getTasksByPriorityStorage(db, priority);
      return { success: true, result };
    },
    getCompletedTasks: (options?: CompletedTasksOptions): IpcOutcome<TaskObject[]> => {
      const result = getCompletedTasksStorage(db, options);
      return { success: true, result };
    },
    getTasksByDueDate: (dateKey: string): IpcOutcome<TaskObject[]> => {
      const result = getTasksByDueDateStorage(db, dateKey);
      return { success: true, result };
    },
    completeTask: (taskId: string): IpcOutcome<void> => {
      try {
        completeTaskStorage(db, taskId);
        return { success: true, result: undefined };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            error: { code: 'NOT_FOUND', message: error.message },
          };
        }
        throw error;
      }
    },
    reopenTask: (taskId: string): IpcOutcome<void> => {
      try {
        reopenTaskStorage(db, taskId);
        return { success: true, result: undefined };
      } catch (error) {
        if (error instanceof Error) {
          return {
            success: false,
            error: { code: 'NOT_FOUND', message: error.message },
          };
        }
        throw error;
      }
    },
  };
}

/**
 * Sets up IPC handlers with auto-registration.
 * This is the single source of truth - adding a handler here automatically registers it.
 */
export function setupIpcHandlers(db: TypenoteDb): void {
  const handlers = createIpcHandlers(db);

  // Auto-register all handlers with the typenote: prefix
  for (const [name, handler] of Object.entries(handlers)) {
    ipcMain.handle(`typenote:${name}`, (_event, ...args: unknown[]) =>
      (handler as (...args: unknown[]) => unknown)(...args)
    );
  }
}
