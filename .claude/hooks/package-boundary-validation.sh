#!/bin/bash
set -euo pipefail

# Package Boundary Validation Hook
# Enforces strict architectural boundaries in the TypeNote monorepo

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only validate TypeScript/JavaScript files
if [[ ! $file_path =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Only validate source files (skip test/config files)
if [[ $file_path =~ \.(test|spec|config|d\.ts)$ ]]; then
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Determine which package this file belongs to
package_type=""
package_name=""

if [[ $file_path =~ ^packages/api/ ]]; then
  package_type="api"
  package_name="packages/api"
elif [[ $file_path =~ ^packages/core/ ]]; then
  package_type="core"
  package_name="packages/core"
elif [[ $file_path =~ ^packages/storage/ ]]; then
  package_type="storage"
  package_name="packages/storage"
elif [[ $file_path =~ ^apps/cli/ ]]; then
  package_type="app-cli"
  package_name="apps/cli"
elif [[ $file_path =~ ^apps/desktop/src/renderer/ ]]; then
  package_type="renderer"
  package_name="apps/desktop/src/renderer"
elif [[ $file_path =~ ^apps/desktop/ ]]; then
  package_type="app-desktop"
  package_name="apps/desktop"
else
  # Not in a recognized package
  exit 0
fi

# Extract and validate all import statements from the file
# Patterns: import ... from "...", import ... from '...', require("..."), require('...')
violations=""
violation_count=0

# Check each import using process substitution to preserve variables
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Extract the module being imported using sed (more reliable than bash regex)
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

  # Ignore relative imports and node builtins
  if [[ $module =~ ^\..*/ ]] || [[ $module =~ ^node: ]]; then
    continue
  fi

  # Determine what type of module this is
  module_type=""
  if [[ "$module" == "zod" ]]; then
    module_type="zod"
  elif [[ "$module" == "ulid" ]]; then
    module_type="ulid"
  elif [[ "$module" =~ ^drizzle-orm ]]; then
    module_type="drizzle"
  elif [[ "$module" == "better-sqlite3" ]]; then
    module_type="better-sqlite3"
  elif [[ "$module" == "electron" ]]; then
    module_type="electron"
  elif [[ "$module" =~ ^@typenote/api ]]; then
    module_type="@typenote/api"
  elif [[ "$module" =~ ^@typenote/core ]]; then
    module_type="@typenote/core"
  elif [[ "$module" =~ ^@typenote/storage ]]; then
    module_type="@typenote/storage"
  fi

  # Validate imports based on package type
  violation=""

  case "$package_type" in
    api)
      # packages/api: only zod allowed
      if [[ -n "$module_type" && "$module_type" != "zod" ]]; then
        violation="❌ packages/api can only import 'zod', not '$module'"
      fi
      ;;
    core)
      # packages/core: only api, zod, ulid allowed
      if [[ -n "$module_type" && ! "$module_type" =~ ^(@typenote/api|zod|ulid)$ ]]; then
        violation="❌ packages/core can only import '@typenote/api', 'zod', 'ulid', not '$module'"
      fi
      ;;
    storage)
      # packages/storage: only api, core, drizzle, better-sqlite3 allowed
      if [[ -n "$module_type" && ! "$module_type" =~ ^(@typenote/api|@typenote/core|drizzle|better-sqlite3)$ ]]; then
        violation="❌ packages/storage can only import '@typenote/api', '@typenote/core', 'drizzle-orm', 'better-sqlite3', not '$module'"
      fi
      ;;
    renderer)
      # apps/desktop/src/renderer: no storage or database imports
      if [[ "$module_type" == "@typenote/storage" ]]; then
        violation="❌ Renderer cannot import '@typenote/storage' (database access). Use IPC to communicate with main process."
      elif [[ "$module_type" =~ ^(drizzle|better-sqlite3)$ ]]; then
        violation="❌ Renderer cannot import database libraries ('$module'). Use IPC for main process communication."
      fi
      ;;
    app-desktop|app-cli)
      # apps can use all packages, but still block electron in packages
      if [[ $file_path =~ ^apps/ && "$module_type" == "electron" && ! $file_path =~ ^apps/desktop/src/main ]]; then
        # Electron only allowed in main process, not in renderer or cli
        if [[ $file_path =~ renderer ]]; then
          violation="❌ Renderer process cannot import 'electron'. Use IPC to communicate with main process."
        fi
      fi
      ;;
  esac

  # Check for electron imports in packages (always forbidden)
  if [[ "$module_type" == "electron" && $file_path =~ ^packages/ ]]; then
    violation="❌ Packages cannot import 'electron'. Business logic must stay framework-agnostic."
  fi

  # Accumulate violations
  if [[ -n "$violation" ]]; then
    violations="${violations}${violation}\n   File: $file_path\n   Import: $line\n"
    ((violation_count++))
  fi
done < <(grep -E "^import|^export.*from|^require\(|^const.*require" "$file_path" 2>/dev/null || true)

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Package boundary violations detected ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}\nSee docs/foundational/backend_contract.md for dependency rules."
  echo -e "$error_msg" >&2
  exit 2
fi

exit 0
