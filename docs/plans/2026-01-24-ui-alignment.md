# UI Alignment Plan (Non-Type Work)

Date: 2026-01-24
Owner: Codex

## Goal
Align the app sidebar UI with the design system for all remaining visual/behavioral differences, excluding type list alignment and backend type cleanup.

## Out of Scope (handled elsewhere)
- Aligning the set of supported types between design system and app
- Backend cleanup of unsupported types
- Type metadata changes (pluralization, icons, color sources)

## Work Items

### Sidebar Header
- Update the primary action label to "New note" (design-system default).
- Confirm search trigger styling matches DS (keycap hint, border, spacing).
- Ensure the search shortcut hint renders consistently in expanded mode.

### Sidebar Types Section UI (Non-type-content)
- Add the "Add new type" row using the design-system `PlaceholderAction` pattern with a no-op or "Coming soon" handler.

### Sidebar Item Visuals
- Align hover/active styling, padding, and rounded highlight to DS tokens.
- Verify row spacing and typography match DS tokens.

### Iconography (Non-type-content)
- Standardize sidebar chrome icons (header/search, footer actions) to match DS icon style/weight.

### Sidebar Footer Actions
- Replace "Trash" with "Archive" and update icon to match DS set.
- Add a "Dark mode" / theme toggle item (no-op if theme system not wired).
- Keep "Settings"; final footer should have three actions.
- Ensure footer stays anchored to the bottom (verify layout; adjust if needed).

### Divider Placement
- Ensure divider sits above the footer (as in DS) rather than mid-list.

### Calendar Row (Navigation Parity)
- remove the Calendar sidebar item.

## Implementation Sequence (Design System First)
1. Update/extend design-system stories to reflect the intended sidebar chrome and footer actions.
2. Add any missing DS assets or patterns required by the app changes.
3. Update the app sidebar composition to match DS (labels, footer actions, placeholders, spacing).

## Validation
- Run Ladle and verify the sidebar story variants reflect the target layout.
- Visual check in desktop app (expanded + collapsed sidebar).
- Confirm no runtime errors and no missing icons.
- Confirm all tests still pass that passed before your changes 

## Notes
- All UI component changes must be made in `packages/design-system` first, then integrated in the app.
