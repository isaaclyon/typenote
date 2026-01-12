import * as React from 'react';
import type {
  SuggestionOptions,
  SuggestionProps,
  SuggestionKeyDownProps,
} from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';
import type { SlashCommand } from '../../mocks/mockCommands.js';
import { filterCommands } from '../../mocks/mockCommands.js';
import { executeSlashCommand } from './SlashCommand.js';
import type { SlashCommandMenuRef } from './SlashCommandMenu.js';

export interface UseSlashCommandState {
  isOpen: boolean;
  items: SlashCommand[];
  clientRect: (() => DOMRect | null) | null;
  onSelect: (item: SlashCommand) => void;
}

export interface UseSlashCommandReturn {
  state: UseSlashCommandState;
  suggestionOptions: Omit<SuggestionOptions<SlashCommand>, 'editor'>;
  setMenuRef: (ref: SlashCommandMenuRef | null) => void;
}

/**
 * Hook to manage slash command state for React components.
 *
 * Returns both the state for rendering and the suggestion options
 * for configuring the TipTap extension.
 */
export function useSlashCommand(): UseSlashCommandReturn {
  const [state, setState] = React.useState<UseSlashCommandState>({
    isOpen: false,
    items: [],
    clientRect: null,
    onSelect: () => {},
  });

  const menuRefStore = React.useRef<SlashCommandMenuRef | null>(null);

  const setMenuRef = React.useCallback((ref: SlashCommandMenuRef | null) => {
    menuRefStore.current = ref;
  }, []);

  // Create stable suggestion options
  const suggestionOptions = React.useMemo<Omit<SuggestionOptions<SlashCommand>, 'editor'>>(
    () => ({
      char: '/',
      startOfLine: false,

      items: ({ query }: { query: string }): SlashCommand[] => {
        return filterCommands(query);
      },

      command: ({
        editor,
        range,
        props,
      }: {
        editor: Editor;
        range: { from: number; to: number };
        props: SlashCommand;
      }) => {
        // Delete the "/" trigger and any query text
        editor.chain().focus().deleteRange(range).run();
        // Execute the selected command
        executeSlashCommand(editor, props.action);
      },

      render: () => {
        return {
          onStart: (props: SuggestionProps<SlashCommand>) => {
            const onSelect = (item: SlashCommand) => {
              props.command(item);
            };

            setState({
              isOpen: true,
              items: props.items,
              clientRect: props.clientRect ?? null,
              onSelect,
            });
          },

          onUpdate: (props: SuggestionProps<SlashCommand>) => {
            const onSelect = (item: SlashCommand) => {
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
