import { Hono } from 'hono';

const health = new Hono();

health.get('/', (c) => {
  return c.json({
    success: true,
    data: { status: 'ok' },
  });
});

export { health };
