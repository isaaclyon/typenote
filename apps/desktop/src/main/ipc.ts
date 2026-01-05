import { ipcMain } from 'electron';
import {
  getDocument,
  applyBlockPatch as applyBlockPatchStorage,
  getOrCreateTodayDailyNote as getOrCreateTodayDailyNoteStorage,
  listObjects as listObjectsStorage,
  DocumentNotFoundError,
  type TypenoteDb,
  type GetDocumentResult,
  type ApplyBlockPatchOutcome,
  type GetOrCreateResult,
  type ObjectSummary,
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
  listObjects: () => IpcOutcome<ObjectSummary[]>;
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
    listObjects: (): IpcOutcome<ObjectSummary[]> => {
      const result = listObjectsStorage(db);
      return { success: true, result };
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
