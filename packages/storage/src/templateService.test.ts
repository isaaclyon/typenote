/**
 * Template service tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import {
  createTemplate,
  getTemplate,
  getDefaultTemplateForType,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  seedDailyNoteTemplate,
  DAILY_NOTE_DEFAULT_TEMPLATE,
} from './templateService.js';
import type { CreateTemplateInput, UpdateTemplateInput, TemplateContent } from '@typenote/api';

describe('templateService', () => {
  let db: TypenoteDb;
  let dailyNoteTypeId: string;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    // Get DailyNote type ID
    const types = db.all<{ id: string; key: string }>(
      "SELECT id, key FROM object_types WHERE key = 'DailyNote'"
    );
    const firstType = types[0];
    if (!firstType) throw new Error('DailyNote type not found');
    dailyNoteTypeId = firstType.id;
  });

  afterEach(() => {
    closeDb(db);
  });

  const sampleContent: TemplateContent = {
    blocks: [
      {
        blockType: 'heading',
        content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
      },
      {
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Date: {{date_key}}' }] },
      },
    ],
  };

  describe('createTemplate', () => {
    it('creates a template with all required fields', () => {
      const input: CreateTemplateInput = {
        objectTypeId: dailyNoteTypeId,
        name: 'Daily Note Default',
        content: sampleContent,
        isDefault: true,
      };

      const template = createTemplate(db, input);

      expect(template.id).toHaveLength(26);
      expect(template.objectTypeId).toBe(dailyNoteTypeId);
      expect(template.name).toBe('Daily Note Default');
      expect(template.content).toEqual(sampleContent);
      expect(template.isDefault).toBe(true);
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a template with isDefault false', () => {
      const input: CreateTemplateInput = {
        objectTypeId: dailyNoteTypeId,
        name: 'Alternate Template',
        content: { blocks: [] },
        isDefault: false,
      };

      const template = createTemplate(db, input);

      expect(template.isDefault).toBe(false);
    });

    it('throws on invalid object type ID', () => {
      const input: CreateTemplateInput = {
        objectTypeId: '01ARZ3NDEKTSV4RRFFQ69G5FAV', // Non-existent
        name: 'Test',
        content: { blocks: [] },
        isDefault: true,
      };

      expect(() => createTemplate(db, input)).toThrow();
    });
  });

  describe('getTemplate', () => {
    it('retrieves an existing template', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Test Template',
        content: sampleContent,
        isDefault: true,
      });

      const retrieved = getTemplate(db, created.id);

      expect(retrieved).not.toBeNull();
      if (retrieved === null) throw new Error('Expected template');
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Test Template');
      expect(retrieved.content).toEqual(sampleContent);
    });

    it('returns null for non-existent template', () => {
      const result = getTemplate(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');
      expect(result).toBeNull();
    });
  });

  describe('getDefaultTemplateForType', () => {
    it('returns the default template for an object type', () => {
      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Default Template',
        content: sampleContent,
        isDefault: true,
      });

      const defaultTemplate = getDefaultTemplateForType(db, dailyNoteTypeId);

      expect(defaultTemplate).not.toBeNull();
      if (defaultTemplate === null) throw new Error('Expected template');
      expect(defaultTemplate.name).toBe('Default Template');
      expect(defaultTemplate.isDefault).toBe(true);
    });

    it('returns null when no templates exist for type', () => {
      const result = getDefaultTemplateForType(db, dailyNoteTypeId);
      expect(result).toBeNull();
    });

    it('returns null when only non-default templates exist', () => {
      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Non-default',
        content: { blocks: [] },
        isDefault: false,
      });

      const result = getDefaultTemplateForType(db, dailyNoteTypeId);
      expect(result).toBeNull();
    });

    it('returns a default template when multiple exist', () => {
      // Note: SQLite stores timestamps with second precision, so rapid
      // creation may result in same timestamp. We just verify one is returned.
      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'First Default',
        content: { blocks: [] },
        isDefault: true,
      });

      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Second Default',
        content: sampleContent,
        isDefault: true,
      });

      const result = getDefaultTemplateForType(db, dailyNoteTypeId);
      expect(result).not.toBeNull();
      if (result === null) throw new Error('Expected template');
      expect(result.name).toBe('Second Default');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('listTemplates', () => {
    it('returns all templates when no filter provided', () => {
      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Template 1',
        content: { blocks: [] },
        isDefault: true,
      });
      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Template 2',
        content: { blocks: [] },
        isDefault: false,
      });

      const templates = listTemplates(db);

      expect(templates).toHaveLength(2);
    });

    it('filters by object type ID', () => {
      // Get Page type
      const pageTypes = db.all<{ id: string }>("SELECT id FROM object_types WHERE key = 'Page'");
      const firstPageType = pageTypes[0];
      if (!firstPageType) throw new Error('Page type not found');
      const pageTypeId = firstPageType.id;

      createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Daily Template',
        content: { blocks: [] },
        isDefault: true,
      });
      createTemplate(db, {
        objectTypeId: pageTypeId,
        name: 'Page Template',
        content: { blocks: [] },
        isDefault: true,
      });

      const dailyTemplates = listTemplates(db, { objectTypeId: dailyNoteTypeId });
      expect(dailyTemplates).toHaveLength(1);
      const firstTemplate = dailyTemplates[0];
      if (!firstTemplate) throw new Error('Expected template');
      expect(firstTemplate.name).toBe('Daily Template');
    });

    it('excludes deleted templates by default and includes with flag', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'To Delete',
        content: { blocks: [] },
        isDefault: true,
      });

      deleteTemplate(db, created.id);

      const defaultList = listTemplates(db, { objectTypeId: dailyNoteTypeId });
      expect(defaultList).toHaveLength(0);

      const includeDeleted = listTemplates(db, {
        objectTypeId: dailyNoteTypeId,
        includeDeleted: true,
      });
      expect(includeDeleted).toHaveLength(1);
      const deleted = includeDeleted[0];
      if (!deleted) throw new Error('Expected template');
      expect(deleted.deletedAt).not.toBeNull();
    });

    it('returns empty array when no templates exist', () => {
      const templates = listTemplates(db);
      expect(templates).toEqual([]);
    });
  });

  describe('updateTemplate', () => {
    it('updates template name', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Original Name',
        content: { blocks: [] },
        isDefault: true,
      });

      const input: UpdateTemplateInput = { name: 'Updated Name' };
      const updated = updateTemplate(db, created.id, input);

      expect(updated).not.toBeNull();
      if (updated === null) throw new Error('Expected template');
      expect(updated.name).toBe('Updated Name');
      // Verify updatedAt is a recent timestamp (within last minute)
      const now = Date.now();
      expect(updated.updatedAt.getTime()).toBeGreaterThan(now - 60000);
      expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(now + 1000);
    });

    it('updates template content', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Test',
        content: { blocks: [] },
        isDefault: true,
      });

      const newContent: TemplateContent = {
        blocks: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'New content' }] },
          },
        ],
      };

      const input: UpdateTemplateInput = { content: newContent };
      const updated = updateTemplate(db, created.id, input);

      expect(updated).not.toBeNull();
      if (updated === null) throw new Error('Expected template');
      expect(updated.content).toEqual(newContent);
    });

    it('updates isDefault flag', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Test',
        content: { blocks: [] },
        isDefault: true,
      });

      const input: UpdateTemplateInput = { isDefault: false };
      const updated = updateTemplate(db, created.id, input);

      expect(updated).not.toBeNull();
      if (updated === null) throw new Error('Expected template');
      expect(updated.isDefault).toBe(false);
    });

    it('clears other defaults when setting isDefault true', () => {
      const first = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'First',
        content: { blocks: [] },
        isDefault: true,
      });

      const second = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Second',
        content: { blocks: [] },
        isDefault: false,
      });

      const updated = updateTemplate(db, second.id, { isDefault: true });
      expect(updated).not.toBeNull();
      if (updated === null) throw new Error('Expected template');
      expect(updated.isDefault).toBe(true);

      const refreshed = getTemplate(db, first.id);
      expect(refreshed).not.toBeNull();
      if (refreshed === null) throw new Error('Expected template');
      expect(refreshed.isDefault).toBe(false);
    });

    it('returns null for non-existent template', () => {
      const input: UpdateTemplateInput = { name: 'New Name' };
      const result = updateTemplate(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV', input);
      expect(result).toBeNull();
    });

    it('does nothing when empty update provided', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Test',
        content: { blocks: [] },
        isDefault: true,
      });

      const input: UpdateTemplateInput = {};
      const updated = updateTemplate(db, created.id, input);

      expect(updated).not.toBeNull();
      if (updated === null) throw new Error('Expected template');
      expect(updated.name).toBe('Test');
    });
  });

  describe('deleteTemplate', () => {
    it('soft-deletes an existing template', () => {
      const created = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'To Delete',
        content: { blocks: [] },
        isDefault: true,
      });

      const deleted = deleteTemplate(db, created.id);

      expect(deleted).toBe(true);
      expect(getTemplate(db, created.id)).toBeNull();
      const deletedTemplate = getTemplate(db, created.id, true);
      expect(deletedTemplate).not.toBeNull();
      if (deletedTemplate === null) throw new Error('Expected template');
      expect(deletedTemplate.deletedAt).not.toBeNull();
      expect(deletedTemplate.isDefault).toBe(false);
    });

    it('returns false for non-existent template', () => {
      const result = deleteTemplate(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');
      expect(result).toBe(false);
    });
  });

  describe('seedDailyNoteTemplate', () => {
    it('creates default DailyNote template when none exists', () => {
      const template = seedDailyNoteTemplate(db);

      expect(template).not.toBeNull();
      if (template === null) throw new Error('Expected template');
      expect(template.name).toBe('Daily Note Default');
      expect(template.objectTypeId).toBe(dailyNoteTypeId);
      expect(template.isDefault).toBe(true);
      expect(template.content).toEqual(DAILY_NOTE_DEFAULT_TEMPLATE);
    });

    it('is idempotent - returns existing template on second call', () => {
      const first = seedDailyNoteTemplate(db);
      const second = seedDailyNoteTemplate(db);

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (first === null || second === null) throw new Error('Expected templates');
      expect(second.id).toBe(first.id);
    });

    it('returns existing template if one was manually created', () => {
      // Create a custom template first
      const custom = createTemplate(db, {
        objectTypeId: dailyNoteTypeId,
        name: 'Custom Daily Template',
        content: { blocks: [] },
        isDefault: true,
      });

      // seedDailyNoteTemplate should return the existing template
      const seeded = seedDailyNoteTemplate(db);

      expect(seeded).not.toBeNull();
      if (seeded === null) throw new Error('Expected template');
      expect(seeded.id).toBe(custom.id);
    });

    it('returns null if DailyNote type does not exist', () => {
      // Create a fresh DB without seeding built-in types
      const freshDb = createTestDb();

      const result = seedDailyNoteTemplate(freshDb);

      expect(result).toBeNull();
      closeDb(freshDb);
    });

    it('creates template with correct content structure', () => {
      const template = seedDailyNoteTemplate(db);

      expect(template).not.toBeNull();
      if (template === null) throw new Error('Expected template');

      // Verify the template has expected block structure
      expect(template.content.blocks).toHaveLength(2);

      const firstBlock = template.content.blocks[0];
      expect(firstBlock).toBeDefined();
      if (!firstBlock) throw new Error('Expected first block');
      expect(firstBlock.blockType).toBe('heading');

      const secondBlock = template.content.blocks[1];
      expect(secondBlock).toBeDefined();
      if (!secondBlock) throw new Error('Expected second block');
      expect(secondBlock.blockType).toBe('paragraph');
    });
  });
});
