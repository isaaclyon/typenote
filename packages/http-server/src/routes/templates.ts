import { Hono } from 'hono';
import {
  CreateTemplateInputSchema,
  UpdateTemplateInputSchema,
  ListTemplatesOptionsSchema,
  SetDefaultTemplateInputSchema,
} from '@typenote/api';
import {
  listTemplates,
  createTemplate,
  getTemplate,
  updateTemplate,
  deleteTemplate,
  getDefaultTemplateForType,
  getObjectType,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const templates = new Hono<ServerContext>();

/**
 * GET /templates - List templates.
 */
templates.get('/', (c) => {
  const objectTypeId = c.req.query('objectTypeId');
  const includeDeleted = parseBoolean(c.req.query('includeDeleted'));
  const options: Record<string, unknown> = {};
  if (objectTypeId !== undefined) options['objectTypeId'] = objectTypeId;
  if (includeDeleted !== undefined) options['includeDeleted'] = includeDeleted;

  const parsed = ListTemplatesOptionsSchema.safeParse(options);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid template query',
      details: parsed.error.flatten(),
    };
  }

  const result = listTemplates(c.var.db, parsed.data);
  return c.json({
    success: true,
    data: { templates: result },
  });
});

/**
 * GET /templates/default - Get default template for type.
 */
templates.get('/default', (c) => {
  const objectTypeId = c.req.query('objectTypeId');
  if (objectTypeId === undefined) {
    throw {
      code: 'VALIDATION',
      message: 'objectTypeId is required',
    };
  }

  const parsed = ListTemplatesOptionsSchema.safeParse({ objectTypeId });
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid objectTypeId',
      details: parsed.error.flatten(),
    };
  }

  const objectType = getObjectType(c.var.db, objectTypeId);
  if (!objectType) {
    throw {
      code: 'NOT_FOUND_OBJECT_TYPE',
      message: 'Object type not found',
      details: { objectTypeId },
    };
  }

  const template = getDefaultTemplateForType(c.var.db, objectTypeId);
  if (!template) {
    throw {
      code: 'NOT_FOUND_TEMPLATE',
      message: 'Default template not found',
      details: { objectTypeId },
    };
  }

  return c.json({
    success: true,
    data: { template },
  });
});

/**
 * POST /templates/default - Set default template.
 */
templates.post('/default', async (c) => {
  const body = await c.req.json();
  const parsed = SetDefaultTemplateInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid default template payload',
      details: parsed.error.flatten(),
    };
  }

  const updated = updateTemplate(c.var.db, parsed.data.templateId, { isDefault: true });
  if (!updated) {
    throw {
      code: 'NOT_FOUND_TEMPLATE',
      message: 'Template not found',
      details: { templateId: parsed.data.templateId },
    };
  }

  return c.json({
    success: true,
    data: { template: updated },
  });
});

/**
 * GET /templates/:id - Get template by ID.
 */
templates.get('/:id', (c) => {
  const templateId = c.req.param('id');
  const template = getTemplate(c.var.db, templateId);
  if (!template) {
    throw {
      code: 'NOT_FOUND_TEMPLATE',
      message: 'Template not found',
      details: { templateId },
    };
  }

  return c.json({
    success: true,
    data: { template },
  });
});

/**
 * POST /templates - Create template.
 */
templates.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = CreateTemplateInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid template payload',
      details: parsed.error.flatten(),
    };
  }

  const objectType = getObjectType(c.var.db, parsed.data.objectTypeId);
  if (!objectType) {
    throw {
      code: 'NOT_FOUND_OBJECT_TYPE',
      message: 'Object type not found',
      details: { objectTypeId: parsed.data.objectTypeId },
    };
  }

  const template = createTemplate(c.var.db, parsed.data);
  return c.json(
    {
      success: true,
      data: { template },
    },
    201
  );
});

/**
 * PATCH /templates/:id - Update template.
 */
templates.patch('/:id', async (c) => {
  const templateId = c.req.param('id');
  const body = await c.req.json();
  const parsed = UpdateTemplateInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid template update',
      details: parsed.error.flatten(),
    };
  }

  const template = updateTemplate(c.var.db, templateId, parsed.data);
  if (!template) {
    throw {
      code: 'NOT_FOUND_TEMPLATE',
      message: 'Template not found',
      details: { templateId },
    };
  }

  return c.json({
    success: true,
    data: { template },
  });
});

/**
 * DELETE /templates/:id - Soft delete template.
 */
templates.delete('/:id', (c) => {
  const templateId = c.req.param('id');
  const deleted = deleteTemplate(c.var.db, templateId);
  if (!deleted) {
    throw {
      code: 'NOT_FOUND_TEMPLATE',
      message: 'Template not found',
      details: { templateId },
    };
  }

  return c.json({
    success: true,
    data: { deleted: true },
  });
});

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw {
    code: 'VALIDATION',
    message: 'Invalid boolean query value',
    details: { value },
  };
}

export { templates };
