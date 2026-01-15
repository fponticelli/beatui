/**
 * $extends Inheritance Utilities for JSON Structure
 *
 * Handles resolution of $extends inheritance within JSON Structure schemas.
 */

import type {
  JSONStructureSchema,
  TypeDefinition,
  ObjectTypeDefinition,
} from './structure-types'
import { isObjectTypeDefinition } from './structure-types'
import { resolveRef, RefResolver, createRefResolver } from './ref-utils'

/**
 * Result of resolving inheritance
 */
export interface InheritanceResult {
  /** The merged type definition with all inherited properties */
  merged: TypeDefinition
  /** Chain of base types (from most base to most derived) */
  inheritanceChain: string[]
  /** Any errors encountered during resolution */
  errors: InheritanceError[]
}

export interface InheritanceError {
  path: string
  message: string
}

/**
 * Resolve $extends for a type definition
 *
 * Properties are merged with derived type taking precedence over base types.
 * For multiple inheritance, types are processed left-to-right with later
 * types taking precedence.
 */
export function resolveExtends(
  definition: TypeDefinition,
  schema: JSONStructureSchema,
  _refResolver?: RefResolver
): InheritanceResult {
  // Note: _refResolver is provided for future caching but not currently used
  const inheritanceChain: string[] = []
  const errors: InheritanceError[] = []

  // If no $extends, return as-is
  if (!definition.$extends) {
    return { merged: definition, inheritanceChain, errors }
  }

  // Normalize $extends to array
  const baseRefs = Array.isArray(definition.$extends)
    ? definition.$extends
    : [definition.$extends]

  // Track visited to detect circular inheritance
  const visited = new Set<string>()

  // Recursively collect all base definitions
  const collectBases = (refs: string[], depth = 0): TypeDefinition[] => {
    if (depth > 100) {
      errors.push({
        path: refs.join(' -> '),
        message: 'Maximum inheritance depth exceeded',
      })
      return []
    }

    const bases: TypeDefinition[] = []

    for (const ref of refs) {
      if (visited.has(ref)) {
        errors.push({
          path: ref,
          message: `Circular inheritance detected: ${ref}`,
        })
        continue
      }

      visited.add(ref)
      inheritanceChain.push(ref)

      const baseDefinition = resolveRef(ref, schema)
      if (!baseDefinition) {
        errors.push({
          path: ref,
          message: `Failed to resolve base type: ${ref}`,
        })
        continue
      }

      // Recursively resolve base's $extends first
      if (baseDefinition.$extends) {
        const baseExtends = Array.isArray(baseDefinition.$extends)
          ? baseDefinition.$extends
          : [baseDefinition.$extends]
        const nestedBases = collectBases(baseExtends, depth + 1)
        bases.push(...nestedBases)
      }

      bases.push(baseDefinition)
      visited.delete(ref)
    }

    return bases
  }

  const bases = collectBases(baseRefs)

  // Merge all bases with derived (derived takes precedence)
  const merged = mergeBases(bases, definition)

  return { merged, inheritanceChain, errors }
}

/**
 * Merge base definitions with derived definition
 *
 * For object types, properties are merged with later definitions
 * taking precedence. Required arrays are concatenated and deduplicated.
 */
function mergeBases(
  bases: TypeDefinition[],
  derived: TypeDefinition
): TypeDefinition {
  if (bases.length === 0) {
    return derived
  }

  // Start with the first base
  let merged = { ...bases[0] }

  // Merge subsequent bases
  for (let i = 1; i < bases.length; i++) {
    merged = mergeTwo(merged, bases[i])
  }

  // Merge with derived (derived takes precedence)
  merged = mergeTwo(merged, derived)

  // Remove $extends from the result since it's been resolved
  const { $extends: _extends, ...rest } = merged
  return rest as TypeDefinition
}

/**
 * Merge two type definitions
 */
function mergeTwo(
  base: TypeDefinition,
  derived: TypeDefinition
): TypeDefinition {
  // Handle object types specially to merge properties
  if (isObjectTypeDefinition(base) && isObjectTypeDefinition(derived)) {
    return mergeObjectTypes(base, derived)
  }

  // For non-object types, derived simply overrides base
  return { ...base, ...derived }
}

/**
 * Merge two object type definitions
 */
function mergeObjectTypes(
  base: ObjectTypeDefinition,
  derived: ObjectTypeDefinition
): ObjectTypeDefinition {
  // Merge properties (derived takes precedence)
  const properties = {
    ...(base.properties ?? {}),
    ...(derived.properties ?? {}),
  }

  // Merge required arrays
  const baseRequired = normalizeRequired(base.required)
  const derivedRequired = normalizeRequired(derived.required)
  const required = deduplicateRequired([...baseRequired, ...derivedRequired])

  // Merged object
  const merged: ObjectTypeDefinition = {
    ...base,
    ...derived,
    type: 'object',
    properties,
  }

  // Only include required if non-empty
  if (required.length > 0) {
    merged.required = required
  }

  return merged
}

/**
 * Normalize required to flat string array
 * JSON Structure allows required to be string[] or string[][] (for groups)
 */
function normalizeRequired(
  required: string[] | string[][] | undefined
): string[] {
  if (!required) return []
  if (required.length === 0) return []

  // Check if it's a grouped format (string[][])
  if (Array.isArray(required[0])) {
    return (required as string[][]).flat()
  }

  return required as string[]
}

/**
 * Deduplicate required array
 */
function deduplicateRequired(required: string[]): string[] {
  return [...new Set(required)]
}

/**
 * Create an extends resolver for a schema (convenience function)
 */
export function createExtendsResolver(schema: JSONStructureSchema) {
  const refResolver = createRefResolver(schema)

  return {
    resolve: (definition: TypeDefinition): InheritanceResult => {
      refResolver.reset()
      return resolveExtends(definition, schema, refResolver)
    },
  }
}
