import * as React from 'react';
import type { Editor as TiptapEditor, Range } from '@tiptap/core';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { SuggestionMode, AnySuggestionItem } from '../extensions/RefSuggestion.js';
import { parseQueryWithAlias, isRefItem } from '../extensions/RefSuggestion.js';

// ============================================================================
// Types
// ============================================================================

/** Base state shared by all suggestion types */
export interface SuggestionStateBase<T> {
  isOpen: boolean;
  items: T[];
  query: string;
  selectedIndex: number;
  position: { top: number; left: number } | null;
  command: ((item: T) => void) | null;
  range: Range | null;
  editor: TiptapEditor | null;
}

/** Extended state for ref/embed suggestions (includes mode for heading/block refs) */
export interface RefSuggestionState extends SuggestionStateBase<AnySuggestionItem> {
  mode: SuggestionMode;
}

/** State for slash commands (has filteredItems instead of mode) */
export interface SlashCommandState<T> extends Omit<SuggestionStateBase<T>, 'command'> {
  filteredItems: T[];
}

/** State for tag suggestions (simpler, no mode) */
export interface TagSuggestionState<T> extends SuggestionStateBase<T> {}

// ============================================================================
// Initial States
// ============================================================================

export function createInitialRefState(): RefSuggestionState {
  return {
    isOpen: false,
    items: [],
    query: '',
    selectedIndex: 0,
    position: null,
    command: null,
    range: null,
    editor: null,
    mode: 'object',
  };
}

export function createInitialSlashState<T>(): SlashCommandState<T> {
  return {
    isOpen: false,
    items: [],
    filteredItems: [],
    query: '',
    selectedIndex: 0,
    position: null,
    range: null,
    editor: null,
  };
}

export function createInitialTagState<T>(): TagSuggestionState<T> {
  return {
    isOpen: false,
    items: [],
    query: '',
    selectedIndex: 0,
    position: null,
    command: null,
    range: null,
    editor: null,
  };
}

// ============================================================================
// Ref/Embed Suggestion Hook (supports alias mode, heading/block modes)
// ============================================================================

export interface UseRefSuggestionReturn {
  state: RefSuggestionState;
  setState: React.Dispatch<React.SetStateAction<RefSuggestionState>>;
  createRender: () => {
    onStart: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => void;
    onUpdate: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => void;
    onKeyDown: (params: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };
}

/**
 * Hook for ref and embed suggestions.
 * Supports:
 * - Object, heading, and block modes
 * - Alias syntax (query|alias)
 * - Tab completion
 * - Arrow key navigation (disabled in alias mode)
 *
 * @param triggerPrefix - The trigger character(s) for Tab completion text (e.g., '[[', '@', '![[')
 */
export function useRefSuggestion(triggerPrefix: string): UseRefSuggestionReturn {
  const [state, setState] = React.useState<RefSuggestionState>(createInitialRefState);

  const createRender = React.useCallback(
    () => ({
      onStart: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
        const rect = props.clientRect?.();
        setState({
          isOpen: true,
          items: props.items,
          query: props.query,
          selectedIndex: 0,
          position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
          command: props.command,
          range: props.range,
          editor: props.editor,
          mode: props.mode ?? 'object',
        });
      },

      onUpdate: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
        const rect = props.clientRect?.();
        setState((prev) => ({
          ...prev,
          items: props.items,
          query: props.query,
          selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
          position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
          command: props.command,
          range: props.range,
          editor: props.editor,
          mode: props.mode ?? prev.mode,
        }));
      },

      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        // Helper to check if we're in alias mode (only applies to object mode)
        const isInAliasMode = (prev: RefSuggestionState) => {
          if (prev.mode !== 'object') return false;
          const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
          const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
          if (alias === null) return false;
          return prev.items.some(
            (item) => isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
          );
        };

        if (event.key === 'ArrowUp') {
          setState((prev) => {
            if (isInAliasMode(prev)) return prev;
            return {
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
            };
          });
          return true;
        }

        if (event.key === 'ArrowDown') {
          setState((prev) => {
            if (isInAliasMode(prev)) return prev;
            return {
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
            };
          });
          return true;
        }

        if (event.key === 'Enter') {
          setState((prev) => {
            // In alias mode (object mode only), select the matched item
            if (prev.mode === 'object') {
              const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
              const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);

              if (alias !== null) {
                const matchedItem = prev.items.find(
                  (item) =>
                    isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
                );
                if (matchedItem && prev.command) {
                  prev.command(matchedItem);
                  return { ...prev, isOpen: false };
                }
              }
            }

            // Normal mode: select the highlighted item
            const item = prev.items[prev.selectedIndex];
            if (item && prev.command) {
              prev.command(item);
            }
            return { ...prev, isOpen: false };
          });
          return true;
        }

        if (event.key === 'Tab') {
          event.preventDefault();
          setState((prev) => {
            // Tab completion only works in object mode
            if (prev.mode !== 'object') return prev;
            // Disable Tab in alias mode (already have full title)
            if (isInAliasMode(prev)) return prev;

            const item = prev.items[prev.selectedIndex];
            if (!item || !prev.editor || !prev.range || !isRefItem(item)) return prev;

            const title = item.title;
            const newText = `${triggerPrefix}${title}`;

            prev.editor.chain().focus().deleteRange(prev.range).insertContent(newText).run();

            // Don't close - let the suggestion update naturally
            return prev;
          });
          return true;
        }

        if (event.key === 'Escape') {
          setState((prev) => ({ ...prev, isOpen: false }));
          return true;
        }

        return false;
      },

