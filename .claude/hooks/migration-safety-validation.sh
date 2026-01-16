#!/bin/bash
set -euo pipefail

# Migration Safety Validation Hook
# Catches destructive database operations before they're committed
# Reference: docs/foundational/backend_contract.md

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="migration-safety-validation"
start_time=$(date +%s)

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  # Log metrics for early exit
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "" 0 2>/dev/null || true
  exit 0
fi

# Only validate SQL migration files
if [[ ! $file_path =~ (drizzle|migrations?).*\.sql$ ]]; then
  # Log metrics for early exit
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Check if file exists
if [[ ! -f "$file_path" ]]; then
  # Log metrics for early exit
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

violations=""
violation_count=0

# Read file content
file_content=$(cat "$file_path")

# Define destructive operations
destructive_ops=("DROP TABLE" "DROP COLUMN" "TRUNCATE" "DELETE FROM")

# Rule 1: Check for destructive operations without safety comment
has_destructive_comment=false
if head -20 "$file_path" | grep -qi "@migration-destructive"; then
  has_destructive_comment=true
fi

for op in "${destructive_ops[@]}"; do
  if echo "$file_content" | grep -qi "$op"; then
    if ! $has_destructive_comment; then
      violation="❌ Destructive operation without safety comment: $op"
      violation="${violation}\n   Add comment at top of file: -- @migration-destructive: [explain why this is safe]"
      violation="${violation}\n   Example: -- @migration-destructive: removing unused temp table from v0.1"
      violation="${violation}\n   This ensures destructive changes are intentional and documented."
      violations="${violations}${violation}\n"
      ((violation_count++))
      break  # Only report once per file
    fi
  fi
done

# Rule 2: Warn on breaking schema changes (non-blocking warnings)
warnings=""

# ALTER COLUMN TYPE - may break existing data
if echo "$file_content" | grep -qi "ALTER.*COLUMN.*TYPE"; then
  warnings="${warnings}⚠️  ALTER COLUMN TYPE detected - verify data compatibility\n"
  warnings="${warnings}   Changing column types can break existing data.\n"
  warnings="${warnings}   Ensure: data is compatible OR migration includes conversion logic.\n\n"
fi

# NOT NULL without DEFAULT - fails on existing rows
if echo "$file_content" | grep -qi "ADD.*COLUMN.*NOT NULL" && ! echo "$file_content" | grep -q "DEFAULT"; then
  warnings="${warnings}⚠️  Adding NOT NULL column without DEFAULT value\n"
  warnings="${warnings}   This will fail if the table has existing rows.\n"
  warnings="${warnings}   Add: DEFAULT value OR backfill data in migration.\n\n"
fi

# DROP COLUMN - may break code still using it
if echo "$file_content" | grep -qi "DROP COLUMN"; then
  warnings="${warnings}⚠️  DROP COLUMN detected\n"
  warnings="${warnings}   Verify: no code references this column.\n"
  warnings="${warnings}   Consider: soft delete (rename to _deprecated_columnname) for safer rollback.\n\n"
fi

# Output warnings (non-blocking)
if [[ -n "$warnings" ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "Migration Safety Warnings:" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo -e "$warnings" >&2
fi

# Report violations (blocking)
if [[ $violation_count -gt 0 ]]; then
  error_msg="Migration safety violations detected ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Destructive operations must be explicitly documented for safety.\n"
  error_msg="${error_msg}See: docs/foundational/backend_contract.md"
  echo -e "$error_msg" >&2

  # Log metrics before exit
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
