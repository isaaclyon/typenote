/**
 * SuggestionPopup Keyboard Navigation Tests
 *
 * Tests for arrow key navigation and Enter selection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { SuggestionPopup } from './SuggestionPopup.js';
import type { ObjectSummary } from '@typenote/api';

// Sample test data
const mockObjects: ObjectSummary[] = [
  {
    id: '01ABC123',
    title: 'Project Alpha',
    typeId: 'type-1',
    typeKey: 'Page',
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '01DEF456',
    title: 'Meeting Notes',
    typeId: 'type-2',
    typeKey: 'DailyNote',
    updatedAt: new Date('2024-01-14'),
  },
];

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('SuggestionPopup keyboard navigation', () => {
  it('exposes onKeyDown handler via ref for arrow navigation', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="proj"
        onSelect={vi.fn()}
      />
    );

    // Ref should expose onKeyDown
    expect(ref.current).not.toBeNull();
    expect(typeof ref.current?.onKeyDown).toBe('function');
  });

  it('returns true for handled keys (ArrowUp, ArrowDown, Enter)', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="proj"
        onSelect={vi.fn()}
      />
    );

    expect(ref.current?.onKeyDown({ key: 'ArrowDown' })).toBe(true);
    expect(ref.current?.onKeyDown({ key: 'ArrowUp' })).toBe(true);
    expect(ref.current?.onKeyDown({ key: 'Enter' })).toBe(true);
  });

  it('returns false for unhandled keys', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="proj"
        onSelect={vi.fn()}
      />
    );

    expect(ref.current?.onKeyDown({ key: 'a' })).toBe(false);
    expect(ref.current?.onKeyDown({ key: 'Tab' })).toBe(false);
  });

  it('calls onSelect with selected item when pressing Enter', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;
    const onSelect = vi.fn();

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="proj"
        onSelect={onSelect}
      />
    );

    // First item should be selected by default
    ref.current?.onKeyDown({ key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockObjects[0]);
  });

  it('navigates selection with ArrowDown and selects with Enter', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;
    const onSelect = vi.fn();

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="proj"
        onSelect={onSelect}
      />
    );

    // Move down to second item
    ref.current?.onKeyDown({ key: 'ArrowDown' });
    ref.current?.onKeyDown({ key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockObjects[1]);
  });

  it('wraps around when navigating past last item', () => {
    const ref = { current: null } as React.RefObject<{
      onKeyDown: (event: { key: string }) => boolean;
    } | null>;
    const onSelect = vi.fn();

    render(
      <SuggestionPopup
        ref={ref}
        items={mockObjects}
        isLoading={false}
        query="test" // Has "Create new" option too
        onSelect={onSelect}
      />
    );

    // Navigate past all items (2 objects + 1 create new = 3 items)
    ref.current?.onKeyDown({ key: 'ArrowDown' }); // index 1
    ref.current?.onKeyDown({ key: 'ArrowDown' }); // index 2 (create new)
    ref.current?.onKeyDown({ key: 'ArrowDown' }); // wraps to index 0
    ref.current?.onKeyDown({ key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockObjects[0]);
  });
});
