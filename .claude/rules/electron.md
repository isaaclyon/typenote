---
paths: apps/desktop/**/*.ts, apps/desktop/**/*.tsx
---

# Electron Rules

The desktop app uses Electron with strict process isolation. The renderer NEVER has direct access to Node.js or the database.

## Process Boundaries

```
┌─────────────────────────────────────────────────────┐
│  MAIN PROCESS (apps/desktop/src/main/)              │
│  ✓ Node.js access                                   │
│  ✓ Database access (@typenote/storage)              │
│  ✓ Filesystem access                                │
│  ✓ IPC handlers                                     │
└─────────────────────┬───────────────────────────────┘
                      │ contextBridge
┌─────────────────────┴───────────────────────────────┐
│  PRELOAD (apps/desktop/src/preload/)                │
│  ✓ Exposes typed API to renderer                    │
│  ✗ No direct DB access                              │
└─────────────────────┬───────────────────────────────┘
                      │ window.typenoteAPI
┌─────────────────────┴───────────────────────────────┐
│  RENDERER PROCESS (apps/desktop/src/renderer/)      │
│  ✓ React UI                                         │
│  ✓ window.typenoteAPI calls                         │
│  ✗ No Node.js (nodeIntegration: false)              │
│  ✗ No DB imports                                    │
└─────────────────────────────────────────────────────┘
```

## Required Patterns

### IPC Handler in Main

```typescript
// apps/desktop/src/main/ipc.ts
import { ipcMain } from 'electron';
import { applyBlockPatch } from '@typenote/storage';

ipcMain.handle('applyBlockPatch', async (event, request) => {
  // Validate request with Zod
  const validated = BlockPatchRequestSchema.safeParse(request);
  if (!validated.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', ... } };
  }

  // Execute operation
  const result = await applyBlockPatch(validated.data);
  return result;
});
```

### Preload Exposes Typed API

```typescript
// apps/desktop/src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('typenoteAPI', {
  applyBlockPatch: (request: BlockPatchRequest) => ipcRenderer.invoke('applyBlockPatch', request),

  getDocument: (objectId: string) => ipcRenderer.invoke('getDocument', objectId),
});
```

### Renderer Uses Exposed API

```typescript
// apps/desktop/src/renderer/hooks/useDocument.ts
export function useDocument(objectId: string) {
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    window.typenoteAPI.getDocument(objectId).then(setDoc);
  }, [objectId]);

  return doc;
}
```

## Security Requirements

BrowserWindow must be configured securely:

```typescript
new BrowserWindow({
  webPreferences: {
    nodeIntegration: false, // REQUIRED
    contextIsolation: true, // REQUIRED
    preload: path.join(__dirname, 'preload.js'),
  },
});
```

**Never enable:**

- `nodeIntegration: true`
- `contextIsolation: false`
- `webSecurity: false`

## Anti-Patterns

### Direct DB Import in Renderer

```typescript
// DON'T: apps/desktop/src/renderer/App.tsx
import { db } from '@typenote/storage'; // SECURITY VIOLATION
```

### Node Modules in Renderer

```typescript
// DON'T: apps/desktop/src/renderer/utils.ts
import { readFile } from 'fs'; // Won't work, nodeIntegration is false
```

## Vite Configuration

**CRITICAL:** Always use relative base path for Electron:

```typescript
// apps/desktop/vite.config.ts
export default defineConfig({
  base: './', // REQUIRED for file:// protocol
  build: {
    outDir: '../../dist/renderer',
  },
});
```

**Why:** Electron loads the renderer via `file://` protocol. Vite's default `base: '/'` generates absolute paths like `/assets/index.js` which resolve to the filesystem root, not the app directory.

## Native Modules (better-sqlite3)

This project uses `better-sqlite3` which requires compilation for the correct Node.js ABI:

- **Unit tests** run in Node.js (e.g., NODE_MODULE_VERSION 141)
- **Electron app** uses bundled Node.js (e.g., NODE_MODULE_VERSION 130)

### Rebuild Script

The smart rebuild script (`scripts/ensure-native-build.mjs`) handles switching:

```bash
pnpm rebuild:node      # For unit tests
pnpm rebuild:electron  # For Electron app/E2E tests
```

Pre-hooks automatically run the correct rebuild:

- `pnpm test` → rebuilds for Node.js
- `pnpm dev` / `pnpm test:e2e` → rebuilds for Electron

### Why not electron-rebuild?

`electron-rebuild` doesn't work reliably with pnpm's nested `node_modules/.pnpm/` structure. The script uses `node-gyp` directly with explicit paths instead.
