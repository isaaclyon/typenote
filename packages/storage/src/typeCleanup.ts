import { inArray, or } from 'drizzle-orm';
import { BUILT_IN_TYPE_KEYS } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { blocks, idempotency, objectTypes, objects, refs, templates } from './schema.js';

export interface PurgeUnsupportedTypesResult {
  deletedTypeKeys: string[];
  deletedObjectIds: string[];
}

/**
 * Remove any non-built-in types and all data tied to them.
 * This is destructive and should only run on startup/migrations.
 */
export function purgeUnsupportedTypes(db: TypenoteDb): PurgeUnsupportedTypesResult {
  const allowedKeys = new Set<string>(BUILT_IN_TYPE_KEYS);
  const allTypes = db.select().from(objectTypes).all();
  const unsupportedTypes = allTypes.filter((type) => !allowedKeys.has(type.key));

  if (unsupportedTypes.length === 0) {
    return { deletedTypeKeys: [], deletedObjectIds: [] };
  }

  const unsupportedTypeIds = unsupportedTypes.map((type) => type.id);
  const deletedTypeKeys = unsupportedTypes.map((type) => type.key);

  const objectRows = db
    .select({ id: objects.id })
    .from(objects)
    .where(inArray(objects.typeId, unsupportedTypeIds))
    .all();
  const objectIds = objectRows.map((row) => row.id);

  db.atomic(() => {
    if (objectIds.length > 0) {
      db.delete(refs)
        .where(or(inArray(refs.sourceObjectId, objectIds), inArray(refs.targetObjectId, objectIds)))
        .run();

      db.delete(idempotency).where(inArray(idempotency.objectId, objectIds)).run();
      db.delete(blocks).where(inArray(blocks.objectId, objectIds)).run();

      const placeholders = objectIds.map(() => '?').join(', ');
      db.run(`DELETE FROM fts_blocks WHERE object_id IN (${placeholders})`, objectIds);

      db.delete(objects).where(inArray(objects.id, objectIds)).run();
    }

    db.delete(templates).where(inArray(templates.objectTypeId, unsupportedTypeIds)).run();
    db.delete(objectTypes).where(inArray(objectTypes.id, unsupportedTypeIds)).run();
  });

  return { deletedTypeKeys, deletedObjectIds: objectIds };
}
