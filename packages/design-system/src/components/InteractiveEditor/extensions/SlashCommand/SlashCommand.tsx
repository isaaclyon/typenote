import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions, type SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import type { Editor } from '@tiptap/core';

// Unique plugin key for slash command suggestions
const SlashCommandPluginKey = new PluginKey('slashCommand');
import { filterCommands, type SlashCommand as SlashCommandType } from '../../mocks/mockCommands.js';

/**
 * Execute a slash command action in the editor.
 * Maps action strings to TipTap commands.
 */
export function executeSlashCommand(editor: Editor, action: string): void {
  switch (action) {
    case 'paragraph':
      editor.chain().focus().setParagraph().run();
      break;
    case 'heading1':
      editor.chain().focus().setHeading({ level: 1 }).run();
      break;
    case 'heading2':
      editor.chain().focus().setHeading({ level: 2 }).run();
      break;
    case 'heading3':
      editor.chain().focus().setHeading({ level: 3 }).run();
      break;
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run();
      break;
    case 'taskList':
      editor.chain().focus().toggleTaskList().run();
      break;
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run();
      break;
    case 'codeBlock':
      editor.chain().focus().toggleCodeBlock().run();
      break;
    case 'callout-info':
      editor
        .chain()
        .focus()
        .insertContent({ type: 'callout', attrs: { kind: 'info' } })
        .run();
      break;
    case 'callout-success':
      editor
        .chain()
        .focus()
        .insertContent({ type: 'callout', attrs: { kind: 'success' } })
        .run();
      break;
    case 'callout-warning':
      editor
        .chain()
        .focus()
        .insertContent({ type: 'callout', attrs: { kind: 'warning' } })
        .run();
      break;
    case 'callout-error':
      editor
        .chain()
        .focus()
        .insertContent({ type: 'callout', attrs: { kind: 'error' } })
        .run();
      break;
    case 'table':
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      break;
    case 'horizontalRule':
      editor.chain().focus().setHorizontalRule().run();
      break;
    default:
      console.warn(`Unknown slash command action: ${action}`);
  }
}

export interface SlashCommandOptions {
  suggestion: Omit<SuggestionOptions<SlashCommandType>, 'editor'>;
}

export interface SlashCommandSuggestionProps extends SuggestionProps<SlashCommandType> {
  editor: Editor;
}

/**
 * SlashCommand extension for TipTap.
 *
 * Triggers a command menu when the user types "/" in the editor.
 * Uses the Suggestion plugin to handle the trigger and filtering.
 */
export const SlashCommandExtension = Extension.create<SlashCommandOptions>({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        items: ({ query }: { query: string }) => {
          return filterCommands(query);
        },
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: { from: number; to: number };
          props: SlashCommandType;
        }) => {
          // Delete the "/" trigger and any query text
          editor.chain().focus().deleteRange(range).run();
          // Execute the selected command
          executeSlashCommand(editor, props.action);
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: SlashCommandPluginKey,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { SlashCommandExtension as SlashCommand };
