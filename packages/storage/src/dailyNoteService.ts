/**
 * DailyNote Service
 *
 * Provides DailyNote-specific operations including:
 * - getOrCreateDailyNoteByDate: Get or create a DailyNote for a specific date
 * - getOrCreateTodayDailyNote: Get or create today's DailyNote
 * - listDailyNotes: List DailyNotes with filtering and pagination
 * - Slug mapping: daily/YYYY-MM-DD format
 */

import { and, eq, isNull, sql } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { objects } from './schema.js';
import { getObjectTypeByKey } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { createServiceError } from './errors.js';

// ============================================================================
// Types
// ============================================================================

export interface DailyNote {
  id: string;
  typeId: string;
  title: string;
  properties: { date_key: string };
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetOrCreateResult {
  created: boolean;
  dailyNote: DailyNote;
}

export interface ListDailyNotesOptions {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ListDailyNotesResult {
  items: DailyNote[];
  total: number;
}

// ============================================================================
// Error Types
// ============================================================================

export type DailyNoteErrorCode = 'TYPE_NOT_FOUND' | 'INVALID_DATE_FORMAT';

export const DailyNoteError = createServiceError<DailyNoteErrorCode>('DailyNoteError');
// eslint-disable-next-line @typescript-eslint/no-redeclare
 
export type DailyNoteError = InstanceType<typeof DailyNoteError>;

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Convert database row to DailyNote entity.
 */
function rowToDailyNote(row: typeof objects.$inferSelect): DailyNote {
  return {
    id: row.id,
    typeId: row.typeId,
    title: row.title,
    properties: row.properties ? JSON.parse(row.properties) : { date_key: '' },
    docVersion: row.docVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Get or create a DailyNote for a specific date.
 *
 * @param db - Database connection
 * @param dateKey - Date in YYYY-MM-DD format
 * @returns Object with created flag and the DailyNote
 * @throws DailyNoteError if DailyNote type not found
 */
export function getOrCreateDailyNoteByDate(db: TypenoteDb, dateKey: string): GetOrCreateResult {
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new DailyNoteError(
      'INVALID_DATE_FORMAT',
      `Invalid date format: '${dateKey}'. Expected YYYY-MM-DD.`
    );
  }

  // Get the DailyNote type
  const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
  if (!dailyNoteType) {
    throw new DailyNoteError(
      'TYPE_NOT_FOUND',
      'DailyNote type not found. Ensure seedBuiltInTypes() was called.'
    );
  }

  // Check if DailyNote already exists for this date
  const existing = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, dailyNoteType.id),
        isNull(objects.deletedAt),
        sql`json_extract(${objects.properties}, '$.date_key') = ${dateKey}`
      )
    )
    .limit(1)
    .all()[0];

  if (existing) {
    return {
      created: false,
      dailyNote: rowToDailyNote(existing),
    };
  }

  // Create the new DailyNote using createObject (which applies templates)
  const created = createObject(db, 'DailyNote', dateKey, { date_key: dateKey });

  return {
    created: true,
    dailyNote: {
      id: created.id,
      typeId: created.typeId,
      title: created.title,
      properties: { date_key: dateKey },
      docVersion: created.docVersion,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    },
  };
}

/**
 * Get or create today's DailyNote.
 *
 * @param db - Database connection
 * @returns Object with created flag and the DailyNote
 */
export function getOrCreateTodayDailyNote(db: TypenoteDb): GetOrCreateResult {
  const isoString = new Date().toISOString();
  const today = isoString.slice(0, 10); // YYYY-MM-DD (first 10 chars)
  return getOrCreateDailyNoteByDate(db, today);
}

/**
 * List DailyNotes with optional filtering and pagination.
 *
 * @param db - Database connection
 * @param options - Filtering and pagination options
 * @returns List of DailyNotes and total count
 */
export function listDailyNotes(
  db: TypenoteDb,
  options: ListDailyNotesOptions
): ListDailyNotesResult {
  // Get the DailyNote type
  const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
  if (!dailyNoteType) {
    return { items: [], total: 0 };
  }

  // Build conditions array
  const dateKeyExpr = sql`json_extract(${objects.properties}, '$.date_key')`;
  const conditions = [eq(objects.typeId, dailyNoteType.id), isNull(objects.deletedAt)];

  if (options.startDate) {
    conditions.push(sql`${dateKeyExpr} >= ${options.startDate}`);
  }
  if (options.endDate) {
    conditions.push(sql`${dateKeyExpr} <= ${options.endDate}`);
  }

  // Get total count (before pagination)
  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(objects)
    .where(and(...conditions))
    .all()[0];
  const total = countResult?.count ?? 0;

  // Query DailyNotes ordered by date descending with pagination
  const query = db
    .select()
    .from(objects)
    .where(and(...conditions))
    .orderBy(sql`${dateKeyExpr} DESC`)
    .limit(options.limit ?? -1) // -1 means no limit in SQLite
    .offset(options.offset ?? 0);

  const rows = query.all();

  return {
    items: rows.map(rowToDailyNote),
    total,
  };
}

// ============================================================================
// Slug Mapping
// ============================================================================

/**
 * Resolve a DailyNote slug to a DailyNote.
 *
 * @param db - Database connection
 * @param slug - Slug in format "daily/YYYY-MM-DD"
 * @returns DailyNote or null if not found or invalid slug
 */
export function getDailyNoteBySlug(db: TypenoteDb, slug: string): DailyNote | null {
  // Parse slug format: daily/YYYY-MM-DD
  const match = slug.match(/^daily\/(\d{4}-\d{2}-\d{2})$/);
  if (!match) return null;

  const dateKey = match[1];
  if (!dateKey) return null;

  // Get DailyNote type
  const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
  if (!dailyNoteType) return null;

  // Query for DailyNote with matching date_key
  const row = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, dailyNoteType.id),
        isNull(objects.deletedAt),
        sql`json_extract(${objects.properties}, '$.date_key') = ${dateKey}`
      )
    )
    .limit(1)
    .all()[0];

  return row ? rowToDailyNote(row) : null;
}

/**
 * Generate a slug for a DailyNote.
 *
 * @param dailyNote - The DailyNote to generate slug for
 * @returns Slug in format "daily/YYYY-MM-DD"
 */
export function getDailyNoteSlug(dailyNote: DailyNote): string {
  return `daily/${dailyNote.properties.date_key}`;
}
