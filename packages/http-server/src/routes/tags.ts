import { Hono } from 'hono';
import { createTag, getTag, getTagBySlug, updateTag, deleteTag, listTags } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const tags = new Hono<ServerContext>();

/**
 * GET /tags - List all tags
 *
 * Query params:
 * - includeUsageCount: boolean (default false)
 * - sortBy: 'name' | 'createdAt' | 'usageCount' (default 'name')
 * - sortOrder: 'asc' | 'desc' (default 'asc')
 */
tags.get('/', (c) => {
  const db = c.var.db;

  const includeUsageCount = c.req.query('includeUsageCount') === 'true';
  const sortBy = c.req.query('sortBy') as 'name' | 'createdAt' | 'usageCount' | undefined;
  const sortOrder = c.req.query('sortOrder') as 'asc' | 'desc' | undefined;

  const tagList = listTags(db, {
    includeUsageCount,
    sortBy: sortBy ?? 'name',
    sortOrder: sortOrder ?? 'asc',
  });

  return c.json({
    success: true,
    data: tagList,
  });
});

/**
 * POST /tags - Create a new tag
 *
 * Request body:
 * - name: string (required)
 * - slug: string (required)
 * - color?: string | null
 * - icon?: string | null
 * - description?: string
 */
tags.post('/', async (c) => {
  const db = c.var.db;
  const body = (await c.req.json()) as {
    name: string;
    slug: string;
    color?: string | null;
    icon?: string | null;
    description?: string;
  };

  const created = createTag(db, {
    name: body.name,
    slug: body.slug,
    color: body.color,
    icon: body.icon,
    description: body.description,
  });

  return c.json(
    {
      success: true,
      data: created,
    },
    201
  );
});

/**
 * GET /tags/:id - Get tag by ID
 */
tags.get('/:id', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  const tag = getTag(db, id);

  if (!tag) {
    throw {
      code: 'NOT_FOUND_TAG',
      message: `Tag not found: ${id}`,
      details: { tagId: id },
    };
  }

  return c.json({
    success: true,
    data: tag,
  });
});

/**
 * GET /tags/by-slug/:slug - Get tag by slug
 */
tags.get('/by-slug/:slug', (c) => {
  const db = c.var.db;
  const slug = c.req.param('slug');

  const tag = getTagBySlug(db, slug);

  if (!tag) {
    throw {
      code: 'NOT_FOUND_TAG',
      message: `Tag not found with slug: ${slug}`,
      details: { slug },
    };
  }

  return c.json({
    success: true,
    data: tag,
  });
});

/**
 * PATCH /tags/:id - Update a tag
 *
 * Request body (all optional):
 * - name?: string
 * - slug?: string
 * - color?: string | null
 * - icon?: string | null
 * - description?: string | null
 */
tags.patch('/:id', async (c) => {
  const db = c.var.db;
  const id = c.req.param('id');
  const body = (await c.req.json()) as {
    name?: string;
    slug?: string;
    color?: string | null;
    icon?: string | null;
    description?: string | null;
  };

  const updated = updateTag(db, id, body);

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /tags/:id - Delete a tag
 *
 * Returns 204 No Content on success.
 * Throws 409 Conflict if tag is in use.
 */
tags.delete('/:id', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  deleteTag(db, id);

  return c.body(null, 204);
});

export { tags };
