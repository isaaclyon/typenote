#!/bin/bash
set -euo pipefail

# File Protection Hook
# Prevents destructive operations on critical files and directories

# Read JSON input from stdin
input=$(cat)

# Extract the command using jq
command=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

if [[ -z "$command" ]]; then
  exit 0
fi

# Protected paths (directory level)
protected_dirs=(
  ".git"
  ".husky"
  "docs/foundational"
  ".claude/rules"
  "packages/api/src"
  "packages/core/src"
  "packages/storage/src"
  "apps/cli/src"
  "apps/desktop/src"
)

# Protected files (exact match)
protected_files=(
  "package.json"
  "pnpm-workspace.yaml"
  "tsconfig.base.json"
  "eslint.config.js"
  ".prettierrc"
  ".nvmrc"
)

# Check if command is a destructive operation (rm, rm -f, rm -rf)
if [[ ! $command =~ ^rm[[:space:]] ]]; then
  exit 0
fi

# Extract target path from command
# Matches patterns like: rm -rf .git/, rm .husky/file, etc.
target_path=""

# Remove 'rm' prefix and flags to get target path
cmd_without_rm=$(echo "$command" | sed 's/^rm[[:space:]]*//' | sed 's/^-[a-zA-Z]*[[:space:]]*//' | sed 's/^--.* //')
target_path=$(echo "$cmd_without_rm" | awk '{print $1}' | sed 's/[[:space:]]*$//')

if [[ -z "$target_path" ]]; then
  exit 0
fi

# Normalize path (remove trailing slashes, resolve . and ..)
normalized_target=$(echo "$target_path" | sed 's#/$##')

# Check against protected directories (block directory-level deletions)
for protected_dir in "${protected_dirs[@]}"; do
  # Block if trying to delete the directory itself (not files inside)
  if [[ "$normalized_target" == "$protected_dir" ]] || [[ "$normalized_target" == "$protected_dir"* ]] && [[ ${#normalized_target} -eq ${#protected_dir} ]]; then
    error_msg="Protected path: cannot delete '$target_path' (source code, git metadata, or configuration). Use 'pnpm clean' to safely remove build artifacts instead."
    echo "$error_msg" >&2
    exit 2
  fi
done

# Check against protected files
for protected_file in "${protected_files[@]}"; do
  if [[ "$normalized_target" == "$protected_file" ]]; then
    error_msg="Protected file: cannot delete '$target_path' (critical configuration). This would break the build environment."
    echo "$error_msg" >&2
    exit 2
  fi
done

exit 0
