#!/bin/bash
set -euo pipefail

# Format & Lint on Stop Hook
# Automatically formats and lints modified/new files when Claude Code stops
# Trigger: Stop event
# Scope: Modified, staged, and untracked files in working tree

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="format-lint-on-stop"
start_time=$(date +%s)

# Configuration
WORK_DIR="${1:-.}"
cd "$WORK_DIR"

# Get list of modified files from git (unstaged + staged changes)
# This captures: modified, added, and deleted files in the working tree
modified_files=$(git diff --name-only HEAD 2>/dev/null || echo "")

# Also get staged files in case they haven't been committed yet
staged_files=$(git diff --name-only --cached 2>/dev/null || echo "")

# Also get untracked files (new files not yet added to git)
untracked_files=$(git ls-files --others --exclude-standard 2>/dev/null || echo "")

# Combine and deduplicate
all_files=$(echo -e "$modified_files\n$staged_files\n$untracked_files" | sort -u | tr '\n' ' ')

# Filter for TypeScript and JavaScript files only
ts_js_files=$(echo "$all_files" | tr ' ' '\n' | grep -E '\.(ts|tsx|js|jsx)$' | tr '\n' ' ' || echo "")

# If no files to process, exit gracefully
if [[ -z "$ts_js_files" || "$ts_js_files" == " " ]]; then
  echo "✅ No TypeScript/JavaScript files to format or lint"
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "" 0 2>/dev/null || true
  exit 0
fi

# Count files before processing
file_count=$(echo "$ts_js_files" | wc -w | tr -d ' ')

echo "📝 Formatting and linting $file_count modified file(s)..."
echo ""

# Track formatting and linting results
format_errors=0
lint_errors=0
format_warning_msg=""
lint_warning_msg=""

# Run formatter on modified files using prettier directly
echo "🎨 Formatting..."
if pnpm exec prettier --write $ts_js_files 2>/tmp/format-output.log; then
  format_count=$(echo "$ts_js_files" | wc -w | tr -d ' ')
  echo "   ✓ Formatted $format_count file(s)"
else
  format_errors=$?
  format_warning_msg=$(cat /tmp/format-output.log 2>/dev/null || echo "Format failed with exit code $format_errors")
  echo "   ⚠️  Format encountered issues:"
  echo "$format_warning_msg" | sed 's/^/   /'
fi

echo ""

# Run linter on modified files
# Linter may find issues but we don't fail the hook - just report them
# Note: pnpm lint doesn't handle per-file arguments well in workspace context,
# so we run it without specifying files and let ESLint find modified files
echo "🔍 Linting..."
if pnpm exec eslint $ts_js_files 2>/tmp/lint-output.log; then
  echo "   ✓ No lint issues found"
else
  lint_errors=$?
  lint_warning_msg=$(cat /tmp/lint-output.log 2>/dev/null || echo "Lint issues found")
  echo "   ⚠️  Lint issues detected (showing first 15 lines):"
  # Show only first 15 lines to avoid overwhelming output
  echo "$lint_warning_msg" | head -15 | sed 's/^/   /'

  # If there are more lines, indicate that
  line_count=$(echo "$lint_warning_msg" | wc -l)
  if [[ $line_count -gt 15 ]]; then
    remaining=$((line_count - 15))
    echo "   ... and $remaining more issue(s) - run 'pnpm lint' for full output"
  fi
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ $format_errors -eq 0 && $lint_errors -eq 0 ]]; then
  echo "✅ All files formatted and linted successfully"
else
  if [[ $format_errors -ne 0 ]]; then
    echo "⚠️  Format completed with warnings - review the output above"
  fi
  if [[ $lint_errors -ne 0 ]]; then
    echo "⚠️  Lint issues found - review the output above"
  fi
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Run 'pnpm lint' manually to see all issues and 'pnpm format' to fix formatting."
echo ""

# Clean up temp files
rm -f /tmp/format-output.log /tmp/lint-output.log

# Log metrics for successful run (count files processed)
end_time=$(date +%s)
duration_ms=$(((end_time - start_time) * 1000))
log_hook_metric "$hook_name" 0 "$duration_ms" "$file_count files" 0 2>/dev/null || true

# Hook succeeds regardless of lint/format issues (non-blocking)
exit 0
