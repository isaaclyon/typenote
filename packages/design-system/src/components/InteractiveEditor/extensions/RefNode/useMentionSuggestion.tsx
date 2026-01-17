import * as React from 'react';
import type {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';
import type { MockNote, RefSuggestionCallbacks } from '../../types.js';
import { filterNotes } from '../../mocks/mockNotes.js';
import type { RefSuggestionMenuRef } from './RefSuggestionMenu.js';
import { isCreateNewItem, type RefSuggestionItem } from './useRefSuggestion.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface UseMentionSuggestionState {
  isOpen: boolean;
  items: RefSuggestionItem[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: RefSuggestionItem) => void;
  /** Current query text (for "Create new" display) */
  query: string;
}

export interface UseMentionSuggestionReturn {
  state: UseMentionSuggestionState;
  suggestionOptions: Omit<SuggestionOptions<RefSuggestionItem>, 'editor'>;
  setMenuRef: (ref: RefSuggestionMenuRef | null) => void;
}

/**
 * Hook to manage mention suggestion state for React components.
 *
 * Returns both the state for rendering and the suggestion options
 * for configuring the TipTap extension.
 *
 * @param callbacks - Optional callbacks for IPC integration. Falls back to mock data if not provided.
 */
export function useMentionSuggestion(
  callbacks?: RefSuggestionCallbacks
): UseMentionSuggestionReturn {
  const [state, setState] = React.useState<UseMentionSuggestionState>({
    isOpen: false,
    items: [],
    clientRect: null,
    onSelect: () => {},
    query: '',
  });

  const menuRefStore = React.useRef<RefSuggestionMenuRef | null>(null);
  // Store callbacks in ref to avoid stale closure issues
  const callbacksRef = React.useRef(callbacks);
  callbacksRef.current = callbacks;

  const setMenuRef = React.useCallback((ref: RefSuggestionMenuRef | null) => {
    menuRefStore.current = ref;
  }, []);

  // Create stable suggestion options
  const suggestionOptions = React.useMemo<Omit<SuggestionOptions<RefSuggestionItem>, 'editor'>>(
    () => ({
      char: '@',
      allowSpaces: true,

      items: async ({ query }: { query: string }): Promise<RefSuggestionItem[]> => {
        // Use callback if provided, otherwise fall back to mock data
        let results: MockNote[];
        if (callbacksRef.current?.onSearch) {
          results = await callbacksRef.current.onSearch(query);
        } else {
          results = filterNotes(query);
        }

        // Add "Create new" option if onCreate callback is provided and query is non-empty
        if (callbacksRef.current?.onCreate && query.trim().length > 0) {
          // Only add if no exact match exists
          const exactMatch = results.some((r) => r.title.toLowerCase() === query.toLowerCase());
          if (!exactMatch) {
            return [...results, { createNew: true, title: query.trim() }];
          }
        }

        return results;
      },

      command: ({
        editor,
        range,
        props,
      }: {
        editor: Editor;
        range: { from: number; to: number };
        props: RefSuggestionItem;
      }) => {
        // Delete the "@" trigger and any query text
        editor.chain().focus().deleteRange(range).run();

        if (isCreateNewItem(props)) {
          // Handle "Create new" - call onCreate and insert ref after creation
          if (callbacksRef.current?.onCreate) {
            void callbacksRef.current.onCreate(props.title).then((created) => {
              if (created) {
                editor.commands.insertContent({
                  type: 'ref',
                  attrs: {
                    id: created.id,
                    label: created.title,
                    type: created.type,
                  },
                });
              }
            });
          }
        } else {
          // Insert ref node for existing item
          editor.commands.insertContent({
            type: 'ref',
            attrs: {
              id: props.id,
              label: props.title,
              type: props.type,
            },
          });
        }
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<RefSuggestionItem>) => {
            const onSelect = (item: RefSuggestionItem) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
              query: props.query,
            });
          },

          onUpdate: (props: SuggestionProps<RefSuggestionItem>) => {
            const onSelect = (item: RefSuggestionItem) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
              query: props.query,
            });
          },

          onKeyDown: (props: SuggestionKeyDownProps) => {
            if (props.event.key === 'Escape') {
              setState((prev) => ({ ...prev, isOpen: false }));
              return true;
            }

            if (menuRefStore.current) {
              return menuRefStore.current.onKeyDown({ event: props.event });
            }

            return false;
          },

          onExit: () => {
            setState({
              isOpen: false,
              items: [],
              clientRect: null,
              onSelect: () => {},
              query: '',
            });
          },
        };
      },
    }),
    [] // Dependencies intentionally empty - callbacks accessed via ref
  );

  return {
    state,
    suggestionOptions,
    setMenuRef,
  };
}
