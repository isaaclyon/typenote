---
paths: tests/e2e/**/*.ts
---

# E2E Testing Rules (Playwright + Electron)

E2E tests validate the full Electron app including IPC wiring and UI interactions.

## Test Structure

```
tests/e2e/
├── fixtures/app.fixture.ts    # Electron app launcher
├── specs/                     # Test files
│   ├── ipc-wiring.spec.ts     # IPC handler validation
│   ├── daily-note.spec.ts     # Daily note workflows
│   ├── editor.spec.ts         # Editor auto-save
│   └── navigation.spec.ts     # Daily note navigation
└── types/global.d.ts          # TypenoteAPI types for tests
```

## Playwright Selector Patterns

### DO: Use data-testid attributes

```typescript
// Best: Stable, explicit, won't break with text/style changes
await page.getByTestId('create-daily-note-button').click();
await page.locator('[data-testid^="object-card-"]').first().click();
```

### DO: Use prefix matching for dynamic lists

```typescript
// Good: Prefix matching for dynamically generated test IDs
await page.locator('[data-testid^="object-card-"]').filter({ hasText: 'Page' }).click();
await page.locator('[data-testid^="suggestion-"]').first().click();
```

### DO: Combine locator with filter() for precision

```typescript
// Good: Modern Playwright API - filter with hasText
await page.locator('[data-testid^="object-card-"]').filter({ hasText: 'My Document' }).click();

// Good: Multiple filters
await page
  .locator('button')
  .filter({ hasText: 'Save' })
  .filter({ has: page.locator('.icon') });
```

### DO: Use getByRole for accessible elements

```typescript
// Good: Uses accessibility semantics
await page.getByRole('button', { name: /save/i }).click();
```

### DO: Use getByText for content assertions

```typescript
// Good: For checking visible text
await expect(page.getByText('DailyNote')).toBeVisible();
```

### DON'T: Use :has-text() pseudo-selector

```typescript
// WRONG: :has-text() is NOT valid Playwright syntax
await page.click('button:has-text("Save")'); // ❌ Won't work!

// CORRECT alternatives:
await page.getByRole('button', { name: 'Save' }).click();
await page.locator('button').filter({ hasText: 'Save' }).click();
await page.getByTestId('save-button').click();
```

### DON'T: Use fragile class selectors

```typescript
// WRONG: Class names can change
await page.locator('[class*="Card"]').click(); // ❌ Fragile

// CORRECT: Use data-testid
await page.locator('[data-testid^="object-card-"]').click();
```

## Adding Test IDs to Components

When adding new interactive elements, include `data-testid`:

```tsx
// React component
<Button
  onClick={handleClick}
  data-testid="create-daily-note-button"  // ✓ Add this
>
  + Today's Note
</Button>

// For dynamic IDs
<Card
  data-testid={`object-card-${obj.id}`}  // ✓ Unique per item
>
```

## IPC Testing Pattern

Test IPC handlers directly via `page.evaluate()`:

```typescript
test('getOrCreateTodayDailyNote works', async ({ window: page }) => {
  const result = await page.evaluate(async () => {
    return window.typenoteAPI.getOrCreateTodayDailyNote();
  });

  expect(result.success).toBe(true);
  expect(result.result.dailyNote.typeKey).toBe('DailyNote');
});
```

## UI Interaction Pattern

For UI tests, always wait for elements before interacting:

```typescript
test('button creates note', async ({ window: page }) => {
  // Click button
  await page.getByTestId('create-daily-note-button').click();

  // Wait for result (editor loads)
  await page.waitForSelector('.ProseMirror', { state: 'visible' });

  // Then assert
  await expect(page.getByTestId('nav-prev-button')).toBeVisible();
});
```

## Fixture Usage

The app fixture provides:

- `electronApp`: The Electron application instance
- `window`: A Page object for the main window
- `testDbPath`: Isolated temp database per test

```typescript
import { test, expect } from '../fixtures/app.fixture.js';

test('example', async ({ window: page, testDbPath }) => {
  // testDbPath is unique per test, cleaned up automatically
  // window is ready with domcontentloaded
});
```

## Common Pitfalls

1. **ObjectList doesn't auto-refresh** — After creating objects via IPC, reload the page:

   ```typescript
   await page.evaluate(() => window.typenoteAPI.createObject(...));
   await page.reload();
   await page.waitForLoadState('domcontentloaded');
   ```

2. **Timezone issues in date assertions** — Avoid comparing ISO dates; check UI format:

   ```typescript
   // Fragile (timezone dependent):
   const today = new Date().toISOString().slice(0, 10); // ❌

   // Better (test behavior, not exact date):
   await expect(todayButton).toBeDisabled(); // Already on today
   ```

3. **Native module errors** — If tests fail with `NODE_MODULE_VERSION` mismatch:
   ```bash
   pnpm rebuild:electron  # Then re-run tests
   ```

## Test Helpers

### Unique Content Generation

Generate unique content to avoid test flakiness from stale data:

```typescript
function uniqueContent(testId: string, suffix: string = ''): string {
  const timestamp = Date.now();
  return `UNIQUE_${testId}_${timestamp}${suffix ? '_' + suffix : ''}`;
}

// Usage in test
const title = uniqueContent('search-test', 'document');
await page.evaluate((t) => window.typenoteAPI.createObject('Page', t), title);
```

### ULID-Format Test Block IDs

Generate test block IDs that match ULID format:

```typescript
function generateTestBlockId(suffix: string): string {
  return `01TEST${suffix.padStart(20, '0').toUpperCase()}`;
}

// Usage
const blockId = generateTestBlockId('BLOCK001');
// Returns: '01TEST00000000000BLOCK001'
```

## Framework-Specific Selectors

Some framework selectors are acceptable when they're semantic standards:

```typescript
// ✓ OK: .ProseMirror is the standard TipTap/ProseMirror editor class
await page.waitForSelector('.ProseMirror', { state: 'visible' });

// ✗ AVOID: Custom component classes that may change
await page.locator('.DocumentCard__title'); // Fragile
```

## IPC Result Types

Test types should match the IPC response pattern:

```typescript
// types/global.d.ts
interface IpcSuccess<T> {
  success: true;
  result: T;
}

interface IpcError {
  success: false;
  error: { code: string; message: string };
}

type IpcOutcome<T> = IpcSuccess<T> | IpcError;

// All TypenoteAPI methods return IpcOutcome<T>
interface TypenoteAPI {
  getDocument(objectId: string): Promise<IpcOutcome<GetDocumentResult>>;
  // ...
}
```
