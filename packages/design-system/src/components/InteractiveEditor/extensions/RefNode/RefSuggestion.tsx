import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { filterNotes } from '../../mocks/mockNotes.js';
import type { RefSuggestionItem } from './useRefSuggestion.js';

// Unique plugin key for wiki-link suggestions
const RefSuggestionPluginKey = new PluginKey('refSuggestion');

export interface RefSuggestionOptions {
  suggestion: Omit<SuggestionOptions<RefSuggestionItem>, 'editor'>;
}

/**
 * RefSuggestion extension for TipTap.
 *
 * Triggers a wiki-link autocomplete menu when the user types "[[" in the editor.
 * Uses the Suggestion plugin to handle the trigger and filtering.
 */
export const RefSuggestionExtension = Extension.create<RefSuggestionOptions>({
  name: 'refSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '[[',
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
        pluginKey: RefSuggestionPluginKey,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { RefSuggestionExtension as RefSuggestion };
