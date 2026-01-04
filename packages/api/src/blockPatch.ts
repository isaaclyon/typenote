import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ULID string (26 characters, Crockford's Base32).
 */
const UlidSchema = z.string().length(26);

/**
 * Placement hint for ordering among siblings.
 */
export const PlaceSchema = z.discriminatedUnion('where', [
  z.object({ where: z.literal('start') }),
  z.object({ where: z.literal('end') }),
  z.object({ where: z.literal('before'), siblingBlockId: z.string() }),
  z.object({ where: z.literal('after'), siblingBlockId: z.string() }),
]);

export type Place = z.infer<typeof PlaceSchema>;

/**
 * Block metadata.
 */
export const BlockMetaSchema = z.object({
  collapsed: z.boolean().optional(),
});

export type BlockMeta = z.infer<typeof BlockMetaSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Operation Schemas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Insert a new block.
 */
export const InsertBlockOpSchema = z.object({
  op: z.literal('block.insert'),
  blockId: UlidSchema,
  parentBlockId: UlidSchema.nullable(),
  orderKey: z.string().optional(),
  place: PlaceSchema.optional(),
  blockType: z.string(),
  content: z.unknown(),
  meta: BlockMetaSchema.optional(),
});

export type InsertBlockOp = z.infer<typeof InsertBlockOpSchema>;

/**
 * Update an existing block.
 */
export const UpdateBlockOpSchema = z.object({
  op: z.literal('block.update'),
  blockId: UlidSchema,
  patch: z.object({
    blockType: z.string().optional(),
    content: z.unknown().optional(),
    meta: BlockMetaSchema.optional(),
  }),
});

export type UpdateBlockOp = z.infer<typeof UpdateBlockOpSchema>;

/**
 * Move a block to a new parent/position.
 */
export const MoveBlockOpSchema = z.object({
  op: z.literal('block.move'),
  blockId: UlidSchema,
  newParentBlockId: UlidSchema.nullable(),
  orderKey: z.string().optional(),
  place: PlaceSchema.optional(),
  subtree: z.literal(true).optional(),
});

export type MoveBlockOp = z.infer<typeof MoveBlockOpSchema>;

/**
 * Soft-delete a block (and optionally its subtree).
 */
export const DeleteBlockOpSchema = z.object({
  op: z.literal('block.delete'),
  blockId: UlidSchema,
  subtree: z.literal(true).optional(),
});

export type DeleteBlockOp = z.infer<typeof DeleteBlockOpSchema>;

/**
 * Union of all block operations.
 */
export const BlockOpSchema = z.discriminatedUnion('op', [
  InsertBlockOpSchema,
  UpdateBlockOpSchema,
  MoveBlockOpSchema,
  DeleteBlockOpSchema,
]);

export type BlockOp = z.infer<typeof BlockOpSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Request/Response Envelopes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional client context for audit/debug.
 */
export const ClientContextSchema = z.object({
  actorId: z.string().optional(),
  deviceId: z.string().optional(),
  appVersion: z.string().optional(),
  ts: z.string().datetime().optional(),
});

export type ClientContext = z.infer<typeof ClientContextSchema>;

/**
 * Request to apply a block patch.
 */
export const ApplyBlockPatchInputSchema = z.object({
  apiVersion: z.literal('v1'),
  objectId: UlidSchema,
  baseDocVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().optional(),
  ops: z.array(BlockOpSchema),
  client: ClientContextSchema.optional(),
});

export type ApplyBlockPatchInput = z.infer<typeof ApplyBlockPatchInputSchema>;

/**
 * Warning included in patch result.
 */
export const PatchWarningSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type PatchWarning = z.infer<typeof PatchWarningSchema>;

/**
 * Response from applying a block patch.
 */
export const ApplyBlockPatchResultSchema = z.object({
  apiVersion: z.literal('v1'),
  objectId: z.string(),
  previousDocVersion: z.number().int().nonnegative(),
  newDocVersion: z.number().int().nonnegative(),
  applied: z.object({
    insertedBlockIds: z.array(z.string()),
    updatedBlockIds: z.array(z.string()),
    movedBlockIds: z.array(z.string()),
    deletedBlockIds: z.array(z.string()),
  }),
  warnings: z.array(PatchWarningSchema).optional(),
});

export type ApplyBlockPatchResult = z.infer<typeof ApplyBlockPatchResultSchema>;
