import type { GetDocumentResult, GetOrCreateResult } from '@typenote/storage';
import type { ApplyBlockPatchResult } from '@typenote/api';

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

export interface TypenoteAPI {
  version: string;
  getDocument: (objectId: string) => Promise<IpcOutcome<GetDocumentResult>>;
  applyBlockPatch: (request: unknown) => Promise<IpcOutcome<ApplyBlockPatchResult>>;
  getOrCreateTodayDailyNote: () => Promise<IpcOutcome<GetOrCreateResult>>;
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}
