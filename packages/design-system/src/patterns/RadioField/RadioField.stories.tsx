import * as React from 'react';
import type { Story } from '@ladle/react';

import { RadioField } from './RadioField.js';
import { RadioItem } from '../../primitives/Radio/Radio.js';
import { Label } from '../../primitives/Label/Label.js';

export default {
  title: 'Patterns/RadioField',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => {
  const [value, setValue] = React.useState('option1');

  return (
    <div className="max-w-sm space-y-6 p-6">
      <RadioField
        label="Notification preference"
        value={value}
        onValueChange={setValue}
        help="Choose how you want to receive notifications."
      >
        <div className="flex items-center gap-2">
          <RadioItem value="option1" />
          <Label>Email notifications</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option2" />
          <Label>Push notifications</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="option3" />
          <Label>No notifications</Label>
        </div>
      </RadioField>
    </div>
  );
};

// ============================================================================
// States
// ============================================================================

export const States: Story = () => (
  <div className="max-w-sm space-y-8 p-6">
    <RadioField label="Default">
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Option B</Label>
      </div>
    </RadioField>

    <RadioField label="With help text" help="Select one of the options below.">
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Option B</Label>
      </div>
    </RadioField>

    <RadioField label="Required field" required>
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Option B</Label>
      </div>
    </RadioField>

    <RadioField label="Disabled" disabled>
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Option B</Label>
      </div>
    </RadioField>
  </div>
);

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = () => (
  <div className="max-w-sm space-y-8 p-6">
    <RadioField label="Small" size="sm" defaultValue="a">
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Small option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Small option B</Label>
      </div>
    </RadioField>

    <RadioField label="Medium (default)" size="md" defaultValue="a">
      <div className="flex items-center gap-2">
        <RadioItem value="a" />
        <Label>Medium option A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="b" />
        <Label>Medium option B</Label>
      </div>
    </RadioField>
  </div>
);

// ============================================================================
// Horizontal Layout
// ============================================================================

export const HorizontalLayout: Story = () => (
  <div className="max-w-md p-6">
    <RadioField
      label="Plan type"
      defaultValue="monthly"
      help="Select a billing cycle."
      className="flex-row gap-6"
    >
      <div className="flex items-center gap-2">
        <RadioItem value="monthly" />
        <Label>Monthly</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioItem value="yearly" />
        <Label>Yearly</Label>
      </div>
    </RadioField>
  </div>
);

// ============================================================================
// Form Example
// ============================================================================

export const FormExample: Story = () => {
  const [plan, setPlan] = React.useState('free');

  return (
    <form className="max-w-sm space-y-6 p-6">
      <h2 className="text-base font-medium">Choose your plan</h2>

      <RadioField
        label="Subscription plan"
        value={plan}
        onValueChange={setPlan}
        help="You can change your plan at any time."
        required
      >
        <div className="flex items-center gap-2">
          <RadioItem value="free" />
          <Label>Free - $0/month</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="pro" />
          <Label>Pro - $10/month</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioItem value="enterprise" />
          <Label>Enterprise - Custom pricing</Label>
        </div>
      </RadioField>

      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        Continue
      </button>
    </form>
  );
};
