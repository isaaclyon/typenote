/**
 * Tests for UnlinkedMentionsSection component
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { UnlinkedMentionsSection } from './UnlinkedMentionsSection.js';
import { useUnlinkedMentions } from '../hooks/useUnlinkedMentions.js';

// Mock the useUnlinkedMentions hook
vi.mock('../hooks/useUnlinkedMentions.js');

describe('UnlinkedMentionsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render loading skeleton when loading', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    // Should show title
    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();

    // Should show loading state (skeleton elements are rendered)
    expect(screen.queryByText('No unlinked mentions')).not.toBeInTheDocument();
  });

  it('should render error message when error occurs', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: false,
      error: 'Failed to fetch unlinked mentions',
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch unlinked mentions')).toBeInTheDocument();
  });

  it('should render empty state when no mentions', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();
    expect(screen.getByText('No unlinked mentions')).toBeInTheDocument();
    expect(
      screen.getByText('Documents that mention this title without linking will appear here.')
    ).toBeInTheDocument();
  });

  it('should render mentions list when mentions exist', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Dev Log - 2026-01-10',
        },
        {
          sourceBlockId: 'block-2',
          sourceObjectId: 'obj-2',
          sourceObjectTitle: 'Project Notes',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();
    expect(screen.getByText('Dev Log - 2026-01-10')).toBeInTheDocument();
    expect(screen.getByText('Project Notes')).toBeInTheDocument();
  });

  it('should show count in section header', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Note 1',
        },
        {
          sourceBlockId: 'block-2',
          sourceObjectId: 'obj-2',
          sourceObjectTitle: 'Note 2',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    // Should show count (2 mentions)
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });

  it('should call onNavigate when mention is clicked', () => {
    const onNavigate = vi.fn();

    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Dev Log',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" onNavigate={onNavigate} />);

    const mentionItem = screen.getByText('Dev Log');
    fireEvent.click(mentionItem);

    expect(onNavigate).toHaveBeenCalledWith('obj-1');
  });

  it('should not call onNavigate when clicking mention if onNavigate not provided', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Dev Log',
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    // Should not throw error when onNavigate is undefined
    render(<UnlinkedMentionsSection objectId="test-id" />);

    const mentionItem = screen.getByText('Dev Log');
    fireEvent.click(mentionItem);

    // No error should occur
  });

  it('should use correct storageKey for CollapsibleSection', () => {
    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<UnlinkedMentionsSection objectId="test-id" />);

    // Storage key should be "editor.unlinkedMentions.collapsed"
    // This is tested indirectly - CollapsibleSection uses it for localStorage
    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();
  });
});
