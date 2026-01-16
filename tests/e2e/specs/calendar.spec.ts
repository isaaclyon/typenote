import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

/**
 * Get today's date as YYYY-MM-DD using local timezone.
 * Matches the calendar's getCalendarTodayDateKey() from @typenote/core.
 */
function getLocalDateKey(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// TODO: Calendar view exists but isn't wired into UI navigation yet.
// The CalendarView component exists at /apps/desktop/src/renderer/components/calendar/
// but there's no calendar-button or UI element to switch to calendar view.
// These tests should be enabled once calendar navigation is added to the UI.
test.describe.skip('Calendar Workflow', () => {
  test.describe('View Switching', () => {
    test('clicking Calendar button shows calendar view', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();
      await expect(page.getByTestId('calendar-view')).toBeVisible();
    });

    test('clicking Notes button returns to notes view', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();
      await expect(page.getByTestId('calendar-view')).toBeVisible();

      await page.getByTestId('notes-button').click();
      await expect(page.getByTestId('calendar-view')).not.toBeVisible();
    });
  });

  test.describe('Calendar Display', () => {
    test('calendar shows current month by default', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();
      await expect(page.getByTestId('calendar-header')).toBeVisible();

      // Header should contain current month name
      const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });
      await expect(page.getByTestId('calendar-header')).toContainText(monthName);
    });

    test('calendar grid shows 42 day cells', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();
      await expect(page.getByTestId('calendar-grid')).toBeVisible();

      const dayCells = page.locator('[data-testid^="calendar-day-"]');
      await expect(dayCells).toHaveCount(42);
    });
  });

  test.describe('Day Selection', () => {
    test('clicking a day shows events in sidebar', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();

      // Click on a specific day (today)
      const todayKey = getLocalDateKey();
      await page.getByTestId(`calendar-day-${todayKey}`).click();

      await expect(page.getByTestId('calendar-sidebar')).toBeVisible();
    });
  });

  test.describe('Month Navigation', () => {
    test('prev/next buttons navigate months', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();

      const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      // Go to next month
      await page.getByTestId('calendar-next-month').click();
      await expect(page.getByTestId('calendar-header')).not.toContainText(currentMonth);

      // Go back to current month
      await page.getByTestId('calendar-prev-month').click();
      await expect(page.getByTestId('calendar-header')).toContainText(currentMonth);
    });

    test('today button returns to current month', async ({ window: page }) => {
      await page.getByTestId('calendar-button').click();

      // Navigate away
      await page.getByTestId('calendar-next-month').click();
      await page.getByTestId('calendar-next-month').click();

      // Click Today
      await page.getByTestId('calendar-today').click();

      const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' });
      await expect(page.getByTestId('calendar-header')).toContainText(currentMonth);
    });
  });

  test.describe('Events Display', () => {
    test('days with events show dot indicator', async ({ window: page }) => {
      // Create an event via IPC for today
      const todayKey = getLocalDateKey();
      await page.evaluate(async (dateKey) => {
        await window.typenoteAPI.createObject('Event', 'Test Event', {
          start_date: `${dateKey}T10:00:00.000Z`,
        });
      }, todayKey);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.getByTestId('calendar-button').click();

      // The day with the event should have a dot indicator
      await expect(page.getByTestId(`calendar-day-indicator-${todayKey}`)).toBeVisible();
    });
  });

  test.describe('Event Navigation', () => {
    test('clicking event in sidebar navigates to object', async ({ window: page }) => {
      // Create an event
      const todayKey = getLocalDateKey();
      await page.evaluate(async (dateKey) => {
        return window.typenoteAPI.createObject('Event', 'Navigate Test Event', {
          start_date: `${dateKey}T14:00:00.000Z`,
        });
      }, todayKey);

      await page.reload();
      await page.waitForLoadState('domcontentloaded');
      await page.getByTestId('calendar-button').click();
      await page.getByTestId(`calendar-day-${todayKey}`).click();

      // Wait for the sidebar to show events
      await expect(page.getByTestId('calendar-sidebar')).toBeVisible();

      // Wait for the event card to appear, then click it
      const eventCard = page.locator('[data-testid^="event-card-"]').first();
      await expect(eventCard).toBeVisible();
      await eventCard.click();

      // Should switch to notes view and show editor
      await expect(page.getByTestId('calendar-view')).not.toBeVisible();
      await page.waitForSelector('.ProseMirror', { state: 'visible' });
    });
  });
});
