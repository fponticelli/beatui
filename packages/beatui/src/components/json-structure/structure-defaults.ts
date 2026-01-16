/**
 * JSON Structure Default Value Extraction
 *
 * Utilities to recursively extract default values from JSON Structure schema definitions.
 * Priority: `default` property -> first item of `examples` array -> undefined
 */

import type { JSONStructureSchema, TypeDefinition } from './structure-types'
import { isObjectTypeDefinition, isTypeReference } from './structure-types'
import { resolveRef } from './ref-utils'

/**
 * Extract default values from a JSON Structure schema.
 *
 * Recursively walks the schema and builds an object containing all defined defaults.
 * For object types, extracts defaults from nested properties.
 * Arrays/sets are NOT auto-populated (returns undefined for array types).
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
 * const defaults = extractStructureDefaults(schema)
 * // { name: 'John', settings: { theme: 'dark', notifications: true } }
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
    const resolved = resolveRef(refPath, schema)

    if (resolved) {
      // Merge resolved definition with local overrides (local takes precedence)
      const mergedDef: TypeDefinition = {
        ...resolved,
        ...definition,
        type: resolved.type, // Use resolved type, not the ref
      }
      const result = extractFromDefinition(mergedDef, schema, visited)
      visited.delete(refPath)
      return result
    }

    visited.delete(refPath)
    return undefined
  }

  // Priority 1: Use explicit default if defined
  if (definition.default !== undefined) {
    return definition.default
  }

  // Priority 2: Use first example if available
  if (Array.isArray(definition.examples) && definition.examples.length > 0) {
    return definition.examples[0]
  }

  // For objects, recursively extract property defaults
  if (isObjectTypeDefinition(definition)) {
    const result: Record<string, unknown> = {}
    let hasDefaults = false

    for (const [key, propDef] of Object.entries(definition.properties)) {
      // Handle property with $ref type
      if (propDef.type && isTypeReference(propDef.type)) {
        const refPath = propDef.type.$ref

        // Skip circular references
        if (visited.has(refPath)) {
          continue
        }

        // Mark as visited before resolving
        visited.add(refPath)
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
            hasDefaults = true
          }
        }

        // Unmark after processing
        visited.delete(refPath)
      } else {
        // Non-ref property - process directly
        const value = extractFromDefinition(propDef, schema, visited)
        if (value !== undefined) {
          result[key] = value
          hasDefaults = true
        }
      }
    }

    return hasDefaults ? result : undefined
  }

  // Handle choice types - use default from first choice if available
  if (definition.type === 'choice' && 'choices' in definition) {
    const choices = definition.choices as Record<string, TypeDefinition>
    for (const choiceDef of Object.values(choices)) {
      const choiceDefault = extractFromDefinition(choiceDef, schema, visited)
      if (choiceDefault !== undefined) {
        return choiceDefault
      }
    }
  }

  // Handle tuple types
  if (
    definition.type === 'tuple' &&
    'properties' in definition &&
    'tuple' in definition
  ) {
    const tupleOrder = (definition as { tuple: string[] }).tuple
    const properties = (
      definition as { properties: Record<string, TypeDefinition> }
    ).properties
    const result: Record<string, unknown> = {}
    let hasDefaults = false

    for (const key of tupleOrder) {
      const propDef = properties[key]
      if (propDef) {
        const value = extractFromDefinition(propDef, schema, visited)
        if (value !== undefined) {
          result[key] = value
          hasDefaults = true
        }
      }
    }

    return hasDefaults ? result : undefined
  }

  // Arrays, sets, and maps are NOT auto-populated
  // (users should explicitly add items)
  if (
    definition.type === 'array' ||
    definition.type === 'set' ||
    definition.type === 'map'
  ) {
    return undefined
  }

  // No default found for primitives without explicit default
  return undefined
}
