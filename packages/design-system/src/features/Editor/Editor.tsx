import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { AnyExtension, Range, Editor as TiptapEditor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';

// Phosphor icons for slash commands
import { TextT } from '@phosphor-icons/react/dist/ssr/TextT';
import { TextHOne } from '@phosphor-icons/react/dist/ssr/TextHOne';
import { TextHTwo } from '@phosphor-icons/react/dist/ssr/TextHTwo';
import { TextHThree } from '@phosphor-icons/react/dist/ssr/TextHThree';
import { ListBullets } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ListNumbers } from '@phosphor-icons/react/dist/ssr/ListNumbers';
import { ListChecks } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { Quotes } from '@phosphor-icons/react/dist/ssr/Quotes';
import { Code } from '@phosphor-icons/react/dist/ssr/Code';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { Table } from '@phosphor-icons/react/dist/ssr/Table';
// Callout icons
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle';
// Math icon
import { MathOperations } from '@phosphor-icons/react/dist/ssr/MathOperations';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { ImageSquare } from '@phosphor-icons/react/dist/ssr/ImageSquare';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

import { cn } from '../../lib/utils.js';
import type { EditorProps, EditorRef, ImageUploadRequest } from './types.js';
import { RefNode } from './extensions/RefNode.js';
import { RefSuggestionList } from './extensions/RefSuggestionList.js';
import type { AliasMode } from './extensions/RefSuggestionList.js';
import type {
  RefSuggestionItem,
  AnySuggestionItem,
  SuggestionMode,
  HeadingSuggestionItem,
  BlockSuggestionItem,
} from './extensions/RefSuggestion.js';
import {
  parseQueryWithAlias,
  isRefItem,
  isHeadingItem,
  isBlockItem,
} from './extensions/RefSuggestion.js';
import { generateBlockId } from './extensions/block-id-utils.js';
import { getSlashCommandItems, filterSlashCommands } from './extensions/SlashCommand.js';
import type { SlashCommandItem } from './extensions/SlashCommand.js';
import { SlashCommandList } from './extensions/SlashCommandList.js';
import { TagNode } from './extensions/TagNode.js';
import { TagSuggestionList } from './extensions/TagSuggestionList.js';
import type { TagSuggestionItem } from './extensions/TagSuggestionList.js';
import { CodeBlock } from './extensions/CodeBlock.js';
import { Callout } from './extensions/Callout.js';
import { TableExtensions } from './extensions/Table.js';
import { TableToolbar } from './extensions/TableToolbar.js';
import { ResizableImage } from './extensions/ResizableImage.js';
import type { ImageNodeAttributes } from './extensions/ResizableImage.js';
import { InlineMath } from './extensions/InlineMath.js';
import { MathBlock } from './extensions/MathBlock.js';
import { BlockIdNode } from './extensions/BlockIdNode.js';
import { EmbedNode } from './extensions/EmbedNode.js';
import { FootnoteRefNode } from './extensions/FootnoteRefNode.js';
import { FootnoteDefNode } from './extensions/FootnoteDefNode.js';
import { FootnoteSeparator } from './extensions/FootnoteSeparator.js';
import { FootnoteManager } from './extensions/FootnoteManager.js';
import { ImageInsertPopover } from './extensions/ImageInsertPopover.js';
import {
  createImageUploadId,
  isRasterImageFile,
  normalizeImageMeta,
} from './extensions/image-utils.js';

// Editor typography styles
import './editor.css';

// Slash command icons bundle
const slashCommandIcons = {
  TextT,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  ListChecks,
  Quotes,
  Code,
  Minus,
  Table,
  // Callout icons
  Info,
  Warning,
  Lightbulb,
  WarningCircle,
  // Math icon
  MathOperations,
  // Embed icon
  StackSimple,
  // Image icon
  ImageSquare,
};

// ============================================================================
// Editor
// ============================================================================

/**
 * Block-based rich text editor built on TipTap/ProseMirror.
 *
 * Phase 1 features:
 * - Paragraphs and headings (h1-h6)
 * - Basic marks: bold, italic, code, strikethrough
 * - Keyboard shortcuts (Cmd+B, Cmd+I, etc.)
 * - Markdown input rules (# for heading, ** for bold, etc.)
 * - Placeholder text when empty
 *
 * Phase 2 features:
 * - RefNode: Inline object references
 * - RefSuggestion: Autocomplete via `[[` or `@` triggers
 *
 * Content format: TipTap JSONContent (converters to NotateDoc live in app layer)
 */
