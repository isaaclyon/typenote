// TypeNote API - Contract definitions

export const API_VERSION = 'v1';

// Errors
export {
  ApiErrorCodeSchema,
  ApiErrorSchema,
  notFoundObject,
  notFoundBlock,
  notFoundTag,
  notFoundAttachment,
  validationError,
  versionConflict,
  orderingConflict,
  tagSlugConflict,
  cycleError,
  crossObjectError,
  parentDeletedError,
  tagInUse,
  fileTooLarge,
  unsupportedFileType,
  idempotencyConflict,
  internalError,
  dailyNoteNotDuplicable,
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

// Objects
export {
  // Duplicate operation
  DuplicateObjectRequestSchema,
  DuplicateObjectResponseSchema,
  type DuplicateObjectRequest,
  type DuplicateObjectResponse,
  // Update operation
  UpdateObjectRequestSchema,
  UpdateObjectResponseSchema,
  type UpdateObjectRequest,
  type UpdateObjectResponse,
} from './object.js';

// Query Results
export { type DocumentBlock, type GetDocumentResult, type ObjectSummary } from './queries.js';

// Markdown Export
export {
  MarkdownWarningCodeSchema,
  MarkdownWarningSchema,
  MarkdownAssetSchema,
  MarkdownExportInputSchema,
  MarkdownExportResultSchema,
  type MarkdownWarning,
  type MarkdownAsset,
  type MarkdownExportInput,
  type MarkdownExportResult,
} from './markdownExport.js';

// Export/Import
export {
  ExportedBlockSchema,
  ExportedObjectSchema,
  ExportedTypeSchema,
  ExportManifestSchema,
  ExportAllInputSchema,
  ExportAllResultSchema,
  ExportObjectInputSchema,
  ExportObjectResultSchema,
  ExportTypeInputSchema,
  ExportTypeResultSchema,
  ImportModeSchema,
  ImportFolderInputSchema,
  ImportFolderResultSchema,
  type ExportedBlock,
  type ExportedObject,
  type ExportedType,
  type ExportManifest,
  type ExportAllInput,
  type ExportAllResult,
  type ExportObjectInput,
  type ExportObjectResult,
  type ExportTypeInput,
  type ExportTypeResult,
  type ImportMode,
  type ImportFolderInput,
  type ImportFolderResult,
} from './exportImport.js';

// Templates
export {
  TemplateBlockSchema,
  TemplateContentSchema,
  TemplateSchema,
  CreateTemplateInputSchema,
  UpdateTemplateInputSchema,
  type TemplateBlock,
  type TemplateContent,
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from './template.js';

// Tags
export {
  // Field schemas
  TagColorSchema,
  TagIconSchema,
  TagSlugSchema,
  type TagColor,
  type TagIcon,
  type TagSlug,
  // Entity
  TagSchema,
  TagWithUsageSchema,
  type Tag,
  type TagWithUsage,
  // API operations
  CreateTagInputSchema,
  UpdateTagInputSchema,
  ListTagsOptionsSchema,
  type CreateTagInput,
  type UpdateTagInput,
  type ListTagsOptions,
  // Assignment operations
  AssignTagsInputSchema,
  RemoveTagsInputSchema,
  AssignTagsResultSchema,
  RemoveTagsResultSchema,
  type AssignTagsInput,
  type RemoveTagsInput,
  type AssignTagsResult,
  type RemoveTagsResult,
  // Error codes
  TagErrorCodeSchema,
  type TagErrorCode,
} from './tag.js';

// Tasks
export {
  // Status and priority enums
  TaskStatusSchema,
  TaskPrioritySchema,
  TASK_STATUSES,
  TASK_PRIORITIES,
  type TaskStatus,
  type TaskPriority,
  // Properties schema
  TaskPropertiesSchema,
  type TaskProperties,
  // Summary
  TaskSummarySchema,
  type TaskSummary,
  // Query options
  GetTasksOptionsSchema,
  type GetTasksOptions,
} from './task.js';

// Calendar
export {
  // Date info
  CalendarDateInfoSchema,
  type CalendarDateInfo,
  // Calendar item
  CalendarItemSchema,
  type CalendarItem,
  // Calendar type metadata
  CalendarTypeMetadataSchema,
  type CalendarTypeMetadata,
  // Query options
  CalendarQueryOptionsSchema,
  type CalendarQueryOptions,
} from './calendar.js';

// Attachments
export {
  // Constants
  MAX_FILE_SIZE_BYTES,
  SUPPORTED_MIME_TYPES,
  type SupportedMimeType,
  // Field schemas
  Sha256Schema,
  FilenameSchema,
  SupportedMimeTypeSchema,
  FileSizeSchema,
  // Entity
  AttachmentSchema,
  type Attachment,
  // API operations
  UploadAttachmentInputSchema,
  UploadAttachmentResultSchema,
  type UploadAttachmentInput,
  type UploadAttachmentResult,
  // Block content
  AttachmentContentSchema,
  type AttachmentContent,
  // Error codes
  AttachmentErrorCodeSchema,
  type AttachmentErrorCode,
  // Download headers
  AttachmentDownloadHeadersSchema,
  type AttachmentDownloadHeaders,
} from './attachment.js';

// Events
export { type EventType, type ObjectCreatedEvent, type TypenoteEvent } from './events.js';

// Settings
export {
  ColorModeSchema,
  WeekStartDaySchema,
  DateFormatSchema,
  TimeFormatSchema,
  UserSettingsSchema,
  SettingKeys,
  type ColorMode,
  type WeekStartDay,
  type DateFormat,
  type TimeFormat,
  type UserSettings,
  type SettingKey,
} from './settings.js';

// Pinning
export {
  // Entity
  PinnedObjectSummarySchema,
  type PinnedObjectSummary,
  // API operations
  PinObjectInputSchema,
  UnpinObjectInputSchema,
  ReorderPinnedObjectsInputSchema,
  type PinObjectInput,
  type UnpinObjectInput,
  type ReorderPinnedObjectsInput,
  // Results
  PinObjectResultSchema,
  UnpinObjectResultSchema,
  ReorderPinnedObjectsResultSchema,
  type PinObjectResult,
  type UnpinObjectResult,
  type ReorderPinnedObjectsResult,
  // Error codes
  PinningErrorCodeSchema,
  type PinningErrorCode,
} from './pinning.js';
