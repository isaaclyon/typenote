import { useParams } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { Editor } from '@typenote/design-system';
import type { JSONContent } from '@tiptap/core';
import { useDocument, useDocumentMutation } from '../hooks/index.js';

/** Empty document structure for Editor initialization */
const EMPTY_DOC: JSONContent = { type: 'doc', content: [] };

/**
 * Notes view - displays document editor or empty state.
 * Route: /#/notes and /#/notes/:objectId
 */
export function NotesView() {
  const { objectId } = useParams<{ objectId: string }>();

  // Fetch document (only when objectId exists)
  const { content, docVersion, isLoading, error, refetch } = useDocument(objectId ?? '');

  // Save mutations with autosave
  const { autosave, isSaving, error: saveError } = useDocumentMutation();

  // Keep ref to latest docVersion to avoid stale closure in onChange callback
  const docVersionRef = useRef<number | undefined>(docVersion);
  useEffect(() => {
    docVersionRef.current = docVersion;
  }, [docVersion]);

  // Empty state (no object selected)
  if (!objectId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <File className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p className="text-sm">Select a document from the sidebar</p>
          <p className="text-xs mt-1">or create a new one with ⌘N</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading document...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-destructive">Failed to load document</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-xs text-accent-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Document loaded - render editor
  // Use EMPTY_DOC fallback for documents with no blocks
  const editorContent = content ?? EMPTY_DOC;

  return (
    <div className="flex h-full flex-col">
      {/* Editor container */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-3xl">
          <Editor
            content={editorContent}
            onChange={(newContent) => {
              // Use ref to get current docVersion (avoids stale closure)
              const currentDocVersion = docVersionRef.current;
              if (currentDocVersion !== undefined) {
                autosave({
                  objectId,
                  content: newContent,
                  docVersion: currentDocVersion,
                });
              }
            }}
            placeholder="Start writing..."
            autoFocus
            enableSlashCommands
            enableRefs={false} // Phase 2: Wire refs/embeds later
            enableEmbeds={false}
            enableTags={false}
          />
        </div>
      </div>

      {/* Status bar */}
      {(isSaving || saveError) && (
        <div className="border-t border-border px-4 py-1.5 text-xs">
          {isSaving && <span className="text-muted-foreground">Saving...</span>}
          {saveError && <span className="text-destructive">Save failed: {saveError}</span>}
        </div>
      )}
    </div>
  );
}
