/**
 * Calendar CLI Commands
 *
 * Provides commands for calendar event queries.
 */

import { Command } from 'commander';
import {
  getCalendarTypes,
  getEventsOnDate,
  getEventsInDateRange,
  getUpcomingEvents,
  getAllCalendarItems,
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
// Calendar Command
// ============================================================================

export function registerCalendarCommand(program: Command): void {
  const calendarCmd = program.command('calendar').description('Calendar event query commands');

  // ============================================================================
  // calendar types
  // ============================================================================

  calendarCmd
    .command('types')
    .description('List calendar-enabled object types')
    .action(() => {
      const db = initDb();
      try {
        const types = getCalendarTypes(db);
        if (types.length === 0) {
          console.log('No calendar types found.');
        } else {
          console.log(`Found ${types.length} calendar type(s):`);
          console.log(JSON.stringify(types, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // calendar on <date>
  // ============================================================================

  calendarCmd
    .command('on')
    .description('Get events on a specific date')
    .argument('<date>', 'Date in YYYY-MM-DD format')
    .action((date: string) => {
      const db = initDb();
      try {
        const dateKey = parseDateKey(date);
        const items = getEventsOnDate(db, dateKey);
        if (items.length === 0) {
          console.log(`No events on ${dateKey}.`);
        } else {
          console.log(`Found ${items.length} event(s) on ${dateKey}:`);
          console.log(JSON.stringify(items, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // calendar range <startDate> <endDate>
  // ============================================================================

  calendarCmd
    .command('range')
    .description('Get events in a date range')
    .argument('<startDate>', 'Start date (YYYY-MM-DD)')
    .argument('<endDate>', 'End date (YYYY-MM-DD)')
    .action((startDate: string, endDate: string) => {
      const db = initDb();
      try {
        const start = parseDateKey(startDate);
        const end = parseDateKey(endDate);
        const items = getEventsInDateRange(db, start, end);
        if (items.length === 0) {
          console.log(`No events between ${start} and ${end}.`);
        } else {
          console.log(`Found ${items.length} event(s) between ${start} and ${end}:`);
          console.log(JSON.stringify(items, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // calendar upcoming [--days N]
  // ============================================================================

  calendarCmd
    .command('upcoming')
    .description('Get upcoming events in the next N days')
    .option('-d, --days <number>', 'Number of days ahead', '7')
    .action((options: { days: string }) => {
      const db = initDb();
      try {
        const days = parseInt(options.days, 10);
        if (isNaN(days) || days < 1) {
          console.error('Error: --days must be a positive number');
          process.exit(1);
        }

        const items = getUpcomingEvents(db, days);
        if (items.length === 0) {
          console.log(`No upcoming events in the next ${days} days.`);
        } else {
          console.log(`Found ${items.length} upcoming event(s) in the next ${days} days:`);
          console.log(JSON.stringify(items, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // ============================================================================
  // calendar list [options]
  // ============================================================================

  calendarCmd
    .command('list')
    .description('List all calendar items with optional filters')
    .option(
      '-t, --type <typeKey>',
      'Filter by type key (can be repeated)',
      (val: string, prev: string[]) => [...prev, val],
      [] as string[]
    )
    .option('--from <date>', 'Start date (YYYY-MM-DD)')
    .option('--to <date>', 'End date (YYYY-MM-DD)')
    .action((options: { type: string[]; from?: string; to?: string }) => {
      const db = initDb();
      try {
        // Build options object conditionally for exactOptionalPropertyTypes
        const queryOptions: {
          typeKeys?: string[];
          startDate?: string;
          endDate?: string;
        } = {};

        // Add type filter if provided
        if (options.type.length > 0) {
          queryOptions.typeKeys = options.type;
        }

        // Validate and add date filters if provided
        if (options.from) {
          queryOptions.startDate = parseDateKey(options.from);
        }
        if (options.to) {
          queryOptions.endDate = parseDateKey(options.to);
        }

        const items = getAllCalendarItems(db, queryOptions);

        if (items.length === 0) {
          console.log('No calendar items found.');
        } else {
          console.log(`Found ${items.length} calendar item(s):`);
          console.log(JSON.stringify(items, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
