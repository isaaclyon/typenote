/**
 * SlashCommand Extension for TipTap
 *
 * Handles slash (/) trigger for command palette autocomplete.
 * Uses @tiptap/suggestion for trigger detection and Floating UI for popup positioning.
 */

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { computePosition, flip, shift } from '@floating-ui/react';
import { filterCommands } from './commandRegistry.js';
import {
  SlashCommandMenu,
  type SlashCommandMenuHandle,
} from '../../components/SlashCommandMenu/index.js';
import type { SlashCommand as SlashCommandType } from './types.js';

// Plugin key for slash command suggestion
export const slashCommandPluginKey = new PluginKey('slashCommand');

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        pluginKey: slashCommandPluginKey,

        // Filter commands based on query
        items: ({ query }) => filterCommands(query),

        // Execute when selected
        command: ({ editor, range, props }) => {
          // 1. Delete '/query' text
          editor.chain().focus().deleteRange(range).run();
          // 2. Execute command
          const cmd = props as SlashCommandType;
          cmd.execute(editor);
        },

        // Render React menu
        render: () => {
          let component: ReactRenderer<SlashCommandMenuHandle> | null = null;
          let popup: HTMLDivElement | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items ?? [],
                  command: (item: SlashCommandType) => {
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
                command: (item: SlashCommandType) => {
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
              return component?.ref?.onKeyDown?.(props) ?? false;
            },

            onExit: () => {
              popup?.remove();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
