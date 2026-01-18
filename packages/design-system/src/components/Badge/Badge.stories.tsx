import type { Story } from '@ladle/react';
import { Badge } from './Badge.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Intents</h2>
      <div className="flex flex-wrap gap-3">
        <Badge intent="neutral">Neutral</Badge>
        <Badge intent="info">Info</Badge>
        <Badge intent="success">Success</Badge>
        <Badge intent="warning">Warning</Badge>
        <Badge intent="danger">Danger</Badge>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Outline</h2>
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" intent="neutral">
          Neutral
        </Badge>
        <Badge variant="outline" intent="info">
          Info
        </Badge>
        <Badge variant="outline" intent="success">
          Success
        </Badge>
        <Badge variant="outline" intent="warning">
          Warning
        </Badge>
        <Badge variant="outline" intent="danger">
          Danger
        </Badge>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
      <div className="flex flex-wrap items-center gap-3">
        <Badge size="sm" intent="neutral">
          Draft
        </Badge>
        <Badge size="md" intent="neutral">
          Published
        </Badge>
        <Badge size="sm" intent="info" variant="outline">
          Beta
        </Badge>
        <Badge size="md" intent="success">
          Synced
        </Badge>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Inline Usage</h2>
      <p className="text-sm text-gray-600">
        Status <Badge intent="success">Active</Badge> in the system.
      </p>
    </section>
  </div>
);
