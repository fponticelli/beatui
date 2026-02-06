/**
 * JSON Structure Default Value Extraction
 *
 * Utilities to recursively extract default values from JSON Structure schema definitions.
 * Priority order:
 * 1. Explicit `default` property (highest)
 * 2. First item of `examples` array
 * 3. `const` value
 * 4. First `enum` value
 * 5. Smart type-based defaults (computed)
 */

import type { JSONStructureSchema, TypeDefinition } from './structure-types'
import { isObjectTypeDefinition, isTypeReference } from './structure-types'
import { resolveRef } from './ref-utils'

/**
 * Extract default values from a JSON Structure schema.
 *
 * Recursively walks the schema and builds an object containing all defined defaults.
 * For object types, extracts defaults only for required properties.
 * For nullable types (union with null), returns null.
 * For arrays/sets with minItems, generates the minimum required items.
 *
 * @param schema - The JSON Structure schema
 * @returns The extracted default value, or undefined if none found
 *
 * @example
 * ```typescript
 * const schema = {
 *   $schema: 'https://json-structure.org/draft/2024-12/schema',
 *   $id: 'example',
 *   name: 'Example',
 *   $root: 'Root',
 *   definitions: {
 *     Root: {
 *       type: 'object',
 *       properties: {
 *         name: { type: 'string' },
 *         age: { type: 'int32', minimum: 0, maximum: 120 }
 *       },
 *       required: ['name', 'age']
 *     }
 *   }
 * }
 * const defaults = extractStructureDefaults(schema)
 * // { name: '', age: 60 }  // only required props, smart defaults
 * ```
 */
export function extractStructureDefaults(schema: JSONStructureSchema): unknown {
  // Get the root definition - either the schema itself or a referenced $root
  let rootDefinition: TypeDefinition = schema

  if (schema.$root) {
    const resolved = resolveRef(schema.$root, schema)
    if (resolved) {
      rootDefinition = resolved
    }
  }

  return extractFromDefinition(rootDefinition, schema, new Set())
}

/**
 * Extract defaults from a type definition
 */
function extractFromDefinition(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): unknown {
  // Handle $ref in type specifier
  if (definition.type && isTypeReference(definition.type)) {
    const refPath = definition.type.$ref

    // Check for circular reference
    if (visited.has(refPath)) {
      return undefined
    }

    visited.add(refPath)
    try {
      const resolved = resolveRef(refPath, schema)

      if (resolved) {
        // Merge resolved definition with local overrides (local takes precedence)
        const mergedDef: TypeDefinition = {
          ...resolved,
          ...definition,
          type: resolved.type, // Use resolved type, not the ref
        }
        return extractFromDefinition(mergedDef, schema, visited)
      }

      return undefined
    } finally {
      visited.delete(refPath)
    }
  }

  // Priority 1: Use explicit default if defined
  if (definition.default !== undefined) {
    return definition.default
  }

  // Priority 2: Use first example if available
  if (Array.isArray(definition.examples) && definition.examples.length > 0) {
    return definition.examples[0]
  }

  // Priority 3: Use const value
  if ('const' in definition && definition.const !== undefined) {
    return definition.const
  }

  // Priority 4: Use first enum value
  if (
    'enum' in definition &&
    Array.isArray(definition.enum) &&
    definition.enum.length > 0
  ) {
    return definition.enum[0]
  }

  // Check for nullable type - null takes priority for nullable types
  if (isNullable(definition)) {
    return null
  }

  // Priority 5: Smart type-based defaults
  return generateSmartDefault(definition, schema, visited)
}

/**
 * Generate smart defaults based on type and constraints
 */
function generateSmartDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): unknown {
  const type = getPrimaryType(definition)

  // Handle object types
  if (isObjectTypeDefinition(definition)) {
    return generateObjectDefault(definition, schema, visited)
  }

  // Handle choice types
  if (type === 'choice' && 'choices' in definition) {
    return generateChoiceDefault(definition, schema, visited)
  }

  // Handle tuple types
  if (type === 'tuple' && 'tuple' in definition && 'properties' in definition) {
    return generateTupleDefault(definition, schema, visited)
  }

  // Handle array types
  if (type === 'array') {
    return generateArrayDefault(definition, schema, visited)
  }

  // Handle set types
  if (type === 'set') {
    return generateSetDefault(definition, schema, visited)
  }

  // Handle map types
  if (type === 'map') {
    return {}
  }

  // Handle string types
  if (type === 'string') {
    return generateStringDefault(definition)
  }

  // Handle integer types
  if (isIntegerType(type)) {
    return generateIntegerDefault(definition)
  }

  // Handle float types
  if (isFloatType(type)) {
    return generateFloatDefault(definition)
  }

  // Handle boolean
  if (type === 'boolean') {
    return false
  }

  // Handle null
  if (type === 'null') {
    return null
  }

  // Handle temporal types
  if (isTemporalType(type)) {
    return generateTemporalDefault(type)
  }

  // Handle special types
  if (type === 'uuid') {
    return ''
  }

  if (type === 'uri' || type === 'uri-reference') {
    return ''
  }

  if (type === 'binary' || type === 'bytes') {
    return ''
  }

  return undefined
}

