import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import type { WikiLinkItem, WikiLinkProvider } from '../types.js';

export interface RefSuggestionOptions {
  /** Provider for searching wiki-links */
  provider: WikiLinkProvider;
  /** Callback to render the suggestion UI */
  onRender: (props: RefSuggestionRenderProps) => void;
  /** Callback when suggestion is dismissed */
  onDismiss: () => void;
}

export interface RefSuggestionRenderProps {
  /** Whether the suggestion popup is active */
  isActive: boolean;
  /** Items matching the current query */
  items: WikiLinkItem[];
  /** Current search query (text after [[) */
  query: string;
  /** Position for the popup (from TipTap) */
  position: { top: number; left: number } | null;
  /** Called when an item is selected */
  onSelect: (item: WikiLinkItem) => void;
  /** Called to create a new item (async - may involve IPC) */
  onCreate: (title: string) => Promise<void>;
}

/**
 * RefSuggestion - TipTap extension for wiki-link autocomplete.
 *
 * Triggers on `[[` and shows a popup for selecting/creating wiki-links.
 * Uses the Suggestion plugin from TipTap under the hood.
 *
 * @example
 * ```typescript
 * import { RefSuggestion } from './extensions/RefSuggestion.js';
 *
 * const editor = useEditor({
 *   extensions: [
 *     RefSuggestion.configure({
 *       provider: wikiLinkProvider,
 *       onRender: (props) => setPopupState(props),
 *       onDismiss: () => setPopupState(null),
 *     }),
 *   ],
 * });
 * ```
 */
/** Vertical offset between cursor and popup (follows 4px grid) */
const POPUP_OFFSET_Y = 8;

export const RefSuggestion = Extension.create<RefSuggestionOptions>({
  name: 'refSuggestion',

  addOptions() {
    return {
      provider: {
        search: () => [],
      },
      onRender: () => {},
      onDismiss: () => {},
    };
  },

  addProseMirrorPlugins() {
    const { provider, onRender, onDismiss } = this.options;
    const editor = this.editor;

    // Helper: Create onSelect callback
    const createOnSelect =
      (command: (attrs: { id: string; label: string }) => void) => (item: WikiLinkItem) => {
        command({ id: item.id, label: item.title });
      };

    // Helper: Create onCreate callback
    const createOnCreate =
      (command: (attrs: { id: string; label: string }) => void) => async (title: string) => {
        if (provider.create) {
          const newItem = await provider.create(title);
          if (newItem) {
            command({ id: newItem.id, label: newItem.title });
          }
        } else {
          // If no create function, just insert with the title as label
          command({ id: `new-${Date.now()}`, label: title });
        }
      };

    // Helper: Build render props from suggestion props
    const buildRenderProps = (props: {
      items?: WikiLinkItem[];
      query: string;
      clientRect?: (() => DOMRect | null) | null;
      command: (attrs: { id: string; label: string }) => void;
    }): RefSuggestionRenderProps => {
      const rect = props.clientRect?.();
      return {
        isActive: true,
        items: props.items ?? [],
        query: props.query,
        position: rect ? { top: rect.bottom + POPUP_OFFSET_Y, left: rect.left } : null,
        onSelect: createOnSelect(props.command),
        onCreate: createOnCreate(props.command),
      };
    };

    const suggestionOptions: Omit<SuggestionOptions<WikiLinkItem>, 'editor'> = {
      char: '[[',
      allowSpaces: true,

      items: async ({ query }) => {
        return await Promise.resolve(provider.search(query));
      },

      render: () => ({
        onStart: (props) => onRender(buildRenderProps(props)),
        onUpdate: (props) => onRender(buildRenderProps(props)),

        onKeyDown: (props) => {
          // Escape closes the popup
          if (props.event.key === 'Escape') {
            onDismiss();
            return true;
          }
          // Let the Command component handle Enter/Arrow keys
          return false;
        },

        onExit: () => onDismiss(),
      }),

      command: ({ editor: _editor, range, props }) => {
        // Delete the [[ trigger and insert a RefNode
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent({
            type: 'refNode',
            attrs: {
              objectId: props.id,
              label: props.label,
            },
          })
          .run();
      },
    };

    return [
      Suggestion({
        editor,
        ...suggestionOptions,
      }),
    ];
  },
});
