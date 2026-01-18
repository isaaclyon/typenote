import type { JSONContent, Editor } from '@tiptap/react';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Types (for Ladle stories)
// ─────────────────────────────────────────────────────────────────────────────

export type ObjectType = 'Page' | 'DailyNote' | 'Task' | 'Person' | 'Event' | 'Place';

export interface MockNote {
  id: string;
  title: string;
  type: ObjectType;
}

export interface MockTag {
  id: string;
  value: string;
  color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Interfaces (for IPC integration)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provider for wiki-link suggestions.
 * Desktop app implements this with IPC calls.
 * Ladle stories use mock data.
 */
export interface WikiLinkProvider {
  /** Search for existing notes/objects matching the query */
  search: (query: string) => Promise<WikiLinkItem[]> | WikiLinkItem[];
  /** Create a new note/object with the given title (optional) */
  create?: (title: string) => Promise<WikiLinkItem | null>;
}

export interface WikiLinkItem {
  id: string;
  title: string;
  type: ObjectType;
  icon?: string;
}

/**
 * Provider for tag suggestions.
 */
export interface TagProvider {
  /** Search for existing tags matching the query */
  search: (query: string) => Promise<TagItem[]> | TagItem[];
}

export interface TagItem {
  id: string;
  value: string;
  color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor Ref Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ref interface for accessing the TipTap editor instance.
 * Used by the desktop app to wire auto-save functionality.
 */
export interface InteractiveEditorRef {
  /** The TipTap editor instance (null during initialization) */
  editor: Editor | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

export interface InteractiveEditorProps {
  /** Initial content in TipTap JSON format */
  initialContent?: JSONContent;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Called when content changes */
  onChange?: (content: JSONContent) => void;
  /** Called when editor loses focus */
  onBlur?: () => void;
  /** Called when editor gains focus */
  onFocus?: () => void;
  /** Whether the editor is editable (default: true) */
  editable?: boolean;
  /** Whether to focus on mount */
  autofocus?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Minimum height (e.g., "200px", "100%") */
  minHeight?: string;
  /** Hide the first heading block (used for Daily Notes where title is shown separately) */
  hideTitle?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Feature Toggles
  // ─────────────────────────────────────────────────────────────────────────────

  /** Enable wiki-link suggestions with [[ trigger */
  enableWikiLinks?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Providers (for IPC integration)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Provider for wiki-link suggestions. Required if enableWikiLinks is true. */
  wikiLinkProvider?: WikiLinkProvider;

  /** Called when a wiki-link is clicked (for navigation) */
  onNavigateToRef?: (objectId: string) => void;

  /** Called when the TipTap editor instance becomes available */
  onEditorReady?: (editor: Editor) => void;
}
