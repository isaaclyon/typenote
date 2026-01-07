import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { app, BrowserWindow } from 'electron';
import {
  createFileDb,
  seedBuiltInTypes,
  closeDb,
  getDbPath,
  type TypenoteDb,
} from '@typenote/storage';
import { setupIpcHandlers } from './ipc.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let db: TypenoteDb | null = null;

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
}

function registerIpcHandlers(): void {
  if (!db) throw new Error('Database not initialized');
  setupIpcHandlers(db);
}

void app.whenReady().then(() => {
  initDatabase();
  registerIpcHandlers();
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
  if (db) {
    closeDb(db);
    db = null;
  }
});
