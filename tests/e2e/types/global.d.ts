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
  targetBlockId: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  icon: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TagWithUsage extends Tag {
  usageCount: number;
}

interface CreateTagInput {
  name: string;
  slug: string;
  color?: string | null;
  icon?: string | null;
  description?: string;
}

interface UpdateTagInput {
  name?: string;
  slug?: string;
  color?: string | null;
  icon?: string | null;
  description?: string | null;
}

interface ListTagsOptions {
  includeUsageCount?: boolean;
  sortBy?: 'name' | 'createdAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

interface AssignTagsResult {
  objectId: string;
  assignedTagIds: string[];
  skippedTagIds: string[];
}

interface RemoveTagsResult {
  objectId: string;
  removedTagIds: string[];
  skippedTagIds: string[];
}

type TaskStatus = 'Backlog' | 'Todo' | 'InProgress' | 'Done';
type TaskPriority = 'Low' | 'Medium' | 'High';

interface TaskObject {
  id: string;
  typeId: string;
  title: string;
  properties: {
    status: TaskStatus;
    due_date?: string;
    priority?: TaskPriority;
  };
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CompletedTasksOptions {
  startDate?: string;
  endDate?: string;
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
}

declare global {
  interface Window {
    typenoteAPI: TypenoteAPI;
  }
}

export {};
