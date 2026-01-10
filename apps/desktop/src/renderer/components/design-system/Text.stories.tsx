import type { Story } from '@ladle/react';
import { Text } from '@typenote/design-system';

export default {
  title: 'Design System/Text',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <Text variant="caption" muted className="mb-2">
        Headings
      </Text>
      <div className="flex flex-col gap-2">
        <Text variant="heading1">Heading 1 - Page Titles</Text>
        <Text variant="heading2">Heading 2 - Section Titles</Text>
        <Text variant="heading3">Heading 3 - Subsections</Text>
        <Text variant="heading4">Heading 4 - Card Titles</Text>
      </div>
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        Body Text
      </Text>
      <div className="flex flex-col gap-2">
        <Text variant="body">Body - Default paragraph text at 15px</Text>
        <Text variant="bodySmall">Body Small - Secondary text at 13px</Text>
      </div>
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        Utility
      </Text>
      <div className="flex flex-col gap-2">
        <Text variant="label">Label - Form labels and metadata</Text>
        <Text variant="caption">Caption - Timestamps, hints, fine print</Text>
        <Text variant="code">const code = "inline code style";</Text>
      </div>
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        Muted Variants
      </Text>
      <div className="flex flex-col gap-2">
        <Text variant="body" muted>
          Muted body text for secondary information
        </Text>
        <Text variant="heading3" muted>
          Muted heading for disabled states
        </Text>
      </div>
    </section>
  </div>
);

export const Heading1: Story = () => <Text variant="heading1">Heading 1</Text>;
export const Heading2: Story = () => <Text variant="heading2">Heading 2</Text>;
export const Heading3: Story = () => <Text variant="heading3">Heading 3</Text>;
export const Heading4: Story = () => <Text variant="heading4">Heading 4</Text>;
export const Body: Story = () => <Text variant="body">Body text</Text>;
export const BodySmall: Story = () => <Text variant="bodySmall">Small body text</Text>;
export const Label: Story = () => <Text variant="label">Form Label</Text>;
export const Caption: Story = () => <Text variant="caption">Caption text</Text>;
export const Code: Story = () => <Text variant="code">const x = 42;</Text>;
