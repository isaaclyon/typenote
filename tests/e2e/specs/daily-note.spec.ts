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

    // Verify we're viewing a daily note by checking navigation buttons are visible
    // (navigation only shows for daily notes)
    const prevButton = page.getByTestId('nav-prev-button');
    await expect(prevButton).toBeVisible();

    // Verify the date appears in the navigation (the h4 button shows current date)
    const today = new Date().toISOString().slice(0, 10);
    // Use the h4 in nav which displays the date (more specific than getByText)
    const navDateButton = page.locator('h4').filter({ hasText: today });
    await expect(navDateButton).toBeVisible();
  });

  test('daily note appears in type browser after creation', async ({ window: page }) => {
    // Create a daily note via IPC and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    const dailyNoteId = (result as { success: true; result: { dailyNote: { id: string } } }).result
      .dailyNote.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to TypeBrowser: click DailyNote type in sidebar
    await page.getByTestId('sidebar-type-DailyNote').click();

    // Verify the daily note appears in the TypeBrowser
    const row = page.getByTestId(`type-browser-row-${dailyNoteId}`);
    await expect(row).toBeVisible();
  });

  test('selecting object from type browser loads document in editor', async ({ window: page }) => {
    // Create a daily note via IPC and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.getOrCreateTodayDailyNote();
    });

    expect(result.success).toBe(true);
    const dailyNoteId = (result as { success: true; result: { dailyNote: { id: string } } }).result
      .dailyNote.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate via TypeBrowser: click DailyNote type, then click the row
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${dailyNoteId}"]`);
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();

    // Wait for editor to appear
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Editor should be visible
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible();
  });

  test('new DailyNote shows template content with date heading', async ({ window: page }) => {
    // Click the "Today's Note" button to create a new DailyNote
    await page.getByTestId('create-daily-note-button').click();

    // Wait for editor to load
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().slice(0, 10);

    // The template should have created a heading with the date
    // The heading is rendered as an h1 element in ProseMirror
    // Use toHaveCount to verify it exists, then check text content
    const heading = page.locator('.ProseMirror h1');
    await expect(heading).toHaveCount(1);
    await expect(heading).toHaveText(today);
  });
});
