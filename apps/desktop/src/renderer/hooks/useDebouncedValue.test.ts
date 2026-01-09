/**
 * Tests for useDebouncedValue hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue.js';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300));

    expect(result.current).toBe('initial');
  });

  it('does not update value before delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    // Change the value
    rerender({ value: 'updated', delay: 300 });

    // Value should still be initial before delay
    expect(result.current).toBe('initial');

    // Advance time but not past delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('initial');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'initial', delay: 300 },
    });

    // Change the value
    rerender({ value: 'updated', delay: 300 });

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 'a', delay: 300 },
    });

    // Rapid changes
    rerender({ value: 'b', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'c', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'd', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should still be 'a' because timer keeps resetting
    expect(result.current).toBe('a');

    // Now let it settle
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('d');
  });

  it('works with different types', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebouncedValue(value, delay), {
      initialProps: { value: 42, delay: 100 },
    });

    expect(result.current).toBe(42);

    rerender({ value: 100, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe(100);
  });
});
