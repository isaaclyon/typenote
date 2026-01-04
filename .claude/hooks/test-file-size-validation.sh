#!/bin/bash
set -euo pipefail

# Test File Size Validation Hook
# Warns when test files exceed 500 lines to encourage splitting by concern

MAX_LINES=500

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only validate test files
if [[ ! $file_path =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Check if file exists
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Count lines in the file
line_count=$(wc -l < "$file_path" | tr -d ' ')

# Warn if file exceeds limit (but don't block)
if [[ $line_count -gt $MAX_LINES ]]; then
  cat <<EOF

Warning: Test file exceeds $MAX_LINES lines (currently: $line_count lines)
    File: $file_path

    Consider splitting by:
    - Operation type (insert/update/delete)
    - Function under test
    - Unit vs integration tests

    See existing pattern: applyBlockPatch.*.test.ts

EOF
fi

exit 0
