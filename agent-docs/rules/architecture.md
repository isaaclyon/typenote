# Architecture Guidelines

## Package Hierarchy

The monorepo has strict dependency boundaries:

```
┌─────────────────┐
│   apps/desktop  │  ← Can import all packages
│   apps/cli      │
└────────┬────────┘
         │
┌────────┴────────┐
│ packages/storage│  ← Can import api, core
└────────┬────────┘
         │
┌────────┴────────┐
│  packages/core  │  ← Can import api only
└────────┬────────┘
         │
┌────────┴────────┐
│  packages/api   │  ← No internal imports
└─────────────────┘
```

## Anti-Patterns to Avoid

### Circular Dependencies

**Bad:** api importing from core

```typescript
// DON'T: packages/api/src/something.ts
import { someUtil } from '@typenote/core'; // Creates cycle!
```

**Good:** Keep api as the foundation

```typescript
// DO: packages/core/src/something.ts
import { SomeType } from '@typenote/api'; // Correct direction
```

### Electron in Packages

**Bad:** Importing Electron in shared packages

```typescript
// DON'T: packages/core/src/something.ts
import { app } from 'electron'; // Breaks package purity!
```

**Good:** Keep Electron isolated to desktop app

```typescript
// DO: apps/desktop/src/main/index.ts
import { app } from 'electron'; // Only in main process
```

### DB Access in Renderer

**Bad:** Importing storage in renderer

```typescript
// DON'T: apps/desktop/src/renderer/App.tsx
import { db } from '@typenote/storage'; // Security violation!
```

**Good:** Use IPC via preload

```typescript
// DO: apps/desktop/src/renderer/App.tsx
const result = await window.typenoteAPI.getDocument(id);
```

## File Organization

| Concern           | Location                     |
| ----------------- | ---------------------------- |
| API contracts     | `packages/api/src/`          |
| Domain logic      | `packages/core/src/`         |
| Database layer    | `packages/storage/src/`      |
| CLI commands      | `apps/cli/src/`              |
| Electron main     | `apps/desktop/src/main/`     |
| Electron preload  | `apps/desktop/src/preload/`  |
| React UI          | `apps/desktop/src/renderer/` |
| Foundational docs | `docs/foundational/`         |
