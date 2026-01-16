#!/bin/bash
set -euo pipefail

# Source File Size Validation Hook
# Warns when source files exceed 400 lines to encourage modular design
# Supports @maxsize-N decorator for exceptions (e.g., // @maxsize-600)

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="source-file-size-validation"
start_time=$(date +%s)

DEFAULT_MAX_LINES=400

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

# Only validate TypeScript/JavaScript source files
if [[ ! $file_path =~ \.(ts|tsx|js|jsx)$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Skip test files (handled by test-file-size-validation.sh)
if [[ $file_path =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Skip type definition files
if [[ $file_path =~ \.d\.ts$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Skip config files
if [[ $file_path =~ \.(config)\.(ts|js)$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Check if file exists
if [[ ! -f "$file_path" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Count lines in the file
line_count=$(wc -l < "$file_path" | tr -d ' ')

# Check for @maxsize-N decorator in first 10 lines
# Matches: // @maxsize-N, /* @maxsize-N */, or # @maxsize-N
custom_limit=""
has_decorator=false

if head -n 10 "$file_path" | grep -qE '@maxsize-[0-9]+'; then
  has_decorator=true
  custom_limit=$(head -n 10 "$file_path" | grep -oE '@maxsize-[0-9]+' | head -1 | grep -oE '[0-9]+')
fi

# Determine effective limit
if [[ -n "$custom_limit" ]]; then
  max_lines=$custom_limit
else
  max_lines=$DEFAULT_MAX_LINES
fi

# Handle files with custom decorator
if [[ "$has_decorator" == true ]]; then
  if [[ $line_count -gt $max_lines ]]; then
    # Over custom limit - show warning
    cat <<EOF

Warning: Source file exceeds custom limit of $max_lines lines (currently: $line_count lines)
    File: $file_path

    This file has an adjusted size limit via @maxsize-$custom_limit decorator.
    Even with the custom limit, consider:
    - Extracting helper functions to separate modules
    - Separating types/interfaces to a types.ts file
    - Breaking into smaller, focused modules

EOF
  else
    # Under custom limit - show reminder
    cat <<EOF

Reminder: This file has an adjusted size limit (@maxsize-$custom_limit, currently: $line_count lines)
    File: $file_path

    Ensure as you edit that you are appropriately refactoring or writing
    code to avoid monolithic files. Custom limits should be rare exceptions.

EOF
  fi
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Handle files without decorator (standard behavior)
if [[ $line_count -gt $max_lines ]]; then
  cat <<EOF

Warning: Source file exceeds $max_lines lines (currently: $line_count lines)
    File: $file_path

    You likely need to refactor it into multiple smaller files.
    Consider:
    - Extracting helper functions to separate modules
    - Separating types/interfaces to a types.ts file
    - Breaking into smaller, focused modules

    Alternatively, in rare situations where this code benefits from being
    in a single file, add a decorator to the top of the file:
    // @maxsize-N  (where N is the desired line limit)

EOF
fi

# Log metrics for successful run
end_time=$(date +%s)
duration_ms=$(((end_time - start_time) * 1000))
log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
exit 0
