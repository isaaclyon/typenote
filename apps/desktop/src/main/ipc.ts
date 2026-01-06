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
  DocumentNotFoundError,
  CreateObjectError,
  DailyNoteError,
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
} from '@typenote/storage';
import { ApplyBlockPatchInputSchema, type ApplyBlockPatchResult } from '@typenote/api';

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
