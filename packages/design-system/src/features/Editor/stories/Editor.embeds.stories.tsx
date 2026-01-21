/**
 * Editor - Embed stories
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';
import {
  mockRefSearch,
  mockRefCreate,
  mockHeadingSearch,
  mockBlockSearch,
  mockBlockIdInsert,
} from './shared.js';

// ============================================================================
// Mock content
// ============================================================================

const embedContentBasic: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Embeds render read-only previews of other objects.' }],
    },
    {
      type: 'embedNode',
      attrs: {
        objectId: '01J1234567890123456789A',
        objectType: 'Page',
        displayTitle: 'Getting Started Guide',
      },
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'You can continue writing below the embed.' }],
    },
  ],
};

const embedContentTargets: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Embeds can target headings or blocks.' }],
    },
    {
      type: 'embedNode',
      attrs: {
        objectId: '01J1234567890123456789B',
        objectType: 'Page',
        displayTitle: 'Project Roadmap',
        headingText: 'Q1 Goals',
      },
    },
    {
      type: 'embedNode',
      attrs: {
        objectId: '01J1234567890123456789A',
        objectType: 'Page',
        displayTitle: 'Getting Started Guide',
        blockId: 'key-insight',
      },
    },
  ],
};

const embedContentMissing: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'embedNode',
      attrs: {
        objectId: '01J9999999999999999999Z',
        objectType: 'Page',
        displayTitle: 'Missing Document',
      },
    },
  ],
};

const resolvedDocs: Record<string, JSONContent> = {
  '01J1234567890123456789A': {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Getting Started Guide' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'TypeNote keeps your notes local-first with fast search and rich references.',
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Your data never leaves your device.' },
              { type: 'blockIdNode', attrs: { id: 'key-insight' } },
            ],
          },
        ],
      },
    ],
  },
  '01J1234567890123456789B': {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Project Roadmap' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Q1 focuses on editor parity and stable sync primitives.' },
        ],
      },
      {
        type: 'bullet_list',
        content: [
          {
            type: 'list_item',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Embeds, footnotes, and references' }],
              },
            ],
          },
          {
            type: 'list_item',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'NotateDoc converters and markdown export' }],
              },
            ],
          },
        ],
      },
    ],
  },
};

const resolveEmbed = async (target: { objectId: string }): Promise<JSONContent> => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const doc = resolvedDocs[target.objectId];
  if (!doc) {
    throw new Error('Missing embed');
  }
  return doc;
};

// ============================================================================
// Stories
// ============================================================================

export const BasicEmbeds: Story = () => {
  const [content, setContent] = React.useState(embedContentBasic);
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={content}
        onChange={setContent}
        enableEmbeds
        enableRefs
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onHeadingSearch={mockHeadingSearch}
        onBlockSearch={mockBlockSearch}
        onBlockIdInsert={mockBlockIdInsert}
        onEmbedResolve={resolveEmbed}
        onEmbedOpen={(target) => setLastAction(`Open: ${target.displayTitle}`)}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Type <code className="bg-muted px-1 rounded">![[</code> to insert a new embed.
        </p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

BasicEmbeds.storyName = 'Basic';

export const TargetedEmbeds: Story = () => (
  <div className="space-y-4 p-6">
    <Editor
      content={embedContentTargets}
      enableEmbeds
      enableRefs
      onRefSearch={mockRefSearch}
      onRefCreate={mockRefCreate}
      onHeadingSearch={mockHeadingSearch}
      onBlockSearch={mockBlockSearch}
      onBlockIdInsert={mockBlockIdInsert}
      onEmbedResolve={resolveEmbed}
    />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Heading embeds show <code className="bg-muted px-1 rounded">Page &gt; Heading</code> in the
        title bar.
      </p>
      <p>
        Block embeds show <code className="bg-muted px-1 rounded">Page#^blockId</code>.
      </p>
    </div>
  </div>
);

TargetedEmbeds.storyName = 'Heading/Block Targets';

export const LiveUpdates: Story = () => {
  const [content, setContent] = React.useState(embedContentBasic);

  const subscribe = React.useCallback(
    (_target: { objectId: string }, onUpdate: (doc: JSONContent) => void) => {
      const timer = setTimeout(() => {
        onUpdate({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Updated Embed' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Live updates flow into the embed preview.' }],
            },
          ],
        });
      }, 2000);

      return () => clearTimeout(timer);
    },
    []
  );

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={content}
        onChange={setContent}
        enableEmbeds
        enableRefs
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onHeadingSearch={mockHeadingSearch}
        onBlockSearch={mockBlockSearch}
        onBlockIdInsert={mockBlockIdInsert}
        onEmbedResolve={resolveEmbed}
        onEmbedSubscribe={subscribe}
      />
      <p className="text-xs text-muted-foreground">Embeds update after ~2 seconds.</p>
    </div>
  );
};

LiveUpdates.storyName = 'Live Updates';

export const MissingEmbed: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={embedContentMissing} enableEmbeds onEmbedResolve={resolveEmbed} />
    <p className="text-xs text-muted-foreground">Missing embeds display the raw syntax.</p>
  </div>
);

MissingEmbed.storyName = 'Missing/Error';