/**
 * Normalize required array - handles both string[] and string[][] formats
 */
function normalizeRequired(
  required: string[] | string[][] | undefined
): Set<string> {
  if (!required || required.length === 0) {
    return new Set()
  }

  // Check if it's string[][] (array of arrays)
  if (Array.isArray(required[0])) {
    // Flatten and extract all required keys
    const flattened = (required as string[][]).flat()
    return new Set(flattened)
  }

  // It's string[]
  return new Set(required as string[])
}

/**
 * Generate default for object types - only required properties
 */
function generateObjectDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): Record<string, unknown> {
  if (!isObjectTypeDefinition(definition)) {
    return {}
  }

  const required = normalizeRequired(definition.required)
  const result: Record<string, unknown> = {}

  // Only populate required properties
  for (const [key, propDef] of Object.entries(definition.properties)) {
    if (!required.has(key)) {
      continue // Skip non-required properties
    }

    // Handle property with $ref type
    if (propDef.type && isTypeReference(propDef.type)) {
      const refPath = propDef.type.$ref

      // Skip circular references
      if (visited.has(refPath)) {
        continue
      }

      visited.add(refPath)
      try {
        const resolved = resolveRef(refPath, schema)

        if (resolved) {
          const resolvedProp: TypeDefinition = {
            ...resolved,
            ...propDef,
            type: resolved.type,
          }
          const value = extractFromDefinition(resolvedProp, schema, visited)
          if (value !== undefined) {
            result[key] = value
          }
        }
      } finally {
        visited.delete(refPath)
      }
    } else {
      // Non-ref property - process directly
      const value = extractFromDefinition(propDef, schema, visited)
      if (value !== undefined) {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * Generate default for choice types
 */
function generateChoiceDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): unknown {
  if (!('choices' in definition)) {
    return undefined
  }

  const choices = definition.choices as Record<string, TypeDefinition>
  const choiceKeys = Object.keys(choices)

  if (choiceKeys.length === 0) {
    return undefined
  }

  const firstKey = choiceKeys[0]
  const firstChoice = choices[firstKey]

  // If there's a selector, generate discriminated union format
  if ('selector' in definition && definition.selector) {
    const selector = definition.selector as string
    const choiceDefaults = extractFromDefinition(firstChoice, schema, visited)

    if (typeof choiceDefaults === 'object' && choiceDefaults !== null) {
      return {
        [selector]: firstKey,
        ...choiceDefaults,
      }
    }

    return {
      [selector]: firstKey,
    }
  }

  // Tagged union format
  const choiceValue = extractFromDefinition(firstChoice, schema, visited)
  return { [firstKey]: choiceValue }
}

/**
 * Generate default for tuple types
 */
function generateTupleDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): Record<string, unknown> {
  if (!('tuple' in definition) || !('properties' in definition)) {
    return {}
  }

  const tupleOrder = (definition as { tuple: string[] }).tuple
  const properties = (
    definition as { properties: Record<string, TypeDefinition> }
  ).properties
  const required = new Set(
    (definition as { required?: string[] }).required ?? tupleOrder
  ) // Tuples typically require all fields
  const result: Record<string, unknown> = {}

  for (const key of tupleOrder) {
    if (!required.has(key)) {
      continue
    }

    const propDef = properties[key]
    if (propDef) {
      const value = extractFromDefinition(propDef, schema, visited)
      if (value !== undefined) {
        result[key] = value
      }
    }
  }

  return result
}

/**
 * Generate default for array types
 */
function generateArrayDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): unknown[] {
  const minItems =
    (('minItems' in definition ? definition.minItems : 0) as number) ?? 0

  if (minItems === 0) {
    return []
  }

  // Generate minimum required items
  const items =
    'items' in definition ? (definition.items as TypeDefinition) : undefined
  if (!items) {
    return Array(minItems).fill(null)
  }

  const itemDefault = extractFromDefinition(items, schema, visited)
  return Array(minItems).fill(itemDefault ?? null)
}

/**
 * Generate default for set types
 */
function generateSetDefault(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  visited: Set<string>
): unknown[] {
  const minItems =
    (('minItems' in definition ? definition.minItems : 0) as number) ?? 0

  if (minItems === 0) {
    return []
  }

  const items =
    'items' in definition ? (definition.items as TypeDefinition) : undefined
  if (!items) {
    return Array(minItems).fill(null)
  }

  const itemDefault = extractFromDefinition(items, schema, visited)
  return Array(minItems).fill(itemDefault ?? null)
}

/**
 * Generate default for string types
 */
function generateStringDefault(definition: TypeDefinition): string {
  // Handle format-specific defaults
  const format = 'format' in definition ? definition.format : undefined

  switch (format) {
    case 'date':
      return getCurrentDate()

    case 'date-time':
      return getCurrentDateTime()

    case 'time':
      return '00:00:00'

    case 'email':
    case 'uri':
    case 'uri-reference':
    case 'uuid':
    default:
      // Return empty string (even if minLength would make it invalid)
      return ''
  }
}

/**
 * Generate default for integer types based on constraints
 */
function generateIntegerDefault(definition: TypeDefinition): number | bigint {
  const type = getPrimaryType(definition)
  const useBigInt =
    type === 'int64' ||
    type === 'uint64' ||
    type === 'int128' ||
    type === 'uint128'

  // Get bounds
  let min: number | undefined =
    'minimum' in definition ? (definition.minimum as number) : undefined
  let max: number | undefined =
    'maximum' in definition ? (definition.maximum as number) : undefined

  // Handle exclusive bounds
  const excMin =
    'exclusiveMinimum' in definition
      ? (definition.exclusiveMinimum as number)
      : undefined
  const excMax =
    'exclusiveMaximum' in definition
      ? (definition.exclusiveMaximum as number)
      : undefined

  if (excMin !== undefined) {
    min = excMin + 1
  }

  if (excMax !== undefined) {
    max = excMax - 1
  }

  // Compute default value
  let value: number

  if (min !== undefined && max !== undefined) {
    // Both bounds - use midpoint
    value = Math.round((min + max) / 2)
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
  const step =
    'multipleOf' in definition ? (definition.multipleOf as number) : undefined
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

  return useBigInt ? BigInt(Math.round(value)) : Math.round(value)
}

/**
 * Generate default for float types based on constraints
 */
function generateFloatDefault(definition: TypeDefinition): number {
  // Get bounds
  let min: number | undefined =
    'minimum' in definition ? (definition.minimum as number) : undefined
  let max: number | undefined =
    'maximum' in definition ? (definition.maximum as number) : undefined

  // Handle exclusive bounds
  const excMin =
    'exclusiveMinimum' in definition
      ? (definition.exclusiveMinimum as number)
      : undefined
  const excMax =
    'exclusiveMaximum' in definition
      ? (definition.exclusiveMaximum as number)
      : undefined
  const step =
    'multipleOf' in definition ? (definition.multipleOf as number) : 0.001

  if (excMin !== undefined) {
    min = excMin + step
  }

  if (excMax !== undefined) {
    max = excMax - step
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
  const multipleOf =
    'multipleOf' in definition ? (definition.multipleOf as number) : undefined
  if (multipleOf !== undefined && multipleOf > 0) {
    value = Math.round(value / multipleOf) * multipleOf

    // Ensure still within bounds after rounding
    if (min !== undefined && value < min) {
      value = Math.ceil(min / multipleOf) * multipleOf
    }
    if (max !== undefined && value > max) {
      value = Math.floor(max / multipleOf) * multipleOf
    }
  }

  return value
}

/**
 * Generate default for temporal types
 */
function generateTemporalDefault(type: string | undefined): string {
  switch (type) {
    case 'date':
      return getCurrentDate()

    case 'time':
      return '00:00:00'

    case 'datetime':
      return getCurrentDateTime()

    case 'duration':
      return 'PT0S'

    default:
      return ''
  }
}

/**
 * Check if schema type is nullable (union with null)
 */
function isNullable(definition: TypeDefinition): boolean {
  if (Array.isArray(definition.type)) {
    return definition.type.some(t =>
      typeof t === 'string' ? t === 'null' : false
    )
  }
  return false
}

/**
 * Get the primary (non-null) type from definition
 */
function getPrimaryType(definition: TypeDefinition): string | undefined {
  const type = definition.type

  if (typeof type === 'string') {
    return type
  }

  if (Array.isArray(type)) {
    // Return first non-null type
    for (const t of type) {
      if (typeof t === 'string' && t !== 'null') {
        return t
      }
    }
  }

  return undefined
}

/**
 * Check if type is an integer type
 */
function isIntegerType(type: string | undefined): boolean {
  if (!type) return false
  return [
    'int8',
    'int16',
    'int32',
    'int64',
    'int128',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
  ].includes(type)
}

/**
 * Check if type is a float type
 */
function isFloatType(type: string | undefined): boolean {
  if (!type) return false
  return ['float', 'double', 'decimal'].includes(type)
}

/**
 * Check if type is a temporal type
 */
function isTemporalType(type: string | undefined): boolean {
  if (!type) return false
  return ['date', 'time', 'datetime', 'duration'].includes(type)
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
