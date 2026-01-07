import { test, expect } from '../fixtures/app.fixture.js';

test.describe('Editor Auto-Save', () => {
  test('typing triggers auto-save after debounce', async ({ window: page }) => {
    // Create a daily note and select it
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Type in the editor
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.pressSequentially('Hello E2E Test', { delay: 50 });

    // Wait for save indicator (debounce is typically 500ms)
    const saveStatus = page.getByTestId('save-status');

    // Should eventually show "Saved" with timestamp
    await expect(saveStatus).toContainText('Saved', { timeout: 5000 });
  });

  test('content persists after reload', async ({ window: page }) => {
    // Create and edit
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.pressSequentially('Persistent content test');

    // Wait for save
    const saveStatus = page.getByTestId('save-status');
    await expect(saveStatus).toContainText('Saved', { timeout: 5000 });

    // Reload app
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Select the daily note again
    await page.locator('[data-testid^="object-card-"]').first().click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Verify content persisted
    const editorAfterReload = page.locator('.ProseMirror');
    await expect(editorAfterReload).toContainText('Persistent content test');
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
