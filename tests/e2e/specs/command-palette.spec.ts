import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

// Helper to generate unique content for tests
function uniqueContent(testId: string): string {
  const timestamp = Date.now();
  return `UNIQUE_${testId}_${timestamp}`;
}

// Helper to ensure app is ready by waiting for a known element
async function ensureAppReady(page: import('@playwright/test').Page): Promise<void> {
  // Wait for the sidebar to be visible (indicates React has rendered)
  await page.waitForSelector('[data-testid="create-daily-note-button"]', { state: 'visible' });
}

// Helper to open command palette reliably
async function openCommandPalette(page: import('@playwright/test').Page): Promise<void> {
  await page.keyboard.press('Meta+k');
  await expect(page.getByTestId('command-palette')).toBeVisible({ timeout: 5000 });
}

test.describe('Command Palette', () => {
  test.describe('Opening and Closing', () => {
    test('opens with Cmd+K keyboard shortcut', async ({ window: page }) => {
      await ensureAppReady(page);

      // Command palette should not be visible initially
      await expect(page.getByTestId('command-palette')).not.toBeVisible();

      // Press Cmd+K
      await page.keyboard.press('Meta+k');

      // Command palette should now be visible
      await expect(page.getByTestId('command-palette')).toBeVisible();
      await expect(page.getByTestId('command-palette-input')).toBeFocused();
    });

    test('closes with Escape key', async ({ window: page }) => {
      await ensureAppReady(page);

      // Open the palette
      await openCommandPalette(page);

      // Press Escape
      await page.keyboard.press('Escape');

      // Palette should be closed
      await expect(page.getByTestId('command-palette')).not.toBeVisible();
    });

    test('closes when clicking backdrop', async ({ window: page }) => {
      await ensureAppReady(page);

      // Open the palette
      await openCommandPalette(page);

      // Click the backdrop (outside the palette)
      await page.getByTestId('command-palette-backdrop').click({ position: { x: 10, y: 10 } });

      // Palette should be closed
      await expect(page.getByTestId('command-palette')).not.toBeVisible();
    });

    test('toggles open/closed with repeated Cmd+K', async ({ window: page }) => {
      await ensureAppReady(page);

      // First press opens
      await page.keyboard.press('Meta+k');
      await expect(page.getByTestId('command-palette')).toBeVisible();

      // Second press closes
      await page.keyboard.press('Meta+k');
      await expect(page.getByTestId('command-palette')).not.toBeVisible();
    });
  });

  test.describe('Search', () => {
    test('shows input placeholder when opened', async ({ window: page }) => {
      await ensureAppReady(page);

      // Open palette
      await openCommandPalette(page);

      // Should show the placeholder in the input
      const input = page.getByTestId('command-palette-input');
      await expect(input).toHaveAttribute('placeholder', 'Search or create...');
    });

    test('shows search results for matching objects', async ({ window: page }) => {
      const uniqueTitle = uniqueContent('SEARCHTEST');

      // Create a page with unique title via IPC
      await page.evaluate(async (title: string) => {
        return await window.typenoteAPI.createObject('Page', title, {});
      }, uniqueTitle);

      await ensureAppReady(page);

      // Open palette and search
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);

      // Wait for search results (debounced)
      await page.waitForTimeout(400); // 300ms debounce + buffer

      // Should show the result in command palette (scope to palette to avoid sidebar match)
      const palette = page.getByTestId('command-palette');
      await expect(palette.getByText(uniqueTitle)).toBeVisible();
    });

    test('shows "No results found" for non-matching query', async ({ window: page }) => {
      await ensureAppReady(page);
      const nonExistentTerm = uniqueContent('NONEXISTENT_XYZ');

      // Open palette and search for something that doesn't exist
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(nonExistentTerm);

      // Wait for search results
      await page.waitForTimeout(400);

      // Should show no results message
      await expect(page.getByText('No results found.')).toBeVisible();
    });

    test('shows empty list when query is cleared', async ({ window: page }) => {
      const uniqueTitle = uniqueContent('CLEARTEST');

      // Create a page
      await page.evaluate(async (title: string) => {
        return await window.typenoteAPI.createObject('Page', title, {});
      }, uniqueTitle);

      await ensureAppReady(page);

      // Open palette, search, then clear
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);
      await page.waitForTimeout(400);

      const palette = page.getByTestId('command-palette');
      await expect(palette.getByText(uniqueTitle)).toBeVisible();

      // Clear the input
      await page.getByTestId('command-palette-input').fill('');

      // Results should disappear (no results in command list)
      await expect(palette.getByText(uniqueTitle)).not.toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('selecting a search result navigates to that object', async ({ window: page }) => {
      const uniqueTitle = uniqueContent('NAVTEST');

      // Create a page
      await page.evaluate(async (title: string) => {
        return await window.typenoteAPI.createObject('Page', title, {});
      }, uniqueTitle);

      // Reload to ensure object list is updated
      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await ensureAppReady(page);

      // Open palette and search
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);
      await page.waitForTimeout(400);

      // Click the result within the command palette (use command-item testid)
      const palette = page.getByTestId('command-palette');
      await palette.locator('[data-testid^="command-item-"]').first().click();

      // Palette should close
      await expect(page.getByTestId('command-palette')).not.toBeVisible();

      // Editor should load (verify by checking ProseMirror appears)
      await page.waitForSelector('.ProseMirror', { state: 'visible' });
    });

    test('keyboard navigation with Enter selects item', async ({ window: page }) => {
      const uniqueTitle = uniqueContent('KEYNAVTEST');

      // Create a page
      await page.evaluate(async (title: string) => {
        return await window.typenoteAPI.createObject('Page', title, {});
      }, uniqueTitle);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await ensureAppReady(page);

      // Open palette, search, and press Enter
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);
      await page.waitForTimeout(400);

      // Press Enter to select first result
      await page.keyboard.press('Enter');

      // Palette should close and editor should load
      await expect(page.getByTestId('command-palette')).not.toBeVisible();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });
    });
  });

  test.describe('Quick Create', () => {
    test('shows creation commands when typing', async ({ window: page }) => {
      await ensureAppReady(page);

      // Open palette and type something
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill('My New Document');

      // Wait for debounce and rendering
      await page.waitForTimeout(400);

      // Should show the create Page option (wait for it to be visible)
      await expect(page.getByTestId('command-create-Page')).toBeVisible({ timeout: 5000 });
    });

    test('quick create Page creates and navigates to new object', async ({ window: page }) => {
      await ensureAppReady(page);
      const uniqueTitle = uniqueContent('CREATEPAGE');

      // Open palette and type the title
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);

      // Wait for creation commands to appear
      await page.waitForTimeout(400);
      await expect(page.getByTestId('command-create-Page')).toBeVisible({ timeout: 5000 });

      // Click create Page option
      await page.getByTestId('command-create-Page').click();

      // Palette should close
      await expect(page.getByTestId('command-palette')).not.toBeVisible();

      // Editor should load with new page
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify the page was created by checking sidebar
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // The new page should appear in the object list
      await expect(
        page.locator('[data-testid^="object-card-"]').filter({ hasText: uniqueTitle })
      ).toBeVisible();
    });

    test('quick create Task creates a task object', async ({ window: page }) => {
      await ensureAppReady(page);
      const uniqueTitle = uniqueContent('CREATETASK');

      // Open palette and type the title
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill(uniqueTitle);

      // Wait for creation commands to appear
      await page.waitForTimeout(400);
      await expect(page.getByTestId('command-create-Task')).toBeVisible({ timeout: 5000 });

      // Click create Task option
      await page.getByTestId('command-create-Task').click();

      // Palette should close and editor should load
      await expect(page.getByTestId('command-palette')).not.toBeVisible();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });

      // Verify task was created
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // The task should appear with "Task" type badge
      const taskCard = page
        .locator('[data-testid^="object-card-"]')
        .filter({ hasText: uniqueTitle });
      await expect(taskCard).toBeVisible();
      await expect(taskCard.getByText('Task')).toBeVisible();
    });

    test('all 6 built-in types have create commands', async ({ window: page }) => {
      await ensureAppReady(page);

      // Open palette and type something
      await openCommandPalette(page);
      await page.getByTestId('command-palette-input').fill('Test');

      // Wait for creation commands to appear
      await page.waitForTimeout(400);

      // All 6 built-in types should have create commands
      await expect(page.getByTestId('command-create-Page')).toBeVisible({ timeout: 5000 });
      await expect(page.getByTestId('command-create-DailyNote')).toBeVisible();
      await expect(page.getByTestId('command-create-Task')).toBeVisible();
      await expect(page.getByTestId('command-create-Person')).toBeVisible();
      await expect(page.getByTestId('command-create-Event')).toBeVisible();
      await expect(page.getByTestId('command-create-Place')).toBeVisible();
    });
  });
});
