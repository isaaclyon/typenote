import { z } from 'zod';

export const ExportManifestSchema = z.object({
  $schema: z.literal('typenote/manifest/v1'),
  exportedAt: z.string().datetime(),
  typeCount: z.number().int().nonnegative(),
  objectCount: z.number().int().nonnegative(),
  blockCount: z.number().int().nonnegative(),
});

export type ExportManifest = z.infer<typeof ExportManifestSchema>;

export const ExportedBlockSchema = z.object({
  id: z.string().length(26),
  parentBlockId: z.string().length(26).nullable(),
  orderKey: z.string(),
  blockType: z.string(),
  content: z.unknown(),
  meta: z
    .object({
      collapsed: z.boolean().optional(),
    })
    .nullable(),
  children: z.array(z.lazy(() => ExportedBlockSchema)),
});

export type ExportedBlock = z.infer<typeof ExportedBlockSchema>;

export const ExportedObjectSchema = z.object({
  $schema: z.literal('typenote/object/v1'),
  id: z.string().length(26),
  typeKey: z.string(),
  title: z.string(),
  properties: z.record(z.unknown()),
  docVersion: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  blocks: z.array(ExportedBlockSchema),
});

export type ExportedObject = z.infer<typeof ExportedObjectSchema>;

export const ExportedTypeSchema = z.object({
  $schema: z.literal('typenote/type/v1'),
  key: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  builtIn: z.boolean(),
  schema: z.unknown(),
});

export type ExportedType = z.infer<typeof ExportedTypeSchema>;

export const ExportAllInputSchema = z.object({
  apiVersion: z.literal('v1'),
  outputDir: z.string().min(1),
});

export type ExportAllInput = z.infer<typeof ExportAllInputSchema>;

export const ExportAllResultSchema = z.object({
  path: z.string().min(1),
  manifest: ExportManifestSchema,
});

export type ExportAllResult = z.infer<typeof ExportAllResultSchema>;

export const ExportObjectInputSchema = z.object({
  apiVersion: z.literal('v1'),
  objectId: z.string().length(26),
  outputDir: z.string().min(1),
});

export type ExportObjectInput = z.infer<typeof ExportObjectInputSchema>;

export const ExportObjectResultSchema = z.object({
  path: z.string().min(1),
});

export type ExportObjectResult = z.infer<typeof ExportObjectResultSchema>;

export const ExportTypeInputSchema = z.object({
  apiVersion: z.literal('v1'),
  typeKey: z.string().min(1),
  outputDir: z.string().min(1),
});

export type ExportTypeInput = z.infer<typeof ExportTypeInputSchema>;

export const ExportTypeResultSchema = z.object({
  path: z.string().min(1),
});

export type ExportTypeResult = z.infer<typeof ExportTypeResultSchema>;

export const ImportModeSchema = z.enum(['replace', 'skip']);

export type ImportMode = z.infer<typeof ImportModeSchema>;

export const ImportFolderInputSchema = z.object({
  apiVersion: z.literal('v1'),
  inputDir: z.string().min(1),
  mode: ImportModeSchema.optional(),
});

export type ImportFolderInput = z.infer<typeof ImportFolderInputSchema>;

export const ImportFolderResultSchema = z.object({
  success: z.boolean(),
  typesImported: z.number().int().nonnegative(),
  objectsImported: z.number().int().nonnegative(),
  blocksImported: z.number().int().nonnegative(),
  errors: z.array(z.string()),
});

export type ImportFolderResult = z.infer<typeof ImportFolderResultSchema>;
