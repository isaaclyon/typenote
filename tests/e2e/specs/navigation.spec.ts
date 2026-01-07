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
    // Create a past date's note
    await page.evaluate(async () => {
      await window.typenoteAPI.getOrCreateDailyNoteByDate('2024-06-15');
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Select the past daily note by clicking a card
    await page.locator('[data-testid^="object-card-"]').first().click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Click Next to go forward a day
    const nextButton = page.getByTestId('nav-next-button');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    // Should navigate to 2024-06-16
    await page.waitForSelector('.ProseMirror', { state: 'visible' });
  });

  test('today button navigates to current date', async ({ window: page }) => {
    // Create a past date's note
    await page.evaluate(async () => {
      await window.typenoteAPI.getOrCreateDailyNoteByDate('2024-06-15');
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Select the past daily note by clicking a card
    await page.locator('[data-testid^="object-card-"]').first().click();
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
    // Create a Page (not DailyNote)
    await page.evaluate(async () => {
      await window.typenoteAPI.createObject('Page', 'Test Page', {});
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Find and click the Page card (contains "Page" badge text)
    const pageCard = page.locator('[data-testid^="object-card-"]').filter({ hasText: 'Page' });
    await pageCard.first().click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });

    // Navigation buttons should NOT be visible for non-daily notes
    const prevButton = page.getByTestId('nav-prev-button');
    await expect(prevButton).not.toBeVisible();
  });
});
