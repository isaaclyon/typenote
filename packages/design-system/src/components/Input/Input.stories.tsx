import type { Story } from '@ladle/react';
import { Input } from './Input.js';
import { Text } from '../Text/index.js';

export default {
  title: 'Components/Input',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6 max-w-md">
    <section>
      <Text variant="caption" muted className="mb-2">
        Default Input
      </Text>
      <Input placeholder="Enter text..." />
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        With Label
      </Text>
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-gray-600" htmlFor="email-input">
          Email Address
        </label>
        <Input id="email-input" type="email" placeholder="you@example.com" />
      </div>
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        Input Types
      </Text>
      <div className="flex flex-col gap-3">
        <Input type="text" placeholder="Text input" />
        <Input type="email" placeholder="Email input" />
        <Input type="password" placeholder="Password input" />
        <Input type="number" placeholder="Number input" />
        <Input type="search" placeholder="Search input" />
      </div>
    </section>

    <section>
      <Text variant="caption" muted className="mb-2">
        States
      </Text>
      <div className="flex flex-col gap-3">
        <Input placeholder="Normal state" />
        <Input placeholder="Disabled state" disabled />
        <Input defaultValue="With existing value" />
      </div>
    </section>
  </div>
);

export const Default: Story = () => <Input placeholder="Type something..." />;
export const WithValue: Story = () => <Input defaultValue="Pre-filled value" />;
export const Disabled: Story = () => <Input placeholder="Disabled" disabled />;
export const Password: Story = () => <Input type="password" placeholder="Enter password" />;
export const Search: Story = () => <Input type="search" placeholder="Search..." />;
