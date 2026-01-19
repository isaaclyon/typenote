import * as React from 'react';
import type { Story } from '@ladle/react';

import { InputField } from './InputField.js';

export default {
  title: 'Patterns/InputField',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => {
  const [value, setValue] = React.useState('');

  return (
    <div className="max-w-sm space-y-6 p-6">
      <InputField
        label="Email address"
        placeholder="you@example.com"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        help="We'll never share your email."
      />

      <InputField label="Password" placeholder="Enter your password" type="password" required />

      <InputField label="Username" placeholder="johndoe" error="This username is already taken." />
    </div>
  );
};

// ============================================================================
// States
// ============================================================================

export const States: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <InputField label="Default" placeholder="Enter text..." />

    <InputField
      label="With help text"
      placeholder="Enter text..."
      help="This is optional help text."
    />

    <InputField label="Required field" placeholder="Required..." required />

    <InputField
      label="With error"
      placeholder="Enter text..."
      defaultValue="invalid value"
      error="This field has an error."
    />

    <InputField label="Disabled" placeholder="Can't edit this" disabled />
  </div>
);

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <InputField label="Small" placeholder="Small input" size="sm" />

    <InputField label="Medium (default)" placeholder="Medium input" size="md" />

    <InputField label="Large" placeholder="Large input" size="lg" />
  </div>
);

// ============================================================================
// Input Types
// ============================================================================

export const InputTypes: Story = () => (
  <div className="max-w-sm space-y-6 p-6">
    <InputField label="Text" placeholder="Plain text" type="text" />

    <InputField label="Email" placeholder="you@example.com" type="email" />

    <InputField label="Password" placeholder="Enter password" type="password" />

    <InputField label="Number" placeholder="0" type="number" />

    <InputField label="URL" placeholder="https://example.com" type="url" />

    <InputField label="Search" placeholder="Search..." type="search" />
  </div>
);

// ============================================================================
// Form Example
// ============================================================================

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const FormExample: Story = () => {
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required.';
    if (!formData.lastName) newErrors.lastName = 'Last name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!formData.email.includes('@')) newErrors.email = 'Invalid email format.';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 p-6">
      <h2 className="text-base font-medium">Contact Information</h2>

      <InputField
        label="First name"
        placeholder="John"
        value={formData.firstName}
        onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
        {...(errors.firstName && { error: errors.firstName })}
        required
      />

      <InputField
        label="Last name"
        placeholder="Doe"
        value={formData.lastName}
        onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
        {...(errors.lastName && { error: errors.lastName })}
        required
      />

      <InputField
        label="Email"
        placeholder="john@example.com"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
        {...(errors.email && { error: errors.email })}
        required
      />

      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
      >
        Submit
      </button>
    </form>
  );
};
