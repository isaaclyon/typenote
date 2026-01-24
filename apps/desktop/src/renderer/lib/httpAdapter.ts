/**
 * HTTP Adapter for TypenoteAPI
 *
 * Provides the same API interface as the Electron IPC preload,
 * but uses fetch to call the HTTP server instead.
 */

import type { TypenoteAPI } from '../../preload/api.js';

import type { IpcOutcome } from '../../preload/api.js';

const API_BASE = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<IpcOutcome<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error || {
          code: 'HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }

    // Convert HTTP server format { success, data } to IPC format { success, result }
    if (json.success && 'data' in json) {
      return {
        success: true,
        result: json.data,
      };
    }

    // Already in IPC format
    return json;
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
}

export const httpAPI: TypenoteAPI = {
  version: '0.1.0',

  getDocument: (objectId) => fetchAPI(`/api/v1/v1/documents/${objectId}`, { method: 'GET' }),

  applyBlockPatch: (request) =>
    fetchAPI('/api/v1/documents/patch', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  getOrCreateTodayDailyNote: () => fetchAPI('/api/v1/daily-notes/today', { method: 'POST' }),

  getOrCreateDailyNoteByDate: (dateKey) =>
    fetchAPI(`/api/v1/daily-notes/${dateKey}`, { method: 'POST' }),

  listObjects: (_options) => fetchAPI('/api/v1/objects', { method: 'GET' }),

  getObjectsCreatedOnDate: (dateKey) =>
    fetchAPI(`/api/v1/calendar/created/${dateKey}`, { method: 'GET' }),

  getObject: (objectId) => fetchAPI(`/api/v1/objects/${objectId}`, { method: 'GET' }),

  getObjectTypeByKey: (typeKey) =>
    fetchAPI(`/api/v1/object-types/by-key/${typeKey}`, { method: 'GET' }),

  listObjectTypes: (options) => {
    const params = new URLSearchParams();
    if (options?.builtInOnly) params.set('builtInOnly', 'true');
    if (options?.customOnly) params.set('customOnly', 'true');
    const query = params.toString();
    return fetchAPI(`/api/v1/object-types${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  createObjectType: (input) =>
    fetchAPI('/api/v1/object-types', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateObjectType: (id, input) =>
    fetchAPI(`/api/v1/object-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteObjectType: (id) => fetchAPI(`/api/v1/object-types/${id}`, { method: 'DELETE' }),

  searchBlocks: (query, filters) =>
    fetchAPI('/api/v1/search', {
      method: 'POST',
      body: JSON.stringify({ query, filters }),
    }),

  getBacklinks: (objectId) =>
    fetchAPI(`/api/v1/documents/${objectId}/backlinks`, { method: 'GET' }),

  getUnlinkedMentions: (objectId) =>
    fetchAPI(`/api/v1/documents/${objectId}/unlinked-mentions`, { method: 'GET' }),

  createObject: (typeKey, title, properties) =>
    fetchAPI('/api/v1/objects', {
      method: 'POST',
      body: JSON.stringify({ typeKey, title, properties }),
    }),

  duplicateObject: (objectId) =>
    fetchAPI(`/api/v1/objects/${objectId}/duplicate`, { method: 'POST' }),

  updateObject: (request) =>
    fetchAPI('/api/v1/objects/update', {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  createTag: (input) =>
    fetchAPI('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getTag: (tagId) => fetchAPI(`/api/v1/tags/${tagId}`, { method: 'GET' }),

  updateTag: (tagId, input) =>
    fetchAPI(`/api/v1/tags/${tagId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  deleteTag: (tagId) => fetchAPI(`/api/v1/tags/${tagId}`, { method: 'DELETE' }),

  listTags: (options) =>
    fetchAPI('/api/v1/tags', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  assignTags: (objectId, tagIds) =>
    fetchAPI(`/api/v1/objects/${objectId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagIds }),
    }),

  removeTags: (objectId, tagIds) =>
    fetchAPI(`/api/v1/objects/${objectId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tagIds }),
    }),

  getObjectTags: (objectId) => fetchAPI(`/api/v1/objects/${objectId}/tags`, { method: 'GET' }),

  getTodaysTasks: () => fetchAPI('/api/v1/tasks/today', { method: 'GET' }),

  getOverdueTasks: () => fetchAPI('/api/v1/tasks/overdue', { method: 'GET' }),

  getTasksByStatus: (status) => fetchAPI(`/api/v1/tasks/by-status/${status}`, { method: 'GET' }),

  getUpcomingTasks: (days) => fetchAPI(`/api/v1/tasks/upcoming/${days}`, { method: 'GET' }),

  getInboxTasks: () => fetchAPI('/api/v1/tasks/inbox', { method: 'GET' }),

  getTasksByPriority: (priority) =>
    fetchAPI(`/api/v1/tasks/by-priority/${priority}`, { method: 'GET' }),

  getCompletedTasks: (options) =>
    fetchAPI('/api/v1/tasks/completed', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  getTasksByDueDate: (dateKey) =>
    fetchAPI(`/api/v1/tasks/by-due-date/${dateKey}`, { method: 'GET' }),

  completeTask: (taskId) => fetchAPI(`/api/v1/tasks/${taskId}/complete`, { method: 'POST' }),

  reopenTask: (taskId) => fetchAPI(`/api/v1/tasks/${taskId}/reopen`, { method: 'POST' }),

  uploadAttachment: (input) =>
    fetchAPI('/api/v1/attachments', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getAttachment: (attachmentId) =>
    fetchAPI(`/api/v1/attachments/${attachmentId}`, { method: 'GET' }),

  listAttachments: (options) =>
    fetchAPI('/api/v1/attachments', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  linkBlockToAttachment: (blockId, attachmentId) =>
    fetchAPI(`/api/v1/attachments/${attachmentId}/link`, {
      method: 'POST',
      body: JSON.stringify({ blockId }),
    }),

  unlinkBlockFromAttachment: (blockId, attachmentId) =>
    fetchAPI(`/api/v1/attachments/${attachmentId}/unlink`, {
      method: 'POST',
      body: JSON.stringify({ blockId }),
    }),

  getBlockAttachments: (blockId) =>
    fetchAPI(`/api/v1/blocks/${blockId}/attachments`, { method: 'GET' }),

  getEventsInDateRange: (startDate, endDate) =>
    fetchAPI('/api/v1/calendar/events', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    }),

  getDatesWithDailyNotes: (startDate, endDate) =>
    fetchAPI('/api/v1/daily-notes/dates', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    }),

  recordView: (objectId) =>
    fetchAPI('/api/v1/recent/record', {
      method: 'POST',
      body: JSON.stringify({ objectId }),
    }),

  getRecentObjects: (limit) => fetchAPI(`/api/v1/recent?limit=${limit}`, { method: 'GET' }),

  pinObject: (objectId) =>
    fetchAPI('/api/v1/pinned', {
      method: 'POST',
      body: JSON.stringify({ objectId }),
    }),

  unpinObject: (objectId) => fetchAPI(`/api/v1/pinned/${objectId}`, { method: 'DELETE' }),

  isPinned: (objectId) => fetchAPI(`/api/v1/pinned/${objectId}/check`, { method: 'GET' }),

  getPinnedObjects: () => fetchAPI('/api/v1/pinned', { method: 'GET' }),

  reorderPinnedObjects: (orderedIds) =>
    fetchAPI('/api/v1/pinned/reorder', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    }),

  getSettings: () => fetchAPI('/api/v1/settings', { method: 'GET' }),

  updateSettings: (updates) =>
    fetchAPI('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  resetSettings: () => fetchAPI('/api/v1/settings/reset', { method: 'POST' }),

  listDeletedObjects: (options) =>
    fetchAPI('/api/v1/trash', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),

  restoreObject: (objectId) => fetchAPI(`/api/v1/trash/${objectId}/restore`, { method: 'POST' }),

  softDeleteObject: (objectId) => fetchAPI(`/api/v1/objects/${objectId}`, { method: 'DELETE' }),

  onEvent: (_callback) => {
    // TODO: Implement SSE or WebSocket for events
    console.warn('Event subscription not implemented for HTTP mode');
    return () => {}; // No-op cleanup
  },
};
