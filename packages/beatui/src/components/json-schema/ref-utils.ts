import type { JSONSchema, JSONSchemaDefinition } from './schema-context'
import { jsonPointerToSegments } from './ajv-utils'

// Caches to speed up in-document $ref resolution
let RESOLVE_CACHE: WeakMap<object, WeakMap<object, JSONSchema>> = new WeakMap()
let POINTER_CACHE: WeakMap<object, Map<string, unknown>> = new WeakMap()

export function clearRefCaches() {
  // Reassign to clear
  RESOLVE_CACHE = new WeakMap<object, WeakMap<object, JSONSchema>>()
  POINTER_CACHE = new WeakMap<object, Map<string, unknown>>()
}

/**
 * Resolve a $ref within the provided definition against the given root schema.
 * - Supports in-document JSON Pointer refs only (e.g. "#/$defs/Address").
 * - If siblings are present next to $ref, they are shallow-merged over the resolved target.
 * - Resolves chains of $ref until a non-$ref definition is reached or a cycle is detected.
 * - Memoized per root/definition identity.
 */
export function resolveRef(
  def: JSONSchema,
  root: JSONSchemaDefinition
): JSONSchema {
  // Fast-path: memoized result for same def/root
  const rootKey =
    typeof root === 'object' && root != null ? (root as object) : null
  if (rootKey != null) {
    const byDef = RESOLVE_CACHE.get(rootKey)
    const cached = byDef?.get(def as object)
    if (cached != null) return cached
  }

  let current: JSONSchema = def
  const seen = new Set<string>()

  while (isRef(current)) {
    const ref = current.$ref!
    if (!ref.startsWith('#')) {
      // Non in-document refs are handled by AJV; keep as-is for now

      console.warn(`resolveRef: external $ref not supported here: ${ref}`)
      break
    }

    if (seen.has(ref)) {
      // Cycle detected; return as-is to avoid infinite loop

      console.warn(
        `resolveRef: cycle detected while resolving in-document $ref chain: ${[...seen, ref].join(' -> ')}`
      )
      break
    }
    seen.add(ref)

    const target = getFromPointerCached(root, ref)
    if (!isObject(target)) {
      // Unresolvable ref

      console.warn(`resolveRef: could not resolve JSON Pointer ${ref}`)
      break
    }

    // Merge: resolved target + siblings (without $ref) where siblings override
    const { $ref: _omit, ...siblings } = current as { $ref?: string }
    current = { ...(target as JSONSchema), ...(siblings as JSONSchema) }
  }

  // Store in cache
  if (rootKey != null) {
    let byDef = RESOLVE_CACHE.get(rootKey)
    if (byDef == null) {
      byDef = new WeakMap<object, JSONSchema>()
      RESOLVE_CACHE.set(rootKey, byDef)
    }
    byDef.set(def as object, current)
  }

  return current
}

function isRef(def: unknown): def is JSONSchema & { $ref: string } {
  return isObject(def) && typeof (def as { $ref?: unknown }).$ref === 'string'
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x != null && !Array.isArray(x)
}

function getFromPointerCached(
  root: JSONSchemaDefinition,
  pointer: string
): unknown {
  if (!pointer.startsWith('#')) return undefined
  if (pointer === '#') return root

  if (typeof root !== 'object' || root == null) return undefined

  const key = root as object
  let map = POINTER_CACHE.get(key)
  if (map == null) {
    map = new Map<string, unknown>()
    POINTER_CACHE.set(key, map)
  }
  const existing = map.get(pointer)
  if (existing !== undefined) return existing

  const segments = jsonPointerToSegments(pointer)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = root
  for (const seg of segments) {
    if (!isObject(cur) && !Array.isArray(cur)) {
      map.set(pointer, undefined)
      return undefined
    }
    cur = cur[seg as unknown as keyof typeof cur]
  }
  map.set(pointer, cur)
  return cur
}
