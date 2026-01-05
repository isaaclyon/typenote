#!/usr/bin/env node
import { Command } from 'commander';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs';
import {
  createFileDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  listObjects,
  getDocument,
  searchBlocks,
  applyBlockPatch,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';

// ============================================================================
// Database Setup
// ============================================================================

const TYPENOTE_DIR = join(homedir(), '.typenote');
const DB_PATH = join(TYPENOTE_DIR, 'typenote.db');

function ensureDbDirectory(): void {
  if (!existsSync(TYPENOTE_DIR)) {
    mkdirSync(TYPENOTE_DIR, { recursive: true });
  }
}

function initDb(): TypenoteDb {
  ensureDbDirectory();
  const db = createFileDb(DB_PATH);
  seedBuiltInTypes(db);
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

program.parse();
