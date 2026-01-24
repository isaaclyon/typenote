import { contextBridge, ipcRenderer } from 'electron';
import type { TypenoteEvent } from '@typenote/api';

// Expose typed API to renderer
contextBridge.exposeInMainWorld('typenoteAPI', {
  version: '0.1.0',

  getDocument: (objectId: string) => ipcRenderer.invoke('typenote:getDocument', objectId),

  applyBlockPatch: (request: unknown) => ipcRenderer.invoke('typenote:applyBlockPatch', request),

  getOrCreateTodayDailyNote: () => ipcRenderer.invoke('typenote:getOrCreateTodayDailyNote'),

  getOrCreateDailyNoteByDate: (dateKey: string) =>
    ipcRenderer.invoke('typenote:getOrCreateDailyNoteByDate', dateKey),

  listObjects: (options?: {
    typeKey?: string;
    includeProperties?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => ipcRenderer.invoke('typenote:listObjects', options),

  getObjectsCreatedOnDate: (dateKey: string) =>
    ipcRenderer.invoke('typenote:getObjectsCreatedOnDate', dateKey),

  getObject: (objectId: string) => ipcRenderer.invoke('typenote:getObject', objectId),

  getObjectTypeByKey: (typeKey: string) =>
    ipcRenderer.invoke('typenote:getObjectTypeByKey', typeKey),

  listObjectTypes: (options?: { builtInOnly?: boolean; customOnly?: boolean }) =>
    ipcRenderer.invoke('typenote:listObjectTypes', options),

  createObjectType: (input: {
    key: string;
    name: string;
    // Optional properties - omit entirely if not needed (don't pass undefined with exactOptionalPropertyTypes)
    icon?: string;
    color?: string;
    pluralName?: string;
    description?: string;
  }) => ipcRenderer.invoke('typenote:createObjectType', input),

  updateObjectType: (
    id: string,
    input: {
      name?: string;
      icon?: string | null;
      color?: string | null;
      pluralName?: string | null;
      description?: string | null;
    }
  ) => ipcRenderer.invoke('typenote:updateObjectType', id, input),

  deleteObjectType: (id: string) => ipcRenderer.invoke('typenote:deleteObjectType', id),

  searchBlocks: (query: string, filters?: { objectId?: string; limit?: number }) =>
    ipcRenderer.invoke('typenote:searchBlocks', query, filters),

  getBacklinks: (objectId: string) => ipcRenderer.invoke('typenote:getBacklinks', objectId),

  getUnlinkedMentions: (objectId: string) =>
    ipcRenderer.invoke('typenote:getUnlinkedMentions', objectId),

  createObject: (typeKey: string, title: string, properties?: Record<string, unknown>) =>
    ipcRenderer.invoke('typenote:createObject', typeKey, title, properties),

  duplicateObject: (objectId: string) => ipcRenderer.invoke('typenote:duplicateObject', objectId),

  updateObject: (request: {
    objectId: string;
    baseDocVersion?: number;
    patch: {
      title?: string;
      typeKey?: string;
      properties?: Record<string, unknown>;
    };
    propertyMapping?: Record<string, string>;
  }) => ipcRenderer.invoke('typenote:updateObject', request),

  // Tag operations
  createTag: (input: {
    name: string;
    slug: string;
    color?: string | null;
    icon?: string | null;
    description?: string;
  }) => ipcRenderer.invoke('typenote:createTag', input),

  getTag: (tagId: string) => ipcRenderer.invoke('typenote:getTag', tagId),

  updateTag: (
    tagId: string,
    input: {
      name?: string;
      slug?: string;
      color?: string | null;
      icon?: string | null;
      description?: string | null;
    }
  ) => ipcRenderer.invoke('typenote:updateTag', tagId, input),

  deleteTag: (tagId: string) => ipcRenderer.invoke('typenote:deleteTag', tagId),

  listTags: (options?: { includeUsageCount?: boolean; sortBy?: string; sortOrder?: string }) =>
    ipcRenderer.invoke('typenote:listTags', options),

  assignTags: (objectId: string, tagIds: string[]) =>
    ipcRenderer.invoke('typenote:assignTags', objectId, tagIds),

  removeTags: (objectId: string, tagIds: string[]) =>
    ipcRenderer.invoke('typenote:removeTags', objectId, tagIds),

  getObjectTags: (objectId: string) => ipcRenderer.invoke('typenote:getObjectTags', objectId),

  // Task operations
  getTodaysTasks: () => ipcRenderer.invoke('typenote:getTodaysTasks'),

  getOverdueTasks: () => ipcRenderer.invoke('typenote:getOverdueTasks'),

  getTasksByStatus: (status: 'Backlog' | 'Todo' | 'InProgress' | 'Done') =>
    ipcRenderer.invoke('typenote:getTasksByStatus', status),

  getUpcomingTasks: (days: number) => ipcRenderer.invoke('typenote:getUpcomingTasks', days),

  getInboxTasks: () => ipcRenderer.invoke('typenote:getInboxTasks'),

  getTasksByPriority: (priority: 'Low' | 'Medium' | 'High') =>
    ipcRenderer.invoke('typenote:getTasksByPriority', priority),

  getCompletedTasks: (options?: { startDate?: string; endDate?: string }) =>
    ipcRenderer.invoke('typenote:getCompletedTasks', options),

  getTasksByDueDate: (dateKey: string) => ipcRenderer.invoke('typenote:getTasksByDueDate', dateKey),

  completeTask: (taskId: string) => ipcRenderer.invoke('typenote:completeTask', taskId),

  reopenTask: (taskId: string) => ipcRenderer.invoke('typenote:reopenTask', taskId),

  // Attachment operations
  uploadAttachment: (input: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    data: string; // base64-encoded file data
  }) => ipcRenderer.invoke('typenote:uploadAttachment', input),

  getAttachment: (attachmentId: string) =>
    ipcRenderer.invoke('typenote:getAttachment', attachmentId),

  listAttachments: (options?: { orphanedOnly?: boolean }) =>
    ipcRenderer.invoke('typenote:listAttachments', options),

  linkBlockToAttachment: (blockId: string, attachmentId: string) =>
    ipcRenderer.invoke('typenote:linkBlockToAttachment', blockId, attachmentId),

  unlinkBlockFromAttachment: (blockId: string, attachmentId: string) =>
    ipcRenderer.invoke('typenote:unlinkBlockFromAttachment', blockId, attachmentId),

  getBlockAttachments: (blockId: string) =>
    ipcRenderer.invoke('typenote:getBlockAttachments', blockId),

  // Calendar operations
  getEventsInDateRange: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('typenote:getEventsInDateRange', startDate, endDate),

  // Daily note operations
  getDatesWithDailyNotes: (startDate: string, endDate: string) =>
    ipcRenderer.invoke('typenote:getDatesWithDailyNotes', startDate, endDate),

  // Recent objects operations
  recordView: (objectId: string) => ipcRenderer.invoke('typenote:recordView', objectId),

  getRecentObjects: (limit?: number) => ipcRenderer.invoke('typenote:getRecentObjects', limit),

  // Pinned objects operations
  pinObject: (objectId: string) => ipcRenderer.invoke('typenote:pinObject', objectId),

  unpinObject: (objectId: string) => ipcRenderer.invoke('typenote:unpinObject', objectId),

  isPinned: (objectId: string) => ipcRenderer.invoke('typenote:isPinned', objectId),

  getPinnedObjects: () => ipcRenderer.invoke('typenote:getPinnedObjects'),

  reorderPinnedObjects: (orderedIds: string[]) =>
    ipcRenderer.invoke('typenote:reorderPinnedObjects', orderedIds),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('typenote:getSettings'),

  updateSettings: (updates: {
    colorMode?: 'light' | 'dark' | 'system';
    weekStartDay?: 'sunday' | 'monday';
    spellcheck?: boolean;
    dateFormat?: 'iso' | 'us' | 'eu';
    timeFormat?: '12h' | '24h';
  }) => ipcRenderer.invoke('typenote:updateSettings', updates),

  resetSettings: () => ipcRenderer.invoke('typenote:resetSettings'),

  // Trash operations
  listDeletedObjects: (options?: { limit?: number; typeKey?: string }) =>
    ipcRenderer.invoke('typenote:listDeletedObjects', options),

  restoreObject: (objectId: string) => ipcRenderer.invoke('typenote:restoreObject', objectId),

  softDeleteObject: (objectId: string) => ipcRenderer.invoke('typenote:softDeleteObject', objectId),

  // Event subscription
  onEvent: (callback: (event: TypenoteEvent) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: TypenoteEvent) => {
      callback(data);
    };
    ipcRenderer.on('typenote:event', listener);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('typenote:event', listener);
    };
  },
});
