/**
 * JSON Schema Default Value Extraction
 *
 * Utilities to recursively extract default values from JSON Schema definitions.
 * Priority order:
 * 1. Explicit `default` property (highest)
 * 2. First item of `examples` array
 * 3. `const` value
 * 4. First `enum` value
 * 5. Smart type-based defaults (computed)
 */

import type { JSONSchema, JSONSchemaDefinition } from './schema-types'

/**
 * Extract default values from a JSON Schema definition.
 *
 * Recursively walks the schema and builds an object containing all defined defaults.
 * For object types, extracts defaults only for required properties.
 * For nullable types (union with null), returns null.
 * For arrays with minItems, generates the minimum required items.
 *
 * @param schema - The JSON Schema to extract defaults from
 * @returns The extracted default value, or undefined if none found
 *
 * @example
 * ```typescript
 * const schema = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'integer', minimum: 0, maximum: 120 },
 *     active: { type: 'boolean' }
 *   },
 *   required: ['name', 'age']
 * }
 * const defaults = extractSchemaDefaults(schema)
 * // { name: '', age: 60 }  // only required props, smart defaults
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

  // Priority 3: Use const value
  if (schema.const !== undefined) {
    return schema.const
  }

  // Priority 4: Use first enum value
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0]
  }

  // Check for nullable type - null takes priority for nullable types
  if (isNullable(schema)) {
    return null
  }

  // Handle allOf - merge defaults from all schemas
  if (schema.allOf && Array.isArray(schema.allOf)) {
    return extractFromAllOf(schema.allOf)
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

  // Priority 5: Smart type-based defaults
  return generateSmartDefault(schema)
}

/**
 * Extract and merge defaults from allOf schemas
 */
function extractFromAllOf(allOfSchemas: JSONSchemaDefinition[]): unknown {
  const merged: Record<string, unknown> = {}
  let hasDefaults = false

  for (const subSchema of allOfSchemas) {
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

/**
 * Generate smart defaults based on type and constraints
 */
function generateSmartDefault(schema: JSONSchema): unknown {
  const type = getPrimaryType(schema)

  switch (type) {
    case 'object':
      return generateObjectDefault(schema)

    case 'array':
      return generateArrayDefault(schema)

    case 'string':
      return generateStringDefault(schema)

    case 'number':
    case 'integer':
      return generateNumberDefault(schema)

    case 'boolean':
      return false

    case 'null':
      return null

    default:
      return undefined
  }
}

/**
 * Generate default for object types - only required properties
 */
function generateObjectDefault(
  schema: JSONSchema
): Record<string, unknown> | undefined {
  if (!schema.properties) {
    return {}
  }

  const required = new Set(schema.required ?? [])
  const result: Record<string, unknown> = {}
  let hasDefaults = false

  // Only populate required properties
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    if (!required.has(key)) {
      continue // Skip non-required properties
    }

    if (typeof propSchema === 'boolean') {
      continue
    }

    const value = extractSchemaDefaults(propSchema)
    if (value !== undefined) {
      result[key] = value
      hasDefaults = true
    }
  }

  // Return empty object if no required properties, or the populated object
  return hasDefaults ? result : {}
}

/**
 * Generate default for array types
 */
function generateArrayDefault(schema: JSONSchema): unknown[] | undefined {
  const minItems = schema.minItems ?? 0

  if (minItems === 0) {
    return []
  }

  // Generate minimum required items
  const items = schema.items
  if (!items || typeof items === 'boolean') {
    // No item schema, generate undefined placeholders
    return Array(minItems).fill(null)
  }

  // Handle tuple schemas (array of schemas)
  if (Array.isArray(items)) {
    return items
      .slice(0, minItems)
      .map(itemSchema => extractSchemaDefaults(itemSchema) ?? null)
  }

  // Single item schema - generate defaults for each required item
  const itemDefault = extractSchemaDefaults(items)
  return Array(minItems).fill(itemDefault ?? null)
}

/**
 * Generate default for string types based on format
 */
function generateStringDefault(schema: JSONSchema): string {
  // Handle format-specific defaults
  switch (schema.format) {
    case 'date':
      return getCurrentDate()

    case 'date-time':
      return getCurrentDateTime()

    case 'time':
      return '00:00:00'

    default:
      // Return empty string (even if minLength would make it invalid)
      return ''
  }
}

/**
 * Generate default for number/integer types based on constraints
 */
function generateNumberDefault(schema: JSONSchema): number {
  const isInteger = schema.type === 'integer'

  // Get bounds
  let min: number | undefined = schema.minimum
  let max: number | undefined = schema.maximum

  // Handle exclusive bounds
  if (schema.exclusiveMinimum !== undefined) {
    const excMin =
      typeof schema.exclusiveMinimum === 'number'
        ? schema.exclusiveMinimum
        : schema.exclusiveMinimum
          ? (min ?? 0)
          : undefined

    if (excMin !== undefined) {
      min = isInteger ? excMin + 1 : excMin + getSmallStep(schema)
    }
  }

  if (schema.exclusiveMaximum !== undefined) {
    const excMax =
      typeof schema.exclusiveMaximum === 'number'
        ? schema.exclusiveMaximum
        : schema.exclusiveMaximum
          ? (max ?? 0)
          : undefined

    if (excMax !== undefined) {
      max = isInteger ? excMax - 1 : excMax - getSmallStep(schema)
    }
  }

  // Compute default value
  let value: number

  if (min !== undefined && max !== undefined) {
    // Both bounds - use midpoint
    value = (min + max) / 2
  } else if (min !== undefined) {
    // Only minimum - use minimum
    value = min
  } else if (max !== undefined) {
    // Only maximum - use 0 if valid, else maximum
    value = 0 <= max ? 0 : max
  } else {
    // No bounds - use 0
    value = 0
  }

  // Round to multipleOf/step if specified
  const step = schema.multipleOf
  if (step !== undefined && step > 0) {
    value = Math.round(value / step) * step

    // Ensure still within bounds after rounding
    if (min !== undefined && value < min) {
      value = Math.ceil(min / step) * step
    }
    if (max !== undefined && value > max) {
      value = Math.floor(max / step) * step
    }
  }

  // Round to integer if needed
  if (isInteger) {
    value = Math.round(value)
  }

  return value
}

/**
 * Get a small step value for floating point adjustments
 */
function getSmallStep(schema: JSONSchema): number {
  if (schema.multipleOf !== undefined) {
    return schema.multipleOf
  }
  return 0.001 // Small epsilon for exclusive bounds
}

/**
 * Check if schema type is nullable (union with null)
 */
function isNullable(schema: JSONSchema): boolean {
  if (Array.isArray(schema.type)) {
    return schema.type.includes('null')
  }
  return false
}

/**
 * Get the primary (non-null) type from schema
 */
function getPrimaryType(schema: JSONSchema): string | undefined {
  if (typeof schema.type === 'string') {
    return schema.type
  }

  if (Array.isArray(schema.type)) {
    // Return first non-null type
    return schema.type.find(t => t !== 'null')
  }

  // Infer type from schema structure
  if (schema.properties !== undefined) {
    return 'object'
  }
  if (schema.items !== undefined) {
    return 'array'
  }

  return undefined
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current datetime in ISO format
 */
function getCurrentDateTime(): string {
  return new Date().toISOString()
}
