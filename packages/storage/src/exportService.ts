/**
 * Export/Import Service
 *
 * Provides deterministic JSON export and import for TypeNote objects.
 * Designed for Git-friendly diffs and full backup/restore.
 */

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { eq, and, isNull } from 'drizzle-orm';
import type { BlockType } from '@typenote/api';
import { generateId } from '@typenote/core';
import type { TypenoteDb } from './db.js';
import { objects, objectTypes, blocks } from './schema.js';
import { getDocument, type DocumentBlock } from './getDocument.js';
import { getObjectTypeByKey } from './objectTypeService.js';
import {
  updateRefsForBlock,
  updateFtsForBlock,
  deleteRefsForBlocks,
  deleteFtsForBlocks,
} from './indexing.js';

// ============================================================================
// Types
// ============================================================================

export interface ExportedBlock {
  id: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: unknown;
  meta: { collapsed?: boolean } | null;
  children: ExportedBlock[];
}

export interface ExportedObject {
  $schema: 'typenote/object/v1';
  id: string;
  typeKey: string;
  title: string;
  properties: Record<string, unknown>;
  docVersion: number;
  createdAt: string;
  updatedAt: string;
  blocks: ExportedBlock[];
}

export interface ExportManifest {
  $schema: 'typenote/manifest/v1';
  exportedAt: string;
  typeCount: number;
  objectCount: number;
  blockCount: number;
}

export interface ExportedType {
  $schema: 'typenote/type/v1';
  key: string;
  name: string;
  icon: string | null;
  builtIn: boolean;
  schema: unknown;
}

export interface ImportOptions {
  mode?: 'replace' | 'skip';
}

export interface ImportObjectResult {
  success: boolean;
  objectId: string;
  blocksImported: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  typesImported: number;
  objectsImported: number;
  blocksImported: number;
  errors: string[];
}

/**
 * Serialize an object to deterministic JSON with sorted keys.
 *
 * - Object keys are sorted alphabetically
 * - 2-space indentation
 * - Trailing newline
 *
 * @param obj - The object to serialize
 * @returns Deterministic JSON string
 */
export function deterministicStringify(obj: unknown): string {
  return JSON.stringify(obj, sortedReplacer, 2) + '\n';
}

/**
 * JSON.stringify replacer that sorts object keys alphabetically.
 */
function sortedReplacer(_key: string, value: unknown): unknown {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[k] = (value as Record<string, unknown>)[k];
    }
    return sorted;
  }
  return value;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Convert DocumentBlock to ExportedBlock.
 */
function documentBlockToExported(block: DocumentBlock): ExportedBlock {
  return {
    id: block.id,
    parentBlockId: block.parentBlockId,
    orderKey: block.orderKey,
    blockType: block.blockType,
    content: block.content,
    meta: block.meta,
    children: block.children.map(documentBlockToExported),
  };
}

/**
 * Export a single object to a portable JSON structure.
 *
 * @param db - Database connection
 * @param objectId - The object ID to export
 * @returns Exported object or null if not found
 */
export function exportObject(db: TypenoteDb, objectId: string): ExportedObject | null {
  // Get the object with its type
  const row = db
    .select({
      id: objects.id,
      typeId: objects.typeId,
      title: objects.title,
      properties: objects.properties,
      docVersion: objects.docVersion,
      createdAt: objects.createdAt,
      updatedAt: objects.updatedAt,
      typeKey: objectTypes.key,
    })
    .from(objects)
    .innerJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(and(eq(objects.id, objectId), isNull(objects.deletedAt)))
    .limit(1)
    .all()[0];

  if (!row) {
    return null;
  }

  // Get the document blocks
  let blocks: ExportedBlock[] = [];
  try {
    const doc = getDocument(db, objectId);
    blocks = doc.blocks.map(documentBlockToExported);
  } catch {
    // Object exists but has no blocks (or getDocument threw)
    blocks = [];
  }

  return {
    $schema: 'typenote/object/v1',
    id: row.id,
    typeKey: row.typeKey,
    title: row.title,
    properties: row.properties ? JSON.parse(row.properties) : {},
    docVersion: row.docVersion,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    blocks,
  };
}

/**
 * Export all non-deleted objects of a specific type.
 *
 * @param db - Database connection
 * @param typeKey - The type key to filter by (e.g., "Page", "DailyNote")
 * @returns Array of exported objects, or empty array if type doesn't exist
 */
export function exportObjectsByType(db: TypenoteDb, typeKey: string): ExportedObject[] {
  // Resolve typeKey to typeId
  const objectType = getObjectTypeByKey(db, typeKey);
  if (!objectType) {
    return [];
  }

  // Get all non-deleted objects of this type
  const rows = db
    .select({ id: objects.id })
    .from(objects)
    .where(and(eq(objects.typeId, objectType.id), isNull(objects.deletedAt)))
    .all();

  // Map each object through exportObject
  const result: ExportedObject[] = [];
  for (const row of rows) {
    const exported = exportObject(db, row.id);
    if (exported) {
      result.push(exported);
    }
  }

  return result;
}

