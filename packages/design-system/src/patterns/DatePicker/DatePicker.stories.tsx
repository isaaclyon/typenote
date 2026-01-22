import * as React from 'react';
import type { Story } from '@ladle/react';

import { DatePicker } from './DatePicker.js';

export default {
  title: 'Patterns/DatePicker',
};

export const Default: Story = () => {
  const [date, setDate] = React.useState<Date | null>(new Date());

  return (
    <div className="w-64 p-6">
      <DatePicker value={date} onChange={setDate} />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const Empty: Story = () => {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="w-64 p-6">
      <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const Disabled: Story = () => (
  <div className="w-64 p-6">
    <DatePicker value={new Date()} disabled />
  </div>
);

export const TextParsing: Story = () => {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="w-64 space-y-4 p-6">
      <DatePicker value={date} onChange={setDate} />
      <p className="text-sm text-muted-foreground">
        Try typing: &quot;Jan 15, 2026&quot;, &quot;2026-01-15&quot;, or &quot;1/15/2026&quot;
      </p>
      <p className="text-sm">Selected: {date ? date.toLocaleDateString() : 'None'}</p>
    </div>
  );
};
