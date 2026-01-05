import { desc, eq, isNull } from 'drizzle-orm';
import { objects, objectTypes } from './schema.js';
import type { TypenoteDb } from './db.js';

export interface ObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  updatedAt: Date;
}

export function listObjects(db: TypenoteDb): ObjectSummary[] {
  const rows = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      typeKey: objectTypes.key,
      updatedAt: objects.updatedAt,
    })
    .from(objects)
    .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(isNull(objects.deletedAt))
    .orderBy(desc(objects.updatedAt))
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: row.typeKey ?? 'Unknown',
    updatedAt: row.updatedAt,
  }));
}
