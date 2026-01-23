# Footnotes (Design System) — Draft

**Status:** Parked
**Owner:** Design System

## Goal

Add footnote support to the design-system editor (TipTap + Ladle) using the
existing NotateDoc schema: inline `footnote_ref` nodes and block `footnote_def`.

## Scope

- Design-system editor only (no renderer/app integration yet).
- Ladle stories for footnote behaviors and edge cases.

## Decisions (So Far)

- **Inline refs** render as styled inline text `[^key]` (not a pill).
- **Inline refs** are atomic nodes (delete as a unit; not editable in place).
- **Key format:** `[A-Za-z0-9_-]+`, case-sensitive.
- **Definitions** render as dedicated block nodes with fixed `[^key]:` prefix and
  editable inline content after it.
- **Auto-move defs** to the end of the document immediately after create/edit.
- **Ordering:** definitions ordered by first appearance of `[^key]` in the doc.
- **Separator:** insert a horizontal rule immediately before defs.
- **HR lifecycle:** auto-remove the HR if no footnote definitions remain.
- **Missing defs:** warn on refs without a definition (no auto-create).
- **Duplicate defs:** warn and treat the first one as active.
- **Key edits:** changing a def key does NOT auto-update refs.
- **Key editing UX:** click the `[^key]:` prefix to edit via inline input.

## Open Questions

- **Definition content scope:** keep inline-only (schema-aligned) or allow
  multiline content in the editor (with flattening later)?

## Likely Work Items (Once Resumed)

- Add `FootnoteRefNode` extension + NodeView + input rule for `[^key]`.
- Add `FootnoteDefNode` block extension + NodeView + input rule for `[^key]:`.
- Implement footnote aggregation: move defs to end + insert/remove HR.
- Add duplicate/missing key detection for warning styles.
- Add Ladle stories covering: basic refs/defs, missing defs, duplicates, HR.
