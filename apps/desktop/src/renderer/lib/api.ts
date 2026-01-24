/**
 * API Client
 *
 * Exports the appropriate API implementation based on the environment:
 * - Electron: Uses IPC via window.typenoteAPI
 * - Web: Uses HTTP via fetch
 *
 * Uses a Proxy to defer the lookup, which allows tests to mock
 * window.typenoteAPI after module import.
 */

import type { TypenoteAPI } from '../../preload/api.js';
import { httpAPI } from './httpAdapter.js';

/**
 * Dynamically resolves the API implementation.
 * Checks on each call whether we're in Electron or web mode.
 */
function getApiImpl(): TypenoteAPI {
  const isElectron = typeof window !== 'undefined' && 'typenoteAPI' in window;
  return isElectron ? (window as Window & { typenoteAPI: TypenoteAPI }).typenoteAPI : httpAPI;
}

/**
 * Proxy that delegates to the appropriate API implementation.
 * This allows tests to mock window.typenoteAPI after import.
 */
export const api: TypenoteAPI = new Proxy({} as TypenoteAPI, {
  get(_target, prop: string | symbol) {
    const impl = getApiImpl();
    const value = impl[prop as keyof TypenoteAPI];
    // Bind methods to preserve `this` context
    return typeof value === 'function' ? value.bind(impl) : value;
  },
});
