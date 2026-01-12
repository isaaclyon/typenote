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

export interface SlashCommandState {
  isOpen: boolean;
  items: SlashCommand[];
  clientRect: (() => DOMRect | null) | null;
  command: ((item: SlashCommand) => void) | null;
}

export type SlashCommandStateCallback = (state: SlashCommandState) => void;

/**
 * Creates suggestion options for the SlashCommand extension.
 * Uses a callback to communicate state changes to React components.
 */
export function createSlashCommandSuggestion(
  onStateChange?: SlashCommandStateCallback
): Omit<SuggestionOptions<SlashCommand>, 'editor'> {
  let menuRef: SlashCommandMenuRef | null = null;

  return {
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
          const command = (item: SlashCommand) => {
            props.command(item);
          };

          onStateChange?.({
            isOpen: true,
            items: props.items,
            clientRect: props.clientRect ?? null,
            command,
          });
        },

        onUpdate: (props: SuggestionProps<SlashCommand>) => {
          const command = (item: SlashCommand) => {
            props.command(item);
          };

          onStateChange?.({
            isOpen: true,
            items: props.items,
            clientRect: props.clientRect ?? null,
            command,
          });
        },

        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === 'Escape') {
            onStateChange?.({
              isOpen: false,
              items: [],
              clientRect: null,
              command: null,
            });
            return true;
          }

          if (menuRef) {
            return menuRef.onKeyDown({ event: props.event });
          }

          return false;
        },

        onExit: () => {
          onStateChange?.({
            isOpen: false,
            items: [],
            clientRect: null,
            command: null,
          });
          menuRef = null;
        },
      };
    },
  };
}
