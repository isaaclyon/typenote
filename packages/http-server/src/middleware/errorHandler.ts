import type { MiddlewareHandler, ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

const ERROR_CODE_TO_HTTP_STATUS: Record<string, ContentfulStatusCode> = {
  NOT_FOUND_OBJECT: 404,
  NOT_FOUND_BLOCK: 404,
  NOT_FOUND_TAG: 404,
  NOT_FOUND_ATTACHMENT: 404,
  NOT_FOUND_OBJECT_TYPE: 404,
  NOT_FOUND_TEMPLATE: 404,
  TYPE_NOT_FOUND: 400,
  TYPE_KEY_EXISTS: 409,
  TYPE_BUILT_IN: 409,
  TYPE_IN_USE: 409,
  TYPE_HAS_CHILDREN: 409,
  TYPE_INHERITANCE_CYCLE: 400,
  TYPE_INHERITANCE_DEPTH: 400,
  INVALID_DATE_FORMAT: 400,
  VALIDATION_FAILED: 400,
  VALIDATION: 400,
  CONFLICT_VERSION: 409,
  CONFLICT_ORDERING: 409,
  CONFLICT_TAG_SLUG: 409,
  INVARIANT_CYCLE: 400,
  INVARIANT_CROSS_OBJECT: 400,
  INVARIANT_PARENT_DELETED: 400,
  INVARIANT_TAG_IN_USE: 409,
  IDEMPOTENCY_CONFLICT: 409,
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_FILE_TYPE: 415,
  INTERNAL: 500,
  // TagService error codes
  TAG_NOT_FOUND: 404,
  TAG_SLUG_EXISTS: 409,
  TAG_IN_USE: 409,
  // TrashService error codes
  OBJECT_NOT_FOUND: 404,
  // UpdateObjectService error codes
  NOT_FOUND: 404,
  PROPERTY_TYPE_MISMATCH: 400,
  // DuplicateObjectService error codes
  INVARIANT_DAILY_NOTE_NOT_DUPLICABLE: 400,
};

interface ServiceErrorLike {
  code: string;
  message: string;
  details?: unknown;
}

function isServiceError(error: unknown): error is ServiceErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

/**
 * Middleware to catch service errors (objects with code property).
 * Use with app.use('*', errorHandler())
 */
export function errorHandler(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (error) {
      // Check if it's a service error (has code property)
      if (isServiceError(error)) {
        const status: ContentfulStatusCode = ERROR_CODE_TO_HTTP_STATUS[error.code] ?? 500;
        return c.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
          },
          status
        );
      }

      // Re-throw Error instances to be caught by onError handler
      throw error;
    }
  };
}

/**
 * Error handler for uncaught Error instances.
 * Use with app.onError(errorOnError)
 *
 * Handles both ServiceError instances (with code property) and generic errors.
 */
export const errorOnError: ErrorHandler = (error, c) => {
  // Check if it's a service error (Error with code property)
  if (isServiceError(error)) {
    const status: ContentfulStatusCode = ERROR_CODE_TO_HTTP_STATUS[error.code] ?? 500;
    return c.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: (error as ServiceErrorLike & { details?: unknown }).details,
        },
      },
      status
    );
  }

  // Generic error
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL',
        message: 'An unexpected error occurred',
      },
    },
    500
  );
};
