#!/bin/bash
set -euo pipefail

# Renderer IPC Validation Hook
# Enforces type-safe IPC patterns in Electron renderer process
# Reference: .claude/rules/electron.md

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="renderer-ipc-validation"
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

# Only validate TypeScript/TSX files in renderer directory
if [[ ! $file_path =~ ^apps/desktop/src/renderer/ ]] || [[ ! $file_path =~ \.(ts|tsx)$ ]]; then
  # Log metrics for early exit
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Skip test files
if [[ $file_path =~ \.(test|spec)\.(ts|tsx)$ ]]; then
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

# Rule 1: Block direct ipcRenderer usage
# Renderer should use window.typenoteAPI.* instead
if grep -qE "ipcRenderer\.(invoke|send|on)" "$file_path" 2>/dev/null; then
  violation="❌ Direct ipcRenderer usage detected in renderer process"
  violation="${violation}\n   Use window.typenoteAPI.* for type-safe IPC communication"
  violation="${violation}\n   Preload bridge defined in: apps/desktop/src/preload/"
  violation="${violation}\n   Example: window.typenoteAPI.getDocument(id)"
  violations="${violations}${violation}\n"
  ((violation_count++))
fi

# Rule 2: Validate IPC channel naming convention
# Channels should follow: typenote:resource:action
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Extract channel name from invoke() calls
  if [[ $line =~ invoke\(['\"]([^'\"]+)['\"] ]]; then
    channel="${BASH_REMATCH[1]}"

    # Check if channel follows convention
    if [[ ! $channel =~ ^typenote:[a-z]+:[a-z]+ ]]; then
      violation="⚠️  IPC channel doesn't follow naming convention: '$channel'"
      violation="${violation}\n   Expected pattern: 'typenote:resource:action'"
      violation="${violation}\n   Example: 'typenote:object:get', 'typenote:block:update'"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(grep -E "invoke\(" "$file_path" 2>/dev/null || true)

# Rule 3: Warn on missing error handling (non-blocking)
# IPC calls should handle Result<T, E> pattern
if grep -qE "window\.typenoteAPI\.[a-zA-Z]+" "$file_path" 2>/dev/null; then
  # Check if there's error handling nearby (try/catch or .catch())
  has_error_handling=false

  if grep -qE "(try[[:space:]]*\{|\.catch\(|catch[[:space:]]*\()" "$file_path" 2>/dev/null; then
    has_error_handling=true
  fi

  if ! $has_error_handling; then
    # This is a warning, not a violation (non-blocking)
    echo "⚠️  Consider adding error handling for IPC calls" >&2
    echo "   Pattern: const result = await window.typenoteAPI.call();" >&2
    echo "   Then: if (!result.ok) { handle error }" >&2
  fi
fi

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Renderer IPC violations detected ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Renderer must use type-safe IPC patterns defined in preload bridge.\n"
  error_msg="${error_msg}See: .claude/rules/electron.md"
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
