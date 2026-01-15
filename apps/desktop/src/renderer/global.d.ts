import type {
  GetDocumentResult,
  ObjectSummary,
  ApplyBlockPatchResult,
  Attachment,
  UploadAttachmentResult,
  TypenoteEvent,
  UserSettings,
  ObjectType,
  Tag,
  AssignTagsResult,
  RemoveTagsResult,
} from '@typenote/api';
import type {
  GetOrCreateResult,
  ObjectDetails,
  ObjectSummaryWithProperties,
  SearchResult,
  BacklinkResult,
  UnlinkedMentionResult,
  CreatedObject,
  CalendarItem,
  RecentObjectSummary,
  PinnedObjectSummary,
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

interface TypenoteAPI {
  version: string;
  getDocument: (objectId: string) => Promise<IpcOutcome<GetDocumentResult>>;
  applyBlockPatch: (request: unknown) => Promise<IpcOutcome<ApplyBlockPatchResult>>;
  getOrCreateTodayDailyNote: () => Promise<IpcOutcome<GetOrCreateResult>>;
  getOrCreateDailyNoteByDate: (dateKey: string) => Promise<IpcOutcome<GetOrCreateResult>>;
  listObjects: (options?: {
    typeKey?: string;
    includeProperties?: boolean;
  }) => Promise<IpcOutcome<ObjectSummary[] | ObjectSummaryWithProperties[]>>;
  getObject: (objectId: string) => Promise<IpcOutcome<ObjectDetails | null>>;
  getObjectTypeByKey: (typeKey: string) => Promise<IpcOutcome<ObjectType | null>>;
  searchBlocks: (
    query: string,
    filters?: { objectId?: string; limit?: number }
  ) => Promise<IpcOutcome<SearchResult[]>>;
  getBacklinks: (objectId: string) => Promise<IpcOutcome<BacklinkResult[]>>;
  getUnlinkedMentions: (objectId: string) => Promise<IpcOutcome<UnlinkedMentionResult[]>>;
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

  // Daily note operations
  getDatesWithDailyNotes: (startDate: string, endDate: string) => Promise<IpcOutcome<string[]>>;

  // Recent objects operations
  recordView: (objectId: string) => Promise<IpcOutcome<void>>;
  getRecentObjects: (limit?: number) => Promise<IpcOutcome<RecentObjectSummary[]>>;

  // Pinned objects operations
  pinObject: (objectId: string) => Promise<IpcOutcome<void>>;
  unpinObject: (objectId: string) => Promise<IpcOutcome<void>>;
  isPinned: (objectId: string) => Promise<IpcOutcome<boolean>>;
  getPinnedObjects: () => Promise<IpcOutcome<PinnedObjectSummary[]>>;
  reorderPinnedObjects: (orderedIds: string[]) => Promise<IpcOutcome<void>>;

  // Tag operations
  listTags: (options?: {
    includeUsageCount?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => Promise<IpcOutcome<Tag[]>>;
  assignTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<AssignTagsResult>>;
  removeTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<RemoveTagsResult>>;
  getObjectTags: (objectId: string) => Promise<IpcOutcome<Tag[]>>;

  // Settings operations
  getSettings: () => Promise<IpcOutcome<UserSettings>>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<IpcOutcome<void>>;
  resetSettings: () => Promise<IpcOutcome<void>>;

  // Events
  onEvent: (callback: (event: TypenoteEvent) => void) => () => void;
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}

export {};
