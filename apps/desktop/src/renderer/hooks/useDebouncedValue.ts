/**
 * useDebouncedValue Hook
 *
 * Returns a debounced version of the input value.
 * The returned value only updates after the specified delay
 * has passed without the input changing.
 */

import { useState, useEffect } from 'react';

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
