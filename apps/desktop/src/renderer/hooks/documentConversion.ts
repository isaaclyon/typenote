import type { DocumentBlock, ObjectSummary, ObjectType } from '@typenote/api';
import type { ConvertedBlock, RefResolver } from '@typenote/core';

const fallbackResolver: RefResolver = {
  resolveObject: (objectId: string) => ({
    displayTitle: objectId.slice(0, 8) + '...',
    objectType: 'unknown',
  }),
};

/**
 * Map DocumentBlock[] (with IDs, tree structure) to ConvertedBlock[] (with blockId preserved).
 * This enables round-trip ID tracking: load → edit → save with correct block IDs.
 */
export function documentBlocksToConvertedBlocks(blocks: DocumentBlock[]): ConvertedBlock[] {
  return blocks.map((block) => ({
    type: block.blockType as ConvertedBlock['type'],
    content: block.content,
    blockId: block.id,
    ...(block.children.length > 0
      ? { children: documentBlocksToConvertedBlocks(block.children) }
      : {}),
  }));
}

/**
 * Build a RefResolver that looks up object metadata synchronously.
 * Uses cached object/type data when available.
 */
export function buildRefResolver(
  objects: ObjectSummary[] | undefined,
  types: ObjectType[] | undefined
): RefResolver {
  if (!objects) {
    return fallbackResolver;
  }

  const objectMap = new Map<string, { title: string; typeKey: string }>();
  for (const obj of objects) {
    objectMap.set(obj.id, { title: obj.title, typeKey: obj.typeKey });
  }

  const typeColorMap = new Map<string, string>();
  if (types) {
    for (const type of types) {
      if (type.color) {
        typeColorMap.set(type.key, type.color);
      }
    }
  }

  return {
    resolveObject: (objectId: string) => {
      const obj = objectMap.get(objectId);
      if (!obj) {
        return fallbackResolver.resolveObject(objectId);
      }

      const color = typeColorMap.get(obj.typeKey);
      return {
        displayTitle: obj.title,
        objectType: obj.typeKey,
        ...(color ? { color } : {}),
      };
    },
  };
}
