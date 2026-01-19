import type { Story } from '@ladle/react';
import { Button } from '../Button/Button.js';
import { Card } from './Card.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Default</h2>
      <Card className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">Weekly Summary</h3>
          <p className="text-sm text-gray-600">
            Quick recap of notes, tasks, and highlights from this week.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm">Open</Button>
          <Button size="sm" variant="secondary">
            Share
          </Button>
        </div>
      </Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Dense</h2>
      <Card className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Pinned</span>
          <span className="text-xs text-gray-500">3 items</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Project brief</span>
            <span className="text-xs text-gray-400">Updated 2d</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Team retros</span>
            <span className="text-xs text-gray-400">Updated 4d</span>
          </div>
        </div>
      </Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Muted Surface</h2>
      <Card className="space-y-3 border-gray-100 bg-gray-50">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-700">Drafts</h3>
          <p className="text-sm text-gray-600">
            Softer surface for secondary content or grouped summaries.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>3 updates</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span>Last edited 1h ago</span>
        </div>
      </Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Clickable</h2>
      <Card className="space-y-3 transition-colors duration-150 ease-out hover:border-gray-300 hover:bg-gray-50">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">Project Brief</h3>
          <p className="text-sm text-gray-600">Tap to open the latest brief and track progress.</p>
        </div>
        <div className="text-xs text-gray-500">Updated 2 days ago</div>
      </Card>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Nested</h2>
      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-800">Research Pack</h3>
          <p className="text-sm text-gray-600">3 sections inside the card</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {['Sources', 'Highlights', 'Next steps'].map((label) => (
            <Card key={label} className="space-y-2 border-gray-100 bg-gray-50 p-3">
              <span className="text-xs font-semibold text-gray-600">{label}</span>
              <p className="text-xs text-gray-500">
                Keep notes and snippets grouped for quick scanning.
              </p>
            </Card>
          ))}
        </div>
      </Card>
    </section>
  </div>
);
