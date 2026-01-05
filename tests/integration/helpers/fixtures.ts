/**
 * Complex fixture builders for integration tests.
 */

import { generateId } from '@typenote/core';
import { applyBlockPatch, type TypenoteDb } from '@typenote/storage';
import type { InsertBlockOp, ParagraphContent, HeadingContent, InlineNode } from '@typenote/api';
import { createPage } from './testContext.js';

/**
 * Build a paragraph content object with text.
 */
export function paragraph(text: string): ParagraphContent {
  return {
    inline: [{ t: 'text', text }],
  };
}

/**
 * Build a paragraph with inline nodes.
 */
export function paragraphWithInline(nodes: InlineNode[]): ParagraphContent {
  return {
    inline: nodes,
  };
}

/**
 * Build a heading content object.
 */
export function heading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): HeadingContent {
  return {
    level,
    inline: [{ t: 'text', text }],
  };
}

/**
 * Build an object reference inline node.
 */
export function objectRef(targetObjectId: string, alias?: string): InlineNode {
  return {
    t: 'ref',
    mode: 'link',
    target: { kind: 'object', objectId: targetObjectId },
    ...(alias !== undefined ? { alias } : {}),
  };
}

/**
 * Build a document tree with nested blocks via applyBlockPatch.
 */
export interface BlockSpec {
  type: 'paragraph' | 'heading';
  content: string;
  children?: BlockSpec[];
}

export interface DocumentTreeResult {
  objectId: string;
  blockIds: string[];
  rootBlockIds: string[];
}

export function buildDocumentTree(
  db: TypenoteDb,
  typeId: string,
  title: string,
  specs: BlockSpec[]
): DocumentTreeResult {
  const objectId = createPage(db, typeId, title);
  const blockIds: string[] = [];
  const rootBlockIds: string[] = [];

  function buildOps(
    specList: BlockSpec[],
    parentBlockId: string | null,
    ops: InsertBlockOp[]
  ): void {
    for (const spec of specList) {
      const blockId = generateId();
      blockIds.push(blockId);
      if (parentBlockId === null) {
        rootBlockIds.push(blockId);
      }

      const content = spec.type === 'paragraph' ? paragraph(spec.content) : heading(spec.content);

      ops.push({
        op: 'block.insert',
        blockId,
        parentBlockId,
        blockType: spec.type,
        content,
        place: { where: 'end' },
      });

      if (spec.children) {
        buildOps(spec.children, blockId, ops);
      }
    }
  }

  const ops: InsertBlockOp[] = [];
  buildOps(specs, null, ops);

  if (ops.length > 0) {
    const result = applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId,
      baseDocVersion: 0,
      ops,
    });

    if (!result.success) {
      throw new Error(`Failed to build document tree: ${result.error.message}`);
    }
  }

  return { objectId, blockIds, rootBlockIds };
}

/**
 * Build multiple objects with cross-references.
 */
export interface LinkedObjectsResult {
  objectIds: string[];
  blockIds: string[];
}

export function buildLinkedObjects(
  db: TypenoteDb,
  typeId: string,
  count: number
): LinkedObjectsResult {
  const objectIds: string[] = [];
  const blockIds: string[] = [];

  // Create all objects first
  for (let i = 0; i < count; i++) {
    const objectId = createPage(db, typeId, `Object ${i + 1}`);
    objectIds.push(objectId);
  }

  // Add blocks with references to other objects
  for (let i = 0; i < count; i++) {
    const objectId = objectIds[i];
    const targetObjectId = objectIds[(i + 1) % count];
    if (!objectId || !targetObjectId) continue;

    const blockId = generateId();
    blockIds.push(blockId);

    const content: ParagraphContent = {
      inline: [{ t: 'text', text: 'See also: ' }, objectRef(targetObjectId)],
    };

    const result = applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId,
      baseDocVersion: 0,
      ops: [
        {
          op: 'block.insert',
          blockId,
          parentBlockId: null,
          blockType: 'paragraph',
          content,
          place: { where: 'end' },
        },
      ],
    });

    if (!result.success) {
      throw new Error(`Failed to create linked object: ${result.error.message}`);
    }
  }

  return { objectIds, blockIds };
}

/**
 * Build a deep hierarchy of blocks for testing.
 */
export function buildDeepHierarchy(
  db: TypenoteDb,
  typeId: string,
  depth: number
): DocumentTreeResult {
  const objectId = createPage(db, typeId, 'Deep Hierarchy');
  const blockIds: string[] = [];
  const ops: InsertBlockOp[] = [];

  let parentBlockId: string | null = null;

  for (let i = 0; i < depth; i++) {
    const blockId = generateId();
    blockIds.push(blockId);

    ops.push({
      op: 'block.insert',
      blockId,
      parentBlockId,
      blockType: 'paragraph',
      content: paragraph(`Level ${i + 1}`),
      place: { where: 'end' },
    });

    parentBlockId = blockId;
  }

  const result = applyBlockPatch(db, {
    apiVersion: 'v1',
    objectId,
    baseDocVersion: 0,
    ops,
  });

  if (!result.success) {
    throw new Error(`Failed to build deep hierarchy: ${result.error.message}`);
  }

  return { objectId, blockIds, rootBlockIds: blockIds.slice(0, 1) };
}
