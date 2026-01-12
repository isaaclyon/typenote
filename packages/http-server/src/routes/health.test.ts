import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { health } from './health.js';

describe('Health Route', () => {
  it('GET / returns success with ok status', async () => {
    const app = new Hono();
    app.route('/', health);

    const res = await app.request('/');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });
});
