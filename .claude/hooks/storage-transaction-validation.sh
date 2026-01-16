#!/bin/bash
set -euo pipefail

# Storage Transaction Validation Hook
# Enforces that packages/storage/src/ uses transactions for atomic database operations

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="storage-transaction-validation"
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

# Only validate TypeScript files in packages/storage/src/
if [[ ! $file_path =~ ^packages/storage/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Skip migration and schema files
if [[ $file_path =~ (migrations|schema)\.ts$ ]]; then
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

# Count write operations (insert, update, delete)
# These are the operations that need atomicity
write_op_count=$(grep -cE "db\.(insert|update|delete)" "$file_path" 2>/dev/null || true)

# Check if there are any write operations
if [[ $write_op_count -lt 2 ]]; then
  # Single or no write operations - no transaction needed
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Multiple write operations exist - check if they're wrapped in transaction
# Look for db.transaction() patterns
transaction_count=$(grep -cE "db\.transaction\(" "$file_path" 2>/dev/null || true)

# Now check if the write operations are actually within transactions
# We need to be smart: count lines with write ops vs lines within transaction blocks
# If there are write ops but they might not all be in transactions, check more carefully

# Get the file content
file_content=$(cat "$file_path")

# Check if there are multiple write operations outside of any transaction block
# Simple heuristic: look for patterns like:
# await db.insert(...) followed by await db.update(...) outside transaction

# Count await patterns for write ops
write_awaits=$(echo "$file_content" | grep -cE "await[[:space:]]+db\.(insert|update|delete)" 2>/dev/null || true)

# Count transaction blocks
transaction_blocks=$(echo "$file_content" | grep -cE "db\.transaction\(" 2>/dev/null || true)

# If there are multiple write operations and no transactions, warn
if [[ $write_awaits -gt 1 && $transaction_blocks -eq 0 ]]; then
  violation="⚠️  Multiple database write operations without transaction wrapper"
  violation="${violation}\n   Found $write_awaits write operations (insert/update/delete) without atomicity guarantee."
  violation="${violation}\n   Wrap in: db.transaction(() => { /* operations */ })"
  violations="${violations}${violation}\n"
  ((violation_count++))
fi

# Check for potential issue: multiple write operations might not all be in same transaction
# This is a warning pattern: if there are more write operations than transaction blocks
if [[ $write_awaits -gt 1 && $transaction_blocks -gt 0 && $transaction_blocks -lt $(($write_awaits / 2)) ]]; then
  violation="⚠️  Multiple database write operations may not all be atomic"
  violation="${violation}\n   Found $write_awaits write operations but only $transaction_blocks transaction block(s)."
  violation="${violation}\n   Ensure all related writes are in the same transaction."
  violations="${violations}${violation}\n"
  ((violation_count++))
fi

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Storage transaction warnings ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Atomic operations prevent partial updates if errors occur.\n"
  error_msg="${error_msg}Pattern: db.transaction(() => { await db.insert(...); await db.update(...); })"
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
