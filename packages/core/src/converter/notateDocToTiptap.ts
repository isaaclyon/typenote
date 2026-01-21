/**
 * Convert NotateDoc format to TipTap JSONContent.
 *
 * NotateDoc is a minimal, editor-agnostic persistence format.
 * TipTap requires additional UI-specific attributes (displayTitle, color, etc.)
 * that must be resolved by the caller.
 */

import type {
  InlineNode,
  Mark,
  ParagraphContent,
  HeadingContent,
  ListContent,
  ListItemContent,
  CalloutContent,
  CodeBlockContent,
  TableContent,
  MathBlockContent,
  FootnoteDefContent,
} from '@typenote/api';
import type { TiptapNode, TiptapMark, TiptapDoc } from './types.js';
import type { ConvertedBlock } from './tiptapToNotateDoc.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mark Conversion
// ─────────────────────────────────────────────────────────────────────────────

const NOTATE_TO_TIPTAP_MARK: Record<Mark, string> = {
  strong: 'bold',
  em: 'italic',
  code: 'code',
  strike: 'strike',
  highlight: 'highlight',
};

function convertMarks(marks?: Mark[]): TiptapMark[] {
  if (!marks || marks.length === 0) return [];
  return marks.map((mark) => ({ type: NOTATE_TO_TIPTAP_MARK[mark] }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Ref Resolution Callback
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Callback to resolve reference metadata for display in the editor.
 * Since NotateDoc only stores objectId/blockId, we need to look up
 * display info (title, type, color) from the database.
 */
export interface RefResolver {
  resolveObject(objectId: string): {
    displayTitle: string;
    objectType: string;
    color?: string;
  } | null;
}

/**
 * Default resolver that returns placeholder values.
 * Real applications should provide a resolver that queries the database.
 */
export const defaultRefResolver: RefResolver = {
  resolveObject: (objectId: string) => ({
    displayTitle: objectId,
    objectType: 'unknown',
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to build TiptapNode without undefined properties
// ─────────────────────────────────────────────────────────────────────────────

function buildNode(
  type: string,
  options: {
    attrs?: Record<string, unknown>;
    content?: TiptapNode[];
    marks?: TiptapMark[];
    text?: string;
  } = {}
): TiptapNode {
  const node: TiptapNode = { type };
  if (options.attrs && Object.keys(options.attrs).length > 0) {
    node.attrs = options.attrs;
  }
  if (options.content && options.content.length > 0) {
    node.content = options.content;
  }
  if (options.marks && options.marks.length > 0) {
    node.marks = options.marks;
  }
  if (options.text !== undefined) {
    node.text = options.text;
  }
  return node;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Node Conversion
// ─────────────────────────────────────────────────────────────────────────────

function convertInlineNode(node: InlineNode, resolver: RefResolver): TiptapNode | TiptapNode[] {
  switch (node.t) {
    case 'text':
      return buildNode('text', {
        text: node.text,
        marks: convertMarks(node.marks),
      });

    case 'hard_break':
      return buildNode('hardBreak');

    case 'link': {
      // TipTap represents links as marks on text nodes, not separate nodes
      // Convert children and apply link mark to each
      const children: TiptapNode[] = [];
      for (const child of node.children) {
        const converted = convertInlineNode(child, resolver);
        const nodes = Array.isArray(converted) ? converted : [converted];
        for (const n of nodes) {
          if (n.type === 'text' && n.text !== undefined) {
            const linkMark: TiptapMark = { type: 'link', attrs: { href: node.href } };
            const existingMarks = n.marks ?? [];
            children.push(
              buildNode('text', {
                text: n.text,
                marks: [...existingMarks, linkMark],
              })
            );
          } else if (n.type !== 'text') {
            children.push(n);
          }
        }
      }
      return children;
    }

    case 'ref': {
      const resolved = resolver.resolveObject(node.target.objectId);
      const attrs: Record<string, unknown> = {
        objectId: node.target.objectId,
        displayTitle: resolved?.displayTitle ?? node.target.objectId,
        objectType: resolved?.objectType ?? 'unknown',
      };
      if (resolved?.color) {
        attrs['color'] = resolved.color;
      }
      if (node.alias) {
        attrs['alias'] = node.alias;
      }
      if (node.target.kind === 'block') {
        attrs['blockId'] = node.target.blockId;
      }

      // Embed mode uses embedNode, link mode uses refNode
      if (node.mode === 'embed') {
        return buildNode('embedNode', { attrs });
      }
      return buildNode('refNode', { attrs });
    }

    case 'tag':
      return buildNode('tagNode', { attrs: { value: node.value } });

    case 'math_inline':
      return buildNode('inlineMath', { attrs: { latex: node.latex } });

    case 'footnote_ref':
      return buildNode('footnoteRef', { attrs: { key: node.key } });
  }
}

function convertInlineContent(nodes: InlineNode[], resolver: RefResolver): TiptapNode[] {
  const result: TiptapNode[] = [];
  for (const node of nodes) {
    const converted = convertInlineNode(node, resolver);
    if (Array.isArray(converted)) {
      result.push(...converted);
    } else {
      result.push(converted);
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Conversion
// ─────────────────────────────────────────────────────────────────────────────

function convertBlock(block: ConvertedBlock, resolver: RefResolver): TiptapNode | null {
  switch (block.type) {
    case 'paragraph': {
      const content = block.content as ParagraphContent;
      return buildNode('paragraph', {
        content: convertInlineContent(content.inline, resolver),
      });
    }

    case 'heading': {
      const content = block.content as HeadingContent;
      return buildNode('heading', {
        attrs: { level: content.level },
        content: convertInlineContent(content.inline, resolver),
      });
    }

    case 'list': {
      const content = block.content as ListContent;
      const children =
        block.children
          ?.map((c) => convertBlock(c, resolver))
          .filter((b): b is TiptapNode => b !== null) ?? [];

      let listType: string;
      switch (content.kind) {
        case 'bullet':
          listType = 'bulletList';
          break;
        case 'ordered':
          listType = 'orderedList';
          break;
        case 'task':
          listType = 'taskList';
          break;
      }

      const attrs: Record<string, unknown> = {};
      if (content.start !== undefined) attrs['start'] = content.start;
      if (content.tight !== undefined) attrs['tight'] = content.tight;

      return buildNode(listType, { attrs, content: children });
    }

    case 'list_item': {
      const content = block.content as ListItemContent;
      const isTask = content.checked !== undefined;

      const paragraphNode = buildNode('paragraph', {
        content: convertInlineContent(content.inline, resolver),
      });

      const childBlocks =
        block.children
          ?.map((c) => convertBlock(c, resolver))
          .filter((b): b is TiptapNode => b !== null) ?? [];

      const allContent = [paragraphNode, ...childBlocks];

      if (isTask) {
        return buildNode('taskItem', {
          attrs: { checked: content.checked },
          content: allContent,
        });
      }
      return buildNode('listItem', { content: allContent });
    }

    case 'blockquote': {
      const children =
        block.children
          ?.map((c) => convertBlock(c, resolver))
          .filter((b): b is TiptapNode => b !== null) ?? [];
      return buildNode('blockquote', { content: children });
    }

    case 'callout': {
      const content = block.content as CalloutContent;
      const children =
        block.children
          ?.map((c) => convertBlock(c, resolver))
          .filter((b): b is TiptapNode => b !== null) ?? [];
      const attrs: Record<string, unknown> = { kind: content.kind };
      if (content.title !== undefined) attrs['title'] = content.title;
      if (content.collapsed !== undefined) attrs['collapsed'] = content.collapsed;

      return buildNode('callout', { attrs, content: children });
    }

    case 'code_block': {
      const content = block.content as CodeBlockContent;
      const attrs: Record<string, unknown> = {};
      if (content.language) attrs['language'] = content.language;

      const codeContent = content.code ? [buildNode('text', { text: content.code })] : [];

      return buildNode('codeBlock', { attrs, content: codeContent });
    }

    case 'thematic_break':
      return buildNode('horizontalRule');

    case 'table': {
      const content = block.content as TableContent;
      const rows: TiptapNode[] = content.rows.map((row, rowIndex) => {
        const cells: TiptapNode[] = row.cells.map((cell, cellIndex) => {
          const cellAttrs: Record<string, unknown> = {};
          if (content.align?.[cellIndex]) {
            cellAttrs['colwidth'] = null;
            cellAttrs['colspan'] = 1;
            cellAttrs['rowspan'] = 1;
          }
          return buildNode(rowIndex === 0 ? 'tableHeader' : 'tableCell', {
            attrs: cellAttrs,
            content: [
              buildNode('paragraph', {
                content: convertInlineContent(cell, resolver),
              }),
            ],
          });
        });
        return buildNode('tableRow', { content: cells });
      });

      const attrs: Record<string, unknown> = {};
      if (content.align) attrs['align'] = content.align;

      return buildNode('table', { attrs, content: rows });
    }

    case 'math_block': {
      const content = block.content as MathBlockContent;
      return buildNode('mathBlock', { attrs: { latex: content.latex } });
    }

    case 'footnote_def': {
      const content = block.content as FootnoteDefContent;
      const inlineContent = content.inline ? convertInlineContent(content.inline, resolver) : [];
      return buildNode('footnoteDef', {
        attrs: { key: content.key },
        content: inlineContent,
      });
    }

    case 'attachment':
      // Attachments are not yet supported in the editor
      return null;

    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert NotateDoc blocks to a TipTap document.
 *
 * @param blocks - Array of NotateDoc blocks
 * @param resolver - Callback to resolve reference metadata (optional)
 * @returns TipTap document (JSONContent with type: 'doc')
 */
export function notateDocToTiptap(
  blocks: ConvertedBlock[],
  resolver: RefResolver = defaultRefResolver
): TiptapDoc {
  const content = blocks
    .map((b) => convertBlock(b, resolver))
    .filter((b): b is TiptapNode => b !== null);

  if (content.length > 0) {
    return { type: 'doc', content };
  }
  return { type: 'doc' };
}
