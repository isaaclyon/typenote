import { test, expect } from '../fixtures/app.fixture.js';

test.describe('Theme Switching', () => {
  test('dark mode toggle applies dark theme to DOM', async ({ window: page }) => {
    // Capture ALL console messages
    const consoleMessages: Array<{ type: string; text: string }> = [];
    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Wait for app to be ready
    await page.waitForLoadState('domcontentloaded');

    // Debug: Check what's actually rendered
    const bodyHTML = await page.locator('body').innerHTML();
    console.log('Body HTML:', bodyHTML.slice(0, 500));
    console.log('Console messages:', JSON.stringify(consoleMessages, null, 2));
    console.log('Page errors:', pageErrors);

    // Wait for React to render (app root)
    await page.waitForSelector('#root', { timeout: 10000 });

    // Verify initial theme (should NOT be dark by default)
    const htmlElement = page.locator('html');
    await expect(htmlElement).not.toHaveClass(/dark/);

    // Open settings modal (using role selector as fallback)
    await page.getByRole('button', { name: 'Settings' }).click();

    // Wait for settings modal to appear
    await page.waitForSelector('[data-testid="settings-modal"]', { state: 'visible' });

    // Click the color mode select to open dropdown
    const colorModeSelect = page.getByTestId('settings-color-mode-select');
    await colorModeSelect.click();

    // Select "Dark" option
    await page.getByRole('option', { name: 'Dark' }).click();

    // ✓ CRITICAL ASSERTION: Verify HTML element has "dark" class
    // This is the bug - the class is NOT applied even though settings update
    await expect(htmlElement).toHaveClass(/dark/, { timeout: 5000 });

    // Switch to light mode
    await colorModeSelect.click();
    await page.getByRole('option', { name: 'Light' }).click();

    // Verify dark class is removed
    await expect(htmlElement).not.toHaveClass(/dark/, { timeout: 5000 });
  });
});
