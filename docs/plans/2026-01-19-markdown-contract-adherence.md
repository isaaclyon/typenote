# Markdown Contract Adherence

**Status:** Active
**Owner:** Design System

## Goal

Define the supported Markdown contract (CommonMark + GFM + Obsidian extras) for the TypeNote editor and ensure Ladle stories and editor extensions align with the contract. The goal is round-trip friendly Markdown: when a document is exported, features should serialize to a standard, recognizable Markdown representation (similar to Obsidian), and import should restore compatible structures.

## Contract Scope

### Block-level

- Paragraphs
- Headings (# through ######)
- Blockquote (> ...)
- Ordered list (1. 2. 3.)
- Unordered list (-, \*, +)
- Task list (- [ ] / - [x])
- Horizontal rule (---)
- Fenced code blocks (```lang)
- GFM tables
- Callouts (> [!info] ... etc.)
- Images (![](...))
- Embeds (![[Page]] / ![[file]])

### Inline

- Bold (**text**)
- Italic (_text_)
- Strikethrough (~~text~~)
- Inline code (`code`)
- Links ([text](url) + autolink <https://...>)
- Wiki links ([[Page]] and [[Page|Alias]])
- Tags (#tag)
- Highlight (==text==)
- Inline math ($...$)

### References & Footnotes

- Block IDs (^block-id)
- Block references ([[Page#^block-id]])
- Footnotes ([^1] + definition blocks)

## Current Implementation Status

### Implemented (Editor + Ladle)

- Paragraphs, headings, blockquote
- Ordered/unordered lists
- Task lists
- Horizontal rule
- Fenced code blocks with language
- GFM tables (basic)
- Callouts
- Tags (#tag)
- Wiki links via RefNode (exportable to [[Title]] or [[Title|Alias]])
- Inline marks: bold, italic, strikethrough, inline code
- Links + autolink
- Highlight mark (==text==)
- Images (display from URLs + resize, Phase 1-2 complete)
- Inline math ($...$) + block math ($$) with KaTeX rendering

### Not Implemented Yet

- Image upload + attachments (Phase 3)
- Embeds (![[Page]] / ![[file]])
- Footnotes

### Recently Completed

- Block IDs (^block-id syntax) ✅ (2026-01-20)
- Heading targets ([[Page#Heading]]) ✅ (2026-01-20)
- Block references ([[Page#^block-id]]) ✅ (2026-01-20)
- Inline math ($...$) + block math ($$) with KaTeX rendering ✅ (2026-01-19)

## Export Notes

- RefNode metadata (objectId/type/color) does not exist in Markdown. Export uses [[Title]] or [[Title|Alias]] when available.
- Tag colors are visual-only and not serialized.
- Table resizing or UI controls are not serialized.

## Next Steps (Design System Scope)

1. ~~Implement Link + Autolink support in the editor (extension + Ladle stories).~~ ✅
2. ~~Implement Highlight mark (==text==) in the editor.~~ ✅
3. ~~Add image display support (Phase 1-2).~~ ✅
4. ~~Implement wiki link aliases ([[Page|Alias]]).~~ ✅
5. ~~Implement inline + block math with KaTeX.~~ ✅
6. ~~Implement block IDs (^block-id syntax).~~ ✅
7. ~~Implement heading targets ([[Page#Heading]]).~~ ✅
8. ~~Implement block references ([[Page#^block-id]]).~~ ✅
9. Implement remaining contract gaps (priority order):
   - **Footnotes** — [^1] syntax with definition blocks at document end
   - **Embeds** — ![[Page]] / ![[file]] for inline object rendering
   - **Image upload** — Phase 3, requires main process file handling

## Out of Scope (Other Packages)

- **NotateDoc converters** (TipTap JSON ↔ NotateDoc) — lives in `packages/core`
- **Markdown export/import** — depends on NotateDoc converters, lives in `packages/core`
