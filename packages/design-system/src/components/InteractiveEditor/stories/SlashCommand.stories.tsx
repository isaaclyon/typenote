import type { Story } from '@ladle/react';
import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { CalloutNode } from '../extensions/CalloutNode.js';
import {
  SlashCommandExtension,
  SlashCommandMenu,
  SlashCommandPopup,
  useSlashCommand,
} from '../extensions/SlashCommand/index.js';
import { mockCommands, filterCommands } from '../mocks/mockCommands.js';

export default {
  title: 'InteractiveEditor/Slash Command',
};

/**
 * Interactive editor with slash command support.
 * Type "/" to open the command menu.
 */
export const Basic: Story = () => {
  const slashCommand = useSlashCommand();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type "/" to see commands...',
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      CalloutNode,
      SlashCommandExtension.configure({
        suggestion: slashCommand.suggestionOptions,
      }),
    ],
    immediatelyRender: false,
  });

  return (
    <div className="p-4 border rounded-lg bg-white max-w-2xl">
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <strong>Instructions:</strong> Type{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">/</kbd> to open the
        slash command menu. Use arrow keys to navigate and Enter to select.
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none min-h-[200px]"
      />
      <SlashCommandPopup
        ref={slashCommand.setMenuRef}
        isOpen={slashCommand.state.isOpen}
        items={slashCommand.state.items}
        clientRect={slashCommand.state.clientRect}
        onSelect={slashCommand.state.onSelect}
      />
    </div>
  );
};

/**
 * Shows the slash command menu in isolation.
 * Demonstrates keyboard navigation and selection.
 */
export const MenuStandalone: Story = () => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Click on any command to select it. The selected command will be shown below.
        </p>
        {selectedItem && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Selected: <strong>{selectedItem}</strong>
          </div>
        )}
      </div>
      <SlashCommandMenu
        items={mockCommands}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.label)}
      />
    </div>
  );
};

/**
 * Demonstrates command filtering behavior.
 */
export const MenuWithFilter: Story = () => {
  const [query, setQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const filteredCommands = filterCommands(query);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter commands:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'heading', 'list', 'callout'..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-2 text-sm text-gray-500">
        Showing {filteredCommands.length} of {mockCommands.length} commands
      </div>
      {selectedItem && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          Selected: <strong>{selectedItem}</strong>
        </div>
      )}
      <SlashCommandMenu
        items={filteredCommands}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.label)}
      />
    </div>
  );
};

/**
 * Empty state when no commands match the filter.
 */
export const MenuEmpty: Story = () => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          This shows what happens when no commands match the search query.
        </p>
      </div>
      <SlashCommandMenu items={[]} selectedIndex={0} onSelect={() => {}} />
    </div>
  );
};

/**
 * All available commands in the menu.
 */
export const AllCommands: Story = () => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">All Available Commands</h3>
        <p className="text-sm text-gray-600">
          These are all {mockCommands.length} commands available in the slash menu.
        </p>
      </div>
      <SlashCommandMenu items={mockCommands} selectedIndex={0} onSelect={() => {}} />
    </div>
  );
};
