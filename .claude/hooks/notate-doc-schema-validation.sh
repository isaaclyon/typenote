#!/bin/bash
set -euo pipefail

# NotateDoc v1 Content Schema Validation Hook
# Enforces canonical content schema for blocks and inline nodes
# Reference: docs/foundational/backend_contract.md section 11 (Canonical Content Schema)

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="notate-doc-schema-validation"
start_time=$(date +%s)

# Read JSON input from stdin
input=$(cat)

# Extract the file path being edited
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

if [[ -z "$file_path" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "" 0 2>/dev/null || true
  exit 0
fi

# Only validate TypeScript files in packages that define content schemas
if [[ ! $file_path =~ ^packages/(api|core)/src/ ]] || [[ ! $file_path =~ \.ts$ ]] || [[ $file_path =~ \.(test|spec)\.ts$ ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

# Check if file exists and is readable
if [[ ! -f "$file_path" ]]; then
  end_time=$(date +%s)
  duration_ms=$(((end_time - start_time) * 1000))
  log_hook_metric "$hook_name" 0 "$duration_ms" "$file_path" 0 2>/dev/null || true
  exit 0
fi

violations=""
violation_count=0

# Read file content
file_content=$(cat "$file_path")

# Define canonical block types from spec
declare -a CANONICAL_BLOCK_TYPES=(
  "paragraph"
  "heading"
  "list"
  "list_item"
  "blockquote"
  "callout"
  "code_block"
  "thematic_break"
  "table"
  "math_block"
  "footnote_def"
)

# Define canonical inline node marks
declare -a CANONICAL_INLINE_MARKS=(
  "em"
  "strong"
  "code"
  "strike"
  "highlight"
)

# Define canonical inline node types
declare -a CANONICAL_INLINE_TYPES=(
  "text"
  "hard_break"
  "link"
  "ref"
  "tag"
  "math_inline"
  "footnote_ref"
)

# Check for non-canonical block types
# Look for string literals that should be block types
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: blockType: 'xyz' or blockType: "xyz" or { op: 'block.xyz' }
  if [[ $line =~ (blockType|blocktype|block_type)[[:space:]]*:[[:space:]]*['\"]([a-z_]+)['\"] ]] || \
     [[ $line =~ \{[^}]*(op)[[:space:]]*:[[:space:]]*['\"]block\.([a-z_]+)['\"] ]]; then

    block_type="${BASH_REMATCH[2]}"
    [[ -z "$block_type" ]] && continue

    # Check if it's in canonical list
    is_canonical=false
    for canonical_type in "${CANONICAL_BLOCK_TYPES[@]}"; do
      if [[ "$block_type" == "$canonical_type" ]]; then
        is_canonical=true
        break
      fi
    done

    if ! $is_canonical && [[ ! "$block_type" =~ ^[a-z_]*$ ]]; then
      violation="⚠️  Non-canonical block type: '${block_type}'"
      violation="${violation}\n   Allowed types: paragraph, heading, list, list_item, blockquote, callout, code_block, thematic_break, table, math_block, footnote_def"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#block-types"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(echo "$file_content" | grep -iE "blockType|blocktype|block_type" || true)

# Check for inline node structure violations
# Look for: { t: '...' } patterns and validate they're canonical
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: { t: 'xyz' or { t: "xyz"
  if [[ $line =~ \{[^}]*\bt[[:space:]]*:[[:space:]]*['\"]([a-z_]+)['\"] ]]; then
    node_type="${BASH_REMATCH[1]}"

    # Check if it's canonical
    is_canonical=false
    for canonical_type in "${CANONICAL_INLINE_TYPES[@]}"; do
      if [[ "$node_type" == "$canonical_type" ]]; then
        is_canonical=true
        break
      fi
    done

    if ! $is_canonical && [[ ! "$node_type" =~ ^[a-z_]*$ ]]; then
      violation="⚠️  Non-canonical inline node type: '${node_type}'"
      violation="${violation}\n   Allowed types: text, hard_break, link, ref, tag, math_inline, footnote_ref"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#inline-node-model"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(echo "$file_content" | grep -E "\bt[[:space:]]*:[[:space:]]*['\"]" || true)

# Check for ref node structure - should have mode, target, optional alias
# Pattern: { t: 'ref', mode: '...', target: {...} }
ref_patterns=$(echo "$file_content" | grep -n "t.*ref" | grep -v "reference\|Reference" || true)
if [[ -n "$ref_patterns" ]]; then
  # Check if ref nodes have required fields
  if echo "$ref_patterns" | grep -q "t.*ref"; then
    # Verify mode field exists
    if ! echo "$file_content" | grep -qE "mode[[:space:]]*:[[:space:]]*['\"]*(link|embed)['\"]" 2>/dev/null; then
      violation="⚠️  Ref node missing or invalid 'mode' field"
      violation="${violation}\n   Ref nodes must specify: mode: 'link' | 'embed'"
      violation="${violation}\n   Reference: docs/foundational/backend_contract.md#inline-node-model"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi

    # Verify target field exists with proper structure
    if ! echo "$file_content" | grep -qE "target[[:space:]]*:[[:space:]]*\{.*kind.*:" 2>/dev/null; then
      # This is only a warning if there are ref nodes defined
      if echo "$file_content" | grep -q "t.*:.*ref"; then
        violation="⚠️  Ref node should have typed 'target' field with kind: 'object' | 'block'"
        violation="${violation}\n   Example: target: { kind: 'object', objectId: '...' }"
        violations="${violations}${violation}\n"
        ((violation_count++))
      fi
    fi
  fi
fi

# Check for mark field validation
# Marks should only use canonical values
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: marks: ['em', 'strong'] or marks: ["code"]
  if [[ $line =~ marks[[:space:]]*:[[:space:]]*\[([^\]]+)\] ]]; then
    marks_str="${BASH_REMATCH[1]}"

    # Extract each mark
    while IFS="'" read -r mark_item; do
      mark_item=$(echo "$mark_item" | xargs)
      [[ -z "$mark_item" ]] && continue

      # Check if canonical
      is_canonical=false
      for canonical_mark in "${CANONICAL_INLINE_MARKS[@]}"; do
        if [[ "$mark_item" == "$canonical_mark" ]]; then
          is_canonical=true
          break
        fi
      done

      if ! $is_canonical && [[ ! -z "$mark_item" && "$mark_item" != "," && "$mark_item" != "]" ]]; then
        violation="⚠️  Non-canonical inline mark: '${mark_item}'"
        violation="${violation}\n   Allowed marks: em, strong, code, strike, highlight"
        violations="${violations}${violation}\n"
        ((violation_count++))
      fi
    done < <(echo "$marks_str" | tr ',' '\n')
  fi
done < <(echo "$file_content" | grep -E "marks[[:space:]]*:" || true)

# Check for block content schema consistency
# Warn if content field types don't match expected schemas
while IFS= read -r line; do
  [[ -z "$line" ]] && continue

  # Match: ParagraphContent, HeadingContent, etc.
  if [[ $line =~ type[[:space:]]+([A-Z][a-zA-Z]+Content)[[:space:]]*= ]]; then
    content_type="${BASH_REMATCH[1]}"

    # Extract block type from content type name
    # E.g., ParagraphContent -> paragraph, HeadingContent -> heading
    block_type=$(echo "$content_type" | sed 's/Content$//' | tr '[:upper:]' '[:lower:]')

    # Check if this corresponds to a canonical block type
    is_canonical=false
    for canonical_type in "${CANONICAL_BLOCK_TYPES[@]}"; do
      if [[ "$block_type" == "$canonical_type" ]]; then
        is_canonical=true
        break
      fi
    done

    if ! $is_canonical; then
      violation="⚠️  Non-canonical content schema: '${content_type}'"
      violation="${violation}\n   Corresponds to block type: '${block_type}' which is not in spec"
      violations="${violations}${violation}\n"
      ((violation_count++))
    fi
  fi
done < <(echo "$file_content" | grep -E "type[[:space:]]+[A-Z][a-zA-Z]+Content[[:space:]]*=" || true)

# Report violations
if [[ $violation_count -gt 0 ]]; then
  error_msg="NotateDoc v1 schema validation warnings ($violation_count):\n"
  error_msg="${error_msg}${violations}"
  error_msg="${error_msg}Block content must follow the canonical NotateDoc v1 schema.\n"
  error_msg="${error_msg}See: docs/foundational/backend_contract.md#canonical-content-schema-notatedoc-v1"
  echo -e "$error_msg" >&2
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