/**
 * Count blocks recursively in an exported object.
 */
function countBlocks(blocks: ExportedBlock[]): number {
  let count = 0;
  for (const block of blocks) {
    count += 1;
    count += countBlocks(block.children);
  }
  return count;
}

/**
 * Export all objects and custom types to a folder structure.
 *
 * Creates:
 * - manifest.json
 * - types/<TypeKey>.json (non-built-in types only)
 * - objects/<TypeKey>/<objectId>.json
 *
 * @param db - Database connection
 * @param folderPath - Path to export folder
 * @returns Export manifest with counts
 */
export function exportToFolder(db: TypenoteDb, folderPath: string): ExportManifest {
  // Create directory structure
  mkdirSync(join(folderPath, 'types'), { recursive: true });
  mkdirSync(join(folderPath, 'objects'), { recursive: true });

  let objectCount = 0;
  let blockCount = 0;
  let typeCount = 0;

  // Get all object types
  const allTypes = db.select().from(objectTypes).all();

  // Export custom types and objects
  for (const objectType of allTypes) {
    // Export custom (non-built-in) types to types/ folder
    if (!objectType.builtIn) {
      const exportedType: ExportedType = {
        $schema: 'typenote/type/v1',
        key: objectType.key,
        name: objectType.name,
        icon: objectType.icon,
        builtIn: objectType.builtIn,
        schema: objectType.schema ? JSON.parse(objectType.schema) : null,
      };
      writeFileSync(
        join(folderPath, 'types', `${objectType.key}.json`),
        deterministicStringify(exportedType)
      );
      typeCount += 1;
    }

    // Get all non-deleted objects of this type
    const typeObjects = db
      .select({ id: objects.id })
      .from(objects)
      .where(and(eq(objects.typeId, objectType.id), isNull(objects.deletedAt)))
      .all();

    if (typeObjects.length === 0) {
      continue;
    }

    // Create type directory under objects/
    const typeDir = join(folderPath, 'objects', objectType.key);
    mkdirSync(typeDir, { recursive: true });

    // Export each object
    for (const row of typeObjects) {
      const exported = exportObject(db, row.id);
      if (exported) {
        writeFileSync(join(typeDir, `${row.id}.json`), deterministicStringify(exported));
        objectCount += 1;
        blockCount += countBlocks(exported.blocks);
      }
    }
  }

  // Create manifest
  const manifest: ExportManifest = {
    $schema: 'typenote/manifest/v1',
    exportedAt: new Date().toISOString(),
    typeCount,
    objectCount,
    blockCount,
  };

  // Write manifest
  writeFileSync(join(folderPath, 'manifest.json'), deterministicStringify(manifest));

  return manifest;
}

// ============================================================================
// Import Functions
// ============================================================================

/**
 * Flatten nested ExportedBlock tree into flat array for DB insertion.
 */
