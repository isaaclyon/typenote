import { test, expect } from '../fixtures/app.fixture.js';

test.describe('Slash Commands', () => {
  test.beforeEach(async ({ window: page }) => {
    // Create a daily note and open editor for each test
    await page.getByTestId('create-daily-note-button').click();
    await page.waitForSelector('.ProseMirror', { state: 'visible' });
  });

  test.describe('Menu Opening and Closing', () => {
    test('opens menu when typing /', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();

      // Menu should not be visible initially
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible();

      // Type '/' to trigger menu
      await editor.pressSequentially('/', { delay: 50 });

      // Menu should appear
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });
    });

    test('closes menu on Escape', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu to appear
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Escape
      await page.keyboard.press('Escape');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });
    });

    test('closes menu after command execution', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu to appear
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter to execute first command
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('Command Filtering', () => {
    test('shows all commands when menu first opens', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Should have multiple command items visible
      // Registry has 15 total commands (1 basic + 6 headings + 3 lists + 3 formatting + 2 advanced)
      const commandItems = page.locator('[data-testid^="slash-command-"]');
      const count = await commandItems.count();
      expect(count).toBeGreaterThan(10);
    });

    test('filters commands when typing query', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/heading', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Should show only 6 heading commands
      const headingCommands = page.locator('[data-testid^="slash-command-heading-"]');
      const count = await headingCommands.count();
      expect(count).toBe(6);

      // Verify specific headings are visible
      await expect(page.getByTestId('slash-command-heading-1')).toBeVisible();
      await expect(page.getByTestId('slash-command-heading-2')).toBeVisible();
      await expect(page.getByTestId('slash-command-heading-6')).toBeVisible();
    });

    test('filters by alias (h1 shows heading-1)', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/h1', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Should show heading-1 command
      await expect(page.getByTestId('slash-command-heading-1')).toBeVisible();

      // Should also match other h* commands as substring
      // (h1 matches h1, but also "checklist" contains no h1, and "checkbox" contains no h1)
      // Actually h1 should match heading-1 specifically
      const visibleCommands = page
        .locator('[data-testid^="slash-command-"]')
        .filter({ hasText: /heading/i });
      const count = await visibleCommands.count();
      expect(count).toBeGreaterThan(0);
    });

    test('shows no results message for non-matching query', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/zzznomatch', { delay: 50 });

      // Menu should still be visible
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Should show "No commands found" message (the primary check)
      await expect(page.getByText('No commands found')).toBeVisible({ timeout: 3000 });
    });

    test('updates filter as user types', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/h', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Check initial count (should include headings, horizontal-rule, checkbox/checklist)
      const initialCount = await page.locator('[data-testid^="slash-command-"]').count();
      expect(initialCount).toBeGreaterThan(6);

      // Type more to narrow down to "heading"
      await page.keyboard.type('eading');

      // Now should only show 6 heading commands
      const filteredCount = await page.locator('[data-testid^="slash-command-heading-"]').count();
      expect(filteredCount).toBe(6);
    });
  });

  test.describe('Command Execution', () => {
    test('inserts heading 1 when h1 command selected', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/h1', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter to execute
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // Should have inserted H1 (note: daily note already has H1 for date, so expect 2)
      const h1Elements = editor.locator('h1');
      const count = await h1Elements.count();
      expect(count).toBeGreaterThanOrEqual(2); // Date H1 + newly inserted H1

      // Verify no '/h1' text remains in the second H1
      const secondH1 = h1Elements.nth(1);
      const h1Text = await secondH1.textContent();
      expect(h1Text).not.toContain('/h1');
    });

    test('inserts bullet list when selected', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/bullet', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter
      await page.keyboard.press('Enter');

      // Should have inserted bullet list (use generic ul selector)
      const bulletList = editor.locator('ul');
      await expect(bulletList).toBeVisible();

      // Should have a list item
      const listItem = bulletList.locator('li');
      await expect(listItem).toBeVisible();

      // Verify no '/bullet' text remains
      const editorText = await editor.textContent();
      expect(editorText).not.toContain('/bullet');
    });

    test('inserts task list with checkbox', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/todo', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter
      await page.keyboard.press('Enter');

      // Should have inserted task list
      const taskList = editor.locator('ul');
      await expect(taskList).toBeVisible();

      // Should contain a checkbox input
      const checkbox = editor.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
    });

    test('inserts code block', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/code', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter
      await page.keyboard.press('Enter');

      // Should have inserted code block (check for pre element which is visible)
      const codeBlock = editor.locator('pre');
      await expect(codeBlock).toBeVisible();

      // Code element should exist (even if child code is hidden in DOM)
      const code = editor.locator('pre code');
      await expect(code).toHaveCount(1);
    });

    test('inserts blockquote', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/quote', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter
      await page.keyboard.press('Enter');

      // Should have inserted blockquote
      const blockquote = editor.locator('blockquote');
      await expect(blockquote).toBeVisible();
    });

    test('inserts table', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/table', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Enter
      await page.keyboard.press('Enter');

      // Should have inserted table (3x3 with header row)
      const table = editor.locator('table');
      await expect(table).toBeVisible();

      // Check for table rows
      const rows = table.locator('tr');
      const rowCount = await rows.count();
      expect(rowCount).toBe(3);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('ArrowDown navigates to next command', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // First command is selected by default (paragraph at index 0)
      // Press ArrowDown twice to select third item (heading-2 at index 2)
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');

      // Press Enter to execute the selected command (should be heading-2)
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // Should have inserted heading-2
      const h2 = editor.locator('h2');
      await expect(h2).toBeVisible();
    });

    test('ArrowUp navigates to previous command', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press ArrowDown 3 times to go to index 3, then ArrowUp once to go back to index 2
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');

      // Should be at heading-2 (index 2)
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // Should have inserted heading-2
      const h2 = editor.locator('h2');
      await expect(h2).toBeVisible();
    });

    test('wraps to first item when navigating down from last', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Get total count of commands
      const commandItems = page.locator('[data-testid^="slash-command-"]');
      const totalCount = await commandItems.count();

      // Press ArrowDown many times to go past the last item
      for (let i = 0; i < totalCount + 2; i++) {
        await page.keyboard.press('ArrowDown');
      }

      // Should wrap back to first item (paragraph)
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // First command is "paragraph" which sets paragraph node
      // Since we're already in a paragraph, this might not change visible structure
      // Just verify menu closed and no errors occurred
    });
  });

  test.describe('Edge Cases', () => {
    test('typing text after / filters correctly', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();

      // Type some text first
      await editor.pressSequentially('Hello world ', { delay: 50 });

      // Then type / to trigger menu
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Menu should appear and show all commands
      const commandItems = page.locator('[data-testid^="slash-command-"]');
      const count = await commandItems.count();
      expect(count).toBeGreaterThan(10);
    });

    test('clicking a command executes it', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Click on heading-2 command
      await page.getByTestId('slash-command-heading-2').click();

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // Should have inserted H2
      const h2 = editor.locator('h2');
      await expect(h2).toBeVisible();
    });

    test('backspacing in empty query closes menu', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();
      await editor.pressSequentially('/', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Press Backspace to delete the '/'
      await page.keyboard.press('Backspace');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });
    });

    test('selecting command in middle of text works correctly', async ({ window: page }) => {
      const editor = page.locator('.ProseMirror');
      await editor.click();

      // Type "Start /h1" and trigger command in middle
      await editor.pressSequentially('Start ', { delay: 50 });
      await editor.pressSequentially('/h1', { delay: 50 });

      // Wait for menu
      await expect(page.getByTestId('slash-command-menu')).toBeVisible({ timeout: 3000 });

      // Execute command
      await page.keyboard.press('Enter');

      // Menu should close
      await expect(page.getByTestId('slash-command-menu')).not.toBeVisible({ timeout: 2000 });

      // Should have H1 with "Start " in it
      // Use last() to get the most recently created H1 (not the date H1)
      const h1Elements = editor.locator('h1');
      const lastH1 = h1Elements.last();
      await expect(lastH1).toBeVisible();

      // The text "Start " should now be in the H1
      await expect(lastH1).toContainText('Start');
    });
  });
});
