import { contextBridge, ipcRenderer } from 'electron';
import type { TypenoteEvent } from '@typenote/api';
import type { TypenoteAPI } from './api.js';

// Expose typed API to renderer
const api: TypenoteAPI = {
  version: '0.1.0',

  getDocument: (objectId) => ipcRenderer.invoke('typenote:getDocument', objectId),

  applyBlockPatch: (request) => ipcRenderer.invoke('typenote:applyBlockPatch', request),

  getOrCreateTodayDailyNote: () => ipcRenderer.invoke('typenote:getOrCreateTodayDailyNote'),

  getOrCreateDailyNoteByDate: (dateKey) =>
    ipcRenderer.invoke('typenote:getOrCreateDailyNoteByDate', dateKey),

  listObjects: (options) => ipcRenderer.invoke('typenote:listObjects', options),

  getObjectsCreatedOnDate: (dateKey) =>
    ipcRenderer.invoke('typenote:getObjectsCreatedOnDate', dateKey),

  getObject: (objectId) => ipcRenderer.invoke('typenote:getObject', objectId),

  getObjectTypeByKey: (typeKey) => ipcRenderer.invoke('typenote:getObjectTypeByKey', typeKey),

  listObjectTypes: (options) => ipcRenderer.invoke('typenote:listObjectTypes', options),

  createObjectType: (input) => ipcRenderer.invoke('typenote:createObjectType', input),

  updateObjectType: (id, input) => ipcRenderer.invoke('typenote:updateObjectType', id, input),

  deleteObjectType: (id) => ipcRenderer.invoke('typenote:deleteObjectType', id),

  searchBlocks: (query, filters) => ipcRenderer.invoke('typenote:searchBlocks', query, filters),

  getBacklinks: (objectId) => ipcRenderer.invoke('typenote:getBacklinks', objectId),

  getUnlinkedMentions: (objectId) => ipcRenderer.invoke('typenote:getUnlinkedMentions', objectId),

  createObject: (typeKey, title, properties) =>
    ipcRenderer.invoke('typenote:createObject', typeKey, title, properties),

  duplicateObject: (objectId) => ipcRenderer.invoke('typenote:duplicateObject', objectId),

  updateObject: (request) => ipcRenderer.invoke('typenote:updateObject', request),

  // Tag operations
  createTag: (input) => ipcRenderer.invoke('typenote:createTag', input),

  getTag: (tagId) => ipcRenderer.invoke('typenote:getTag', tagId),

  updateTag: (tagId, input) => ipcRenderer.invoke('typenote:updateTag', tagId, input),

  deleteTag: (tagId) => ipcRenderer.invoke('typenote:deleteTag', tagId),

  listTags: (options) => ipcRenderer.invoke('typenote:listTags', options),

  assignTags: (objectId, tagIds) => ipcRenderer.invoke('typenote:assignTags', objectId, tagIds),

  removeTags: (objectId, tagIds) => ipcRenderer.invoke('typenote:removeTags', objectId, tagIds),

  getObjectTags: (objectId) => ipcRenderer.invoke('typenote:getObjectTags', objectId),

  // Task operations
  getTodaysTasks: () => ipcRenderer.invoke('typenote:getTodaysTasks'),

  getOverdueTasks: () => ipcRenderer.invoke('typenote:getOverdueTasks'),

  getTasksByStatus: (status) => ipcRenderer.invoke('typenote:getTasksByStatus', status),

  getUpcomingTasks: (days) => ipcRenderer.invoke('typenote:getUpcomingTasks', days),

  getInboxTasks: () => ipcRenderer.invoke('typenote:getInboxTasks'),

  getTasksByPriority: (priority) => ipcRenderer.invoke('typenote:getTasksByPriority', priority),

  getCompletedTasks: (options) => ipcRenderer.invoke('typenote:getCompletedTasks', options),

  getTasksByDueDate: (dateKey) => ipcRenderer.invoke('typenote:getTasksByDueDate', dateKey),

  completeTask: (taskId) => ipcRenderer.invoke('typenote:completeTask', taskId),

  reopenTask: (taskId) => ipcRenderer.invoke('typenote:reopenTask', taskId),

  // Attachment operations
  uploadAttachment: (input) => ipcRenderer.invoke('typenote:uploadAttachment', input),

  getAttachment: (attachmentId) => ipcRenderer.invoke('typenote:getAttachment', attachmentId),

  listAttachments: (options) => ipcRenderer.invoke('typenote:listAttachments', options),

  linkBlockToAttachment: (blockId, attachmentId) =>
    ipcRenderer.invoke('typenote:linkBlockToAttachment', blockId, attachmentId),

  unlinkBlockFromAttachment: (blockId, attachmentId) =>
    ipcRenderer.invoke('typenote:unlinkBlockFromAttachment', blockId, attachmentId),

  getBlockAttachments: (blockId) => ipcRenderer.invoke('typenote:getBlockAttachments', blockId),

  // Calendar operations
  getEventsInDateRange: (startDate, endDate) =>
    ipcRenderer.invoke('typenote:getEventsInDateRange', startDate, endDate),

  // Daily note operations
  getDatesWithDailyNotes: (startDate, endDate) =>
    ipcRenderer.invoke('typenote:getDatesWithDailyNotes', startDate, endDate),

  // Recent objects operations
  recordView: (objectId) => ipcRenderer.invoke('typenote:recordView', objectId),

  getRecentObjects: (limit) => ipcRenderer.invoke('typenote:getRecentObjects', limit),

  // Pinned objects operations
  pinObject: (objectId) => ipcRenderer.invoke('typenote:pinObject', objectId),

  unpinObject: (objectId) => ipcRenderer.invoke('typenote:unpinObject', objectId),

  isPinned: (objectId) => ipcRenderer.invoke('typenote:isPinned', objectId),

  getPinnedObjects: () => ipcRenderer.invoke('typenote:getPinnedObjects'),

  reorderPinnedObjects: (orderedIds) =>
    ipcRenderer.invoke('typenote:reorderPinnedObjects', orderedIds),

  // Settings operations
  getSettings: () => ipcRenderer.invoke('typenote:getSettings'),

  updateSettings: (updates) => ipcRenderer.invoke('typenote:updateSettings', updates),

  resetSettings: () => ipcRenderer.invoke('typenote:resetSettings'),

  // Trash operations
  listDeletedObjects: (options) => ipcRenderer.invoke('typenote:listDeletedObjects', options),

  restoreObject: (objectId) => ipcRenderer.invoke('typenote:restoreObject', objectId),

  softDeleteObject: (objectId) => ipcRenderer.invoke('typenote:softDeleteObject', objectId),

  // Event subscription
  onEvent: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, data: TypenoteEvent) => {
      callback(data);
    };
    ipcRenderer.on('typenote:event', listener);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('typenote:event', listener);
    };
  },
};

contextBridge.exposeInMainWorld('typenoteAPI', api);
