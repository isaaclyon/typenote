/**
 * Tests for useTypenoteEvents hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTypenoteEvents } from './useTypenoteEvents.js';
import type { TypenoteEvent } from '@typenote/api';

describe('useTypenoteEvents', () => {
  let mockOnEvent: ReturnType<typeof vi.fn>;
  let mockUnsubscribe: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock functions
    mockUnsubscribe = vi.fn();
    mockOnEvent = vi.fn(() => mockUnsubscribe);

    // Mock window.typenoteAPI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).typenoteAPI = {
      onEvent: mockOnEvent,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).typenoteAPI;
  });

  it('subscribes to events via window.typenoteAPI.onEvent', () => {
    const handler = vi.fn();

    renderHook(() => useTypenoteEvents(handler));

    expect(mockOnEvent).toHaveBeenCalledWith(handler);
    expect(mockOnEvent).toHaveBeenCalledOnce();
  });

  it('calls unsubscribe function on unmount', () => {
    const handler = vi.fn();

    const { unmount } = renderHook(() => useTypenoteEvents(handler));

    // Verify subscription happened
    expect(mockOnEvent).toHaveBeenCalled();

    // Unmount the hook
    unmount();

    // Verify unsubscribe was called
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('calls handler when event is received', () => {
    const handler = vi.fn();

    renderHook(() => useTypenoteEvents(handler));

    // Simulate an event being received by calling the handler that was passed to onEvent
    const subscribedHandler = mockOnEvent.mock.calls[0]?.[0];
    expect(subscribedHandler).toBeDefined();

    const testEvent: TypenoteEvent = {
      type: 'object:created',
      payload: {
        id: 'test-id',
        typeKey: 'Page',
        title: 'Test Page',
        createdAt: new Date(),
      },
    };

    subscribedHandler(testEvent);

    expect(handler).toHaveBeenCalledWith(testEvent);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('resubscribes when deps change', () => {
    const handler = vi.fn();

    const { rerender } = renderHook(({ deps }) => useTypenoteEvents(handler, deps), {
      initialProps: { deps: ['dep1'] as React.DependencyList },
    });

    expect(mockOnEvent).toHaveBeenCalledOnce();
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    // Change deps
    rerender({ deps: ['dep2'] as React.DependencyList });

    // Should unsubscribe from old and subscribe to new
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
    expect(mockOnEvent).toHaveBeenCalledTimes(2);
  });

  it('does not resubscribe when deps are empty (default)', () => {
    const handler = vi.fn();

    const { rerender } = renderHook(() => useTypenoteEvents(handler));

    expect(mockOnEvent).toHaveBeenCalledOnce();

    // Rerender with same props
    rerender();

    // Should not resubscribe
    expect(mockOnEvent).toHaveBeenCalledOnce();
    expect(mockUnsubscribe).not.toHaveBeenCalled();
  });

  it('handles multiple events correctly', () => {
    const handler = vi.fn();

    renderHook(() => useTypenoteEvents(handler));

    const subscribedHandler = mockOnEvent.mock.calls[0]?.[0];

    // Emit multiple events
    const event1: TypenoteEvent = {
      type: 'object:created',
      payload: {
        id: 'id1',
        typeKey: 'Page',
        title: 'Page 1',
        createdAt: new Date(),
      },
    };

    const event2: TypenoteEvent = {
      type: 'object:created',
      payload: {
        id: 'id2',
        typeKey: 'Note',
        title: 'Note 1',
        createdAt: new Date(),
      },
    };

    subscribedHandler(event1);
    subscribedHandler(event2);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenNthCalledWith(1, event1);
    expect(handler).toHaveBeenNthCalledWith(2, event2);
  });
});
