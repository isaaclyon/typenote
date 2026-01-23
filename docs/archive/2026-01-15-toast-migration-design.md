# Toast Migration Design

**Date:** 2026-01-15
**Status:** Approved

## Overview

Migrate Toast/Toaster from direct Sonner imports in desktop app to exports from design-system, providing a consistent import experience.

## Goal

All UI imports should come from `@typenote/design-system` for developer experience consistency.

## Approach

Wrap Sonner in design-system rather than building custom toast infrastructure. Sonner provides battle-tested queue management, animations, and positioning.

## Changes

### Design-System

**New file:** `packages/design-system/src/components/Toast/Toaster.tsx`

```typescript
import type { ReactElement } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(): ReactElement {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'bg-background border border-border rounded shadow-md text-foreground',
          error: 'border-l-2 border-l-error',
          success: 'border-l-2 border-l-success',
          warning: 'border-l-2 border-l-warning',
          description: 'text-muted-foreground',
          title: 'font-medium',
        },
      }}
    />
  );
}
```

**Update:** `packages/design-system/src/components/Toast/index.ts`

```typescript
export { Toast, toastVariants } from './Toast.js';
export { Toaster } from './Toaster.js';
export { toast } from 'sonner';
export type * from './types.js';
```

**Add dependency:**

```bash
pnpm --filter @typenote/design-system add sonner
```

### Desktop App

**Update imports:**

```typescript
// Before
import { Toaster } from './components/ui/sonner.js';
import { toast } from 'sonner';

// After
import { Toaster, toast } from '@typenote/design-system';
```

**Files to update:**

- `apps/desktop/src/renderer/App.tsx` — Toaster import
- `apps/desktop/src/renderer/hooks/useImageUpload.ts` — toast import
- `apps/desktop/src/renderer/lib/ipc.ts` — toast import (if applicable)

**Delete:**

- `apps/desktop/src/renderer/components/ui/sonner.tsx`

**Remove from package.json:**

- `sonner` dependency (now in design-system)

## Testing

- Ladle story with buttons to trigger each toast variant
- Existing `useImageUpload.test.ts` continues to work
- Manual verification in desktop app

## Verification

```bash
just audit-design-system
# Toast should show as ✅ migrated
```

## Migration Steps

1. Add Sonner to design-system package
2. Create `Toaster.tsx` wrapper
3. Update `index.ts` exports
4. Create Ladle story
5. Update desktop app imports
6. Delete old `sonner.tsx`
7. Remove Sonner from desktop package.json
8. Run audit script to verify
