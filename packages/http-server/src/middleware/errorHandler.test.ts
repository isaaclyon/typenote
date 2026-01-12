import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { errorHandler, errorOnError } from './errorHandler.js';

describe('Error Handler', () => {
  it('converts NOT_FOUND_OBJECT error to 404 response', async () => {
    const app = new Hono();
    app.use('*', errorHandler());
    app.get('/test', () => {
      const error = {
        code: 'NOT_FOUND_OBJECT',
        message: 'Object not found: 01HZX123',
        details: { objectId: '01HZX123' },
      };
      throw error;
    });

    const res = await app.request('/test');

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND_OBJECT',
        message: 'Object not found: 01HZX123',
        details: { objectId: '01HZX123' },
      },
    });
  });

  it('converts VALIDATION error to 400 response', async () => {
    const app = new Hono();
    app.use('*', errorHandler());
    app.get('/test', () => {
      throw { code: 'VALIDATION', message: 'Invalid input' };
    });

    const res = await app.request('/test');

    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('converts unknown errors to 500 INTERNAL', async () => {
    const app = new Hono();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.get('/test', () => {
      throw new Error('Unexpected error');
    });

    const res = await app.request('/test');

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toEqual({
      success: false,
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred',
      },
    });
  });
});
