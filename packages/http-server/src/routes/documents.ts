import { Hono } from 'hono';
import { getDocument, DocumentNotFoundError, applyBlockPatch } from '@typenote/storage';
import type { ApplyBlockPatchInput } from '@typenote/api';
import type { ServerContext } from '../types.js';

const documents = new Hono<ServerContext>();

/**
 * GET /objects/:id/document - Get the full document for an object
 */
documents.get('/:id/document', (c) => {
  const id = c.req.param('id');
  const db = c.var.db;

  try {
    const document = getDocument(db, id);

    return c.json({
      success: true,
      data: document,
    });
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      throw {
        code: 'NOT_FOUND_OBJECT',
        message: `Object not found: ${id}`,
        details: { objectId: id },
      };
    }
    throw error;
  }
});

/**
 * PATCH /objects/:id/document - Apply a block patch to update the document
 */
documents.patch('/:id/document', async (c) => {
  const id = c.req.param('id');
  const db = c.var.db;
  const input = (await c.req.json()) as ApplyBlockPatchInput;

  // Validate objectId in body matches URL param
  if (input.objectId !== id) {
    throw {
      code: 'VALIDATION',
      message: 'Object ID mismatch between URL and body',
      details: { urlId: id, bodyId: input.objectId },
    };
  }

  const outcome = applyBlockPatch(db, input);

  if (!outcome.success) {
    throw {
      code: outcome.error.code,
      message: outcome.error.message,
      details: outcome.error.details,
    };
  }

  return c.json({
    success: true,
    data: outcome.result,
  });
});

export { documents };
