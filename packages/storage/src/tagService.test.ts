/**
 * Tag Service tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import {
  createTag,
  getTag,
  getTagBySlug,
  updateTag,
  deleteTag,
  listTags,
  assignTags,
  removeTags,
  getObjectTags,
  findOrCreateTag,
  TagServiceError,
} from './tagService.js';

describe('TagService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // createTag
  // ============================================================================

  describe('createTag', () => {
    it('creates a tag with minimal fields', () => {
      const tag = createTag(db, { name: 'TypeScript', slug: 'typescript' });

      expect(tag.id).toHaveLength(26); // ULID
      expect(tag.name).toBe('TypeScript');
      expect(tag.slug).toBe('typescript');
      expect(tag.color).toBeNull();
      expect(tag.icon).toBeNull();
      expect(tag.description).toBeNull();
      expect(tag.createdAt).toBeInstanceOf(Date);
      expect(tag.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a tag with all fields', () => {
      const tag = createTag(db, {
        name: 'Project Alpha',
        slug: 'project-alpha',
        color: '#FF5733',
        icon: '🏷️',
        description: 'Main project tag',
      });

      expect(tag.name).toBe('Project Alpha');
      expect(tag.slug).toBe('project-alpha');
      expect(tag.color).toBe('#FF5733');
      expect(tag.icon).toBe('🏷️');
      expect(tag.description).toBe('Main project tag');
    });

    it('throws TAG_SLUG_EXISTS for duplicate slug', () => {
      createTag(db, { name: 'First', slug: 'typescript' });

      expect(() => createTag(db, { name: 'Second', slug: 'typescript' })).toThrow(TagServiceError);
      try {
        createTag(db, { name: 'Second', slug: 'typescript' });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('TAG_SLUG_EXISTS');
      }
    });
  });

  // ============================================================================
  // getTag / getTagBySlug
  // ============================================================================

  describe('getTag', () => {
    it('returns tag by id', () => {
      const created = createTag(db, { name: 'Test', slug: 'test' });
      const found = getTag(db, created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Test');
    });

    it('returns null for non-existent id', () => {
      const found = getTag(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(found).toBeNull();
    });
  });

  describe('getTagBySlug', () => {
    it('returns tag by slug', () => {
      createTag(db, { name: 'TypeScript', slug: 'typescript' });
      const found = getTagBySlug(db, 'typescript');

      expect(found).not.toBeNull();
      expect(found?.slug).toBe('typescript');
      expect(found?.name).toBe('TypeScript');
    });

    it('returns null for non-existent slug', () => {
      const found = getTagBySlug(db, 'nonexistent');

      expect(found).toBeNull();
    });
  });

  // ============================================================================
  // updateTag
  // ============================================================================

  describe('updateTag', () => {
    it('updates tag name', () => {
      const created = createTag(db, { name: 'Old Name', slug: 'test' });
      const updated = updateTag(db, created.id, { name: 'New Name' });

      expect(updated.name).toBe('New Name');
      expect(updated.slug).toBe('test'); // unchanged
    });

    it('updates tag slug', () => {
      const created = createTag(db, { name: 'Test', slug: 'old-slug' });
      const updated = updateTag(db, created.id, { slug: 'new-slug' });

      expect(updated.slug).toBe('new-slug');

      // Old slug should no longer work
      expect(getTagBySlug(db, 'old-slug')).toBeNull();
      expect(getTagBySlug(db, 'new-slug')).not.toBeNull();
    });

    it('updates tag color', () => {
      const created = createTag(db, { name: 'Test', slug: 'test' });
      const updated = updateTag(db, created.id, { color: '#FF0000' });

      expect(updated.color).toBe('#FF0000');
    });

    it('clears optional fields when set to null', () => {
      const created = createTag(db, {
        name: 'Test',
        slug: 'test',
        color: '#FF0000',
        icon: '🏷️',
        description: 'Description',
      });
      const updated = updateTag(db, created.id, {
        color: null,
        icon: null,
        description: null,
      });

      expect(updated.color).toBeNull();
      expect(updated.icon).toBeNull();
      expect(updated.description).toBeNull();
    });

    it('throws TAG_NOT_FOUND for non-existent tag', () => {
      expect(() => updateTag(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV', { name: 'New' })).toThrow(
        TagServiceError
      );
      try {
        updateTag(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV', { name: 'New' });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('TAG_NOT_FOUND');
      }
    });

    it('throws TAG_SLUG_EXISTS when changing to existing slug', () => {
      createTag(db, { name: 'First', slug: 'first' });
      const second = createTag(db, { name: 'Second', slug: 'second' });

      expect(() => updateTag(db, second.id, { slug: 'first' })).toThrow(TagServiceError);
      try {
        updateTag(db, second.id, { slug: 'first' });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('TAG_SLUG_EXISTS');
      }
    });

    it('updates updatedAt timestamp', () => {
      const created = createTag(db, { name: 'Test', slug: 'test' });

      // Wait a tiny bit to ensure different timestamp
      const before = created.updatedAt.getTime();

      const updated = updateTag(db, created.id, { name: 'Updated' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  // ============================================================================
  // deleteTag
  // ============================================================================

  describe('deleteTag', () => {
    it('deletes a tag with no assignments', () => {
      const created = createTag(db, { name: 'Test', slug: 'test' });

      deleteTag(db, created.id);

      expect(getTag(db, created.id)).toBeNull();
    });

    it('throws TAG_NOT_FOUND for non-existent tag', () => {
      expect(() => deleteTag(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV')).toThrow(TagServiceError);
      try {
        deleteTag(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('TAG_NOT_FOUND');
      }
    });

    it('throws TAG_IN_USE when tag is assigned to objects', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });
      const obj = createObject(db, 'Page', 'Test Page');
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      expect(() => deleteTag(db, tag.id)).toThrow(TagServiceError);
      try {
        deleteTag(db, tag.id);
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('TAG_IN_USE');
        expect((e as TagServiceError).details).toEqual({ tagId: tag.id, usageCount: 1 });
      }
    });
  });

  // ============================================================================
  // listTags
  // ============================================================================

  describe('listTags', () => {
    it('returns empty array when no tags exist', () => {
      const tags = listTags(db);

      expect(tags).toEqual([]);
    });

    it('returns all tags', () => {
      createTag(db, { name: 'Tag A', slug: 'tag-a' });
      createTag(db, { name: 'Tag B', slug: 'tag-b' });

      const tags = listTags(db);

      expect(tags).toHaveLength(2);
    });

    it('includes usage count when requested', () => {
      const tag1 = createTag(db, { name: 'Popular', slug: 'popular' });
      createTag(db, { name: 'Unused', slug: 'unused' }); // Unused tag for count testing

      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');

      assignTags(db, { objectId: obj1.id, tagIds: [tag1.id] });
      assignTags(db, { objectId: obj2.id, tagIds: [tag1.id] });

      const tags = listTags(db, { includeUsageCount: true });

      expect(tags).toHaveLength(2);
      const popular = tags.find((t) => t.slug === 'popular');
      const unused = tags.find((t) => t.slug === 'unused');

      expect(popular?.usageCount).toBe(2);
      expect(unused?.usageCount).toBe(0);
    });

    it('sorts by name ascending by default', () => {
      createTag(db, { name: 'Zebra', slug: 'zebra' });
      createTag(db, { name: 'Alpha', slug: 'alpha' });
      createTag(db, { name: 'Beta', slug: 'beta' });

      const tags = listTags(db);

      expect(tags[0]?.name).toBe('Alpha');
      expect(tags[1]?.name).toBe('Beta');
      expect(tags[2]?.name).toBe('Zebra');
    });

    it('sorts by usageCount descending when requested', () => {
      const tag1 = createTag(db, { name: 'Rare', slug: 'rare' });
      const tag2 = createTag(db, { name: 'Popular', slug: 'popular' });
      createTag(db, { name: 'Unused', slug: 'unused' }); // Unused tag for sorting test

      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');
      const obj3 = createObject(db, 'Page', 'Page 3');

      assignTags(db, { objectId: obj1.id, tagIds: [tag2.id] });
      assignTags(db, { objectId: obj2.id, tagIds: [tag2.id] });
      assignTags(db, { objectId: obj3.id, tagIds: [tag2.id] });
      assignTags(db, { objectId: obj1.id, tagIds: [tag1.id] });

      const tags = listTags(db, {
        includeUsageCount: true,
        sortBy: 'usageCount',
        sortOrder: 'desc',
      });

      expect(tags[0]?.name).toBe('Popular');
      expect(tags[0]?.usageCount).toBe(3);
      expect(tags[1]?.name).toBe('Rare');
      expect(tags[1]?.usageCount).toBe(1);
      expect(tags[2]?.name).toBe('Unused');
      expect(tags[2]?.usageCount).toBe(0);
    });
  });

  // ============================================================================
  // assignTags / removeTags
  // ============================================================================

  describe('assignTags', () => {
    it('assigns tags to an object', () => {
      const tag1 = createTag(db, { name: 'Tag 1', slug: 'tag-1' });
      const tag2 = createTag(db, { name: 'Tag 2', slug: 'tag-2' });
      const obj = createObject(db, 'Page', 'Test Page');

      const result = assignTags(db, { objectId: obj.id, tagIds: [tag1.id, tag2.id] });

      expect(result.objectId).toBe(obj.id);
      expect(result.assignedTagIds).toContain(tag1.id);
      expect(result.assignedTagIds).toContain(tag2.id);
      expect(result.skippedTagIds).toEqual([]);
    });

    it('is idempotent - skips already assigned tags', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });
      const obj = createObject(db, 'Page', 'Test Page');

      // First assignment
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      // Second assignment should skip
      const result = assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      expect(result.assignedTagIds).toEqual([]);
      expect(result.skippedTagIds).toContain(tag.id);
    });

    it('throws NOT_FOUND_OBJECT for non-existent object', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });

      expect(() =>
        assignTags(db, { objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV', tagIds: [tag.id] })
      ).toThrow(TagServiceError);
      try {
        assignTags(db, { objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV', tagIds: [tag.id] });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('NOT_FOUND_OBJECT');
      }
    });

    it('throws NOT_FOUND_TAG for non-existent tag', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      expect(() =>
        assignTags(db, { objectId: obj.id, tagIds: ['01ARZ3NDEKTSV4RRFFQ69G5FAV'] })
      ).toThrow(TagServiceError);
      try {
        assignTags(db, { objectId: obj.id, tagIds: ['01ARZ3NDEKTSV4RRFFQ69G5FAV'] });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TagServiceError);
        expect((e as TagServiceError).code).toBe('NOT_FOUND_TAG');
      }
    });
  });

  describe('removeTags', () => {
    it('removes tags from an object', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });
      const obj = createObject(db, 'Page', 'Test Page');
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const result = removeTags(db, { objectId: obj.id, tagIds: [tag.id] });

      expect(result.objectId).toBe(obj.id);
      expect(result.removedTagIds).toContain(tag.id);
      expect(result.skippedTagIds).toEqual([]);
    });

    it('is idempotent - skips unassigned tags', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });
      const obj = createObject(db, 'Page', 'Test Page');

      // Tag was never assigned
      const result = removeTags(db, { objectId: obj.id, tagIds: [tag.id] });

      expect(result.removedTagIds).toEqual([]);
      expect(result.skippedTagIds).toContain(tag.id);
    });

    it('throws NOT_FOUND_OBJECT for non-existent object', () => {
      const tag = createTag(db, { name: 'Test', slug: 'test' });

      expect(() =>
        removeTags(db, { objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV', tagIds: [tag.id] })
      ).toThrow(TagServiceError);
    });
  });

  // ============================================================================
  // getObjectTags
  // ============================================================================

  describe('getObjectTags', () => {
    it('returns empty array for object with no tags', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      const tags = getObjectTags(db, obj.id);

      expect(tags).toEqual([]);
    });

    it('returns assigned tags', () => {
      const tag1 = createTag(db, { name: 'Tag 1', slug: 'tag-1' });
      const tag2 = createTag(db, { name: 'Tag 2', slug: 'tag-2' });
      const obj = createObject(db, 'Page', 'Test Page');

      assignTags(db, { objectId: obj.id, tagIds: [tag1.id, tag2.id] });

      const tags = getObjectTags(db, obj.id);

      expect(tags).toHaveLength(2);
      expect(tags.map((t) => t.slug).sort()).toEqual(['tag-1', 'tag-2']);
    });

    it('returns full tag details', () => {
      const tag = createTag(db, {
        name: 'Test',
        slug: 'test',
        color: '#FF0000',
        icon: '🏷️',
        description: 'A test tag',
      });
      const obj = createObject(db, 'Page', 'Test Page');
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const tags = getObjectTags(db, obj.id);

      expect(tags).toHaveLength(1);
      expect(tags[0]?.name).toBe('Test');
      expect(tags[0]?.color).toBe('#FF0000');
      expect(tags[0]?.icon).toBe('🏷️');
      expect(tags[0]?.description).toBe('A test tag');
    });

    it('returns empty array for non-existent object', () => {
      const tags = getObjectTags(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(tags).toEqual([]);
    });
  });

  // ============================================================================
  // findOrCreateTag
  // ============================================================================

  describe('findOrCreateTag', () => {
    it('returns existing tag if slug exists', () => {
      const existing = createTag(db, { name: 'TypeScript', slug: 'typescript' });

      const found = findOrCreateTag(db, 'typescript');

      expect(found.id).toBe(existing.id);
      expect(found.name).toBe('TypeScript');
    });

    it('creates new tag if slug does not exist', () => {
      const created = findOrCreateTag(db, 'new-tag', { name: 'New Tag' });

      expect(created.id).toHaveLength(26);
      expect(created.slug).toBe('new-tag');
      expect(created.name).toBe('New Tag');
    });

    it('uses slug as name if name not provided', () => {
      const created = findOrCreateTag(db, 'my-tag');

      expect(created.name).toBe('my-tag');
    });

    it('creates tag with additional options', () => {
      const created = findOrCreateTag(db, 'project', {
        name: 'Project',
        color: '#FF5733',
        icon: '📁',
      });

      expect(created.color).toBe('#FF5733');
      expect(created.icon).toBe('📁');
    });
  });
});
