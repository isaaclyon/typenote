import { Hono } from 'hono';
import {
  UploadAttachmentRequestSchema,
  ListAttachmentsOptionsSchema,
  CleanupAttachmentsOptionsSchema,
} from '@typenote/api';
import { generateId } from '@typenote/core';
import {
  getAttachment,
  applyBlockPatch,
  uploadAttachment,
  listAttachments,
  previewOrphanedAttachments,
  getObject,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const attachments = new Hono<ServerContext>();
const DEFAULT_GRACE_DAYS = 30;

/**
 * GET /attachments - List attachments.
 */
attachments.get('/', (c) => {
  const objectId = c.req.query('objectId');
  const options: Record<string, unknown> = {};
  if (objectId !== undefined) options['objectId'] = objectId;

  const parsed = ListAttachmentsOptionsSchema.safeParse(options);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid attachment query',
      details: parsed.error.flatten(),
    };
  }

  if (parsed.data.objectId) {
    const object = getObject(c.var.db, parsed.data.objectId);
    if (!object) {
      throw {
        code: 'NOT_FOUND_OBJECT',
        message: 'Object not found',
        details: { objectId: parsed.data.objectId },
      };
    }
  }

  // Build storage options with explicit undefined handling for exactOptionalPropertyTypes
  const storageOptions: Parameters<typeof listAttachments>[1] = {};
  if (parsed.data.objectId !== undefined) {
    storageOptions.objectId = parsed.data.objectId;
  }

  const attachmentsList = listAttachments(c.var.db, storageOptions);
  return c.json({
    success: true,
    data: { attachments: attachmentsList },
  });
});

/**
 * POST /attachments - Upload attachment.
 */
attachments.post('/', async (c) => {
  const body = await c.req.parseBody();
  const fileEntry = body['file'];
  const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;

  if (!isFileLike(file)) {
    throw {
      code: 'VALIDATION',
      message: 'File is required',
      details: { field: 'file' },
    };
  }

  const metadata = {
    objectId: typeof body['objectId'] === 'string' ? body['objectId'] : undefined,
    filename: typeof body['filename'] === 'string' ? body['filename'] : file.name,
    mimeType: typeof body['mimeType'] === 'string' ? body['mimeType'] : file.type,
    sizeBytes: file.size,
    alt: typeof body['alt'] === 'string' ? body['alt'] : undefined,
    caption: typeof body['caption'] === 'string' ? body['caption'] : undefined,
  };

  const parsed = UploadAttachmentRequestSchema.safeParse(metadata);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid upload metadata',
      details: parsed.error.flatten(),
    };
  }

  const object = getObject(c.var.db, parsed.data.objectId);
  if (!object) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: 'Object not found',
      details: { objectId: parsed.data.objectId },
    };
  }

  const fileData = Buffer.from(await file.arrayBuffer());
  const result = uploadAttachment(c.var.db, c.var.fileService, {
    filename: parsed.data.filename,
    mimeType: parsed.data.mimeType,
    sizeBytes: parsed.data.sizeBytes,
    fileData,
  });

  const content = {
    attachmentId: result.attachmentId,
    ...(parsed.data.alt !== undefined ? { alt: parsed.data.alt } : {}),
    ...(parsed.data.caption !== undefined ? { caption: parsed.data.caption } : {}),
  };

  const patchOutcome = applyBlockPatch(c.var.db, {
    apiVersion: 'v1',
    objectId: parsed.data.objectId,
    ops: [
      {
        op: 'block.insert',
        blockId: generateId(),
        parentBlockId: null,
        place: { where: 'end' },
        blockType: 'attachment',
        content,
      },
    ],
  });

  if (!patchOutcome.success) {
    throw {
      code: patchOutcome.error.code,
      message: patchOutcome.error.message,
      details: patchOutcome.error.details,
    };
  }

  return c.json(
    {
      success: true,
      data: result,
    },
    201
  );
});

/**
 * POST /attachments/cleanup - Preview orphaned attachments for cleanup.
 */
attachments.post('/cleanup', (c) => {
  const graceDaysParam = c.req.query('graceDays');
  const graceDays = graceDaysParam !== undefined ? Number(graceDaysParam) : undefined;

  if (graceDaysParam !== undefined && Number.isNaN(graceDays)) {
    throw {
      code: 'VALIDATION',
      message: 'graceDays must be a number',
      details: { graceDays: graceDaysParam },
    };
  }

  const options = graceDays !== undefined ? { graceDays } : {};
  const parsed = CleanupAttachmentsOptionsSchema.safeParse(options);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid cleanup options',
      details: parsed.error.flatten(),
    };
  }

  const preview = previewOrphanedAttachments(c.var.db, parsed.data.graceDays ?? DEFAULT_GRACE_DAYS);

  return c.json({
    success: true,
    data: {
      count: preview.length,
      attachmentIds: preview.map((attachment) => attachment.id),
    },
  });
});

/**
 * GET /attachments/:id - Get attachment metadata.
 */
attachments.get('/:id', (c) => {
  const attachmentId = c.req.param('id');
  const attachment = getAttachment(c.var.db, attachmentId);
  if (!attachment) {
    throw {
      code: 'NOT_FOUND_ATTACHMENT',
      message: 'Attachment not found',
      details: { attachmentId },
    };
  }

  return c.json({
    success: true,
    data: attachment,
  });
});

/**
 * GET /attachments/:id/content - Download attachment content.
 */
attachments.get('/:id/content', async (c) => {
  const attachmentId = c.req.param('id');
  const attachment = getAttachment(c.var.db, attachmentId);
  if (!attachment) {
    throw {
      code: 'NOT_FOUND_ATTACHMENT',
      message: 'Attachment not found',
      details: { attachmentId },
    };
  }

  const extension = extensionFromMimeType(attachment.mimeType);
  let data: Buffer;
  try {
    data = await c.var.fileService.readFile(attachment.sha256, extension);
  } catch (error) {
    throw {
      code: 'NOT_FOUND_ATTACHMENT',
      message: 'Attachment content not found',
      details: { attachmentId, error: String(error) },
    };
  }

  const body = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const headers = new Headers({
    'Content-Type': attachment.mimeType,
    'Content-Length': String(data.byteLength),
    'Content-Disposition': contentDispositionInline(attachment.filename),
    ETag: `"${attachment.sha256}"`,
    'Cache-Control': 'private, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
  });

  return new Response(body, { headers });
});

function contentDispositionInline(filename: string): string {
  return `inline; filename="${sanitizeFilename(filename)}"`;
}

function sanitizeFilename(value: string): string {
  const sanitized = stripControlCharacters(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 255);

  return sanitized.length > 0 ? sanitized : 'attachment';
}

function stripControlCharacters(value: string): string {
  let result = '';
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code >= 32 && code !== 127) {
      result += char;
    }
  }
  return result;
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

export { attachments };

type FileLike = {
  arrayBuffer: () => Promise<ArrayBuffer>;
  size: number;
  type: string;
  name: string;
};

function isFileLike(value: unknown): value is FileLike {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record['arrayBuffer'] === 'function' &&
    typeof record['size'] === 'number' &&
    typeof record['type'] === 'string' &&
    typeof record['name'] === 'string'
  );
}
