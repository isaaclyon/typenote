import * as React from 'react';
import type { Story } from '@ladle/react';

import { SelectField } from './SelectField.js';
import { SelectItem } from '../../primitives/Select/Select.js';

export default {
  title: 'Patterns/SelectField',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => {
  const [value, setValue] = React.useState('');

  return (
    <div className="max-w-sm space-y-6 p-6">
      <SelectField
        label="Country"
        placeholder="Select a country"
        value={value}
        onValueChange={setValue}
        help="Choose your country of residence."
      >
        <SelectItem value="us">United States</SelectItem>
        <SelectItem value="uk">United Kingdom</SelectItem>
        <SelectItem value="ca">Canada</SelectItem>
        <SelectItem value="au">Australia</SelectItem>
        <SelectItem value="de">Germany</SelectItem>
        <SelectItem value="fr">France</SelectItem>
      </SelectField>

      <SelectField
        label="Priority"
        placeholder="Select priority"
        error="Please select a priority level."
      >
        <SelectItem value="low">Low</SelectItem>
        <SelectItem value="medium">Medium</SelectItem>
        <SelectItem value="high">High</SelectItem>
        <SelectItem value="urgent">Urgent</SelectItem>
      </SelectField>
    </div>
  );
};

// ============================================================================
// States
// ============================================================================

export const States: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <SelectField label="Default" placeholder="Select an option">
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
      <SelectItem value="c">Option C</SelectItem>
    </SelectField>

    <SelectField
      label="With help text"
      placeholder="Select an option"
      help="This is optional help text."
    >
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
      <SelectItem value="c">Option C</SelectItem>
    </SelectField>

    <SelectField label="Required field" placeholder="Required..." required>
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
      <SelectItem value="c">Option C</SelectItem>
    </SelectField>

    <SelectField label="With error" placeholder="Select an option" error="This field has an error.">
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
      <SelectItem value="c">Option C</SelectItem>
    </SelectField>

    <SelectField label="Disabled" placeholder="Can't change this" disabled>
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
      <SelectItem value="c">Option C</SelectItem>
    </SelectField>
  </div>
);

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <SelectField label="Small" placeholder="Small select" size="sm">
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
    </SelectField>

    <SelectField label="Medium (default)" placeholder="Medium select" size="md">
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
    </SelectField>

    <SelectField label="Large" placeholder="Large select" size="lg">
      <SelectItem value="a">Option A</SelectItem>
      <SelectItem value="b">Option B</SelectItem>
    </SelectField>
  </div>
);

// ============================================================================
// With Default Value
// ============================================================================

export const WithDefaultValue: Story = () => (
  <div className="max-w-sm p-6">
    <SelectField label="Language" defaultValue="en" help="Select your preferred language.">
      <SelectItem value="en">English</SelectItem>
      <SelectItem value="es">Spanish</SelectItem>
      <SelectItem value="fr">French</SelectItem>
      <SelectItem value="de">German</SelectItem>
      <SelectItem value="ja">Japanese</SelectItem>
    </SelectField>
  </div>
);

// ============================================================================
// Form Example
// ============================================================================

export const FormExample: Story = () => {
  const [formData, setFormData] = React.useState({
    role: '',
    department: '',
    location: '',
  });

  return (
    <form className="max-w-sm space-y-4 p-6">
      <h2 className="text-base font-medium">Employee Details</h2>

      <SelectField
        label="Role"
        placeholder="Select a role"
        value={formData.role}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
        required
      >
        <SelectItem value="engineer">Engineer</SelectItem>
        <SelectItem value="designer">Designer</SelectItem>
        <SelectItem value="manager">Manager</SelectItem>
        <SelectItem value="analyst">Analyst</SelectItem>
      </SelectField>

      <SelectField
        label="Department"
        placeholder="Select a department"
        value={formData.department}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, department: value }))}
        required
      >
        <SelectItem value="engineering">Engineering</SelectItem>
        <SelectItem value="design">Design</SelectItem>
        <SelectItem value="product">Product</SelectItem>
        <SelectItem value="marketing">Marketing</SelectItem>
      </SelectField>

      <SelectField
        label="Office location"
        placeholder="Select a location"
        value={formData.location}
        onValueChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
        help="Optional field."
      >
        <SelectItem value="sf">San Francisco</SelectItem>
        <SelectItem value="nyc">New York</SelectItem>
        <SelectItem value="london">London</SelectItem>
        <SelectItem value="remote">Remote</SelectItem>
      </SelectField>

      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        Save
      </button>
    </form>
  );
};
