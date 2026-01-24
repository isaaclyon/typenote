import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that returns a debounced version of the provided callback.
 * The callback will only be invoked after `delay` ms of inactivity.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}
