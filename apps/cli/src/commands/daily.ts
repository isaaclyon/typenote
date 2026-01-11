/**
 * Daily Note CLI Commands
 *
 * Provides commands for daily note management.
 */

import { Command } from 'commander';
import {
  getOrCreateDailyNoteByDate,
  getOrCreateTodayDailyNote,
  listDailyNotes,
  getDailyNoteSlug,
  type DailyNote,
} from '@typenote/storage';
import { initDb, closeDb } from './db.js';

// ============================================================================
// Helper: Parse and validate date string
// ============================================================================

/**
 * Parse a date string and validate YYYY-MM-DD format.
 * @throws Error if format is invalid
 */
function parseDateKey(input: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    throw new Error(`Invalid date format: '${input}'. Expected YYYY-MM-DD.`);
  }
  return input;
}

// ============================================================================
// Daily Command
// ============================================================================

export function registerDailyCommand(program: Command): void {
  const dailyCmd = program.command('daily').description('Daily note management commands');

  // ============================================================================
  // daily today
  // ============================================================================

  dailyCmd
    .command('today')
    .description("Get or create today's daily note")
    .action(() => {
      const db = initDb();
      try {
        const result = getOrCreateTodayDailyNote(db);
        console.log(`Daily note ${result.created ? 'created' : 'found'}:`);
        console.log(JSON.stringify(result.dailyNote, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // daily get <date>
  // ============================================================================

  dailyCmd
    .command('get')
    .description('Get or create daily note for a specific date')
    .argument('<date>', 'Date in YYYY-MM-DD format')
    .action((date: string) => {
      const db = initDb();
      try {
        const dateKey = parseDateKey(date);
        const result = getOrCreateDailyNoteByDate(db, dateKey);
        console.log(`Daily note ${result.created ? 'created' : 'found'}:`);
        console.log(JSON.stringify(result.dailyNote, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // daily list [options]
  // ============================================================================

  dailyCmd
    .command('list')
    .description('List daily notes')
    .option('-l, --limit <number>', 'Maximum results', '10')
    .option('-o, --offset <number>', 'Skip first N results', '0')
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .action((options: { limit: string; offset: string; from?: string; to?: string }) => {
      const db = initDb();
      try {
        const limit = parseInt(options.limit, 10);
        const offset = parseInt(options.offset, 10);

        if (isNaN(limit) || limit < 1) {
          console.error('Error: --limit must be a positive number');
          process.exit(1);
        }

        if (isNaN(offset) || offset < 0) {
          console.error('Error: --offset must be a non-negative number');
          process.exit(1);
        }

        // Build options object conditionally for exactOptionalPropertyTypes
        const listOptions: {
          limit: number;
          offset: number;
          startDate?: string;
          endDate?: string;
        } = { limit, offset };

        // Validate and add date filters if provided
        if (options.from) {
          listOptions.startDate = parseDateKey(options.from);
        }
        if (options.to) {
          listOptions.endDate = parseDateKey(options.to);
        }

        const result = listDailyNotes(db, listOptions);

        if (result.items.length === 0) {
          console.log('No daily notes found.');
        } else {
          console.log(`Found ${result.items.length} daily note(s) (total: ${result.total}):`);
          console.log(JSON.stringify(result.items, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // daily slug <date>
  // ============================================================================

  dailyCmd
    .command('slug')
    .description('Generate slug for a daily note date (utility)')
    .argument('<date>', 'Date in YYYY-MM-DD format')
    .action((date: string) => {
      const db = initDb();
      try {
        const dateKey = parseDateKey(date);
        // Create a minimal DailyNote object just for slug generation
        const dailyNote: DailyNote = {
          id: '',
          typeId: '',
          title: dateKey,
          properties: { date_key: dateKey },
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const slug = getDailyNoteSlug(dailyNote);
        console.log(slug);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
