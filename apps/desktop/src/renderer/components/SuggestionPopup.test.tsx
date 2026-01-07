/**
 * SuggestionPopup Component Tests
 *
 * Tests for the autocomplete dropdown used by wiki-links and mentions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
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

describe('SuggestionPopup', () => {
  describe('rendering', () => {
    it('renders loading state when isLoading is true', () => {
      render(<SuggestionPopup items={[]} isLoading={true} query="" onSelect={vi.fn()} />);

      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });

    it('renders list of object suggestions', () => {
      render(
        <SuggestionPopup items={mockObjects} isLoading={false} query="proj" onSelect={vi.fn()} />
      );

      expect(screen.getByText('Project Alpha')).toBeInTheDocument();
      expect(screen.getByText('Meeting Notes')).toBeInTheDocument();
    });

    it('displays object type key alongside title', () => {
      render(
        <SuggestionPopup items={mockObjects} isLoading={false} query="proj" onSelect={vi.fn()} />
      );

      expect(screen.getByText('Page')).toBeInTheDocument();
      expect(screen.getByText('DailyNote')).toBeInTheDocument();
    });

    it('shows "Create new" option when query is non-empty', () => {
      render(<SuggestionPopup items={[]} isLoading={false} query="New Note" onSelect={vi.fn()} />);

      expect(screen.getByText(/create.*"New Note"/i)).toBeInTheDocument();
    });

    it('does not show "Create new" option when query is empty', () => {
      render(<SuggestionPopup items={mockObjects} isLoading={false} query="" onSelect={vi.fn()} />);

      expect(screen.queryByText(/create/i)).not.toBeInTheDocument();
    });

    it('shows "No results" when items empty and query is empty', () => {
      render(<SuggestionPopup items={[]} isLoading={false} query="" onSelect={vi.fn()} />);

      expect(screen.getByText(/no results/i)).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('calls onSelect with object when clicking a suggestion', () => {
      const onSelect = vi.fn();
      render(
        <SuggestionPopup items={mockObjects} isLoading={false} query="proj" onSelect={onSelect} />
      );

      fireEvent.click(screen.getByText('Project Alpha'));

      expect(onSelect).toHaveBeenCalledWith(mockObjects[0]);
    });

    it('calls onSelect with createNew object when clicking "Create new"', () => {
      const onSelect = vi.fn();
      render(
        <SuggestionPopup items={[]} isLoading={false} query="My New Page" onSelect={onSelect} />
      );

      fireEvent.click(screen.getByText(/create.*"My New Page"/i));

      expect(onSelect).toHaveBeenCalledWith({ createNew: true, title: 'My New Page' });
    });
  });

  describe('keyboard navigation', () => {
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
});
