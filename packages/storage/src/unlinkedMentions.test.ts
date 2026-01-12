import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { getUnlinkedMentionsTo, type UnlinkedMentionResult } from './unlinkedMentions.js';
import { createObject } from './objectService.js';
import { createObjectType } from './objectTypeService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { generateId } from '@typenote/core';

describe('getUnlinkedMentionsTo', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    // Create a Page type for test objects
    createObjectType(db, {
      key: 'Page',
      name: 'Page',
      pluralName: 'Pages',
      icon: 'file-text',
      schema: { properties: [] },
    });
  });

  afterEach(() => {
    closeDb(db);
  });

  it('returns empty array when object not found', () => {
    const result = getUnlinkedMentionsTo(db, 'non-existent-id');
    expect(result).toEqual([]);
  });

  it('returns empty array when object is soft-deleted', () => {
    // Create and soft-delete an object
    const target = createObject(db, 'Page', 'Deleted Object');
    db.run(`UPDATE objects SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), target.id]);

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toEqual([]);
  });

  it('returns empty array when object has empty title', () => {
    // Create object, then manually set empty title
    const target = createObject(db, 'Page', 'Initial Title');
    db.run(`UPDATE objects SET title = ? WHERE id = ?`, ['   ', target.id]);

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toEqual([]);
  });

  it('finds blocks containing unlinked mentions of object title', () => {
    // Create target object
    const target = createObject(db, 'Page', 'Project Alpha');

    // Create source object with unlinked mention
    const source = createObject(db, 'Page', 'Meeting Notes');
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Discussed Project Alpha roadmap today' }],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);

    expect(result).toHaveLength(1);
    expect(result[0]?.sourceObjectId).toBe(source.id);
    expect(result[0]?.sourceObjectTitle).toBe('Meeting Notes');
    expect(result[0]?.sourceBlockId).toBeDefined();
  });

  it('matches case-insensitively', () => {
    const target = createObject(db, 'Page', 'Project Alpha');
    const source = createObject(db, 'Page', 'Notes');

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'Working on project alpha' }, // lowercase
            ],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(1);
  });

  it('requires word boundaries (no partial matches)', () => {
    const target = createObject(db, 'Page', 'Page');
    const source = createObject(db, 'Page', 'Notes');

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'Visit the homepage' }, // Should NOT match "Page"
            ],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(0);
  });

  it('excludes self-references', () => {
    const target = createObject(db, 'Page', 'Project Alpha');

    // Add block to target object mentioning itself
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: target.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'This is Project Alpha documentation' }],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(0); // Should exclude self-references
  });

  it('excludes blocks that already have explicit references', () => {
    const target = createObject(db, 'Page', 'Project Alpha');
    const source = createObject(db, 'Page', 'Task List');

    // Create block with BOTH plain text AND a ref node
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'See ' },
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: target.id },
                alias: 'Project Alpha',
              },
              { t: 'text', text: ' for details about Project Alpha' }, // Duplicate mention
            ],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(0); // Block already links to target, exclude it
  });

  it('excludes soft-deleted blocks', () => {
    const target = createObject(db, 'Page', 'Project Alpha');
    const source = createObject(db, 'Page', 'Notes');

    const patchResult = applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Discussed Project Alpha' }],
          },
        },
      ],
    });

    if (!patchResult.success) {
      throw new Error('Failed to create block');
    }

    const blockId = patchResult.result.applied.insertedBlockIds[0];

    // Soft-delete the block
    if (!blockId) {
      throw new Error('No block ID returned from patch');
    }

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.delete',
          blockId: blockId,
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(0); // Deleted blocks excluded
  });

  it('excludes blocks in soft-deleted source objects', () => {
    const target = createObject(db, 'Page', 'Project Alpha');
    const source = createObject(db, 'Page', 'Old Notes');

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Project Alpha info' }],
          },
        },
      ],
    });

    // Soft-delete the source object
    db.run(`UPDATE objects SET deleted_at = ? WHERE id = ?`, [new Date().toISOString(), source.id]);

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(0); // Blocks in deleted objects excluded
  });

  it('deduplicates results by block (one result per block)', () => {
    const target = createObject(db, 'Page', 'Project Alpha');
    const source = createObject(db, 'Page', 'Notes');

    // Block with multiple mentions of the same title
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [
              {
                t: 'text',
                text: 'Project Alpha timeline: Project Alpha starts next week',
              },
            ],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(1); // Only one result per block
  });

  it('handles multi-word titles with phrase matching', () => {
    const target = createObject(db, 'Page', 'Daily Note');
    const source = createObject(db, 'Page', 'Summary');

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'See the Daily Note for details' }],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(1);
  });

  it('finds mentions across multiple source objects', () => {
    const target = createObject(db, 'Page', 'Isaac');

    const source1 = createObject(db, 'Page', 'Meeting 1');
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source1.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Met with Isaac yesterday' }],
          },
        },
      ],
    });

    const source2 = createObject(db, 'Page', 'Meeting 2');
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source2.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Isaac will follow up' }],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(2);
    const objectIds = result.map((r: UnlinkedMentionResult) => r.sourceObjectId).sort();
    expect(objectIds).toEqual([source1.id, source2.id].sort());
  });

  it('returns type metadata for mentioning objects', () => {
    // Create object type with icon and color
    createObjectType(db, {
      key: 'DailyNote',
      name: 'Daily Note',
      pluralName: 'Daily Notes',
      icon: 'calendar',
      color: '#F59E0B',
      schema: { properties: [] },
    });

    // Create target object
    const target = createObject(db, 'Page', 'Project Alpha');

    // Create source object with DailyNote type
    const source = createObject(db, 'DailyNote', 'My Daily Note');

    // Add unlinked mention in source
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: source.id,
      ops: [
        {
          op: 'block.insert',
          blockId: generateId(),
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Discussed Project Alpha roadmap' }],
          },
        },
      ],
    });

    const result = getUnlinkedMentionsTo(db, target.id);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      sourceObjectId: source.id,
      sourceObjectTitle: 'My Daily Note',
      sourceTypeId: expect.any(String),
      sourceTypeKey: 'DailyNote',
      sourceTypeIcon: 'calendar',
      sourceTypeColor: '#F59E0B',
    });
  });
});
