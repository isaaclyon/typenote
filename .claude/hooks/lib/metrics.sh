#!/bin/bash
# Hook Metrics Utility
# Provides functions for logging hook execution metrics to SQLite database
#
# Usage:
#   source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true
#   log_hook_metric "$hook_name" "$exit_code" "$duration_ms" "$file_path" "$violation_count"

set -eo pipefail  # Removed -u to allow unset variables

# Database location (can be overridden via environment variable)
# Calculate project root (assuming hooks are in .claude/hooks/)
# Use BASH_SOURCE if available, otherwise try to find .git directory
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
else
  # Fallback: search upwards for .git directory
  PROJECT_ROOT="$(pwd)"
  while [[ "$PROJECT_ROOT" != "/" && ! -d "$PROJECT_ROOT/.git" ]]; do
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
  done
  if [[ "$PROJECT_ROOT" == "/" ]]; then
    PROJECT_ROOT="$(pwd)"  # Give up, use current directory
  fi
fi

METRICS_DB="${METRICS_DB:-$PROJECT_ROOT/.claude/metrics.db}"

# Initialize metrics database if it doesn't exist
init_metrics_db() {
  # Skip if database already exists
  if [[ -f "$METRICS_DB" ]]; then
    return 0
  fi

  # Create database with schema
  sqlite3 "$METRICS_DB" <<'EOF'
CREATE TABLE IF NOT EXISTS hook_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hook_name TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  exit_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  file_path TEXT,
  violation_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hook_name ON hook_runs(hook_name);
CREATE INDEX IF NOT EXISTS idx_timestamp ON hook_runs(timestamp);
CREATE INDEX IF NOT EXISTS idx_exit_code ON hook_runs(exit_code);
EOF
}

# Log a hook execution to the metrics database
# Args:
#   $1: hook_name (string) - Name of the hook (e.g., "package-boundary-validation")
#   $2: exit_code (integer) - Exit code: 0=success, 2=violation, 1=error
#   $3: duration_ms (integer) - Execution time in milliseconds
#   $4: file_path (string, optional) - File that triggered the hook
#   $5: violation_count (integer, optional) - Number of violations found
log_hook_metric() {
  local hook_name="$1"
  local exit_code="$2"
  local duration_ms="$3"
  local file_path="${4:-}"
  local violation_count="${5:-0}"
  local timestamp

  # Generate ISO 8601 UTC timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  # Convert duration to integer (remove any non-numeric characters)
  duration_ms=$(echo "$duration_ms" | grep -o '[0-9]*' | head -1)

  # Initialize database if needed
  init_metrics_db 2>/dev/null || {
    # If init fails, log error but don't break hook
    echo "Warning: Failed to initialize metrics database" >&2
    return 0
  }

  # Escape single quotes in file_path for SQL
  file_path="${file_path//\'/\'\'}"

  # Insert metrics record
  if ! sqlite3 "$METRICS_DB" <<EOF 2>/dev/null
INSERT INTO hook_runs (hook_name, timestamp, exit_code, duration_ms, file_path, violation_count)
VALUES ('$hook_name', '$timestamp', $exit_code, $duration_ms, '$file_path', $violation_count);
EOF
  then
    echo "Warning: Failed to log metrics for $hook_name" >&2
    return 0
  fi
}
