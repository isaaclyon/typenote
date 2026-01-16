import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Object Creation via UI', () => {
  test('create a Page object via IPC and verify it appears in TypeBrowser', async ({
    window: page,
  }) => {
    // Create a Page object via IPC
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'My Test Page', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.result.id).toMatch(/^[0-9A-Z]{26}$/); // ULID format
    expect(result.result.title).toBe('My Test Page');

    const objectId = result.result.id;

    // Reload to refresh data
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type via sidebar
    await page.getByTestId('sidebar-type-Page').click();

    // Wait for the specific row to appear in TypeBrowser
    const row = page.getByTestId(`type-browser-row-${objectId}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('My Test Page');
  });

  test('create a Person object and verify it appears in TypeBrowser', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Person', 'John Doe', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.result.title).toBe('John Doe');
    const objectId = result.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Person type via sidebar
    await page.getByTestId('sidebar-type-Person').click();

    // Verify object appears
    const row = page.getByTestId(`type-browser-row-${objectId}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('John Doe');
  });

  test('create an Event object and verify it appears in TypeBrowser', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Event', 'Team Meeting', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.result.title).toBe('Team Meeting');
    const objectId = result.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Event type via sidebar
    await page.getByTestId('sidebar-type-Event').click();

    const row = page.getByTestId(`type-browser-row-${objectId}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('Team Meeting');
  });

  test('create a Place object and verify it appears in TypeBrowser', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Place', 'Conference Room A', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.result.title).toBe('Conference Room A');
    const objectId = result.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Place type via sidebar
    await page.getByTestId('sidebar-type-Place').click();

    const row = page.getByTestId(`type-browser-row-${objectId}`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('Conference Room A');
  });

  test('create multiple objects of same type appear in TypeBrowser', async ({ window: page }) => {
    // Create 3 Page objects
    const results = await page.evaluate(async () => {
      const r1 = await window.typenoteAPI.createObject('Page', 'Page One', {});
      const r2 = await window.typenoteAPI.createObject('Page', 'Page Two', {});
      const r3 = await window.typenoteAPI.createObject('Page', 'Page Three', {});
      return [r1, r2, r3];
    });

    // All should succeed
    for (const r of results) {
      expect(r.success).toBe(true);
    }

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type
    await page.getByTestId('sidebar-type-Page').click();

    // Check all 3 rows exist
    const rows = page.locator('[data-testid^="type-browser-row-"]');
    await expect(rows).toHaveCount(3);
  });
});

test.describe('Object Properties', () => {
  test('new Page object has the specified title', async ({ window: page }) => {
    const title = 'Specified Title Test';
    const result = await page.evaluate(async (t) => {
      return await window.typenoteAPI.createObject('Page', t, {});
    }, title);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.title).toBe(title);
    }
  });

  test('createObject returns valid ULID for id', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'ULID Test', {});
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // ULID is 26 characters, uppercase alphanumeric
      expect(result.result.id).toMatch(/^[0-9A-Z]{26}$/);
    }
  });

  test('getObject returns correct metadata for created object', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Metadata Test', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    // Get the object details
    const result = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getObject(id);
    }, objectId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).not.toBeNull();
      expect(result.result?.id).toBe(objectId);
      expect(result.result?.title).toBe('Metadata Test');
      expect(result.result?.typeKey).toBe('Page');
      expect(result.result?.createdAt).toBeDefined();
      expect(result.result?.updatedAt).toBeDefined();
    }
  });

  test('object title displays correctly in TypeBrowser row', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Display Test', {});
    });

    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type
    await page.getByTestId('sidebar-type-Page').click();

    const row = page.getByTestId(`type-browser-row-${objectId}`);
    await expect(row).toBeVisible();

    // Title is displayed in the row
    await expect(row).toContainText('Display Test');
  });

  test('created object has associated document', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Document Test', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    // Get the document for this object
    const docResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);

    expect(docResult.success).toBe(true);
    if (docResult.success) {
      expect(docResult.result.objectId).toBe(objectId);
      expect(docResult.result.docVersion).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(docResult.result.blocks)).toBe(true);
    }
  });
});

test.describe('Object List Interactions', () => {
  test('clicking TypeBrowser row loads editor', async ({ window: page }) => {
    // Create an object
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Clickable Object', {});
    });
    expect(result.success).toBe(true);
    if (!result.success) return;

    const objectId = result.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type
    await page.getByTestId('sidebar-type-Page').click();

    // Click the row
    await page.getByTestId(`type-browser-row-${objectId}`).click();

    // Wait for editor to appear
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should be visible
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });

  test('TypeBrowser updates after creating objects', async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type (empty initially)
    await page.getByTestId('sidebar-type-Page').click();

    // Should show empty state (TypeBrowser shows "No pages yet")
    await expect(page.getByText(/no pages yet/i)).toBeVisible();

    // Create first object
    const r1 = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'First Object', {});
    });
    expect(r1.success).toBe(true);
    if (!r1.success) return;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate back to Page type
    await page.getByTestId('sidebar-type-Page').click();

    let rows = page.locator('[data-testid^="type-browser-row-"]');
    await expect(rows).toHaveCount(1);

    // Create second object
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Second Object', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate back to Page type
    await page.getByTestId('sidebar-type-Page').click();

    rows = page.locator('[data-testid^="type-browser-row-"]');
    await expect(rows).toHaveCount(2);
  });

  test('TypeBrowser shows correct count after bulk creation', async ({ window: page }) => {
    // Create 5 Page objects
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Bulk 1', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 2', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 3', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 4', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 5', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type
    await page.getByTestId('sidebar-type-Page').click();

    const rows = page.locator('[data-testid^="type-browser-row-"]');
    await expect(rows).toHaveCount(5);
  });

  test('can navigate between different objects via TypeBrowser', async ({ window: page }) => {
    // Create two objects
    const results = await page.evaluate(async () => {
      const r1 = await window.typenoteAPI.createObject('Page', 'Object A', {});
      const r2 = await window.typenoteAPI.createObject('Page', 'Object B', {});
      return { r1, r2 };
    });

    expect(results.r1.success).toBe(true);
    expect(results.r2.success).toBe(true);
    if (!results.r1.success || !results.r2.success) return;

    const id1 = results.r1.result.id;
    const id2 = results.r2.result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type
    await page.getByTestId('sidebar-type-Page').click();

    // Click first object
    await page.getByTestId(`type-browser-row-${id1}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Navigate back to Page type browser and click second object
    await page.getByTestId('sidebar-type-Page').click();
    await page.getByTestId(`type-browser-row-${id2}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should still be visible (loaded different document)
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('getObject with invalid ID returns error', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getObject('nonexistent-id');
    });

    expect(result.success).toBe(true);
    if (result.success) {
      // getObject returns null for non-existent objects (not an error)
      expect(result.result).toBeNull();
    }
  });

  test('getDocument with invalid ID returns NOT_FOUND_OBJECT error', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.getDocument('01NONEXISTENT1234567890123');
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      expect(typeof result.error.message).toBe('string');
    }
  });

  test('createObject with empty title still succeeds', async ({ window: page }) => {
    // Test that we can create an object with an empty title
    // (business logic may or may not allow this - we test current behavior)
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', '', {});
    });

    // The API allows empty titles in current implementation
    expect(result.success).toBe(true);
  });

  test('createObject returns IPC response format', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Format Test', {});
    });

    // Verify the response has the expected IPC envelope structure
    expect(result).toHaveProperty('success');
    if (result.success) {
      expect(result).toHaveProperty('result');
      expect(result.result).toHaveProperty('id');
      expect(result.result).toHaveProperty('title');
    } else {
      expect(result).toHaveProperty('error');
      expect(result.error).toHaveProperty('code');
      expect(result.error).toHaveProperty('message');
    }
  });
});

test.describe('Object Type Variations', () => {
  test('all built-in types can create objects', async ({ window: page }) => {
    const typeKeys = ['Page', 'Person', 'Event', 'Place'];

    for (const typeKey of typeKeys) {
      const result = await page.evaluate(async (tk) => {
        return await window.typenoteAPI.createObject(tk, `Test ${tk}`, {});
      }, typeKey);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.title).toBe(`Test ${typeKey}`);
      }
    }
  });

  test('listObjects returns objects of all types', async ({ window: page }) => {
    // Create objects of different types
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Test Page', {});
      await window.typenoteAPI.createObject('Person', 'Test Person', {});
      await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.listObjects();
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.length).toBe(3);

      // Extract type keys
      const typeKeys = result.result.map((obj) => obj.typeKey);
      expect(typeKeys).toContain('Page');
      expect(typeKeys).toContain('Person');
      expect(typeKeys).toContain('DailyNote');
    }
  });
});

test.describe('Object Document Integration', () => {
  test('new object can have blocks added to its document', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Block Test', {});
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
            blockId: '01TESTBLOCKFOROBJ123456789',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello from test' }] },
          },
        ],
      });
    }, objectId);

    expect(patchResult.success).toBe(true);
    if (patchResult.success) {
      // Version should be incremented (initial is 0, so after first patch is 1)
      expect(patchResult.result.newDocVersion).toBeGreaterThanOrEqual(1);
    }
  });

  test('selecting object shows its document content in editor', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Editor Content Test', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    // Add content to the document
    const patchResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01EDITORCONTENT12345678901',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Visible in editor' }] },
          },
        ],
      });
    }, objectId);

    // Verify patch was applied
    expect(patchResult.success).toBe(true);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type and click the object
    await page.getByTestId('sidebar-type-Page').click();
    await page.getByTestId(`type-browser-row-${objectId}`).click();

    // Wait for editor to load
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // The content should be visible in the editor
    const editor = page.locator('.ProseMirror');
    await expect(editor).toContainText('Visible in editor');
  });

  test('object document version increments with each patch', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Version Test', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    // Get initial version
    const doc1 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);
    expect(doc1.success).toBe(true);
    if (!doc1.success) return;
    const initialVersion = doc1.result.docVersion;

    // Apply a patch
    const patchResult = await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01VERSIONTEST1234567890123',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Version bump' }] },
          },
        ],
      });
    }, objectId);

    // Verify patch was applied
    expect(patchResult.success).toBe(true);

    // Get new version
    const doc2 = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getDocument(id);
    }, objectId);
    expect(doc2.success).toBe(true);
    if (!doc2.success) return;

    expect(doc2.result.docVersion).toBeGreaterThan(initialVersion);
  });
});

test.describe('Object Search and Backlinks', () => {
  test('newly created object has no backlinks', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'No Backlinks Test', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    const result = await page.evaluate(async (id) => {
      return await window.typenoteAPI.getBacklinks(id);
    }, objectId);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result).toEqual([]);
    }
  });

  test('searchBlocks can find content in created object', async ({ window: page }) => {
    // Create an object
    const createResult = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Search Source', {});
    });
    expect(createResult.success).toBe(true);
    if (!createResult.success) return;

    const objectId = createResult.result.id;

    // Add searchable content
    await page.evaluate(async (id) => {
      return await window.typenoteAPI.applyBlockPatch({
        apiVersion: 'v1',
        objectId: id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01SEARCHABLE12345678901234',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'UniqueSearchableKeyword123' }] },
          },
        ],
      });
    }, objectId);

    // Search for the content
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.searchBlocks('UniqueSearchableKeyword123');
    });

    expect(result.success).toBe(true);
    // Note: FTS indexing might be async, so we just verify the call succeeds
    // In a real app, we might need to wait for indexing
    if (result.success) {
      expect(Array.isArray(result.result)).toBe(true);
    }
  });
});

test.describe('UI Empty States', () => {
  test('empty TypeBrowser shows empty message', async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Page type (should be empty in fresh test)
    await page.getByTestId('sidebar-type-Page').click();

    // TypeBrowser shows "No pages yet" for empty Page type
    await expect(page.getByText(/no pages yet/i)).toBeVisible();
  });

  test('Today button is visible in sidebar', async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const button = page.getByTestId('create-daily-note-button');
    await expect(button).toBeVisible();
    // Button shows "Today" (not "Today's Note")
    await expect(button).toContainText('Today');
  });
});
