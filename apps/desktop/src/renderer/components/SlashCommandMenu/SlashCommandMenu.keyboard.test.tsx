/**
 * SlashCommandMenu Keyboard Navigation Tests
 *
 * Tests for arrow key navigation, Enter execution, and selection reset.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Heading1, Heading2, Type } from 'lucide-react';
import { SlashCommandMenu } from './SlashCommandMenu.js';
import type { SlashCommand } from '../../extensions/SlashCommand/types.js';
import type { SlashCommandMenuHandle } from './SlashCommandMenu.js';
import { createRef } from 'react';

describe('SlashCommandMenu keyboard navigation', () => {
  let mockCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommand = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

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
