# E2E Test Failures - 2026-01-07

## Summary

- **Total tests:** 205
- **Passed:** 164
- **Failed:** 41
- **Duration:** 1.7 minutes (4 workers)

## Passing Test Files (Original)

All original tests pass:

- `specs/ipc-wiring.spec.ts` - 11 tests
- `specs/daily-note.spec.ts` - 4 tests
- `specs/editor.spec.ts` - 3 tests
- `specs/navigation.spec.ts` - 4 tests

## Failing Tests by File

### `specs/templates-workflow.spec.ts` (13 failures)

**Root cause:** Tests assume DailyNote has heading/paragraph template blocks, but actual implementation may differ.

| Test                                                            | Issue                                              |
| --------------------------------------------------------------- | -------------------------------------------------- |
| DailyNote template creates heading and paragraph blocks         | `firstBlock?.type` is `undefined`, not `"heading"` |
| Page document is initially empty but can have blocks added      | `patchResult.success` is `false`                   |
| {{date_key}} placeholder is replaced with actual date           | No `heading` block found                           |
| substitution works for multiple DailyNotes with different dates | No `heading` block found                           |
| adding content to templated document persists correctly         | Expected 3 blocks, got 2                           |
| document version increments when modifying templated document   | Version stayed at 1                                |
| DailyNote template heading has level 1                          | No `heading` block found                           |
| DailyNote template paragraph is empty (ready for input)         | No `paragraph` block found                         |
| template blocks have proper indent level                        | `block.indent` is `undefined`                      |
| template content and user content both visible in editor        | Only sees "2024-11-11", not "User added content"   |
| DailyNote for far future date works correctly                   | No `heading` block found                           |
| DailyNote for past date works correctly                         | No `heading` block found                           |

### `specs/references-linking.spec.ts` (15 failures)

**Root cause:** Tests expect `span[data-ref]` elements and autocomplete popup for `[[` trigger. Reference rendering may not be implemented or uses different selectors.

| Test                                                    | Issue                      |
| ------------------------------------------------------- | -------------------------- |
| typing [[ shows autocomplete popup                      | Popup not visible          |
| selecting from popup inserts reference node             | `span[data-ref]` not found |
| arrow keys navigate autocomplete options                | Popup not visible          |
| selecting from @ popup inserts reference node           | `span[data-ref]` not found |
| clicking reference navigates to target object           | `span[data-ref]` not found |
| reference displays target object title as alias         | `span[data-ref]` not found |
| reference without alias shows truncated objectId        | `span[data-ref]` not found |
| object with incoming references shows backlinks via IPC | Backlinks count is 0       |
| creating new reference updates backlinks immediately    | Backlinks count is 0       |
| backlinks include source object title                   | Backlinks count is 0       |
| editing block removes reference updates backlinks       | Backlinks count is 0       |
| deleting block containing reference removes backlink    | Backlinks count is 0       |
| reference persists after page reload                    | `span[data-ref]` not found |
| link mode reference has blue styling                    | `span[data-ref]` not found |
| embed mode reference has purple styling                 | `span[data-ref]` not found |
| reference has link icon                                 | `span[data-ref]` not found |

### `specs/search-discovery.spec.ts` (6 failures)

**Root cause:** Backlink tests expect references to automatically create backlinks via FTS. May need ref extraction from block content.

| Test                                                | Issue                                |
| --------------------------------------------------- | ------------------------------------ |
| backlink count is correct with multiple references  | Expected 4 backlinks, got 0          |
| backlinks update when reference is removed          | Expected 1 backlink, got 0           |
| backlinks update when reference block is deleted    | Expected 1 backlink, got 0           |
| backlinks from different source objects are tracked | Expected 2 backlinks, got 0          |
| deleted content is no longer searchable             | Search found 0 results before delete |
| search reflects content after page reload           | Search found 0 results               |

### `specs/block-hierarchy.spec.ts` (7 failures)

**Root cause:** Various UI interaction issues - Backspace behavior, list nesting persistence, IPC block operations.

| Test                                                      | Issue                               |
| --------------------------------------------------------- | ----------------------------------- |
| delete block with Backspace on empty paragraph            | Timeout waiting for block deletion  |
| nested list content is preserved                          | Content not preserved after nesting |
| list content persists after reload                        | List content lost after reload      |
| list with task-like text persists after reload            | Task list content lost              |
| delete block via applyBlockPatch removes content          | Block not removed                   |
| blockquote renders correctly via IPC with paragraph child | Blockquote not rendering            |
| horizontal rule renders via IPC                           | HR not rendering                    |

## Recommendations

1. **templates-workflow.spec.ts** - Check actual DailyNote template implementation. Tests assume heading + paragraph blocks with `{{date_key}}` substitution.

2. **references-linking.spec.ts** - Verify RefNode extension renders with `data-ref` attribute. Check if wiki-link suggestion popup is implemented.

3. **search-discovery.spec.ts** - Backlinks require reference extraction from block content. May need to implement ref parsing in FTS indexing.

4. **block-hierarchy.spec.ts** - Test specific editor behaviors that may vary by TipTap configuration.

## Configuration Note

- Workers increased from 1 to 4 for parallel execution
- All tests use isolated temp databases via fixture
- Native modules must be rebuilt for Electron before running (`node scripts/ensure-native-build.mjs electron`)
