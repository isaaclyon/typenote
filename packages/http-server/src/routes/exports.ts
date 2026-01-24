import { Hono } from 'hono';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  AttachmentContent,
  DocumentBlock,
  FootnoteDefContent,
  HeadingContent,
  InlineNode,
  ListItemContent,
  ParagraphContent,
  PropertyDefinition,
  TableContent,
} from '@typenote/api';
import { MarkdownExportInputSchema } from '@typenote/api';
import { notateDocToMarkdown } from '@typenote/core';
import {
  DocumentNotFoundError,
  getAttachment,
  getDocument,
  getObject,
  getResolvedSchema,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

export const exports = new Hono<ServerContext>();

exports.post('/:id/export/markdown', async (c) => {
  const objectId = c.req.param('id');
  const body = await c.req.json();
  const parsed = MarkdownExportInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid markdown export request',
      details: parsed.error.flatten(),
    };
  }

  const db = c.var.db;
  const fileService = c.var.fileService;
  const object = getObject(db, objectId);
  if (!object) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: 'Object not found',
      details: { objectId },
    };
  }

  let document;
  try {
    document = getDocument(db, objectId);
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      throw {
        code: 'NOT_FOUND_OBJECT',
        message: 'Document not found',
        details: { objectId },
      };
    }
    throw error;
  }

  const schema = getResolvedSchema(db, object.typeId);
  const refIds = new Set<string>();
  collectPropertyRefIds(object.properties, schema.properties, refIds);
  collectBlockRefIds(document.blocks, refIds);

  const refLookup: Record<string, { title: string }> = {};
  for (const refId of refIds) {
    const refObject = getObject(db, refId);
    if (refObject) {
      refLookup[refId] = { title: refObject.title };
    }
  }

  const attachmentIds = new Set<string>();
  collectAttachmentIds(document.blocks, attachmentIds);
  const attachmentLookup: Record<string, { filename: string; mimeType?: string | undefined }> = {};
  const attachmentDetails = new Map<
    string,
    { sha256: string; mimeType: string; filename: string }
  >();

  for (const attachmentId of attachmentIds) {
    const attachment = getAttachment(db, attachmentId);
    if (!attachment) {
      continue;
    }
    attachmentLookup[attachmentId] = {
      filename: attachment.filename,
      mimeType: attachment.mimeType,
    };
    attachmentDetails.set(attachmentId, {
      sha256: attachment.sha256,
      mimeType: attachment.mimeType,
      filename: attachment.filename,
    });
  }

  const exportResult = notateDocToMarkdown({
    object: {
      id: object.id,
      typeKey: object.typeKey,
      title: object.title,
      createdAt: object.createdAt,
      updatedAt: object.updatedAt,
      properties: object.properties,
      propertyDefinitions: schema.properties,
    },
    document: document.blocks,
    refLookup,
    attachments: attachmentLookup,
  });

  const slug = slugify(object.title) || object.id;
  const outputPath = path.join(parsed.data.outputDir, `${slug}.md`);

  await mkdir(parsed.data.outputDir, { recursive: true });
  await writeFile(outputPath, exportResult.markdown, 'utf8');

  const warnings = [...exportResult.warnings];

  for (const asset of exportResult.assets) {
    const attachment = attachmentDetails.get(asset.attachmentId);
    if (!attachment) {
      warnings.push({
        code: 'MISSING_ATTACHMENT',
        message: `Missing attachment file for ${asset.attachmentId}`,
        details: { attachmentId: asset.attachmentId },
      });
      continue;
    }
    const extension = extensionFromMimeType(attachment.mimeType);
    try {
      const data = await fileService.readFile(attachment.sha256, extension);
      const assetPath = path.join(parsed.data.outputDir, asset.relativePath);
      await mkdir(path.dirname(assetPath), { recursive: true });
      await writeFile(assetPath, data);
    } catch (error) {
      warnings.push({
        code: 'MISSING_ATTACHMENT',
        message: `Failed to read attachment file for ${asset.attachmentId}`,
        details: { attachmentId: asset.attachmentId, error: String(error) },
      });
    }
  }

  return c.json({
    success: true,
    data: {
      path: outputPath,
      warnings: warnings.length > 0 ? warnings : undefined,
    },
  });
});

function collectPropertyRefIds(
  properties: Record<string, unknown>,
  definitions: PropertyDefinition[],
  refIds: Set<string>
): void {
  for (const definition of definitions) {
    const value = properties[definition.key];
    if (definition.type === 'ref' && typeof value === 'string') {
      refIds.add(value);
    }
    if (definition.type === 'refs' && Array.isArray(value)) {
      for (const entry of value) {
        if (typeof entry === 'string') {
          refIds.add(entry);
        }
      }
    }
  }
}

function collectBlockRefIds(blocks: DocumentBlock[], refIds: Set<string>): void {
  for (const block of blocks) {
    collectInlineRefsFromBlock(block, refIds);
    if (block.children.length > 0) {
      collectBlockRefIds(block.children, refIds);
    }
  }
}

function collectInlineRefsFromBlock(block: DocumentBlock, refIds: Set<string>): void {
  switch (block.blockType) {
    case 'paragraph':
      collectInlineRefs((block.content as ParagraphContent).inline, refIds);
      return;
    case 'heading':
      collectInlineRefs((block.content as HeadingContent).inline, refIds);
      return;
    case 'list_item':
      collectInlineRefs((block.content as ListItemContent).inline, refIds);
      return;
    case 'table':
      collectTableRefs(block.content as TableContent, refIds);
      return;
    case 'footnote_def':
      collectInlineRefs((block.content as FootnoteDefContent).inline ?? [], refIds);
      return;
    default:
      return;
  }
}

function collectInlineRefs(nodes: InlineNode[], refIds: Set<string>): void {
  for (const node of nodes) {
    if (node.t === 'ref') {
      refIds.add(node.target.objectId);
      continue;
    }
    if (node.t === 'link') {
      collectInlineRefs(node.children, refIds);
    }
  }
}

function collectTableRefs(content: TableContent, refIds: Set<string>): void {
  for (const row of content.rows) {
    for (const cell of row.cells) {
      collectInlineRefs(cell, refIds);
    }
  }
}

function collectAttachmentIds(blocks: DocumentBlock[], attachmentIds: Set<string>): void {
  for (const block of blocks) {
    if (block.blockType === 'attachment') {
      const content = block.content as AttachmentContent;
      attachmentIds.add(content.attachmentId);
    }
    if (block.children.length > 0) {
      collectAttachmentIds(block.children, attachmentIds);
    }
  }
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug;
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';
    case 'image/jpeg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'application/pdf':
      return 'pdf';
    case 'text/plain':
      return 'txt';
    default:
      return 'bin';
  }
}
