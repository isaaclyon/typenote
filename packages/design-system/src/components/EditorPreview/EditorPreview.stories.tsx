import type { Story } from '@ladle/react';
import { EditorPreview } from './EditorPreview.js';
import { RefNode } from './RefNode.js';
import { TagNode } from './TagNode.js';
import { MathInline } from './MathInline.js';
import { CalloutNode } from './CalloutNode.js';
import { MathBlock } from './MathBlock.js';
import { CodeBlock } from './CodeBlock.js';

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

export const MathInlineVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Einstein's famous equation <MathInline latex="E = mc²" /> relates energy and mass.
    </p>
    <p className="my-2 text-gray-700">
      The quadratic formula is <MathInline latex="x = (-b ± √(b² - 4ac)) / 2a" />.
    </p>
  </EditorPreview>
);

export const CalloutNodeAllKinds: Story = () => (
  <EditorPreview>
    <CalloutNode kind="info">
      <p className="text-sm text-gray-700">This is an informational callout with useful context.</p>
    </CalloutNode>

    <CalloutNode kind="success">
      <p className="text-sm text-gray-700">
        Operation completed successfully! All changes have been saved.
      </p>
    </CalloutNode>

    <CalloutNode kind="warning">
      <p className="text-sm text-gray-700">
        Warning: This action cannot be undone. Proceed with caution.
      </p>
    </CalloutNode>

    <CalloutNode kind="error">
      <p className="text-sm text-gray-700">Error: Failed to save changes. Please try again.</p>
    </CalloutNode>
  </EditorPreview>
);

export const CalloutNodeCustomTitles: Story = () => (
  <EditorPreview>
    <CalloutNode kind="info" title="Pro Tip">
      <p className="text-sm text-gray-700">Use keyboard shortcuts to speed up your workflow.</p>
    </CalloutNode>

    <CalloutNode kind="warning" title="Breaking Change">
      <p className="text-sm text-gray-700">
        This version includes breaking API changes. Review the migration guide.
      </p>
    </CalloutNode>
  </EditorPreview>
);

export const MathBlockVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">The integral formula:</p>

    <MathBlock latex="∫₀^∞ e^(-x²) dx = √π/2" />

    <p className="my-2 text-gray-700">And the Pythagorean theorem:</p>

    <MathBlock latex="a² + b² = c²" />
  </EditorPreview>
);

/**
 * CodeBlockVariations
 *
 * Note: Syntax highlighting will be added when implementing the real TipTap CodeBlock extension.
 * Consider using react-syntax-highlighter or prismjs with a custom TypeNote theme.
 */
export const CodeBlockVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">Python example:</p>

    <CodeBlock
      language="python"
      code={`def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`}
    />

    <p className="my-2 text-gray-700">TypeScript example:</p>

    <CodeBlock
      language="typescript"
      code={`interface User {
  name: string;
  age: number;
}

const user: User = { name: "Alice", age: 30 };`}
    />

    <p className="my-2 text-gray-700">Code block without language label:</p>

    <CodeBlock
      code={`This is a plain code block
without syntax highlighting
or language label.`}
    />
  </EditorPreview>
);
