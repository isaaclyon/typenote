import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

test.describe('Daily Note Navigation', () => {
  test('prev button creates and navigates to previous day', async ({ window: page }) => {
    // Create today's note first
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // The navigation should appear for daily notes
    const prevButton = page.getByTestId('nav-prev-button');
    await expect(prevButton).toBeVisible();

    // Click Prev to go to yesterday
    await prevButton.click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Navigation should still be visible (we're on another daily note)
    await expect(prevButton).toBeVisible();
  });

  test('next button navigates forward', async ({ window: page }) => {
    // Create a past date's note and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.getOrCreateDailyNoteByDate('2024-06-15');
    });

    // Verify creation was successful and get the ID
    expect(result.success).toBe(true);
    const dailyNoteId = (result as { success: true; result: { dailyNote: { id: string } } }).result
      .dailyNote.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate via TypeBrowser: click DailyNote type in sidebar, then click the row
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${dailyNoteId}"]`);
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Click Next to go forward a day
    const nextButton = page.getByTestId('nav-next-button');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Should navigate to 2024-06-16
    await page.waitForSelector('.ProseMirror', { state: 'visible' });
  });

  test('today button navigates to current date', async ({ window: page }) => {
    // Create a past date's note and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.getOrCreateDailyNoteByDate('2024-06-15');
    });

    // Verify creation was successful and get the ID
    expect(result.success).toBe(true);
    const dailyNoteId = (result as { success: true; result: { dailyNote: { id: string } } }).result
      .dailyNote.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate via TypeBrowser: click DailyNote type in sidebar, then click the row
    await page.getByTestId('sidebar-type-DailyNote').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${dailyNoteId}"]`);
    await page.getByTestId(`type-browser-row-${dailyNoteId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Click Today button
    const todayButton = page.getByTestId('nav-today-button');
    await expect(todayButton).toBeVisible();
    await todayButton.click();

    // Should navigate to today's date (editor loads with new content)
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Today button should now be disabled (we're already on today)
    const todayButtonAfter = page.getByTestId('nav-today-button');
    await expect(todayButtonAfter).toBeDisabled();
  });

  test('navigation only shows for daily notes', async ({ window: page }) => {
    // Create a Page (not DailyNote) and get its ID
    const result = await page.evaluate(async () => {
      return window.typenoteAPI.createObject('Page', 'Test Page', {});
    });

    // Verify creation was successful and get the ID
    expect(result.success).toBe(true);
    const pageId = (result as { success: true; result: { id: string } }).result.id;

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate via TypeBrowser: click Page type in sidebar, then click the row
    await page.getByTestId('sidebar-type-Page').click();
    await page.waitForSelector(`[data-testid="type-browser-row-${pageId}"]`);
    await page.getByTestId(`type-browser-row-${pageId}`).click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Navigation buttons should NOT be visible for non-daily notes
    const prevButton = page.getByTestId('nav-prev-button');
    await expect(prevButton).not.toBeVisible();
  });
});
