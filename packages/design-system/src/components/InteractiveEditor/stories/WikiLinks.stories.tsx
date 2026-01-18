import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { mockWikiLinkProvider } from '../mocks/index.js';

export default {
  title: 'Components/InteractiveEditor/WikiLinks',
};

/**
 * Wiki-link autocomplete demo.
 * Type [[ to trigger the suggestion popup.
 */
export const Default: Story = () => (
  <div className="p-4">
    <div className="mb-4 rounded-md bg-muted p-3 text-sm">
      <p className="font-medium">Try it:</p>
      <ul className="mt-1 list-inside list-disc text-muted-foreground">
        <li>
          Type <code className="rounded bg-background px-1">[[</code> to trigger wiki-link
          autocomplete
        </li>
        <li>Search for notes by typing after the brackets</li>
        <li>Select a note to insert a wiki-link</li>
        <li>Or create a new note by typing a name and selecting &quot;Create&quot;</li>
      </ul>
    </div>
    <InteractiveEditor
      placeholder="Type [[ to create a wiki-link..."
      enableWikiLinks
      wikiLinkProvider={mockWikiLinkProvider}
      onNavigateToRef={(objectId) => {
        console.log('Navigate to:', objectId);
        alert(`Navigate to object: ${objectId}`);
      }}
    />
  </div>
);

/**
 * Wiki-link with pre-existing content containing links.
 */
export const WithExistingLinks: Story = () => (
  <div className="p-4">
    <InteractiveEditor
      initialContent={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This document links to ' },
              {
                type: 'refNode',
                attrs: { objectId: '01HXYZ001', label: 'Project Roadmap' },
              },
              { type: 'text', text: ' and ' },
              {
                type: 'refNode',
                attrs: { objectId: '01HXYZ005', label: 'John Smith' },
              },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Click on the links to trigger navigation!' }],
          },
        ],
      }}
      enableWikiLinks
      wikiLinkProvider={mockWikiLinkProvider}
      onNavigateToRef={(objectId) => {
        console.log('Navigate to:', objectId);
        alert(`Navigate to object: ${objectId}`);
      }}
    />
  </div>
);

/**
 * Search and filter demo.
 */
export const SearchDemo: Story = () => (
  <div className="p-4">
    <div className="mb-4 rounded-md bg-muted p-3 text-sm">
      <p className="font-medium">Search examples:</p>
      <ul className="mt-1 list-inside list-disc text-muted-foreground">
        <li>
          <code className="rounded bg-background px-1">[[proj</code> - filters to &quot;Project
          Roadmap&quot;
        </li>
        <li>
          <code className="rounded bg-background px-1">[[john</code> - filters to &quot;John
          Smith&quot;
        </li>
        <li>
          <code className="rounded bg-background px-1">[[meeting</code> - filters to &quot;Meeting
          Notes&quot;
        </li>
        <li>
          <code className="rounded bg-background px-1">[[new title</code> - shows &quot;Create&quot;
          option
        </li>
      </ul>
    </div>
    <InteractiveEditor
      placeholder="Try searching with [[ followed by text..."
      enableWikiLinks
      wikiLinkProvider={mockWikiLinkProvider}
    />
  </div>
);
