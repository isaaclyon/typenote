import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  InMemoryFileService,
} from '@typenote/storage';
import { createHttpServer } from './server.js';

describe('HTTP Server', () => {
  let db: TypenoteDb;
  let fileService: InMemoryFileService;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('createHttpServer', () => {
    it('creates server with start and stop methods', () => {
      const server = createHttpServer({ db, fileService });

      expect(server).toHaveProperty('start');
      expect(server).toHaveProperty('stop');
      expect(typeof server.start).toBe('function');
      expect(typeof server.stop).toBe('function');
    });

    it('exposes port in config', () => {
      const server = createHttpServer({ db, fileService, port: 4000 });

      expect(server.port).toBe(4000);
    });

    it('uses default port 3456 when not specified', () => {
      const server = createHttpServer({ db, fileService });

      expect(server.port).toBe(3456);
    });
  });

  describe('server lifecycle', () => {
    it('starts and responds to health check', async () => {
      // Use random port to avoid conflicts
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = createHttpServer({ db, fileService, port });

      try {
        await server.start();

        const res = await fetch(`http://127.0.0.1:${port}/api/v1/health`);
        expect(res.status).toBe(200);

        const body = (await res.json()) as { success: boolean };
        expect(body.success).toBe(true);
      } finally {
        await server.stop();
      }
    });

    it('stops cleanly', async () => {
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = createHttpServer({ db, fileService, port });

      await server.start();
      await server.stop();

      // After stop, fetch should fail
      await expect(fetch(`http://127.0.0.1:${port}/api/v1/health`)).rejects.toThrow();
    });
  });
});
