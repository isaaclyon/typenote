/**
 * Tag CLI Commands
 *
 * Provides commands for managing tags (CRUD, assignment, and lookup operations).
 */

import { Command } from 'commander';
import {
  createFileDb,
  closeDb,
  getDbPath,
  seedBuiltInTypes,
  seedDailyNoteTemplate,
  createTag,
  getTag,
  getTagBySlug,
  updateTag,
  deleteTag,
  listTags,
  assignTags,
  removeTags,
  getObjectTags,
  findOrCreateTag,
  TagServiceError,
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
// Tag Command
// ============================================================================

export function registerTagCommand(program: Command): void {
  const tagCmd = program.command('tag').description('Tag management commands');

  // tag create
  tagCmd
    .command('create')
    .description('Create a new tag')
    .requiredOption('-n, --name <name>', 'Tag name')
    .requiredOption('-s, --slug <slug>', 'Tag slug (unique identifier)')
    .option('-c, --color <color>', 'Tag color (hex, e.g., #FF5733)')
    .option('-i, --icon <icon>', 'Tag icon name')
    .option('-d, --description <description>', 'Tag description')
    .action(
      (options: {
        name: string;
        slug: string;
        color?: string;
        icon?: string;
        description?: string;
      }) => {
        const db = initDb();
        try {
          const tag = createTag(db, {
            name: options.name,
            slug: options.slug,
            color: options.color,
            icon: options.icon,
            description: options.description,
          });

          console.log('Created tag:');
          console.log(JSON.stringify(tag, null, 2));
        } catch (error) {
          if (error instanceof TagServiceError) {
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

  // tag get <id>
  tagCmd
    .command('get')
    .description('Get a tag by ID')
    .argument('<id>', 'Tag ID (ULID)')
    .action((id: string) => {
      const db = initDb();
      try {
        const tag = getTag(db, id);
        if (tag === null) {
          console.error(`Tag not found: ${id}`);
          process.exit(1);
        }
        console.log('Tag:');
        console.log(JSON.stringify(tag, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // tag get-by-slug <slug>
  tagCmd
    .command('get-by-slug')
    .description('Get a tag by its slug')
    .argument('<slug>', 'Tag slug')
    .action((slug: string) => {
      const db = initDb();
      try {
        const tag = getTagBySlug(db, slug);
        if (tag === null) {
          console.error(`Tag not found with slug: ${slug}`);
          process.exit(1);
        }
        console.log('Tag:');
        console.log(JSON.stringify(tag, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // tag update <id>
  tagCmd
    .command('update')
    .description('Update a tag')
    .argument('<id>', 'Tag ID (ULID)')
    .option('-n, --name <name>', 'New tag name')
    .option('-s, --slug <slug>', 'New tag slug')
    .option('-c, --color <color>', 'New tag color (hex)')
    .option('-i, --icon <icon>', 'New tag icon')
    .option('-d, --description <description>', 'New tag description')
    .action(
      (
        id: string,
        options: {
          name?: string;
          slug?: string;
          color?: string;
          icon?: string;
          description?: string;
        }
      ) => {
        const db = initDb();
        try {
          // Build update input with only defined values (exactOptionalPropertyTypes)
          const updateInput: {
            name?: string;
            slug?: string;
            color?: string | null;
            icon?: string | null;
            description?: string | null;
          } = {};

          if (options.name !== undefined) updateInput.name = options.name;
          if (options.slug !== undefined) updateInput.slug = options.slug;
          if (options.color !== undefined) updateInput.color = options.color;
          if (options.icon !== undefined) updateInput.icon = options.icon;
          if (options.description !== undefined) updateInput.description = options.description;

          if (Object.keys(updateInput).length === 0) {
            console.error(
              'Error: No update options provided. Use --name, --slug, --color, --icon, or --description.'
            );
            process.exit(1);
          }

          const tag = updateTag(db, id, updateInput);
          console.log('Updated tag:');
          console.log(JSON.stringify(tag, null, 2));
        } catch (error) {
          if (error instanceof TagServiceError) {
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

  // tag delete <id> [--dry-run]
  tagCmd
    .command('delete')
    .description('Delete a tag (must not be assigned to any objects)')
    .argument('<id>', 'Tag ID (ULID)')
    .option('--dry-run', 'Preview whether deletion would succeed without actually deleting')
    .action((id: string, options: { dryRun?: boolean }) => {
      const db = initDb();
      try {
        if (options.dryRun) {
          // Dry run: check if tag exists and if it's in use
          const tag = getTag(db, id);
          if (!tag) {
            console.log(`[DRY RUN] Tag not found: ${id}`);
            console.log('  → Would FAIL with TAG_NOT_FOUND');
          } else {
            // Check usage via listTags with usage count
            const tagsWithUsage = listTags(db, { includeUsageCount: true });
            const tagWithUsage = tagsWithUsage.find((t) => t.id === id);
            const usageCount = tagWithUsage?.usageCount ?? 0;

            console.log('[DRY RUN] Would delete tag:');
            console.log(`  ID: ${tag.id}`);
            console.log(`  Name: ${tag.name}`);
            console.log(`  Slug: ${tag.slug}`);
            console.log(`  Usage count: ${usageCount}`);
            console.log('');

            if (usageCount > 0) {
              console.log(`  → Would FAIL: Tag is assigned to ${usageCount} object(s)`);
              console.log('  → Remove tag from objects first using: tag remove <objectId> <tagId>');
            } else {
              console.log('  → Would SUCCEED: Tag is not in use');
            }
          }
        } else {
          deleteTag(db, id);
          console.log(`Tag ${id} deleted.`);
        }
      } catch (error) {
        if (error instanceof TagServiceError) {
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
    });

  // tag list
  tagCmd
    .command('list')
    .description('List all tags')
    .option('-u, --usage', 'Include usage count for each tag')
    .option('--sort-by <field>', 'Sort by: name, createdAt, usageCount', 'name')
    .option('--sort-order <order>', 'Sort order: asc, desc', 'asc')
    .action((options: { usage?: boolean; sortBy?: string; sortOrder?: string }) => {
      const db = initDb();
      try {
        const tags = listTags(db, {
          includeUsageCount: options.usage ?? false,
          sortBy: (options.sortBy as 'name' | 'createdAt' | 'usageCount') ?? 'name',
          sortOrder: (options.sortOrder as 'asc' | 'desc') ?? 'asc',
        });

        if (tags.length === 0) {
          console.log('No tags found.');
        } else {
          console.log(`Found ${tags.length} tag(s):`);
          console.log(JSON.stringify(tags, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // tag assign <objectId> <tagIds...>
  tagCmd
    .command('assign')
    .description('Assign tags to an object')
    .argument('<objectId>', 'Object ID (ULID)')
    .argument('<tagIds...>', 'Tag IDs to assign (space-separated)')
    .action((objectId: string, tagIds: string[]) => {
      const db = initDb();
      try {
        const result = assignTags(db, { objectId, tagIds });
        console.log('Assignment result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        if (error instanceof TagServiceError) {
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
    });

  // tag remove <objectId> <tagIds...>
  tagCmd
    .command('remove')
    .description('Remove tags from an object')
    .argument('<objectId>', 'Object ID (ULID)')
    .argument('<tagIds...>', 'Tag IDs to remove (space-separated)')
    .action((objectId: string, tagIds: string[]) => {
      const db = initDb();
      try {
        const result = removeTags(db, { objectId, tagIds });
        console.log('Removal result:');
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        if (error instanceof TagServiceError) {
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
    });

  // tag object-tags <objectId>
  tagCmd
    .command('object-tags')
    .description('Get all tags assigned to an object')
    .argument('<objectId>', 'Object ID (ULID)')
    .action((objectId: string) => {
      const db = initDb();
      try {
        const tags = getObjectTags(db, objectId);
        if (tags.length === 0) {
          console.log(`No tags assigned to object: ${objectId}`);
        } else {
          console.log(`Found ${tags.length} tag(s) for object ${objectId}:`);
          console.log(JSON.stringify(tags, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // tag find-or-create <slug>
  tagCmd
    .command('find-or-create')
    .description('Find a tag by slug, or create it if it does not exist')
    .argument('<slug>', 'Tag slug')
    .option('-n, --name <name>', 'Tag name (used if creating)')
    .option('-c, --color <color>', 'Tag color (used if creating)')
    .option('-i, --icon <icon>', 'Tag icon (used if creating)')
    .option('-d, --description <description>', 'Tag description (used if creating)')
    .action(
      (
        slug: string,
        options: { name?: string; color?: string; icon?: string; description?: string }
      ) => {
        const db = initDb();
        try {
          // Build options with only defined values (exactOptionalPropertyTypes)
          // name is required, default to slug if not provided
          const createOptions: {
            name: string;
            color?: string;
            icon?: string;
            description?: string;
          } = {
            name: options.name ?? slug,
          };
          if (options.color !== undefined) createOptions.color = options.color;
          if (options.icon !== undefined) createOptions.icon = options.icon;
          if (options.description !== undefined) createOptions.description = options.description;

          const tag = findOrCreateTag(db, slug, createOptions);
          console.log('Tag (found or created):');
          console.log(JSON.stringify(tag, null, 2));
        } catch (error) {
          console.error('Error:', error instanceof Error ? error.message : String(error));
          process.exit(1);
        } finally {
          closeDb(db);
        }
      }
    );
}
