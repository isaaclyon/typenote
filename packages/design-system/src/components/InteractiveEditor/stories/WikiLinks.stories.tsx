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
  SlashCommandPopup,
  useSlashCommand,
} from '../extensions/SlashCommand/index.js';
import {
  RefNode,
  RefSuggestionExtension,
  RefSuggestionPopup,
  RefSuggestionMenu,
  useRefSuggestion,
} from '../extensions/RefNode/index.js';
import {
  TagNode,
  TagSuggestionExtension,
  TagSuggestionPopup,
  TagSuggestionMenu,
  useTagSuggestion,
} from '../extensions/TagNode/index.js';
import { mockNotes, filterNotes } from '../mocks/mockNotes.js';
import { mockTags, filterTags } from '../mocks/mockTags.js';

export default {
  title: 'InteractiveEditor/Wiki Links & Tags',
};

/**
 * Interactive editor with wiki-link and tag support.
 * Type "[[" to link to notes, "#" for tags, "/" for commands.
 */
export const Basic: Story = () => {
  const slashCommand = useSlashCommand();
  const refSuggestion = useRefSuggestion();
  const tagSuggestion = useTagSuggestion();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type "[["for wiki-links, "#" for tags, "/" for commands...',
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
      RefNode,
      RefSuggestionExtension.configure({
        suggestion: refSuggestion.suggestionOptions,
      }),
      TagNode,
      TagSuggestionExtension.configure({
        suggestion: tagSuggestion.suggestionOptions,
      }),
    ],
    immediatelyRender: false,
  });

  return (
    <div className="p-4 border rounded-lg bg-white max-w-2xl">
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <strong>Instructions:</strong>
        <ul className="mt-2 space-y-1 ml-4 list-disc">
          <li>
            Type <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">[[</kbd> to
            create a wiki-link to another note
          </li>
          <li>
            Type <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">#</kbd> to
            insert a tag
          </li>
          <li>
            Type <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs font-mono">/</kbd> for
            slash commands
          </li>
        </ul>
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
      <RefSuggestionPopup
        ref={refSuggestion.setMenuRef}
        isOpen={refSuggestion.state.isOpen}
        items={refSuggestion.state.items}
        clientRect={refSuggestion.state.clientRect}
        onSelect={refSuggestion.state.onSelect}
      />
      <TagSuggestionPopup
        ref={tagSuggestion.setMenuRef}
        isOpen={tagSuggestion.state.isOpen}
        items={tagSuggestion.state.items}
        clientRect={tagSuggestion.state.clientRect}
        onSelect={tagSuggestion.state.onSelect}
      />
    </div>
  );
};

/**
 * Editor pre-populated with wiki-links and tags.
 */
export const WithExistingContent: Story = () => {
  const slashCommand = useSlashCommand();
  const refSuggestion = useRefSuggestion();
  const tagSuggestion = useTagSuggestion();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type "[["for wiki-links, "#" for tags...',
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
      RefNode,
      RefSuggestionExtension.configure({
        suggestion: refSuggestion.suggestionOptions,
      }),
      TagNode,
      TagSuggestionExtension.configure({
        suggestion: tagSuggestion.suggestionOptions,
      }),
    ],
    content: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Meeting notes for today. Discussed ' },
            { type: 'ref', attrs: { id: '6', label: 'Q1 Product Roadmap', type: 'project' } },
            { type: 'text', text: ' with ' },
            { type: 'ref', attrs: { id: '14', label: 'Sarah Chen', type: 'person' } },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Action items are tagged ' },
            { type: 'tag', attrs: { id: '1', value: 'in-progress', color: '#3B82F6' } },
            { type: 'text', text: ' and marked ' },
            { type: 'tag', attrs: { id: '6', value: 'high-priority', color: '#F59E0B' } },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'See ' },
            {
              type: 'ref',
              attrs: { id: '3', label: 'Architecture Decision Records', type: 'note' },
            },
            { type: 'text', text: ' for more context.' },
          ],
        },
      ],
    },
    immediatelyRender: false,
  });

  return (
    <div className="p-4 border rounded-lg bg-white max-w-2xl">
      <div className="mb-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
        <strong>Pre-populated content:</strong> This editor shows wiki-links and tags already
        inserted. Click on them to see how they render.
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none min-h-[150px]"
      />
      <SlashCommandPopup
        ref={slashCommand.setMenuRef}
        isOpen={slashCommand.state.isOpen}
        items={slashCommand.state.items}
        clientRect={slashCommand.state.clientRect}
        onSelect={slashCommand.state.onSelect}
      />
      <RefSuggestionPopup
        ref={refSuggestion.setMenuRef}
        isOpen={refSuggestion.state.isOpen}
        items={refSuggestion.state.items}
        clientRect={refSuggestion.state.clientRect}
        onSelect={refSuggestion.state.onSelect}
      />
      <TagSuggestionPopup
        ref={tagSuggestion.setMenuRef}
        isOpen={tagSuggestion.state.isOpen}
        items={tagSuggestion.state.items}
        clientRect={tagSuggestion.state.clientRect}
        onSelect={tagSuggestion.state.onSelect}
      />
    </div>
  );
};

