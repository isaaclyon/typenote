import * as React from 'react';
import type { Story } from '@ladle/react';

import { Calendar } from './Calendar.js';

export default {
  title: 'Patterns/Calendar',
};

export const Default: Story = () => {
  const [date, setDate] = React.useState<Date | null>(new Date());

  return (
    <div className="p-6">
      <Calendar value={date} onChange={(d) => setDate(d ?? null)} />
      <p className="mt-4 text-sm text-muted-foreground">
        Selected: {date ? date.toLocaleDateString() : 'None'}
      </p>
    </div>
  );
};

export const Disabled: Story = () => (
  <div className="p-6">
    <Calendar value={new Date()} disabled />
  </div>
);

export const Uncontrolled: Story = () => (
  <div className="p-6">
    <Calendar />
    <p className="mt-4 text-sm text-muted-foreground">No controlled state.</p>
  </div>
);
