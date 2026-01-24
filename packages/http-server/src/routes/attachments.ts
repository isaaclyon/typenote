import { Hono } from 'hono';
import { getAttachment } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const attachments = new Hono<ServerContext>();

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

  c.header('Content-Type', attachment.mimeType);
  c.header('Content-Length', String(data.byteLength));
  c.header('Content-Disposition', contentDispositionInline(attachment.filename));
  c.header('ETag', `"${attachment.sha256}"`);
  c.header('Cache-Control', 'private, max-age=31536000, immutable');
  c.header('X-Content-Type-Options', 'nosniff');

  return c.body(data);
});

function contentDispositionInline(filename: string): string {
  return `inline; filename="${sanitizeFilename(filename)}"`;
}

function sanitizeFilename(value: string): string {
  return value.replace(/[\r\n"]/g, '_');
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
