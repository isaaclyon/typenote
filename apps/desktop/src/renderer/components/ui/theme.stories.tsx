import type { Story } from '@ladle/react';

const ColorSwatch = ({ name, variable }: { name: string; variable: string }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-12 h-12 rounded-md border shadow-sm"
      style={{ backgroundColor: `var(${variable})` }}
    />
    <div>
      <div className="font-medium text-sm">{name}</div>
      <div className="text-xs text-muted-foreground font-mono">{variable}</div>
    </div>
  </div>
);

export const ColorPalette: Story = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Base Colors</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Background" variable="--color-background" />
        <ColorSwatch name="Foreground" variable="--color-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Primary</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Primary" variable="--color-primary" />
        <ColorSwatch name="Primary Foreground" variable="--color-primary-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Secondary</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Secondary" variable="--color-secondary" />
        <ColorSwatch name="Secondary Foreground" variable="--color-secondary-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Muted</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Muted" variable="--color-muted" />
        <ColorSwatch name="Muted Foreground" variable="--color-muted-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Accent</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Accent" variable="--color-accent" />
        <ColorSwatch name="Accent Foreground" variable="--color-accent-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Destructive</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Destructive" variable="--color-destructive" />
        <ColorSwatch name="Destructive Foreground" variable="--color-destructive-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Surface Colors</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Card" variable="--color-card" />
        <ColorSwatch name="Card Foreground" variable="--color-card-foreground" />
        <ColorSwatch name="Popover" variable="--color-popover" />
        <ColorSwatch name="Popover Foreground" variable="--color-popover-foreground" />
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Utility</h2>
      <div className="grid grid-cols-2 gap-4">
        <ColorSwatch name="Border" variable="--color-border" />
        <ColorSwatch name="Input" variable="--color-input" />
        <ColorSwatch name="Ring" variable="--color-ring" />
      </div>
    </section>
  </div>
);

export const Typography: Story = () => (
  <div className="space-y-6 max-w-[600px]">
    <section>
      <h2 className="text-lg font-semibold mb-4">Headings</h2>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Heading 1 (4xl)</h1>
        <h2 className="text-3xl font-bold">Heading 2 (3xl)</h2>
        <h3 className="text-2xl font-semibold">Heading 3 (2xl)</h3>
        <h4 className="text-xl font-semibold">Heading 4 (xl)</h4>
        <h5 className="text-lg font-medium">Heading 5 (lg)</h5>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Body Text</h2>
      <div className="space-y-2">
        <p className="text-base">Base text - The quick brown fox jumps over the lazy dog.</p>
        <p className="text-sm">Small text - The quick brown fox jumps over the lazy dog.</p>
        <p className="text-xs">Extra small - The quick brown fox jumps over the lazy dog.</p>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Text Colors</h2>
      <div className="space-y-1">
        <p className="text-foreground">Foreground (default)</p>
        <p className="text-muted-foreground">Muted foreground</p>
        <p className="text-primary">Primary</p>
        <p className="text-destructive">Destructive</p>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Font Weights</h2>
      <div className="space-y-1">
        <p className="font-light">Light (300)</p>
        <p className="font-normal">Normal (400)</p>
        <p className="font-medium">Medium (500)</p>
        <p className="font-semibold">Semibold (600)</p>
        <p className="font-bold">Bold (700)</p>
      </div>
    </section>
  </div>
);

export const Spacing: Story = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Border Radius</h2>
      <div className="flex gap-6">
        <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center text-primary-foreground text-xs">
          sm
        </div>
        <div className="w-16 h-16 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs">
          md
        </div>
        <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">
          lg
        </div>
        <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs">
          xl
        </div>
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs">
          full
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Shadows</h2>
      <div className="flex gap-6">
        <div className="w-20 h-20 bg-background border rounded-lg shadow-sm flex items-center justify-center text-xs">
          sm
        </div>
        <div className="w-20 h-20 bg-background border rounded-lg shadow flex items-center justify-center text-xs">
          default
        </div>
        <div className="w-20 h-20 bg-background border rounded-lg shadow-md flex items-center justify-center text-xs">
          md
        </div>
        <div className="w-20 h-20 bg-background border rounded-lg shadow-lg flex items-center justify-center text-xs">
          lg
        </div>
      </div>
    </section>
  </div>
);
