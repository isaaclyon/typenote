/**
 * TipTap JSONContent to NotateDoc Converter
 *
 * Converts TipTap's JSONContent format (used by the design-system Editor)
 * to TypeNote's canonical NotateDoc format for storage.
 *
 * @module tiptapToNotateDoc
 */

import type {
  InlineNode,
  Mark,
  ParagraphContent,
  HeadingContent,
  ListContent,
  ListItemContent,
  BlockquoteContent,
  CalloutContent,
  CodeBlockContent,
  ThematicBreakContent,
  TableContent,
  MathBlockContent,
  FootnoteDefContent,
} from '@typenote/api';

/**
 * TipTap JSONContent type (minimal shape we need).
 * We define this here to avoid depending on @tiptap/core in packages/core.
 */
export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: Array<{ type: string }>;
  text?: string;
  textContent?: string;
}

// ============================================================================
// Type Guards and Helpers
// ============================================================================

function isTiptapTextNode(node: JSONContent): boolean {
  return node.type === 'text' && typeof node.text === 'string';
}

function hasMarks(node: JSONContent): node is JSONContent & { marks: Array<{ type: string }> } {
  return Array.isArray(node.marks) && node.marks.length > 0;
}

/**
 * Safely get a string attribute value.
 */
function getStringAttr(node: JSONContent, key: string, defaultValue = ''): string {
  if (!node.attrs) return defaultValue;
  const value = node.attrs[key];
  return typeof value === 'string' ? value : defaultValue;
}

/**
 * Safely get a number attribute value.
 */
function getNumberAttr(node: JSONContent, key: string): number | undefined {
  if (!node.attrs) return undefined;
  const value = node.attrs[key];
  return typeof value === 'number' ? value : undefined;
}

/**
 * Safely get a boolean attribute value.
 */
function getBooleanAttr(node: JSONContent, key: string): boolean | undefined {
  if (!node.attrs) return undefined;
  const value = node.attrs[key];
  return typeof value === 'boolean' ? value : undefined;
}

// ============================================================================
// Mark Conversion
// ============================================================================

const TIPTAP_TO_NOTATE_MARKS: Record<string, Mark> = {
  bold: 'strong',
  italic: 'em',
  code: 'code',
  strike: 'strike',
  highlight: 'highlight',
};

/**
 * Convert TipTap marks to NotateDoc marks.
 */
function convertMarks(tiptapMarks: Array<{ type: string }>): Mark[] {
  const marks: Mark[] = [];
  for (const mark of tiptapMarks) {
    const notateMark = TIPTAP_TO_NOTATE_MARKS[mark.type];
    if (notateMark) {
      marks.push(notateMark);
    }
  }
  return marks;
}

// ============================================================================
// Inline Node Conversion
// ============================================================================

/**
 * Convert TipTap inline content to NotateDoc InlineNode array (non-link nodes only).
 * Used for link children where nested links are not allowed.
 */
function convertNonLinkInlineNodes(
  tiptapContent: JSONContent[] | undefined
): Array<Exclude<InlineNode, { t: 'link' }>> {
  if (!tiptapContent) {
    return [];
  }

  const result: Array<Exclude<InlineNode, { t: 'link' }>> = [];

  for (const node of tiptapContent) {
    // Text node
    if (isTiptapTextNode(node) && node.text !== undefined) {
      const marks = hasMarks(node) ? convertMarks(node.marks) : undefined;
      result.push({
        t: 'text',
        text: node.text,
        ...(marks && marks.length > 0 ? { marks } : {}),
      });
      continue;
    }

    // Hard break
    if (node.type === 'hardBreak') {
      result.push({ t: 'hard_break' });
      continue;
    }

    // RefNode
    if (node.type === 'refNode') {
      const mode = getStringAttr(node, 'mode') === 'embed' ? ('embed' as const) : ('link' as const);
      const targetKind = getStringAttr(node, 'targetKind', 'object');
      const objectId = getStringAttr(node, 'objectId');
      const blockId = getStringAttr(node, 'blockId');
      const alias = getStringAttr(node, 'alias');

      const target =
        targetKind === 'block' && blockId
          ? { kind: 'block' as const, objectId, blockId }
          : { kind: 'object' as const, objectId };

      result.push({
        t: 'ref',
        mode,
        target,
        ...(alias ? { alias } : {}),
      });
      continue;
    }

    // TagNode
    if (node.type === 'tagNode') {
      const value = getStringAttr(node, 'value');
      result.push({
        t: 'tag',
        value,
      });
      continue;
    }

    // InlineMath
    if (node.type === 'inlineMath') {
      const latex = getStringAttr(node, 'latex');
      result.push({
        t: 'math_inline',
        latex,
      });
      continue;
    }

    // FootnoteRef
    if (node.type === 'footnoteRef') {
      const key = getStringAttr(node, 'key');
      result.push({
        t: 'footnote_ref',
        key,
      });
      continue;
    }

    // Skip link nodes in non-link contexts
    if (node.type === 'link') {
      continue;
    }

    // BlockIdNode (ignored in inline conversion - it's a special node)
    if (node.type === 'blockIdNode') {
      // Block IDs are metadata, not inline content
      continue;
    }
  }

  return result;
}

