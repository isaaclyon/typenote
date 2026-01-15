/**
 * SlashCommandMenu Interaction Tests
 *
 * Tests for click interactions and command execution.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Heading1 } from 'lucide-react';
import { SlashCommandMenu } from './SlashCommandMenu.js';
import type { SlashCommand } from '../../extensions/SlashCommand/types.js';

describe('SlashCommandMenu click interaction', () => {
  let mockCommand: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCommand = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

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
});
