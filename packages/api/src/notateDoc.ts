import { z } from 'zod';
import { AttachmentContentSchema } from './attachment.js';

// ─────────────────────────────────────────────────────────────────────────────
// Inline Node Model (Section 11.1 of Backend Contract)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Text formatting marks.
 */
export const MarkSchema = z.enum(['em', 'strong', 'code', 'strike', 'highlight']);

export type Mark = z.infer<typeof MarkSchema>;

/**
 * Reference target types.
 */
export const ObjectRefTargetSchema = z.object({
  kind: z.literal('object'),
  objectId: z.string(),
});

export const BlockRefTargetSchema = z.object({
  kind: z.literal('block'),
  objectId: z.string(),
  blockId: z.string(),
});

export const RefTargetSchema = z.discriminatedUnion('kind', [
  ObjectRefTargetSchema,
  BlockRefTargetSchema,
]);

export type RefTarget = z.infer<typeof RefTargetSchema>;

/**
 * Inline nodes form the content of text-bearing blocks.
 * Uses discriminated union on 't' field.
 */
export const TextNodeSchema = z.object({
  t: z.literal('text'),
  text: z.string(),
  marks: z.array(MarkSchema).optional(),
});

export const HardBreakNodeSchema = z.object({
  t: z.literal('hard_break'),
});

export const RefNodeSchema = z.object({
  t: z.literal('ref'),
  mode: z.enum(['link', 'embed']),
  target: RefTargetSchema,
  alias: z.string().optional(),
});

export const TagNodeSchema = z.object({
  t: z.literal('tag'),
  value: z.string(),
});

export const MathInlineNodeSchema = z.object({
  t: z.literal('math_inline'),
  latex: z.string(),
});

export const FootnoteRefNodeSchema = z.object({
  t: z.literal('footnote_ref'),
  key: z.string(),
});

/**
 * Non-link inline nodes (used as link children to avoid deep recursion).
 * Links cannot be nested in standard Markdown/HTML.
 */
const NonLinkInlineNodeSchema = z.discriminatedUnion('t', [
  TextNodeSchema,
  HardBreakNodeSchema,
  RefNodeSchema,
  TagNodeSchema,
  MathInlineNodeSchema,
  FootnoteRefNodeSchema,
]);

export const LinkNodeSchema = z.object({
  t: z.literal('link'),
  href: z.string(),
  children: z.array(NonLinkInlineNodeSchema),
});

export const InlineNodeSchema = z.discriminatedUnion('t', [
  TextNodeSchema,
  HardBreakNodeSchema,
  LinkNodeSchema,
  RefNodeSchema,
  TagNodeSchema,
  MathInlineNodeSchema,
  FootnoteRefNodeSchema,
]);

export type InlineNode = z.infer<typeof InlineNodeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Block Types (Section 11.2 of Backend Contract)
// ─────────────────────────────────────────────────────────────────────────────

export const BlockTypeSchema = z.enum([
  'paragraph',
  'heading',
  'list',
  'list_item',
  'blockquote',
  'callout',
  'code_block',
  'thematic_break',
  'table',
  'math_block',
  'footnote_def',
  'attachment',
]);

export type BlockType = z.infer<typeof BlockTypeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Block Content Schemas (Section 11.3 of Backend Contract)
// ─────────────────────────────────────────────────────────────────────────────

export const ParagraphContentSchema = z.object({
  inline: z.array(InlineNodeSchema),
});

export type ParagraphContent = z.infer<typeof ParagraphContentSchema>;

export const HeadingContentSchema = z.object({
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  inline: z.array(InlineNodeSchema),
});

export type HeadingContent = z.infer<typeof HeadingContentSchema>;

export const ListContentSchema = z.object({
  kind: z.enum(['bullet', 'ordered', 'task']),
  start: z.number().optional(),
  tight: z.boolean().optional(),
});

export type ListContent = z.infer<typeof ListContentSchema>;

export const ListItemContentSchema = z.object({
  inline: z.array(InlineNodeSchema),
  checked: z.boolean().optional(),
});

export type ListItemContent = z.infer<typeof ListItemContentSchema>;

export const BlockquoteContentSchema = z.object({});

export type BlockquoteContent = z.infer<typeof BlockquoteContentSchema>;

export const CalloutContentSchema = z.object({
  kind: z.string(),
  title: z.string().optional(),
  collapsed: z.boolean().optional(),
});

export type CalloutContent = z.infer<typeof CalloutContentSchema>;

export const CodeBlockContentSchema = z.object({
  language: z.string().optional(),
  code: z.string(),
});

export type CodeBlockContent = z.infer<typeof CodeBlockContentSchema>;

export const ThematicBreakContentSchema = z.object({});

export type ThematicBreakContent = z.infer<typeof ThematicBreakContentSchema>;

export const TableCellSchema = z.array(InlineNodeSchema);

export const TableRowSchema = z.object({
  cells: z.array(TableCellSchema),
});

export const TableContentSchema = z.object({
  align: z
    .array(z.union([z.literal('left'), z.literal('center'), z.literal('right'), z.null()]))
    .optional(),
  rows: z.array(TableRowSchema),
});

export type TableContent = z.infer<typeof TableContentSchema>;

export const MathBlockContentSchema = z.object({
  latex: z.string(),
});

export type MathBlockContent = z.infer<typeof MathBlockContentSchema>;

export const FootnoteDefContentSchema = z.object({
  key: z.string(),
  inline: z.array(InlineNodeSchema).optional(),
});

export type FootnoteDefContent = z.infer<typeof FootnoteDefContentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Content Schema Lookup
// ─────────────────────────────────────────────────────────────────────────────

const ContentSchemaByType = {
  paragraph: ParagraphContentSchema,
  heading: HeadingContentSchema,
  list: ListContentSchema,
  list_item: ListItemContentSchema,
  blockquote: BlockquoteContentSchema,
  callout: CalloutContentSchema,
  code_block: CodeBlockContentSchema,
  thematic_break: ThematicBreakContentSchema,
  table: TableContentSchema,
  math_block: MathBlockContentSchema,
  footnote_def: FootnoteDefContentSchema,
  attachment: AttachmentContentSchema,
} as const;

/**
 * Get the Zod schema for a given block type's content.
 */
export function getContentSchemaForBlockType(blockType: BlockType): z.ZodType | undefined {
  return ContentSchemaByType[blockType];
}
