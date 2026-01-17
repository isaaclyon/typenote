import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { filterNotes } from '../../mocks/mockNotes.js';
import type { RefSuggestionItem } from './useRefSuggestion.js';

// Unique plugin key for mention suggestions
const MentionSuggestionPluginKey = new PluginKey('mentionSuggestion');

export interface MentionSuggestionOptions {
  suggestion: Omit<SuggestionOptions<RefSuggestionItem>, 'editor'>;
}

/**
 * MentionSuggestion extension for TipTap.
 *
 * Triggers an @ mention autocomplete menu when the user types "@" in the editor.
 * Uses the Suggestion plugin to handle the trigger and filtering.
 */
export const MentionSuggestionExtension = Extension.create<MentionSuggestionOptions>({
  name: 'mentionSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '@',
        allowSpaces: true,
        items: ({ query }: { query: string }) => {
          return filterNotes(query);
        },
        command: () => {
          // Default no-op; actual command should be provided via options
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey: MentionSuggestionPluginKey,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { MentionSuggestionExtension as MentionSuggestion };
