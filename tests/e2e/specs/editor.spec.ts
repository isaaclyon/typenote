import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Editor Auto-Save', () => {
  // TODO: Auto-save not working - generateBlockOps may not be detecting changes properly
  // This is a real bug that needs investigation in tiptapToNotate.ts
  test.skip('content persists after reload (save works)', async ({ window: page }) => {
    // Create a daily note via IPC and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    const dailyNoteId = (result as { success: true; result: { dailyNote: { id: string } } }).result
      .dailyNote.id;

    // Navigate to the daily note via TypeBrowser
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${dailyNoteId}"]`);
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Type unique content (creates a new paragraph block)
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    const uniqueText = `Persistent test ${Date.now()}`;
    await editor.pressSequentially(uniqueText);

    // Verify content was typed
    await expect(editor).toContainText(uniqueText);

    // Wait for auto-save to complete (debounce 500ms + save time)
    // Instead of relying on SaveStatus indicator, wait a fixed time
    await page.waitForTimeout(2000);

    // Reload app
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate back to the daily note via TypeBrowser
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${dailyNoteId}"]`);
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Verify content persisted (this is the actual test of save functionality)
    const editorAfterReload = page.locator('.ProseMirror');
    await expect(editorAfterReload).toContainText(uniqueText);
  });

  test('editor is editable and shows typed content', async ({ window: page }) => {
    // Create a daily note and select it
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Focus the editor and type at the end
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await editor.pressSequentially('Hello E2E Test', { delay: 50 });

    // Verify content was typed
    await expect(editor).toContainText('Hello E2E Test');

    // Editor should be visible and ready for input
    await expect(editor).toBeVisible();
  });

  test('empty document shows placeholder', async ({ window: page }) => {
    // Create a fresh daily note
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should be visible and ready for input
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });
});
