/**
 * TipTap to NotateDoc Converter
 *
 * Transforms TipTap's ProseMirror JSON back to our NotateDoc format (for storage).
 * This is the inverse of notateToTiptap.ts.
 */

import type { JSONContent } from '@tiptap/react';
import type { BlockOp, BlockType, DocumentBlock, InlineNode, Mark, RefTarget } from '@typenote/api';
import { generateId } from '@typenote/core';

import { TIPTAP_TO_NOTATE } from './markMapping.js';

/**
 * Extracts link mark from TipTap marks array, returning the href and remaining marks.
 */
function extractLinkMark(marks: Array<{ type: string; attrs?: { href?: string } }> | undefined): {
  href: string | null;
  otherMarks: Array<{ type: string }>;
} {
  if (!marks || marks.length === 0) {
    return { href: null, otherMarks: [] };
  }

  let href: string | null = null;
  const otherMarks: Array<{ type: string }> = [];

  for (const mark of marks) {
    if (mark.type === 'link' && mark.attrs?.href) {
      href = mark.attrs.href;
    } else {
      otherMarks.push(mark);
    }
  }

  return { href, otherMarks };
}

/**
 * Converts TipTap marks to NotateDoc marks array (excluding link marks).
 */
function convertMarks(marks: Array<{ type: string }> | undefined): Mark[] | undefined {
  if (!marks || marks.length === 0) return undefined;
  const result: Mark[] = [];
  for (const mark of marks) {
    const mapped = TIPTAP_TO_NOTATE[mark.type];
    if (mapped) {
      result.push(mapped);
    }
  }
  return result.length > 0 ? result : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Node Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a single TipTap node to a NotateDoc inline node (without link handling).
 * Used internally to build children for link nodes.
 */
function convertSingleNode(
  node: JSONContent,
  marksOverride?: Array<{ type: string }>
): InlineNode | null {
  const marks = marksOverride ?? (node.marks as Array<{ type: string }> | undefined);

  switch (node.type) {
    case 'text': {
      const textNode: InlineNode = {
        t: 'text',
        text: node.text ?? '',
      };
      const convertedMarks = convertMarks(marks);
      if (convertedMarks) {
        textNode.marks = convertedMarks;
      }
      return textNode;
    }

    case 'hardBreak': {
      return { t: 'hard_break' };
    }

    case 'ref': {
      const attrs = node.attrs as {
        mode: 'link' | 'embed';
        target: RefTarget;
        alias?: string;
      };
      const refNode: InlineNode = {
        t: 'ref',
        mode: attrs.mode,
        target: attrs.target,
      };
      if (attrs.alias !== undefined) {
        refNode.alias = attrs.alias;
      }
      return refNode;
    }

    case 'tag': {
      const attrs = node.attrs as { value: string };
      return {
        t: 'tag',
        value: attrs.value,
      };
    }

    case 'mathInline': {
      const attrs = node.attrs as { latex: string };
      return {
        t: 'math_inline',
        latex: attrs.latex,
      };
    }

    default:
      return null;
  }
}

/**
 * Converts an array of TipTap JSONContent nodes to NotateDoc inline nodes.
 * Handles link marks by converting them to link container nodes.
 */
export function convertInlineToNotate(nodes: JSONContent[]): InlineNode[] {
  const result: InlineNode[] = [];
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i];
    if (node === undefined) {
      i++;
      continue;
    }

    // Check if this node has a link mark
    const { href } = extractLinkMark(
      node.marks as Array<{ type: string; attrs?: { href?: string } }> | undefined
    );

    if (href !== null) {
      // Collect all consecutive nodes with the same link href
      // Link children are non-link inline nodes (links cannot be nested)
      const linkChildren: Array<Exclude<InlineNode, { t: 'link' }>> = [];

      while (i < nodes.length) {
        const currentNode = nodes[i];
        if (currentNode === undefined) break;

        const { href: currentHref, otherMarks: currentOtherMarks } = extractLinkMark(
          currentNode.marks as Array<{ type: string; attrs?: { href?: string } }> | undefined
        );

        if (currentHref !== href) break;

        // Convert the node without the link mark
        const child = convertSingleNode(currentNode, currentOtherMarks);
        if (child !== null && child.t !== 'link') {
          linkChildren.push(child);
        }
        i++;
      }

      // Create the link node wrapping all children
      const linkNode: InlineNode = {
        t: 'link',
        href,
        children: linkChildren,
      };
      result.push(linkNode);
    } else {
      // No link mark, convert normally
      const converted = convertSingleNode(node);
      if (converted !== null) {
        result.push(converted);
      }
      i++;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Represents a converted block from TipTap to NotateDoc format.
 */
export interface ConvertedBlock {
  blockType: BlockType;
  content: unknown;
  children?: ConvertedBlock[];
}

/**
 * Converts a TipTap block node to NotateDoc block format.
 */
export function convertBlockToNotate(node: JSONContent): ConvertedBlock {
  switch (node.type) {
    case 'paragraph': {
      const content = node.content ?? [];
      return {
        blockType: 'paragraph',
        content: { inline: convertInlineToNotate(content) },
      };
    }
    case 'heading': {
      const content = node.content ?? [];
      const attrs = node.attrs as { level: number } | undefined;
      return {
        blockType: 'heading',
        content: { level: attrs?.level ?? 1, inline: convertInlineToNotate(content) },
      };
    }
    case 'codeBlock': {
      const content = node.content ?? [];
      const attrs = node.attrs as { language?: string | null } | undefined;
      // Extract text from content nodes and join into single code string
      const code = content.map((n) => (n.type === 'text' ? (n.text ?? '') : '')).join('');
      // Convert null language to undefined (TipTap uses null, NotateDoc uses undefined)
      const language = attrs?.language ?? undefined;
      const codeContent: { code: string; language?: string } = { code };
      if (language) {
        codeContent.language = language;
      }
      return {
        blockType: 'code_block',
        content: codeContent,
      };
    }
    case 'bulletList': {
      const items = node.content ?? [];
      return {
        blockType: 'list',
        content: { kind: 'bullet' },
        children: items.map((item) => convertBlockToNotate(item)),
      };
    }
    case 'orderedList': {
      const items = node.content ?? [];
      const attrs = node.attrs as { start?: number } | undefined;
      return {
        blockType: 'list',
        content: { kind: 'ordered', start: attrs?.start },
        children: items.map((item) => convertBlockToNotate(item)),
      };
    }
    case 'taskList': {
      const items = node.content ?? [];
      return {
        blockType: 'list',
        content: { kind: 'task' },
        children: items.map((item) => convertBlockToNotate(item)),
      };
    }
    case 'listItem': {
      const content = node.content ?? [];
      // First paragraph provides inline content
      const firstParagraph = content[0];
      const paragraphContent =
        firstParagraph?.type === 'paragraph' ? (firstParagraph.content ?? []) : [];
      // Additional blocks (beyond first paragraph) become children
      const additionalBlocks = content.slice(1);
      const result: ConvertedBlock = {
        blockType: 'list_item',
        content: { inline: convertInlineToNotate(paragraphContent) },
      };
      if (additionalBlocks.length > 0) {
        result.children = additionalBlocks.map((child) => convertBlockToNotate(child));
      }
      return result;
    }
    case 'taskItem': {
      const content = node.content ?? [];
      const attrs = node.attrs as { checked?: boolean } | undefined;
      // First paragraph provides inline content
      const firstParagraph = content[0];
      const paragraphContent =
        firstParagraph?.type === 'paragraph' ? (firstParagraph.content ?? []) : [];
      // Additional blocks (beyond first paragraph) become children
      const additionalBlocks = content.slice(1);
      const result: ConvertedBlock = {
        blockType: 'list_item',
        content: { inline: convertInlineToNotate(paragraphContent), checked: attrs?.checked },
      };
      if (additionalBlocks.length > 0) {
        result.children = additionalBlocks.map((child) => convertBlockToNotate(child));
      }
      return result;
    }
    case 'blockquote': {
      const content = node.content ?? [];
      return {
        blockType: 'blockquote',
        content: {},
        children: content.map((child) => convertBlockToNotate(child)),
      };
    }
    case 'horizontalRule': {
      return {
        blockType: 'thematic_break',
        content: {},
      };
    }
    default:
      throw new Error(`Unsupported block type: ${node.type}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Ops Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Flattens a DocumentBlock tree to an array of blocks (top-level only for now).
 */
function flattenOldBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
  // For MVP, we only handle top-level blocks (position-based)
  return blocks;
}

/**
 * Compares content using JSON.stringify for deep equality.
 */
function contentEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Creates insert ops for a ConvertedBlock and all its children recursively.
 */
function createInsertOpsForBlock(
  block: ConvertedBlock,
  parentBlockId: string | null,
  ops: BlockOp[]
): string {
  const blockId = generateId();

  ops.push({
    op: 'block.insert',
    blockId,
    parentBlockId,
    blockType: block.blockType,
    content: block.content,
    place: { where: 'end' },
  });

  // Recursively insert children
  if (block.children) {
    for (const child of block.children) {
      createInsertOpsForBlock(child, blockId, ops);
    }
  }

  return blockId;
}

/**
 * Generates BlockOps by comparing old saved blocks with new TipTap editor state.
 * Uses position-based diffing for simplicity.
 */
export function generateBlockOps(
  oldBlocks: DocumentBlock[],
  newTiptap: JSONContent,
  _objectId: string
): BlockOp[] {
  const ops: BlockOp[] = [];

  // Convert TipTap doc content to ConvertedBlocks
  const newTiptapBlocks = newTiptap.content ?? [];
  const newBlocks = newTiptapBlocks.map((node) => convertBlockToNotate(node));

  // Flatten old blocks for position-based comparison
  const flatOld = flattenOldBlocks(oldBlocks);

  // Compare by position
  const maxLen = Math.max(flatOld.length, newBlocks.length);

  for (let i = 0; i < maxLen; i++) {
    const oldBlock = flatOld[i];
    const newBlock = newBlocks[i];

    if (oldBlock !== undefined && newBlock !== undefined) {
      // Both exist at this position - check for update
      // If block types differ, we need to delete + insert (block type changes not allowed in v1)
      if (oldBlock.blockType !== newBlock.blockType) {
        // Delete old block
        ops.push({
          op: 'block.delete',
          blockId: oldBlock.id,
        });
        // Insert new block with potentially different type
        createInsertOpsForBlock(newBlock, null, ops);
      } else if (!contentEquals(oldBlock.content, newBlock.content)) {
        // Same type, different content - update
        ops.push({
          op: 'block.update',
          blockId: oldBlock.id,
          patch: { content: newBlock.content },
        });
      }
    } else if (oldBlock === undefined && newBlock !== undefined) {
      // New block added - insert with children
      createInsertOpsForBlock(newBlock, null, ops);
    } else if (oldBlock !== undefined && newBlock === undefined) {
      // Block removed - delete
      ops.push({
        op: 'block.delete',
        blockId: oldBlock.id,
      });
    }
  }

  return ops;
}
