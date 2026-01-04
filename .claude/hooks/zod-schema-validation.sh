#!/bin/bash
set -euo pipefail

# Zod Schema Validation Hook
# Enforces that all exported types in packages/api/src/ have corresponding Zod schemas

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only validate TypeScript files in packages/api/src/
if [[ ! $file_path =~ ^packages/api/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

violations=""
violation_count=0

# Extract exported types (not re-exports)
# Matches: export type X = ..., export interface X { ... }
# Excludes: export type X from '...', export { X } from '...'
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Skip re-exports (export ... from)
  if [[ $line =~ export[[:space:]]+(type|interface|const)[[:space:]]+[A-Za-z_][A-Za-z0-9_]*[[:space:]]*from ]]; then
    continue
  fi
  if [[ $line =~ export[[:space:]]+\{.*\}[[:space:]]*from ]]; then
    continue
  fi

  # Extract type name from "export type TypeName = ..."
  type_name=""
  if [[ $line =~ export[[:space:]]+type[[:space:]]+([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*= ]]; then
    type_name="${BASH_REMATCH[1]}"
  # Extract interface name from "export interface InterfaceName"
  elif [[ $line =~ export[[:space:]]+interface[[:space:]]+([A-Za-z_][A-Za-z0-9_]*) ]]; then
    type_name="${BASH_REMATCH[1]}"
  fi

  # Skip if no type name found
  if [[ -z "$type_name" ]]; then
    continue
  fi

  # Skip common utility type patterns (Partial, Omit, Pick, etc.)
  # These are utility wrappers that don't need their own schemas
  if [[ $type_name =~ ^(Partial|Omit|Pick|Record|Readonly|Extract|Exclude|ReturnType|Parameters|ConstructorParameters)[A-Z] ]] || \
     [[ ${#type_name} -lt 3 ]]; then
    continue
  fi

  # Skip if this is a generic type (contains generics in definition)
  # e.g., export type Result<T> = ...
  if [[ $line =~ export[[:space:]]+type[[:space:]]+[A-Za-z_][A-Za-z0-9_]*\<.*\> ]] || \
     [[ $line =~ export[[:space:]]+interface[[:space:]]+[A-Za-z_][A-Za-z0-9_]*\<.*\> ]]; then
    continue
  fi

  # Check if there's a corresponding Zod schema
  # Look for: export const TypeNameSchema = z.object(...) or similar
  schema_name="${type_name}Schema"

  # Search for the schema in the file
  schema_found=false
  if grep -qE "export[[:space:]]+const[[:space:]]+${schema_name}[[:space:]]*=[[:space:]]*(z\.|Zod)" "$file_path" 2>/dev/null; then
    schema_found=true
  fi

  # Also check for alternative schema patterns (e.g., UserCreateRequestSchema for type UserCreateRequest)
  if ! $schema_found; then
    # Try variations like XRequestSchema for XRequest
    if [[ $type_name =~ ^(.*)(Request|Response|Params|Query|Body)$ ]]; then
      base_name="${BASH_REMATCH[1]}"
      suffix="${BASH_REMATCH[2]}"
      alt_schema_name="${base_name}${suffix}Schema"
      if grep -qE "export[[:space:]]+const[[:space:]]+${alt_schema_name}[[:space:]]*=[[:space:]]*(z\.|Zod)" "$file_path" 2>/dev/null; then
        schema_found=true
      fi
    fi
  fi

  # Report violation if no schema found
  if ! $schema_found; then
    violation="⚠️  Type '${type_name}' has no Zod schema"
    violation="${violation}\n   Expected: export const ${schema_name} = z.object({ ... })"
    violation="${violation}\n   Then export: export type ${type_name} = z.infer<typeof ${schema_name}>"
    violations="${violations}${violation}\n"
    ((violation_count++))
  fi
done < <(grep -E "^export[[:space:]]+(type|interface)" "$file_path" 2>/dev/null || true)

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="Zod schema validation warnings ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Ensure all API types have runtime-validated Zod schemas."
  echo -e "$error_msg" >&2
  exit 2
fi

exit 0