/**
 * Convert TipTap inline content to NotateDoc InlineNode array.
 */
function convertInlineNodes(tiptapContent: JSONContent[] | undefined): InlineNode[] {
  if (!tiptapContent) {
    return [];
  }

  const result: InlineNode[] = [];

  for (const node of tiptapContent) {
    // Text node
    if (isTiptapTextNode(node) && node.text !== undefined) {
      const marks = hasMarks(node) ? convertMarks(node.marks) : undefined;
      result.push({
        t: 'text',
        text: node.text,
        ...(marks && marks.length > 0 ? { marks } : {}),
      });
      continue;
    }

    // Hard break
    if (node.type === 'hardBreak') {
      result.push({ t: 'hard_break' });
      continue;
    }

    // Link
    if (node.type === 'link') {
      const href = getStringAttr(node, 'href');
      const children = convertNonLinkInlineNodes(node.content);
      result.push({
        t: 'link',
        href,
        children,
      });
      continue;
    }

    // RefNode
    if (node.type === 'refNode') {
      const mode = getStringAttr(node, 'mode') === 'embed' ? ('embed' as const) : ('link' as const);
      const targetKind = getStringAttr(node, 'targetKind', 'object');
      const objectId = getStringAttr(node, 'objectId');
      const blockId = getStringAttr(node, 'blockId');
      const alias = getStringAttr(node, 'alias');

      const target =
        targetKind === 'block' && blockId
          ? { kind: 'block' as const, objectId, blockId }
          : { kind: 'object' as const, objectId };

      result.push({
        t: 'ref',
        mode,
        target,
        ...(alias ? { alias } : {}),
      });
      continue;
    }

    // TagNode
    if (node.type === 'tagNode') {
      const value = getStringAttr(node, 'value');
      result.push({
        t: 'tag',
        value,
      });
      continue;
    }

    // InlineMath
    if (node.type === 'inlineMath') {
      const latex = getStringAttr(node, 'latex');
      result.push({
        t: 'math_inline',
        latex,
      });
      continue;
    }

    // FootnoteRef
    if (node.type === 'footnoteRef') {
      const key = getStringAttr(node, 'key');
      result.push({
        t: 'footnote_ref',
        key,
      });
      continue;
    }

    // BlockIdNode (ignored in inline conversion - it's a special node)
    if (node.type === 'blockIdNode') {
      // Block IDs are metadata, not inline content
      continue;
    }
  }

  return result;
}

// ============================================================================
// Block Content Conversion
// ============================================================================

/**
 * Convert a TipTap paragraph to NotateDoc ParagraphContent.
 */
function convertParagraph(node: JSONContent): ParagraphContent {
  return {
    inline: convertInlineNodes(node.content),
  };
}

/**
 * Convert a TipTap heading to NotateDoc HeadingContent.
 */
function convertHeading(node: JSONContent): HeadingContent {
  const level = getNumberAttr(node, 'level') || 1;
  return {
    level: level as 1 | 2 | 3 | 4 | 5 | 6,
    inline: convertInlineNodes(node.content),
  };
}

/**
 * Convert a TipTap bulletList/orderedList/taskList to NotateDoc ListContent.
 */
