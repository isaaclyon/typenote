/**
 * IPC outcome types matching global.d.ts definitions.
 * Copied here for type safety since global.d.ts doesn't export them.
 */
interface IpcSuccess<T> {
  success: true;
  result: T;
}

interface IpcError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IpcOutcome<T> = IpcSuccess<T> | IpcError;

/**
 * Adapts IPC outcome to Query's expected format.
 * Throws error on failure (Query catches and stores in error state).
 */
export async function adaptIpcOutcome<T>(outcomePromise: Promise<IpcOutcome<T>>): Promise<T> {
  const outcome = await outcomePromise;

  if (!outcome.success) {
    throw new Error(outcome.error.message);
  }

  return outcome.result;
}

/**
 * Helper for creating query functions that call IPC.
 *
 * Usage:
 * ```typescript
 * queryFn: ipcQuery(() => window.typenoteAPI.getObject(id))
 * ```
 */
export function ipcQuery<T>(fn: () => Promise<IpcOutcome<T>>): () => Promise<T> {
  return () => adaptIpcOutcome(fn());
}
