#!/bin/bash
set -euo pipefail

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="git-force-push-protection"
start_time=$(date +%s)

# Git Force-Push Protection Hook
# Prevents force-push to main and master branches

# Read JSON input from stdin
input=$(cat)

# Extract the command using jq
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [[ -z "$command" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "" 0 2>/dev/null || true
  exit 0
fi

# Only check git push commands
if [[ ! $command =~ ^git[[:space:]]+push ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$command" 0 2>/dev/null || true
  exit 0
fi

# Check if command contains force-push flags
has_force=false
if [[ $command =~ --force-with-lease|--force|-f[[:space:]] ]] || [[ $command =~ -[a-zA-Z]*f[a-zA-Z]* ]]; then
  has_force=true
fi

# If no force flag, allow the command
if [[ "$has_force" == false ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$command" 0 2>/dev/null || true
  exit 0
fi

# Extract target branch from command
# Patterns: git push --force origin main, git push -f main, git push origin main --force, etc.
target_branch=""

# Remove 'git push' prefix
cmd_after_push=$(echo "$command" | sed 's/^git[[:space:]]*push[[:space:]]*//')

# First, separate flags from arguments
# Remove leading flags (--force, -f, --force-with-lease, etc.)
cmd_without_flags=$(echo "$cmd_after_push" | sed 's/^[[:space:]]*--[a-zA-Z-]*//; s/^[[:space:]]*-[a-zA-Z]*//; s/^[[:space:]]*//')

# Continue removing flags that might come before remote/branch
while [[ $cmd_without_flags =~ ^--[a-zA-Z-]* ]] || [[ $cmd_without_flags =~ ^-[a-zA-Z]* ]]; do
  cmd_without_flags=$(echo "$cmd_without_flags" | sed 's/^[[:space:]]*--[a-zA-Z-]*//; s/^[[:space:]]*-[a-zA-Z]*//; s/^[[:space:]]*//')
done

# Now extract branch from remaining arguments
# If we have "origin main", extract "main"
if [[ $cmd_without_flags =~ ^(origin|upstream)[[:space:]]+([a-zA-Z0-9._/-]+) ]]; then
  target_branch="${BASH_REMATCH[2]}"
# If we have just "main" or "master" without remote
elif [[ $cmd_without_flags =~ ^([a-zA-Z0-9._/-]+) ]]; then
  target_branch="${BASH_REMATCH[1]}"
fi

# Normalize branch name (remove tracking info like origin/main -> main)
if [[ $target_branch =~ ^(origin|upstream|[a-zA-Z0-9]+)/(.+)$ ]]; then
  target_branch="${BASH_REMATCH[2]}"
fi

# Check if target branch is main or master
protected_branches=("main" "master")
for protected_branch in "${protected_branches[@]}"; do
  if [[ "$target_branch" == "$protected_branch" ]] || [[ -z "$target_branch" && "$command" =~ main|master ]]; then
    error_msg="Force-push to '$target_branch' is blocked to protect shared history. Main branch integrity is critical. If a revert is needed, discuss with your team first."
    echo "$error_msg" >&2
    end_time=$(date +%s)
    duration_ms=$(((end_time - start_time) * 1000))
    log_hook_metric "$hook_name" 2 "$duration_ms" "$command" 1 2>/dev/null || true
    exit 2
  fi
done

# Log metrics for successful run
end_time=$(date +%s)
duration_ms=$(((end_time - start_time) * 1000))
log_hook_metric "$hook_name" 0 "$duration_ms" "$command" 0 2>/dev/null || true
exit 0
