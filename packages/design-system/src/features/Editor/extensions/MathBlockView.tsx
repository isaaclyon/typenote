/**
 * MathBlockView Component
 *
 * React component for rendering MathBlock in the editor.
 * Shows editable LaTeX input with live KaTeX preview below.
 */

import * as React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { MathOperations } from '@phosphor-icons/react/dist/ssr/MathOperations';
import 'katex/dist/katex.min.css';

import { renderMath } from './katex-utils.js';

export function MathBlockView({ node }: NodeViewProps) {
  // MathBlock uses the node's text content as the LaTeX source.
  // The user types directly in the block via NodeViewContent.
  // The `latex` attribute is only for serialization/initial content.
  const textContent = node.textContent;

  // Render the math preview from text content
  const { html, error } = renderMath(textContent, true);

  return (
    <NodeViewWrapper className="math-block">
      {/* Header */}
      <div className="math-block-header" contentEditable={false}>
        <MathOperations className="h-4 w-4" weight="regular" />
        <span className="math-block-label">Math</span>
      </div>

      {/* Editable LaTeX input */}
      <div className="math-block-input">
        <NodeViewContent className="math-block-code" />
      </div>

      {/* Live preview */}
      <div
        className={`math-block-preview ${error ? 'math-block-error' : ''}`}
        contentEditable={false}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </NodeViewWrapper>
  );
}
