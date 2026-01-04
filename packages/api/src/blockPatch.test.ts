import { describe, expect, it } from 'vitest';
import {
  PlaceSchema,
  InsertBlockOpSchema,
  UpdateBlockOpSchema,
  MoveBlockOpSchema,
  DeleteBlockOpSchema,
  BlockOpSchema,
  ClientContextSchema,
  ApplyBlockPatchInputSchema,
  ApplyBlockPatchResultSchema,
  type BlockOp,
  type ApplyBlockPatchInput,
  type ApplyBlockPatchResult,
} from './blockPatch.js';

const VALID_ULID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

describe('PlaceSchema', () => {
  it('accepts { where: "start" }', () => {
    const result = PlaceSchema.safeParse({ where: 'start' });
    expect(result.success).toBe(true);
  });

  it('accepts { where: "end" }', () => {
    const result = PlaceSchema.safeParse({ where: 'end' });
    expect(result.success).toBe(true);
  });

  it('accepts { where: "before", siblingBlockId }', () => {
    const result = PlaceSchema.safeParse({ where: 'before', siblingBlockId: VALID_ULID });
    expect(result.success).toBe(true);
  });

  it('accepts { where: "after", siblingBlockId }', () => {
    const result = PlaceSchema.safeParse({ where: 'after', siblingBlockId: VALID_ULID });
    expect(result.success).toBe(true);
  });

  it('rejects before/after without siblingBlockId', () => {
    const result = PlaceSchema.safeParse({ where: 'before' });
    expect(result.success).toBe(false);
  });
});

