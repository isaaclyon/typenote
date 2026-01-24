import type {
  ApplyBlockPatchInput,
  ApplyBlockPatchResult,
  Attachment,
  CreateObjectTypeInput,
  CreateTagInput,
  DuplicateObjectResponse,
  GetDocumentResult,
  ListObjectTypesOptions,
  ListTagsOptions,
  ObjectSummary,
  ObjectType,
  AssignTagsResult,
  RemoveTagsResult,
  Tag,
  TagWithUsage,
  TaskPriority,
  TaskStatus,
  TypenoteEvent,
  UpdateObjectRequest,
  UpdateObjectResponse,
  UpdateObjectTypeInput,
  UpdateTagInput,
  UploadAttachmentResult,
  UserSettings,
} from '@typenote/api';
import type {
  BacklinkResult,
  CalendarItem,
  CompletedTasksOptions,
  CreatedObject,
  DeletedObjectSummary,
  GetOrCreateResult,
  ListAttachmentsOptions,
  ListDeletedObjectsOptions,
  ListObjectsOptions,
  ObjectDetails,
  ObjectSummaryWithProperties,
  PinnedObjectSummary,
  RecentObjectSummary,
  RestoreObjectResult,
  SearchFilters,
  SearchResult,
  TaskObject,
  UnlinkedMentionResult,
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

export type IpcOutcome<T> = IpcSuccess<T> | IpcError;

export interface TypenoteAPI {
  version: string;

  // Document operations
  getDocument: (objectId: string) => Promise<IpcOutcome<GetDocumentResult>>;
  applyBlockPatch: (request: ApplyBlockPatchInput) => Promise<IpcOutcome<ApplyBlockPatchResult>>;

  // Daily note operations
  getOrCreateTodayDailyNote: () => Promise<IpcOutcome<GetOrCreateResult>>;
  getOrCreateDailyNoteByDate: (dateKey: string) => Promise<IpcOutcome<GetOrCreateResult>>;
  getDatesWithDailyNotes: (startDate: string, endDate: string) => Promise<IpcOutcome<string[]>>;

  // Object operations
  listObjects: (
    options?: ListObjectsOptions
  ) => Promise<IpcOutcome<ObjectSummary[] | ObjectSummaryWithProperties[]>>;
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
  duplicateObject: (objectId: string) => Promise<IpcOutcome<DuplicateObjectResponse>>;
  updateObject: (request: UpdateObjectRequest) => Promise<IpcOutcome<UpdateObjectResponse>>;

  // Object type operations
  getObjectTypeByKey: (typeKey: string) => Promise<IpcOutcome<ObjectType | null>>;
  listObjectTypes: (options?: ListObjectTypesOptions) => Promise<IpcOutcome<ObjectType[]>>;
  createObjectType: (input: CreateObjectTypeInput) => Promise<IpcOutcome<ObjectType>>;
  updateObjectType: (id: string, input: UpdateObjectTypeInput) => Promise<IpcOutcome<ObjectType>>;
  deleteObjectType: (id: string) => Promise<IpcOutcome<void>>;

  // Search operations
  searchBlocks: (query: string, filters?: SearchFilters) => Promise<IpcOutcome<SearchResult[]>>;
  getBacklinks: (objectId: string) => Promise<IpcOutcome<BacklinkResult[]>>;
  getUnlinkedMentions: (objectId: string) => Promise<IpcOutcome<UnlinkedMentionResult[]>>;

  // Tag operations
  createTag: (input: CreateTagInput) => Promise<IpcOutcome<Tag>>;
  getTag: (tagId: string) => Promise<IpcOutcome<Tag | null>>;
  updateTag: (tagId: string, input: UpdateTagInput) => Promise<IpcOutcome<Tag>>;
  deleteTag: (tagId: string) => Promise<IpcOutcome<void>>;
  listTags: (options?: ListTagsOptions) => Promise<IpcOutcome<TagWithUsage[]>>;
  assignTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<AssignTagsResult>>;
  removeTags: (objectId: string, tagIds: string[]) => Promise<IpcOutcome<RemoveTagsResult>>;
  getObjectTags: (objectId: string) => Promise<IpcOutcome<Tag[]>>;

  // Task operations
  getTodaysTasks: () => Promise<IpcOutcome<TaskObject[]>>;
  getOverdueTasks: () => Promise<IpcOutcome<TaskObject[]>>;
  getTasksByStatus: (status: TaskStatus) => Promise<IpcOutcome<TaskObject[]>>;
  getUpcomingTasks: (days: number) => Promise<IpcOutcome<TaskObject[]>>;
  getInboxTasks: () => Promise<IpcOutcome<TaskObject[]>>;
  getTasksByPriority: (priority: TaskPriority) => Promise<IpcOutcome<TaskObject[]>>;
  getCompletedTasks: (options?: CompletedTasksOptions) => Promise<IpcOutcome<TaskObject[]>>;
  getTasksByDueDate: (dateKey: string) => Promise<IpcOutcome<TaskObject[]>>;
  completeTask: (taskId: string) => Promise<IpcOutcome<void>>;
  reopenTask: (taskId: string) => Promise<IpcOutcome<void>>;

  // Attachment operations
  uploadAttachment: (input: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    data: string;
  }) => Promise<IpcOutcome<UploadAttachmentResult>>;
  getAttachment: (attachmentId: string) => Promise<IpcOutcome<Attachment | null>>;
  listAttachments: (options?: ListAttachmentsOptions) => Promise<IpcOutcome<Attachment[]>>;
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
  listDeletedObjects: (
    options?: ListDeletedObjectsOptions
  ) => Promise<IpcOutcome<DeletedObjectSummary[]>>;
  restoreObject: (objectId: string) => Promise<IpcOutcome<RestoreObjectResult>>;
  softDeleteObject: (objectId: string) => Promise<IpcOutcome<void>>;

  // Events
  onEvent: (callback: (event: TypenoteEvent) => void) => () => void;
}

type IpcHandler<T> = T extends (...args: infer Args) => Promise<IpcOutcome<infer Result>>
  ? (...args: Args) => IpcOutcome<Result>
  : never;

export type IpcHandlers = {
  [K in keyof TypenoteAPI as K extends 'version' | 'onEvent' ? never : K]: IpcHandler<
    TypenoteAPI[K]
  >;
};

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}
