# TypeNote Typography

## Font Family

IBM Plex throughout for cohesion.

```css
--font-sans: 'IBM Plex Sans', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', ui-monospace, monospace;
```

## Type Scale

Based on 15px base, balanced density.

```css
--text-xs: 12px; /* Fine print, timestamps */
--text-sm: 13px; /* Labels, metadata */
--text-base: 15px; /* Body text, editor content */
--text-lg: 17px; /* Subheadings */
--text-xl: 20px; /* Section titles */
--text-2xl: 24px; /* Page titles */
--text-3xl: 30px; /* Hero headings (rare) */
```

## Font Weights

```css
--font-normal: 400; /* Body text */
--font-medium: 500; /* Labels, emphasis */
--font-semibold: 600; /* Headings, buttons */
```

## Line Heights

```css
--leading-tight: 1.25; /* Headings */
--leading-normal: 1.5; /* Body text */
```

## Letter Spacing

```css
--tracking-tight: -0.02em; /* Headlines */
--tracking-normal: 0; /* Body */
--tracking-wide: 0.025em; /* Uppercase labels */
```

## Usage Guide

| Element        | Size    | Weight     | Color    | Tracking |
| -------------- | ------- | ---------- | -------- | -------- |
| Headlines      | 20-30px | 600        | gray-800 | tight    |
| Page titles    | 24px    | 600        | gray-800 | tight    |
| Section titles | 20px    | 600        | gray-800 | tight    |
| Body           | 15px    | 400        | gray-600 | normal   |
| Labels         | 13px    | 500        | gray-500 | normal   |
| Metadata       | 12px    | 400        | gray-400 | normal   |
| Code/Data      | 14px    | 400 (mono) | gray-700 | normal   |
| Buttons        | 14px    | 500        | varies   | normal   |
