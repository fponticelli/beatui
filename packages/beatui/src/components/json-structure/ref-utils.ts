/**
 * $ref Resolution Utilities for JSON Structure
 *
 * Handles resolution of $ref references within JSON Structure schemas.
 */

import type {
  JSONStructureSchema,
  TypeDefinition,
  Namespace,
  TypeReference,
} from './structure-types'
import { isTypeReference, isNamespace, isTypeDefinition } from './structure-types'

/**
 * Parse a $ref path into segments
 * Examples:
 *   "#/definitions/Address" -> ["definitions", "Address"]
 *   "#/definitions/Types/Email" -> ["definitions", "Types", "Email"]
 *   "Address" -> ["definitions", "Address"] (shorthand)
 */
export function parseRefPath(ref: string): string[] {
  // Handle JSON Pointer format
  if (ref.startsWith('#/')) {
    return ref.slice(2).split('/')
  }
  // Handle shorthand format (just the definition name)
  if (!ref.includes('/')) {
    return ['definitions', ref]
  }
  // Handle relative path format
  return ref.split('/')
}

/**
 * Resolve a $ref path to its definition within the schema
 */
export function resolveRefPath(
  schema: JSONStructureSchema,
  segments: string[]
): TypeDefinition | Namespace | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = schema

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = current[segment]
  }

  return current as TypeDefinition | Namespace | undefined
}

/**
 * Resolve a $ref string to its type definition
 */
export function resolveRef(
  ref: string,
  schema: JSONStructureSchema
): TypeDefinition | undefined {
  const segments = parseRefPath(ref)
  const resolved = resolveRefPath(schema, segments)

  if (resolved == null) {
    console.warn(`Failed to resolve $ref: ${ref}`)
    return undefined
  }

  if (isTypeDefinition(resolved)) {
    return resolved
  }

  if (isNamespace(resolved)) {
    console.warn(`$ref "${ref}" points to a namespace, not a type definition`)
    return undefined
  }

  return undefined
}

/**
 * Resolve a TypeReference object to its type definition
 */
export function resolveTypeReference(
  ref: TypeReference,
  schema: JSONStructureSchema
): TypeDefinition | undefined {
  return resolveRef(ref.$ref, schema)
}

/**
 * Check if a definition contains a $ref and resolve it if so
 * Returns the resolved definition merged with any sibling properties
 */
export function resolveDefinitionRef(
  definition: TypeDefinition,
  schema: JSONStructureSchema
): TypeDefinition {
  // Check if the type specifier is a reference
  if (definition.type && isTypeReference(definition.type)) {
    const resolved = resolveTypeReference(definition.type, schema)
    if (resolved) {
      // Merge resolved definition with local properties (local takes precedence)
      const { type: _type, ...localProps } = definition
      return { ...resolved, ...localProps }
    }
  }

  return definition
}

/**
 * Track visited refs to detect circular references
 */
export class RefResolver {
  private readonly schema: JSONStructureSchema
  private readonly visited: Set<string> = new Set()

  constructor(schema: JSONStructureSchema) {
    this.schema = schema
  }

  /**
   * Resolve a reference, tracking visited refs to prevent infinite loops
   */
  resolve(ref: string): TypeDefinition | undefined {
    if (this.visited.has(ref)) {
      console.warn(`Circular reference detected: ${ref}`)
      return undefined
    }

    this.visited.add(ref)

    try {
      const resolved = resolveRef(ref, this.schema)

      // If the resolved definition has another $ref, resolve that too
      if (resolved?.type && isTypeReference(resolved.type)) {
        const nestedResolved = this.resolve(resolved.type.$ref)
        if (nestedResolved) {
          const { type: _type, ...localProps } = resolved
          return { ...nestedResolved, ...localProps }
        }
      }

      return resolved
    } finally {
      this.visited.delete(ref)
    }
  }

  /**
   * Resolve a type definition, handling any $ref in its type specifier
   */
  resolveDefinition(definition: TypeDefinition): TypeDefinition {
    if (definition.type && isTypeReference(definition.type)) {
      const resolved = this.resolve(definition.type.$ref)
      if (resolved) {
        const { type: _type, ...localProps } = definition
        return { ...resolved, ...localProps }
      }
    }
    return definition
  }

  /**
   * Reset the visited tracking (use between independent resolution calls)
   */
  reset(): void {
    this.visited.clear()
  }
}

/**
 * Create a ref resolver for a schema
 */
export function createRefResolver(schema: JSONStructureSchema): RefResolver {
  return new RefResolver(schema)
}
