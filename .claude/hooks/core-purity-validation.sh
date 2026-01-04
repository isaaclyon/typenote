#!/bin/bash
set -euo pipefail

# Core Package Purity Validation Hook
# Enforces that packages/core/src/ contains only pure domain logic (no side effects)

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only validate TypeScript files in packages/core/src/
if [[ ! $file_path =~ ^packages/core/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

violations=""
violation_count=0

# Forbidden import patterns for core package
# Database libraries
forbidden_db_patterns=("drizzle-orm" "better-sqlite3" "sqlite3" "mysql2" "pg" "redis" "mongodb")
# File system
forbidden_fs_patterns=("^fs$" "^fs/promises$" "^path$" "^fs-extra" "rimraf")
# Network
forbidden_net_patterns=("^http$" "^https$" "^fetch" "axios" "got" "node-fetch" "request" "superagent")
# Process/System
forbidden_sys_patterns=("^process$" "^child_process$" "^os$" "cluster" "worker_threads")
# Framework specific
forbidden_framework_patterns=("^electron$" "@typenote/storage")

# Check each import line
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Extract module name using sed
  module=""
  module=$(printf '%s\n' "$line" | sed -n "s/.*from[[:space:]]*'\\([^']*\\)'.*/\\1/p")
  if [[ -z "$module" ]]; then
    module=$(printf '%s\n' "$line" | sed -n 's/.*from[[:space:]]*"\([^"]*\)".*/\1/p')
  fi
  if [[ -z "$module" ]]; then
    module=$(printf '%s\n' "$line" | sed -n "s/.*require[[:space:]]*'\\([^']*\\)'.*/\\1/p")
  fi
  if [[ -z "$module" ]]; then
    module=$(printf '%s\n' "$line" | sed -n 's/.*require[[:space:]]*"\([^"]*\)".*/\1/p')
  fi

  [[ -z "$module" ]] && continue

  # Skip relative imports and node builtins
  if [[ $module =~ ^\..*/ ]] || [[ $module =~ ^node: ]]; then
    continue
  fi

  # Check forbidden patterns
  violation=""

  # Check database libraries
  for pattern in "${forbidden_db_patterns[@]}"; do
    if [[ "$module" =~ ^${pattern} ]]; then
      violation="❌ Database import forbidden: '$module'. Core contains pure domain logic, not data access."
      break
    fi
  done

  # Check file system
  if [[ -z "$violation" ]]; then
    for pattern in "${forbidden_fs_patterns[@]}"; do
      if [[ "$module" =~ ${pattern} ]]; then
        violation="❌ File system import forbidden: '$module'. Move file I/O to storage or app layer."
        break
      fi
    done
  fi

  # Check network
  if [[ -z "$violation" ]]; then
    for pattern in "${forbidden_net_patterns[@]}"; do
      if [[ "$module" =~ ${pattern} ]]; then
        violation="❌ Network import forbidden: '$module'. Move HTTP requests to app or api layer."
        break
      fi
    done
  fi

  # Check process/system
  if [[ -z "$violation" ]]; then
    for pattern in "${forbidden_sys_patterns[@]}"; do
      if [[ "$module" =~ ${pattern} ]]; then
        violation="❌ System/process import forbidden: '$module'. Keep core platform-agnostic."
        break
      fi
    done
  fi

  # Check framework specific
  if [[ -z "$violation" ]]; then
    for pattern in "${forbidden_framework_patterns[@]}"; do
      if [[ "$module" =~ ${pattern} ]]; then
        violation="❌ Forbidden import: '$module'. Core must be framework/storage agnostic."
        break
      fi
    done
  fi

  # Report violation
  if [[ -n "$violation" ]]; then
    violations="${violations}${violation}\n   Import: $line\n"
    ((violation_count++))
  fi
done < <(grep -E "^import|^export.*from|^require\(|^const.*require" "$file_path" 2>/dev/null || true)

# Check for async functions (warning only, not blocking unless combined with I/O)
async_count=$(grep -c "^[[:space:]]*async[[:space:]]" "$file_path" 2>/dev/null || true)
if [[ $async_count -gt 0 ]]; then
  # Only warn about async if there are no actual I/O violations
  if [[ $violation_count -eq 0 ]]; then
    # This is a warning, not a violation, so we just note it
    # The hook will still pass but async functions should be reviewed
    :
  fi
fi

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Core package purity violations detected ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Core package must contain only pure domain logic.\n"
  error_msg="${error_msg}Move I/O operations to: packages/storage (DB), apps (files/network/system)."
  echo -e "$error_msg" >&2
  exit 2
fi

exit 0
