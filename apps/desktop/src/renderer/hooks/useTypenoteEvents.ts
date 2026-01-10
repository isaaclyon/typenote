import { useEffect } from 'react';
import type { TypenoteEvent } from '@typenote/api';

/**
 * Subscribe to TypeNote events from the main process.
 *
 * Automatically cleans up subscription when component unmounts.
 *
 * @param handler - Callback invoked when events are received
 * @param deps - Dependency array (like useEffect)
 *
 * @example
 * ```typescript
 * useTypenoteEvents((event) => {
 *   if (event.type === 'object:created') {
 *     console.log('Created:', event.payload.title);
 *     refetch(); // Refresh your data
 *   }
 * });
 * ```
 */
export function useTypenoteEvents(
  handler: (event: TypenoteEvent) => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const unsubscribe = window.typenoteAPI.onEvent(handler);
    return unsubscribe;
  }, deps);
}
