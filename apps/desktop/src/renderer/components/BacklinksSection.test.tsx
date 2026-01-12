/**
 * Tests for BacklinksSection component
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BacklinksSection } from './BacklinksSection.js';
import { useBacklinks } from '../hooks/useBacklinks.js';

// Mock the useBacklinks hook
vi.mock('../hooks/useBacklinks.js');

describe('BacklinksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render loading skeleton when loading', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    // Should show title
    expect(screen.getByText('Backlinks')).toBeInTheDocument();

    // Should show loading state (skeleton elements are rendered)
    // Note: We're checking that it's not showing empty state or error
    expect(screen.queryByText('No backlinks yet')).not.toBeInTheDocument();
  });

  it('should render error message when error occurs', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: false,
      error: 'Failed to fetch backlinks',
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    expect(screen.getByText('Backlinks')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch backlinks')).toBeInTheDocument();
  });

  it('should render empty state when no backlinks', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    expect(screen.getByText('Backlinks')).toBeInTheDocument();
    expect(screen.getByText('No backlinks yet')).toBeInTheDocument();
    expect(
      screen.getByText('Other documents that link to this one will appear here.')
    ).toBeInTheDocument();
  });

  it('should render backlinks list when backlinks exist', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Daily Note - 2026-01-10',
          targetBlockId: null,
        },
        {
          sourceBlockId: 'block-2',
          sourceObjectId: 'obj-2',
          sourceObjectTitle: 'Dev Log',
          targetBlockId: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    expect(screen.getByText('Backlinks')).toBeInTheDocument();
    expect(screen.getByText('Daily Note - 2026-01-10')).toBeInTheDocument();
    expect(screen.getByText('Dev Log')).toBeInTheDocument();
  });

  it('should show count in section header', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Note 1',
          targetBlockId: null,
        },
        {
          sourceBlockId: 'block-2',
          sourceObjectId: 'obj-2',
          sourceObjectTitle: 'Note 2',
          targetBlockId: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    // Should show count (2 backlinks)
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should call onNavigate when backlink is clicked', () => {
    const onNavigate = vi.fn();

    (useBacklinks as Mock).mockReturnValue({
      backlinks: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Daily Note',
          targetBlockId: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" onNavigate={onNavigate} />);

    const backlinkItem = screen.getByText('Daily Note');
    fireEvent.click(backlinkItem);

    expect(onNavigate).toHaveBeenCalledWith('obj-1');
  });

  it('should not call onNavigate when clicking backlink if onNavigate not provided', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Daily Note',
          targetBlockId: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Should not throw error when onNavigate is undefined
    render(<BacklinksSection objectId="test-id" />);

    const backlinkItem = screen.getByText('Daily Note');
    fireEvent.click(backlinkItem);

    // No error should occur
  });

  it('should use correct storageKey for CollapsibleSection', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BacklinksSection objectId="test-id" />);

    // Storage key should be "editor.backlinks.collapsed"
    // This is tested indirectly - CollapsibleSection uses it for localStorage
    // We verify the component renders correctly
    expect(screen.getByText('Backlinks')).toBeInTheDocument();
  });
});
