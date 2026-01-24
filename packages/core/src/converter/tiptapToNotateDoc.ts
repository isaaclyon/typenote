/**
 * Convert TipTap JSONContent to NotateDoc format.
 *
 * TipTap stores editor-specific UI data (displayTitle, color, objectType),
 * while NotateDoc is a minimal, editor-agnostic persistence format.
 */

import type {
  InlineNode,
  Mark,
  BlockType,
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
  RefTarget,
} from '@typenote/api';
import type { TiptapNode, TiptapMark, TiptapDoc } from './types.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mark Conversion
// ─────────────────────────────────────────────────────────────────────────────

const TIPTAP_TO_NOTATE_MARK: Record<string, Mark> = {
  bold: 'strong',
  italic: 'em',
  code: 'code',
  strike: 'strike',
  highlight: 'highlight',
};

function convertMarks(marks?: TiptapMark[]): Mark[] | undefined {
  if (!marks || marks.length === 0) return undefined;
  const converted: Mark[] = [];
  for (const mark of marks) {
    const noteMark = TIPTAP_TO_NOTATE_MARK[mark.type];
    if (noteMark) {
      converted.push(noteMark);
    }
    // Skip unknown marks (link is handled at node level)
  }
  return converted.length > 0 ? converted : undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Node Conversion
// ─────────────────────────────────────────────────────────────────────────────

function convertInlineNode(node: TiptapNode): InlineNode | null {
  switch (node.type) {
    case 'text': {
      if (!node.text) return null;
      // Check if this text node is wrapped in a link mark
      const linkMark = node.marks?.find((m) => m.type === 'link');
      if (linkMark && typeof linkMark.attrs?.['href'] === 'string') {
        // Text inside a link - handled by parent link conversion
        return {
          t: 'text',
          text: node.text,
          marks: convertMarks(node.marks?.filter((m) => m.type !== 'link')),
        };
      }
      return {
        t: 'text',
        text: node.text,
        marks: convertMarks(node.marks),
      };
    }

    case 'hardBreak':
      return { t: 'hard_break' };

    case 'refNode': {
      const attrs = node.attrs ?? {};
      const objectId = attrs['objectId'] as string | undefined;
      if (!objectId) return null;

      const blockId = attrs['blockId'] as string | undefined;
      const alias = attrs['alias'] as string | undefined;

      const target: RefTarget = blockId
        ? { kind: 'block', objectId, blockId }
        : { kind: 'object', objectId };

      return {
        t: 'ref',
        mode: 'link',
        target,
        ...(alias ? { alias } : {}),
      };
    }

    case 'embedNode': {
      const attrs = node.attrs ?? {};
      const objectId = attrs['objectId'] as string | undefined;
      if (!objectId) return null;

      const blockId = attrs['blockId'] as string | undefined;
      const alias = attrs['alias'] as string | undefined;

      const target: RefTarget = blockId
        ? { kind: 'block', objectId, blockId }
        : { kind: 'object', objectId };

      return {
        t: 'ref',
        mode: 'embed',
        target,
        ...(alias ? { alias } : {}),
      };
    }

    case 'tagNode': {
      const value = node.attrs?.['value'] as string | undefined;
      if (!value) return null;
      return { t: 'tag', value };
    }

    case 'inlineMath': {
      const latex = node.attrs?.['latex'] as string | undefined;
      if (latex === undefined) return null;
      return { t: 'math_inline', latex };
    }

    case 'footnoteRef': {
      const key = node.attrs?.['key'] as string | undefined;
      if (!key) return null;
      return { t: 'footnote_ref', key };
    }

    default:
      // Unknown inline node type
      return null;
  }
}

/**
 * Convert TipTap inline content to NotateDoc inline nodes.
 * Handles link marks specially by extracting them to link nodes.
 */
function convertInlineContent(content?: TiptapNode[]): InlineNode[] {
  if (!content) return [];

  const result: InlineNode[] = [];
  let i = 0;

  while (i < content.length) {
    const node = content[i];
    if (!node) {
      i++;
      continue;
    }

    // Check if this text node starts a link span
    if (node.type === 'text' && node.marks?.some((m) => m.type === 'link')) {
      const linkMark = node.marks.find((m) => m.type === 'link');
      const href = linkMark?.attrs?.['href'] as string | undefined;

      // Collect all consecutive text nodes with the same link href
      const linkChildren: InlineNode[] = [];
      while (i < content.length) {
        const current = content[i];
        if (!current) break;
        const currentLinkMark = current.marks?.find((m) => m.type === 'link');
        if (currentLinkMark?.attrs?.['href'] !== href) break;

        const converted = convertInlineNode(current);
        if (converted) {
          linkChildren.push(converted);
        }
        i++;
      }

      if (href && linkChildren.length > 0) {
        // Filter out link nodes from children (links can't nest)
        const filteredChildren = linkChildren.filter((c) => c.t !== 'link');
        result.push({
          t: 'link',
          href,
          children: filteredChildren,
        });
      }
      continue;
    }

    const converted = convertInlineNode(node);
    if (converted) {
      result.push(converted);
    }
    i++;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Conversion Results
// ─────────────────────────────────────────────────────────────────────────────

export interface ConvertedBlock {
  type: BlockType;
  content: unknown;
  children?: ConvertedBlock[];
  /** Block ID preserved from original document (undefined for new blocks) */
  blockId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Conversion
// ─────────────────────────────────────────────────────────────────────────────

function convertBlock(node: TiptapNode): ConvertedBlock | null {
  const attrs = node.attrs ?? {};
  // Extract blockId if present (preserved from original document)
  const blockId = attrs['blockId'] as string | undefined;
  // Helper to include blockId in result
  const withId = <T extends ConvertedBlock>(result: T): T =>
    blockId ? { ...result, blockId } : result;

  switch (node.type) {
    case 'paragraph': {
      const content: ParagraphContent = {
        inline: convertInlineContent(node.content),
      };
      return withId({ type: 'paragraph', content });
    }

    case 'heading': {
      const level = (attrs['level'] as 1 | 2 | 3 | 4 | 5 | 6 | undefined) ?? 1;
      const content: HeadingContent = {
        level,
        inline: convertInlineContent(node.content),
      };
      return withId({ type: 'heading', content });
    }

    case 'bulletList': {
      const content: ListContent = {
        kind: 'bullet',
        tight: attrs['tight'] as boolean | undefined,
      };
      const children = convertBlocks(node.content);
      return withId({ type: 'list', content, children });
    }

    case 'orderedList': {
      const content: ListContent = {
        kind: 'ordered',
        start: attrs['start'] as number | undefined,
        tight: attrs['tight'] as boolean | undefined,
      };
      const children = convertBlocks(node.content);
      return withId({ type: 'list', content, children });
    }

    case 'taskList': {
      const content: ListContent = {
        kind: 'task',
        tight: attrs['tight'] as boolean | undefined,
      };
      const children = convertBlocks(node.content);
      return withId({ type: 'list', content, children });
    }

    case 'listItem': {
      // List items can contain paragraph or other blocks
      // Extract inline content from first paragraph child
      const firstParagraph = node.content?.find((c) => c.type === 'paragraph');
      const content: ListItemContent = {
        inline: firstParagraph ? convertInlineContent(firstParagraph.content) : [],
      };
      // Non-paragraph children become nested blocks
      const nestedContent = node.content?.filter((c) => c.type !== 'paragraph');
      const children = nestedContent ? convertBlocks(nestedContent) : undefined;
      return withId({
        type: 'list_item',
        content,
        ...(children && children.length > 0 ? { children } : {}),
      });
    }

    case 'taskItem': {
      const firstParagraph = node.content?.find((c) => c.type === 'paragraph');
      const content: ListItemContent = {
        inline: firstParagraph ? convertInlineContent(firstParagraph.content) : [],
        checked: attrs['checked'] as boolean | undefined,
      };
      const nestedContent = node.content?.filter((c) => c.type !== 'paragraph');
      const children = nestedContent ? convertBlocks(nestedContent) : undefined;
      return withId({
        type: 'list_item',
        content,
        ...(children && children.length > 0 ? { children } : {}),
      });
    }

    case 'blockquote': {
      const content: BlockquoteContent = {};
      const children = convertBlocks(node.content);
      return withId({ type: 'blockquote', content, children });
    }

    case 'callout': {
      const content: CalloutContent = {
        kind: (attrs['kind'] as string | undefined) ?? 'info',
        title: attrs['title'] as string | undefined,
        collapsed: attrs['collapsed'] as boolean | undefined,
      };
      const children = convertBlocks(node.content);
      return withId({ type: 'callout', content, children });
    }

    case 'codeBlock': {
      // TipTap stores code as text nodes inside the codeBlock
      const codeText = node.content?.map((c) => c.text ?? '').join('') ?? '';
      const content: CodeBlockContent = {
        language: attrs['language'] as string | undefined,
        code: codeText,
      };
      return withId({ type: 'code_block', content });
    }

    case 'horizontalRule': {
      const content: ThematicBreakContent = {};
      return withId({ type: 'thematic_break', content });
    }

    case 'table': {
      const rows =
        node.content
          ?.filter((row) => row.type === 'tableRow')
          .map((row) => ({
            cells:
              row.content
                ?.filter((cell) => cell.type === 'tableCell' || cell.type === 'tableHeader')
                .map((cell) => {
                  // Table cells contain paragraphs; extract inline content
                  const paragraph = cell.content?.find((c) => c.type === 'paragraph');
                  return paragraph ? convertInlineContent(paragraph.content) : [];
                }) ?? [],
          })) ?? [];

      const content: TableContent = {
        rows,
        // TipTap stores alignment in colgroup/col elements, extract if present
        align: attrs['align'] as ('left' | 'center' | 'right' | null)[] | undefined,
      };
      return withId({ type: 'table', content });
    }

    case 'mathBlock': {
      const content: MathBlockContent = {
        latex: (attrs['latex'] as string | undefined) ?? '',
      };
      return withId({ type: 'math_block', content });
    }

    case 'footnoteDef': {
      const content: FootnoteDefContent = {
        key: (attrs['key'] as string | undefined) ?? '',
        inline: node.content ? convertInlineContent(node.content) : undefined,
      };
      return withId({ type: 'footnote_def', content });
    }

    // Skip nodes that don't map to NotateDoc blocks
    case 'blockIdNode':
    case 'footnoteSeparator':
      return null;

    default:
      // Unknown block type - skip
      return null;
  }
}

function convertBlocks(content?: TiptapNode[]): ConvertedBlock[] {
  if (!content) return [];
  return content.map(convertBlock).filter((b): b is ConvertedBlock => b !== null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a TipTap document to NotateDoc block array.
 *
 * @param doc - TipTap document (JSONContent with type: 'doc')
 * @returns Array of converted blocks with type, content, and optional children
 */
export function tiptapToNotateDoc(doc: TiptapDoc): ConvertedBlock[] {
  return convertBlocks(doc.content);
}
