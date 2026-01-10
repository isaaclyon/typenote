/**
 * NotateDoc to TipTap Converter
 *
 * Transforms our NotateDoc format (from getDocument()) into TipTap's ProseMirror JSON.
 * This is a one-way conversion from canonical storage format to editor format.
 */

import type { JSONContent } from '@tiptap/react';
import type {
  InlineNode,
  Mark,
  BlockType,
  ParagraphContent,
  HeadingContent,
  ListContent,
  ListItemContent,
  CalloutContent,
  CodeBlockContent,
  TableContent,
  MathBlockContent,
  FootnoteDefContent,
  DocumentBlock,
  GetDocumentResult,
} from '@typenote/api';

import { NOTATE_TO_TIPTAP } from './markMapping.js';

/**
 * Converts NotateDoc marks to TipTap marks array.
 */
function convertMarks(marks: Mark[] | undefined): Array<{ type: string }> | undefined {
  if (!marks || marks.length === 0) return undefined;
  return marks.map((mark) => ({ type: NOTATE_TO_TIPTAP[mark] }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline Node Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts an array of NotateDoc inline nodes to TipTap JSONContent array.
 */
export function convertInline(nodes: InlineNode[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const node of nodes) {
    switch (node.t) {
      case 'text': {
        const tiptapNode: JSONContent = {
          type: 'text',
          text: node.text,
        };
        const marks = convertMarks(node.marks);
        if (marks) {
          tiptapNode.marks = marks;
        }
        result.push(tiptapNode);
        break;
      }

      case 'hard_break': {
        result.push({ type: 'hardBreak' });
        break;
      }

      case 'link': {
        // Links are represented as text nodes with a link mark
        // The children of the link become text content with the link mark applied
        const linkMark = { type: 'link', attrs: { href: node.href } };
        const children = convertInline(node.children);
        for (const child of children) {
          // Add link mark to existing marks
          const existingMarks = child.marks ?? [];
          result.push({
            ...child,
            marks: [...existingMarks, linkMark],
          });
        }
        break;
      }

      case 'ref': {
        // Custom inline node for internal references
        result.push({
          type: 'ref',
          attrs: {
            mode: node.mode,
            target: node.target,
            alias: node.alias,
          },
        });
        break;
      }

      case 'tag': {
        // Custom inline node for tags
        result.push({
          type: 'tag',
          attrs: {
            value: node.value,
          },
        });
        break;
      }

      case 'math_inline': {
        // Custom inline node for inline math
        result.push({
          type: 'mathInline',
          attrs: {
            latex: node.latex,
          },
        });
        break;
      }

      case 'footnote_ref': {
        // Custom inline node for footnote references
        result.push({
          type: 'footnoteRef',
          attrs: {
            key: node.key,
          },
        });
        break;
      }
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a NotateDoc block to TipTap JSONContent.
 * Handles recursive tree structure for container blocks.
 */
export function convertBlock(block: DocumentBlock): JSONContent {
  const blockType = block.blockType as BlockType;
  const content = block.content;

  switch (blockType) {
    case 'paragraph': {
      const paragraphContent = content as ParagraphContent;
      return {
        type: 'paragraph',
        content: convertInline(paragraphContent.inline),
      };
    }

    case 'heading': {
      const headingContent = content as HeadingContent;
      return {
        type: 'heading',
        attrs: { level: headingContent.level },
        content: convertInline(headingContent.inline),
      };
    }

    case 'list': {
      const listContent = content as ListContent;
      // Convert children (list_item blocks) to TipTap list items
      const items = block.children.map(convertBlock);

      switch (listContent.kind) {
        case 'bullet':
          return {
            type: 'bulletList',
            content: items,
          };
        case 'ordered':
          return {
            type: 'orderedList',
            attrs: listContent.start !== undefined ? { start: listContent.start } : undefined,
            content: items,
          };
        case 'task':
          return {
            type: 'taskList',
            content: items,
          };
        default: {
          // Exhaustive check - all list kinds should be handled above
          const _exhaustive: never = listContent.kind;
          throw new Error(`Unknown list kind: ${_exhaustive}`);
        }
      }
    }

    case 'list_item': {
      const listItemContent = content as ListItemContent;
      // First line inline content goes in a paragraph
      const inlineContent: JSONContent[] = [
        {
          type: 'paragraph',
          content: convertInline(listItemContent.inline),
        },
      ];
      // Additional nested content as child blocks
      const nestedContent = block.children.map(convertBlock);

      // Check if this is a task item (has checked property)
      if (listItemContent.checked !== undefined) {
        return {
          type: 'taskItem',
          attrs: { checked: listItemContent.checked },
          content: [...inlineContent, ...nestedContent],
        };
      }

      return {
        type: 'listItem',
        content: [...inlineContent, ...nestedContent],
      };
    }

    case 'blockquote': {
      // Blockquote is a container - children are the content
      const children = block.children.map(convertBlock);
      return {
        type: 'blockquote',
        content: children,
      };
    }

    case 'callout': {
      const calloutContent = content as CalloutContent;
      // Custom block type for Obsidian-style callouts
      const children = block.children.map(convertBlock);
      return {
        type: 'callout',
        attrs: {
          kind: calloutContent.kind,
          title: calloutContent.title,
          collapsed: calloutContent.collapsed,
        },
        content: children,
      };
    }

    case 'code_block': {
      const codeBlockContent = content as CodeBlockContent;
      return {
        type: 'codeBlock',
        attrs: { language: codeBlockContent.language },
        content: [{ type: 'text', text: codeBlockContent.code }],
      };
    }

    case 'thematic_break': {
      return {
        type: 'horizontalRule',
      };
    }

    case 'table': {
      const tableContent = content as TableContent;
      // Convert rows to TipTap table structure
      const rows = tableContent.rows.map((row, rowIndex) => {
        const cells = row.cells.map((cell, cellIndex) => {
          // First row cells are headers
          const cellType = rowIndex === 0 ? 'tableHeader' : 'tableCell';
          const align = tableContent.align?.[cellIndex] ?? null;
          return {
            type: cellType,
            attrs: align ? { alignment: align } : undefined,
            content: [
              {
                type: 'paragraph',
                content: convertInline(cell),
              },
            ],
          };
        });
        return {
          type: 'tableRow',
          content: cells,
        };
      });

      return {
        type: 'table',
        content: rows,
      };
    }

    case 'math_block': {
      const mathBlockContent = content as MathBlockContent;
      // Custom block type for display math
      return {
        type: 'mathBlock',
        attrs: {
          latex: mathBlockContent.latex,
        },
      };
    }

    case 'footnote_def': {
      const footnoteDefContent = content as FootnoteDefContent;
      // Custom block type for footnote definitions
      const footnoteNode: JSONContent = {
        type: 'footnote',
        attrs: {
          key: footnoteDefContent.key,
        },
      };
      if (footnoteDefContent.inline) {
        footnoteNode.content = convertInline(footnoteDefContent.inline);
      }
      return footnoteNode;
    }

    default: {
      // Fallback for unknown block types - render as paragraph
      console.warn(`Unknown block type: ${blockType}`);
      return {
        type: 'paragraph',
        content: [],
      };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a full NotateDoc document to TipTap JSONContent.
 *
 * @param doc - The GetDocumentResult from storage
 * @returns TipTap-compatible JSONContent document
 */
export function convertDocument(doc: GetDocumentResult): JSONContent {
  const content = doc.blocks.map(convertBlock);

  // TipTap requires at least one block for the Placeholder extension to work.
  // If the document is empty, provide an empty paragraph.
  if (content.length === 0) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }

  return {
    type: 'doc',
    content,
  };
}
