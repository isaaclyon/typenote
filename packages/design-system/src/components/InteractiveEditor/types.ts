import type { JSONContent } from '@tiptap/react';
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
  /** Mock notes for wiki-link autocomplete */
  mockNotes?: MockNote[];
  /** Mock tags for tag autocomplete */
  mockTags?: MockTag[];
  /** Additional CSS classes */
  className?: string;
  /** Minimum height (e.g., "200px", "100%") */
  minHeight?: string;
}
