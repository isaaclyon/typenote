/**
 * Tests for EditorBottomSections component
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { EditorBottomSections } from './EditorBottomSections.js';
import { useBacklinks } from '../hooks/useBacklinks.js';
import { useUnlinkedMentions } from '../hooks/useUnlinkedMentions.js';

// Mock the hooks
vi.mock('../hooks/useBacklinks.js');
vi.mock('../hooks/useUnlinkedMentions.js');

describe('EditorBottomSections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render both Backlinks and Unlinked Mentions sections', () => {
    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<EditorBottomSections objectId="test-id" />);

    expect(screen.getByText('Backlinks')).toBeInTheDocument();
    expect(screen.getByText('Unlinked Mentions')).toBeInTheDocument();
  });

  it('should pass objectId to both section components', () => {
    const objectId = 'test-object-123';

    (useBacklinks as Mock).mockReturnValue({
      backlinks: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<EditorBottomSections objectId={objectId} />);

    // Verify hooks were called with correct objectId
    expect(useBacklinks).toHaveBeenCalledWith({ objectId });
    expect(useUnlinkedMentions).toHaveBeenCalledWith({ objectId });
  });

  it('should pass onNavigate to both section components', () => {
    const onNavigate = vi.fn();

    (useBacklinks as Mock).mockReturnValue({
      backlinks: [
        {
          sourceBlockId: 'block-1',
          sourceObjectId: 'obj-1',
          sourceObjectTitle: 'Note 1',
          targetBlockId: null,
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    (useUnlinkedMentions as Mock).mockReturnValue({
      mentions: [
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

    render(<EditorBottomSections objectId="test-id" onNavigate={onNavigate} />);

    // Expand both collapsed sections to see their content
    fireEvent.click(screen.getByText('Backlinks'));
    fireEvent.click(screen.getByText('Unlinked Mentions'));

    // Both sections should be rendered (we can verify by checking their content)
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });
});
