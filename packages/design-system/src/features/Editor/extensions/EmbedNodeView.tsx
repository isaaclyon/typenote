/**
 * EmbedNodeView Component
 *
 * Renders a read-only embedded preview with a title bar and actions.
 */

import * as React from 'react';
import { NodeViewWrapper, EditorContent, useEditor } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUp } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr/ArrowSquareOut';

import { cn } from '../../../lib/utils.js';
import type { EmbedNodeAttributes } from './EmbedNode.js';
import { buildEmbedSyntax, formatEmbedDisplayTitle, suppressNestedEmbeds } from './embed-utils.js';
import { CodeBlock } from './CodeBlock.js';
import { Callout } from './Callout.js';
import { TableExtensions } from './Table.js';
import { ResizableImage } from './ResizableImage.js';
import { InlineMath } from './InlineMath.js';
import { MathBlock } from './MathBlock.js';
import { BlockIdNode } from './BlockIdNode.js';
import { RefNode } from './RefNode.js';
import { TagNode } from './TagNode.js';

// ============================================================================
// Types
// ============================================================================

interface EmbedNodeViewOptions {
  onResolve: ((target: EmbedNodeAttributes) => Promise<JSONContent>) | null;
  onOpen: ((target: EmbedNodeAttributes) => void) | null;
  onSubscribe:
    | ((target: EmbedNodeAttributes, onUpdate: (content: JSONContent) => void) => () => void)
    | null;
  maxDepth: number;
  embedDepth: number;
}

// ============================================================================
// Helpers
// ============================================================================

const EMPTY_DOC: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [] }],
};

function buildPreviewExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: false,
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
    HighlightExtension,
    ResizableImage,
    TaskList,
    TaskItem.configure({ nested: true }),
    CodeBlock,
    Callout,
    ...TableExtensions,
    InlineMath,
    MathBlock,
    BlockIdNode,
    RefNode.configure({ onRefClick: undefined }),
    TagNode.configure({ onTagClick: undefined }),
  ];
}

// ============================================================================
// Component
// ============================================================================

export function EmbedNodeView({ node, extension }: NodeViewProps) {
  const attrs = node.attrs as EmbedNodeAttributes;
  const options = extension.options as EmbedNodeViewOptions;

  const target = React.useMemo<EmbedNodeAttributes>(
    () => ({
      objectId: attrs.objectId,
      objectType: attrs.objectType,
      displayTitle: attrs.displayTitle,
      alias: attrs.alias ?? null,
      headingText: attrs.headingText ?? null,
      blockId: attrs.blockId ?? null,
    }),
    [
      attrs.objectId,
      attrs.objectType,
      attrs.displayTitle,
      attrs.alias,
      attrs.headingText,
      attrs.blockId,
    ]
  );

  const isSuppressed = options.embedDepth >= options.maxDepth;

  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error' | 'suppressed'>(
    isSuppressed ? 'suppressed' : 'loading'
  );
  const [resolvedContent, setResolvedContent] = React.useState<JSONContent | null>(null);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const previewExtensions = React.useMemo(() => buildPreviewExtensions(), []);

  const previewEditor = useEditor(
    {
      extensions: previewExtensions,
      content: EMPTY_DOC,
      editable: false,
      editorProps: {
        attributes: {
          class: 'embed-preview ProseMirror',
        },
      },
    },
    []
  );

  React.useEffect(() => {
    if (!previewEditor) return;
    const nextContent = resolvedContent ?? EMPTY_DOC;
    previewEditor.commands.setContent(nextContent, false);
  }, [previewEditor, resolvedContent]);

  React.useEffect(() => {
    let cancelled = false;

    if (isSuppressed) {
      setStatus('suppressed');
      setResolvedContent(null);
      return undefined;
    }

    if (!options.onResolve) {
      setStatus('error');
      setResolvedContent(null);
      return undefined;
    }

    setStatus('loading');
    options
      .onResolve(target)
      .then((content) => {
        if (cancelled) return;
        setResolvedContent(suppressNestedEmbeds(content));
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setResolvedContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuppressed, options.onResolve, target]);

  React.useEffect(() => {
    if (isSuppressed) return undefined;
    if (!options.onSubscribe) return undefined;

    const unsubscribe = options.onSubscribe(target, (content) => {
      setResolvedContent(suppressNestedEmbeds(content));
      setStatus('ready');
    });

    return () => {
      unsubscribe();
    };
  }, [isSuppressed, options.onSubscribe, target]);

  const displayTitle = formatEmbedDisplayTitle(target);
  const rawSyntax = buildEmbedSyntax(target);

  const handleOpen = () => {
    if (options.onOpen) {
      options.onOpen(target);
    }
  };

  return (
    <NodeViewWrapper className="embed-node block my-3">
      <div
        className={cn(
          'embed-node-card rounded-lg border border-border bg-muted/20',
          'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'embed-node-header flex items-center justify-between gap-3',
            'px-3 py-2 border-b border-border bg-background/80'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {attrs.objectType || 'Object'}
            </span>
            <span className="text-sm font-medium text-foreground truncate">{displayTitle}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-1 text-xs',
                'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {isExpanded ? <CaretUp className="h-3 w-3" /> : <CaretDown className="h-3 w-3" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
            <button
              type="button"
              onClick={handleOpen}
              className={cn(
                'inline-flex items-center gap-1 rounded px-2 py-1 text-xs',
                'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <ArrowSquareOut className="h-3 w-3" />
              Open
            </button>
          </div>
        </div>

        <div
          className={cn(
            'embed-node-body relative',
            'px-3 py-3',
            !isExpanded && 'max-h-[220px] overflow-hidden'
          )}
        >
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-11/12 rounded bg-muted" />
              <div className="h-3 w-10/12 rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>
          )}

          {status === 'suppressed' && (
            <div className="rounded-md border border-dashed border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              Nested embed hidden. {rawSyntax}
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Unable to load embed. <span className="font-mono">{rawSyntax}</span>
            </div>
          )}

          {status === 'ready' && previewEditor && <EditorContent editor={previewEditor} />}

          {!isExpanded && status === 'ready' && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent" />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}

EmbedNodeView.displayName = 'EmbedNodeView';
