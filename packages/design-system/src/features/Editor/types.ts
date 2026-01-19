import type { JSONContent, Editor as TiptapEditor } from '@tiptap/core';
import type { RefNodeAttributes } from './extensions/RefNode.js';
import type { RefSuggestionItem } from './extensions/RefSuggestion.js';

/**
 * Editor component props.
 *
 * Uses TipTap JSONContent as the content format. This keeps the design-system
 * layer focused on UI while NotateDoc converters stay in the app layer.
 */
export interface EditorProps {
  /** Initial content in TipTap JSON format */
  content?: JSONContent;
  /** Called on every content change with debounced updates */
  onChange?: (content: JSONContent) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Disable editing (view-only mode) */
  readOnly?: boolean;
  /** Auto-focus editor on mount */
  autoFocus?: boolean;
  /** Additional CSS classes for the container */
  className?: string;

  // ============================================================================
  // Reference Support (Phase 2)
  // ============================================================================

  /**
   * Enable reference suggestions via `[[` and `@` triggers.
   * When true, onRefSearch must be provided.
   */
  enableRefs?: boolean;

  /**
   * Search function for reference suggestions.
   * Called when user types after `[[` or `@` trigger.
   */
  onRefSearch?: (query: string) => RefSuggestionItem[] | Promise<RefSuggestionItem[]>;

  /**
   * Called when user clicks a reference node.
   * Use this to navigate to the referenced object.
   */
  onRefClick?: (attrs: RefNodeAttributes) => void;

  /**
   * Optional callback to create a new object from the search query.
   * If provided, shows a "Create" option in the suggestion list.
   */
  onRefCreate?: (title: string) => RefSuggestionItem | Promise<RefSuggestionItem>;
}

/**
 * Ref handle for imperative editor access.
 */
export interface EditorRef {
  /** The underlying TipTap editor instance */
  editor: TiptapEditor | null;
  /** Focus the editor programmatically */
  focus: () => void;
  /** Clear all content */
  clear: () => void;
}

// Re-export extension types for convenience
export type { RefNodeAttributes } from './extensions/RefNode.js';
export type { RefSuggestionItem } from './extensions/RefSuggestion.js';
