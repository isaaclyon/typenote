import type { JSONContent, Editor } from '@tiptap/react';
import type { ObjectType } from '../../constants/editorConfig.js';

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
// Callback Interfaces for IPC Integration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Callbacks for ref (wiki-link) suggestions.
 * When provided, these replace the mock data with real search/create functionality.
 */
export interface RefSuggestionCallbacks {
  /** Search for existing notes/objects matching the query */
  onSearch?: (query: string) => Promise<MockNote[]>;
  /** Create a new note/object with the given title */
  onCreate?: (title: string) => Promise<MockNote | null>;
}

/**
 * Callbacks for tag suggestions.
 * When provided, these replace the mock data with real search functionality.
 */
export interface TagSuggestionCallbacks {
  /** Search for existing tags matching the query */
  onSearch?: (query: string) => Promise<MockTag[]>;
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
  /** @deprecated Use refSuggestionCallbacks instead. Mock notes for wiki-link autocomplete */
  mockNotes?: MockNote[];
  /** @deprecated Use tagSuggestionCallbacks instead. Mock tags for tag autocomplete */
  mockTags?: MockTag[];
  /** Additional CSS classes */
  className?: string;
  /** Minimum height (e.g., "200px", "100%") */
  minHeight?: string;
  /** Hide the first heading block (used for Daily Notes where title is shown separately) */
  hideTitle?: boolean;

  // ─────────────────────────────────────────────────────────────────────────────
  // IPC Integration Callbacks (optional - falls back to mock data)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Called when the TipTap editor instance becomes available */
  onEditorReady?: (editor: Editor) => void;

  /** Callbacks for ref (wiki-link) suggestions. Falls back to mock data if not provided. */
  refSuggestionCallbacks?: RefSuggestionCallbacks;
  /** Callbacks for mention suggestions (@). Falls back to mock data if not provided. */
  mentionSuggestionCallbacks?: RefSuggestionCallbacks;
  /** Callbacks for tag suggestions. Falls back to mock data if not provided. */
  tagSuggestionCallbacks?: TagSuggestionCallbacks;
  /** Called when a ref node is clicked (for navigation) */
  onNavigateToRef?: ((objectId: string) => void) | undefined;
}
