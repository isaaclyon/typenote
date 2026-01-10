/**
 * SlashCommandMenu Component Tests
 *
 * TDD tests for the slash command menu React components.
 * Tests cover rendering, keyboard navigation, and command execution.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Heading1, Heading2, Heading3, Type, List } from 'lucide-react';
import { SlashCommandMenu } from './SlashCommandMenu.js';
import type { SlashCommand } from '../../extensions/SlashCommand/types.js';
import type { SlashCommandMenuHandle } from './SlashCommandMenu.js';
import { createRef } from 'react';

describe('SlashCommandMenu', () => {
  let mockCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommand = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: Empty state
  it('renders empty state when items.length === 0', () => {
    render(<SlashCommandMenu items={[]} command={mockCommand} />);
    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

  // Test 2: Flat list (< 8 items)
  it('renders flat list when items.length < 8 (no section headers)', () => {
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large heading',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium heading',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
      {
        id: 'paragraph',
        label: 'Paragraph',
        description: 'Normal text',
        section: 'Basic',
        icon: Type,
        execute: vi.fn(),
      },
    ];

    render(<SlashCommandMenu items={mockCommands} command={mockCommand} />);

    // Should render all items
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Heading 2')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();

    // Should NOT render section headers
    expect(screen.queryByText('HEADINGS')).not.toBeInTheDocument();
    expect(screen.queryByText('BASIC')).not.toBeInTheDocument();
  });

  // Test 3: Grouped list (>= 8 items)
  it('renders sections when items.length >= 8 (with section headers)', () => {
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
      {
        id: 'heading-3',
        label: 'Heading 3',
        description: 'Small',
        section: 'Headings',
        icon: Heading3,
        execute: vi.fn(),
      },
      {
        id: 'paragraph',
        label: 'Paragraph',
        description: 'Normal',
        section: 'Basic',
        icon: Type,
        execute: vi.fn(),
      },
      {
        id: 'bullet-list',
        label: 'Bullet List',
        description: 'Unordered',
        section: 'Lists',
        icon: List,
        execute: vi.fn(),
      },
      {
        id: 'ordered-list',
        label: 'Ordered List',
        description: 'Numbered',
        section: 'Lists',
        icon: List,
        execute: vi.fn(),
      },
      {
        id: 'task-list',
        label: 'Task List',
        description: 'Checkboxes',
        section: 'Lists',
        icon: List,
        execute: vi.fn(),
      },
      {
        id: 'quote',
        label: 'Quote',
        description: 'Blockquote',
        section: 'Formatting',
        icon: Type,
        execute: vi.fn(),
      },
    ];

    render(<SlashCommandMenu items={mockCommands} command={mockCommand} />);

    // Should render section headers
    expect(screen.getByText('BASIC')).toBeInTheDocument();
    expect(screen.getByText('HEADINGS')).toBeInTheDocument();
    expect(screen.getByText('LISTS')).toBeInTheDocument();
    expect(screen.getByText('FORMATTING')).toBeInTheDocument();

    // Should render all items
    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });

  // Test 4: Click interaction
  it('calls command on item click', async () => {
    const user = userEvent.setup();
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
    ];

    render(<SlashCommandMenu items={mockCommands} command={mockCommand} />);

    const item = screen.getByTestId('slash-command-heading-1');
    await user.click(item);

    expect(mockCommand).toHaveBeenCalledWith(mockCommands[0]);
    expect(mockCommand).toHaveBeenCalledTimes(1);
  });

  // Test 5: ArrowDown navigation
  it('navigates with ArrowDown (selectedIndex increments)', () => {
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
    ];

    const ref = createRef<SlashCommandMenuHandle>();
    const { rerender } = render(
      <SlashCommandMenu ref={ref} items={mockCommands} command={mockCommand} />
    );

    // First item should be selected by default
    let firstItem = screen.getByTestId('slash-command-heading-1');
    expect(firstItem).toHaveClass('bg-accent');

    // Press ArrowDown
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    const handled = ref.current?.onKeyDown({ event });

    expect(handled).toBe(true);

    // Force re-render to see updated selection
    rerender(<SlashCommandMenu ref={ref} items={mockCommands} command={mockCommand} />);

    // Second item should now be selected
    firstItem = screen.getByTestId('slash-command-heading-1');
    const secondItem = screen.getByTestId('slash-command-heading-2');
    expect(secondItem).toHaveClass('bg-accent');
    expect(firstItem).not.toHaveClass('bg-accent');
  });

  // Test 6: ArrowUp navigation with wrapping
  it('navigates with ArrowUp (wraps from 0 to last)', () => {
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
    ];

    const ref = createRef<SlashCommandMenuHandle>();
    const { rerender } = render(
      <SlashCommandMenu ref={ref} items={mockCommands} command={mockCommand} />
    );

    // First item should be selected by default
    let firstItem = screen.getByTestId('slash-command-heading-1');
    expect(firstItem).toHaveClass('bg-accent');

    // Press ArrowUp (should wrap to last item)
    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    const handled = ref.current?.onKeyDown({ event });

    expect(handled).toBe(true);

    // Force re-render to see updated selection
    rerender(<SlashCommandMenu ref={ref} items={mockCommands} command={mockCommand} />);

    // Last item should now be selected
    firstItem = screen.getByTestId('slash-command-heading-1');
    const secondItem = screen.getByTestId('slash-command-heading-2');
    expect(secondItem).toHaveClass('bg-accent');
    expect(firstItem).not.toHaveClass('bg-accent');
  });

  // Test 7: Enter key execution
  it('executes selected command on Enter', () => {
    const mockCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
    ];

    const ref = createRef<SlashCommandMenuHandle>();
    render(<SlashCommandMenu ref={ref} items={mockCommands} command={mockCommand} />);

    // Press Enter (should execute first command)
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const handled = ref.current?.onKeyDown({ event });

    expect(handled).toBe(true);
    expect(mockCommand).toHaveBeenCalledWith(mockCommands[0]);
    expect(mockCommand).toHaveBeenCalledTimes(1);
  });

  // Test 8: Selection reset on items change
  it('resets selection when items change', () => {
    const initialCommands: SlashCommand[] = [
      {
        id: 'heading-1',
        label: 'Heading 1',
        description: 'Large',
        section: 'Headings',
        icon: Heading1,
        execute: vi.fn(),
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        description: 'Medium',
        section: 'Headings',
        icon: Heading2,
        execute: vi.fn(),
      },
    ];

    const ref = createRef<SlashCommandMenuHandle>();
    const { rerender } = render(
      <SlashCommandMenu ref={ref} items={initialCommands} command={mockCommand} />
    );

    // Navigate to second item
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    ref.current?.onKeyDown({ event: downEvent });

    // Force re-render to see updated selection
    rerender(<SlashCommandMenu ref={ref} items={initialCommands} command={mockCommand} />);

    // Second item should be selected
    let secondItem = screen.getByTestId('slash-command-heading-2');
    expect(secondItem).toHaveClass('bg-accent');

    // Change items (simulate new search)
    const newCommands: SlashCommand[] = [
      {
        id: 'paragraph',
        label: 'Paragraph',
        description: 'Normal',
        section: 'Basic',
        icon: Type,
        execute: vi.fn(),
      },
    ];

    rerender(<SlashCommandMenu ref={ref} items={newCommands} command={mockCommand} />);

    // First (and only) item should now be selected
    const firstItem = screen.getByTestId('slash-command-paragraph');
    expect(firstItem).toHaveClass('bg-accent');
  });
});
