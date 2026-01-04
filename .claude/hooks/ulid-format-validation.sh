#!/bin/bash
set -euo pipefail

# ULID Format Validation Hook
# Enforces that all ID fields use proper ULID format, not UUIDs or plain strings
# Reference: docs/foundational/backend_contract.md section 1.2

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only validate TypeScript files in packages/api and packages/core
if [[ ! $file_path =~ ^packages/(api|core)/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

violations=""
violation_count=0

# Read file content
file_content=$(cat "$file_path")

# Check for UUID patterns where ULID should be used
# Look for: v4(), uuidv4(), crypto.randomUUID(), UUID type annotations
uuid_pattern_count=$(echo "$file_content" | grep -cE "(v4\(\)|uuidv4\(\)|randomUUID\(\)|UUID|uuid\.v4)" 2>/dev/null || true)

if [[ $uuid_pattern_count -gt 0 ]]; then
  violation="❌ UUID patterns detected instead of ULID"
  violation="${violation}\n   Found UUID generation/types where ULID should be used."
  violation="${violation}\n   Reference: docs/foundational/backend_contract.md section 1.2 (Identifiers)"
  violation="${violation}\n   ULID provides: sortable timestamps, durable IDs, better than UUID v4 for this domain."
  violation="${violation}\n   Use: import { ULID } from '@typenote/core' and generateId() pattern."
  violations="${violations}${violation}\n"
  ((violation_count++))
fi

# Pattern 1: Find exported ID types and check they reference proper ULID
# Look for: export type ObjectId = string; (without validation)
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: export type XyzId = string;
  if [[ $line =~ export[[:space:]]+type[[:space:]]+([A-Za-z_][A-Za-z0-9_]*Id)[[:space:]]*=[[:space:]]*string[[:space:]]*; ]]; then
    id_type_name="${BASH_REMATCH[1]}"

    # Check if there's a corresponding Zod schema that validates ULID
    # Look for: export const XyzIdSchema = z.string().ulid() or similar
    has_validation=false

    # Check for ULID validation in Zod schema
    if echo "$file_content" | grep -qE "export[[:space:]]+const[[:space:]]+${id_type_name}Schema[[:space:]]*=[[:space:]]*z\.[a-zA-Z]*string\(\)" 2>/dev/null; then
      # Check if that schema includes .ulid() or explicit ULID reference
      if echo "$file_content" | grep -qE "export[[:space:]]+const[[:space:]]+${id_type_name}Schema[[:space:]]*=[[:space:]]*z\.[^;]*ulid|ULID" 2>/dev/null; then
        has_validation=true
      fi
    fi

    if ! $has_validation; then
      # This is a warning - ID types should have ULID validation
      violation="⚠️  ID type '${id_type_name}' lacks explicit ULID validation"
      violation="${violation}\n   Export const ${id_type_name}Schema = z.string().ulid()"
      violation="${violation}\n   Or reference: import { ulid } from 'ulid' for manual validation"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(echo "$file_content" | grep -E "export type.*Id = string" || true)

# Pattern 2: Check for string ID fields in interfaces/types without ULID validation context
# This is a warning pattern: interfaces with ID fields should validate they're ULIDs
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: objectId: string; or similar in a type definition
  if [[ $line =~ ([a-zA-Z_][a-zA-Z0-9_]*Id)[[:space:]]*:[[:space:]]*(string|ULID) ]]; then
    field_name="${BASH_REMATCH[1]}"
    field_type="${BASH_REMATCH[2]}"

    # Only warn if it's a bare string, not explicitly ULID
    if [[ "$field_type" == "string" ]]; then
      # Check if this is in a Zod schema or an interface
      # For now, this is informational - production code should have Zod validation
      :  # Skip inline warnings for now - rely on schema-level validation
    fi
  fi
done < <(echo "$file_content" | grep -E "[a-zA-Z_]Id[[:space:]]*:[[:space:]]*(string|ULID)" || true)

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="ULID format validation warnings ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Ensure all ID fields use proper ULID format for sortability and uniqueness.\n"
  error_msg="${error_msg}See: docs/foundational/backend_contract.md#identifiers"
  echo -e "$error_msg" >&2
  exit 2
fi

exit 0
