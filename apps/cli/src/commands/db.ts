/**
 * Shared database initialization for CLI commands.
 */

import {
  createFileDb,
  closeDb,
  getDbPath,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
  type TypenoteDb,
} from '@typenote/storage';

/**
 * Initialize the database connection.
 * Seeds built-in types and daily note template.
 */
export function initDb(): TypenoteDb {
  const dbPath = getDbPath();
  console.log(`Using database: ${dbPath}`);
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

/**
 * Initialize the database connection without logging.
 * Seeds built-in types and daily note template.
 */
export function initDbQuiet(): TypenoteDb {
  const dbPath = getDbPath();
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

export { closeDb };
