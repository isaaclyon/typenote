import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor as TiptapEditor } from '@tiptap/core';

import type { JSONContent } from '@tiptap/core';
import { cn } from '../../lib/utils.js';
import type { EditorProps, EditorRef } from './types.js';
import { RefSuggestionList } from './extensions/RefSuggestionList.js';
import type { AliasMode } from './extensions/RefSuggestionList.js';
import type { AnySuggestionItem } from './extensions/RefSuggestion.js';
import { parseQueryWithAlias, isRefItem } from './extensions/RefSuggestion.js';
import type { SlashCommandItem } from './extensions/SlashCommand.js';
import { SlashCommandList } from './extensions/SlashCommandList.js';
import { TagSuggestionList } from './extensions/TagSuggestionList.js';
import type { TagSuggestionItem } from './extensions/TagSuggestionList.js';
import { TableToolbar } from './extensions/TableToolbar.js';
import { ImageInsertPopover } from './extensions/ImageInsertPopover.js';
import { isRasterImageFile } from './extensions/image-utils.js';
import { slashCommandIcons } from './extensions/slash-icons.js';
import type { EmbedNodeAttributes } from './extensions/EmbedNode.types.js';

// Hooks
import {
  useCallbackRef,
  useImageUpload,
  useRefSuggestion,
  useSlashCommand,
  useTagSuggestion,
  useEditorExtensions,
} from './hooks/index.js';

// Editor typography styles
import './editor.css';

// ============================================================================
// Editor Component
// ============================================================================

