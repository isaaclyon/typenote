import type { Story } from '@ladle/react';
import { DailyNoteHeader } from './DailyNoteHeader.js';

export default {
  title: 'Components/DailyNoteHeader',
};

/**
 * Default display with today's date style
 */
export const Default: Story = () => (
  <div className="p-6 max-w-xl">
    <DailyNoteHeader dateKey="2026-01-16" />
  </div>
);

/**
 * Different days of the week
 */
export const DifferentDays: Story = () => (
  <div className="p-6 space-y-8 max-w-xl">
    <div>
      <p className="text-xs text-gray-500 mb-2">Monday</p>
      <DailyNoteHeader dateKey="2026-01-13" />
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-2">Wednesday</p>
      <DailyNoteHeader dateKey="2026-01-15" />
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-2">Saturday</p>
      <DailyNoteHeader dateKey="2026-01-18" />
    </div>
  </div>
);

/**
 * With editor content below (simulating actual usage)
 */
export const WithContent: Story = () => (
  <div className="p-6 max-w-2xl">
    <DailyNoteHeader dateKey="2026-01-16" className="mb-6" />
    <div className="prose prose-sm">
      <h2>Priorities for today</h2>
      <ul>
        <li>Review pull requests</li>
        <li>Write documentation</li>
        <li>Team standup at 10am</li>
      </ul>
      <h2>Notes</h2>
      <p>
        Today was productive. Finished the calendar integration feature and started working on
        visual polish improvements.
      </p>
    </div>
  </div>
);

/**
 * Different months throughout the year
 */
export const DifferentMonths: Story = () => (
  <div className="p-6 space-y-6 max-w-xl">
    <DailyNoteHeader dateKey="2026-03-15" />
    <DailyNoteHeader dateKey="2026-07-04" />
    <DailyNoteHeader dateKey="2026-12-25" />
  </div>
);
