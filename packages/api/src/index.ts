// TypeNote API - Contract definitions

export const API_VERSION = 'v1';

// Errors
export {
  ApiErrorCodeSchema,
  ApiErrorSchema,
  notFoundObject,
  notFoundBlock,
  validationError,
  versionConflict,
  orderingConflict,
  cycleError,
  crossObjectError,
  parentDeletedError,
  idempotencyConflict,
  internalError,
  type ApiError,
  type ApiErrorCode,
} from './errors.js';

// Block Patch
export {
  PlaceSchema,
  BlockMetaSchema,
  InsertBlockOpSchema,
  UpdateBlockOpSchema,
  MoveBlockOpSchema,
  DeleteBlockOpSchema,
  BlockOpSchema,
  ClientContextSchema,
  ApplyBlockPatchInputSchema,
  PatchWarningSchema,
  ApplyBlockPatchResultSchema,
  type Place,
  type BlockMeta,
  type InsertBlockOp,
  type UpdateBlockOp,
  type MoveBlockOp,
  type DeleteBlockOp,
  type BlockOp,
  type ClientContext,
  type ApplyBlockPatchInput,
  type PatchWarning,
  type ApplyBlockPatchResult,
} from './blockPatch.js';

// NotateDoc v1 Content Schema
export {
  // Marks
  MarkSchema,
  type Mark,
  // Reference targets
  ObjectRefTargetSchema,
  BlockRefTargetSchema,
  RefTargetSchema,
  type RefTarget,
  // Inline nodes
  TextNodeSchema,
  HardBreakNodeSchema,
  LinkNodeSchema,
  RefNodeSchema,
  TagNodeSchema,
  MathInlineNodeSchema,
  FootnoteRefNodeSchema,
  InlineNodeSchema,
  type InlineNode,
  // Block types
  BlockTypeSchema,
  type BlockType,
  // Block content schemas
  ParagraphContentSchema,
  HeadingContentSchema,
  ListContentSchema,
  ListItemContentSchema,
  BlockquoteContentSchema,
  CalloutContentSchema,
  CodeBlockContentSchema,
  ThematicBreakContentSchema,
  TableContentSchema,
  MathBlockContentSchema,
  FootnoteDefContentSchema,
  type ParagraphContent,
  type HeadingContent,
  type ListContent,
  type ListItemContent,
  type BlockquoteContent,
  type CalloutContent,
  type CodeBlockContent,
  type ThematicBreakContent,
  type TableContent,
  type MathBlockContent,
  type FootnoteDefContent,
  // Utility
  getContentSchemaForBlockType,
} from './notateDoc.js';

// Patch Validation
export {
  validatePatchInput,
  validateBlockContent,
  type ValidationError,
  type PatchValidationResult,
  type ContentValidationResult,
} from './patchValidation.js';

// Object Types
export {
  // Built-in types
  BuiltInTypeKeySchema,
  BUILT_IN_TYPE_KEYS,
  type BuiltInTypeKey,
  // Property definitions
  PropertyTypeSchema,
  PropertyDefinitionSchema,
  TypeSchemaSchema,
  type PropertyType,
  type PropertyDefinition,
  type TypeSchema,
  // Entity
  ObjectTypeSchema,
  type ObjectType,
  // API operations
  CreateObjectTypeInputSchema,
  UpdateObjectTypeInputSchema,
  ListObjectTypesOptionsSchema,
  type CreateObjectTypeInput,
  type UpdateObjectTypeInput,
  type ListObjectTypesOptions,
  // Error codes
  ObjectTypeErrorCodeSchema,
  type ObjectTypeErrorCode,
} from './objectType.js';

// Query Results
export { type DocumentBlock, type GetDocumentResult, type ObjectSummary } from './queries.js';
