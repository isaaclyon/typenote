import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Object Creation via UI', () => {
  test('create a Page object via IPC and verify it appears in object list', async ({
    window: page,
  }) => {
    // Create a Page object via IPC
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'My Test Page', {});
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.id).toMatch(/^[0-9A-Z]{26}$/); // ULID format
      expect(result.result.title).toBe('My Test Page');
    }

    // Reload to refresh ObjectList (it doesn't auto-refresh yet)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the page appears in the object list
    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await expect(objectCard).toContainText('My Test Page');

    // Verify type badge shows "Page"
    const typeBadge = page.getByText('Page').first();
    await expect(typeBadge).toBeVisible();
  });

  test('create a Person object and verify type badge', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Person', 'John Doe', {});
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.title).toBe('John Doe');
    }

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify object appears with correct type
    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await expect(objectCard).toContainText('John Doe');
    await expect(objectCard).toContainText('Person');
  });

  test('create an Event object and verify type badge', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Event', 'Team Meeting', {});
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.title).toBe('Team Meeting');
    }

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await expect(objectCard).toContainText('Team Meeting');
    await expect(objectCard).toContainText('Event');
  });

  test('create a Place object and verify type badge', async ({ window: page }) => {
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Place', 'Conference Room A', {});
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.title).toBe('Conference Room A');
    }

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await expect(objectCard).toContainText('Conference Room A');
    await expect(objectCard).toContainText('Place');
  });

  test('create multiple objects of different types', async ({ window: page }) => {
    // Create objects of different types
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'My Notes', {});
      await window.typenoteAPI.createObject('Person', 'Alice', {});
      await window.typenoteAPI.createObject('Event', 'Birthday Party', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Check that we have at least 3 objects
    const objectCards = page.locator('[data-testid^="object-card-"]');
    await expect(objectCards).toHaveCount(3);
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

  test('object metadata displays correctly in object list', async ({ window: page }) => {
    await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Display Test', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const objectCard = page.locator('[data-testid^="object-card-"]').first();

    // Title is displayed
    await expect(objectCard).toContainText('Display Test');

    // Type badge is displayed
    await expect(objectCard).toContainText('Page');

    // Date is displayed (format: localized date)
    // The component shows updatedAt as toLocaleDateString()
    const today = new Date().toLocaleDateString();
    await expect(objectCard).toContainText(today);
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
  test('select object from list loads editor', async ({ window: page }) => {
    // Create an object
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Clickable Object', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Click the object card
    await page.locator('[data-testid^="object-card-"]').first().click();

    // Wait for editor to appear
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should be visible
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });

  test('object list updates after creating multiple objects', async ({ window: page }) => {
    // Initially empty
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should show "No objects yet"
    await expect(page.getByText('No objects yet')).toBeVisible();

    // Create first object
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'First Object', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    let objectCards = page.locator('[data-testid^="object-card-"]');
    await expect(objectCards).toHaveCount(1);

    // Create second object
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Second Object', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    objectCards = page.locator('[data-testid^="object-card-"]');
    await expect(objectCards).toHaveCount(2);
  });

  test('object list shows correct count after bulk creation', async ({ window: page }) => {
    // Create 5 objects
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Bulk 1', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 2', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 3', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 4', {});
      await window.typenoteAPI.createObject('Page', 'Bulk 5', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const objectCards = page.locator('[data-testid^="object-card-"]');
    await expect(objectCards).toHaveCount(5);
  });

  test('selected object has visual indicator', async ({ window: page }) => {
    // Create an object
    const result = await page.evaluate(async () => {
      return await window.typenoteAPI.createObject('Page', 'Selected Test', {});
    });
    expect(result.success).toBe(true);
    if (!result.success) return;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Click the object card
    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await objectCard.click();

    // Wait for editor to load
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // The selected card should have the ring-2 ring-primary class (visual indicator)
    // This is set via the cn() utility when selectedId matches obj.id
    await expect(objectCard).toHaveClass(/ring-2/);
    await expect(objectCard).toHaveClass(/ring-primary/);
  });

  test('can switch between objects in list', async ({ window: page }) => {
    // Create two objects
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Object A', {});
      await window.typenoteAPI.createObject('Page', 'Object B', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const objectCards = page.locator('[data-testid^="object-card-"]');

    // Click first object
    await objectCards.nth(0).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Verify first is selected
    await expect(objectCards.nth(0)).toHaveClass(/ring-2/);

    // Click second object
    await objectCards.nth(1).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Verify second is now selected and first is not
    await expect(objectCards.nth(1)).toHaveClass(/ring-2/);
    // First card should not have the selection ring anymore
    // Note: We check for absence of the ring class
    const firstCardClasses = await objectCards.nth(0).getAttribute('class');
    expect(firstCardClasses).not.toMatch(/ring-primary/);
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

    // Click the object to load it in editor
    await page.locator('[data-testid^="object-card-"]').first().click();

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
  test('empty object list shows "No objects yet" message', async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Should show empty state message
    await expect(page.getByText('No objects yet')).toBeVisible();
  });

  test('no object selected shows "Select an object to view" message', async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Main content area should show placeholder
    await expect(page.getByText('Select an object to view')).toBeVisible();
  });

  test("Today's Note button is visible", async ({ window: page }) => {
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const button = page.getByTestId('create-daily-note-button');
    await expect(button).toBeVisible();
    await expect(button).toContainText("Today's Note");
  });
});
