import type { Story } from '@ladle/react';
import { EditorPreview } from './EditorPreview.js';
import { RefNode } from './RefNode.js';
import { TagNode } from './TagNode.js';

export const Empty: Story = () => (
  <EditorPreview>
    <p className="text-gray-400">Start typing...</p>
  </EditorPreview>
);

export const WithContent: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">This is a paragraph with some content.</p>
  </EditorPreview>
);

export const RefNodeAllTypes: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Links to different types: <RefNode type="note" label="My Note" />,{' '}
      <RefNode type="project" label="My Project" />, <RefNode type="task" label="My Task" />,{' '}
      <RefNode type="person" label="John Doe" />, and{' '}
      <RefNode type="resource" label="Documentation" />.
    </p>
  </EditorPreview>
);

export const RefNodeInSentence: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      I'm working on <RefNode type="project" label="TypeNote Redesign" /> with{' '}
      <RefNode type="person" label="Sarah" /> to improve the{' '}
      <RefNode type="note" label="Editor Experience" />.
    </p>
  </EditorPreview>
);

export const TagNodeVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Tags with icons: <TagNode value="project" /> <TagNode value="important" />{' '}
      <TagNode value="draft" />
    </p>
    <p className="my-2 text-gray-700">
      Tags without icons: <TagNode value="work" showIcon={false} />{' '}
      <TagNode value="personal" showIcon={false} />
    </p>
  </EditorPreview>
);

export const TagNodeInSentence: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      This note is tagged with <TagNode value="design-system" /> and{' '}
      <TagNode value="documentation" /> for easy discovery.
    </p>
  </EditorPreview>
);
