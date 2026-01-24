import { generateId } from '@typenote/core';
import type { BlockOp, DocumentBlock } from '@typenote/api';
import type { ConvertedBlock } from '@typenote/core';

interface BlockPosition {
  parentId: string | null;
  index: number;
}

function collectIds<T extends { children?: T[] }>(
  blocks: T[],
  getId: (block: T) => string | undefined
): Set<string> {
  const ids = new Set<string>();

  function walk(block: T) {
    const id = getId(block);
    if (id) {
      ids.add(id);
    }

    block.children?.forEach(walk);
  }

  blocks.forEach(walk);
  return ids;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let index = 0; index < a.length; index += 1) {
      if (!deepEqual(a[index], b[index])) {
        return false;
      }
    }

    return true;
  }

  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }

      if (!deepEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

function buildExistingMaps(blocks: DocumentBlock[]) {
  const blocksById = new Map<string, DocumentBlock>();
  const positionsById = new Map<string, BlockPosition>();

  function walk(level: DocumentBlock[], parentId: string | null) {
    level.forEach((block, index) => {
      blocksById.set(block.id, block);
      positionsById.set(block.id, { parentId, index });

      if (block.children.length > 0) {
        walk(block.children, block.id);
      }
    });
  }

  walk(blocks, null);

  return { blocksById, positionsById };
}

function buildUpdatePatch(existing: DocumentBlock, next: ConvertedBlock) {
  const contentChanged = !deepEqual(existing.content, next.content);
  const typeChanged = existing.blockType !== next.type;

  if (!contentChanged && !typeChanged) {
    return null;
  }

  return {
    ...(typeChanged ? { blockType: next.type } : {}),
    content: next.content,
  };
}

export function buildBlockOps(
  convertedBlocks: ConvertedBlock[],
  existingBlocks: DocumentBlock[]
): BlockOp[] {
  const { blocksById, positionsById } = buildExistingMaps(existingBlocks);
  const convertedIds = collectIds(convertedBlocks, (block) => block.blockId);
  const existingIds = collectIds(existingBlocks, (block) => block.id);
  const ops: BlockOp[] = [];

  function processBlockList(blocks: ConvertedBlock[], parentBlockId: string | null) {
    let lastSiblingId: string | null = null;

    blocks.forEach((block, index) => {
      const place = lastSiblingId
        ? { where: 'after' as const, siblingBlockId: lastSiblingId }
        : { where: 'start' as const };

      const existingBlock = block.blockId ? blocksById.get(block.blockId) : undefined;
      let currentBlockId: string;

      if (existingBlock) {
        const position = positionsById.get(existingBlock.id);
        const needsMove =
          !position || position.parentId !== parentBlockId || position.index !== index;

        if (needsMove) {
          ops.push({
            op: 'block.move',
            blockId: existingBlock.id,
            newParentBlockId: parentBlockId,
            place,
          });
        }

        const patch = buildUpdatePatch(existingBlock, block);
        if (patch) {
          ops.push({
            op: 'block.update',
            blockId: existingBlock.id,
            patch,
          });
        }

        currentBlockId = existingBlock.id;
      } else {
        const newBlockId = generateId();
        ops.push({
          op: 'block.insert',
          blockId: newBlockId,
          parentBlockId,
          blockType: block.type,
          content: block.content,
          place,
        });
        currentBlockId = newBlockId;
      }

      lastSiblingId = currentBlockId;

      if (block.children && block.children.length > 0) {
        processBlockList(block.children, currentBlockId);
      }
    });
  }

  processBlockList(convertedBlocks, null);

  for (const existingId of existingIds) {
    if (!convertedIds.has(existingId)) {
      ops.push({
        op: 'block.delete',
        blockId: existingId,
      });
    }
  }

  return ops;
}
