import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Template Auto-Application', () => {
  test.describe('DailyNote Templates', () => {
    test('new DailyNote has template content with date_key substituted', async ({
      window: page,
    }) => {
      // Create a daily note for today
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const objectId = result.result.dailyNote.id;

      // Get the document to verify template was applied
      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, objectId);

      expect(docResult.success).toBe(true);
      if (!docResult.success) return;

      // Template should have created blocks
      expect(docResult.result.blocks.length).toBeGreaterThan(0);

      // Doc version should be > 0 (template was applied)
      expect(docResult.result.docVersion).toBeGreaterThan(0);
    });

    test('DailyNote heading contains today date after template substitution', async ({
      window: page,
    }) => {
      // Click the "Today's Note" button to create a new DailyNote
      await page.getByTestId('create-daily-note-button').click();

      // Wait for editor to load
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().slice(0, 10);

      // The template creates a heading with the date ({{date_key}} substituted)
      // Note: h1 is hidden via hide-title CSS for DailyNotes, but content still exists
      const heading = page.locator('.ProseMirror h1');
      await expect(heading).toContainText(today);
    });

    test('DailyNote for specific date has correct date in heading', async ({ window: page }) => {
      const specificDate = '2024-07-15';

      // Create a daily note for a specific date
      const result = await page.evaluate(async (dateKey) => {
        return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
      }, specificDate);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const dailyNoteId = result.result.dailyNote.id;

      // Reload and navigate via TypeBrowser
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Navigate to DailyNote type via sidebar and click the specific note
      await page.getByTestId('sidebar-type-DailyNote').click();
      await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // The heading should contain the specific date
      const heading = page.locator('.ProseMirror h1');
      await expect(heading).toContainText(specificDate);
    });

    test('DailyNote template creates heading and paragraph blocks', async ({ window: page }) => {
      // Create a daily note
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const objectId = result.result.dailyNote.id;

      // Get the document to check block structure
      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, objectId);

      expect(docResult.success).toBe(true);
      if (!docResult.success) return;

      // Default DailyNote template has: heading + paragraph
      expect(docResult.result.blocks.length).toBe(2);

      // First block should be a heading
      const firstBlock = docResult.result.blocks[0];
      expect(firstBlock?.blockType).toBe('heading');

      // Second block should be a paragraph
      const secondBlock = docResult.result.blocks[1];
      expect(secondBlock?.blockType).toBe('paragraph');
    });

    test('calling getOrCreateTodayDailyNote twice returns same note', async ({ window: page }) => {
      // Create first daily note
      const result1 = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      expect(result1.success).toBe(true);
      if (!result1.success) return;

      // Create second daily note (should return existing)
      const result2 = await page.evaluate(async () => {
        return await window.typenoteAPI.getOrCreateTodayDailyNote();
      });

      expect(result2.success).toBe(true);
      if (!result2.success) return;

      // Should return the same note
      expect(result2.result.dailyNote.id).toBe(result1.result.dailyNote.id);

      // Second call should NOT create a new note
      expect(result2.result.created).toBe(false);
    });
  });

  test.describe('Page Templates', () => {
    test('new Page object has empty document when no default template exists', async ({
      window: page,
    }) => {
      // Create a Page object
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Test Page Without Template', {});
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const objectId = result.result.id;

      // Get the document
      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, objectId);

      expect(docResult.success).toBe(true);
      if (!docResult.success) return;

      // Page type has no default template in seed data, so doc should be empty
      expect(docResult.result.blocks.length).toBe(0);
      expect(docResult.result.docVersion).toBe(0);
    });

    test('Page document is initially empty but can have blocks added', async ({ window: page }) => {
      // Create a Page object
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Page For Editing', {});
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const objectId = createResult.result.id;

      // Add a block to the document
      const patchResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01TEMPLATETEST123456789012',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Added content' }] },
            },
          ],
        });
      }, objectId);

      expect(patchResult.success).toBe(true);
      if (!patchResult.success) return;

      // Now doc should have one block
      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, objectId);

      expect(docResult.success).toBe(true);
      if (docResult.success) {
        expect(docResult.result.blocks.length).toBe(1);
        expect(docResult.result.docVersion).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Other Object Type Templates', () => {
    test('Person object has empty document (no default template)', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Person', 'John Doe', {});
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, result.result.id);

      expect(docResult.success).toBe(true);
      if (docResult.success) {
        expect(docResult.result.blocks.length).toBe(0);
      }
    });

    test('Event object has empty document (no default template)', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Event', 'Team Meeting', {});
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, result.result.id);

      expect(docResult.success).toBe(true);
      if (docResult.success) {
        expect(docResult.result.blocks.length).toBe(0);
      }
    });

    test('Place object has empty document (no default template)', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Place', 'Conference Room', {});
      });

      expect(result.success).toBe(true);
      if (!result.success) return;

      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, result.result.id);

      expect(docResult.success).toBe(true);
      if (docResult.success) {
        expect(docResult.result.blocks.length).toBe(0);
      }
    });
  });
});

