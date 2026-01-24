/**
 * NotateDoc to TipTap JSONContent Converter
 *
 * Converts TypeNote's canonical NotateDoc format to TipTap's JSONContent format
 * for rendering in the design-system Editor.
 *
 * @module notateDocToTiptap
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
  AttachmentContent,
} from '@typenote/api';

/**
 * TipTap JSONContent type (minimal shape we need).
 * We define this here to avoid depending on @tiptap/core in packages/core.
 */
export interface JSONContent {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: JSONContent[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
}

// ============================================================================
// Type Guards and Helpers
// ============================================================================

function isTextNode(node: InlineNode): node is Extract<InlineNode, { t: 'text' }> {
  return node.t === 'text';
}

function isLinkNode(node: InlineNode): node is Extract<InlineNode, { t: 'link' }> {
  return node.t === 'link';
}

function isRefNode(node: InlineNode): node is Extract<InlineNode, { t: 'ref' }> {
  return node.t === 'ref';
}

function isTagNode(node: InlineNode): node is Extract<InlineNode, { t: 'tag' }> {
  return node.t === 'tag';
}

function isMathInlineNode(node: InlineNode): node is Extract<InlineNode, { t: 'math_inline' }> {
  return node.t === 'math_inline';
}

function isFootnoteRefNode(node: InlineNode): node is Extract<InlineNode, { t: 'footnote_ref' }> {
  return node.t === 'footnote_ref';
}

function isHardBreakNode(node: InlineNode): node is Extract<InlineNode, { t: 'hard_break' }> {
  return node.t === 'hard_break';
}

// ============================================================================
// Mark Conversion
// ============================================================================

const NOTATE_TO_TIPTAP_MARKS: Record<Mark, string> = {
  strong: 'bold',
  em: 'italic',
  code: 'code',
  strike: 'strike',
  highlight: 'highlight',
};

/**
 * Convert NotateDoc marks to TipTap marks.
 */
function convertMarks(notateMarks: Mark[] | undefined): Array<{ type: string }> | undefined {
  if (!notateMarks || notateMarks.length === 0) {
    return undefined;
  }

  const tiptapMarks: Array<{ type: string }> = [];
  for (const mark of notateMarks) {
    const tiptapMark = NOTATE_TO_TIPTAP_MARKS[mark];
    if (tiptapMark) {
      tiptapMarks.push({ type: tiptapMark });
    }
  }

  return tiptapMarks.length > 0 ? tiptapMarks : undefined;
}

// ============================================================================
// Inline Node Conversion
// ============================================================================

/**
 * Convert NotateDoc inline nodes (non-link) to TipTap JSONContent.
 * Used for link children where nested links are not allowed.
 */
function convertNonLinkInlineNodes(
  notateNodes: Array<Exclude<InlineNode, { t: 'link' }>>
): JSONContent[] {
  const result: JSONContent[] = [];

  for (const node of notateNodes) {
    // Text node
    if (isTextNode(node)) {
      const marks = convertMarks(node.marks);
      result.push({
        type: 'text',
        text: node.text,
        ...(marks ? { marks } : {}),
      });
      continue;
    }

    // Hard break
    if (isHardBreakNode(node)) {
      result.push({ type: 'hardBreak' });
      continue;
    }

    // RefNode
    if (isRefNode(node)) {
      const attrs: Record<string, unknown> = {
        mode: node.mode,
        objectId: node.target.objectId,
      };

      if (node.target.kind === 'block') {
        attrs['targetKind'] = 'block';
        attrs['blockId'] = node.target.blockId;
      } else {
        attrs['targetKind'] = 'object';
      }

      if (node.alias) {
        attrs['alias'] = node.alias;
      }

      result.push({
        type: 'refNode',
        attrs,
      });
      continue;
    }

    // TagNode
    if (isTagNode(node)) {
      result.push({
        type: 'tagNode',
        attrs: {
          value: node.value,
        },
      });
      continue;
    }

    // InlineMath
    if (isMathInlineNode(node)) {
      result.push({
        type: 'inlineMath',
        attrs: {
          latex: node.latex,
        },
      });
      continue;
    }

    // FootnoteRef
    if (isFootnoteRefNode(node)) {
      result.push({
        type: 'footnoteRef',
        attrs: {
          key: node.key,
        },
      });
      continue;
    }
  }

  return result;
}

/**
 * Convert NotateDoc inline nodes to TipTap JSONContent.
 */
function convertInlineNodes(notateNodes: InlineNode[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const node of notateNodes) {
    // Text node
    if (isTextNode(node)) {
      const marks = convertMarks(node.marks);
      result.push({
        type: 'text',
        text: node.text,
        ...(marks ? { marks } : {}),
      });
      continue;
    }

    // Hard break
    if (isHardBreakNode(node)) {
      result.push({ type: 'hardBreak' });
      continue;
    }

    // Link
    if (isLinkNode(node)) {
      const children = convertNonLinkInlineNodes(node.children);
      result.push({
        type: 'link',
        attrs: {
          href: node.href,
        },
        content: children,
      });
      continue;
    }

    // RefNode
    if (isRefNode(node)) {
      const attrs: Record<string, unknown> = {
        mode: node.mode,
        objectId: node.target.objectId,
      };

      if (node.target.kind === 'block') {
        attrs['targetKind'] = 'block';
        attrs['blockId'] = node.target.blockId;
      } else {
        attrs['targetKind'] = 'object';
      }

      if (node.alias) {
        attrs['alias'] = node.alias;
      }

      result.push({
        type: 'refNode',
        attrs,
      });
      continue;
    }

    // TagNode
    if (isTagNode(node)) {
      result.push({
        type: 'tagNode',
        attrs: {
          value: node.value,
        },
      });
      continue;
    }

    // InlineMath
    if (isMathInlineNode(node)) {
      result.push({
        type: 'inlineMath',
        attrs: {
          latex: node.latex,
        },
      });
      continue;
    }

    // FootnoteRef
    if (isFootnoteRefNode(node)) {
      result.push({
        type: 'footnoteRef',
        attrs: {
          key: node.key,
        },
      });
      continue;
    }
  }

  return result;
}

// ============================================================================
// Block Content Conversion
// ============================================================================

/**
 * Convert NotateDoc ParagraphContent to TipTap paragraph.
 */
function convertParagraph(content: ParagraphContent): JSONContent {
  return {
    type: 'paragraph',
    content: convertInlineNodes(content.inline),
  };
}

/**
 * Convert NotateDoc HeadingContent to TipTap heading.
 */
function convertHeading(content: HeadingContent): JSONContent {
  return {
    type: 'heading',
    attrs: {
      level: content.level,
    },
    content: convertInlineNodes(content.inline),
  };
}

/**
 * Convert NotateDoc ListContent to TipTap list type.
 */
function convertList(content: ListContent, children: JSONContent[]): JSONContent {
  let listType: string;
  if (content.kind === 'ordered') {
    listType = 'orderedList';
  } else if (content.kind === 'task') {
    listType = 'taskList';
  } else {
    listType = 'bulletList';
  }

  const attrs: Record<string, unknown> = {};
  if (content.start !== undefined) {
    attrs['start'] = content.start;
  }
  if (content.tight !== undefined) {
    attrs['tight'] = content.tight;
  }

  return {
    type: listType,
    ...(Object.keys(attrs).length > 0 ? { attrs } : {}),
    content: children,
  };
}

/**
 * Convert NotateDoc ListItemContent to TipTap list item.
 */
function convertListItem(
  content: ListItemContent,
  isTask: boolean,
  children: JSONContent[]
): JSONContent {
  const itemType = isTask ? 'taskItem' : 'listItem';

  // Create a paragraph with inline content
  const paragraphContent = convertInlineNodes(content.inline);

  // If there are nested children (nested lists), they come after the paragraph
  const allContent: JSONContent[] = [
    {
      type: 'paragraph',
      content: paragraphContent,
    },
    ...children,
  ];

  const attrs: Record<string, unknown> = {};
  if (content.checked !== undefined) {
    attrs['checked'] = content.checked;
  }

  return {
    type: itemType,
    ...(Object.keys(attrs).length > 0 ? { attrs } : {}),
    content: allContent,
  };
}

/**
 * Convert NotateDoc BlockquoteContent to TipTap blockquote.
 */
function convertBlockquote(_content: BlockquoteContent, children: JSONContent[]): JSONContent {
  return {
    type: 'blockquote',
    content: children,
  };
}

/**
 * Convert NotateDoc CalloutContent to TipTap callout.
 */
function convertCallout(content: CalloutContent, children: JSONContent[]): JSONContent {
  const attrs: Record<string, unknown> = {
    kind: content.kind,
  };

  if (content.title) {
    attrs['title'] = content.title;
  }

  if (content.collapsed !== undefined) {
    attrs['collapsed'] = content.collapsed;
  }

  return {
    type: 'callout',
    attrs,
    content: children,
  };
}

/**
 * Convert NotateDoc CodeBlockContent to TipTap codeBlock.
 */
function convertCodeBlock(content: CodeBlockContent): JSONContent {
  const attrs: Record<string, unknown> = {};
  if (content.language) {
    attrs['language'] = content.language;
  }

  return {
    type: 'codeBlock',
    ...(Object.keys(attrs).length > 0 ? { attrs } : {}),
    content: [
      {
        type: 'text',
        text: content.code,
      },
    ],
  };
}

/**
 * Convert NotateDoc ThematicBreakContent to TipTap horizontalRule.
 */
function convertThematicBreak(_content: ThematicBreakContent): JSONContent {
  return {
    type: 'horizontalRule',
  };
}

/**
 * Convert NotateDoc TableContent to TipTap table.
 */
function convertTable(content: TableContent): JSONContent {
  const attrs: Record<string, unknown> = {};
  if (content.align) {
    attrs['align'] = content.align;
  }

  const rows: JSONContent[] = [];
  for (const row of content.rows) {
    const cells: JSONContent[] = [];
    for (const cellInline of row.cells) {
      // Each cell contains a paragraph wrapping the inline content
      cells.push({
        type: 'tableCell',
        content: [
          {
            type: 'paragraph',
            content: convertInlineNodes(cellInline),
          },
        ],
      });
    }
    rows.push({
      type: 'tableRow',
      content: cells,
    });
  }

  return {
    type: 'table',
    ...(Object.keys(attrs).length > 0 ? { attrs } : {}),
    content: rows,
  };
}

/**
 * Convert NotateDoc MathBlockContent to TipTap mathBlock.
 */
function convertMathBlock(content: MathBlockContent): JSONContent {
  return {
    type: 'mathBlock',
    attrs: {
      latex: content.latex,
    },
  };
}

/**
 * Convert NotateDoc FootnoteDefContent to TipTap footnoteDef.
 */
function convertFootnoteDef(content: FootnoteDefContent): JSONContent {
  const inlineContent = content.inline ? convertInlineNodes(content.inline) : [];

  return {
    type: 'footnoteDef',
    attrs: {
      key: content.key,
    },
    content: inlineContent,
  };
}

/**
 * Convert NotateDoc AttachmentContent to TipTap resizableImage.
 */
function convertAttachment(content: AttachmentContent): JSONContent {
  const attrs: Record<string, unknown> = {
    // Use attachmentId as src placeholder - will be resolved by renderer
    src: `/attachments/${content.attachmentId}`,
  };

  if (content.alt) {
    attrs['alt'] = content.alt;
  }

  if (content.caption) {
    attrs['caption'] = content.caption;
  }

  return {
    type: 'resizableImage',
    attrs,
  };
}

// ============================================================================
// Block Conversion
// ============================================================================

/**
 * Represents a NotateDoc block with its type, content, and optional children.
 */
export interface NotateDocBlock {
  blockType: string;
  content: unknown;
  children?: NotateDocBlock[];
}

/**
 * Convert a single NotateDoc block to TipTap JSONContent.
 */
export function convertNotateDocBlock(block: NotateDocBlock): JSONContent | null {
  const { blockType, content, children = [] } = block;

  // Convert children first
  const tiptapChildren: JSONContent[] = [];
  for (const child of children) {
    const converted = convertNotateDocBlock(child);
    if (converted) {
      tiptapChildren.push(converted);
    }
  }

  switch (blockType) {
    case 'paragraph':
      return convertParagraph(content as ParagraphContent);

    case 'heading':
      return convertHeading(content as HeadingContent);

    case 'list':
      return convertList(content as ListContent, tiptapChildren);

    case 'list_item': {
      // Need to know if this is part of a task list
      // We infer from the content.checked field
      const listItemContent = content as ListItemContent;
      const isTask = listItemContent.checked !== undefined;
      return convertListItem(listItemContent, isTask, tiptapChildren);
    }

    case 'blockquote':
      return convertBlockquote(content as BlockquoteContent, tiptapChildren);

    case 'callout':
      return convertCallout(content as CalloutContent, tiptapChildren);

    case 'code_block':
      return convertCodeBlock(content as CodeBlockContent);

    case 'thematic_break':
      return convertThematicBreak(content as ThematicBreakContent);

    case 'table':
      return convertTable(content as TableContent);

    case 'math_block':
      return convertMathBlock(content as MathBlockContent);

    case 'footnote_def':
      return convertFootnoteDef(content as FootnoteDefContent);

    case 'attachment':
      return convertAttachment(content as AttachmentContent);

    default:
      // Unknown block type - skip
      return null;
  }
}

/**
 * Convert an array of NotateDoc blocks to a TipTap JSONContent document.
 */
export function convertNotateDocToTiptap(blocks: NotateDocBlock[]): JSONContent {
  const content: JSONContent[] = [];

  for (const block of blocks) {
    const converted = convertNotateDocBlock(block);
    if (converted) {
      content.push(converted);
    }
  }

  return {
    type: 'doc',
    content,
  };
}
