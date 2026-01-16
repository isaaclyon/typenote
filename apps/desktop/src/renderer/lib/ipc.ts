/**
 * IPC Error Wrapper
 *
 * Wraps IPC calls with automatic error toasting for consistent error feedback.
 */

import { toast } from '@typenote/design-system';

/**
 * Wraps an IPC operation with automatic error toast notification.
 * On success, returns the result silently (no toast).
 * On failure, shows an error toast and re-throws the error.
 */
export async function ipcCall<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    toast.error(`${operation} failed`, { description: message });
    throw error;
  }
}
