import * as React from 'react';
import type { Story } from '@ladle/react';
import { MiniCalendar } from './MiniCalendar.js';
import { formatDateKey, getTodayKey } from './utils.js';

export default {
  title: 'Components/MiniCalendar',
};

// Helper to generate sample dates with notes
function generateSampleDatesWithNotes(): Set<string> {
  const dates = new Set<string>();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // Add some scattered dates with notes
  [3, 7, 8, 12, 15, 18, 22, 25, 28].forEach((day) => {
    if (day <= new Date(year, month + 1, 0).getDate()) {
      dates.add(formatDateKey(new Date(year, month, day)));
    }
  });

  // Also add today
  dates.add(getTodayKey());

  return dates;
}

export const AllVariants: Story = () => {
  const today = getTodayKey();
  const sampleDates = generateSampleDatesWithNotes();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Default Calendar</h2>
        <p className="text-sm text-gray-500 mb-4">
          Basic calendar with today selected. Dots indicate days with notes.
        </p>
        <MiniCalendar
          selectedDate={today}
          datesWithNotes={sampleDates}
          onDateSelect={(date) => console.log('Selected:', date)}
          onMonthChange={(year, month) => console.log('Month changed:', year, month)}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Monday Start</h2>
        <p className="text-sm text-gray-500 mb-4">Week starts on Monday (ISO/European style)</p>
        <MiniCalendar
          selectedDate={today}
          datesWithNotes={sampleDates}
          weekStartsOn={1}
          onDateSelect={(date) => console.log('Selected:', date)}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Without Note Indicators</h2>
        <p className="text-sm text-gray-500 mb-4">
          Calendar without datesWithNotes prop shows no dots
        </p>
        <MiniCalendar
          selectedDate={today}
          onDateSelect={(date) => console.log('Selected:', date)}
        />
      </section>
    </div>
  );
};

export const Default: Story = () => (
  <MiniCalendar
    selectedDate={getTodayKey()}
    onDateSelect={(date) => console.log('Selected:', date)}
  />
);

export const WithNotes: Story = () => (
  <MiniCalendar
    selectedDate={getTodayKey()}
    datesWithNotes={generateSampleDatesWithNotes()}
    onDateSelect={(date) => console.log('Selected:', date)}
  />
);

export const MondayStart: Story = () => (
  <MiniCalendar
    selectedDate={getTodayKey()}
    datesWithNotes={generateSampleDatesWithNotes()}
    weekStartsOn={1}
    onDateSelect={(date) => console.log('Selected:', date)}
  />
);

export const Interactive: Story = () => {
  const [selectedDate, setSelectedDate] = React.useState(getTodayKey());
  const [datesWithNotes, setDatesWithNotes] = React.useState(generateSampleDatesWithNotes);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Simulate creating a note: add to the set if not already present
    if (!datesWithNotes.has(date)) {
      const newDates = new Set(datesWithNotes);
      newDates.add(date);
      setDatesWithNotes(newDates);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <MiniCalendar
        selectedDate={selectedDate}
        datesWithNotes={datesWithNotes}
        onDateSelect={handleDateSelect}
        onMonthChange={(year, month) => console.log('Viewing:', year, month + 1)}
      />
      <div className="text-center">
        <p className="text-sm text-gray-700">
          Selected: <strong>{selectedDate}</strong>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Click any date to select it. New dates get a dot.
        </p>
      </div>
    </div>
  );
};
Interactive.meta = {
  description: 'Click dates to select and create notes',
};

export const PastMonth: Story = () => {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const dateKey = formatDateKey(lastMonth);

  // Generate some notes for last month
  const dates = new Set<string>();
  [5, 10, 15, 20].forEach((day) => {
    dates.add(formatDateKey(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), day)));
  });

  return (
    <MiniCalendar
      selectedDate={dateKey}
      datesWithNotes={dates}
      onDateSelect={(date) => console.log('Selected:', date)}
    />
  );
};
PastMonth.meta = {
  description: 'Viewing a date from last month',
};

export const InContext: Story = () => {
  const [selectedDate, setSelectedDate] = React.useState(getTodayKey());
  const datesWithNotes = generateSampleDatesWithNotes();

  const formatDisplayDate = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year!, month! - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex gap-8 max-w-3xl">
      {/* Simulated content area */}
      <div className="flex-1 border-r border-gray-100 pr-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          {formatDisplayDate(selectedDate)}
        </h1>
        <div className="space-y-4 text-gray-700">
          <p>This is the daily note content area.</p>
          <p>The calendar on the right shows which days have notes (dots).</p>
          <p>Click any date to navigate to it.</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Dots = days with notes</li>
            <li>Blue highlight = today</li>
            <li>Filled circle = selected date</li>
          </ul>
        </div>
      </div>

      {/* Mini calendar sidebar */}
      <div className="pt-2">
        <MiniCalendar
          selectedDate={selectedDate}
          datesWithNotes={datesWithNotes}
          onDateSelect={setSelectedDate}
        />
      </div>
    </div>
  );
};
InContext.meta = {
  description: 'Calendar shown alongside content, like in the daily note view',
};

export const AllStates: Story = () => {
  // Fixed date for consistent rendering (January 2026)
  const baseDate = '2026-01-15';

  // Generate specific dates to show all states
  const datesWithNotes = new Set([
    '2026-01-05',
    '2026-01-10',
    '2026-01-11', // today simulation
    '2026-01-15', // selected
    '2026-01-20',
    '2026-01-25',
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-2">Visual States Legend</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center text-gray-700">15</span>
            <span className="text-gray-500">Default (current month)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center text-gray-300">31</span>
            <span className="text-gray-500">Other month</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center text-accent-600 font-medium">
              11
            </span>
            <span className="text-gray-500">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-accent-500 text-white rounded font-medium">
              15
            </span>
            <span className="text-gray-500">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative w-8 h-8 flex items-center justify-center text-gray-700">
              10
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-400" />
            </span>
            <span className="text-gray-500">Has note (dot)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center text-gray-700 bg-gray-100 rounded">
              16
            </span>
            <span className="text-gray-500">Hover state</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Live Calendar</h2>
        <MiniCalendar
          selectedDate={baseDate}
          datesWithNotes={datesWithNotes}
          onDateSelect={(date) => console.log('Selected:', date)}
        />
      </section>
    </div>
  );
};
AllStates.meta = {
  description: 'Visual reference for all calendar day states',
};
