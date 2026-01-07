import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Daily Note Workflow', () => {
  test("create today's note via button and view in editor", async ({ window: page }) => {
    // Click the "Today's Note" button
    await page.getByTestId('create-daily-note-button').click();

    // Wait for editor to load (not showing "Loading...")
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Reload to refresh ObjectList (it doesn't auto-refresh yet)
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the daily note appears in the sidebar with today's date
    const today = new Date().toISOString().slice(0, 10);
    const objectCard = page.locator('[data-testid^="object-card-"]').first();
    await expect(objectCard).toContainText(today);

    // Verify type badge shows "DailyNote"
    const typeBadge = page.getByText('DailyNote').first();
    await expect(typeBadge).toBeVisible();
  });

  test('daily note appears in object list after creation', async ({ window: page }) => {
    // Create a daily note via IPC
    await page.evaluate(async () => {
      await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    // Reload to refresh ObjectList
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Check that object list contains at least one item
    const objectCards = page.locator('[data-testid^="object-card-"]');
    await expect(objectCards.first()).toBeVisible();

    // Verify it's a DailyNote
    const typeBadge = page.getByText('DailyNote');
    await expect(typeBadge.first()).toBeVisible();
  });

  test('selecting object loads document in editor', async ({ window: page }) => {
    // Create a daily note
    await page.evaluate(async () => {
      await window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Click the first object in the list
    await page.locator('[data-testid^="object-card-"]').first().click();

    // Wait for editor to appear
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should be visible
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });
});
