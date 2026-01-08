/**
 * Template CLI Commands
 *
 * Provides commands for managing templates (CRUD operations).
 */

import { Command } from 'commander';
import {
  createTemplate,
  getTemplate,
  getDefaultTemplateForType,
  listTemplates,
  updateTemplate,
  deleteTemplate,
} from '@typenote/storage';
import type { TemplateContent } from '@typenote/api';
import { initDb, closeDb } from './db.js';

// ============================================================================
// Template Command
// ============================================================================

export function registerTemplateCommand(program: Command): void {
  const templateCmd = program.command('template').description('Template management commands');

  // template create
  templateCmd
    .command('create')
    .description('Create a new template')
    .requiredOption('-n, --name <name>', 'Template name')
    .requiredOption('-t, --type-id <objectTypeId>', 'Object type ID (ULID)')
    .requiredOption('-s, --structure <json>', 'Template structure as JSON')
    .option('-d, --default', 'Set as default template for the object type', true)
    .action((options: { name: string; typeId: string; structure: string; default?: boolean }) => {
      const db = initDb();
      try {
        let content: TemplateContent;
        try {
          content = JSON.parse(options.structure) as TemplateContent;
        } catch {
          console.error('Error: Invalid JSON for --structure');
          process.exit(1);
        }

        const template = createTemplate(db, {
          name: options.name,
          objectTypeId: options.typeId,
          content,
          isDefault: options.default ?? true,
        });

        console.log('Created template:');
        console.log(JSON.stringify(template, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // template get <id>
  templateCmd
    .command('get')
    .description('Get a template by ID')
    .argument('<id>', 'Template ID (ULID)')
    .action((id: string) => {
      const db = initDb();
      try {
        const template = getTemplate(db, id);
        if (template === null) {
          console.error(`Template not found: ${id}`);
          process.exit(1);
        }
        console.log('Template:');
        console.log(JSON.stringify(template, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // template get-default <objectTypeId>
  templateCmd
    .command('get-default')
    .description('Get the default template for an object type')
    .argument('<objectTypeId>', 'Object type ID (ULID)')
    .action((objectTypeId: string) => {
      const db = initDb();
      try {
        const template = getDefaultTemplateForType(db, objectTypeId);
        if (template === null) {
          console.log(`No default template found for object type: ${objectTypeId}`);
        } else {
          console.log('Default template:');
          console.log(JSON.stringify(template, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // template list
  templateCmd
    .command('list')
    .description('List all templates')
    .option('-t, --type-id <objectTypeId>', 'Filter by object type ID')
    .action((options: { typeId?: string }) => {
      const db = initDb();
      try {
        const templates = listTemplates(db, options.typeId);
        if (templates.length === 0) {
          console.log('No templates found.');
        } else {
          console.log(`Found ${templates.length} template(s):`);
          console.log(JSON.stringify(templates, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // template update <id>
  templateCmd
    .command('update')
    .description('Update a template')
    .argument('<id>', 'Template ID (ULID)')
    .option('-n, --name <name>', 'New template name')
    .option('-s, --structure <json>', 'New template structure as JSON')
    .option('-d, --default <boolean>', 'Set as default (true/false)')
    .action((id: string, options: { name?: string; structure?: string; default?: string }) => {
      const db = initDb();
      try {
        // Build update input with only defined values (exactOptionalPropertyTypes)
        const updateInput: {
          name?: string;
          content?: TemplateContent;
          isDefault?: boolean;
        } = {};

        if (options.name !== undefined) {
          updateInput.name = options.name;
        }

        if (options.structure !== undefined) {
          try {
            updateInput.content = JSON.parse(options.structure) as TemplateContent;
          } catch {
            console.error('Error: Invalid JSON for --structure');
            process.exit(1);
          }
        }

        if (options.default !== undefined) {
          if (options.default !== 'true' && options.default !== 'false') {
            console.error('Error: --default must be "true" or "false"');
            process.exit(1);
          }
          updateInput.isDefault = options.default === 'true';
        }

        if (Object.keys(updateInput).length === 0) {
          console.error(
            'Error: No update options provided. Use --name, --structure, or --default.'
          );
          process.exit(1);
        }

        const template = updateTemplate(db, id, updateInput);
        if (template === null) {
          console.error(`Template not found: ${id}`);
          process.exit(1);
        }

        console.log('Updated template:');
        console.log(JSON.stringify(template, null, 2));
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  // template delete <id>
  templateCmd
    .command('delete')
    .description('Delete a template')
    .argument('<id>', 'Template ID (ULID)')
    .action((id: string) => {
      const db = initDb();
      try {
        const deleted = deleteTemplate(db, id);
        if (deleted) {
          console.log(`Template ${id} deleted.`);
        } else {
          console.error(`Template not found: ${id}`);
          process.exit(1);
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
