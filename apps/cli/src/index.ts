#!/usr/bin/env node
import { Command } from 'commander';
import {
  createFileDb,
  closeDb,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
  createObject,
  listObjects,
  getDocument,
  searchBlocks,
  applyBlockPatch,
  getDbPath,
  // Task service
  getTodaysTasks,
  getOverdueTasks,
  getTasksByStatus,
  getUpcomingTasks,
  getInboxTasks,
  getTasksByPriority,
  getCompletedTasks,
  completeTask,
  reopenTask,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';

// ============================================================================
// Database Setup
// ============================================================================

function initDb(): TypenoteDb {
  const dbPath = getDbPath();
  console.log(`Using database: ${dbPath}`);
  const db = createFileDb(dbPath);
  seedBuiltInTypes(db);
  seedDailyNoteTemplate(db);
  return db;
}

// ============================================================================
// CLI Program
// ============================================================================

const program = new Command();

program.name('typenote').description('TypeNote CLI - Backend testing interface').version('0.1.0');

program
  .command('hello')
  .description('Hello world test command')
  .action(() => {
    console.log('Hello from TypeNote CLI!');
    console.log('Backend services will be accessible here.');
  });

// ============================================================================
// create <typeKey> <title> [--props JSON]
// ============================================================================

program
  .command('create')
  .description('Create a new object')
  .argument('<typeKey>', 'Object type key (e.g., Page, Person, DailyNote)')
  .argument('<title>', 'Object title')
  .option('-p, --props <json>', 'Properties as JSON string')
  .action((typeKey: string, title: string, options: { props?: string }) => {
    const db = initDb();
    try {
      let properties: Record<string, unknown> | undefined;
      if (options.props) {
        try {
          properties = JSON.parse(options.props) as Record<string, unknown>;
        } catch {
          console.error('Error: Invalid JSON for --props');
          process.exit(1);
        }
      }

      const result = createObject(db, typeKey, title, properties);
      console.log('Created object:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// list [--type <typeKey>]
// ============================================================================

program
  .command('list')
  .description('List all objects')
  .option('-t, --type <typeKey>', 'Filter by type key')
  .action((options: { type?: string }) => {
    const db = initDb();
    try {
      let results = listObjects(db);

      if (options.type) {
        results = results.filter((obj) => obj.typeKey === options.type);
      }

      if (results.length === 0) {
        console.log('No objects found.');
      } else {
        console.log(`Found ${results.length} object(s):`);
        console.log(JSON.stringify(results, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// get <objectId>
// ============================================================================

program
  .command('get')
  .description('Get an object by ID with its document content')
  .argument('<objectId>', 'Object ID (ULID)')
  .action((objectId: string) => {
    const db = initDb();
    try {
      const document = getDocument(db, objectId);
      console.log('Document:');
      console.log(JSON.stringify(document, null, 2));
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// search <query>
// ============================================================================

program
  .command('search')
  .description('Search blocks using full-text search')
  .argument('<query>', 'Search query')
  .option('-l, --limit <number>', 'Maximum results', '50')
  .action((query: string, options: { limit: string }) => {
    const db = initDb();
    try {
      const limit = parseInt(options.limit, 10);
      const results = searchBlocks(db, query, { limit });

      if (results.length === 0) {
        console.log('No results found.');
      } else {
        console.log(`Found ${results.length} result(s):`);
        console.log(JSON.stringify(results, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// patch-insert <objectId> <blockType> <text>
// ============================================================================

/**
 * Build block content based on block type and text.
 */
function buildContent(
  blockType: string,
  text: string,
  options: { level?: string }
): Record<string, unknown> {
  const inline = [{ t: 'text' as const, text }];

  switch (blockType) {
    case 'paragraph':
      return { inline };
    case 'heading':
      return { level: parseInt(options.level ?? '1', 10), inline };
    case 'blockquote':
      return {};
    default:
      return { inline };
  }
}

program
  .command('patch-insert')
  .description('Insert a new block into an object')
  .argument('<objectId>', 'Object ID')
  .argument('<blockType>', 'Block type (paragraph, heading, blockquote)')
  .argument('<text>', 'Text content')
  .option('-l, --level <n>', 'Heading level (1-6)', '1')
  .option('-p, --parent <blockId>', 'Parent block ID (omit for root)')
  .action(
    (
      objectId: string,
      blockType: string,
      text: string,
      options: { level?: string; parent?: string }
    ) => {
      const db = initDb();
      try {
        const blockId = generateId();
        const content = buildContent(blockType, text, options);

        const result = applyBlockPatch(db, {
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId: options.parent ?? null,
              place: { where: 'end' },
              blockType,
              content,
            },
          ],
        });

        if (result.success) {
          console.log('Block inserted:');
          console.log(JSON.stringify({ blockId, ...result.result }, null, 2));
        } else {
          console.error('Error:', result.error.message);
          process.exit(1);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    }
  );

// ============================================================================
// patch-update <objectId> <blockId> <text>
// ============================================================================

program
  .command('patch-update')
  .description('Update block content')
  .argument('<objectId>', 'Object ID')
  .argument('<blockId>', 'Block ID to update')
  .argument('<text>', 'New text content')
  .action((objectId: string, blockId: string, text: string) => {
    const db = initDb();
    try {
      const content = { inline: [{ t: 'text' as const, text }] };

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: { content },
          },
        ],
      });

      if (result.success) {
        console.log('Block updated:');
        console.log(JSON.stringify(result.result, null, 2));
      } else {
        console.error('Error:', result.error.message);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// patch-delete <objectId> <blockId>
// ============================================================================

program
  .command('patch-delete')
  .description('Delete a block')
  .argument('<objectId>', 'Object ID')
  .argument('<blockId>', 'Block ID to delete')
  .option('-s, --subtree', 'Delete entire subtree')
  .action((objectId: string, blockId: string, options: { subtree?: boolean }) => {
    const db = initDb();
    try {
      const deleteOp: { op: 'block.delete'; blockId: string; subtree?: true } = {
        op: 'block.delete',
        blockId,
      };
      if (options.subtree) {
        deleteOp.subtree = true;
      }

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [deleteOp],
      });

      if (result.success) {
        console.log('Block deleted:');
        console.log(JSON.stringify(result.result, null, 2));
      } else {
        console.error('Error:', result.error.message);
        process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

// ============================================================================
// Task Commands
// ============================================================================

const taskCmd = program.command('task').description('Task management commands');

taskCmd
  .command('today')
  .description("List today's tasks")
  .action(() => {
    const db = initDb();
    try {
      const tasks = getTodaysTasks(db);
      if (tasks.length === 0) {
        console.log('No tasks due today.');
      } else {
        console.log(`Today's tasks (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('overdue')
  .description('List overdue tasks')
  .action(() => {
    const db = initDb();
    try {
      const tasks = getOverdueTasks(db);
      if (tasks.length === 0) {
        console.log('No overdue tasks.');
      } else {
        console.log(`Overdue tasks (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('inbox')
  .description('List tasks without a due date')
  .action(() => {
    const db = initDb();
    try {
      const tasks = getInboxTasks(db);
      if (tasks.length === 0) {
        console.log('No inbox tasks.');
      } else {
        console.log(`Inbox tasks (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('upcoming')
  .description('List upcoming tasks')
  .option('-d, --days <number>', 'Days ahead to look', '7')
  .action((options: { days: string }) => {
    const db = initDb();
    try {
      const days = parseInt(options.days, 10);
      const tasks = getUpcomingTasks(db, days);
      if (tasks.length === 0) {
        console.log(`No tasks due in the next ${days} days.`);
      } else {
        console.log(`Upcoming tasks in ${days} days (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('by-status')
  .description('List tasks by status')
  .argument('<status>', 'Status: Backlog, Todo, InProgress, Done')
  .action((status: string) => {
    const db = initDb();
    try {
      const validStatuses = ['Backlog', 'Todo', 'InProgress', 'Done'];
      if (!validStatuses.includes(status)) {
        console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        process.exit(1);
      }
      const tasks = getTasksByStatus(db, status as 'Backlog' | 'Todo' | 'InProgress' | 'Done');
      if (tasks.length === 0) {
        console.log(`No tasks with status "${status}".`);
      } else {
        console.log(`Tasks with status "${status}" (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('by-priority')
  .description('List tasks by priority')
  .argument('<priority>', 'Priority: Low, Medium, High')
  .action((priority: string) => {
    const db = initDb();
    try {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (!validPriorities.includes(priority)) {
        console.error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
        process.exit(1);
      }
      const tasks = getTasksByPriority(db, priority as 'Low' | 'Medium' | 'High');
      if (tasks.length === 0) {
        console.log(`No tasks with priority "${priority}".`);
      } else {
        console.log(`Tasks with priority "${priority}" (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('completed')
  .description('List completed tasks')
  .option('--start <date>', 'Start date (YYYY-MM-DD)')
  .option('--end <date>', 'End date (YYYY-MM-DD)')
  .action((options: { start?: string; end?: string }) => {
    const db = initDb();
    try {
      // Build options object only with defined values (exactOptionalPropertyTypes)
      const queryOptions: { startDate?: string; endDate?: string } = {};
      if (options.start !== undefined) queryOptions.startDate = options.start;
      if (options.end !== undefined) queryOptions.endDate = options.end;
      const tasks = getCompletedTasks(db, queryOptions);
      if (tasks.length === 0) {
        console.log('No completed tasks found.');
      } else {
        console.log(`Completed tasks (${tasks.length}):`);
        console.log(JSON.stringify(tasks, null, 2));
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('complete')
  .description('Mark a task as completed')
  .argument('<taskId>', 'Task ID')
  .action((taskId: string) => {
    const db = initDb();
    try {
      completeTask(db, taskId);
      console.log(`Task ${taskId} marked as completed.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

taskCmd
  .command('reopen')
  .description('Reopen a completed task')
  .argument('<taskId>', 'Task ID')
  .action((taskId: string) => {
    const db = initDb();
    try {
      reopenTask(db, taskId);
      console.log(`Task ${taskId} reopened.`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

program.parse();
