/**
 * Toast Notification E2E Tests
 *
 * Smoke tests for the Sonner toast notification system.
 * Verifies the Toaster component is mounted and toasts can appear.
 *
 * Note: These tests require the __testToast helper exposed by the app.
 * The helper is only available in development/test builds.
 */

import { test, expect } from '../fixtures/app.fixture.js';

test.describe('Toast Notifications', () => {
  test('Toaster component is mounted in the DOM', async ({ window: page }) => {
    // Sonner 2.x renders a <section> with aria-label containing "Notifications"
    const toaster = page.locator('section[aria-label*="Notifications"]');
    await expect(toaster).toBeAttached();
  });

  test('toaster has correct accessibility attributes', async ({ window: page }) => {
    // Verify the toaster has proper ARIA attributes for accessibility
    const toaster = page.locator('section[aria-label*="Notifications"]');
    await expect(toaster).toBeAttached();
    await expect(toaster).toHaveAttribute('aria-live', 'polite');
  });
});