test.describe('Variable Substitution', () => {
  test('{{date_key}} placeholder is replaced with actual date', async ({ window: page }) => {
    const testDate = '2024-12-25';

    // Create a DailyNote for a specific date
    const result = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, testDate);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.dailyNote.id;

    // Get the document
    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(docResult.success).toBe(true);
    if (!docResult.success) return;

    // Find the heading block and check content
    const headingBlock = docResult.result.blocks.find((b) => b.blockType === 'heading');
    expect(headingBlock).toBeDefined();

    // The content should contain the substituted date
    const content = JSON.stringify(headingBlock?.content);
    expect(content).toContain(testDate);
    expect(content).not.toContain('{{date_key}}');
  });

  test('substitution works for multiple DailyNotes with different dates', async ({
    window: page,
  }) => {
    const dates = ['2024-01-01', '2024-06-15', '2024-12-31'];

    for (const testDate of dates) {
      const result = await page.evaluate(async (dateKey) => {
        return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
      }, testDate);

      expect(result.success).toBe(true);
      if (!result.success) continue;

      const docResult = await page.evaluate(async (id) => {
        return await window.typenoteAPI.getDocument(id);
      }, result.result.dailyNote.id);

      expect(docResult.success).toBe(true);
      if (!docResult.success) continue;

      // Each DailyNote should have its own date in the heading
      const headingBlock = docResult.result.blocks.find((b) => b.blockType === 'heading');
      const content = JSON.stringify(headingBlock?.content);
      expect(content).toContain(testDate);
    }
  });

  test('raw placeholder syntax is not visible in editor', async ({ window: page }) => {
    // Create a daily note
    await page.getByTestId('create-daily-note-button').click();

    // Wait for editor to load
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // The editor should NOT show the raw placeholder
    const editor = page.locator('.ProseMirror');
    await expect(editor).not.toContainText('{{date_key}}');
    await expect(editor).not.toContainText('{{');
    await expect(editor).not.toContainText('}}');
  });
});

test.describe('Template Persistence', () => {
  test('template content persists after page reload', async ({ window: page }) => {
    // Create a daily note
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.dailyNote.id;

    // Get initial document
    const doc1 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(doc1.success).toBe(true);
    if (!doc1.success) return;

    const initialBlockCount = doc1.result.blocks.length;
    const initialVersion = doc1.result.docVersion;

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Get document again after reload
    const doc2 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(doc2.success).toBe(true);
    if (!doc2.success) return;

    // Block count and version should be the same
    expect(doc2.result.blocks.length).toBe(initialBlockCount);
    expect(doc2.result.docVersion).toBe(initialVersion);
  });

  test('template blocks are visible in editor after reload', async ({ window: page }) => {
    // Create a daily note via button
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Get today's date
    const today = new Date().toISOString().slice(0, 10);

    // Verify heading is visible
    const heading = page.locator('.ProseMirror h1');
    await expect(heading).toContainText(today);

    // Get the daily note ID via IPC (it exists now)
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    const dailyNoteId = result.result.dailyNote.id;

    // Reload and navigate via TypeBrowser
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to DailyNote type and select the note
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Heading should still be visible with the date
    const headingAfterReload = page.locator('.ProseMirror h1');
    await expect(headingAfterReload).toContainText(today);
  });

  test('adding content to templated document persists correctly', async ({ window: page }) => {
    // Create a daily note
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.dailyNote.id;

    // Add a new block to the document
    const patchResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01PERSISTTEST1234567890123',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Added after template' }] },
          },
        ],
      });
    }, objectId);

    expect(patchResult.success).toBe(true);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Get document after reload
    const doc = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(doc.success).toBe(true);
    if (!doc.success) return;

    // Should have template blocks (2) + added block (1) = 3 blocks
    expect(doc.result.blocks.length).toBe(3);
  });

  test('document version increments when modifying templated document', async ({
    window: page,
  }) => {
    // Create a daily note
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.dailyNote.id;

    // Get initial version (after template applied)
    const doc1 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(doc1.success).toBe(true);
    if (!doc1.success) return;

    const initialVersion = doc1.result.docVersion;
    expect(initialVersion).toBeGreaterThan(0); // Template was applied

    // Apply another patch
    await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01VERSIONTEST1234567890234',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Another block' }] },
          },
        ],
      });
    }, objectId);

    // Get new version
    const doc2 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(doc2.success).toBe(true);
    if (doc2.success) {
      expect(doc2.result.docVersion).toBeGreaterThan(initialVersion);
    }
  });

  test('DailyNote existence persists (not recreated on second access)', async ({
    window: page,
  }) => {
    const testDate = '2024-08-20';

    // Create DailyNote first time
    const result1 = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, testDate);

    expect(result1.success).toBe(true);
    if (!result1.success) return;

    expect(result1.result.created).toBe(true);
    const originalId = result1.result.dailyNote.id;

    // Reload the page
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Access the same date again
    const result2 = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, testDate);

    expect(result2.success).toBe(true);
    if (!result2.success) return;

    // Should return existing, not create new
    expect(result2.result.created).toBe(false);
    expect(result2.result.dailyNote.id).toBe(originalId);
  });
});

