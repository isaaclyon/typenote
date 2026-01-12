import * as React from 'react';
import type { Story } from '@ladle/react';
import { DailyNoteNav } from './DailyNoteNav.js';

export default {
  title: 'Components/DailyNoteNav',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Default State</h2>
      <p className="text-sm text-gray-500 mb-4">Minimal navigation: ← Today → for daily notes</p>
      <DailyNoteNav
        onPrevious={() => console.log('Previous day')}
        onNext={() => console.log('Next day')}
        onToday={() => console.log('Go to today')}
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Viewing Today</h2>
      <p className="text-sm text-gray-500 mb-4">
        When viewing today's note, "Today" is highlighted
      </p>
      <DailyNoteNav
        isToday
        onPrevious={() => console.log('Previous day')}
        onNext={() => console.log('Next day')}
        onToday={() => console.log('Go to today')}
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Viewing Past Date</h2>
      <p className="text-sm text-gray-500 mb-4">
        When viewing a different date, "Today" is a subtle link
      </p>
      <DailyNoteNav
        isToday={false}
        onPrevious={() => console.log('Previous day')}
        onNext={() => console.log('Next day')}
        onToday={() => console.log('Go to today')}
      />
    </section>
  </div>
);

export const Default: Story = () => (
  <DailyNoteNav
    onPrevious={() => console.log('Previous')}
    onNext={() => console.log('Next')}
    onToday={() => console.log('Today')}
  />
);

export const ViewingToday: Story = () => (
  <DailyNoteNav
    isToday
    onPrevious={() => console.log('Previous')}
    onNext={() => console.log('Next')}
    onToday={() => console.log('Today')}
  />
);

export const Interactive: Story = () => {
  const [date, setDate] = React.useState(new Date());

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const goToPrevious = () => {
    setDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 1);
      return next;
    });
  };

  const goToNext = () => {
    setDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      return next;
    });
  };

  const goToToday = () => {
    setDate(new Date());
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <DailyNoteNav
        isToday={isToday(date)}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />
      <div className="text-center">
        <p className="text-xl font-medium text-gray-900">{formatDate(date)}</p>
        <p className="text-sm text-gray-500 mt-1">
          {isToday(date) ? "You're viewing today" : 'Navigate back to today →'}
        </p>
      </div>
    </div>
  );
};
Interactive.meta = {
  description: 'Interactive demo showing date navigation',
};

export const InContext: Story = () => {
  const [date, setDate] = React.useState(new Date());

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-4">
        This shows how the nav appears above note content
      </p>

      {/* Navigation bar */}
      <div className="py-2 border-b border-gray-100">
        <DailyNoteNav
          isToday={isToday(date)}
          onPrevious={() =>
            setDate((prev) => {
              const next = new Date(prev);
              next.setDate(next.getDate() - 1);
              return next;
            })
          }
          onNext={() =>
            setDate((prev) => {
              const next = new Date(prev);
              next.setDate(next.getDate() + 1);
              return next;
            })
          }
          onToday={() => setDate(new Date())}
        />
      </div>

      {/* Simulated note content */}
      <div className="py-8 px-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{formatDate(date)}</h1>
        <div className="space-y-4 text-gray-700">
          <p>Morning standup notes...</p>
          <p>Tasks for the day:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Review pull requests</li>
            <li>Finish design system components</li>
            <li>Write documentation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
InContext.meta = {
  description: 'Shows nav in context with simulated note content',
};
