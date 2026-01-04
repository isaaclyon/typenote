/**
 * Content extraction utilities for references and FTS.
 *
 * Extracts reference targets (for backlinks) and plain text (for FTS)
 * from block content based on the NotateDoc v1 schema.
 */

import type { RefTarget, BlockType } from '@typenote/api';

/**
 * Inline node shape (minimal typing for extraction).
 */
interface InlineNode {
  t: string;
  text?: string;
  value?: string;
  alias?: string;
  target?: RefTarget;
  children?: InlineNode[];
}

/**
 * Content with inline nodes.
 */
interface InlineContent {
  inline?: InlineNode[];
}

/**
 * Table content shape.
 */
interface TableContent {
  rows?: Array<{
    cells?: InlineNode[][];
  }>;
}

/**
 * Code block content shape.
 */
interface CodeBlockContent {
  code?: string;
}

/**
 * Callout content shape.
 */
interface CalloutContent {
  title?: string;
}

/**
 * Walk inline nodes and collect reference targets.
 */
function walkInlineForRefs(nodes: InlineNode[]): RefTarget[] {
  const refs: RefTarget[] = [];

  for (const node of nodes) {
    if (node.t === 'ref' && node.target) {
      refs.push(node.target);
    }

    // Recursively walk link children
    if (node.t === 'link' && node.children) {
      refs.push(...walkInlineForRefs(node.children));
    }
  }

  return refs;
}

/**
 * Walk inline nodes and collect plain text.
 */
function walkInlineForText(nodes: InlineNode[]): string[] {
  const parts: string[] = [];

  for (const node of nodes) {
    switch (node.t) {
      case 'text':
        if (node.text) {
          parts.push(node.text);
        }
        break;

      case 'tag':
        if (node.value) {
          parts.push(node.value);
        }
        break;

      case 'ref':
        if (node.alias) {
          parts.push(node.alias);
        }
        break;

      case 'link':
        if (node.children) {
          parts.push(...walkInlineForText(node.children));
        }
        break;

      // Skip: hard_break, math_inline, footnote_ref
    }
  }

  return parts;
}

/**
 * Extract reference targets from block content.
 *
 * @param blockType - Type of the block
 * @param content - Block content (shape varies by type)
 * @returns Array of reference targets found in content
 */
export function extractReferences(blockType: BlockType, content: unknown): RefTarget[] {
  const refs: RefTarget[] = [];

  // Handle blocks with inline content
  if (hasInlineContent(blockType)) {
    const inlineContent = content as InlineContent;
    if (inlineContent.inline) {
      refs.push(...walkInlineForRefs(inlineContent.inline));
    }
  }

  // Handle table cells
  if (blockType === 'table') {
    const tableContent = content as TableContent;
    if (tableContent.rows) {
      for (const row of tableContent.rows) {
        if (row.cells) {
          for (const cell of row.cells) {
            refs.push(...walkInlineForRefs(cell));
          }
        }
      }
    }
  }

  return refs;
}

/**
 * Extract plain text from block content for FTS indexing.
 *
 * @param blockType - Type of the block
 * @param content - Block content (shape varies by type)
 * @returns Plain text extracted from content
 */
export function extractPlainText(blockType: BlockType, content: unknown): string {
  const parts: string[] = [];

  // Handle blocks with inline content
  if (hasInlineContent(blockType)) {
    const inlineContent = content as InlineContent;
    if (inlineContent.inline) {
      parts.push(...walkInlineForText(inlineContent.inline));
    }
  }

  // Handle code blocks
  if (blockType === 'code_block') {
    const codeContent = content as CodeBlockContent;
    if (codeContent.code) {
      parts.push(codeContent.code);
    }
  }

  // Handle callout title
  if (blockType === 'callout') {
    const calloutContent = content as CalloutContent;
    if (calloutContent.title) {
      parts.push(calloutContent.title);
    }
  }

  // Handle table cells
  if (blockType === 'table') {
    const tableContent = content as TableContent;
    if (tableContent.rows) {
      for (const row of tableContent.rows) {
        if (row.cells) {
          for (const cell of row.cells) {
            parts.push(...walkInlineForText(cell));
          }
        }
      }
    }
  }

  // Note: math_block content is NOT indexed per spec (avoid coupling)

  // Join parts, collapsing multiple spaces into one
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Check if a block type has inline content.
 */
function hasInlineContent(blockType: BlockType): boolean {
  return (
    blockType === 'paragraph' ||
    blockType === 'heading' ||
    blockType === 'list_item' ||
    blockType === 'footnote_def'
  );
}
