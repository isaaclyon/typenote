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
} from './blockPatch.js';
import {
  VALID_ULID,
  VALID_ULID_2,
  expectValid,
  expectInvalid,
  parseWith,
  makeInsertOp,
  makeUpdateOp,
  makeMoveOp,
  makeDeleteOp,
  makePatchInput,
  makePatchResult,
} from './test-utils.js';

// =============================================================================
// PlaceSchema Tests
// =============================================================================

describe('PlaceSchema', () => {
  const validPlaces = [
    ['start', { where: 'start' }],
    ['end', { where: 'end' }],
    ['before with siblingBlockId', { where: 'before', siblingBlockId: VALID_ULID }],
    ['after with siblingBlockId', { where: 'after', siblingBlockId: VALID_ULID }],
  ] as const;

  it.each(validPlaces)('accepts %s', (_, place) => {
    expectValid(PlaceSchema, place);
  });

  const invalidPlaces = [
    ['before without siblingBlockId', { where: 'before' }],
    ['after without siblingBlockId', { where: 'after' }],
  ] as const;

  it.each(invalidPlaces)('rejects %s', (_, place) => {
    expectInvalid(PlaceSchema, place);
  });
});

// =============================================================================
// InsertBlockOpSchema Tests
// =============================================================================

describe('InsertBlockOpSchema', () => {
  const validInsertOps = [
    ['with place', makeInsertOp({ place: { where: 'end' } })],
    [
      'with parent and orderKey',
      makeInsertOp({
        parentBlockId: VALID_ULID_2,
        orderKey: 'aaa',
        blockType: 'heading',
        content: { level: 1, inline: [] },
        meta: { collapsed: true },
      }),
    ],
  ] as const;

  it.each(validInsertOps)('accepts insert %s', (_, op) => {
    expectValid(InsertBlockOpSchema, op);
  });

  const invalidInsertOps = [
    ['without blockId', { ...makeInsertOp(), blockId: undefined }],
    ['with invalid blockId length', makeInsertOp({ blockId: 'short' })],
  ] as const;

  it.each(invalidInsertOps)('rejects insert %s', (_, op) => {
    expectInvalid(InsertBlockOpSchema, op);
  });
});

// =============================================================================
// UpdateBlockOpSchema Tests
// =============================================================================

describe('UpdateBlockOpSchema', () => {
  const validUpdateOps = [
    [
      'with content',
      makeUpdateOp({ patch: { content: { inline: [{ t: 'text', text: 'hello' }] } } }),
    ],
    [
      'with blockType change',
      makeUpdateOp({
        patch: { blockType: 'heading', content: { level: 2, inline: [] } },
      }),
    ],
    ['with meta only', makeUpdateOp({ patch: { meta: { collapsed: false } } })],
  ] as const;

  it.each(validUpdateOps)('accepts update %s', (_, op) => {
    expectValid(UpdateBlockOpSchema, op);
  });

  it('rejects update without patch', () => {
    const op = { op: 'block.update', blockId: VALID_ULID };
    expectInvalid(UpdateBlockOpSchema, op);
  });
});

// =============================================================================
// MoveBlockOpSchema Tests
// =============================================================================

describe('MoveBlockOpSchema', () => {
  const validMoveOps = [
    ['with place', makeMoveOp({ newParentBlockId: VALID_ULID_2, place: { where: 'start' } })],
    ['to root', makeMoveOp({ place: { where: 'end' } })],
    ['with orderKey', makeMoveOp({ orderKey: 'bbb' })],
    ['with subtree flag', makeMoveOp({ place: { where: 'end' }, subtree: true })],
  ] as const;

  it.each(validMoveOps)('accepts move %s', (_, op) => {
    expectValid(MoveBlockOpSchema, op);
  });
});

// =============================================================================
// DeleteBlockOpSchema Tests
// =============================================================================

describe('DeleteBlockOpSchema', () => {
  const validDeleteOps = [
    ['basic', makeDeleteOp()],
    ['with subtree flag', makeDeleteOp({ subtree: true })],
  ] as const;

  it.each(validDeleteOps)('accepts delete %s', (_, op) => {
    expectValid(DeleteBlockOpSchema, op);
  });
});

