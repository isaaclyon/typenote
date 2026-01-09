import type {
  GetDocumentResult,
  ObjectSummary,
  ApplyBlockPatchResult,
  Attachment,
  UploadAttachmentResult,
} from '@typenote/api';
import type {
  GetOrCreateResult,
  ObjectDetails,
  SearchResult,
  BacklinkResult,
  CreatedObject,
  CalendarItem,
} from '@typenote/storage';

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
  // Attachment operations
  uploadAttachment: (input: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    data: string;
  }) => Promise<IpcOutcome<UploadAttachmentResult>>;
  getAttachment: (attachmentId: string) => Promise<IpcOutcome<Attachment | null>>;
  listAttachments: (options?: { orphanedOnly?: boolean }) => Promise<IpcOutcome<Attachment[]>>;
  linkBlockToAttachment: (blockId: string, attachmentId: string) => Promise<IpcOutcome<void>>;
  unlinkBlockFromAttachment: (blockId: string, attachmentId: string) => Promise<IpcOutcome<void>>;
  getBlockAttachments: (blockId: string) => Promise<IpcOutcome<Attachment[]>>;

  // Calendar operations
  getEventsInDateRange: (startDate: string, endDate: string) => Promise<IpcOutcome<CalendarItem[]>>;
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}