const Editor = React.forwardRef<EditorRef, EditorProps>(
  (
    {
      content,
      onChange,
      placeholder = 'Start writing...',
      readOnly = false,
      autoFocus = false,
      className,
      // Phase 2: Slash Commands
      enableSlashCommands = true,
      // Phase 2: Refs
      enableRefs = false,
      onRefSearch,
      onRefClick,
      onRefCreate,
      // Phase 2c: Heading & Block references
      onHeadingSearch,
      onBlockSearch,
      onBlockIdInsert,
      // Phase 2d: Embeds
      enableEmbeds = true,
      onEmbedResolve,
      onEmbedOpen,
      onEmbedSubscribe,
      // Phase 3: Images
      onImageUpload,
      onImageRemove,
      // Phase 2b: Tags
      enableTags = false,
      onTagSearch,
      onTagCreate,
      onTagClick,
    },
    ref
  ) => {
    // Ref suggestion state
    const [refSuggestionState, setRefSuggestionState] = React.useState<{
      isOpen: boolean;
      items: AnySuggestionItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      command: ((item: AnySuggestionItem) => void) | null;
      range: { from: number; to: number } | null;
      editor: ReturnType<typeof useEditor> | null;
      mode: SuggestionMode;
    }>({
      isOpen: false,
      items: [],
      query: '',
      selectedIndex: 0,
      position: null,
      command: null,
      range: null,
      editor: null,
      mode: 'object',
    });

    // Embed suggestion state
    const [embedSuggestionState, setEmbedSuggestionState] = React.useState<{
      isOpen: boolean;
      items: AnySuggestionItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      command: ((item: AnySuggestionItem) => void) | null;
      range: { from: number; to: number } | null;
      editor: ReturnType<typeof useEditor> | null;
      mode: SuggestionMode;
    }>({
      isOpen: false,
      items: [],
      query: '',
      selectedIndex: 0,
      position: null,
      command: null,
      range: null,
      editor: null,
      mode: 'object',
    });

    // Slash command state
    const [slashCommandState, setSlashCommandState] = React.useState<{
      isOpen: boolean;
      items: SlashCommandItem[];
      filteredItems: SlashCommandItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      range: Range | null;
    }>({
      isOpen: false,
      items: [],
      filteredItems: [],
      query: '',
      selectedIndex: 0,
      position: null,
      range: null,
    });

    const [imageInsertState, setImageInsertState] = React.useState<{
      isOpen: boolean;
      mode: 'upload' | 'url';
      position: { top: number; left: number } | null;
      insertPosition: number | null;
    }>({
      isOpen: false,
      mode: 'upload',
      position: null,
      insertPosition: null,
    });

    // Tag suggestion state
    const [tagSuggestionState, setTagSuggestionState] = React.useState<{
      isOpen: boolean;
      items: TagSuggestionItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      command: ((item: TagSuggestionItem) => void) | null;
    }>({
      isOpen: false,
      items: [],
      query: '',
      selectedIndex: 0,
      position: null,
      command: null,
    });

    // Store refs in refs so they're available in extension callbacks
    const onRefSearchRef = React.useRef(onRefSearch);
    const onRefCreateRef = React.useRef(onRefCreate);
    const onHeadingSearchRef = React.useRef(onHeadingSearch);
    const onBlockSearchRef = React.useRef(onBlockSearch);
    const onBlockIdInsertRef = React.useRef(onBlockIdInsert);
    React.useEffect(() => {
      onRefSearchRef.current = onRefSearch;
      onRefCreateRef.current = onRefCreate;
      onHeadingSearchRef.current = onHeadingSearch;
      onBlockSearchRef.current = onBlockSearch;
      onBlockIdInsertRef.current = onBlockIdInsert;
    }, [onRefSearch, onRefCreate, onHeadingSearch, onBlockSearch, onBlockIdInsert]);

    // Store tag callbacks in refs
    const onTagSearchRef = React.useRef(onTagSearch);
    const onTagCreateRef = React.useRef(onTagCreate);
    React.useEffect(() => {
      onTagSearchRef.current = onTagSearch;
      onTagCreateRef.current = onTagCreate;
    }, [onTagSearch, onTagCreate]);

    const onImageUploadRef = React.useRef(onImageUpload);
    const onImageRemoveRef = React.useRef(onImageRemove);
    React.useEffect(() => {
      onImageUploadRef.current = onImageUpload;
      onImageRemoveRef.current = onImageRemove;
    }, [onImageUpload, onImageRemove]);

    const editorRef = React.useRef<TiptapEditor | null>(null);
    const imageObjectUrlsRef = React.useRef(new Map<string, string>());
    const imageUploadIdsRef = React.useRef(new Set<string>());

    const releaseImageObjectUrl = React.useCallback((uploadId: string) => {
      const existingUrl = imageObjectUrlsRef.current.get(uploadId);
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
        imageObjectUrlsRef.current.delete(uploadId);
      }
    }, []);

    const collectImageUploadIds = React.useCallback((doc: ProseMirrorNode) => {
      const uploadIds = new Set<string>();
      doc.descendants((node) => {
        if (node.type.name !== 'image') return true;
        const uploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
        if (typeof uploadId === 'string' && uploadId.length > 0) {
          uploadIds.add(uploadId);
        }
        return true;
      });
      return uploadIds;
    }, []);

    const setImageObjectUrl = React.useCallback((uploadId: string, objectUrl: string) => {
      const existingUrl = imageObjectUrlsRef.current.get(uploadId);
      if (existingUrl && existingUrl !== objectUrl) {
        URL.revokeObjectURL(existingUrl);
      }
      imageObjectUrlsRef.current.set(uploadId, objectUrl);
    }, []);

    const syncImageUploadIds = React.useCallback(
      (doc: ProseMirrorNode) => {
        const currentIds = collectImageUploadIds(doc);
        const previousIds = imageUploadIdsRef.current;

        previousIds.forEach((uploadId) => {
          if (!currentIds.has(uploadId)) {
            releaseImageObjectUrl(uploadId);
            onImageRemoveRef.current?.(uploadId);
          }
        });

        imageUploadIdsRef.current = currentIds;
      },
      [collectImageUploadIds, releaseImageObjectUrl]
    );

    const updateImageNodeByUploadId = React.useCallback(
      (uploadId: string, attrs: Partial<ImageNodeAttributes>) => {
        const editorInstance = editorRef.current;
        if (!editorInstance) return;
        const { state, view } = editorInstance;
        let transaction = state.tr;
        let updated = false;

        state.doc.descendants((node, pos) => {
          if (node.type.name !== 'image') return true;
          const nodeUploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
          if (nodeUploadId !== uploadId) return true;
          transaction = transaction.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...attrs,
          });
          updated = true;
          return false;
        });

        if (updated) {
          view.dispatch(transaction);
        }
      },
      []
    );

    const findImageNodeByUploadId = React.useCallback(
      (uploadId: string | null): ImageNodeAttributes | null => {
        if (!uploadId) return null;
        const editorInstance = editorRef.current;
        if (!editorInstance) return null;
        let found: ImageNodeAttributes | null = null;
        editorInstance.state.doc.descendants((node) => {
          if (node.type.name !== 'image') return true;
          const nodeUploadId = (node.attrs as ImageNodeAttributes)['uploadId'];
          if (nodeUploadId !== uploadId) return true;
          found = node.attrs as ImageNodeAttributes;
          return false;
        });
        return found;
      },
      []
    );

    const insertImageNodes = React.useCallback(
      (nodes: ImageNodeAttributes[], position?: number | null) => {
        const editorInstance = editorRef.current;
        if (!editorInstance || readOnly) return;
        const content = nodes.map((attrs) => ({
          type: 'image',
          attrs,
        }));
        const chain = editorInstance.chain().focus();
        if (typeof position === 'number') {
          chain.insertContentAt(position, content);
        } else {
          chain.insertContent(content);
        }
        chain.run();
      },
      [readOnly]
    );

    const startImageUpload = React.useCallback(
      async (
        file: File,
        uploadId: string,
        meta?: { alt?: string | null; caption?: string | null }
      ) => {
        const uploader = onImageUploadRef.current;
        if (!uploader) return;

        const baseMeta = meta ?? findImageNodeByUploadId(uploadId);
        const normalizedMeta = normalizeImageMeta({
          alt: baseMeta?.alt ?? null,
          caption: baseMeta?.caption ?? null,
        });

        const request: ImageUploadRequest = {
          uploadId,
          alt: normalizedMeta.alt,
          caption: normalizedMeta.caption,
          onProgress: (progress) => {
            const safeProgress = Math.max(0, Math.min(100, progress));
            updateImageNodeByUploadId(uploadId, { uploadProgress: safeProgress });
          },
        };

        try {
          const result = await uploader(file, request);
          const mergedMeta = normalizeImageMeta({
            alt: result.alt ?? normalizedMeta.alt,
            caption: result.caption ?? normalizedMeta.caption,
          });
          updateImageNodeByUploadId(uploadId, {
            src: result.src,
            alt: mergedMeta.alt,
            caption: mergedMeta.caption,
            uploadStatus: null,
            uploadProgress: null,
            errorMessage: null,
          });
          releaseImageObjectUrl(uploadId);
        } catch (error) {
          updateImageNodeByUploadId(uploadId, {
            uploadStatus: 'error',
            uploadProgress: null,
            errorMessage: error instanceof Error && error.message ? error.message : 'Upload failed',
          });
        }
      },
      [findImageNodeByUploadId, releaseImageObjectUrl, updateImageNodeByUploadId]
    );

    const insertImageFiles = React.useCallback(
      (
        files: File[],
        meta?: { alt?: string | null; caption?: string | null },
        position?: number | null
      ) => {
        if (readOnly) return;
        const validFiles = files.filter(isRasterImageFile);
        if (validFiles.length === 0) return;
        const uploader = onImageUploadRef.current;
        const normalizedMeta = normalizeImageMeta(meta);

        const uploads = validFiles.map((file) => {
          const uploadId = createImageUploadId();
          const objectUrl = URL.createObjectURL(file);
          setImageObjectUrl(uploadId, objectUrl);

          const attrs: ImageNodeAttributes = {
            src: objectUrl,
            alt: normalizedMeta.alt,
            caption: normalizedMeta.caption,
            uploadId,
            uploadStatus: uploader ? 'uploading' : null,
            uploadProgress: uploader ? 0 : null,
            errorMessage: null,
          };

          return { file, uploadId, attrs };
        });

        insertImageNodes(
          uploads.map((upload) => upload.attrs),
          position
        );

        uploads.forEach((upload) => {
          if (uploader) {
            void startImageUpload(upload.file, upload.uploadId, normalizedMeta);
          }
        });
      },
      [insertImageNodes, readOnly, setImageObjectUrl, startImageUpload]
    );

    const insertImageFromUrl = React.useCallback(
      (
        src: string,
        meta?: { alt?: string | null; caption?: string | null },
        position?: number | null
      ) => {
        if (readOnly) return;
        const normalizedMeta = normalizeImageMeta(meta);
        insertImageNodes(
          [
            {
              src,
              alt: normalizedMeta.alt,
              caption: normalizedMeta.caption,
              uploadId: null,
              uploadStatus: null,
              uploadProgress: null,
              errorMessage: null,
            },
          ],
          position
        );
      },
      [insertImageNodes, readOnly]
    );

    const handleRetryUpload = React.useCallback(
      (file: File, uploadId: string | null) => {
        if (!uploadId) {
          insertImageFiles([file]);
          return;
        }

        const existingMeta = findImageNodeByUploadId(uploadId);
        const normalizedMeta = normalizeImageMeta({
          alt: existingMeta?.alt ?? null,
          caption: existingMeta?.caption ?? null,
        });
        const objectUrl = URL.createObjectURL(file);
        setImageObjectUrl(uploadId, objectUrl);
        updateImageNodeByUploadId(uploadId, {
          src: objectUrl,
          alt: normalizedMeta.alt,
          caption: normalizedMeta.caption,
          uploadStatus: onImageUploadRef.current ? 'uploading' : null,
          uploadProgress: onImageUploadRef.current ? 0 : null,
          errorMessage: null,
        });

        if (onImageUploadRef.current) {
          void startImageUpload(file, uploadId, normalizedMeta);
        }
      },
      [
        findImageNodeByUploadId,
        insertImageFiles,
        setImageObjectUrl,
        startImageUpload,
        updateImageNodeByUploadId,
      ]
    );

    const handleImageRemove = React.useCallback(
      (uploadId: string | null) => {
        if (uploadId) {
          releaseImageObjectUrl(uploadId);
          imageUploadIdsRef.current.delete(uploadId);
        }
        onImageRemoveRef.current?.(uploadId ?? null);
      },
      [releaseImageObjectUrl]
    );

    // Create ref suggestion render callbacks
    const createRefSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
          const rect = props.clientRect?.();
          setRefSuggestionState({
            isOpen: true,
            items: props.items,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            command: props.command,
            range: props.range,
            editor: props.editor,
            mode: props.mode ?? 'object',
          });
        },
        onUpdate: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
          const rect = props.clientRect?.();
          setRefSuggestionState((prev) => ({
            ...prev,
            items: props.items,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            command: props.command,
            range: props.range,
            editor: props.editor,
            mode: props.mode ?? prev.mode,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          // Helper to check if we're in alias mode (only applies to object mode)
          const isInAliasMode = (prev: typeof refSuggestionState) => {
            if (prev.mode !== 'object') return false;
            const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            if (alias === null) return false;
            return prev.items.some(
              (item) => isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
            );
          };

          if (event.key === 'ArrowUp') {
            setRefSuggestionState((prev) => {
              // Disable arrow keys in alias mode (only one item)
              if (isInAliasMode(prev)) return prev;
              return {
                ...prev,
                selectedIndex:
                  prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
              };
            });
            return true;
          }
          if (event.key === 'ArrowDown') {
            setRefSuggestionState((prev) => {
              // Disable arrow keys in alias mode (only one item)
              if (isInAliasMode(prev)) return prev;
              return {
                ...prev,
                selectedIndex:
                  prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
              };
            });
            return true;
          }
          if (event.key === 'Enter') {
            setRefSuggestionState((prev) => {
              // In alias mode (object mode only), select the matched item
              if (prev.mode === 'object') {
                const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
                const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);

                if (alias !== null) {
                  // Find the matched item
                  const matchedItem = prev.items.find(
                    (item) =>
                      isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
                  );
                  if (matchedItem && prev.command) {
                    prev.command(matchedItem);
                    return { ...prev, isOpen: false };
                  }
                }
              }

              // Normal mode: select the highlighted item
              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Tab') {
            event.preventDefault();
            setRefSuggestionState((prev) => {
              // Tab completion only works in object mode
              if (prev.mode !== 'object') return prev;
              // Disable Tab in alias mode (already have full title)
              if (isInAliasMode(prev)) return prev;

              const item = prev.items[prev.selectedIndex];
              if (!item || !prev.editor || !prev.range || !isRefItem(item)) return prev;

              // Get the title to autocomplete
              const title = item.title;

              // For `[[` trigger, range starts at first `[` and includes `[[query`
              // So we replace the entire range with `[[title`
              // For `@` trigger, range starts at `@` and includes `@query`
              // So we replace with `@title`
              const isDoubleBracket = prev.query.startsWith('[');
              const newText = isDoubleBracket ? `[[${title}` : `@${title}`;

              prev.editor.chain().focus().deleteRange(prev.range).insertContent(newText).run();

              // Don't close - let the suggestion update naturally
              return prev;
            });
            return true;
          }
          if (event.key === 'Escape') {
            setRefSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setRefSuggestionState({
            isOpen: false,
            items: [],
            query: '',
            selectedIndex: 0,
            position: null,
            command: null,
            range: null,
            editor: null,
            mode: 'object',
          });
        },
      }),
      []
    );

    // Create embed suggestion render callbacks
    const createEmbedSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
          const rect = props.clientRect?.();
          setEmbedSuggestionState({
            isOpen: true,
            items: props.items,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            command: props.command,
            range: props.range,
            editor: props.editor,
            mode: props.mode ?? 'object',
          });
        },
        onUpdate: (props: SuggestionProps<AnySuggestionItem> & { mode?: SuggestionMode }) => {
          const rect = props.clientRect?.();
          setEmbedSuggestionState((prev) => ({
            ...prev,
            items: props.items,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            command: props.command,
            range: props.range,
            editor: props.editor,
            mode: props.mode ?? prev.mode,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          const isInAliasMode = (prev: typeof embedSuggestionState) => {
            if (prev.mode !== 'object') return false;
            const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            if (alias === null) return false;
            return prev.items.some(
              (item) => isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
            );
          };

          if (event.key === 'ArrowUp') {
            setEmbedSuggestionState((prev) => {
              if (isInAliasMode(prev)) return prev;
              return {
                ...prev,
                selectedIndex:
                  prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
              };
            });
            return true;
          }
          if (event.key === 'ArrowDown') {
            setEmbedSuggestionState((prev) => {
              if (isInAliasMode(prev)) return prev;
              return {
                ...prev,
                selectedIndex:
                  prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
              };
            });
            return true;
          }
          if (event.key === 'Enter') {
            setEmbedSuggestionState((prev) => {
              if (prev.mode === 'object') {
                const cleanQuery = prev.query.startsWith('[') ? prev.query.slice(1) : prev.query;
                const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
                if (alias !== null) {
                  const matchedItem = prev.items.find(
                    (item) =>
                      isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
                  );
                  if (matchedItem && prev.command) {
                    prev.command(matchedItem);
                    return { ...prev, isOpen: false };
                  }
                }
              }

              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Tab') {
            event.preventDefault();
            setEmbedSuggestionState((prev) => {
              if (prev.mode !== 'object') return prev;
              if (isInAliasMode(prev)) return prev;

              const item = prev.items[prev.selectedIndex];
              if (!item || !prev.editor || !prev.range || !isRefItem(item)) return prev;

              const title = item.title;
              const newText = `![[${title}`;

              prev.editor.chain().focus().deleteRange(prev.range).insertContent(newText).run();
              return prev;
            });
            return true;
          }
          if (event.key === 'Escape') {
            setEmbedSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setEmbedSuggestionState({
            isOpen: false,
            items: [],
            query: '',
            selectedIndex: 0,
            position: null,
            command: null,
            range: null,
            editor: null,
            mode: 'object',
          });
        },
      }),
      []
    );

    // Create slash command render callbacks
    const allSlashCommands = React.useMemo(() => getSlashCommandItems(slashCommandIcons), []);

    const createSlashCommandRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
          const rect = props.clientRect?.();
          const filtered = filterSlashCommands(allSlashCommands, props.query);
          setSlashCommandState({
            isOpen: true,
            items: allSlashCommands,
            filteredItems: filtered,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            range: props.range,
          });
        },
        onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
          const rect = props.clientRect?.();
          const filtered = filterSlashCommands(allSlashCommands, props.query);
          setSlashCommandState((prev) => ({
            ...prev,
            filteredItems: filtered,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, filtered.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            range: props.range,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (event.key === 'ArrowUp') {
            setSlashCommandState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.filteredItems.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setSlashCommandState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.filteredItems.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            // Execute command is handled by handleSlashCommandSelect
            return true;
          }
          if (event.key === 'Escape') {
            setSlashCommandState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setSlashCommandState({
            isOpen: false,
            items: [],
            filteredItems: [],
            query: '',
            selectedIndex: 0,
            position: null,
            range: null,
          });
        },
      }),
      [allSlashCommands]
    );

    // Create tag suggestion render callbacks
    const createTagSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<TagSuggestionItem>) => {
          const rect = props.clientRect?.();
          setTagSuggestionState({
            isOpen: true,
            items: props.items,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            command: props.command,
          });
        },
        onUpdate: (props: SuggestionProps<TagSuggestionItem>) => {
          const rect = props.clientRect?.();
          setTagSuggestionState((prev) => ({
            ...prev,
            items: props.items,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            command: props.command,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (event.key === 'ArrowUp') {
            setTagSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setTagSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            setTagSuggestionState((prev) => {
              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Escape') {
            setTagSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setTagSuggestionState({
            isOpen: false,
            items: [],
            query: '',
            selectedIndex: 0,
            position: null,
            command: null,
          });
        },
      }),
      []
    );

    // Build extensions array - stable across renders
    const extensions = React.useMemo(() => {
      const baseExtensions: AnyExtension[] = [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
          // Disable built-in code block - we use our custom one with syntax highlighting
          codeBlock: false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        Link.configure({
          autolink: true,
          linkOnPaste: true,
          openOnClick: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        }),
        // Highlight mark (==text== input rule)
        HighlightExtension,
        // Image support (Phase 2: resizable)
        ResizableImage.configure({
          onRetryUpload: handleRetryUpload,
          onRemoveImage: handleImageRemove,
        }),
        // Task lists (not included in StarterKit)
        TaskList,
        TaskItem.configure({
          nested: true, // Allow nesting task items
        }),
        // Custom code block with Shiki syntax highlighting
        CodeBlock,
        // Callout blocks
        Callout,
        // Tables
        ...TableExtensions,
        // Math support
        InlineMath,
        MathBlock,
        // Block IDs (^block-id syntax)
        BlockIdNode,
        // Embeds (![[...]] syntax)
        EmbedNode.configure({
          onResolve: onEmbedResolve ?? null,
          onOpen: onEmbedOpen ?? null,
          onSubscribe: onEmbedSubscribe ?? null,
          maxDepth: 1,
          embedDepth: 0,
        }),
        // Footnotes
        FootnoteRefNode,
        FootnoteDefNode,
        FootnoteSeparator,
        FootnoteManager,
      ];

      if (enableRefs) {
        // Add RefNode
        baseExtensions.push(
          RefNode.configure({
            onRefClick,
          })
        );

        // Create suggestion extension for @ trigger (supports @query|alias syntax)
        const AtSuggestion = Extension.create({
          name: 'atSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('atSuggestion'),
                char: '@',
                allowSpaces: true,
                startOfLine: false,
                items: async ({ query }) => {
                  const search = onRefSearchRef.current;
                  if (!search) return [];
                  // Parse query to separate search term from alias
                  const { objectQuery } = parseQueryWithAlias(query);
                  return search(objectQuery);
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as RefSuggestionItem;
                  // Get the full query text to check for alias
                  const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                  const { alias } = parseQueryWithAlias(fullQuery);
                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                      {
                        type: 'refNode',
                        attrs: {
                          objectId: typedItem.objectId,
                          objectType: typedItem.objectType,
                          displayTitle: typedItem.title,
                          color: typedItem.color,
                          alias,
                        },
                      },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createRefSuggestionRender,
              }),
            ];
          },
        });

        // Create suggestion extension for [[ trigger (supports [[query|alias]] syntax)
        const BracketSuggestion = Extension.create({
          name: 'bracketSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('bracketSuggestion'),
                char: '[',
                allowSpaces: true,
                startOfLine: false,
                allow: ({ state, range }) => {
                  // The suggestion plugin triggers on `[` and range.from points to the
                  // trigger position. For `[[`, we need at least 2 chars in the range
                  // and the first two chars should both be `[`.
                  //
                  // range.from = position of first `[`
                  // range.to = current cursor position
                  // We need range.to - range.from >= 2 (at least `[[`)
                  // And chars at range.from and range.from+1 should both be `[`

                  const queryLength = range.to - range.from;
                  if (queryLength < 1) return false; // Need at least the second `[`

                  // Check if char at range.from+1 is also `[`
                  // (range.from is already `[` since that's what triggered this)
                  try {
                    const charBefore = state.doc.textBetween(
                      range.from - 1,
                      range.from,
                      undefined,
                      '\ufffc'
                    );
                    if (charBefore === '!') return false;

                    const secondChar = state.doc.textBetween(
                      range.from + 1,
                      range.from + 2,
                      undefined,
                      '\ufffc'
                    );
                    return secondChar === '[';
                  } catch {
                    return false;
                  }
                },
                items: async ({ query }) => {
                  const search = onRefSearchRef.current;
                  if (!search) return [];
                  // Strip leading `[` since our range includes both brackets `[[`
                  const cleanQuery = query.startsWith('[') ? query.slice(1) : query;
                  // Parse query to detect mode (object, heading, block)
                  const parsed = parseQueryWithAlias(cleanQuery);

                  // Heading mode: [[Object#query
                  if (parsed.mode === 'heading' && onHeadingSearchRef.current) {
                    // First find the object
                    const objects = await search(parsed.objectQuery);
                    const matchedObject = objects.find(
                      (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                    );
                    if (matchedObject) {
                      // Store matched object for command handler
                      setRefSuggestionState((prev) => ({
                        ...prev,
                        mode: 'heading',
                        // Store object in a way the command can access it
                      }));
                      const headings = await onHeadingSearchRef.current(
                        matchedObject.objectId,
                        parsed.subQuery
                      );
                      // Tag headings with the parent object for the command handler
                      return headings.map((h) => ({
                        ...h,
                        _parentObject: matchedObject,
                      })) as unknown as AnySuggestionItem[];
                    }
                  }

                  // Block mode: [[Object#^query
                  if (parsed.mode === 'block' && onBlockSearchRef.current) {
                    // First find the object
                    const objects = await search(parsed.objectQuery);
                    const matchedObject = objects.find(
                      (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                    );
                    if (matchedObject) {
                      setRefSuggestionState((prev) => ({
                        ...prev,
                        mode: 'block',
                      }));
                      const blocks = await onBlockSearchRef.current(
                        matchedObject.objectId,
                        parsed.subQuery
                      );
                      // Tag blocks with the parent object for the command handler
                      return blocks.map((b) => ({
                        ...b,
                        _parentObject: matchedObject,
                      })) as unknown as AnySuggestionItem[];
                    }
                  }

                  // Default: object mode
                  setRefSuggestionState((prev) => ({
                    ...prev,
                    mode: 'object',
                  }));
                  return search(parsed.objectQuery);
                },
                command: ({ editor: ed, range, props: item }) => {
                  // Get the full query text to check for alias
                  const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                  // Strip leading `[` since our range includes both brackets `[[`
                  const cleanQuery = fullQuery.startsWith('[') ? fullQuery.slice(1) : fullQuery;
                  const { alias } = parseQueryWithAlias(cleanQuery);

                  // Handle different item types
                  let attrs: Record<string, unknown>;

                  if (isRefItem(item)) {
                    // Object mode
                    attrs = {
                      objectId: item.objectId,
                      objectType: item.objectType,
                      displayTitle: item.title,
                      color: item.color,
                      alias,
                    };
                  } else if (isHeadingItem(item)) {
                    // Heading mode - get parent object from tagged item
                    const parentObject = (
                      item as HeadingSuggestionItem & { _parentObject?: RefSuggestionItem }
                    )._parentObject;
                    if (!parentObject) return;
                    attrs = {
                      objectId: parentObject.objectId,
                      objectType: parentObject.objectType,
                      displayTitle: parentObject.title,
                      color: parentObject.color,
                      alias,
                      headingText: item.text,
                    };
                  } else if (isBlockItem(item)) {
                    // Block mode - get parent object from tagged item
                    const parentObject = (
                      item as BlockSuggestionItem & { _parentObject?: RefSuggestionItem }
                    )._parentObject;
                    if (!parentObject) return;

                    // Determine block ID: use existing alias or generate new one
                    let blockId = item.alias;
                    if (!blockId) {
                      blockId = generateBlockId();
                      // Notify parent to insert BlockIdNode at source
                      if (onBlockIdInsertRef.current) {
                        onBlockIdInsertRef.current(parentObject.objectId, item.ksuid, blockId);
                      }
                    }

                    attrs = {
                      objectId: parentObject.objectId,
                      objectType: parentObject.objectType,
                      displayTitle: parentObject.title,
                      color: parentObject.color,
                      alias,
                      blockId,
                    };
                  } else {
                    return; // Unknown item type
                  }

                  // Delete entire range (includes both `[[`) and insert refNode
                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                      { type: 'refNode', attrs },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createRefSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(AtSuggestion, BracketSuggestion);
      }

      if (enableEmbeds) {
        const EmbedSuggestion = Extension.create({
          name: 'embedSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('embedSuggestion'),
                char: '[',
                allowSpaces: true,
                startOfLine: false,
                allow: ({ state, range }) => {
                  const queryLength = range.to - range.from;
                  if (queryLength < 1) return false;

                  try {
                    const charBefore = state.doc.textBetween(
                      range.from - 1,
                      range.from,
                      undefined,
                      '\ufffc'
                    );
                    const secondChar = state.doc.textBetween(
                      range.from + 1,
                      range.from + 2,
                      undefined,
                      '\ufffc'
                    );
                    return charBefore === '!' && secondChar === '[';
                  } catch {
                    return false;
                  }
                },
                items: async ({ query }) => {
                  const search = onRefSearchRef.current;
                  if (!search) return [];

                  const cleanQuery = query.startsWith('[') ? query.slice(1) : query;
                  const parsed = parseQueryWithAlias(cleanQuery);

                  if (parsed.mode === 'heading' && onHeadingSearchRef.current) {
                    const objects = await search(parsed.objectQuery);
                    const matchedObject = objects.find(
                      (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                    );
                    if (matchedObject) {
                      setEmbedSuggestionState((prev) => ({ ...prev, mode: 'heading' }));
                      const headings = await onHeadingSearchRef.current(
                        matchedObject.objectId,
                        parsed.subQuery
                      );
                      return headings.map((h) => ({
                        ...h,
                        _parentObject: matchedObject,
                      })) as unknown as AnySuggestionItem[];
                    }
                  }

                  if (parsed.mode === 'block' && onBlockSearchRef.current) {
                    const objects = await search(parsed.objectQuery);
                    const matchedObject = objects.find(
                      (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                    );
                    if (matchedObject) {
                      setEmbedSuggestionState((prev) => ({ ...prev, mode: 'block' }));
                      const blocks = await onBlockSearchRef.current(
                        matchedObject.objectId,
                        parsed.subQuery
                      );
                      return blocks.map((b) => ({
                        ...b,
                        _parentObject: matchedObject,
                      })) as unknown as AnySuggestionItem[];
                    }
                  }

                  setEmbedSuggestionState((prev) => ({ ...prev, mode: 'object' }));
                  return search(parsed.objectQuery);
                },
                command: ({ editor: ed, range, props: item }) => {
                  const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                  const cleanQuery = fullQuery.startsWith('[') ? fullQuery.slice(1) : fullQuery;
                  const { alias } = parseQueryWithAlias(cleanQuery);

                  let attrs: Record<string, unknown>;

                  if (isRefItem(item)) {
                    attrs = {
                      objectId: item.objectId,
                      objectType: item.objectType,
                      displayTitle: item.title,
                      alias,
                    };
                  } else if (isHeadingItem(item)) {
                    const parentObject = (
                      item as HeadingSuggestionItem & { _parentObject?: RefSuggestionItem }
                    )._parentObject;
                    if (!parentObject) return;
                    attrs = {
                      objectId: parentObject.objectId,
                      objectType: parentObject.objectType,
                      displayTitle: parentObject.title,
                      alias,
                      headingText: item.text,
                    };
                  } else if (isBlockItem(item)) {
                    const parentObject = (
                      item as BlockSuggestionItem & { _parentObject?: RefSuggestionItem }
                    )._parentObject;
                    if (!parentObject) return;

                    let blockId = item.alias;
                    if (!blockId) {
                      blockId = generateBlockId();
                      if (onBlockIdInsertRef.current) {
                        onBlockIdInsertRef.current(parentObject.objectId, item.ksuid, blockId);
                      }
                    }

                    attrs = {
                      objectId: parentObject.objectId,
                      objectType: parentObject.objectType,
                      displayTitle: parentObject.title,
                      alias,
                      blockId,
                    };
                  } else {
                    return;
                  }

                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([{ type: 'embedNode', attrs }, { type: 'paragraph' }])
                    .run();
                },
                render: createEmbedSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(EmbedSuggestion);
      }

      // Slash commands (when enabled and not readOnly)
      if (enableSlashCommands && !readOnly) {
        const SlashCommandExtension = Extension.create({
          name: 'slashCommand',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('slashCommand'),
                char: '/',
                allowSpaces: false,
                startOfLine: true,
                items: ({ query }) => {
                  // Return filtered items for the suggestion plugin
                  return filterSlashCommands(allSlashCommands, query);
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as SlashCommandItem;
                  typedItem.command(ed, range);
                },
                render: createSlashCommandRender,
              }),
            ];
          },
        });

        baseExtensions.push(SlashCommandExtension);
      }

      // Tags (when enabled)
      if (enableTags) {
        // Add TagNode
        baseExtensions.push(
          TagNode.configure({
            onTagClick,
          })
        );

        // Create suggestion extension for # trigger
        const HashtagSuggestion = Extension.create({
          name: 'hashtagSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('hashtagSuggestion'),
                char: '#',
                allowSpaces: false,
                startOfLine: false,
                items: async ({ query }) => {
                  const search = onTagSearchRef.current;
                  return search ? search(query) : [];
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as TagSuggestionItem;
                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                      {
                        type: 'tagNode',
                        attrs: {
                          tagId: typedItem.tagId,
                          displayName: typedItem.name,
                          color: typedItem.color,
                        },
                      },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createTagSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(HashtagSuggestion);
      }

      return baseExtensions;
    }, [
      placeholder,
      enableRefs,
      onRefClick,
      createRefSuggestionRender,
      handleRetryUpload,
      handleImageRemove,
      enableEmbeds,
      onEmbedResolve,
      onEmbedOpen,
      onEmbedSubscribe,
      createEmbedSuggestionRender,
      enableSlashCommands,
      readOnly,
      allSlashCommands,
      createSlashCommandRender,
      enableTags,
      onTagClick,
      createTagSuggestionRender,
    ]);

    // Track if cursor is in a table (for showing table toolbar)
    const [isInTable, setIsInTable] = React.useState(false);
    const [tableToolbarPosition, setTableToolbarPosition] = React.useState<{
      top: number;
      left: number;
    } | null>(null);

    const editor = useEditor({
      extensions,
      content: content ?? null,
      editable: !readOnly,
      autofocus: autoFocus,
      onUpdate: ({ editor: ed }) => {
        onChange?.(ed.getJSON());
        syncImageUploadIds(ed.state.doc);
      },
      onSelectionUpdate: ({ editor: ed }) => {
        // Check if cursor is in a table
        const inTable = ed.isActive('table');
        setIsInTable(inTable);

        if (inTable) {
          // Get position for toolbar (above the active cell)
          const { from } = ed.state.selection;
          const domAtPos = ed.view.domAtPos(from);
          const node = domAtPos.node as HTMLElement;

          // Find the closest table cell (td or th)
          const cell =
            node?.nodeType === Node.ELEMENT_NODE
              ? (node as HTMLElement).closest?.('td, th')
              : node?.parentElement?.closest?.('td, th');

          if (cell) {
            const cellRect = cell.getBoundingClientRect();
            setTableToolbarPosition({
              top: cellRect.top - 44, // 44px above cell (toolbar height + gap)
              left: cellRect.left,
            });
          } else {
            // Fallback to cursor position
            const coords = ed.view.coordsAtPos(from);
            setTableToolbarPosition({
              top: coords.top - 44,
              left: coords.left,
            });
          }
        } else {
          setTableToolbarPosition(null);
        }
      },
      editorProps: {
        attributes: {
          class: cn('outline-none', 'text-foreground'),
        },
        handlePaste: (_view, event) => {
          if (readOnly) return false;
          const files = Array.from(event.clipboardData?.files ?? []);
          if (files.length === 0) return false;
          const imageFiles = files.filter(isRasterImageFile);
          if (imageFiles.length === 0) return false;
          event.preventDefault();
          insertImageFiles(imageFiles);
          return true;
        },
        handleDrop: (view, event) => {
          if (readOnly) return false;
          const files = Array.from(event.dataTransfer?.files ?? []);
          if (files.length === 0) return false;
          const imageFiles = files.filter(isRasterImageFile);
          if (imageFiles.length === 0) return false;
          event.preventDefault();
          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          insertImageFiles(imageFiles, undefined, coords?.pos ?? null);
          return true;
        },
      },
    });

    React.useEffect(() => {
      editorRef.current = editor ?? null;
    }, [editor]);

    React.useEffect(() => {
      if (!editor) return;
      imageUploadIdsRef.current = collectImageUploadIds(editor.state.doc);
    }, [collectImageUploadIds, editor]);

    React.useEffect(() => {
      return () => {
        imageObjectUrlsRef.current.forEach((url) => {
          URL.revokeObjectURL(url);
        });
        imageObjectUrlsRef.current.clear();
      };
    }, []);

    // Expose imperative handle
    React.useImperativeHandle(
      ref,
      () => ({
        editor,
        focus: () => editor?.commands.focus(),
        clear: () => editor?.commands.clearContent(),
      }),
      [editor]
    );

    // Sync content when it changes externally (controlled mode)
    React.useEffect(() => {
      if (editor && content && !editor.isDestroyed) {
        const currentContent = editor.getJSON();
        if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
          editor.commands.setContent(content);
        }
      }
    }, [editor, content]);

    // Sync editable state
    React.useEffect(() => {
      if (editor && !editor.isDestroyed) {
        editor.setEditable(!readOnly);
      }
    }, [editor, readOnly]);

    // Handle clicks on empty space below content to focus at end
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || readOnly) return;
      if (e.target === e.currentTarget) {
        editor.commands.focus('end');
      }
    };

    // Handle ref suggestion item selection
    const handleRefSelect = React.useCallback(
      (item: AnySuggestionItem) => {
        if (refSuggestionState.command) {
          refSuggestionState.command(item);
        }
      },
      [refSuggestionState.command]
    );

    const handleEmbedSelect = React.useCallback(
      (item: AnySuggestionItem) => {
        if (embedSuggestionState.command) {
          embedSuggestionState.command(item);
        }
      },
      [embedSuggestionState.command]
    );

    const closeImageInsertPopover = React.useCallback(() => {
      setImageInsertState((prev) => ({
        ...prev,
        isOpen: false,
        position: null,
        insertPosition: null,
      }));
    }, []);

    const openImageInsertPopover = React.useCallback(
      (range: Range | null, fallbackPosition?: { top: number; left: number } | null) => {
        if (!editor || readOnly || !range) return;
        const coords = editor.view.coordsAtPos(range.from);
        const position = fallbackPosition ?? { top: coords.bottom + 4, left: coords.left };
        setImageInsertState({
          isOpen: true,
          mode: 'upload',
          position,
          insertPosition: range.from,
        });
      },
      [editor, readOnly]
    );

    // Handle create new from ref suggestion
    const handleRefCreate = React.useCallback(
      async (title: string) => {
        if (!onRefCreate || !editor) return;
        const newItem = await onRefCreate(title);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'refNode',
              attrs: {
                objectId: newItem.objectId,
                objectType: newItem.objectType,
                displayTitle: newItem.title,
                color: newItem.color,
              },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
        setRefSuggestionState((prev) => ({ ...prev, isOpen: false }));
      },
      [onRefCreate, editor]
    );

    // Handle slash command selection
    const handleSlashCommandSelect = React.useCallback(
      (item: SlashCommandItem) => {
        if (editor && slashCommandState.range) {
          if (item.id === 'image') {
            editor.chain().focus().deleteRange(slashCommandState.range).run();
            setSlashCommandState((prev) => ({ ...prev, isOpen: false }));
            openImageInsertPopover(slashCommandState.range, slashCommandState.position);
            return;
          }
          item.command(editor, slashCommandState.range);
          setSlashCommandState((prev) => ({ ...prev, isOpen: false }));
        }
      },
      [editor, openImageInsertPopover, slashCommandState.position, slashCommandState.range]
    );

    const handleImageInsertUpload = React.useCallback(
      (file: File, meta: { alt?: string | null; caption?: string | null }) => {
        insertImageFiles([file], meta, imageInsertState.insertPosition);
        closeImageInsertPopover();
      },
      [closeImageInsertPopover, imageInsertState.insertPosition, insertImageFiles]
    );

    const handleImageInsertUrl = React.useCallback(
      (url: string, meta: { alt?: string | null; caption?: string | null }) => {
        insertImageFromUrl(url, meta, imageInsertState.insertPosition);
        closeImageInsertPopover();
      },
      [closeImageInsertPopover, imageInsertState.insertPosition, insertImageFromUrl]
    );

    React.useEffect(() => {
      if (!imageInsertState.isOpen) return;
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeImageInsertPopover();
        }
      };
      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [closeImageInsertPopover, imageInsertState.isOpen]);

    React.useEffect(() => {
      if (readOnly && imageInsertState.isOpen) {
        closeImageInsertPopover();
      }
    }, [closeImageInsertPopover, imageInsertState.isOpen, readOnly]);

    // Handle tag suggestion item selection
    const handleTagSelect = React.useCallback(
      (item: TagSuggestionItem) => {
        if (tagSuggestionState.command) {
          tagSuggestionState.command(item);
        }
      },
      [tagSuggestionState.command]
    );

    // Handle create new from tag suggestion
    const handleTagCreate = React.useCallback(
      async (name: string) => {
        if (!onTagCreate || !editor) return;
        const newItem = await onTagCreate(name);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'tagNode',
              attrs: {
                tagId: newItem.tagId,
                displayName: newItem.name,
                color: newItem.color,
              },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
        setTagSuggestionState((prev) => ({ ...prev, isOpen: false }));
      },
      [onTagCreate, editor]
    );

    // Handle Enter key for slash commands (since TipTap suggestion handles navigation but not selection)
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (slashCommandState.isOpen && e.key === 'Enter') {
          e.preventDefault();
          const item = slashCommandState.filteredItems[slashCommandState.selectedIndex];
          if (item) {
            handleSlashCommandSelect(item);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [
      slashCommandState.isOpen,
      slashCommandState.filteredItems,
      slashCommandState.selectedIndex,
      handleSlashCommandSelect,
    ]);

    return (
      <div
        className={cn(
          'relative h-full min-h-[200px] w-full',
          'rounded-md border border-border bg-background',
          !readOnly && 'cursor-text',
          readOnly && 'cursor-not-allowed opacity-60',
          className
        )}
        onClick={handleContainerClick}
      >
        <EditorContent editor={editor} className="h-full w-full" />

        {/* Ref suggestion popup */}
        {refSuggestionState.isOpen &&
          refSuggestionState.position &&
          (() => {
            // Clean query (strip leading `[` for `[[` trigger)
            const cleanQuery = refSuggestionState.query.startsWith('[')
              ? refSuggestionState.query.slice(1)
              : refSuggestionState.query;

            // Detect alias mode (only in object mode)
            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            let aliasMode: AliasMode | null = null;

            if (alias !== null && refSuggestionState.mode === 'object') {
              // Find exact match for search term (case-insensitive)
              const matchedItem = refSuggestionState.items.find(
                (item) => isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
              );
              if (matchedItem && isRefItem(matchedItem)) {
                aliasMode = { targetItem: matchedItem, alias };
              }
            }

            return (
              <div
                className="fixed z-50"
                style={{
                  top: refSuggestionState.position.top,
                  left: refSuggestionState.position.left,
                }}
              >
                <RefSuggestionList
                  mode={refSuggestionState.mode}
                  items={refSuggestionState.items}
                  query={cleanQuery}
                  selectedIndex={refSuggestionState.selectedIndex}
                  onSelect={handleRefSelect}
                  onCreate={onRefCreate ? handleRefCreate : undefined}
                  aliasMode={aliasMode}
                />
              </div>
            );
          })()}

        {/* Embed suggestion popup */}
        {embedSuggestionState.isOpen &&
          embedSuggestionState.position &&
          (() => {
            const cleanQuery = embedSuggestionState.query.startsWith('[')
              ? embedSuggestionState.query.slice(1)
              : embedSuggestionState.query;

            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            let aliasMode: AliasMode | null = null;

            if (alias !== null && embedSuggestionState.mode === 'object') {
              const matchedItem = embedSuggestionState.items.find(
                (item) => isRefItem(item) && item.title.toLowerCase() === objectQuery.toLowerCase()
              );
              if (matchedItem && isRefItem(matchedItem)) {
                aliasMode = { targetItem: matchedItem, alias };
              }
            }

            return (
              <div
                className="fixed z-50"
                style={{
                  top: embedSuggestionState.position.top,
                  left: embedSuggestionState.position.left,
                }}
              >
                <RefSuggestionList
                  mode={embedSuggestionState.mode}
                  items={embedSuggestionState.items}
                  query={cleanQuery}
                  selectedIndex={embedSuggestionState.selectedIndex}
                  onSelect={handleEmbedSelect}
                  onCreate={undefined}
                  aliasMode={aliasMode}
                />
              </div>
            );
          })()}

        {/* Slash command popup */}
        {slashCommandState.isOpen && slashCommandState.position && (
          <div
            className="fixed z-50"
            style={{
              top: slashCommandState.position.top,
              left: slashCommandState.position.left,
            }}
          >
            <SlashCommandList
              items={slashCommandState.filteredItems}
              selectedIndex={slashCommandState.selectedIndex}
              onSelect={handleSlashCommandSelect}
            />
          </div>
        )}

        {/* Image insert popover */}
        {imageInsertState.isOpen && imageInsertState.position && (
          <div
            className="fixed z-50"
            style={{
              top: imageInsertState.position.top,
              left: imageInsertState.position.left,
            }}
          >
            <ImageInsertPopover
              mode={imageInsertState.mode}
              onModeChange={(mode) =>
                setImageInsertState((prev) => ({
                  ...prev,
                  mode,
                }))
              }
              onUploadFile={handleImageInsertUpload}
              onInsertUrl={handleImageInsertUrl}
              onClose={closeImageInsertPopover}
            />
          </div>
        )}

        {/* Tag suggestion popup */}
        {tagSuggestionState.isOpen && tagSuggestionState.position && (
          <div
            className="fixed z-50"
            style={{
              top: tagSuggestionState.position.top,
              left: tagSuggestionState.position.left,
            }}
          >
            <TagSuggestionList
              items={tagSuggestionState.items}
              query={tagSuggestionState.query}
              selectedIndex={tagSuggestionState.selectedIndex}
              onSelect={handleTagSelect}
              onCreate={onTagCreate ? handleTagCreate : undefined}
            />
          </div>
        )}

        {/* Table toolbar */}
        {editor && isInTable && tableToolbarPosition && !readOnly && (
          <div
            className="fixed z-50"
            style={{
              top: tableToolbarPosition.top,
              left: tableToolbarPosition.left,
            }}
          >
            <TableToolbar editor={editor} />
          </div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export { Editor };
