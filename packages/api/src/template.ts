/**
 * Template API contracts.
 *
 * Templates define initial content (blocks) that auto-apply when creating new objects.
 * Each ObjectType can have templates, with one marked as default.
 */

import { z } from 'zod';
import { BlockTypeSchema } from './notateDoc.js';

// ============================================================================
// Template Block Schema
// ============================================================================

/**
 * A block within a template. Uses the same block types as NotateDoc,
 * but content may contain {{placeholders}} for substitution.
 *
 * Note: We use z.record() for content because template blocks may contain
 * placeholder strings that won't validate against the strict content schemas.
 * Validation happens after placeholder substitution at apply time.
 * Using z.record() instead of z.unknown() ensures content is required (not undefined).
 */
const baseTemplateBlockSchema = z.object({
  blockType: BlockTypeSchema,
  content: z.record(z.unknown()), // Required object (not undefined)
});

export type TemplateBlock = z.infer<typeof baseTemplateBlockSchema> & {
  children?: TemplateBlock[] | undefined;
};

export const TemplateBlockSchema: z.ZodType<TemplateBlock> = baseTemplateBlockSchema.extend({
  children: z.lazy(() => z.array(TemplateBlockSchema)).optional(),
});

// ============================================================================
// Template Content Schema
// ============================================================================

/**
 * The content of a template: an array of template blocks.
 */
export const TemplateContentSchema = z.object({
  blocks: z.array(TemplateBlockSchema),
});

export type TemplateContent = z.infer<typeof TemplateContentSchema>;

// ============================================================================
// Template Entity Schema
// ============================================================================

/**
 * Full Template entity as stored in the database.
 */
export const TemplateSchema = z.object({
  id: z.string().length(26), // ULID
  objectTypeId: z.string().length(26), // FK to object_types
  name: z.string().min(1).max(128),
  content: TemplateContentSchema,
  isDefault: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Template = z.infer<typeof TemplateSchema>;

// ============================================================================
// API Operations
// ============================================================================

/**
 * Input for creating a new template.
 */
export const CreateTemplateInputSchema = z.object({
  objectTypeId: z.string().length(26),
  name: z.string().min(1).max(128),
  content: TemplateContentSchema,
  isDefault: z.boolean().default(true),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;

/**
 * Input for updating an existing template.
 * objectTypeId cannot be changed after creation.
 */
export const UpdateTemplateInputSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  content: TemplateContentSchema.optional(),
  isDefault: z.boolean().optional(),
});

export type UpdateTemplateInput = z.infer<typeof UpdateTemplateInputSchema>;
