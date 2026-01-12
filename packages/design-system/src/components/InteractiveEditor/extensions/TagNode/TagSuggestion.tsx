import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import type { MockTag } from '../../mocks/mockTags.js';
import { filterTags } from '../../mocks/mockTags.js';

// Unique plugin key for tag suggestions
const TagSuggestionPluginKey = new PluginKey('tagSuggestion');

export interface TagSuggestionOptions {
  suggestion: Omit<SuggestionOptions<MockTag>, 'editor'>;
}

/**
 * TagSuggestion extension for TipTap.
 *
 * Triggers a tag autocomplete menu when the user types "#" in the editor.
 * Uses the Suggestion plugin to handle the trigger and filtering.
 */
export const TagSuggestionExtension = Extension.create<TagSuggestionOptions>({
  name: 'tagSuggestion',

  addOptions() {
    return {
      suggestion: {
        char: '#',
        allowSpaces: false,
        items: ({ query }: { query: string }) => {
          return filterTags(query);
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
        pluginKey: TagSuggestionPluginKey,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { TagSuggestionExtension as TagSuggestion };
