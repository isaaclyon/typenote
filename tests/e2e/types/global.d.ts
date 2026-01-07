// Type declarations for window.typenoteAPI in E2E tests
// These mirror the types from apps/desktop/src/preload/api.d.ts

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

interface DailyNote {
  id: string;
  title: string;
  typeKey: string;
}

interface GetOrCreateResult {
  dailyNote: DailyNote;
  created: boolean;
}

interface ObjectSummary {
  id: string;
  title: string;
  typeKey: string;
  createdAt: string;
  updatedAt: string;
}

interface ObjectDetails {
  id: string;
  title: string;
  typeKey: string;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CreatedObject {
  id: string;
  title: string;
}

interface Block {
  id: string;
  type: string;
  content: unknown;
  indent: number;
}

interface GetDocumentResult {
  objectId: string;
  docVersion: number;
  blocks: Block[];
}

interface ApplyBlockPatchResult {
  newDocVersion: number;
}

interface SearchResult {
  blockId: string;
  objectId: string;
  objectTitle: string;
  snippet: string;
}

interface BacklinkResult {
  sourceObjectId: string;
  sourceObjectTitle: string;
  sourceBlockId: string;
}

export interface TypenoteAPI {
  version: string;
  getDocument: (objectId: string) => Promise<IpcOutcome<GetDocumentResult>>;
  applyBlockPatch: (request: unknown) => Promise<IpcOutcome<ApplyBlockPatchResult>>;
  getOrCreateTodayDailyNote: () => Promise<IpcOutcome<GetOrCreateResult>>;
  getOrCreateDailyNoteByDate: (dateKey: string) => Promise<IpcOutcome<GetOrCreateResult>>;
  listObjects: () => Promise<IpcOutcome<ObjectSummary[]>>;
  getObject: (objectId: string) => Promise<IpcOutcome<ObjectDetails | null>>;
  searchBlocks: (
    query: string,
    filters?: { objectId?: string; limit?: number }
  ) => Promise<IpcOutcome<SearchResult[]>>;
  getBacklinks: (objectId: string) => Promise<IpcOutcome<BacklinkResult[]>>;
  createObject: (
    typeKey: string,
    title: string,
    properties?: Record<string, unknown>
  ) => Promise<IpcOutcome<CreatedObject>>;
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}

export {};
