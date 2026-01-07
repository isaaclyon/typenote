/**
 * Template application service.
 *
 * Applies a template to an object by substituting placeholders and inserting blocks.
 */

import type { Template, TemplateBlock, ApplyBlockPatchResult, ApiError } from '@typenote/api';
import { generateId, substitutePlaceholders, type PlaceholderContext } from '@typenote/core';
import type { TypenoteDb } from './db.js';
import { applyBlockPatch, type ApplyBlockPatchOutcome } from './applyBlockPatch.js';

/**
 * Context for placeholder substitution.
 */
export interface ApplyTemplateContext {
  /** Object title */
  title: string;
  /** Creation date */
  createdDate: Date;
  /** For DailyNotes: the date_key property */
  dateKey?: string | undefined;
}

/**
 * Result of applying a template.
 */
export type ApplyTemplateOutcome =
  | { success: true; result: ApplyBlockPatchResult }
  | { success: false; error: ApiError };

/**
 * Convert ApplyTemplateContext to PlaceholderContext.
 */
function toPlaceholderContext(ctx: ApplyTemplateContext): PlaceholderContext {
  return {
    title: ctx.title,
    created_date: ctx.createdDate.toISOString().split('T')[0] ?? '',
    date_key: ctx.dateKey,
  };
}

/**
 * Flatten template blocks into insert operations, generating IDs and tracking parent relationships.
 */
function flattenTemplateBlocks(
  blocks: TemplateBlock[],
  parentBlockId: string | null
): Array<{
  blockId: string;
  parentBlockId: string | null;
  blockType: string;
  content: unknown;
}> {
  const result: Array<{
    blockId: string;
    parentBlockId: string | null;
    blockType: string;
    content: unknown;
  }> = [];

  for (const block of blocks) {
    const blockId = generateId();

    result.push({
      blockId,
      parentBlockId,
      blockType: block.blockType,
      content: block.content,
    });

    // Recursively process children
    if (block.children && block.children.length > 0) {
      const childOps = flattenTemplateBlocks(block.children, blockId);
      result.push(...childOps);
    }
  }

  return result;
}

/**
 * Apply a template to an object.
 *
 * This function:
 * 1. Substitutes placeholders in template blocks using the provided context
 * 2. Converts template blocks to block.insert operations
 * 3. Applies the patch to the object
 *
 * @param db - Database connection
 * @param objectId - Object to apply template to
 * @param template - Template to apply
 * @param context - Context for placeholder substitution
 * @returns Success with patch result, or failure with error
 */
export function applyTemplateToObject(
  db: TypenoteDb,
  objectId: string,
  template: Template,
  context: ApplyTemplateContext
): ApplyTemplateOutcome {
  // 1. Handle empty template
  if (template.content.blocks.length === 0) {
    // Return a successful no-op result
    return {
      success: true,
      result: {
        apiVersion: 'v1',
        objectId,
        previousDocVersion: 0,
        newDocVersion: 0,
        applied: {
          insertedBlockIds: [],
          updatedBlockIds: [],
          movedBlockIds: [],
          deletedBlockIds: [],
        },
      },
    };
  }

  // 2. Substitute placeholders in template blocks
  const placeholderContext = toPlaceholderContext(context);
  const substitutedBlocks = substitutePlaceholders(template.content.blocks, placeholderContext);

  // 3. Flatten blocks into insert operations
  const flatBlocks = flattenTemplateBlocks(substitutedBlocks, null);

  // 4. Build block.insert operations
  const ops = flatBlocks.map((block) => ({
    op: 'block.insert' as const,
    blockId: block.blockId,
    parentBlockId: block.parentBlockId,
    blockType: block.blockType,
    content: block.content,
    // Use 'end' placement to maintain order
    place: { where: 'end' as const },
  }));

  // 5. Apply the patch
  const patchResult: ApplyBlockPatchOutcome = applyBlockPatch(db, {
    apiVersion: 'v1',
    objectId,
    ops,
  });

  return patchResult;
}
