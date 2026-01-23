import { z } from 'zod';

const UlidSchema = z.string().length(26);

export const MarkdownWarningCodeSchema = z.enum([
  'UNKNOWN_BLOCK',
  'UNKNOWN_INLINE',
  'UNKNOWN_MARK',
  'MISSING_REF_TITLE',
  'MISSING_ATTACHMENT',
  'DUPLICATE_ATTACHMENT',
]);

export const MarkdownWarningSchema = z.object({
  code: MarkdownWarningCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
});

export type MarkdownWarning = z.infer<typeof MarkdownWarningSchema>;

export const MarkdownAssetSchema = z.object({
  attachmentId: UlidSchema,
  filename: z.string().min(1),
  relativePath: z.string().min(1),
  mimeType: z.string().optional(),
});

export type MarkdownAsset = z.infer<typeof MarkdownAssetSchema>;

export const MarkdownExportInputSchema = z.object({
  apiVersion: z.literal('v1'),
  outputDir: z.string().min(1),
});

export type MarkdownExportInput = z.infer<typeof MarkdownExportInputSchema>;

export const MarkdownExportResultSchema = z.object({
  path: z.string().min(1),
  warnings: z.array(MarkdownWarningSchema).optional(),
});

export type MarkdownExportResult = z.infer<typeof MarkdownExportResultSchema>;
