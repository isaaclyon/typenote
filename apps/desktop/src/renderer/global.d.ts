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

  // Document operations
  getDocument: (objectId: string) => Promise<IpcOutcome<GetDocumentResult>>;
  applyBlockPatch: (request: unknown) => Promise<IpcOutcome<ApplyBlockPatchResult>>;

  // Daily note operations
  getOrCreateTodayDailyNote: () => Promise<IpcOutcome<GetOrCreateResult>>;
  getOrCreateDailyNoteByDate: (dateKey: string) => Promise<IpcOutcome<GetOrCreateResult>>;
  getDatesWithDailyNotes: (startDate: string, endDate: string) => Promise<IpcOutcome<string[]>>;

  // Object operations
  listObjects: (options?: {
    typeKey?: string;
    includeProperties?: boolean;
  }) => Promise<IpcOutcome<ObjectSummary[] | ObjectSummaryWithProperties[]>>;
  getObjectsCreatedOnDate: (dateKey: string) => Promise<
    IpcOutcome<
      Array<{
        id: string;
        title: string;
        typeIcon: string | null;
        typeColor: string | null;
      }>
    >
  >;
  getObject: (objectId: string) => Promise<IpcOutcome<ObjectDetails | null>>;
  createObject: (
    typeKey: string,
    title: string,
    properties?: Record<string, unknown>
  ) => Promise<IpcOutcome<CreatedObject>>;
  duplicateObject: (objectId: string) => Promise<IpcOutcome<CreatedObject>>;
  updateObject: (request: {
    objectId: string;
    baseDocVersion?: number;
    patch: {
      title?: string;
      typeKey?: string;
      properties?: Record<string, unknown>;
    };
    propertyMapping?: Record<string, string>;
  }) => Promise<IpcOutcome<{ docVersion: number }>>;

  // Object type operations
  getObjectTypeByKey: (typeKey: string) => Promise<IpcOutcome<ObjectType | null>>;
  listObjectTypes: (options?: {
    builtInOnly?: boolean;
    customOnly?: boolean;
  }) => Promise<IpcOutcome<ObjectType[]>>;
  createObjectType: (input: {
    key: string;
    name: string;
    icon?: string;
    color?: string;
    pluralName?: string;
    description?: string;
  }) => Promise<IpcOutcome<ObjectType>>;
  updateObjectType: (
    id: string,
    input: {
      name?: string;
      icon?: string | null;
      color?: string | null;
      pluralName?: string | null;
      description?: string | null;
    }
  ) => Promise<IpcOutcome<ObjectType>>;
  deleteObjectType: (id: string) => Promise<IpcOutcome<void>>;

  // Search operations
  searchBlocks: (
    query: string,
    filters?: { objectId?: string; limit?: number }
  ) => Promise<IpcOutcome<SearchResult[]>>;
  getBacklinks: (objectId: string) => Promise<IpcOutcome<BacklinkResult[]>>;
  getUnlinkedMentions: (objectId: string) => Promise<IpcOutcome<UnlinkedMentionResult[]>>;

  // Tag operations
  createTag: (input: {
    name: string;
    slug: string;
    color?: string | null;
    icon?: string | null;
    description?: string;
  }) => Promise<IpcOutcome<Tag>>;
  getTag: (tagId: string) => Promise<IpcOutcome<Tag | null>>;
  updateTag: (
    tagId: string,
    input: {
      name?: string;
      slug?: string;
      color?: string | null;
      icon?: string | null;
      description?: string | null;
    }
  ) => Promise<IpcOutcome<Tag>>;
  deleteTag: (tagId: string) => Promise<IpcOutcome<void>>;
  listTags: (options?: {
    includeUsageCount?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => Promise<IpcOutcome<Tag[]>>;
  assignTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<AssignTagsResult>>;
  removeTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<RemoveTagsResult>>;
  getObjectTags: (objectId: string) => Promise<IpcOutcome<Tag[]>>;

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

  // Recent objects operations
  recordView: (objectId: string) => Promise<IpcOutcome<void>>;
  getRecentObjects: (limit?: number) => Promise<IpcOutcome<RecentObjectSummary[]>>;

  // Pinned objects operations
  pinObject: (objectId: string) => Promise<IpcOutcome<void>>;
  unpinObject: (objectId: string) => Promise<IpcOutcome<void>>;
  isPinned: (objectId: string) => Promise<IpcOutcome<boolean>>;
  getPinnedObjects: () => Promise<IpcOutcome<PinnedObjectSummary[]>>;
  reorderPinnedObjects: (orderedIds: string[]) => Promise<IpcOutcome<void>>;

  // Settings operations
  getSettings: () => Promise<IpcOutcome<UserSettings>>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<IpcOutcome<void>>;
  resetSettings: () => Promise<IpcOutcome<void>>;

  // Trash operations
  listDeletedObjects: (options?: {
    limit?: number;
    typeKey?: string;
  }) => Promise<IpcOutcome<ObjectSummary[]>>;
  restoreObject: (objectId: string) => Promise<IpcOutcome<void>>;

  // Events
  onEvent: (callback: (event: TypenoteEvent) => void) => () => void;
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}

export {};
