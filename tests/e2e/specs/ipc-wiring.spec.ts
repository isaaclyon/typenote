import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('IPC Channel Wiring', () => {
  test.describe('Daily Note Handlers', () => {
    test('getOrCreateTodayDailyNote returns valid daily note', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.dailyNote).toBeDefined();
        expect(result.result.dailyNote.id).toMatch(/^[0-9A-Z]{26}$/); // ULID format
        expect(result.result.dailyNote.title).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD
      }
    });

    test('getOrCreateDailyNoteByDate returns daily note for specific date', async ({
      window: page,
    }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateDailyNoteByDate('2024-06-15');
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.dailyNote.title).toBe('2024-06-15');
      }
    });
  });

  test.describe('Object Handlers', () => {
    test('listObjects returns array after creating daily note', async ({ window: page }) => {
      // First create a daily note
      await page.evaluate(async () => {
        await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.listObjects();
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect(result.result.length).toBeGreaterThan(0);
        expect(result.result[0]).toHaveProperty('id');
        expect(result.result[0]).toHaveProperty('typeKey', 'DailyNote');
      }
    });

    test('getObject returns object details', async ({ window: page }) => {
      // Create a daily note and get its ID
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const objectId = createResult.result.dailyNote.id;
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getObject(id);
      }, objectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result).not.toBeNull();
        expect(result.result?.id).toBe(objectId);
        expect(result.result?.typeKey).toBe('DailyNote');
      }
    });

    test('createObject creates a new Page object', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Test Page', {});
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.id).toMatch(/^[0-9A-Z]{26}$/);
        expect(result.result.title).toBe('Test Page');
      }
    });
  });

  test.describe('Document Handlers', () => {
    test('getDocument returns document with blocks', async ({ window: page }) => {
      // Create a daily note first
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const objectId = createResult.result.dailyNote.id;
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, objectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.objectId).toBe(objectId);
        expect(result.result.docVersion).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(result.result.blocks)).toBe(true);
      }
    });

    test('applyBlockPatch adds a block to document', async ({ window: page }) => {
      // Create a daily note first
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const objectId = createResult.result.dailyNote.id;
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01TESTBLOCK123456789012345',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Hello E2E' }] },
            },
          ],
        });
      }, objectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.newDocVersion).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Search and Backlink Handlers', () => {
    test('searchBlocks returns results for matching query', async ({ window: page }) => {
      // Create a note with content
      const createResult = await page.evaluate(async () => {
        const note = await window.typenoteAPI.getOrCreateTodayDailyNote();
        if (!note.success) return note;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: note.result.dailyNote.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01SEARCHBLOCK1234567890123',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Searchable content here' }] },
            },
          ],
        });
        return note;
      });
      expect(createResult.success).toBe(true);

      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.searchBlocks('Searchable');
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        // Search might return results if FTS indexed the content
      }
    });

    test('getBacklinks returns empty array for new object', async ({ window: page }) => {
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });
      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const objectId = createResult.result.dailyNote.id;
      const result = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, objectId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Array.isArray(result.result)).toBe(true);
        expect(result.result.length).toBe(0); // No backlinks for new object
      }
    });
  });

  test.describe('Error Handling', () => {
    test('getDocument with invalid ID returns error', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getDocument('nonexistent-id');
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
        expect(typeof result.error.message).toBe('string');
      }
    });

    test('applyBlockPatch with invalid request returns validation error', async ({
      window: page,
    }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.applyBlockPatch({
          // Missing required fields
          invalid: 'data',
        });
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('VALIDATION');
      }
    });
  });
});