      onExit: () => {
        setState(createInitialRefState());
      },
    }),
    [triggerPrefix]
  );

  return { state, setState, createRender };
}

// ============================================================================
// Slash Command Hook
// ============================================================================

export interface UseSlashCommandReturn<T> {
  state: SlashCommandState<T>;
  setState: React.Dispatch<React.SetStateAction<SlashCommandState<T>>>;
  createRender: (
    allItems: T[],
    filterFn: (items: T[], query: string) => T[]
  ) => {
    onStart: (props: SuggestionProps<T>) => void;
    onUpdate: (props: SuggestionProps<T>) => void;
    onKeyDown: (params: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };
}

/**
 * Hook for slash command suggestions.
 * Supports filtering items by query.
 */
export function useSlashCommand<T>(): UseSlashCommandReturn<T> {
  const [state, setState] = React.useState<SlashCommandState<T>>(createInitialSlashState);

  const createRender = React.useCallback(
    (allItems: T[], filterFn: (items: T[], query: string) => T[]) => ({
      onStart: (props: SuggestionProps<T>) => {
        const rect = props.clientRect?.();
        const filtered = filterFn(allItems, props.query);
        setState({
          isOpen: true,
          items: allItems,
          filteredItems: filtered,
          query: props.query,
          selectedIndex: 0,
          position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
          range: props.range,
          editor: props.editor,
        });
      },

      onUpdate: (props: SuggestionProps<T>) => {
        const rect = props.clientRect?.();
        const filtered = filterFn(allItems, props.query);
        setState((prev) => ({
          ...prev,
          filteredItems: filtered,
          query: props.query,
          selectedIndex: Math.min(prev.selectedIndex, Math.max(0, filtered.length - 1)),
          position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
          range: props.range,
        }));
      },

      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex <= 0 ? prev.filteredItems.length - 1 : prev.selectedIndex - 1,
          }));
          return true;
        }

        if (event.key === 'ArrowDown') {
          setState((prev) => ({
            ...prev,
            selectedIndex:
              prev.selectedIndex >= prev.filteredItems.length - 1 ? 0 : prev.selectedIndex + 1,
          }));
          return true;
        }

        if (event.key === 'Enter') {
          // Execute command is handled by the component
          return true;
        }

        if (event.key === 'Escape') {
          setState((prev) => ({ ...prev, isOpen: false }));
          return true;
        }

        return false;
      },

      onExit: () => {
        setState(createInitialSlashState());
      },
    }),
    []
  );

  return { state, setState, createRender };
}

// ============================================================================
// Tag Suggestion Hook
// ============================================================================

export interface UseTagSuggestionReturn<T> {
  state: TagSuggestionState<T>;
  setState: React.Dispatch<React.SetStateAction<TagSuggestionState<T>>>;
  createRender: () => {
    onStart: (props: SuggestionProps<T>) => void;
    onUpdate: (props: SuggestionProps<T>) => void;
    onKeyDown: (params: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };
}

/**
 * Hook for tag suggestions.
 * Simple version without alias or mode support.
 */
export function useTagSuggestion<T>(): UseTagSuggestionReturn<T> {
  const [state, setState] = React.useState<TagSuggestionState<T>>(createInitialTagState);

  const createRender = React.useCallback(
    () => ({
      onStart: (props: SuggestionProps<T>) => {
        const rect = props.clientRect?.();
        setState({
          isOpen: true,
          items: props.items,
          query: props.query,
          selectedIndex: 0,
          position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
          command: props.command,
          range: props.range,
          editor: props.editor,
        });
      },

      onUpdate: (props: SuggestionProps<T>) => {
        const rect = props.clientRect?.();
        setState((prev) => ({
          ...prev,
          items: props.items,
          query: props.query,
          selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
          position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
          command: props.command,
        }));
      },

      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setState((prev) => ({
            ...prev,
            selectedIndex: prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
          }));
          return true;
        }

        if (event.key === 'ArrowDown') {
          setState((prev) => ({
            ...prev,
            selectedIndex: prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
          }));
          return true;
        }

        if (event.key === 'Enter') {
          setState((prev) => {
            const item = prev.items[prev.selectedIndex];
            if (item && prev.command) {
              prev.command(item);
            }
            return { ...prev, isOpen: false };
          });
          return true;
        }

        if (event.key === 'Escape') {
          setState((prev) => ({ ...prev, isOpen: false }));
          return true;
        }

        return false;
      },

      onExit: () => {
        setState(createInitialTagState());
      },
    }),
    []
  );

  return { state, setState, createRender };
}
