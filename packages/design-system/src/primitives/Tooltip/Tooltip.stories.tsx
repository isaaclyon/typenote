import type { Story } from '@ladle/react';
import { Star } from '@phosphor-icons/react/ssr';
import { Button } from '../Button/Button.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Tooltip } from './Tooltip.js';

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Hover</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip content="Search your notes">
          <Button size="sm" variant="secondary">
            Hover me
          </Button>
        </Tooltip>
        <Tooltip content="Star this note">
          <IconButton aria-label="Star" variant="outline">
            <Star className="h-4 w-4" weight="fill" />
          </IconButton>
        </Tooltip>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Placement</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip content="Top" side="top">
          <Button size="sm" variant="secondary">
            Top
          </Button>
        </Tooltip>
        <Tooltip content="Right" side="right">
          <Button size="sm" variant="secondary">
            Right
          </Button>
        </Tooltip>
        <Tooltip content="Bottom" side="bottom">
          <Button size="sm" variant="secondary">
            Bottom
          </Button>
        </Tooltip>
        <Tooltip content="Left" side="left">
          <Button size="sm" variant="secondary">
            Left
          </Button>
        </Tooltip>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Alignment</h2>
      <div className="flex flex-wrap items-center gap-4">
        <Tooltip content="Start aligned" align="start">
          <Button size="sm" variant="secondary">
            Start
          </Button>
        </Tooltip>
        <Tooltip content="Centered" align="center">
          <Button size="sm" variant="secondary">
            Center
          </Button>
        </Tooltip>
        <Tooltip content="End aligned" align="end">
          <Button size="sm" variant="secondary">
            End
          </Button>
        </Tooltip>
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Disabled</h2>
      <Tooltip content="Disabled tooltip" disabled>
        <Button size="sm" variant="secondary">
          Disabled
        </Button>
      </Tooltip>
    </section>
  </div>
);