interface FlatBlock {
  id: string;
  objectId: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: string;
  meta: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function flattenBlocks(exportedBlocks: ExportedBlock[], objectId: string, now: Date): FlatBlock[] {
  const result: FlatBlock[] = [];

  function traverse(block: ExportedBlock): void {
    result.push({
      id: block.id,
      objectId,
      parentBlockId: block.parentBlockId,
      orderKey: block.orderKey,
      blockType: block.blockType,
      content: JSON.stringify(block.content),
      meta: block.meta ? JSON.stringify(block.meta) : null,
      createdAt: now,
      updatedAt: now,
    });

    for (const child of block.children) {
      traverse(child);
    }
  }

  for (const block of exportedBlocks) {
    traverse(block);
  }

  return result;
}

/**
 * Import an exported object into the database.
 *
 * @param db - Database connection
 * @param data - The exported object data
 * @param options - Import options (mode: 'replace' | 'skip')
 * @returns Import result with success status and counts
 */
export function importObject(
  db: TypenoteDb,
  data: ExportedObject,
  options?: ImportOptions
): ImportObjectResult {
  const mode = options?.mode ?? 'replace';

  // Resolve typeKey to typeId
  const objectType = getObjectTypeByKey(db, data.typeKey);
  if (!objectType) {
    return {
      success: false,
      objectId: data.id,
      blocksImported: 0,
      error: `Unknown type: ${data.typeKey}`,
    };
  }

  // Check if object already exists
  const existingObject = db
    .select({ id: objects.id })
    .from(objects)
    .where(eq(objects.id, data.id))
    .limit(1)
    .all()[0];

  // Handle skip mode - if object exists, return early
  if (mode === 'skip' && existingObject) {
    return {
      success: true,
      objectId: data.id,
      blocksImported: 0,
    };
  }

  // Parse timestamps
  const createdAt = new Date(data.createdAt);
  const updatedAt = new Date(data.updatedAt);
  const now = new Date();

  // Flatten blocks for insertion
  const flatBlocks = flattenBlocks(data.blocks, data.id, now);

  // Use atomic transaction for all operations
  db.atomic(() => {
    // If replacing, delete existing object and blocks first
    if (existingObject) {
      // Get existing block IDs for ref/FTS cleanup
      const existingBlockIds = db
        .select({ id: blocks.id })
        .from(blocks)
        .where(eq(blocks.objectId, data.id))
        .all()
        .map((b) => b.id);

      // Delete refs and FTS for existing blocks
      if (existingBlockIds.length > 0) {
        deleteRefsForBlocks(db, existingBlockIds);
        deleteFtsForBlocks(db, existingBlockIds);
      }

      // Delete existing blocks
      db.delete(blocks).where(eq(blocks.objectId, data.id)).run();

      // Delete existing object
      db.delete(objects).where(eq(objects.id, data.id)).run();
    }

    // Insert the object
    db.insert(objects)
      .values({
        id: data.id,
        typeId: objectType.id,
        title: data.title,
        properties: JSON.stringify(data.properties),
        docVersion: data.docVersion,
        createdAt,
        updatedAt,
      })
      .run();

    // Insert blocks if any
    if (flatBlocks.length > 0) {
      db.insert(blocks).values(flatBlocks).run();

      // Rebuild refs and FTS for each block
      for (const block of flatBlocks) {
        const blockType = block.blockType as BlockType;
        const content = JSON.parse(block.content);
        updateRefsForBlock(db, block.id, data.id, blockType, content);
        updateFtsForBlock(db, block.id, data.id, blockType, content);
      }
    }
  });

  return {
    success: true,
    objectId: data.id,
    blocksImported: flatBlocks.length,
  };
}

/**
 * Import all types and objects from a folder structure.
 *
 * Reads:
 * - manifest.json (optional - for validation)
 * - types/<TypeKey>.json (creates custom types if they don't exist)
 * - objects/<TypeKey>/<objectId>.json (imports via importObject)
 *
 * @param db - Database connection
 * @param folderPath - Path to import folder
 * @param options - Import options (mode: 'replace' | 'skip')
 * @returns Import result with counts and any errors
 */
export function importFromFolder(
  db: TypenoteDb,
  folderPath: string,
  options?: ImportOptions
): ImportResult {
  const errors: string[] = [];
  let typesImported = 0;
  let objectsImported = 0;
  let blocksImported = 0;

  // Import custom types from types/ folder
  const typesDir = join(folderPath, 'types');
  if (existsSync(typesDir)) {
    const typeFiles = readdirSync(typesDir).filter((f) => f.endsWith('.json'));

    for (const typeFile of typeFiles) {
      try {
        const typeContent = readFileSync(join(typesDir, typeFile), 'utf-8');
        const exportedType = JSON.parse(typeContent) as ExportedType;

        // Check if type already exists
        const existingType = getObjectTypeByKey(db, exportedType.key);
        if (existingType) {
          // Skip if type already exists
          continue;
        }

        // Insert new type
        const now = new Date();
        db.insert(objectTypes)
          .values({
            id: generateId(),
            key: exportedType.key,
            name: exportedType.name,
            icon: exportedType.icon,
            schema: exportedType.schema ? JSON.stringify(exportedType.schema) : null,
            builtIn: false, // Imported types are never built-in
            createdAt: now,
            updatedAt: now,
          })
          .run();

        typesImported += 1;
      } catch (err) {
        errors.push(`Failed to import type from ${typeFile}: ${String(err)}`);
      }
    }
  }

  // Import objects from objects/<TypeKey>/ directories
  const objectsDir = join(folderPath, 'objects');
  if (existsSync(objectsDir)) {
    const typeDirs = readdirSync(objectsDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const typeKey of typeDirs) {
      const typeDir = join(objectsDir, typeKey);
      const objectFiles = readdirSync(typeDir).filter((f) => f.endsWith('.json'));

      for (const objectFile of objectFiles) {
        try {
          const objectContent = readFileSync(join(typeDir, objectFile), 'utf-8');
          const exportedObject = JSON.parse(objectContent) as ExportedObject;

          const result = importObject(db, exportedObject, options);

          if (result.success) {
            objectsImported += 1;
            blocksImported += result.blocksImported;
          } else if (result.error) {
            errors.push(`Failed to import ${objectFile}: ${result.error}`);
          }
        } catch (err) {
          errors.push(`Failed to import object from ${objectFile}: ${String(err)}`);
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    typesImported,
    objectsImported,
    blocksImported,
    errors,
  };
}
