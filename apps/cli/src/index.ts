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
  // Object type service
  listObjectTypes,
  getObjectTypeByKey,
  createObjectType,
  getResolvedSchema,
  ObjectTypeError,
  BUILT_IN_TYPES,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { registerExportCommand, registerImportCommand } from './commands/export.js';
import { registerAttachmentCommand } from './commands/attachment.js';
import { registerTemplateCommand } from './commands/template.js';
import { registerTagCommand } from './commands/tag.js';
import { registerBacklinksCommand } from './commands/backlinks.js';

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

// ============================================================================
// Dev Commands (Object Type Inheritance Testing)
// ============================================================================

const devCmd = program.command('dev').description('Development and testing commands');

devCmd
  .command('list-types')
  .description('List all object types showing inheritance hierarchy')
  .action(() => {
    const db = initDb();
    try {
      const types = listObjectTypes(db);

      // Group types by parent relationship
      const parentTypes = types.filter((t) => t.parentTypeId === null);
      const childTypes = types.filter((t) => t.parentTypeId !== null);

      // Create a map of parent ID to children
      const childrenByParent = new Map<string, typeof types>();
      for (const child of childTypes) {
        if (child.parentTypeId) {
          const existing = childrenByParent.get(child.parentTypeId) ?? [];
          existing.push(child);
          childrenByParent.set(child.parentTypeId, existing);
        }
      }

      console.log('Object Types:');
      console.log('');

      for (const parent of parentTypes) {
        const builtInLabel = parent.builtIn ? ' (built-in)' : ' (custom)';
        const color = parent.color ?? 'none';
        console.log(
          `${parent.key}${builtInLabel} - ${parent.pluralName ?? parent.name} - ${color}`
        );

        // Show children
        const children = childrenByParent.get(parent.id) ?? [];
        for (const child of children) {
          const parentType = getObjectTypeByKey(db, parent.key);
          const inheritsFrom = parentType ? parentType.key : 'unknown';
          console.log(
            `  └─ ${child.key} (custom) - ${child.pluralName ?? child.name} - inherits from ${inheritsFrom}`
          );
        }
      }

      // Show any orphaned children (shouldn't happen, but handle gracefully)
      const shownChildIds = new Set(
        Array.from(childrenByParent.values())
          .flat()
          .map((c) => c.id)
      );
      const orphanedChildren = childTypes.filter((c) => !shownChildIds.has(c.id));
      for (const orphan of orphanedChildren) {
        console.log(`${orphan.key} (custom, orphaned) - ${orphan.pluralName ?? orphan.name}`);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

devCmd
  .command('create-child-type')
  .description('Create a custom type with a parent')
  .argument('<key>', 'Unique type key (e.g., Employee)')
  .argument('<name>', 'Display name (e.g., "Employee")')
  .option('-p, --parent <parentKey>', 'Parent type key (e.g., Person)', 'Page')
  .option('--plural <pluralName>', 'Plural name (e.g., "Employees")')
  .option('--color <color>', 'Hex color (e.g., #FF5733)')
  .option('--icon <icon>', 'Icon name')
  .action(
    (
      key: string,
      name: string,
      options: { parent: string; plural?: string; color?: string; icon?: string }
    ) => {
      const db = initDb();
      try {
        // Find parent type
        const parentType = getObjectTypeByKey(db, options.parent);
        if (!parentType) {
          console.error(`Error: Parent type '${options.parent}' not found.`);
          console.log('Available types:');
          const types = listObjectTypes(db);
          for (const t of types) {
            console.log(`  - ${t.key}`);
          }
          process.exit(1);
        }

        // Build input with only defined optional values (exactOptionalPropertyTypes)
        const input: Parameters<typeof createObjectType>[1] = {
          key,
          name,
          parentTypeId: parentType.id,
        };
        if (options.plural !== undefined) input.pluralName = options.plural;
        if (options.color !== undefined) input.color = options.color;
        if (options.icon !== undefined) input.icon = options.icon;

        const result = createObjectType(db, input);

        console.log('Created child type:');
        console.log(`  Key: ${result.key}`);
        console.log(`  Name: ${result.name}`);
        console.log(`  Plural Name: ${result.pluralName ?? '(not set)'}`);
        console.log(`  Parent: ${options.parent}`);
        console.log(`  Color: ${result.color ?? '(inherited)'}`);
        console.log(`  Icon: ${result.icon ?? '(inherited)'}`);
        console.log(`  ID: ${result.id}`);
      } catch (error) {
        if (error instanceof ObjectTypeError) {
          console.error(`Error [${error.code}]: ${error.message}`);
          if (error.details) {
            console.error('Details:', JSON.stringify(error.details, null, 2));
          }
        } else {
          console.error('Error:', error instanceof Error ? error.message : String(error));
        }
        process.exit(1);
      } finally {
        closeDb(db);
      }
    }
  );

devCmd
  .command('show-resolved-schema')
  .description('Show resolved schema for a type including inherited properties')
  .argument('<typeKey>', 'Type key (e.g., Employee, Person)')
  .action((typeKey: string) => {
    const db = initDb();
    try {
      const type = getObjectTypeByKey(db, typeKey);
      if (!type) {
        console.error(`Error: Type '${typeKey}' not found.`);
        console.log('Available types:');
        const types = listObjectTypes(db);
        for (const t of types) {
          console.log(`  - ${t.key}`);
        }
        process.exit(1);
      }

      const resolved = getResolvedSchema(db, type.id);

      console.log(`Resolved Schema for ${typeKey}:`);
      console.log('');
      console.log('Type Info:');
      console.log(`  Key: ${type.key}`);
      console.log(`  Name: ${type.name}`);
      console.log(`  Plural Name: ${type.pluralName ?? '(not set)'}`);
      console.log(`  Color: ${type.color ?? '(not set)'}`);
      console.log(`  Built-in: ${type.builtIn}`);
      console.log(`  Parent Type ID: ${type.parentTypeId ?? '(none)'}`);
      console.log('');

      if (resolved.inheritedFrom.length > 0) {
        console.log(`Inherited From: ${resolved.inheritedFrom.join(' -> ')}`);
        console.log('');
      }

      if (resolved.properties.length === 0) {
        console.log('Properties: (none)');
      } else {
        console.log('Properties:');
        for (const prop of resolved.properties) {
          const required = prop.required ? ' (required)' : '';
          const defaultVal =
            'defaultValue' in prop && prop.defaultValue !== undefined
              ? ` [default: ${String(prop.defaultValue)}]`
              : '';
          const options =
            'options' in prop && prop.options ? ` options: [${prop.options.join(', ')}]` : '';
          console.log(`  - ${prop.key}: ${prop.type}${required}${defaultVal}${options}`);
        }
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      closeDb(db);
    }
  });

devCmd
  .command('hello')
  .description('Hello world test command')
  .action(() => {
    console.log('Hello from TypeNote CLI!');
    console.log('Backend services will be accessible here.');
    console.log('');
    console.log('Built-in Types:');
    for (const [key, config] of Object.entries(BUILT_IN_TYPES)) {
      console.log(`  ${key}: ${config.pluralName} (${config.color})`);
    }
  });

// ============================================================================
// Export/Import Commands
// ============================================================================

registerExportCommand(program);
registerImportCommand(program);
registerAttachmentCommand(program);
registerTemplateCommand(program);
registerTagCommand(program);
registerBacklinksCommand(program);

program.parse();