test.describe('Template Block Structure', () => {
  test('DailyNote template heading has level 1', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (!docResult.success) return;

    const headingBlock = docResult.result.blocks.find((b) => b.blockType === 'heading');
    expect(headingBlock).toBeDefined();

    // Check that heading content has level 1
    const content = headingBlock?.content as { level?: number };
    expect(content.level).toBe(1);
  });

  test('DailyNote template paragraph is empty (ready for input)', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (!docResult.success) return;

    const paragraphBlock = docResult.result.blocks.find((b) => b.blockType === 'paragraph');
    expect(paragraphBlock).toBeDefined();

    // Paragraph should have empty inline array
    const content = paragraphBlock?.content as { inline?: unknown[] };
    expect(content.inline).toBeDefined();
    expect(content.inline?.length).toBe(0);
  });

  test('template blocks are root-level (no parent)', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (!docResult.success) return;

    // All top-level template blocks should have no parent (root level)
    for (const block of docResult.result.blocks) {
      expect(block.parentBlockId).toBeNull();
    }
  });

  test('template blocks have valid IDs', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (!docResult.success) return;

    // All blocks should have valid ULID IDs
    for (const block of docResult.result.blocks) {
      expect(block.id).toMatch(/^[0-9A-Z]{26}$/); // ULID format
    }
  });
});

test.describe('Editor Integration', () => {
  test('editor displays template heading correctly', async ({ window: page }) => {
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // The heading should be rendered as h1
    // Note: h1 is hidden via hide-title CSS for DailyNotes, but element exists with content
    const heading = page.locator('.ProseMirror h1');
    await expect(heading).toHaveCount(1);

    // Verify it has today's date content
    const today = new Date().toISOString().slice(0, 10);
    await expect(heading).toContainText(today);
  });

  test('editor allows editing templated content', async ({ window: page }) => {
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Focus the editor
    const editor = page.locator('.ProseMirror');
    await editor.click();

    // Type some content
    await page.keyboard.type('Test content added');

    // Content should appear in editor
    await expect(editor).toContainText('Test content added');
  });

  test('template content and user content both visible in editor', async ({ window: page }) => {
    const testDate = '2024-11-11';

    // Create daily note for specific date
    const result = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, testDate);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Add some content via patch
    await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01EDITORTEST12345678901234',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'User added content' }] },
          },
        ],
      });
    }, result.result.dailyNote.id);

    const dailyNoteId = result.result.dailyNote.id;

    // Reload and navigate via TypeBrowser
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to DailyNote type and click the specific note
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    const editor = page.locator('.ProseMirror');

    // Template content (heading with date) should be visible
    await expect(editor).toContainText(testDate);

    // User content should also be visible
    await expect(editor).toContainText('User added content');
  });
});

test.describe('Edge Cases', () => {
  test('invalid date format returns error for DailyNote', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate('invalid-date');
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.code).toBeDefined();
    }
  });

  test('DailyNote for far future date works correctly', async ({ window: page }) => {
    const futureDate = '2099-12-31';

    const result = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, futureDate);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (docResult.success) {
      const headingBlock = docResult.result.blocks.find((b) => b.blockType === 'heading');
      const content = JSON.stringify(headingBlock?.content);
      expect(content).toContain(futureDate);
    }
  });

  test('DailyNote for past date works correctly', async ({ window: page }) => {
    const pastDate = '1999-01-01';

    const result = await page.evaluate(async (dateKey) => {
      return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
    }, pastDate);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.dailyNote.id);

    expect(docResult.success).toBe(true);
    if (docResult.success) {
      const headingBlock = docResult.result.blocks.find((b) => b.blockType === 'heading');
      const content = JSON.stringify(headingBlock?.content);
      expect(content).toContain(pastDate);
    }
  });

  test('multiple DailyNotes can coexist', async ({ window: page }) => {
    const dates = ['2024-01-15', '2024-02-15', '2024-03-15'];

    // Create multiple DailyNotes
    for (const date of dates) {
      const result = await page.evaluate(async (dateKey) => {
        return await window.typenoteAPI.getOrCreateDailyNoteByDate(dateKey);
      }, date);

      expect(result.success).toBe(true);
    }

    // List objects and verify all exist
    const listResult = await page.evaluate(async () => {
      return await window.typenoteAPI.listObjects();
    });

    expect(listResult.success).toBe(true);
    if (listResult.success) {
      const dailyNotes = listResult.result.filter((obj) => obj.typeKey === 'DailyNote');
      expect(dailyNotes.length).toBe(3);

      // Each date should appear as a title
      const titles = dailyNotes.map((dn) => dn.title);
      for (const date of dates) {
        expect(titles).toContain(date);
      }
    }
  });

  test('object without template still has valid document', async ({ window: page }) => {
    // Create a Page (no default template)
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Empty Page', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Document should exist and be valid
    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, result.result.id);

    expect(docResult.success).toBe(true);
    if (docResult.success) {
      expect(docResult.result.objectId).toBe(result.result.id);
      expect(docResult.result.docVersion).toBe(0);
      expect(Array.isArray(docResult.result.blocks)).toBe(true);
    }
  });
});
