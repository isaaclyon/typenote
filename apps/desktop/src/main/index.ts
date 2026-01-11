import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { app, BrowserWindow } from 'electron';
import {
  createFileDb,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
  closeDb,
  getDbPath,
  FilesystemFileService,
  type TypenoteDb,
  type FileService,
} from '@typenote/storage';
import { setupIpcHandlers } from './ipc.js';
import { typenoteEvents } from './events.js';
import { startAttachmentCleanupScheduler, stopAttachmentCleanupScheduler } from './lifecycle.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let db: TypenoteDb | null = null;
let fileService: FileService | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  if (process.env['NODE_ENV'] === 'development') {
    void mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initDatabase(): void {
  const dbPath = process.env['TYPENOTE_DB_PATH'] ?? getDbPath();
  console.log(`[TypeNote] Using database: ${dbPath}`);
  db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);

  // Initialize file service in the same directory as the database
  const attachmentsPath = path.join(path.dirname(dbPath), 'attachments');
  fileService = new FilesystemFileService(attachmentsPath);
  console.log(`[TypeNote] Using attachments directory: ${attachmentsPath}`);
}

function registerIpcHandlers(): void {
  if (!db) throw new Error('Database not initialized');
  if (!fileService) throw new Error('FileService not initialized');
  setupIpcHandlers(db, fileService);
}

function setupEventBroadcasting(): void {
  typenoteEvents.on((event) => {
    // Broadcast to all renderer windows
    for (const window of BrowserWindow.getAllWindows()) {
      if (!window.isDestroyed()) {
        window.webContents.send('typenote:event', event);
      }
    }
  });
}

void app.whenReady().then(async () => {
  initDatabase();
  registerIpcHandlers();
  setupEventBroadcasting();

  // Start attachment cleanup scheduler (runs daily)
  if (db && fileService) {
    await startAttachmentCleanupScheduler(db, fileService, 30);
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Stop attachment cleanup scheduler
  stopAttachmentCleanupScheduler();

  if (db) {
    closeDb(db);
    db = null;
  }
});