/**
 * Shows the wiki-link suggestion menu in isolation.
 */
export const RefMenuStandalone: Story = () => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Click on any note to select it. The selected note will be shown below.
        </p>
        {selectedItem && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Selected: <strong>{selectedItem}</strong>
          </div>
        )}
      </div>
      <RefSuggestionMenu
        items={mockNotes}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.title)}
      />
    </div>
  );
};

/**
 * Demonstrates wiki-link filtering behavior.
 */
export const RefMenuWithFilter: Story = () => {
  const [query, setQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const filteredNotes = filterNotes(query);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter notes:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'project', 'meeting', 'sarah'..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-2 text-sm text-gray-500">
        Showing {filteredNotes.length} of {mockNotes.length} notes
      </div>
      {selectedItem && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          Selected: <strong>{selectedItem}</strong>
        </div>
      )}
      <RefSuggestionMenu
        items={filteredNotes}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.title)}
      />
    </div>
  );
};

/**
 * Shows the tag suggestion menu in isolation.
 */
export const TagMenuStandalone: Story = () => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Click on any tag to select it. The selected tag will be shown below.
        </p>
        {selectedItem && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Selected: <strong>#{selectedItem}</strong>
          </div>
        )}
      </div>
      <TagSuggestionMenu
        items={mockTags}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.value)}
      />
    </div>
  );
};

/**
 * Demonstrates tag filtering behavior.
 */
export const TagMenuWithFilter: Story = () => {
  const [query, setQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const filteredTagsList = filterTags(query);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter tags:</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try 'progress', 'high', 'front'..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mb-2 text-sm text-gray-500">
        Showing {filteredTagsList.length} of {mockTags.length} tags
      </div>
      {selectedItem && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          Selected: <strong>#{selectedItem}</strong>
        </div>
      )}
      <TagSuggestionMenu
        items={filteredTagsList}
        selectedIndex={0}
        onSelect={(item) => setSelectedItem(item.value)}
      />
    </div>
  );
};

/**
 * Empty state when no notes or tags match.
 */
export const EmptyStates: Story = () => {
  return (
    <div className="p-4 space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Empty wiki-link menu:</h3>
        <RefSuggestionMenu items={[]} selectedIndex={0} onSelect={() => {}} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Empty tag menu:</h3>
        <TagSuggestionMenu items={[]} selectedIndex={0} onSelect={() => {}} />
      </div>
    </div>
  );
};

/**
 * All available notes in the menu.
 */
export const AllNotes: Story = () => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">All Available Notes</h3>
        <p className="text-sm text-gray-600">
          These are all {mockNotes.length} notes available for wiki-links.
        </p>
      </div>
      <RefSuggestionMenu items={mockNotes} selectedIndex={0} onSelect={() => {}} />
    </div>
  );
};

/**
 * All available tags in the menu.
 */
export const AllTags: Story = () => {
  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">All Available Tags</h3>
        <p className="text-sm text-gray-600">
          These are all {mockTags.length} tags available for tagging.
        </p>
      </div>
      <TagSuggestionMenu items={mockTags} selectedIndex={0} onSelect={() => {}} />
    </div>
  );
};
