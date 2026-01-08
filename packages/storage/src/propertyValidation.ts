/**
 * Property validation — validates object properties against type schemas.
 *
 * This module validates that an object's properties conform to its type's schema.
 * Validation is performed when creating or updating objects.
 */

import type { TypeSchema, PropertyDefinition } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { getResolvedSchema } from './objectTypeService.js';

// ============================================================================
// Validation Result Types
// ============================================================================

export interface PropertyValidationError {
  propertyKey: string;
  message: string;
  expected?: string;
  actual?: string;
}

export interface PropertyValidationResult {
  valid: boolean;
  errors: PropertyValidationError[];
}

// ============================================================================
// Type Validators
// ============================================================================

/**
 * Validate a single property value against its definition.
 */
function validatePropertyValue(
  key: string,
  value: unknown,
  definition: PropertyDefinition
): PropertyValidationError | null {
  // Handle null/undefined for optional properties
  if (value === null || value === undefined) {
    if (definition.required) {
      return {
        propertyKey: key,
        message: `Required property '${key}' is missing`,
      };
    }
    return null; // Optional and not provided - valid
  }

  // Type-specific validation
  switch (definition.type) {
    case 'text':
    case 'richtext':
      if (typeof value !== 'string') {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a string`,
          expected: 'string',
          actual: typeof value,
        };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a number`,
          expected: 'number',
          actual: typeof value,
        };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a boolean`,
          expected: 'boolean',
          actual: typeof value,
        };
      }
      break;

    case 'date':
      // Dates are stored as ISO date strings (YYYY-MM-DD)
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a date string (YYYY-MM-DD)`,
          expected: 'YYYY-MM-DD',
          actual: String(value),
        };
      }
      break;

    case 'datetime':
      // Datetimes are stored as ISO datetime strings
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be an ISO datetime string`,
          expected: 'ISO datetime',
          actual: String(value),
        };
      }
      break;

    case 'select':
      if (typeof value !== 'string') {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a string`,
          expected: 'string',
          actual: typeof value,
        };
      }
      // Validate against options if defined
      if (definition.options && definition.options.length > 0) {
        if (!definition.options.includes(value)) {
          return {
            propertyKey: key,
            message: `Property '${key}' must be one of: ${definition.options.join(', ')}`,
            expected: definition.options.join(' | '),
            actual: value,
          };
        }
      }
      break;

    case 'multiselect':
      if (!Array.isArray(value)) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be an array`,
          expected: 'array',
          actual: typeof value,
        };
      }
      // Validate each value against options if defined
      if (definition.options && definition.options.length > 0) {
        for (const item of value) {
          if (typeof item !== 'string') {
            return {
              propertyKey: key,
              message: `Property '${key}' array items must be strings`,
              expected: 'string[]',
              actual: typeof item,
            };
          }
          if (!definition.options.includes(item)) {
            return {
              propertyKey: key,
              message: `Property '${key}' contains invalid option: ${item}`,
              expected: definition.options.join(' | '),
              actual: item,
            };
          }
        }
      }
      break;

    case 'ref':
      // Single reference - stored as object ID (ULID)
      if (typeof value !== 'string' || value.length !== 26) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be a valid object ID (ULID)`,
          expected: 'ULID (26 chars)',
          actual: typeof value === 'string' ? `string(${value.length})` : typeof value,
        };
      }
      break;

    case 'refs':
      // Multiple references - array of object IDs
      if (!Array.isArray(value)) {
        return {
          propertyKey: key,
          message: `Property '${key}' must be an array of object IDs`,
          expected: 'array',
          actual: typeof value,
        };
      }
      for (const item of value) {
        if (typeof item !== 'string' || item.length !== 26) {
          return {
            propertyKey: key,
            message: `Property '${key}' contains invalid object ID`,
            expected: 'ULID (26 chars)',
            actual: typeof item === 'string' ? `string(${item.length})` : typeof item,
          };
        }
      }
      break;

    default: {
      // Exhaustive check
      const _exhaustive: never = definition.type;
      return {
        propertyKey: key,
        message: `Unknown property type: ${_exhaustive}`,
      };
    }
  }

  return null;
}

// ============================================================================
// Main Validation Functions
// ============================================================================

/**
 * Validate properties against a type schema.
 *
 * @param properties - The properties object to validate (or null/undefined)
 * @param schema - The type schema to validate against (or null for no schema)
 * @returns Validation result with any errors
 */
export function validateProperties(
  properties: Record<string, unknown> | null | undefined,
  schema: TypeSchema | null
): PropertyValidationResult {
  const errors: PropertyValidationError[] = [];

  // If no schema, any properties are valid (or no properties)
  if (!schema || !schema.properties || schema.properties.length === 0) {
    return { valid: true, errors: [] };
  }

  const props = properties ?? {};

  // Validate each property in the schema
  for (const definition of schema.properties) {
    const value = props[definition.key];
    const error = validatePropertyValue(definition.key, value, definition);
    if (error) {
      errors.push(error);
    }
  }

  // Check for unknown properties (optional - could be lenient)
  // For now, we allow extra properties that aren't in the schema

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default values for a type schema's properties.
 */
export function getDefaultProperties(schema: TypeSchema | null): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  if (!schema || !schema.properties) {
    return defaults;
  }

  for (const definition of schema.properties) {
    if (definition.defaultValue !== undefined) {
      defaults[definition.key] = definition.defaultValue;
    }
  }

  return defaults;
}

/**
 * Merge default values into properties, filling in missing required fields.
 */
export function mergeWithDefaults(
  properties: Record<string, unknown> | null | undefined,
  schema: TypeSchema | null
): Record<string, unknown> {
  const defaults = getDefaultProperties(schema);
  const props = properties ?? {};

  return { ...defaults, ...props };
}

/**
 * Validate properties against a type's resolved schema (including inherited properties).
 *
 * This function uses getResolvedSchema to merge parent and child properties,
 * then validates the provided properties against the complete schema.
 *
 * @param db - Database connection
 * @param typeId - The object type ID to validate against
 * @param properties - The properties object to validate
 * @returns Validation result with any errors
 */
export function validatePropertiesForType(
  db: TypenoteDb,
  typeId: string,
  properties: Record<string, unknown> | null | undefined
): PropertyValidationResult {
  const resolved = getResolvedSchema(db, typeId);

  // Convert resolved properties to TypeSchema format for validateProperties
  const schema: TypeSchema = {
    properties: resolved.properties,
  };

  return validateProperties(properties, schema);
}
