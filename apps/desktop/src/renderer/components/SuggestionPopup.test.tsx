/**
 * SuggestionPopup Rendering & Selection Tests
 *
 * Tests for rendering states and click selection interactions.
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

describe('SuggestionPopup rendering', () => {
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

describe('SuggestionPopup selection', () => {
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
