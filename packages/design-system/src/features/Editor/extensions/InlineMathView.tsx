/**
 * InlineMathView Component
 *
 * React component for rendering InlineMath in the editor.
 * Obsidian-style WYSIWYG: focused = raw LaTeX input, blurred = rendered math.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import 'katex/dist/katex.min.css';

import { Input } from '../../../primitives/index.js';
import { renderMath } from './katex-utils.js';

export function InlineMathView({ node, updateAttributes, selected }: NodeViewProps) {
  const { latex } = node.attrs as { latex: string };

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(latex);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const blurTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up blur timer on unmount
  React.useEffect(() => {
    return () => {
      if (blurTimerRef.current !== null) {
        clearTimeout(blurTimerRef.current);
      }
    };
  }, []);

  // Sync editValue when latex changes externally
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(latex);
    }
  }, [latex, isEditing]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Enter edit mode when node is selected
  React.useEffect(() => {
    if (selected && !isEditing) {
      setIsEditing(true);
    }
  }, [selected, isEditing]);

  const handleSave = React.useCallback(() => {
    updateAttributes({ latex: editValue });
    setIsEditing(false);
  }, [updateAttributes, editValue]);

  const handleCancel = () => {
    setEditValue(latex);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow click events to process
    // Clear any existing timer first
    if (blurTimerRef.current !== null) {
      clearTimeout(blurTimerRef.current);
    }
    blurTimerRef.current = setTimeout(() => {
      blurTimerRef.current = null;
      handleSave();
    }, 100);
  };

  // Editing mode: show input
  if (isEditing) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <span className="inline-math inline-math-editing">
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="LaTeX formula"
            size="sm"
            className="inline-math-input h-5 min-w-[80px] max-w-[300px] px-1 py-0 text-sm font-mono"
          />
        </span>
      </NodeViewWrapper>
    );
  }

  // Display mode: render math
  const { html, error } = renderMath(latex, false);

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={`inline-math inline-math-rendered cursor-pointer ${error ? 'inline-math-error' : ''}`}
        onClick={() => setIsEditing(true)}
        title={error ?? latex}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </NodeViewWrapper>
  );
}
