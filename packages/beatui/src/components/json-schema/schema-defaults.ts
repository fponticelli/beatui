/**
 * JSON Schema Default Value Extraction
 *
 * Utilities to recursively extract default values from JSON Schema definitions.
 * Priority: `default` property -> first item of `examples` array -> undefined
 */

import type { JSONSchema, JSONSchemaDefinition } from './schema-types'

/**
 * Extract default values from a JSON Schema definition.
 *
 * Recursively walks the schema and builds an object containing all defined defaults.
 * For object types, extracts defaults from nested properties.
 * Arrays are NOT auto-populated (returns undefined for array types).
 *
 * @param schema - The JSON Schema to extract defaults from
 * @returns The extracted default value, or undefined if none found
 *
 * @example
 * ```typescript
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', default: 'John' },
 *     settings: {
 *       type: 'object',
 *       properties: {
 *         theme: { type: 'string', default: 'dark' },
 *         notifications: { type: 'boolean', default: true }
 *       }
 *     }
 *   }
 * }
 * const defaults = extractSchemaDefaults(schema)
 * // { name: 'John', settings: { theme: 'dark', notifications: true } }
 * ```
 */
export function extractSchemaDefaults(schema: JSONSchemaDefinition): unknown {
  // Handle boolean schemas
  if (typeof schema === 'boolean') {
    return undefined
  }

  return extractFromSchema(schema)
}

/**
 * Internal extraction logic for non-boolean schemas
 */
function extractFromSchema(schema: JSONSchema): unknown {
  // Priority 1: Use explicit default if defined
  if (schema.default !== undefined) {
    return schema.default
  }

  // Priority 2: Use first example if available
  if (Array.isArray(schema.examples) && schema.examples.length > 0) {
    return schema.examples[0]
  }

  // For objects, recursively extract property defaults
  if (isObjectType(schema) && schema.properties) {
    const result: Record<string, unknown> = {}
    let hasDefaults = false

    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const value = extractSchemaDefaults(propSchema)
      if (value !== undefined) {
        result[key] = value
        hasDefaults = true
      }
    }

    // Only return the object if we found at least one default
    return hasDefaults ? result : undefined
  }

  // Handle allOf - merge defaults from all schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
    const merged: Record<string, unknown> = {}
    let hasDefaults = false

    for (const subSchema of schema.allOf) {
      const subDefaults = extractSchemaDefaults(subSchema)
      if (
        subDefaults !== undefined &&
        typeof subDefaults === 'object' &&
        subDefaults !== null
      ) {
        Object.assign(merged, subDefaults)
        hasDefaults = true
      }
    }

    return hasDefaults ? merged : undefined
  }

  // Handle oneOf/anyOf - use defaults from the first schema that has them
  const compositeSchemas = schema.oneOf ?? schema.anyOf
  if (compositeSchemas && Array.isArray(compositeSchemas)) {
    for (const subSchema of compositeSchemas) {
      const subDefaults = extractSchemaDefaults(subSchema)
      if (subDefaults !== undefined) {
        return subDefaults
      }
    }
  }

  // Arrays are NOT auto-populated
  // (users should explicitly add items)
  if (isArrayType(schema)) {
    return undefined
  }

  // No default found for primitives without explicit default
  return undefined
}

/**
 * Check if schema has object type
 */
function isObjectType(schema: JSONSchema): boolean {
  if (schema.type === 'object') return true
  if (Array.isArray(schema.type) && schema.type.includes('object')) return true
  // Infer object type from properties
  if (schema.properties !== undefined) return true
  return false
}

/**
 * Check if schema has array type
 */
function isArrayType(schema: JSONSchema): boolean {
  if (schema.type === 'array') return true
  if (Array.isArray(schema.type) && schema.type.includes('array')) return true
  return false
}
