import * as React from 'react';

/**
 * Creates a ref that always holds the latest callback value.
 * Useful for passing callbacks to extension/plugin systems that
 * capture refs during initialization.
 *
 * @example
 * const onSearchRef = useCallbackRef(onSearch);
 * // In extension: onSearchRef.current?.(query)
 */
export function useCallbackRef<T>(callback: T | undefined): React.RefObject<T | undefined> {
  const ref = React.useRef(callback);

  React.useEffect(() => {
    ref.current = callback;
  }, [callback]);

  return ref;
}
