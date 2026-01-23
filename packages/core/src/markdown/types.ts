import type { DocumentBlock, PropertyDefinition } from '@typenote/api';
import type { MarkdownAsset, MarkdownWarning } from '@typenote/api';

export interface MarkdownExportObject {
  id: string;
  typeKey: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  properties: Record<string, unknown>;
  propertyDefinitions?: PropertyDefinition[] | undefined;
}

export interface MarkdownRefLookupEntry {
  title: string;
}

export type MarkdownRefLookup = Record<string, MarkdownRefLookupEntry>;

export interface MarkdownAttachmentInfo {
  filename: string;
  mimeType?: string | undefined;
}

export type MarkdownAttachmentLookup = Record<string, MarkdownAttachmentInfo>;

export interface MarkdownExportInput {
  object: MarkdownExportObject;
  document: DocumentBlock[];
  refLookup?: MarkdownRefLookup | undefined;
  attachments?: MarkdownAttachmentLookup | undefined;
}

export interface MarkdownExportResult {
  markdown: string;
  assets: MarkdownAsset[];
  warnings: MarkdownWarning[];
}
