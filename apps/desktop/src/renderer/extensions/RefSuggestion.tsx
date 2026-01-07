/**
 * RefSuggestion Extension for TipTap
 *
 * Handles wiki-link ([[) and mention (@) triggers for autocomplete suggestions.
 * Uses @tiptap/suggestion for trigger detection and Floating UI for popup positioning.
 */

import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { computePosition, flip, shift } from '@floating-ui/react';
import type { ObjectSummary } from '@typenote/api';
import { SuggestionPopup, type SuggestionPopupRef } from '../components/SuggestionPopup.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface RefSuggestionOptions {
  onSearch: (query: string) => Promise<ObjectSummary[]>;
  onCreate: (title: string) => Promise<ObjectSummary | null>;
}

type SuggestionItem = ObjectSummary | { createNew: true; title: string };

// Plugin keys for each trigger type
const wikiLinkPluginKey = new PluginKey('wikiLinkSuggestion');
const mentionPluginKey = new PluginKey('mentionSuggestion');

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion Config Factory
// ─────────────────────────────────────────────────────────────────────────────

function createSuggestionConfig(
  trigger: string,
  pluginKey: PluginKey,
  options: RefSuggestionOptions
): Omit<SuggestionOptions<ObjectSummary>, 'editor'> {
  return {
    pluginKey,
    char: trigger,
    allowSpaces: true,
    startOfLine: false,

    items: async ({ query }) => {
      return options.onSearch(query);
    },

    command: ({ editor, range, props }) => {
      const item = props as SuggestionItem;

      // Delete the trigger text
      editor.chain().focus().deleteRange(range).run();

      if ('createNew' in item) {
        // Handle create new - caller handles async creation
        void options.onCreate(item.title).then((created) => {
          if (created) {
            editor.commands.insertContent({
              type: 'ref',
              attrs: {
                mode: 'link',
                target: { kind: 'object', objectId: created.id },
                alias: created.title,
              },
            });
          }
        });
      } else {
        // Insert ref node for existing object
        editor.commands.insertContent({
          type: 'ref',
          attrs: {
            mode: 'link',
            target: { kind: 'object', objectId: item.id },
            alias: item.title,
          },
        });
      }
    },

    render: () => {
      let component: ReactRenderer<SuggestionPopupRef> | null = null;
      let popup: HTMLDivElement | null = null;

      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionPopup, {
            props: {
              items: props.items ?? [],
              isLoading: false,
              query: props.query,
              onSelect: (item: SuggestionItem) => {
                props.command(item);
              },
            },
            editor: props.editor,
          });

          // Create popup container
          popup = document.createElement('div');
          popup.style.position = 'fixed';
          popup.style.zIndex = '9999';
          popup.appendChild(component.element);
          document.body.appendChild(popup);

          // Position the popup
          if (props.clientRect) {
            const rect = props.clientRect();
            if (rect) {
              void computePosition({ getBoundingClientRect: () => rect }, popup, {
                placement: 'bottom-start',
                middleware: [flip(), shift()],
              }).then(({ x, y }) => {
                if (popup) {
                  popup.style.left = `${x}px`;
                  popup.style.top = `${y}px`;
                }
              });
            }
          }
        },

        onUpdate: (props) => {
          component?.updateProps({
            items: props.items ?? [],
            isLoading: false,
            query: props.query,
            onSelect: (item: SuggestionItem) => {
              props.command(item);
            },
          });

          // Update position
          if (props.clientRect && popup) {
            const rect = props.clientRect();
            if (rect) {
              void computePosition({ getBoundingClientRect: () => rect }, popup, {
                placement: 'bottom-start',
                middleware: [flip(), shift()],
              }).then(({ x, y }) => {
                if (popup) {
                  popup.style.left = `${x}px`;
                  popup.style.top = `${y}px`;
                }
              });
            }
          }
        },

        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup?.remove();
            return true;
          }
          return component?.ref?.onKeyDown(props.event) ?? false;
        },

        onExit: () => {
          popup?.remove();
          component?.destroy();
        },
      };
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Extension
// ─────────────────────────────────────────────────────────────────────────────

export const RefSuggestion = Extension.create<RefSuggestionOptions>({
  name: 'refSuggestion',

  addOptions() {
    return {
      onSearch: async () => [],
      onCreate: async () => null,
    };
  },

  addProseMirrorPlugins() {
    return [
      // Wiki-link trigger: [[
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('[[', wikiLinkPluginKey, this.options),
      }),
      // Mention trigger: @
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('@', mentionPluginKey, this.options),
      }),
    ];
  },
});
