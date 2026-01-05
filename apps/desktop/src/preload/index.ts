import { contextBridge, ipcRenderer } from 'electron';

// Expose typed API to renderer
contextBridge.exposeInMainWorld('typenoteAPI', {
  version: '0.1.0',

  getDocument: (objectId: string) => ipcRenderer.invoke('typenote:getDocument', objectId),

  applyBlockPatch: (request: unknown) => ipcRenderer.invoke('typenote:applyBlockPatch', request),

  getOrCreateTodayDailyNote: () => ipcRenderer.invoke('typenote:getOrCreateTodayDailyNote'),

  listObjects: () => ipcRenderer.invoke('typenote:listObjects'),

  searchBlocks: (query: string, filters?: { objectId?: string; limit?: number }) =>
    ipcRenderer.invoke('typenote:searchBlocks', query, filters),

  getBacklinks: (objectId: string) => ipcRenderer.invoke('typenote:getBacklinks', objectId),

  createObject: (typeKey: string, title: string, properties?: Record<string, unknown>) =>
    ipcRenderer.invoke('typenote:createObject', typeKey, title, properties),
});
