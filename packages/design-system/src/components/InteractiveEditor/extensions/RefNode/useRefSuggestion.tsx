import * as React from 'react';
import type {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';
import type { MockNote } from '../../mocks/mockNotes.js';
import { filterNotes } from '../../mocks/mockNotes.js';
import type { RefSuggestionMenuRef } from './RefSuggestionMenu.js';

export interface UseRefSuggestionState {
  isOpen: boolean;
  items: MockNote[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: MockNote) => void;
}

export interface UseRefSuggestionReturn {
  state: UseRefSuggestionState;
  suggestionOptions: Omit<SuggestionOptions<MockNote>, 'editor'>;
  setMenuRef: (ref: RefSuggestionMenuRef | null) => void;
}

/**
 * Hook to manage wiki-link suggestion state for React components.
 *
 * Returns both the state for rendering and the suggestion options
 * for configuring the TipTap extension.
 */
export function useRefSuggestion(): UseRefSuggestionReturn {
  const [state, setState] = React.useState<UseRefSuggestionState>({
    isOpen: false,
    items: [],
    clientRect: null,
    onSelect: () => {},
  });

  const menuRefStore = React.useRef<RefSuggestionMenuRef | null>(null);

  const setMenuRef = React.useCallback((ref: RefSuggestionMenuRef | null) => {
    menuRefStore.current = ref;
  }, []);

  // Create stable suggestion options
  const suggestionOptions = React.useMemo<Omit<SuggestionOptions<MockNote>, 'editor'>>(
    () => ({
      char: '[[',
      allowSpaces: true,

      items: ({ query }: { query: string }): MockNote[] => {
        return filterNotes(query);
      },

      command: ({
        editor,
        range,
        props,
      }: {
        editor: Editor;
        range: { from: number; to: number };
        props: MockNote;
      }) => {
        // Delete the "[[" trigger and any query text
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'ref',
            attrs: {
              id: props.id,
              label: props.title,
              type: props.type,
            },
          })
          .run();
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<MockNote>) => {
            const onSelect = (item: MockNote) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
            });
          },

          onUpdate: (props: SuggestionProps<MockNote>) => {
            const onSelect = (item: MockNote) => {
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
    []
  );

  return {
    state,
    suggestionOptions,
    setMenuRef,
  };
}