function convertList(node: JSONContent): ListContent {
  let kind: 'bullet' | 'ordered' | 'task' = 'bullet';
  if (node.type === 'orderedList') {
    kind = 'ordered';
  } else if (node.type === 'taskList') {
    kind = 'task';
  }

  const start = getNumberAttr(node, 'start');
  const tight = getBooleanAttr(node, 'tight');

  return {
    kind,
    ...(start !== undefined ? { start } : {}),
    ...(tight !== undefined ? { tight } : {}),
  };
}

/**
 * Convert a TipTap listItem/taskItem to NotateDoc ListItemContent.
 */
function convertListItem(node: JSONContent): ListItemContent {
  const checked = getBooleanAttr(node, 'checked');

  // Extract inline content from first paragraph if present
  let inline: InlineNode[] = [];
  if (node.content && node.content.length > 0) {
    const firstChild = node.content[0];
    if (firstChild?.type === 'paragraph') {
      inline = convertInlineNodes(firstChild.content);
    }
  }

  return {
    inline,
    ...(checked !== undefined ? { checked } : {}),
  };
}

/**
 * Convert a TipTap blockquote to NotateDoc BlockquoteContent.
 */
function convertBlockquote(_node: JSONContent): BlockquoteContent {
  return {};
}

/**
 * Convert a TipTap callout to NotateDoc CalloutContent.
 */
function convertCallout(node: JSONContent): CalloutContent {
  const kind = getStringAttr(node, 'kind', 'NOTE');
  const title = getStringAttr(node, 'title');
  const collapsed = getBooleanAttr(node, 'collapsed');

  return {
    kind,
    ...(title ? { title } : {}),
    ...(collapsed !== undefined ? { collapsed } : {}),
  };
}

/**
 * Convert a TipTap codeBlock to NotateDoc CodeBlockContent.
 */
function convertCodeBlock(node: JSONContent): CodeBlockContent {
  const language = getStringAttr(node, 'language');
  const code = node.textContent || '';

  return {
    ...(language ? { language } : {}),
    code,
  };
}

/**
 * Convert a TipTap horizontalRule to NotateDoc ThematicBreakContent.
 */
function convertThematicBreak(_node: JSONContent): ThematicBreakContent {
  return {};
}

/**
 * Convert a TipTap table to NotateDoc TableContent.
 *
 * Note: TipTap table cells contain paragraphs, but NotateDoc cells contain inline nodes directly.
 * We extract the inline content from the first paragraph in each cell.
 */
function convertTable(node: JSONContent): TableContent {
  const align = node.attrs?.['align'];
  const alignArray = Array.isArray(align) ? align : undefined;
  const rows: Array<{ cells: InlineNode[][] }> = [];

  if (node.content) {
    for (const row of node.content) {
      if (row.type === 'tableRow') {
        const cells: InlineNode[][] = [];
        if (row.content) {
          for (const cell of row.content) {
            if (cell.type === 'tableCell' || cell.type === 'tableHeader') {
              // Extract inline content from paragraphs within the cell
              let cellInline: InlineNode[] = [];
              if (cell.content && cell.content.length > 0) {
                for (const cellBlock of cell.content) {
                  if (cellBlock.type === 'paragraph') {
                    // Append inline content from this paragraph
                    cellInline = cellInline.concat(convertInlineNodes(cellBlock.content));
                  }
                }
              }
              cells.push(cellInline);
            }
          }
        }
        rows.push({ cells });
      }
    }
  }

  return {
    ...(alignArray ? { align: alignArray } : {}),
    rows,
  };
}

/**
 * Convert a TipTap mathBlock to NotateDoc MathBlockContent.
 */
function convertMathBlock(node: JSONContent): MathBlockContent {
  const latex = getStringAttr(node, 'latex');
  return { latex };
}

/**
 * Convert a TipTap footnoteDef to NotateDoc FootnoteDefContent.
 */
function convertFootnoteDef(node: JSONContent): FootnoteDefContent {
  const key = getStringAttr(node, 'key');
  const inline = node.content ? convertInlineNodes(node.content) : undefined;

  return {
    key,
    ...(inline && inline.length > 0 ? { inline } : {}),
  };
}

// ============================================================================
// Block Conversion Result
// ============================================================================

/**
 * Result of converting a single TipTap block.
 */
