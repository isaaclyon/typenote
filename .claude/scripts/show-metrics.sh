#!/bin/bash
# Hook Metrics Query Script
# Provides convenient views into hook execution metrics
#
# Usage:
#   .claude/scripts/show-metrics.sh [command]
#
# Commands:
#   summary     - Overview of all hooks (total runs, violations, errors, timing)
#   violations  - Recent violations caught by hooks (last 20)
#   slowest     - Hooks with longest execution time (top 10)
#   recent      - Last 30 hook executions
#   reset       - Delete metrics database (fresh start)

set -euo pipefail

METRICS_DB=".claude/metrics.db"

# Check if database exists
if [[ ! -f "$METRICS_DB" ]]; then
  echo "No metrics database found at $METRICS_DB"
  echo "Hooks will create it automatically on first run."
  exit 0
fi

# Get command (default to summary)
command="${1:-summary}"

case "$command" in
  summary)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Hook Metrics Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sqlite3 -box "$METRICS_DB" <<'EOF'
SELECT
  hook_name,
  COUNT(*) as total_runs,
  SUM(CASE WHEN exit_code = 2 THEN 1 ELSE 0 END) as violations,
  SUM(CASE WHEN exit_code = 1 THEN 1 ELSE 0 END) as errors,
  ROUND(AVG(duration_ms), 1) as avg_ms,
  MAX(duration_ms) as max_ms
FROM hook_runs
GROUP BY hook_name
ORDER BY total_runs DESC;
EOF
    ;;

  violations)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Recent Violations (Last 20)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sqlite3 -box "$METRICS_DB" <<'EOF'
SELECT
  datetime(timestamp) as time,
  hook_name,
  violation_count as violations,
  substr(file_path, 1, 50) as file
FROM hook_runs
WHERE exit_code = 2
ORDER BY timestamp DESC
LIMIT 20;
EOF
    ;;

  slowest)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Slowest Hook Runs (Top 10)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sqlite3 -box "$METRICS_DB" <<'EOF'
SELECT
  hook_name,
  duration_ms as ms,
  datetime(timestamp) as time,
  substr(file_path, 1, 40) as file
FROM hook_runs
ORDER BY duration_ms DESC
LIMIT 10;
EOF
    ;;

  recent)
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Recent Hook Activity (Last 30)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sqlite3 -box "$METRICS_DB" <<'EOF'
SELECT
  datetime(timestamp) as time,
  hook_name,
  CASE
    WHEN exit_code = 0 THEN '✓'
    WHEN exit_code = 2 THEN '✗ violation'
    ELSE '✗ error'
  END as result,
  duration_ms as ms
FROM hook_runs
ORDER BY timestamp DESC
LIMIT 30;
EOF
    ;;

  reset)
    echo "Resetting metrics database..."
    rm -f "$METRICS_DB"
    echo "✓ Metrics reset. Database will be recreated on next hook run."
    ;;

  *)
    echo "Usage: $0 [summary|violations|slowest|recent|reset]"
    echo ""
    echo "Commands:"
    echo "  summary     - Overview of all hooks (default)"
    echo "  violations  - Recent violations caught"
    echo "  slowest     - Hooks with longest execution time"
    echo "  recent      - Last 30 hook runs"
    echo "  reset       - Delete metrics database"
    echo ""
    echo "Examples:"
    echo "  $0 summary"
    echo "  $0 violations"
    exit 1
    ;;
esac
