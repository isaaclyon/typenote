import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('References and Linking', () => {
  test.describe('Reference Creation via [[ trigger', () => {
    test('typing [[ shows autocomplete popup', async ({ window: page }) => {
      // Create a page to reference
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Page', 'Target Page For Reference', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ to trigger suggestion popup
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[', { delay: 50 });

      // Wait for suggestion popup to appear
      // The popup is appended to document.body with fixed positioning
      await page.waitForSelector('[data-testid^="suggestion-"]', {
        state: 'visible',
        timeout: 3000,
      });

      // Popup should be visible
      const popup = page.locator('.bg-popover').first();
      await expect(popup).toBeVisible();
    });

    test('autocomplete popup shows matching objects', async ({ window: page }) => {
      // Create pages with specific names
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Page', 'Alpha Project', {});
        await window.typenoteAPI.createObject('Page', 'Beta Project', {});
        await window.typenoteAPI.createObject('Page', 'Gamma Notes', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ then filter text
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[Project', { delay: 50 });

      // Wait for suggestion popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Should show Alpha and Beta but not Gamma
      const popupContent = page.locator('.bg-popover');
      await expect(popupContent).toContainText('Alpha Project');
      await expect(popupContent).toContainText('Beta Project');
    });

    test('selecting from popup inserts reference node', async ({ window: page }) => {
      // Create a page to reference
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Selectable Reference', {});
      });
      expect(createResult.success).toBe(true);

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ to trigger suggestion
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[Selectable', { delay: 50 });

      // Wait for suggestion popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Press Enter to select first item
      await page.keyboard.press('Enter');

      // Wait for popup to close
      await page.waitForSelector('.bg-popover', { state: 'hidden', timeout: 2000 });

      // Verify ref node was inserted (has data-ref attribute)
      const refNode = editor.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      await expect(refNode).toContainText('Selectable Reference');
    });

    test('arrow keys navigate autocomplete options', async ({ window: page }) => {
      // Create multiple pages
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Page', 'First Option', {});
        await window.typenoteAPI.createObject('Page', 'Second Option', {});
        await window.typenoteAPI.createObject('Page', 'Third Option', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ then filter
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[Option', { delay: 50 });

      // Wait for popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Navigate with arrow down
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Select current item
      await page.keyboard.press('Enter');

      // Wait for popup to close
      await page.waitForSelector('.bg-popover', { state: 'hidden', timeout: 2000 });

      // Verify a ref node was inserted
      const refNode = editor.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
    });

    test('Escape key closes autocomplete popup', async ({ window: page }) => {
      // Create a page
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Page', 'Escapable Page', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ to trigger suggestion
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[Escapable', { delay: 50 });

      // Wait for popup to appear
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Popup should be hidden
      await page.waitForSelector('.bg-popover', { state: 'hidden', timeout: 2000 });
    });

    test('"Create new" option appears for non-matching query', async ({ window: page }) => {
      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type [[ with a unique title that does not exist
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('[[Brand New Unique Page', { delay: 30 });

      // Wait for popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Should show "Create new" option
      const createNewButton = page.getByTestId('suggestion-create-new');
      await expect(createNewButton).toBeVisible();
      await expect(createNewButton).toContainText('Create "Brand New Unique Page"');
    });
  });

  test.describe('Reference Creation via @ trigger', () => {
    test('typing @ shows autocomplete popup', async ({ window: page }) => {
      // Create a person to reference
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Person', 'John Smith', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type @ to trigger mention suggestion
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('@', { delay: 50 });

      // Wait for suggestion popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Popup should be visible
      const popup = page.locator('.bg-popover').first();
      await expect(popup).toBeVisible();
    });

    test('selecting from @ popup inserts reference node', async ({ window: page }) => {
      // Create a person to reference
      await page.evaluate(async () => {
        await window.typenoteAPI.createObject('Person', 'Jane Doe', {});
      });

      // Create a daily note and open editor
      await page.getByTestId('create-daily-note-button').click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Type @ then filter
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('@Jane', { delay: 50 });

      // Wait for popup
      await page.waitForSelector('.bg-popover', { state: 'visible', timeout: 3000 });

      // Press Enter to select
      await page.keyboard.press('Enter');

      // Wait for popup to close
      await page.waitForSelector('.bg-popover', { state: 'hidden', timeout: 2000 });

      // Verify ref node was inserted
      const refNode = editor.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      await expect(refNode).toContainText('Jane Doe');
    });
  });

  test.describe('Reference Navigation', () => {
    test('clicking reference navigates to target object', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Navigation Target Page', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source With Link', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01NAVTESTBLOCK000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'text', text: 'Link to: ' },
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Navigation Target Page',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Click the source page to open it
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Source With Link' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Find and click the reference node
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      await refNode.click();

      // Wait for navigation to complete (editor reloads)
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the target object is now selected in the sidebar
      const targetCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Navigation Target Page' });
      await expect(targetCard).toHaveClass(/ring-2/);
    });

    test('reference displays target object title as alias', async ({ window: page }) => {
      // Create target page with specific title
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Special Title Page', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference that has alias
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Display Test Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DISPLAYTEST0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Special Title Page',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Click source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Display Test Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the ref node displays the alias
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      await expect(refNode).toContainText('Special Title Page');
    });

    test('reference without alias shows truncated objectId', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'No Alias Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference without alias
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'No Alias Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01NOALIAS00000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    // No alias provided
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Click source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'No Alias Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the ref node displays truncated ID (first 8 chars)
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      // The truncated ID should be the first 8 chars of the ULID
      const expectedTruncated = targetId.slice(0, 8);
      await expect(refNode).toContainText(expectedTruncated);
    });
  });

  test.describe('Backlinks', () => {
    test('object with incoming references shows backlinks via IPC', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Backlink Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Backlink Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01BACKLINKTEST000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      // Check backlinks via IPC
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
        expect(backlinksResult.result[0]?.sourceBlockId).toBe('01BACKLINKTEST000000000001');
      }
    });

    test('backlink count is correct with multiple sources', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Backlink Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create three source pages with references
      for (let i = 1; i <= 3; i++) {
        await page.evaluate(
          async ({ targetObjectId, index }: { targetObjectId: string; index: number }) => {
            const pageResult = await window.typenoteAPI.createObject(
              'Page',
              `Multi Source ${index}`,
              {}
            );
            if (!pageResult.success) return null;

            const blockId = `01MULTISRC${String(index).padStart(16, '0')}`;
            await window.typenoteAPI.applyBlockPatch({
              apiVersion: 'v1',
              objectId: pageResult.result.id,
              ops: [
                {
                  op: 'block.insert',
                  blockId,
                  parentBlockId: null,
                  blockType: 'paragraph',
                  content: {
                    inline: [
                      {
                        t: 'ref',
                        mode: 'link',
                        target: { kind: 'object', objectId: targetObjectId },
                      },
                    ],
                  },
                },
              ],
            });

            return pageResult.result.id;
          },
          { targetObjectId: targetId, index: i }
        );
      }

      // Check backlinks
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(3);
      }
    });

    test('creating new reference updates backlinks immediately', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Dynamic Backlink Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Verify no backlinks initially
      const beforeResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeResult.success).toBe(true);
      if (beforeResult.success) {
        expect(beforeResult.result.length).toBe(0);
      }

      // Create source page with reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Dynamic Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DYNAMICREF00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      // Verify backlink now exists
      const afterResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterResult.success).toBe(true);
      if (afterResult.success) {
        expect(afterResult.result.length).toBe(1);
      }
    });

    test('backlinks include source object title', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Title Check Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with specific title
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject(
          'Page',
          'Source With Unique Title',
          {}
        );
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01TITLECHECK00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();

      // Check backlinks include source title
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
        expect(backlinksResult.result[0]?.sourceObjectTitle).toBe('Source With Unique Title');
      }
    });
  });

  test.describe('Reference Updates', () => {
    test('editing block removes reference updates backlinks', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Edit Remove Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Edit Remove Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01EDITREMOVE00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();

      // Verify backlink exists
      const beforeEdit = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeEdit.success).toBe(true);
      if (beforeEdit.success) {
        expect(beforeEdit.result.length).toBe(1);
      }

      // Update block to remove reference
      if (sourceResult === null) return;

      await page.evaluate(async (objectId: string) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.update',
              blockId: '01EDITREMOVE00000000000001',
              patch: {
                content: { inline: [{ t: 'text', text: 'No more reference here' }] },
              },
            },
          ],
        });
      }, sourceResult);

      // Verify backlink is removed
      const afterEdit = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterEdit.success).toBe(true);
      if (afterEdit.success) {
        expect(afterEdit.result.length).toBe(0);
      }
    });

    test('deleting block containing reference removes backlink', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Delete Block Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Delete Block Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DELETEBLK000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();

      // Verify backlink exists
      const beforeDelete = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeDelete.success).toBe(true);
      if (beforeDelete.success) {
        expect(beforeDelete.result.length).toBe(1);
      }

      // Delete the block
      if (sourceResult === null) return;

      await page.evaluate(async (objectId: string) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.delete',
              blockId: '01DELETEBLK000000000000001',
            },
          ],
        });
      }, sourceResult);

      // Verify backlink is removed
      const afterDelete = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterDelete.success).toBe(true);
      if (afterDelete.success) {
        expect(afterDelete.result.length).toBe(0);
      }
    });

    test('reference persists after page reload', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Persist Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Persist Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01PERSISTREF00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Persist Target',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      // Reload the page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Select the source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Persist Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify reference is still displayed
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      await expect(refNode).toContainText('Persist Target');
    });

    test('backlinks persist after page reload', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Persist Backlink Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject(
          'Page',
          'Persist Backlink Source',
          {}
        );
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01PERSISTBACK0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      // Verify backlink before reload
      const beforeReload = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeReload.success).toBe(true);
      if (beforeReload.success) {
        expect(beforeReload.result.length).toBe(1);
      }

      // Reload
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Verify backlink after reload
      const afterReload = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterReload.success).toBe(true);
      if (afterReload.success) {
        expect(afterReload.result.length).toBe(1);
      }
    });
  });

  test.describe('Reference Styling', () => {
    test('link mode reference has blue styling', async ({ window: page }) => {
      // Create target and source with link mode reference
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Blue Style Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Blue Style Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01BLUESTYLE000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Blue Link',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetResult.result.id);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Open source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Blue Style Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the ref node has blue styling class
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      // Check for blue color classes
      const refSpan = refNode.locator('span').first();
      await expect(refSpan).toHaveClass(/bg-blue-100|text-blue-700/);
    });

    test('embed mode reference has purple styling', async ({ window: page }) => {
      // Create target and source with embed mode reference
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Purple Style Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Purple Style Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01PURPLESTYLE0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'embed',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Purple Embed',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetResult.result.id);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Open source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Purple Style Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the ref node has purple styling class
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      // Check for purple color classes
      const refSpan = refNode.locator('span').first();
      await expect(refSpan).toHaveClass(/bg-purple-100|text-purple-700/);
    });

    test('reference has link icon', async ({ window: page }) => {
      // Create reference
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Icon Check Target', {});
      });
      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Icon Check Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01ICONCHECK000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: { kind: 'object', objectId: targetObjectId },
                    alias: 'Has Icon',
                  },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetResult.result.id);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Open source page
      const sourceCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: 'Icon Check Source' });
      await sourceCard.click();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the ref node contains an SVG icon (Link2 from lucide)
      const refNode = page.locator('span[data-ref]');
      await expect(refNode).toBeVisible();
      const icon = refNode.locator('svg');
      await expect(icon).toBeVisible();
    });
  });

  test.describe('Block-level References', () => {
    test('reference to specific block tracks targetBlockId', async ({ window: page }) => {
      // Create target page with a block
      const targetResult = await page.evaluate(async () => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Block Ref Target', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01TARGETBLOCK0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Target block content' }] },
            },
          ],
        });

        return pageResult.result.id;
      });

      expect(targetResult).not.toBeNull();
      if (targetResult === null) return;

      // Create source page with block-level reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Block Ref Source', {});
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01SOURCEBLKREF000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: {
                      kind: 'block',
                      objectId: targetObjectId,
                      blockId: '01TARGETBLOCK0000000000001',
                    },
                  },
                ],
              },
            },
          ],
        });
      }, targetResult);

      // Check backlinks include targetBlockId
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetResult);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
        expect(backlinksResult.result[0]?.targetBlockId).toBe('01TARGETBLOCK0000000000001');
      }
    });
  });

  test.describe('Multiple References in Same Block', () => {
    test('block with multiple references creates multiple backlinks', async ({ window: page }) => {
      // Create two target pages
      const target1Result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Ref Target 1', {});
      });
      const target2Result = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Ref Target 2', {});
      });

      expect(target1Result.success).toBe(true);
      expect(target2Result.success).toBe(true);
      if (!target1Result.success || !target2Result.success) return;

      const target1Id = target1Result.result.id;
      const target2Id = target2Result.result.id;

      // Create source with multiple refs in one block
      await page.evaluate(
        async ({ t1, t2 }: { t1: string; t2: string }) => {
          const pageResult = await window.typenoteAPI.createObject('Page', 'Multi Ref Source', {});
          if (!pageResult.success) return null;

          await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: '01MULTIREF0000000000000001',
                parentBlockId: null,
                blockType: 'paragraph',
                content: {
                  inline: [
                    { t: 'text', text: 'See ' },
                    { t: 'ref', mode: 'link', target: { kind: 'object', objectId: t1 } },
                    { t: 'text', text: ' and ' },
                    { t: 'ref', mode: 'link', target: { kind: 'object', objectId: t2 } },
                  ],
                },
              },
            ],
          });

          return pageResult.result.id;
        },
        { t1: target1Id, t2: target2Id }
      );

      // Check backlinks for both targets
      const backlinks1 = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, target1Id);

      const backlinks2 = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, target2Id);

      expect(backlinks1.success).toBe(true);
      expect(backlinks2.success).toBe(true);

      if (backlinks1.success) {
        expect(backlinks1.result.length).toBe(1);
      }
      if (backlinks2.success) {
        expect(backlinks2.result.length).toBe(1);
      }
    });
  });
});
