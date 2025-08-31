import type { JSONSchema, JSONSchemaDefinition } from './schema-context'
import { jsonPointerToSegments } from './ajv-utils'

/**
 * Resolve a $ref within the provided definition against the given root schema.
 * - Supports in-document JSON Pointer refs only (e.g. "#/$defs/Address").
 * - If siblings are present next to $ref, they are shallow-merged over the resolved target.
 * - Resolves chains of $ref until a non-$ref definition is reached or a cycle is detected.
 */
export function resolveRef(
  def: JSONSchema,
  root: JSONSchemaDefinition
): JSONSchema {
  let current: JSONSchema = def
  const seen = new Set<string>()

  while (isRef(current)) {
    const ref = current.$ref!
    // Only support in-document refs (starting with '#') for now
    if (!ref.startsWith('#')) return current

    if (seen.has(ref)) {
      // Cycle detected; return as-is to avoid infinite loop
      return current
    }
    seen.add(ref)

    const target = getFromPointer(root, ref)
    if (!isObject(target)) {
      // Unresolvable ref; return as-is
      return current
    }

    // Merge: resolved target + siblings (without $ref) where siblings override
    const { $ref: _omit, ...siblings } = current as { $ref?: string }
    current = { ...(target as JSONSchema), ...(siblings as JSONSchema) }
  }

  return current
}

function isRef(def: unknown): def is JSONSchema & { $ref: string } {
  return isObject(def) && typeof (def as { $ref?: unknown }).$ref === 'string'
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x != null && !Array.isArray(x)
}

function getFromPointer(root: JSONSchemaDefinition, pointer: string): unknown {
  if (!pointer.startsWith('#')) return undefined
  // Special case: '#'
  if (pointer === '#') return root

  if (typeof root !== 'object' || root == null) return undefined

  const segments = jsonPointerToSegments(pointer)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = root
  for (const seg of segments) {
    if (!isObject(cur) && !Array.isArray(cur)) return undefined
    cur = cur[seg as unknown as keyof typeof cur]
  }
  return cur
}
