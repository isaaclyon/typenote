import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Tags Workflow', () => {
  test.describe('Tag CRUD Operations', () => {
    test('createTag creates a new tag with required fields', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Project Alpha',
          slug: 'project-alpha',
        });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.id).toMatch(/^[0-9A-Z]{26}$/); // ULID format
        expect(result.result.name).toBe('Project Alpha');
        expect(result.result.slug).toBe('project-alpha');
        expect(result.result.color).toBeNull();
        expect(result.result.icon).toBeNull();
        expect(result.result.description).toBeNull();
      }
    });

    test('createTag creates a tag with all optional fields', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Important',
          slug: 'important',
          color: '#FF5733',
          icon: 'star',
          description: 'High priority items',
        });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.name).toBe('Important');
        expect(result.result.slug).toBe('important');
        expect(result.result.color).toBe('#FF5733');
        expect(result.result.icon).toBe('star');
        expect(result.result.description).toBe('High priority items');
      }
    });

    test('createTag fails with duplicate slug', async ({ window: page }) => {
      // Create first tag
      await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Original',
          slug: 'duplicate-test',
        });
      });

      // Try to create another with same slug
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Different Name',
          slug: 'duplicate-test',
        });
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TAG_SLUG_EXISTS');
      }
    });

    test('getTag retrieves an existing tag', async ({ window: page }) => {
      // Create a tag first
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Retrievable Tag',
          slug: 'retrievable-tag',
        });
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const tagId = createResult.result.id;

      // Get the tag
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getTag(id);
      }, tagId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).not.toBeNull();
        expect(result.result?.id).toBe(tagId);
        expect(result.result?.name).toBe('Retrievable Tag');
        expect(result.result?.slug).toBe('retrievable-tag');
      }
    });

    test('getTag returns null for non-existent tag', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getTag('01NONEXISTENT00000000000');
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeNull();
      }
    });

    test('updateTag updates tag name', async ({ window: page }) => {
      // Create a tag
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Original Name',
          slug: 'update-name-test',
        });
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const tagId = createResult.result.id;

      // Update the name
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.updateTag(id, { name: 'Updated Name' });
      }, tagId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.id).toBe(tagId);
        expect(result.result.name).toBe('Updated Name');
        expect(result.result.slug).toBe('update-name-test'); // Unchanged
      }
    });

    test('updateTag updates multiple fields', async ({ window: page }) => {
      // Create a tag
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'Multi Update',
          slug: 'multi-update-test',
        });
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const tagId = createResult.result.id;

      // Update multiple fields
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.updateTag(id, {
          name: 'New Multi Name',
          color: '#00FF00',
          icon: 'folder',
          description: 'Updated description',
        });
      }, tagId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.name).toBe('New Multi Name');
        expect(result.result.color).toBe('#00FF00');
        expect(result.result.icon).toBe('folder');
        expect(result.result.description).toBe('Updated description');
      }
    });

    test('updateTag fails for non-existent tag', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.updateTag('01NONEXISTENT00000000000', {
          name: 'New Name',
        });
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TAG_NOT_FOUND');
      }
    });

    test('updateTag fails with duplicate slug', async ({ window: page }) => {
      // Create two tags
      await page.evaluate(async () => {
        await window.typenoteAPI.createTag({
          name: 'First Tag',
          slug: 'first-slug',
        });
        return await window.typenoteAPI.createTag({
          name: 'Second Tag',
          slug: 'second-slug',
        });
      });

      // Try to update second tag with first tag's slug
      const result = await page.evaluate(async () => {
        // Get the second tag's ID
        const listResult = await window.typenoteAPI.listTags();
        if (!listResult.success) return listResult;
        const secondTag = listResult.result.find((t) => t.slug === 'second-slug');
        if (!secondTag)
          return { success: false, error: { code: 'TEST_ERROR', message: 'Tag not found' } };

        return await window.typenoteAPI.updateTag(secondTag.id, { slug: 'first-slug' });
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TAG_SLUG_EXISTS');
      }
    });

    test('deleteTag removes a tag', async ({ window: page }) => {
      // Create a tag
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createTag({
          name: 'To Delete',
          slug: 'to-delete',
        });
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const tagId = createResult.result.id;

      // Delete it
      const deleteResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.deleteTag(id);
      }, tagId);

      expect(deleteResult.success).toBe(true);

      // Verify it's gone
      const getResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getTag(id);
      }, tagId);

      expect(getResult.success).toBe(true);
      if (getResult.success) {
        expect(getResult.result).toBeNull();
      }
    });

    test('deleteTag fails for non-existent tag', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.deleteTag('01NONEXISTENT00000000000');
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TAG_NOT_FOUND');
      }
    });
  });

  test.describe('List Tags Operations', () => {
    test('listTags returns empty array initially', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listTags();
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect(result.result.length).toBe(0);
      }
    });

    test('listTags returns all created tags', async ({ window: page }) => {
      // Create multiple tags
      await page.evaluate(async () => {
        await window.typenoteAPI.createTag({ name: 'Alpha', slug: 'alpha' });
        await window.typenoteAPI.createTag({ name: 'Beta', slug: 'beta' });
        await window.typenoteAPI.createTag({ name: 'Gamma', slug: 'gamma' });
      });

      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listTags();
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(3);
        const slugs = result.result.map((t) => t.slug);
        expect(slugs).toContain('alpha');
        expect(slugs).toContain('beta');
        expect(slugs).toContain('gamma');
      }
    });

    test('listTags includes usage count when requested', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create a tag
        await window.typenoteAPI.createTag({ name: 'Counted', slug: 'counted' });

        return await window.typenoteAPI.listTags({ includeUsageCount: true });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(1);
        expect(result.result[0]).toHaveProperty('usageCount');
        expect(result.result[0]?.usageCount).toBe(0);
      }
    });

    test('listTags sorts by name ascending by default', async ({ window: page }) => {
      await page.evaluate(async () => {
        await window.typenoteAPI.createTag({ name: 'Zebra', slug: 'zebra' });
        await window.typenoteAPI.createTag({ name: 'Apple', slug: 'apple' });
        await window.typenoteAPI.createTag({ name: 'Mango', slug: 'mango' });
      });

      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listTags({ sortBy: 'name', sortOrder: 'asc' });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(3);
        expect(result.result[0]?.name).toBe('Apple');
        expect(result.result[1]?.name).toBe('Mango');
        expect(result.result[2]?.name).toBe('Zebra');
      }
    });

    test('listTags sorts by name descending', async ({ window: page }) => {
      await page.evaluate(async () => {
        await window.typenoteAPI.createTag({ name: 'Zebra', slug: 'zebra-desc' });
        await window.typenoteAPI.createTag({ name: 'Apple', slug: 'apple-desc' });
        await window.typenoteAPI.createTag({ name: 'Mango', slug: 'mango-desc' });
      });

      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listTags({ sortBy: 'name', sortOrder: 'desc' });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(3);
        expect(result.result[0]?.name).toBe('Zebra');
        expect(result.result[1]?.name).toBe('Mango');
        expect(result.result[2]?.name).toBe('Apple');
      }
    });
  });

  test.describe('Tag Assignment Operations', () => {
    test('assignTags assigns a tag to an object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create an object
        const objResult = await window.typenoteAPI.createObject('Page', 'Test Page', {});
        if (!objResult.success) return objResult;
        const objectId = objResult.result.id;

        // Create a tag
        const tagResult = await window.typenoteAPI.createTag({
          name: 'Assigned Tag',
          slug: 'assigned-tag',
        });
        if (!tagResult.success) return tagResult;
        const tagId = tagResult.result.id;

        // Assign tag to object
        return await window.typenoteAPI.assignTags(objectId, [tagId]);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.assignedTagIds.length).toBe(1);
        expect(result.result.skippedTagIds.length).toBe(0);
      }
    });

    test('assignTags assigns multiple tags to an object', async ({ window: page }) => {
      // Create an object
      const objResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Tag Page', {});
      });
      expect(objResult.success).toBe(true);
      if (!objResult.success) return;
      const objectId = objResult.result.id;

      // Create multiple tags
      const tagsResult = await page.evaluate(async () => {
        const tag1Result = await window.typenoteAPI.createTag({ name: 'Tag One', slug: 'tag-one' });
        const tag2Result = await window.typenoteAPI.createTag({ name: 'Tag Two', slug: 'tag-two' });
        const tag3Result = await window.typenoteAPI.createTag({
          name: 'Tag Three',
          slug: 'tag-three',
        });

        if (!tag1Result.success || !tag2Result.success || !tag3Result.success) {
          return { success: false as const, ids: [] as string[] };
        }

        return {
          success: true as const,
          ids: [tag1Result.result.id, tag2Result.result.id, tag3Result.result.id],
        };
      });
      expect(tagsResult.success).toBe(true);
      if (!tagsResult.success) return;

      const result = await page.evaluate(
        async ({ objectId, tagIds }) => {
          return await window.typenoteAPI.assignTags(objectId, tagIds);
        },
        { objectId, tagIds: tagsResult.ids }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.assignedTagIds.length).toBe(3);
        expect(result.result.skippedTagIds.length).toBe(0);
      }
    });

    test('assignTags is idempotent - skips already assigned tags', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create an object
        const objResult = await window.typenoteAPI.createObject('Page', 'Idempotent Page', {});
        if (!objResult.success) return objResult;
        const objectId = objResult.result.id;

        // Create a tag
        const tagResult = await window.typenoteAPI.createTag({
          name: 'Idempotent Tag',
          slug: 'idempotent-tag',
        });
        if (!tagResult.success) return tagResult;
        const tagId = tagResult.result.id;

        // Assign tag first time
        await window.typenoteAPI.assignTags(objectId, [tagId]);

        // Assign same tag again
        return await window.typenoteAPI.assignTags(objectId, [tagId]);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.assignedTagIds.length).toBe(0);
        expect(result.result.skippedTagIds.length).toBe(1);
      }
    });

    test('assignTags fails for non-existent object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create a tag
        const tagResult = await window.typenoteAPI.createTag({
          name: 'Orphan Tag',
          slug: 'orphan-tag',
        });
        if (!tagResult.success) return tagResult;

        return await window.typenoteAPI.assignTags('01NONEXISTENT00000000000', [
          tagResult.result.id,
        ]);
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });

    test('assignTags fails for non-existent tag', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create an object
        const objResult = await window.typenoteAPI.createObject('Page', 'No Tag Page', {});
        if (!objResult.success) return objResult;

        return await window.typenoteAPI.assignTags(objResult.result.id, [
          '01NONEXISTENT00000000000',
        ]);
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_TAG');
      }
    });
  });

  test.describe('Tag Removal Operations', () => {
    test('removeTags removes a tag from an object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create object and tag
        const objResult = await window.typenoteAPI.createObject('Page', 'Remove Test Page', {});
        if (!objResult.success) return objResult;
        const objectId = objResult.result.id;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'Removable Tag',
          slug: 'removable-tag',
        });
        if (!tagResult.success) return tagResult;
        const tagId = tagResult.result.id;

        // Assign then remove
        await window.typenoteAPI.assignTags(objectId, [tagId]);
        return await window.typenoteAPI.removeTags(objectId, [tagId]);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.removedTagIds.length).toBe(1);
        expect(result.result.skippedTagIds.length).toBe(0);
      }
    });

    test('removeTags is idempotent - skips unassigned tags', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create object and tag
        const objResult = await window.typenoteAPI.createObject('Page', 'Skip Remove Page', {});
        if (!objResult.success) return objResult;
        const objectId = objResult.result.id;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'Never Assigned',
          slug: 'never-assigned',
        });
        if (!tagResult.success) return tagResult;
        const tagId = tagResult.result.id;

        // Try to remove a tag that was never assigned
        return await window.typenoteAPI.removeTags(objectId, [tagId]);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.removedTagIds.length).toBe(0);
        expect(result.result.skippedTagIds.length).toBe(1);
      }
    });

    test('removeTags fails for non-existent object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        const tagResult = await window.typenoteAPI.createTag({
          name: 'Remove Orphan',
          slug: 'remove-orphan',
        });
        if (!tagResult.success) return tagResult;

        return await window.typenoteAPI.removeTags('01NONEXISTENT00000000000', [
          tagResult.result.id,
        ]);
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });
  });

  test.describe('Get Object Tags', () => {
    test('getObjectTags returns empty array for object with no tags', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        const objResult = await window.typenoteAPI.createObject('Page', 'No Tags Page', {});
        if (!objResult.success) return objResult;

        return await window.typenoteAPI.getObjectTags(objResult.result.id);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect(result.result.length).toBe(0);
      }
    });

    test('getObjectTags returns assigned tags', async ({ window: page }) => {
      // Setup: Create object and tags
      const setup = await page.evaluate(async () => {
        const objResult = await window.typenoteAPI.createObject('Page', 'Tagged Page', {});
        if (!objResult.success) return { success: false as const };

        const tag1Result = await window.typenoteAPI.createTag({
          name: 'Object Tag 1',
          slug: 'object-tag-1',
        });
        const tag2Result = await window.typenoteAPI.createTag({
          name: 'Object Tag 2',
          slug: 'object-tag-2',
        });

        if (!tag1Result.success || !tag2Result.success) {
          return { success: false as const };
        }

        await window.typenoteAPI.assignTags(objResult.result.id, [
          tag1Result.result.id,
          tag2Result.result.id,
        ]);

        return { success: true as const, objectId: objResult.result.id };
      });

      expect(setup.success).toBe(true);
      if (!setup.success) return;

      const result = await page.evaluate(async (objectId) => {
        return await window.typenoteAPI.getObjectTags(objectId);
      }, setup.objectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(2);
        const slugs = result.result.map((t: { slug: string }) => t.slug);
        expect(slugs).toContain('object-tag-1');
        expect(slugs).toContain('object-tag-2');
      }
    });

    test('getObjectTags returns empty for non-existent object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getObjectTags('01NONEXISTENT00000000000');
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(0);
      }
    });
  });

  test.describe('Tag Data Integrity', () => {
    test('tag assignment persists and can be verified via getObjectTags', async ({
      window: page,
    }) => {
      const result = await page.evaluate(async () => {
        // Create object and tag
        const objResult = await window.typenoteAPI.createObject('Page', 'Persist Page', {});
        if (!objResult.success) return { ...objResult, step: 'createObject' };
        const objectId = objResult.result.id;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'Persistent Tag',
          slug: 'persistent-tag',
        });
        if (!tagResult.success) return { ...tagResult, step: 'createTag' };
        const tagId = tagResult.result.id;

        // Assign tag
        const assignResult = await window.typenoteAPI.assignTags(objectId, [tagId]);
        if (!assignResult.success) return { ...assignResult, step: 'assignTags' };

        // Verify via getObjectTags
        const tagsResult = await window.typenoteAPI.getObjectTags(objectId);

        return {
          success: tagsResult.success,
          result: tagsResult.success
            ? {
                tagId,
                objectId,
                foundTags: tagsResult.result,
              }
            : undefined,
          error: tagsResult.success ? undefined : tagsResult.error,
        };
      });

      expect(result.success).toBe(true);
      if (result.success && result.result) {
        expect(result.result.foundTags.length).toBe(1);
        expect(result.result.foundTags[0]?.id).toBe(result.result.tagId);
      }
    });

    test('tag removal is reflected in getObjectTags', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Setup
        const objResult = await window.typenoteAPI.createObject('Page', 'Remove Persist Page', {});
        if (!objResult.success) return objResult;
        const objectId = objResult.result.id;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'Will Remove',
          slug: 'will-remove',
        });
        if (!tagResult.success) return tagResult;
        const tagId = tagResult.result.id;

        // Assign, then remove
        await window.typenoteAPI.assignTags(objectId, [tagId]);
        await window.typenoteAPI.removeTags(objectId, [tagId]);

        // Verify tag is no longer on object
        return await window.typenoteAPI.getObjectTags(objectId);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(0);
      }
    });

    test('deleting tag that is assigned to object fails with TAG_IN_USE', async ({
      window: page,
    }) => {
      const result = await page.evaluate(async () => {
        // Create object and tag
        const objResult = await window.typenoteAPI.createObject('Page', 'Block Delete Page', {});
        if (!objResult.success) return objResult;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'In Use Tag',
          slug: 'in-use-tag',
        });
        if (!tagResult.success) return tagResult;

        // Assign tag to object
        await window.typenoteAPI.assignTags(objResult.result.id, [tagResult.result.id]);

        // Try to delete the tag (should fail)
        return await window.typenoteAPI.deleteTag(tagResult.result.id);
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('TAG_IN_USE');
      }
    });

    test('tag can be deleted after removing from all objects', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Create object and tag
        const objResult = await window.typenoteAPI.createObject('Page', 'Allow Delete Page', {});
        if (!objResult.success) return { ...objResult, step: 'createObject' };
        const objectId = objResult.result.id;

        const tagResult = await window.typenoteAPI.createTag({
          name: 'Deletable Tag',
          slug: 'deletable-tag',
        });
        if (!tagResult.success) return { ...tagResult, step: 'createTag' };
        const tagId = tagResult.result.id;

        // Assign then remove
        await window.typenoteAPI.assignTags(objectId, [tagId]);
        await window.typenoteAPI.removeTags(objectId, [tagId]);

        // Now delete should succeed
        const deleteResult = await window.typenoteAPI.deleteTag(tagId);
        if (!deleteResult.success) return { ...deleteResult, step: 'deleteTag' };

        // Verify it's gone
        return await window.typenoteAPI.getTag(tagId);
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).toBeNull();
      }
    });

    test('usage count reflects tag assignments', async ({ window: page }) => {
      // Setup: Create tag, objects, and assignments
      const setup = await page.evaluate(async () => {
        const tagResult = await window.typenoteAPI.createTag({
          name: 'Usage Count Tag',
          slug: 'usage-count-tag',
        });
        if (!tagResult.success) return { success: false as const };
        const tagId = tagResult.result.id;

        const obj1 = await window.typenoteAPI.createObject('Page', 'Usage Page 1', {});
        const obj2 = await window.typenoteAPI.createObject('Page', 'Usage Page 2', {});
        const obj3 = await window.typenoteAPI.createObject('Page', 'Usage Page 3', {});

        if (!obj1.success || !obj2.success || !obj3.success) {
          return { success: false as const };
        }

        await window.typenoteAPI.assignTags(obj1.result.id, [tagId]);
        await window.typenoteAPI.assignTags(obj2.result.id, [tagId]);
        await window.typenoteAPI.assignTags(obj3.result.id, [tagId]);

        return { success: true as const };
      });

      expect(setup.success).toBe(true);
      if (!setup.success) return;

      // Now check usage count
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listTags({ includeUsageCount: true });
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const tag = result.result.find((t: { slug: string }) => t.slug === 'usage-count-tag');
        expect(tag).toBeDefined();
        expect(tag?.usageCount).toBe(3);
      }
    });
  });
});
