/**
 * useCommandSearch Hook
 *
 * Performs debounced search across objects (title match + FTS).
 * Returns navigation commands for matching objects.
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from './useDebouncedValue.js';
import { commandRegistry } from '../components/CommandPalette/commands/registry.js';
import type { NavigationCommand } from '../components/CommandPalette/commands/types.js';

/** Search state discriminated union */
export type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; commands: NavigationCommand[] }
  | { status: 'error'; message: string };

const DEBOUNCE_DELAY = 300;

export function useCommandSearch(query: string): SearchState {
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const debouncedQuery = useDebouncedValue(query, DEBOUNCE_DELAY);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setState({ status: 'idle' });
      return;
    }

    setState({ status: 'loading' });

    try {
      // Parallel API calls for title search and FTS
      const [objectsResult, ftsResult] = await Promise.all([
        window.typenoteAPI.listObjects(),
        window.typenoteAPI.searchBlocks(q, { limit: 20 }),
      ]);

      // Handle API errors
      if (!objectsResult.success) {
        setState({ status: 'error', message: objectsResult.error.message });
        return;
      }
      if (!ftsResult.success) {
        setState({ status: 'error', message: ftsResult.error.message });
        return;
      }

      // Filter objects by title match (case-insensitive)
      const lowerQuery = q.toLowerCase();
      const titleMatches = objectsResult.result.filter((obj) =>
        obj.title.toLowerCase().includes(lowerQuery)
      );

      // Convert to navigation commands
      const titleCommands = commandRegistry.fromObjectList(titleMatches);

      // Get unique object IDs from FTS results
      const seenIds = new Set(titleMatches.map((obj) => obj.id));
      const ftsObjectIds = ftsResult.result
        .map((hit) => hit.objectId)
        .filter((id) => !seenIds.has(id));

      // Get full object info for FTS matches
      const ftsObjects = objectsResult.result.filter((obj) => ftsObjectIds.includes(obj.id));
      const ftsCommands = commandRegistry.fromObjectList(ftsObjects);

      // Merge: title matches first, then FTS matches
      const merged = [...titleCommands, ...ftsCommands];

      setState({ status: 'success', commands: merged });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Search failed',
      });
    }
  }, []);

  useEffect(() => {
    // Immediately reset to idle if query is empty (no debounce)
    if (!query.trim()) {
      setState({ status: 'idle' });
      return;
    }

    void search(debouncedQuery);
  }, [debouncedQuery, query, search]);

  return state;
}
