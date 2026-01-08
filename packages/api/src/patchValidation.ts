import { z } from 'zod';
import { ApplyBlockPatchInputSchema, type ApplyBlockPatchInput } from './blockPatch.js';
import {
  BlockTypeSchema,
  ParagraphContentSchema,
  HeadingContentSchema,
  ListContentSchema,
  ListItemContentSchema,
  BlockquoteContentSchema,
  CalloutContentSchema,
  CodeBlockContentSchema,
  ThematicBreakContentSchema,
  TableContentSchema,
  MathBlockContentSchema,
  FootnoteDefContentSchema,
  type BlockType,
} from './notateDoc.js';
import { AttachmentContentSchema } from './attachment.js';

// ─────────────────────────────────────────────────────────────────────────────
// Validation Result Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationError {
  path: string;
  message: string;
}

export type PatchValidationResult =
  | { valid: true; data: ApplyBlockPatchInput }
  | { valid: false; errors: ValidationError[] };

export type ContentValidationResult = { valid: true } | { valid: false; errors: ValidationError[] };

// ─────────────────────────────────────────────────────────────────────────────
// Content Schema Lookup
// ─────────────────────────────────────────────────────────────────────────────

const ContentSchemaByType: Record<BlockType, z.ZodType> = {
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
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format Zod errors into a simpler structure.
 */
function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/**
 * Validate a complete patch input envelope.
 */
export function validatePatchInput(input: unknown): PatchValidationResult {
  const result = ApplyBlockPatchInputSchema.safeParse(input);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return { valid: false, errors: formatZodErrors(result.error) };
}

/**
 * Validate block content against its block type's schema.
 */
export function validateBlockContent(blockType: string, content: unknown): ContentValidationResult {
  // First check if it's a valid block type
  const typeResult = BlockTypeSchema.safeParse(blockType);
  if (!typeResult.success) {
    return {
      valid: false,
      errors: [{ path: 'blockType', message: `Unknown block type: ${blockType}` }],
    };
  }

  const schema = ContentSchemaByType[typeResult.data];
  const contentResult = schema.safeParse(content);

  if (contentResult.success) {
    return { valid: true };
  }

  return { valid: false, errors: formatZodErrors(contentResult.error) };
}
