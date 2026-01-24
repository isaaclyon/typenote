import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq, or } from 'drizzle-orm';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { createObjectType, getObjectTypeByKey, seedBuiltInTypes } from './objectTypeService.js';
import { blocks, idempotency, objects, refs, templates } from './schema.js';
import { purgeUnsupportedTypes } from './typeCleanup.js';
import { generateId } from '@typenote/core';

describe('purgeUnsupportedTypes', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  it('removes unsupported types and related data', () => {
    seedBuiltInTypes(db);

    const pageType = getObjectTypeByKey(db, 'Page');
    expect(pageType).not.toBeNull();

    const customType = createObjectType(db, { key: 'Book', name: 'Book' });
    const now = new Date();

    const pageId = generateId();
    const customId = generateId();

    db.insert(objects)
      .values({
        id: pageId,
        typeId: pageType?.id ?? '',
        title: 'Page Title',
        properties: JSON.stringify({}),
        docVersion: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    db.insert(objects)
      .values({
        id: customId,
        typeId: customType.id,
        title: 'Custom Title',
        properties: JSON.stringify({}),
        docVersion: 0,
        createdAt: now,
        updatedAt: now,
      })
      .run();

    const pageBlockId = generateId();
    const customBlockId = generateId();

    db.insert(blocks)
      .values([
        {
          id: pageBlockId,
          objectId: pageId,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: JSON.stringify({ text: 'Page content' }),
          meta: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: customBlockId,
          objectId: customId,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: JSON.stringify({ text: 'Custom content' }),
          meta: null,
          createdAt: now,
          updatedAt: now,
        },
      ])
      .run();

    db.insert(refs)
      .values([
        {
          id: generateId(),
          sourceBlockId: customBlockId,
          sourceObjectId: customId,
          targetObjectId: pageId,
          targetBlockId: null,
          createdAt: now,
        },
        {
          id: generateId(),
          sourceBlockId: pageBlockId,
          sourceObjectId: pageId,
          targetObjectId: customId,
          targetBlockId: null,
          createdAt: now,
        },
      ])
      .run();

    db.run(`INSERT INTO fts_blocks (block_id, object_id, content_text) VALUES (?, ?, ?)`, [
      customBlockId,
      customId,
      'Custom content',
    ]);
    db.run(`INSERT INTO fts_blocks (block_id, object_id, content_text) VALUES (?, ?, ?)`, [
      pageBlockId,
      pageId,
      'Page content',
    ]);

    db.insert(idempotency)
      .values({
        objectId: customId,
        key: 'test',
        resultJson: '{}',
        createdAt: now,
      })
      .run();

    db.insert(templates)
      .values({
        id: generateId(),
        objectTypeId: customType.id,
        name: 'Book Template',
        content: '{}',
        isDefault: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .run();

    purgeUnsupportedTypes(db);

    expect(getObjectTypeByKey(db, 'Book')).toBeNull();

    const remainingCustomObjects = db.select().from(objects).where(eq(objects.id, customId)).all();
    expect(remainingCustomObjects).toHaveLength(0);

    const remainingCustomBlocks = db
      .select()
      .from(blocks)
      .where(eq(blocks.objectId, customId))
      .all();
    expect(remainingCustomBlocks).toHaveLength(0);

    const remainingRefs = db
      .select()
      .from(refs)
      .where(or(eq(refs.sourceObjectId, customId), eq(refs.targetObjectId, customId)))
      .all();
    expect(remainingRefs).toHaveLength(0);

    const ftsRows = db.all<{ count: number }>(
      'SELECT COUNT(*) as count FROM fts_blocks WHERE object_id = ?',
      [customId]
    );
    expect(ftsRows[0]?.count ?? 0).toBe(0);

    const remainingIdempotency = db
      .select()
      .from(idempotency)
      .where(eq(idempotency.objectId, customId))
      .all();
    expect(remainingIdempotency).toHaveLength(0);

    const remainingTemplates = db
      .select()
      .from(templates)
      .where(eq(templates.objectTypeId, customType.id))
      .all();
    expect(remainingTemplates).toHaveLength(0);

    const remainingPageObjects = db.select().from(objects).where(eq(objects.id, pageId)).all();
    expect(remainingPageObjects).toHaveLength(1);
  });
});
