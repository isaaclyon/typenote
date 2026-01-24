import type { JSONContent, Editor as TiptapEditor } from '@tiptap/core';
import type { RefNodeAttributes } from './extensions/RefNode.js';
import type {
  RefSuggestionItem,
  HeadingSuggestionItem,
  BlockSuggestionItem,
} from './extensions/RefSuggestion.js';
import type { TagNodeAttributes } from './extensions/TagNode.js';
import type { TagSuggestionItem } from './extensions/TagSuggestionList.js';
import type { EmbedNodeAttributes } from './extensions/EmbedNode.types.js';

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
  // Slash Commands (Phase 2)
  // ============================================================================

  /**
   * Enable slash command menu via `/` trigger at start of line.
   * Allows inserting block types like headings, lists, quotes, etc.
   * @default true (when not readOnly)
   */
  enableSlashCommands?: boolean;

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

  // ============================================================================
  // Heading & Block References (Phase 2c)
  // ============================================================================

  /**
   * Search function for headings within an object.
   * Called when user types `[[Object#` to search headings.
   */
  onHeadingSearch?: (
    objectId: string,
    query: string
  ) => HeadingSuggestionItem[] | Promise<HeadingSuggestionItem[]>;

  /**
   * Search function for blocks within an object.
   * Called when user types `[[Object#^` to search blocks.
   */
  onBlockSearch?: (
    objectId: string,
    query: string
  ) => BlockSuggestionItem[] | Promise<BlockSuggestionItem[]>;

  /**
   * Called when a block without an alias is selected.
   * Use this to insert a BlockIdNode at the source block.
   */
  onBlockIdInsert?: (objectId: string, blockKsuid: string, newAlias: string) => void;

  // ============================================================================
  // Embeds (Phase 2d)
  // ============================================================================

  /**
   * Enable embed suggestions via `![[` trigger.
   * When true, onRefSearch must be provided.
   */
  enableEmbeds?: boolean;

  /**
   * Resolve embed content as TipTap JSONContent.
   */
  onEmbedResolve?: (target: EmbedNodeAttributes) => Promise<JSONContent>;

  /**
   * Called when the user clicks "Open" on an embed.
   */
  onEmbedOpen?: (target: EmbedNodeAttributes) => void;

  /**
   * Optional live update subscription for embeds.
   */
  onEmbedSubscribe?: (
    target: EmbedNodeAttributes,
    onUpdate: (content: JSONContent) => void
  ) => () => void;

  // ============================================================================
  // Images (Phase 3)
  // ============================================================================

  /**
   * Upload handler for file-based image inserts (file picker, drop, paste).
   * Should return the final source URL and optional metadata.
   */
  onImageUpload?: (file: File, context: ImageUploadRequest) => Promise<ImageUploadResult>;

  /**
   * Optional hook for cleaning up image resources on removal.
   */
  onImageRemove?: (uploadId: string | null) => void;

  // ============================================================================
  // Tag Support (Phase 2b)
  // ============================================================================

  /**
   * Enable tag suggestions via `#` trigger.
   * When true, onTagSearch must be provided.
   */
  enableTags?: boolean;

  /**
   * Search function for tag suggestions.
   * Called when user types after `#` trigger.
   */
  onTagSearch?: (query: string) => TagSuggestionItem[] | Promise<TagSuggestionItem[]>;

  /**
   * Optional callback to create a new tag from the search query.
   * If provided, shows a "Create" option in the suggestion list.
   */
  onTagCreate?: (name: string) => TagSuggestionItem | Promise<TagSuggestionItem>;

  /**
   * Called when a tag node is clicked.
   * Use this to navigate to the tag page.
   */
  onTagClick?: (attrs: TagNodeAttributes) => void;
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
export type { TagNodeAttributes } from './extensions/TagNode.js';
export type { TagSuggestionItem } from './extensions/TagSuggestionList.js';
export type { EmbedNodeAttributes } from './extensions/EmbedNode.types.js';
export type { ImageNodeAttributes } from './extensions/ResizableImage.types.js';

export interface ImageUploadRequest {
  uploadId: string;
  alt: string | null;
  caption: string | null;
  onProgress: (progress: number) => void;
}

export interface ImageUploadResult {
  src: string;
  alt?: string | null;
  caption?: string | null;
}

/** Handler function for uploading images */
export type ImageUploadHandler = (
  file: File,
  context: ImageUploadRequest
) => Promise<ImageUploadResult>;
