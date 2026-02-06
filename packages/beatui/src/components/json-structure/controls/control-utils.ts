/**
 * Shared utilities for JSON Structure controls
 */

import type { StructureContext } from '../structure-context'
import type { TypeDefinition } from '../structure-types'

/**
 * Create input wrapper options from context
 * Shared by all control components
 */
export function createInputOptions(ctx: StructureContext) {
  return {
    label: ctx.suppressLabel ? undefined : ctx.label,
    description: ctx.description,
    required: ctx.isRequired,
  }
}

/**
 * Get the default value for a type based on its definition
 * Used when creating new items in arrays, sets, maps, tuples, and objects
 */
export function makeDefaultValue(definition: TypeDefinition): unknown {
  // Use default if provided
  if (definition.default !== undefined) {
    return definition.default
  }

  // Use first example if available
  if (definition.examples && definition.examples.length > 0) {
    return definition.examples[0]
  }

  // Generate empty value based on type
  if (!definition.type) return undefined

  const type = Array.isArray(definition.type)
    ? definition.type[0]
    : definition.type

  if (typeof type === 'object' && '$ref' in type) {
    return undefined // Can't infer value for references
  }

  switch (type) {
    case 'string':
      return ''
    case 'boolean':
      return false
    case 'null':
      return null
    case 'object':
      return {}
    case 'array':
    case 'set':
      return []
    case 'map':
      return {}
    case 'any':
      return undefined
    default:
      // Numeric types
      if (
        type === 'int8' ||
        type === 'int16' ||
        type === 'int32' ||
        type === 'int64' ||
        type === 'int128' ||
        type === 'uint8' ||
        type === 'uint16' ||
        type === 'uint32' ||
        type === 'uint64' ||
        type === 'uint128' ||
        type === 'float' ||
        type === 'double' ||
        type === 'decimal'
      ) {
        return 0
      }
      return undefined
  }
}