// =============================================================================
// BlockOpSchema (Discriminated Union) Tests
// =============================================================================

describe('BlockOpSchema (discriminated union)', () => {
  const validOps: [string, BlockOp][] = [
    ['insert', makeInsertOp() as BlockOp],
    ['update', makeUpdateOp() as BlockOp],
    ['move', makeMoveOp() as BlockOp],
    ['delete', makeDeleteOp() as BlockOp],
  ];

  it.each(validOps)('correctly discriminates %s op', (opType, op) => {
    const result = parseWith(BlockOpSchema, op);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.op).toBe(`block.${opType}`);
    }
  });

  it('correctly parses insert op and allows field access', () => {
    const result = parseWith(BlockOpSchema, makeInsertOp());
    expect(result.success).toBe(true);
    if (result.success && result.data.op === 'block.insert') {
      expect(result.data.blockType).toBe('paragraph');
    }
  });

  it('rejects unknown op type', () => {
    expectInvalid(BlockOpSchema, { op: 'block.unknown', blockId: VALID_ULID });
  });
});

// =============================================================================
// ApplyBlockPatchInputSchema Tests
// =============================================================================

describe('ApplyBlockPatchInputSchema', () => {
  const validInputs = [
    ['minimal', makePatchInput()],
    [
      'complete with all optional fields',
      makePatchInput({
        baseDocVersion: 5,
        idempotencyKey: 'unique-key-123',
        ops: [
          makeInsertOp({
            blockId: VALID_ULID_2,
            place: { where: 'end' },
            content: { inline: [] },
          }),
        ],
        client: {
          actorId: 'user-1',
          deviceId: 'device-1',
          appVersion: '1.0.0',
          ts: '2024-01-01T00:00:00Z',
        },
      }),
    ],
  ] as const;

  it.each(validInputs)('accepts %s input', (_, input) => {
    expectValid(ApplyBlockPatchInputSchema, input);
  });

  const invalidInputs = [
    ['wrong apiVersion', makePatchInput({ apiVersion: 'v2' }), 'apiVersion'],
    ['invalid objectId', makePatchInput({ objectId: 'short' }), 'objectId'],
    ['negative baseDocVersion', makePatchInput({ baseDocVersion: -1 }), 'baseDocVersion'],
  ] as const;

  it.each(invalidInputs)('rejects %s', (_, input, expectedPath) => {
    expectInvalid(ApplyBlockPatchInputSchema, input, expectedPath);
  });
});

// =============================================================================
// ApplyBlockPatchResultSchema Tests
// =============================================================================

describe('ApplyBlockPatchResultSchema', () => {
  const validResults = [
    [
      'basic',
      makePatchResult({
        previousDocVersion: 5,
        newDocVersion: 6,
        applied: {
          insertedBlockIds: [VALID_ULID_2],
          updatedBlockIds: [],
          movedBlockIds: [],
          deletedBlockIds: [],
        },
      }),
    ],
    [
      'with warnings',
      makePatchResult({
        warnings: [{ code: 'ORDER_KEY_REBALANCED', message: 'Order keys were rebalanced' }],
      }),
    ],
  ] as const;

  it.each(validResults)('accepts %s result', (_, result) => {
    expectValid(ApplyBlockPatchResultSchema, result);
  });
});

// =============================================================================
// ClientContextSchema Tests
// =============================================================================

describe('ClientContextSchema', () => {
  const validContexts = [
    [
      'all fields',
      {
        actorId: 'user-1',
        deviceId: 'device-1',
        appVersion: '1.0.0',
        ts: '2024-01-01T12:00:00Z',
      },
    ],
    ['partial fields', { actorId: 'user-1' }],
    ['empty object', {}],
  ] as const;

  it.each(validContexts)('accepts %s', (_, ctx) => {
    expectValid(ClientContextSchema, ctx);
  });

  it('rejects invalid timestamp format', () => {
    expectInvalid(ClientContextSchema, { ts: 'not-a-date' }, 'ts');
  });
});