export interface ConvertedBlock {
  blockType: string;
  content: unknown;
  children?: ConvertedBlock[];
}

/**
 * Convert a single TipTap JSONContent node to NotateDoc block format.
 */
export function convertTiptapBlock(node: JSONContent): ConvertedBlock | null {
  if (!node.type) {
    return null;
  }

  switch (node.type) {
    case 'paragraph':
      return {
        blockType: 'paragraph',
        content: convertParagraph(node),
      };

    case 'heading':
      return {
        blockType: 'heading',
        content: convertHeading(node),
      };

    case 'bulletList':
    case 'orderedList':
    case 'taskList': {
      const children: ConvertedBlock[] = [];
      if (node.content) {
        for (const child of node.content) {
          const converted = convertTiptapBlock(child);
          if (converted) {
            children.push(converted);
          }
        }
      }
      return {
        blockType: 'list',
        content: convertList(node),
        children,
      };
    }

    case 'listItem':
    case 'taskItem': {
      // Extract nested blocks
      // If first child is a paragraph, it contains the inline content (skip it)
      // Otherwise, include all children (edge case: list item starts with nested list)
      const children: ConvertedBlock[] = [];
      if (node.content) {
        const startIndex = node.content[0]?.type === 'paragraph' ? 1 : 0;
        for (let i = startIndex; i < node.content.length; i++) {
          const child = node.content[i];
          if (child) {
            const converted = convertTiptapBlock(child);
            if (converted) {
              children.push(converted);
            }
          }
        }
      }
      return {
        blockType: 'list_item',
        content: convertListItem(node),
        ...(children.length > 0 ? { children } : {}),
      };
    }

    case 'blockquote': {
      const children: ConvertedBlock[] = [];
      if (node.content) {
        for (const child of node.content) {
          const converted = convertTiptapBlock(child);
          if (converted) {
            children.push(converted);
          }
        }
      }
      return {
        blockType: 'blockquote',
        content: convertBlockquote(node),
        children,
      };
    }

    case 'callout': {
      const children: ConvertedBlock[] = [];
      if (node.content) {
        for (const child of node.content) {
          const converted = convertTiptapBlock(child);
          if (converted) {
            children.push(converted);
          }
        }
      }
      return {
        blockType: 'callout',
        content: convertCallout(node),
        children,
      };
    }

    case 'codeBlock':
      return {
        blockType: 'code_block',
        content: convertCodeBlock(node),
      };

    case 'horizontalRule':
      return {
        blockType: 'thematic_break',
        content: convertThematicBreak(node),
      };

    case 'table':
      return {
        blockType: 'table',
        content: convertTable(node),
      };

    case 'mathBlock':
      return {
        blockType: 'math_block',
        content: convertMathBlock(node),
      };

    case 'footnoteDef':
      return {
        blockType: 'footnote_def',
        content: convertFootnoteDef(node),
      };

    // EmbedNode is a block-level node in TipTap
    case 'embedNode': {
      const objectId = getStringAttr(node, 'objectId');
      const alias = getStringAttr(node, 'alias');
      // Embeds in TipTap are represented as RefNodes in NotateDoc inline content
      // We convert it to a paragraph with an embed ref
      return {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'embed' as const,
              target: {
                kind: 'object' as const,
                objectId,
              },
              ...(alias ? { alias } : {}),
            },
          ],
        } as ParagraphContent,
      };
    }

    // Image nodes - convert to attachment blocks (Note: attachment is in NotateDoc schema)
    case 'resizableImage':
      // Images are handled separately via attachment blocks
      // For now, skip or convert to a placeholder
      return null;

    // Skip unsupported or meta nodes
    case 'doc':
    case 'footnoteSeparator':
    case 'blockIdNode':
      return null;

    default:
      // Unknown block type - skip
      return null;
  }
}

/**
 * Convert TipTap JSONContent document to an array of NotateDoc blocks.
 */
export function convertTiptapToNotateDoc(tiptapDoc: JSONContent): ConvertedBlock[] {
  if (!tiptapDoc.content) {
    return [];
  }

  const blocks: ConvertedBlock[] = [];
  for (const node of tiptapDoc.content) {
    const converted = convertTiptapBlock(node);
    if (converted) {
      blocks.push(converted);
    }
  }

  return blocks;
}
