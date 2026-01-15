/**
 * SlashCommandMenu Rendering Tests
 *
 * Tests for rendering states: empty, flat list, and grouped sections.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Heading1, Heading2, Heading3, Type, List } from 'lucide-react';
import { SlashCommandMenu } from './SlashCommandMenu.js';
import type { SlashCommand } from '../../extensions/SlashCommand/types.js';

describe('SlashCommandMenu rendering', () => {
  let mockCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommand = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty state when items.length === 0', () => {
    render(<SlashCommandMenu items={[]} command={mockCommand} />);
    expect(screen.getByText('No commands found')).toBeInTheDocument();
  });

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
});
