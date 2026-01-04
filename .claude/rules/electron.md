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
