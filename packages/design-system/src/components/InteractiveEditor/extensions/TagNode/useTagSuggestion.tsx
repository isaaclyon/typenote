import * as React from 'react';
import type {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';
import type { MockTag, TagSuggestionCallbacks } from '../../types.js';
import { filterTags } from '../../mocks/mockTags.js';
import type { TagSuggestionMenuRef } from './TagSuggestionMenu.js';

export interface UseTagSuggestionState {
  isOpen: boolean;
  items: MockTag[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: MockTag) => void;
}

export interface UseTagSuggestionReturn {
  state: UseTagSuggestionState;
  suggestionOptions: Omit<SuggestionOptions<MockTag>, 'editor'>;
  setMenuRef: (ref: TagSuggestionMenuRef | null) => void;
}

/**
 * Hook to manage tag suggestion state for React components.
 *
 * Returns both the state for rendering and the suggestion options
 * for configuring the TipTap extension.
 *
 * @param callbacks - Optional callbacks for IPC integration. Falls back to mock data if not provided.
 */
export function useTagSuggestion(callbacks?: TagSuggestionCallbacks): UseTagSuggestionReturn {
  const [state, setState] = React.useState<UseTagSuggestionState>({
    isOpen: false,
    items: [],
    clientRect: null,
    onSelect: () => {},
  });

  const menuRefStore = React.useRef<TagSuggestionMenuRef | null>(null);
  // Store callbacks in ref to avoid stale closure issues
  const callbacksRef = React.useRef(callbacks);
  callbacksRef.current = callbacks;

  const setMenuRef = React.useCallback((ref: TagSuggestionMenuRef | null) => {
    menuRefStore.current = ref;
  }, []);

  // Create stable suggestion options
  const suggestionOptions = React.useMemo<Omit<SuggestionOptions<MockTag>, 'editor'>>(
    () => ({
      char: '#',
      allowSpaces: false,

      items: async ({ query }: { query: string }): Promise<MockTag[]> => {
        // Use callback if provided, otherwise fall back to mock data
        if (callbacksRef.current?.onSearch) {
          return await callbacksRef.current.onSearch(query);
        }
        return filterTags(query);
      },

      command: ({
        editor,
        range,
        props,
      }: {
        editor: Editor;
        range: { from: number; to: number };
        props: MockTag;
      }) => {
        // Delete the "#" trigger and any query text
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'tag',
            attrs: {
              id: props.id,
              value: props.value,
              color: props.color ?? null,
            },
          })
          .run();
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<MockTag>) => {
            const onSelect = (item: MockTag) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
            });
          },

          onUpdate: (props: SuggestionProps<MockTag>) => {
            const onSelect = (item: MockTag) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
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
