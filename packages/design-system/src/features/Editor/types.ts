import type { JSONContent, Editor as TiptapEditor } from '@tiptap/core';

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