/**
 * Block-based rich text editor built on TipTap/ProseMirror.
 *
 * Features:
 * - Paragraphs and headings (h1-h6)
 * - Basic marks: bold, italic, code, strikethrough
 * - Keyboard shortcuts and markdown input rules
 * - RefNode: Inline object references with @mention and [[wiki-link]] syntax
 * - Embeds: Block-level object embeds with ![[...]] syntax
 * - Slash commands for quick formatting
 * - Tags with # trigger
 * - Tables, code blocks with syntax highlighting, callouts, math
 * - Footnotes and block IDs
 * - Image support with upload, resize, and drag/drop
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
      // Slash Commands
      enableSlashCommands = true,
      // Refs
      enableRefs = false,
      onRefSearch,
      onRefClick,
      onRefCreate,
      // Heading & Block references
      onHeadingSearch,
      onBlockSearch,
      onBlockIdInsert,
      // Embeds
      enableEmbeds = true,
      onEmbedResolve,
      onEmbedOpen,
      onEmbedSubscribe,
      // Images
      onImageUpload,
      onImageRemove,
      // Tags
      enableTags = false,
      onTagSearch,
      onTagCreate,
      onTagClick,
    },
    ref
  ) => {
    const editorRef = React.useRef<TiptapEditor | null>(null);

    // -------------------------------------------------------------------------
    // Callback refs (stable references for extension callbacks)
    // -------------------------------------------------------------------------
    const onRefSearchRef = useCallbackRef(onRefSearch);
    const onHeadingSearchRef = useCallbackRef(onHeadingSearch);
    const onBlockSearchRef = useCallbackRef(onBlockSearch);
    const onBlockIdInsertRef = useCallbackRef(onBlockIdInsert);
    const onTagSearchRef = useCallbackRef(onTagSearch);

    // -------------------------------------------------------------------------
    // Image upload hook
    // -------------------------------------------------------------------------
    const {
      insertImageFiles,
      insertImageFromUrl,
      handleRetryUpload,
      handleImageRemove,
      syncImageUploadIds,
      cleanup: cleanupImages,
    } = useImageUpload({
      editorRef,
      readOnly,
      onImageUpload,
      onImageRemove,
    });

    // -------------------------------------------------------------------------
    // Suggestion hooks
    // -------------------------------------------------------------------------
    const refSuggestion = useRefSuggestion('[[');
    const embedSuggestion = useRefSuggestion('![[');
    const slashCommand = useSlashCommand<SlashCommandItem>();
    const tagSuggestion = useTagSuggestion<TagSuggestionItem>();

    // -------------------------------------------------------------------------
    // Table toolbar state
    // -------------------------------------------------------------------------
    const [isInTable, setIsInTable] = React.useState(false);
    const [tableToolbarPosition, setTableToolbarPosition] = React.useState<{
      top: number;
      left: number;
    } | null>(null);

    const [imageInsertState, setImageInsertState] = React.useState<{
      isOpen: boolean;
      mode: 'upload' | 'url';
      position: { top: number; left: number } | null;
      insertPos: number | null;
    }>({
      isOpen: false,
      mode: 'upload',
      position: null,
      insertPos: null,
    });

    // -------------------------------------------------------------------------
    // Wrap callbacks for extension compatibility
    // Provide fallbacks for optional callbacks to satisfy extension requirements
    // -------------------------------------------------------------------------
    const wrappedOnEmbedResolve = React.useCallback(
      async (target: EmbedNodeAttributes): Promise<JSONContent> => {
        if (!onEmbedResolve) return { type: 'doc', content: [] };
        return onEmbedResolve(target);
      },
      [onEmbedResolve]
    );

    const wrappedOnEmbedSubscribe = React.useCallback(
      (target: EmbedNodeAttributes, onUpdate: (content: JSONContent) => void) => {
        if (!onEmbedSubscribe) return () => {};
        return onEmbedSubscribe(target, onUpdate);
      },
      [onEmbedSubscribe]
    );

    // -------------------------------------------------------------------------
    // Build extensions
    // -------------------------------------------------------------------------
    const extensions = useEditorExtensions({
      placeholder,
      readOnly,
      enableRefs,
      enableEmbeds,
      enableTags,
      enableSlashCommands,
      onRefSearchRef,
      onRefClick,
      onHeadingSearchRef,
      onBlockSearchRef,
      onBlockIdInsertRef,
      onTagSearchRef,
      onTagClick,
      onEmbedResolve: wrappedOnEmbedResolve,
      onEmbedOpen,
      onEmbedSubscribe: wrappedOnEmbedSubscribe,
      handleRetryUpload,
      handleImageRemove,
      createRefSuggestionRender: refSuggestion.createRender,
      createEmbedSuggestionRender: embedSuggestion.createRender,
      createSlashCommandRender: slashCommand.createRender,
      createTagSuggestionRender: tagSuggestion.createRender,
      setRefSuggestionMode: (mode) => refSuggestion.setState((prev) => ({ ...prev, mode })),
      setEmbedSuggestionMode: (mode) => embedSuggestion.setState((prev) => ({ ...prev, mode })),
      slashCommandIcons,
    });

    // -------------------------------------------------------------------------
    // Create editor instance
    // -------------------------------------------------------------------------
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
        // Check if cursor is in a table for toolbar
        const inTable = ed.isActive('table');
        setIsInTable(inTable);

        if (inTable) {
          const { from } = ed.state.selection;
          const domAtPos = ed.view.domAtPos(from);
          const node = domAtPos.node as HTMLElement;
          const cell =
            node?.nodeType === Node.ELEMENT_NODE
              ? (node as HTMLElement).closest?.('td, th')
              : node?.parentElement?.closest?.('td, th');

          if (cell) {
            const cellRect = cell.getBoundingClientRect();
            setTableToolbarPosition({
              top: cellRect.top - 44,
              left: cellRect.left,
            });
          } else {
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

    // -------------------------------------------------------------------------
    // Lifecycle effects
    // -------------------------------------------------------------------------
    React.useEffect(() => {
      editorRef.current = editor ?? null;
    }, [editor]);

    React.useEffect(() => {
      return cleanupImages;
    }, [cleanupImages]);

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

    // -------------------------------------------------------------------------
    // Event handlers
    // -------------------------------------------------------------------------
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || readOnly) return;
      if (e.target === e.currentTarget) {
        editor.commands.focus('end');
      }
    };

    const handleRefSelect = React.useCallback(
      (item: AnySuggestionItem) => {
        if (refSuggestion.state.command) {
          refSuggestion.state.command(item);
        }
      },
      [refSuggestion.state.command]
    );

    const handleEmbedSelect = React.useCallback(
      (item: AnySuggestionItem) => {
        if (embedSuggestion.state.command) {
          embedSuggestion.state.command(item);
        }
      },
      [embedSuggestion.state.command]
    );

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
        refSuggestion.setState((prev) => ({ ...prev, isOpen: false }));
      },
      [onRefCreate, editor, refSuggestion]
    );

    const handleSlashCommandSelect = React.useCallback(
      (item: SlashCommandItem) => {
        if (editor && slashCommand.state.range) {
          if (item.id === 'image') {
            if (readOnly) return;
            const { from, to } = slashCommand.state.range;
            editor.chain().focus().deleteRange({ from, to }).run();
            const fallback = editor.view.coordsAtPos(from);
            const position = slashCommand.state.position ?? {
              top: fallback.bottom + 4,
              left: fallback.left,
            };
            setImageInsertState({
              isOpen: true,
              mode: 'upload',
              position,
              insertPos: from,
            });
            slashCommand.setState((prev) => ({ ...prev, isOpen: false }));
            return;
          }

          item.command(editor, slashCommand.state.range);
          slashCommand.setState((prev) => ({ ...prev, isOpen: false }));
        }
      },
      [editor, readOnly, slashCommand]
    );

    const handleTagSelect = React.useCallback(
      (item: TagSuggestionItem) => {
        if (tagSuggestion.state.command) {
          tagSuggestion.state.command(item);
        }
      },
      [tagSuggestion.state.command]
    );

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
        tagSuggestion.setState((prev) => ({ ...prev, isOpen: false }));
      },
      [onTagCreate, editor, tagSuggestion]
    );

    const handleImageInsertModeChange = React.useCallback((mode: 'upload' | 'url') => {
      setImageInsertState((prev) => ({ ...prev, mode }));
    }, []);

    const handleImageInsertClose = React.useCallback(() => {
      setImageInsertState((prev) => ({
        ...prev,
        isOpen: false,
        position: null,
        insertPos: null,
      }));
    }, []);

    const handleImageInsertUpload = React.useCallback(
      (file: File, meta: { alt?: string | null; caption?: string | null }) => {
        insertImageFiles([file], meta, imageInsertState.insertPos);
        handleImageInsertClose();
      },
      [handleImageInsertClose, imageInsertState.insertPos, insertImageFiles]
    );

    const handleImageInsertUrl = React.useCallback(
      (url: string, meta: { alt?: string | null; caption?: string | null }) => {
        insertImageFromUrl(url, meta, imageInsertState.insertPos);
        handleImageInsertClose();
      },
      [handleImageInsertClose, imageInsertState.insertPos, insertImageFromUrl]
    );

    // Handle Enter key for slash commands
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (slashCommand.state.isOpen && e.key === 'Enter') {
          e.preventDefault();
          const item = slashCommand.state.filteredItems[slashCommand.state.selectedIndex];
          if (item) {
            handleSlashCommandSelect(item);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [slashCommand.state, handleSlashCommandSelect]);

    React.useEffect(() => {
      if (readOnly && imageInsertState.isOpen) {
        handleImageInsertClose();
      }
    }, [handleImageInsertClose, imageInsertState.isOpen, readOnly]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
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
        {refSuggestion.state.isOpen &&
          refSuggestion.state.position &&
          (() => {
            const cleanQuery = refSuggestion.state.query.startsWith('[')
              ? refSuggestion.state.query.slice(1)
              : refSuggestion.state.query;
            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            let aliasMode: AliasMode | null = null;

            if (alias !== null && refSuggestion.state.mode === 'object') {
              const matchedItem = refSuggestion.state.items.find(
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
                  top: refSuggestion.state.position.top,
                  left: refSuggestion.state.position.left,
                }}
              >
                <RefSuggestionList
                  mode={refSuggestion.state.mode}
                  items={refSuggestion.state.items}
                  query={cleanQuery}
                  selectedIndex={refSuggestion.state.selectedIndex}
                  onSelect={handleRefSelect}
                  onCreate={onRefCreate ? handleRefCreate : undefined}
                  aliasMode={aliasMode}
                />
              </div>
            );
          })()}

        {/* Embed suggestion popup */}
        {embedSuggestion.state.isOpen &&
          embedSuggestion.state.position &&
          (() => {
            const cleanQuery = embedSuggestion.state.query.startsWith('[')
              ? embedSuggestion.state.query.slice(1)
              : embedSuggestion.state.query;
            const { objectQuery, alias } = parseQueryWithAlias(cleanQuery);
            let aliasMode: AliasMode | null = null;

            if (alias !== null && embedSuggestion.state.mode === 'object') {
              const matchedItem = embedSuggestion.state.items.find(
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
                  top: embedSuggestion.state.position.top,
                  left: embedSuggestion.state.position.left,
                }}
              >
                <RefSuggestionList
                  mode={embedSuggestion.state.mode}
                  items={embedSuggestion.state.items}
                  query={cleanQuery}
                  selectedIndex={embedSuggestion.state.selectedIndex}
                  onSelect={handleEmbedSelect}
                  onCreate={undefined}
                  aliasMode={aliasMode}
                />
              </div>
            );
          })()}

        {/* Slash command popup */}
        {slashCommand.state.isOpen && slashCommand.state.position && (
          <div
            className="fixed z-50"
            style={{
              top: slashCommand.state.position.top,
              left: slashCommand.state.position.left,
            }}
          >
            <SlashCommandList
              items={slashCommand.state.filteredItems}
              selectedIndex={slashCommand.state.selectedIndex}
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
              onModeChange={handleImageInsertModeChange}
              onUploadFile={handleImageInsertUpload}
              onInsertUrl={handleImageInsertUrl}
              onClose={handleImageInsertClose}
            />
          </div>
        )}

        {/* Tag suggestion popup */}
        {tagSuggestion.state.isOpen && tagSuggestion.state.position && (
          <div
            className="fixed z-50"
            style={{
              top: tagSuggestion.state.position.top,
              left: tagSuggestion.state.position.left,
            }}
          >
            <TagSuggestionList
              items={tagSuggestion.state.items}
              query={tagSuggestion.state.query}
              selectedIndex={tagSuggestion.state.selectedIndex}
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
