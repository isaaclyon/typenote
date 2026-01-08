/**
 * Export/Import CLI Commands
 *
 * Provides commands for exporting and importing TypeNote objects.
 */

import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import {
  exportObject,
  exportObjectsByType,
  exportToFolder,
  importObject,
  importFromFolder,
  deterministicStringify,
  getObject,
  getObjectTypeByKey,
  type ExportedObject,
  type ExportManifest,
} from '@typenote/storage';
import { initDbQuiet as initDb, closeDb } from './db.js';

// ============================================================================
// Export Command
// ============================================================================

export function registerExportCommand(program: Command): void {
  const exportCmd = program.command('export').description('Export objects to JSON');

  // export object <objectId>
  exportCmd
    .command('object')
    .description('Export a single object to JSON (prints to stdout)')
    .argument('<objectId>', 'Object ID (ULID)')
    .action((objectId: string) => {
      const db = initDb();
      try {
        const exported = exportObject(db, objectId);

        if (!exported) {
          console.error(`Error: Object not found: ${objectId}`);
          process.exit(1);
        }

        // Pretty print to stdout
        console.log(deterministicStringify(exported).trim());
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // export type <typeKey>
  exportCmd
    .command('type')
    .description('Export all objects of a type to JSON (prints to stdout)')
    .argument('<typeKey>', 'Type key (e.g., Page, Person, DailyNote)')
    .action((typeKey: string) => {
      const db = initDb();
      try {
        const exported = exportObjectsByType(db, typeKey);

        if (exported.length === 0) {
          console.error(`No objects found for type: ${typeKey}`);
          process.exit(1);
        }

        // Print as JSON array
        console.log(JSON.stringify(exported, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // export folder <folderPath>
  exportCmd
    .command('folder')
    .description('Export entire database to a folder structure')
    .argument('<folderPath>', 'Path to export folder')
    .action((folderPath: string) => {
      const db = initDb();
      try {
        const manifest = exportToFolder(db, folderPath);

        console.log('Export complete:');
        console.log(`  Types exported: ${manifest.typeCount}`);
        console.log(`  Objects exported: ${manifest.objectCount}`);
        console.log(`  Blocks exported: ${manifest.blockCount}`);
        console.log(`  Exported at: ${manifest.exportedAt}`);
        console.log(`  Location: ${folderPath}`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}

// ============================================================================
// Import Command
// ============================================================================

export function registerImportCommand(program: Command): void {
  const importCmd = program.command('import').description('Import objects from JSON');

  // import object <jsonFile> [--merge] [--dry-run]
  importCmd
    .command('object')
    .description('Import a single object from JSON file')
    .argument('<jsonFile>', 'Path to JSON file')
    .option('-m, --merge', 'Skip existing objects instead of replacing them')
    .option('--dry-run', 'Preview what would be imported without actually importing')
    .action((jsonFile: string, options: { merge?: boolean; dryRun?: boolean }) => {
      const db = initDb();
      try {
        // Read and parse JSON file
        const content = readFileSync(jsonFile, 'utf-8');
        const exported = JSON.parse(content) as ExportedObject;

        // Validate schema
        if (exported.$schema !== 'typenote/object/v1') {
          console.error(
            `Error: Invalid schema. Expected 'typenote/object/v1', got '${exported.$schema}'`
          );
          process.exit(1);
        }

        if (options.dryRun) {
          // Dry run: preview what would happen
          const existing = getObject(db, exported.id);
          const typeExists = getObjectTypeByKey(db, exported.typeKey);

          console.log('[DRY RUN] Would import object:');
          console.log(`  ID: ${exported.id}`);
          console.log(`  Title: ${exported.title}`);
          console.log(`  Type: ${exported.typeKey}`);
          console.log(`  Blocks: ${exported.blocks.length}`);
          console.log('');

          if (!typeExists) {
            console.log(`  ⚠ Warning: Type '${exported.typeKey}' does not exist in database`);
          }

          if (existing) {
            if (options.merge) {
              console.log('  → Would SKIP (object exists, --merge mode)');
            } else {
              console.log('  → Would REPLACE existing object');
            }
          } else {
            console.log('  → Would CREATE new object');
          }
        } else {
          const result = importObject(db, exported, {
            mode: options.merge ? 'skip' : 'replace',
          });

          if (result.success) {
            console.log('Import complete:');
            console.log(`  Object ID: ${result.objectId}`);
            console.log(`  Blocks imported: ${result.blocksImported}`);
          } else {
            console.error(`Error: ${result.error}`);
            process.exit(1);
          }
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // import folder <folderPath> [--merge] [--dry-run]
  importCmd
    .command('folder')
    .description('Import from folder structure')
    .argument('<folderPath>', 'Path to import folder')
    .option('-m, --merge', 'Skip existing objects instead of replacing them')
    .option('--dry-run', 'Preview what would be imported without actually importing')
    .action((folderPath: string, options: { merge?: boolean; dryRun?: boolean }) => {
      const db = initDb();
      try {
        if (options.dryRun) {
          // Dry run: read manifest and preview
          const manifestPath = `${folderPath}/manifest.json`;
          const manifestContent = readFileSync(manifestPath, 'utf-8');
          const manifest = JSON.parse(manifestContent) as ExportManifest;

          console.log('[DRY RUN] Would import from folder:');
          console.log(`  Path: ${folderPath}`);
          console.log(`  Types: ${manifest.typeCount}`);
          console.log(`  Objects: ${manifest.objectCount}`);
          console.log(`  Blocks: ${manifest.blockCount}`);
          console.log(`  Exported at: ${manifest.exportedAt}`);
          console.log('');
          console.log(
            `  Mode: ${options.merge ? 'MERGE (skip existing)' : 'REPLACE (overwrite existing)'}`
          );
        } else {
          const result = importFromFolder(db, folderPath, {
            mode: options.merge ? 'skip' : 'replace',
          });

          console.log('Import complete:');
          console.log(`  Types imported: ${result.typesImported}`);
          console.log(`  Objects imported: ${result.objectsImported}`);
          console.log(`  Blocks imported: ${result.blocksImported}`);

          if (result.errors.length > 0) {
            console.log('');
            console.log('Errors:');
            for (const err of result.errors) {
              console.log(`  - ${err}`);
            }
            process.exit(1);
          }
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
