import { contextBridge } from 'electron';

// Expose typed API to renderer
// API methods will be added in Phase 7
contextBridge.exposeInMainWorld('typenoteAPI', {
  version: '0.1.0',
});
