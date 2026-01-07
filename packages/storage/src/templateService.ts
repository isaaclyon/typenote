/**
 * Template service for CRUD operations on templates.
 *
 * Templates define initial content (blocks) that auto-apply when creating new objects.
 */

import { eq, desc, and } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type {
  Template,
  TemplateContent,
  CreateTemplateInput,
  UpdateTemplateInput,
} from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { templates } from './schema.js';
import { getObjectTypeByKey } from './objectTypeService.js';

/**
 * Convert a Drizzle result row to a Template object.
 */
function rowToTemplate(row: typeof templates.$inferSelect): Template {
  return {
    id: row.id,
    objectTypeId: row.objectTypeId,
    name: row.name,
    content: JSON.parse(row.content) as TemplateContent,
    isDefault: row.isDefault,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Create a new template.
 *
 * @throws Error if the object type ID doesn't exist (FK constraint)
 */
export function createTemplate(db: TypenoteDb, input: CreateTemplateInput): Template {
  const id = generateId();
  const now = new Date();

  db.insert(templates)
    .values({
      id,
      objectTypeId: input.objectTypeId,
      name: input.name,
      content: JSON.stringify(input.content),
      isDefault: input.isDefault,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return {
    id,
    objectTypeId: input.objectTypeId,
    name: input.name,
    content: input.content,
    isDefault: input.isDefault,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get a template by ID.
 *
 * @returns The template or null if not found
 */
export function getTemplate(db: TypenoteDb, id: string): Template | null {
  const row = db.select().from(templates).where(eq(templates.id, id)).limit(1).all()[0];

  return row ? rowToTemplate(row) : null;
}

/**
 * Get the default template for an object type.
 *
 * If multiple default templates exist, returns the most recently created one.
 *
 * @returns The default template or null if none exists
 */
export function getDefaultTemplateForType(db: TypenoteDb, objectTypeId: string): Template | null {
  const row = db
    .select()
    .from(templates)
    .where(and(eq(templates.objectTypeId, objectTypeId), eq(templates.isDefault, true)))
    .orderBy(desc(templates.createdAt))
    .limit(1)
    .all()[0];

  return row ? rowToTemplate(row) : null;
}

/**
 * List templates, optionally filtered by object type.
 *
 * @param objectTypeId - If provided, only return templates for this type
 * @returns Array of templates
 */
export function listTemplates(db: TypenoteDb, objectTypeId?: string): Template[] {
  let query = db.select().from(templates);

  if (objectTypeId !== undefined) {
    query = query.where(eq(templates.objectTypeId, objectTypeId)) as typeof query;
  }

  const rows = query.orderBy(desc(templates.createdAt)).all();
  return rows.map(rowToTemplate);
}

/**
 * Update a template.
 *
 * @returns The updated template or null if not found
 */
export function updateTemplate(
  db: TypenoteDb,
  id: string,
  input: UpdateTemplateInput
): Template | null {
  // Check if template exists
  const existing = getTemplate(db, id);
  if (existing === null) return null;

  // Build update object
  const updates: Partial<typeof templates.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    updates.name = input.name;
  }
  if (input.content !== undefined) {
    updates.content = JSON.stringify(input.content);
  }
  if (input.isDefault !== undefined) {
    updates.isDefault = input.isDefault;
  }

  // Perform update
  db.update(templates).set(updates).where(eq(templates.id, id)).run();

  // Return updated template
  return getTemplate(db, id);
}

/**
 * Delete a template.
 *
 * @returns true if deleted, false if not found
 */
export function deleteTemplate(db: TypenoteDb, id: string): boolean {
  const result = db.delete(templates).where(eq(templates.id, id)).run();

  return result.changes > 0;
}

// ============================================================================
// Built-in Template Definitions
// ============================================================================

/**
 * Default DailyNote template content.
 *
 * Creates a heading with the date and a blank paragraph for note-taking.
 * Uses {{date_key}} placeholder which gets substituted with the actual date.
 */
export const DAILY_NOTE_DEFAULT_TEMPLATE: TemplateContent = {
  blocks: [
    {
      blockType: 'heading',
      content: {
        level: 1,
        inline: [{ t: 'text', text: '{{date_key}}' }],
      },
    },
    {
      blockType: 'paragraph',
      content: {
        inline: [],
      },
    },
  ],
};

/**
 * Seed the default DailyNote template.
 *
 * This is idempotent — if a template already exists for the DailyNote type,
 * this function does nothing.
 *
 * @param db - Database connection
 * @returns The seeded template, or null if DailyNote type doesn't exist
 */
export function seedDailyNoteTemplate(db: TypenoteDb): Template | null {
  // Get DailyNote type
  const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
  if (!dailyNoteType) {
    return null;
  }

  // Check if any template already exists for DailyNote type
  const existingTemplates = listTemplates(db, dailyNoteType.id);
  if (existingTemplates.length > 0) {
    // Return the existing default, or first template if no default
    return getDefaultTemplateForType(db, dailyNoteType.id) ?? existingTemplates[0] ?? null;
  }

  // Create the default template
  return createTemplate(db, {
    objectTypeId: dailyNoteType.id,
    name: 'Daily Note Default',
    content: DAILY_NOTE_DEFAULT_TEMPLATE,
    isDefault: true,
  });
}
