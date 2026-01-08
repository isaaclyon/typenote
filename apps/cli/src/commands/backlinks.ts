/**
 * Backlinks CLI Commands
 *
 * Provides commands for discovering incoming references to objects.
 */

import { Command } from 'commander';
import {
  createFileDb,
  closeDb,
  getDbPath,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
  getBacklinks,
  type TypenoteDb,
} from '@typenote/storage';

// ============================================================================
// Database Setup
// ============================================================================

function initDb(): TypenoteDb {
  const dbPath = getDbPath();
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

// ============================================================================
// Backlinks Command
// ============================================================================

export function registerBacklinksCommand(program: Command): void {
  const backlinksCmd = program.command('backlinks').description('Discover incoming references');

  // backlinks get <objectId>
  backlinksCmd
    .command('get')
    .description('Get all blocks that reference a given object')
    .argument('<objectId>', 'Target object ID (ULID)')
    .action((objectId: string) => {
      const db = initDb();
      try {
        const backlinks = getBacklinks(db, objectId);

        if (backlinks.length === 0) {
          console.log(`No backlinks found for object: ${objectId}`);
        } else {
          console.log(`Found ${backlinks.length} backlink(s) to object ${objectId}:`);
          console.log(JSON.stringify(backlinks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
