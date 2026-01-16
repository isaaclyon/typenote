/**
 * Shared async data state type
 *
 * Use this instead of ad-hoc LoadState types throughout the renderer.
 * Provides a consistent discriminated union for async data fetching states.
 */

export type AsyncData<T, E = string> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Type guard to check if async data is in success state
 */
export function isSuccess<T, E = string>(
  state: AsyncData<T, E>
): state is { status: 'success'; data: T } {
  return state.status === 'success';
}

/**
 * Type guard to check if async data is in error state
 */
export function isError<T, E = string>(
  state: AsyncData<T, E>
): state is { status: 'error'; error: E } {
  return state.status === 'error';
}