describe('InsertBlockOpSchema', () => {
  it('accepts valid insert op with place', () => {
    const op = {
      op: 'block.insert',
      blockId: VALID_ULID,
      parentBlockId: null,
      place: { where: 'end' },
      blockType: 'paragraph',
      content: { inline: [] },
    };

    const result = InsertBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts insert with parent and orderKey', () => {
    const op = {
      op: 'block.insert',
      blockId: VALID_ULID,
      parentBlockId: VALID_ULID_2,
      orderKey: 'aaa',
      blockType: 'heading',
      content: { level: 1, inline: [] },
      meta: { collapsed: true },
    };

    const result = InsertBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('rejects insert without blockId', () => {
    const op = {
      op: 'block.insert',
      parentBlockId: null,
      blockType: 'paragraph',
      content: {},
    };

    const result = InsertBlockOpSchema.safeParse(op);
    expect(result.success).toBe(false);
  });

  it('rejects insert with invalid blockId length', () => {
    const op = {
      op: 'block.insert',
      blockId: 'short',
      parentBlockId: null,
      blockType: 'paragraph',
      content: {},
    };

    const result = InsertBlockOpSchema.safeParse(op);
    expect(result.success).toBe(false);
  });
});

describe('UpdateBlockOpSchema', () => {
  it('accepts valid update op with content', () => {
    const op = {
      op: 'block.update',
      blockId: VALID_ULID,
      patch: {
        content: { inline: [{ t: 'text', text: 'hello' }] },
      },
    };

    const result = UpdateBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts update with blockType change', () => {
    const op = {
      op: 'block.update',
      blockId: VALID_ULID,
      patch: {
        blockType: 'heading',
        content: { level: 2, inline: [] },
      },
    };

    const result = UpdateBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts update with meta only', () => {
    const op = {
      op: 'block.update',
      blockId: VALID_ULID,
      patch: {
        meta: { collapsed: false },
      },
    };

    const result = UpdateBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('rejects update without patch', () => {
    const op = {
      op: 'block.update',
      blockId: VALID_ULID,
    };

    const result = UpdateBlockOpSchema.safeParse(op);
    expect(result.success).toBe(false);
  });
});

describe('MoveBlockOpSchema', () => {
  it('accepts valid move op with place', () => {
    const op = {
      op: 'block.move',
      blockId: VALID_ULID,
      newParentBlockId: VALID_ULID_2,
      place: { where: 'start' },
    };

    const result = MoveBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts move to root', () => {
    const op = {
      op: 'block.move',
      blockId: VALID_ULID,
      newParentBlockId: null,
      place: { where: 'end' },
    };

    const result = MoveBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts move with orderKey', () => {
    const op = {
      op: 'block.move',
      blockId: VALID_ULID,
      newParentBlockId: null,
      orderKey: 'bbb',
    };

    const result = MoveBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts move with subtree flag', () => {
    const op = {
      op: 'block.move',
      blockId: VALID_ULID,
      newParentBlockId: null,
      place: { where: 'end' },
      subtree: true,
    };

    const result = MoveBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });
});

describe('DeleteBlockOpSchema', () => {
  it('accepts valid delete op', () => {
    const op = {
      op: 'block.delete',
      blockId: VALID_ULID,
    };

    const result = DeleteBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('accepts delete with subtree flag', () => {
    const op = {
      op: 'block.delete',
      blockId: VALID_ULID,
      subtree: true,
    };

    const result = DeleteBlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });
});

describe('BlockOpSchema (discriminated union)', () => {
  it('correctly discriminates insert op', () => {
    const op: BlockOp = {
      op: 'block.insert',
      blockId: VALID_ULID,
      parentBlockId: null,
      blockType: 'paragraph',
      content: {},
    };

    const result = BlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
    if (result.success && result.data.op === 'block.insert') {
      expect(result.data.blockType).toBe('paragraph');
    }
  });

  it('correctly discriminates update op', () => {
    const op: BlockOp = {
      op: 'block.update',
      blockId: VALID_ULID,
      patch: { content: {} },
    };

    const result = BlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('correctly discriminates move op', () => {
    const op: BlockOp = {
      op: 'block.move',
      blockId: VALID_ULID,
      newParentBlockId: null,
    };

    const result = BlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('correctly discriminates delete op', () => {
    const op: BlockOp = {
      op: 'block.delete',
      blockId: VALID_ULID,
    };

    const result = BlockOpSchema.safeParse(op);
    expect(result.success).toBe(true);
  });

  it('rejects unknown op type', () => {
    const op = {
      op: 'block.unknown',
      blockId: VALID_ULID,
    };

    const result = BlockOpSchema.safeParse(op);
    expect(result.success).toBe(false);
  });
});

describe('ApplyBlockPatchInputSchema', () => {
  it('accepts minimal valid input', () => {
    const input: ApplyBlockPatchInput = {
      apiVersion: 'v1',
      objectId: VALID_ULID,
      ops: [],
    };

    const result = ApplyBlockPatchInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('accepts complete input with all optional fields', () => {
    const input: ApplyBlockPatchInput = {
      apiVersion: 'v1',
      objectId: VALID_ULID,
      baseDocVersion: 5,
      idempotencyKey: 'unique-key-123',
      ops: [
        {
          op: 'block.insert',
          blockId: VALID_ULID_2,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [] },
        },
      ],
      client: {
        actorId: 'user-1',
        deviceId: 'device-1',
        appVersion: '1.0.0',
        ts: '2024-01-01T00:00:00Z',
      },
    };

    const result = ApplyBlockPatchInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects wrong apiVersion', () => {
    const input = {
      apiVersion: 'v2',
      objectId: VALID_ULID,
      ops: [],
    };

    const result = ApplyBlockPatchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid objectId', () => {
    const input = {
      apiVersion: 'v1',
      objectId: 'short',
      ops: [],
    };

    const result = ApplyBlockPatchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects negative baseDocVersion', () => {
    const input = {
      apiVersion: 'v1',
      objectId: VALID_ULID,
      baseDocVersion: -1,
      ops: [],
    };

    const result = ApplyBlockPatchInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('ApplyBlockPatchResultSchema', () => {
  it('accepts valid result', () => {
    const result: ApplyBlockPatchResult = {
      apiVersion: 'v1',
      objectId: VALID_ULID,
      previousDocVersion: 5,
      newDocVersion: 6,
      applied: {
        insertedBlockIds: [VALID_ULID_2],
        updatedBlockIds: [],
        movedBlockIds: [],
        deletedBlockIds: [],
      },
    };

    const parseResult = ApplyBlockPatchResultSchema.safeParse(result);
    expect(parseResult.success).toBe(true);
  });

  it('accepts result with warnings', () => {
    const result: ApplyBlockPatchResult = {
      apiVersion: 'v1',
      objectId: VALID_ULID,
      previousDocVersion: 0,
      newDocVersion: 1,
      applied: {
        insertedBlockIds: [],
        updatedBlockIds: [],
        movedBlockIds: [],
        deletedBlockIds: [],
      },
      warnings: [{ code: 'ORDER_KEY_REBALANCED', message: 'Order keys were rebalanced' }],
    };

    const parseResult = ApplyBlockPatchResultSchema.safeParse(result);
    expect(parseResult.success).toBe(true);
  });
});

describe('ClientContextSchema', () => {
  it('accepts all fields', () => {
    const ctx = {
      actorId: 'user-1',
      deviceId: 'device-1',
      appVersion: '1.0.0',
      ts: '2024-01-01T12:00:00Z',
    };

    const result = ClientContextSchema.safeParse(ctx);
    expect(result.success).toBe(true);
  });

  it('accepts partial fields', () => {
    const ctx = {
      actorId: 'user-1',
    };

    const result = ClientContextSchema.safeParse(ctx);
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = ClientContextSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid timestamp format', () => {
    const ctx = {
      ts: 'not-a-date',
    };

    const result = ClientContextSchema.safeParse(ctx);
    expect(result.success).toBe(false);
  });
});
