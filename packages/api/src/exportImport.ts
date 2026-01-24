import { z } from 'zod';

export const ExportManifestSchema = z.object({
  $schema: z.literal('typenote/manifest/v1'),
  exportedAt: z.string().datetime(),
  typeCount: z.number().int().nonnegative(),
  objectCount: z.number().int().nonnegative(),
  blockCount: z.number().int().nonnegative(),
});

export type ExportManifest = z.infer<typeof ExportManifestSchema>;

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
