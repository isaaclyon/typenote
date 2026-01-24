/**
 * API Client
 *
 * Exports the appropriate API implementation based on the environment:
 * - Electron: Uses IPC via window.typenoteAPI
 * - Web: Uses HTTP via fetch
 */

import type { TypenoteAPI } from '../../preload/api.js';
import { httpAPI } from './httpAdapter.js';

// Detect if running in Electron or web
const isElectron = typeof window !== 'undefined' && 'typenoteAPI' in window;

export const api: TypenoteAPI = isElectron
  ? (window as Window & { typenoteAPI: TypenoteAPI }).typenoteAPI
  : httpAPI;
