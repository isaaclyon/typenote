# @typenote/design-system

TypeNote's design system package - tokens, components, and utilities.

## Installation

```bash
pnpm add @typenote/design-system
```

## Setup

Import the CSS tokens in your app's root CSS file:

```css
@import '@typenote/design-system/tokens.css';
```

## Usage

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Text,
  Badge,
  Input,
} from '@typenote/design-system';

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <Text variant="body">Hello, TypeNote!</Text>
        <Badge variant="success">Active</Badge>
        <Input placeholder="Enter text..." />
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Components

### Button

Variants: `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`
Sizes: `default`, `sm`, `lg`, `icon`

### Input

Text input with error state support.

### Badge

Variants: `default`, `secondary`, `success`, `warning`, `error`, `info`, `outline`

### Card

Compound component: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

### Text

Variants: `body`, `bodySmall`, `heading1-4`, `label`, `caption`, `code`

## Tokens

### Colors

- Warm grayscale (gray-50 through gray-900)
- Cornflower accent (accent-50 through accent-700)
- Semantic: error, success, warning, info

### Typography

- Font families: sans (IBM Plex Sans), mono (IBM Plex Mono)
- 7-level size scale: xs (12px) to 3xl (30px)
- Weights: normal (400), medium (500), semibold (600)

### Spacing

4px base grid: 1 (4px) through 12 (48px)

## Utilities

### cn()

Merge Tailwind classes with proper precedence:

```tsx
import { cn } from '@typenote/design-system';

cn('px-4 py-2', isActive && 'bg-primary', className);
```
