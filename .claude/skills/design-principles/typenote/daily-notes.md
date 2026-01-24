# TypeNote Daily Notes

Daily notes are first-class citizens with special treatment.

## Layout

```
┌───────────────────────────────────────────────────────────────┐
│  ← Prior Day      │    Wed, Jan 8, 2026    │      Next →     │
├───────────────────────────────────────────┬───────────────────┤
│                                           │                   │
│              Editor Content               │   Mini Calendar   │
│              (white bg)                   │   (white bg)      │
│                                           │                   │
│                                           │ ┌───────────────┐ │
│                                           │ │   January     │ │
│                                           │ │ Su Mo Tu We.. │ │
│                                           │ │  • = has note │ │
│                                           │ └───────────────┘ │
└───────────────────────────────────────────┴───────────────────┘
```

## Date Navigation Header

- **Format:** `Wed, Jan 8, 2026`
- **Navigation:** Arrow buttons for prev/next day
- **Quick jump:** "Today" button (keyboard: `T`)
- **Centered** in header area

## Mini Calendar

- **Background:** White (`#ffffff`) — unified with content
- **Separation:** Subtle left border (`1px gray-200`) + spacing (`16px`)
- **Position:** Inline within content pane (Capacities-style)

### Features

- Shows current month
- Dot indicators for days with notes
- Click to jump to any date
- Compact, doesn't dominate
- Highlights today
- Highlights selected/viewing date

### Sizing

- Width: ~200-240px
- Compact date cells
- Month/year header with prev/next arrows

## Regular Objects (Non-Daily)

For non-daily objects, the right panel shows:

- **Backlinks** — What links to this object
- **Page info** — Created, modified, type
- **Tags** — Associated tags
- **Settings** — Object-specific options

## Keyboard Navigation

| Key     | Action        |
| ------- | ------------- |
| `T`     | Go to today   |
| `←`     | Previous day  |
| `→`     | Next day      |
| `⌘ + ←` | Previous week |
| `⌘ + →` | Next week     |
