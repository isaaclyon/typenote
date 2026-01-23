# Markdown Export (REST, Single Object)

**Goal**

- Add Obsidian-style Markdown export for a single object with round-trip friendly output.
- Include YAML frontmatter (id/type/title/timestamps + key properties), H1 title, wiki links, and block ids (`^id`).
- Copy attachments to a sibling `attachments/` folder and emit best-effort fallbacks with warnings.

**Architecture**

- `@typenote/api`: define request/response schemas for Markdown export + warning/asset types.
- `@typenote/core`: add a pure `notateDocToMarkdown()` converter that returns markdown + asset manifest + warnings.
- `@typenote/http-server`: add a REST endpoint to export to disk, using storage + FileService.

**Tech Stack**

- TypeScript (strict)
- Hono routes in `@typenote/http-server`
- Node `fs/promises` + `path` for writing exports
- Optional `yaml` dependency for frontmatter serialization

**Markdown Mapping (v1)**

- Paragraph → plain text lines
- Heading → `#` through `######`
- List → `-` / `1.` / `- [ ]` (task)
- Blockquote → `> ...`
- Callout → Obsidian style `> [!KIND]` (collapsed adds `-`)
- Code block → fenced ```lang
- Table → GFM tables
- Math inline/block → `$...$` / `$$...$$`
- Footnote → `[^key]` / `[^key]: ...`
- Attachment → `![alt](attachments/<filename>)`
- Ref link → `[[Title|Alias]]` or `[[Title#^blockId|Alias]]`
- Ref embed → `![[Title]]` or `![[Title#^blockId]]`

---

## Task 1: API contracts

**Files:**

- Create `packages/api/src/markdownExport.ts`
- Modify `packages/api/src/index.ts`

**Steps**

1. Add Zod schemas for export input/result:
   - Input: `{ apiVersion: 'v1', outputDir: string }`
   - Result: `{ path: string, warnings?: MarkdownWarning[] }`
2. Add `MarkdownWarning` and `MarkdownAsset` schemas used by core and server.
3. Export schemas/types from `packages/api/src/index.ts`.

---

## Task 2: Core converter + tests

**Files:**

- Create `packages/core/src/markdown/types.ts`
- Create `packages/core/src/markdown/notateDocToMarkdown.ts`
- Modify `packages/core/src/index.ts`
- Create `packages/core/src/markdown/notateDocToMarkdown.test.ts`

**Steps**

1. Define converter input:
   - Object metadata (id/type/title/createdAt/updatedAt + properties)
   - NotateDoc blocks
   - Ref lookup map `{ objectId: { title } }`
   - Attachment map `{ attachmentId: { filename, mimeType } }`
2. Implement inline + block serializers that emit Markdown with block-id suffixes.
3. Emit a frontmatter string + H1 title at top of document.
4. Build an `assets` manifest for attachment blocks, with `attachments/<filename>` paths.
5. Capture warnings for lossy conversions (unknown block types, missing refs, duplicate filenames).
6. Add unit tests for common block/inline cases, frontmatter, block ids, refs, and attachments.

---

## Task 3: REST export endpoint

**Files:**

- Modify `packages/http-server/src/server.ts`
- Modify `packages/http-server/src/types.ts`
- Create `packages/http-server/src/routes/exports.ts`
- Modify `packages/http-server/src/router.ts`

**Steps**

1. Extend `ServerConfig` + `ServerContext` to include `fileService`.
2. Add `POST /objects/:id/export/markdown`:
   - Validate body with `MarkdownExportInputSchema`.
   - Load object + document (`getObject`, `getDocument`).
   - Resolve ref titles for all referenced objectIds.
   - Resolve attachment metadata + file bytes via `getAttachment` + `fileService.readFile()`.
   - Call core converter and write `<slug>.md` to `outputDir`.
   - Copy attachments into `outputDir/attachments/` with deduped filenames.
   - Return `{ success: true, data: { path, warnings } }`.
3. Map missing object/attachments to canonical API errors (`NOT_FOUND_OBJECT`, `NOT_FOUND_ATTACHMENT`).

---

## Verification

- `pnpm --filter @typenote/core test -- notateDocToMarkdown`
- `pnpm --filter @typenote/http-server test -- export` (if/when tests exist)
