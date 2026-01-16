#!/bin/bash
set -euo pipefail

# Block Patch Operations Spec Validation Hook
# Enforces that applyBlockPatch implementations follow the backend contract
# Reference: docs/foundational/backend_contract.md sections 2-7

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="block-patch-spec-validation"
start_time=$(date +%s)

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "" 0 2>/dev/null || true
  exit 0
fi

# Only validate TypeScript files in packages/storage/src (patch implementation)
# and packages/api/src (patch type contracts)
if [[ ! $file_path =~ ^packages/(storage|api)/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

violations=""
violation_count=0

# Read file content
file_content=$(cat "$file_path")

# Define canonical error codes from spec
declare -a CANONICAL_ERROR_CODES=(
  "NOT_FOUND_OBJECT"
  "NOT_FOUND_BLOCK"
  "VALIDATION"
  "CONFLICT_VERSION"
  "CONFLICT_ORDERING"
  "INVARIANT_CYCLE"
  "INVARIANT_CROSS_OBJECT"
  "INVARIANT_PARENT_DELETED"
  "IDEMPOTENCY_CONFLICT"
  "INTERNAL"
)

# Define canonical operation types
declare -a CANONICAL_OPS=(
  "block.insert"
  "block.update"
  "block.move"
  "block.delete"
)

# ============================================================================
# Section A: Check for applyBlockPatch implementation patterns
# ============================================================================

# Check if this file implements applyBlockPatch
has_patch_impl=$(echo "$file_content" | grep -c "applyBlockPatch\|BlockPatch" || true)

if [[ $has_patch_impl -gt 0 ]]; then

  # Check 1: Function should accept ApplyBlockPatchInput
  if echo "$file_content" | grep -q "function.*applyBlockPatch"; then
    if ! echo "$file_content" | grep -qE "ApplyBlockPatchInput|input.*:.*\{.*objectId.*ops" 2>/dev/null; then
      violation="⚠️  applyBlockPatch may not accept proper input type"
      violation="${violation}\n   Expected: function applyBlockPatch(input: ApplyBlockPatchInput): ApplyBlockPatchResult"
      violation="${violation}\n   Input must have: objectId, ops[], optional baseDocVersion, optional idempotencyKey"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi

  # Check 2: Function should return ApplyBlockPatchResult
  if echo "$file_content" | grep -q "function.*applyBlockPatch"; then
    if ! echo "$file_content" | grep -qE "ApplyBlockPatchResult|return.*\{.*objectId.*newDocVersion.*applied" 2>/dev/null; then
      violation="⚠️  applyBlockPatch may not return proper output type"
      violation="${violation}\n   Expected: function returns ApplyBlockPatchResult with: objectId, previousDocVersion, newDocVersion, applied"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi

  # Check 3: Should validate baseDocVersion if provided (optimistic concurrency)
  if echo "$file_content" | grep -q "baseDocVersion"; then
    if ! echo "$file_content" | grep -qE "baseDocVersion.*!==|baseDocVersion.*!=|docVersion.*baseDocVersion|CONFLICT_VERSION" 2>/dev/null; then
      violation="⚠️  baseDocVersion check missing or incomplete"
      violation="${violation}\n   Should validate: if (baseDocVersion && baseDocVersion !== currentDocVersion) -> CONFLICT_VERSION error"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#concurrency-model"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi

  # Check 4: Should check idempotency key before applying ops
  if echo "$file_content" | grep -q "idempotencyKey"; then
    if ! echo "$file_content" | grep -qE "idempotency.*key|idempotencyKey.*exist|idempotency.*table|stored.*result" 2>/dev/null; then
      violation="⚠️  Idempotency handling may be incomplete"
      violation="${violation}\n   Should: check idempotency table first, return cached result if key exists"
      violation="${violation}\n   Pattern: const cached = await db.query.idempotency...where(objectId, key)"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi

  # Check 5: All operations should be in a transaction
  if echo "$file_content" | grep -qE "ops\.forEach|ops\.map|for.*ops|ops\[" 2>/dev/null; then
    if ! echo "$file_content" | grep -qE "db\.transaction|transaction\(\)|tx\." 2>/dev/null; then
      violation="❌ Patch operations not wrapped in transaction"
      violation="${violation}\n   All ops must be atomic: wrap in db.transaction(() => { /* apply ops */ })"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#transactions"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi

fi

# ============================================================================
# Section B: Check error code usage
# ============================================================================

# Extract all error codes being thrown/returned
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: error code in throw, return, or assignment
  # Patterns: 'NOT_FOUND_OBJECT', "CONFLICT_VERSION", code: 'INVARIANT_CYCLE', etc.
  if [[ $line =~ (code|Code)[[:space:]]*[:=][[:space:]]*['\"]([A-Z_]+)['\"] ]] || \
     [[ $line =~ ['\"]([A-Z_]+)['\"][[:space:]]*,[[:space:]]*.*error ]]; then

    error_code="${BASH_REMATCH[2]}"
    [[ -z "$error_code" ]] && error_code="${BASH_REMATCH[1]}"
    [[ -z "$error_code" ]] && continue

    # Check if it's canonical
    is_canonical=false
    for canonical_code in "${CANONICAL_ERROR_CODES[@]}"; do
      if [[ "$error_code" == "$canonical_code" ]]; then
        is_canonical=true
        break
      fi
    done

    if ! $is_canonical && [[ ! "$error_code" =~ ^[A-Z][A-Z_]*$ ]]; then
      violation="⚠️  Non-canonical error code: '${error_code}'"
      violation="${violation}\n   Allowed codes: NOT_FOUND_OBJECT, NOT_FOUND_BLOCK, VALIDATION, CONFLICT_VERSION,"
      violation="${violation}\n   CONFLICT_ORDERING, INVARIANT_CYCLE, INVARIANT_CROSS_OBJECT, INVARIANT_PARENT_DELETED,"
      violation="${violation}\n   IDEMPOTENCY_CONFLICT, INTERNAL"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#error-taxonomy"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(echo "$file_content" | grep -iE "error|code.*=" || true)

# ============================================================================
# Section C: Check invariant validations
# ============================================================================

# For move operations, check cycle detection
if echo "$file_content" | grep -q "block.move\|moveBlock"; then
  if ! echo "$file_content" | grep -qE "cycle|ancestor|descendant|parent.*newParent|INVARIANT_CYCLE" 2>/dev/null; then
    violation="⚠️  Move operation missing cycle detection"
    violation="${violation}\n   Before moving a block, check: cannot move under own descendant (cycle)"
    violation="${violation}\n   Error code: INVARIANT_CYCLE"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#move"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# For all operations, check parent exists and belongs to same object
if echo "$file_content" | grep -q "parentBlockId\|parent_block_id"; then
  if ! echo "$file_content" | grep -qE "parent.*exist|parent.*NOT_FOUND|parent.*same.*object|INVARIANT_PARENT_DELETED|INVARIANT_CROSS_OBJECT" 2>/dev/null; then
    violation="⚠️  Parent validation may be incomplete"
    violation="${violation}\n   Check: parent exists, is not deleted, belongs to same object"
    violation="${violation}\n   Error codes: NOT_FOUND_BLOCK, INVARIANT_PARENT_DELETED, INVARIANT_CROSS_OBJECT"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# ============================================================================
# Section D: Check operation-specific implementations
# ============================================================================

# Check insert operations
if echo "$file_content" | grep -q "block.insert\|insertBlock"; then
  # Should compute order_key if place is provided
  if ! echo "$file_content" | grep -qE "order.*key|orderKey|place.*start|place.*end|place.*before|place.*after" 2>/dev/null; then
    violation="⚠️  Insert operation missing placement/ordering logic"
    violation="${violation}\n   Should compute orderKey based on 'place' parameter (start/end/before/after)"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#insert"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# Check update operations
if echo "$file_content" | grep -q "block.update\|updateBlock"; then
  # Should support partial updates
  if ! echo "$file_content" | grep -qE "patch|partial|merge|spread|\.\.\." 2>/dev/null; then
    violation="⚠️  Update operation may not support partial updates"
    violation="${violation}\n   Should allow updating: content, blockType, meta independently"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#update"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# Check delete operations
if echo "$file_content" | grep -q "block.delete\|deleteBlock"; then
  # Should use soft delete (deleted_at), not hard delete
  if ! echo "$file_content" | grep -qE "deleted_at|soft.*delete|mark.*delete" 2>/dev/null; then
    violation="⚠️  Delete operation may not use soft delete"
    violation="${violation}\n   Should set deleted_at timestamp, not remove from DB"
    violation="${violation}\n   Subtree deletion should cascade deleted_at to descendants"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#delete"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# ============================================================================
# Section E: Check derived data updates
# ============================================================================

# Check for reference extraction on insert/update
if echo "$file_content" | grep -qE "block.insert|block.update|insertBlock|updateBlock"; then
  if ! echo "$file_content" | grep -qE "ref|reference|refs.*table|extract.*ref" 2>/dev/null; then
    violation="⚠️  Content changes may not update refs table"
    violation="${violation}\n   Should extract references from content and update 'refs' table"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#derived-data-side-effects"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# Check for FTS update on insert/update
if echo "$file_content" | grep -qE "block.insert|block.update|insertBlock|updateBlock"; then
  if ! echo "$file_content" | grep -qE "fts|search|text.*extract|full.*text" 2>/dev/null; then
    violation="⚠️  Content changes may not update FTS table"
    violation="${violation}\n   Should extract plain text from content and update 'fts_blocks' table"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#derived-data-side-effects"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# ============================================================================
# Section F: Check root block special handling
# ============================================================================

# Root blocks (parent = null) need special ordering handling
if echo "$file_content" | grep -q "null\|parentBlockId.*null\|parent.*null"; then
  if ! echo "$file_content" | grep -qE "root.*order|null.*unique|NULL.*unique|app.*level" 2>/dev/null; then
    violation="⚠️  Root block ordering may not handle uniqueness"
    violation="${violation}\n   SQLite unique indexes don't enforce on NULL values."
    violation="${violation}\n   Application must enforce: unique(object_id, parent=NULL, order_key) at runtime"
    violation="${violation}\n   Reference: docs/foundational/backend_contract.md#known-limitation"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
fi

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Block patch spec validation warnings ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Ensure patch implementation follows the backend contract specification.\n"
  error_msg="${error_msg}See: docs/foundational/backend_contract.md"
  echo -e "$error_msg" >&2
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 2 "$duration_ms" "$file_path" "$violation_count" 2>/dev/null || true
  exit 2
fi

# Log metrics for successful run
end_time=$(date +%s)
duration_ms=$(((end_time - start_time) * 1000))
log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
exit 0
