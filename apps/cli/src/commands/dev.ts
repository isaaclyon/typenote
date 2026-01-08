/**
 * Dev CLI Commands
 *
 * Provides development and testing commands for object type inheritance testing.
 */

import { Command } from 'commander';
import {
  listObjectTypes,
  getObjectTypeByKey,
  createObjectType,
  getResolvedSchema,
  ObjectTypeError,
  BUILT_IN_TYPES,
} from '@typenote/storage';
import { initDb, closeDb } from './db.js';

// ============================================================================
// Dev Command
// ============================================================================

export function registerDevCommand(program: Command): void {
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
}
