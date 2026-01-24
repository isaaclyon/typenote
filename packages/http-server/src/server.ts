import { Hono } from 'hono';
import { serve, type ServerType } from '@hono/node-server';
import type { FileService, TypenoteDb } from '@typenote/storage';
import { errorHandler, errorOnError } from './middleware/errorHandler.js';
import { createRouter } from './router.js';
import type { ServerContext } from './types.js';

/**
 * Configuration for the HTTP server.
 */
export interface ServerConfig {
  /** Database connection to use for all requests */
  db: TypenoteDb;
  /** File service for attachment reads */
  fileService: FileService;
  /** Port to listen on (default: 3456) */
  port?: number;
  /** Host to bind to (default: 127.0.0.1) */
  host?: string;
}

/**
 * HTTP server instance with lifecycle methods.
 */
export interface HttpServer {
  /** Start the server */
  start: () => Promise<void>;
  /** Stop the server */
  stop: () => Promise<void>;
  /** The port the server is configured to use */
  port: number;
  /** The Hono app instance (for testing) */
  app: Hono<ServerContext>;
}

/**
 * Creates an HTTP server with all routes configured.
 *
 * @param config - Server configuration
 * @returns Server instance with start/stop methods
 */
export function createHttpServer(config: ServerConfig): HttpServer {
  const { db, fileService, port = 3456, host = '127.0.0.1' } = config;

  const app = new Hono<ServerContext>();

  // Error handling middleware
  app.use('*', errorHandler());
  app.onError(errorOnError);

  // Inject database into context
  app.use('*', async (c, next) => {
    c.set('db', db);
    c.set('fileService', fileService);
    await next();
  });

  // Mount API routes
  app.route('/api/v1', createRouter());

  let server: ServerType | null = null;

  return {
    port,
    app,
    start: () => {
      return new Promise((resolve) => {
        server = serve(
          {
            fetch: app.fetch,
            port,
            hostname: host,
          },
          () => {
            console.log(`HTTP server listening on http://${host}:${port}`);
            resolve();
          }
        );
      });
    },
    stop: () => {
      return new Promise((resolve) => {
        if (server) {
          server.close(() => {
            server = null;
            resolve();
          });
        } else {
          resolve();
        }
      });
    },
  };
}
