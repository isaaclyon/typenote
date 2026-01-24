import type { FileService, TypenoteDb } from '@typenote/storage';

/**
 * Hono context variables for dependency injection.
 * These are set by middleware and accessible in routes via c.var
 */
export interface ServerContext {
  Variables: {
    db: TypenoteDb;
    fileService: FileService;
    // Future: userId (auth)
  };
}
