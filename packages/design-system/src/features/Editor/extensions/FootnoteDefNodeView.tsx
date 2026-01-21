/**
 * FootnoteDefNodeView Component
 *
 * Renders footnote definitions with a fixed prefix and editable key.
 */

import * as React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils.js';
import { Input } from '../../../primitives/index.js';
import { isValidFootnoteKey } from './footnote-utils.js';

export function FootnoteDefNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const { key } = node.attrs as { key: string };

  const [isEditing, setIsEditing] = React.useState(false);
  const [draftKey, setDraftKey] = React.useState(key);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setDraftKey(key);
  }, [key]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  let duplicateCount = 0;
  if (editor) {
    editor.state.doc.descendants((child) => {
      if (child.type.name === 'footnoteDef' && child.attrs['key'] === key) {
        duplicateCount += 1;
      }
      return true;
    });
  }

  const isDuplicate = duplicateCount > 1;

  const handleSave = () => {
    const trimmed = draftKey.trim();
    if (!trimmed || !isValidFootnoteKey(trimmed)) {
      setDraftKey(key);
      setIsEditing(false);
      return;
    }
    updateAttributes({ key: trimmed });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftKey(key);
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="footnote-def block my-2">
      <div
        className={cn(
          'flex items-start gap-2 rounded-md border border-border bg-background/60 px-2 py-1.5',
          isDuplicate && 'border-amber-300 bg-amber-50'
        )}
      >
        <div className="shrink-0" contentEditable={false}>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  handleCancel();
                }
              }}
              size="sm"
              className="h-6 w-[120px] font-mono text-xs"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={cn(
                'font-mono text-xs text-muted-foreground',
                'px-1 py-0.5 rounded hover:bg-muted',
                isDuplicate && 'text-amber-700'
              )}
            >
              [^{key}]:
            </button>
          )}
        </div>
        <NodeViewContent className="flex-1 text-sm" />
      </div>
      {isDuplicate && (
        <div className="mt-1 text-xs text-amber-700">Duplicate footnote definition.</div>
      )}
    </NodeViewWrapper>
  );
}

FootnoteDefNodeView.displayName = 'FootnoteDefNodeView';
