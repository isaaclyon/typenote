# Markdown Contract Adherence

**Status:** Draft
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
- Wiki links via RefNode (exportable to [[Title]])
- Inline marks: bold, italic, strikethrough, inline code
- Links + autolink
- Highlight mark (==text==)
- Images (display from URLs, Phase 1)

### Not Implemented Yet

- Image upload + attachments (Phase 3)
- Embeds (![[Page]] / ![[file]])
- Inline + block math
- Footnotes
- Block IDs + block references
- Wiki link aliases ([[Page|Alias]])
- Wiki link heading / block targets ([[Page#Heading]])

## Export Notes

- RefNode metadata (objectId/type/color) does not exist in Markdown. Export uses [[Title]] or [[Title|Alias]] when available.
- Tag colors are visual-only and not serialized.
- Table resizing or UI controls are not serialized.

## Next Steps

1. ~~Implement Link + Autolink support in the editor (extension + Ladle stories).~~ ✅
2. ~~Implement Highlight mark (==text==) in the editor.~~ ✅
3. Add Markdown export mapping for refs, tags, and callouts to match Obsidian conventions.
4. ~~Add image display support (Phase 1).~~ ✅
5. Plan follow-on feature blocks: image upload, embeds, math, footnotes, block references.
