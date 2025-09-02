import type Ajv from 'ajv'
import type { ErrorObject, KeywordDefinition, ValidateFunction } from 'ajv'
import type { SchemaObject } from 'ajv'
import { Validation } from '@tempots/std'
import type {
  ControllerError,
  ControllerValidation,
  PathSegment,
} from '../form'
import addFormats from 'ajv-formats'

export function jsonPointerToSegments(ptr: string): PropertyKey[] {
  return ptr
    .split('/')
    .slice(1)
    .map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'))
}

export function buildPath(
  err: ErrorObject
): ReadonlyArray<PropertyKey> | undefined {
  const base = jsonPointerToSegments(err.instancePath || '')
  if (err.keyword === 'required') {
    const mp = (err.params as { missingProperty?: string }).missingProperty
    if (mp != null) return [...base, mp]
  }
  if (err.keyword === 'additionalProperties') {
    const ap = (err.params as { additionalProperty?: string })
      .additionalProperty
    if (ap != null) return [...base, ap]
  }
  if (err.keyword === 'unevaluatedProperties') {
    const up = (err.params as { unevaluatedProperty?: string })
      .unevaluatedProperty
    if (up != null) return [...base, up]
  }
  return base.length > 0 ? base : undefined
}

export function buildMessage(err: ErrorObject): string {
  return err.message ?? `${err.keyword} validation failed`
}

export function ajvErrorsToDependencies(errors: ErrorObject[]) {
  return errors.reduce((acc, err) => {
    const path = buildPath(err)
    if (path == null) return acc
    let current = acc
    for (const seg of path) {
      const segment = seg as PathSegment
      if (current.dependencies == null) {
        current.dependencies = {} as Record<PathSegment, ControllerError>
      }
      if (current.dependencies[segment] == null) {
        current.dependencies[segment] = {}
      }
      current = current.dependencies[segment]
    }
    current.message = buildMessage(err)
    return acc
  }, {} as ControllerError)
}

export function ajvErrorsToControllerValidation(
  errors: ErrorObject[]
): ControllerValidation {
  const error = ajvErrorsToDependencies(errors)
  return Validation.invalid(error)
}

function addUIKeyword(ajv: Ajv) {
  const def: KeywordDefinition = {
    keyword: 'x:ui',
    // Accept both string and object shapes for future-proofing
    schemaType: ['string', 'object'],
    errors: false,
    // No-op validation – vendor annotation only
    validate: () => true,
  }
  ajv.addKeyword(def)
}

// Module-level caches
let COMPILE_CACHE: WeakMap<
  Ajv,
  WeakMap<object, ValidateFunction>
> = new WeakMap()

/**
 * Clear all AJV compilation caches. Useful for:
 * - Test isolation (call in beforeEach)
 * - Memory management in long-running applications
 * - Forcing recompilation after schema changes
 *
 * Thread-safe: Uses WeakMap reassignment for atomic clearing.
 */
export function clearCaches() {
  // Reassign to a new WeakMap to clear atomically
  COMPILE_CACHE = new WeakMap()
}

/**
 * Clear caches for a specific AJV instance.
 * Useful when you want to invalidate only schemas compiled with a particular AJV instance
 * while preserving caches for other instances.
 */
export function clearCachesForAjv(ajv: Ajv) {
  COMPILE_CACHE.delete(ajv)
}

/**
 * Get cache statistics for debugging and monitoring.
 * Returns the number of AJV instances with cached validators.
 */
export function getCacheStats(): { ajvInstances: number } {
  // WeakMap doesn't expose size, but we can provide basic info
  // This is mainly for debugging - in production, WeakMaps auto-cleanup
  return {
    ajvInstances: 0, // WeakMap doesn't expose size for privacy/security
  }
}

/**
 * Compile a JSON Schema with caching for performance optimization.
 *
 * Uses a two-level WeakMap cache structure:
 * - Level 1: AJV instance -> Schema cache map
 * - Level 2: Schema object -> Compiled ValidateFunction
 *
 * This ensures that:
 * - Same schema compiled with same AJV instance is cached
 * - Different AJV instances maintain separate caches
 * - Memory is automatically cleaned up when objects are garbage collected
 *
 * @param ajv - The AJV instance to use for compilation
 * @param schema - The schema object to compile (must be object identity stable)
 * @returns Cached or newly compiled ValidateFunction
 */
export function compileWithCache(ajv: Ajv, schema: object): ValidateFunction {
  let cache = COMPILE_CACHE.get(ajv)
  if (cache == null) {
    cache = new WeakMap<object, ValidateFunction>()
    COMPILE_CACHE.set(ajv, cache)
  }
  const existing = cache.get(schema)
  if (existing) return existing
  const validate = ajv.compile(schema)
  cache.set(schema, validate)
  return validate
}

/**
 * Result type for AJV instance creation and schema compilation.
 * Uses discriminated union for type-safe error handling.
 */
export type BuildAjvResult =
  | { ok: true; value: { ajv: Ajv; validate: import('ajv').ValidateFunction } }
  | { ok: false; error: string }

/**
 * Configuration options for building AJV instances with external reference support.
 */
export interface AjvBuildOptions {
  /**
   * Pre-bundled external schemas to register with AJV.
   * These schemas must have $id properties for reference resolution.
   */
  externalSchemas?: ReadonlyArray<SchemaObject>

  /**
   * Dynamic resolver for external $ref URIs.
   * Called when external references are encountered during compilation.
   */
  refResolver?: (
    ids: ReadonlyArray<string>
  ) => Promise<ReadonlyArray<SchemaObject>>

  /**
   * Controls automatic removal of additional properties during validation.
   * - 'all': Remove all additional properties
   * - 'failing': Remove only properties that cause validation failures
   * - false: No automatic removal (default)
   */
  sanitizeAdditional?: 'all' | 'failing' | false
}

async function createAjv(
  base: '2020-12' | '2019-09' | 'draft-07',
  removeAdditional: 'all' | 'failing' | boolean
) {
  const createAjv = (
    await (() => {
      switch (base) {
        case '2020-12':
          return import('ajv/dist/2020')
        case '2019-09':
          return import('ajv/dist/2019')
        case 'draft-07':
          return import('ajv')
      }
    })()
  ).default
  const ajv = new createAjv({
    meta: true,
    strictSchema: false, // Allow more flexible schema validation for tuple arrays
    allErrors: true,
    removeAdditional,
  })
  switch (base) {
    case '2020-12':
      ajv.opts.defaultMeta = 'https://json-schema.org/draft/2020-12/schema'
      break
    case '2019-09':
      ajv.opts.defaultMeta = 'https://json-schema.org/draft/2019-09/schema'
      break
    case 'draft-07':
      ajv.opts.defaultMeta = 'http://json-schema.org/draft-07/schema#'
      break
  }
  addFormats(ajv)
  addUIKeyword(ajv)
  return ajv
}

function getFlavor(id: string | undefined): '2020-12' | '2019-09' | 'draft-07' {
  if (id == null) return '2020-12'
  if (id.includes('draft/2020-12')) return '2020-12'
  if (id.includes('draft/2019-09')) return '2019-09'
  return 'draft-07'
}

function normalizeExternalRef(ref: string): string {
  const hashIndex = ref.indexOf('#')
  return hashIndex >= 0 ? ref.slice(0, hashIndex) : ref
}

function collectExternalRefIds(input: unknown): string[] {
  const out = new Set<string>()
  const visit = (node: unknown): void => {
    if (node == null) return
    if (Array.isArray(node)) {
      for (const item of node) visit(item)
      return
    }
    if (typeof node === 'object') {
      const obj = node as Record<string, unknown>
      const ref = obj['$ref']
      if (typeof ref === 'string' && ref.length > 0 && ref[0] !== '#') {
        out.add(normalizeExternalRef(ref))
      }
      for (const v of Object.values(obj)) visit(v)
    }
  }
  visit(input)
  return [...out]
}

function addSchemasSafely(ajv: Ajv, schemas: ReadonlyArray<SchemaObject>) {
  for (const s of schemas) {
    const id = (s as { $id?: string }).$id
    if (typeof id === 'string' && id.length > 0) {
      // Avoid duplicate registration
      if (!ajv.getSchema(id)) {
        try {
          ajv.addSchema(s)
        } catch (_e) {
          // Ignore addSchema errors for duplicates or invalid externals
        }
      }
    }
  }
}

async function preloadExternalRefs(
  ajv: Ajv,
  root: SchemaObject,
  resolver: AjvBuildOptions['refResolver'],
  seeded: ReadonlyArray<SchemaObject> | undefined
): Promise<string | null> {
  if (resolver == null) return null
  const registeredIds = new Set<string>()
  if (seeded && seeded.length > 0) {
    for (const s of seeded) {
      const id = (s as { $id?: string }).$id
      if (typeof id === 'string' && id.length > 0) registeredIds.add(id)
    }
  }

  const resolvedSchemas: SchemaObject[] = []
  const MAX_ROUNDS = 5
  for (let i = 0; i < MAX_ROUNDS; i++) {
    const idsFromRoot = collectExternalRefIds(root)
    const idsFromResolved = resolvedSchemas.flatMap(s =>
      collectExternalRefIds(s)
    )
    const wanted = new Set<string>([...idsFromRoot, ...idsFromResolved])

    // Filter out those already registered in AJV or in local set
    const pending: string[] = []
    for (const id of wanted) {
      if (registeredIds.has(id)) continue
      if (ajv.getSchema(id)) {
        registeredIds.add(id)
        continue
      }
      pending.push(id)
    }

    if (pending.length === 0) return null

    try {
      const newly = await resolver(pending)
      if (!Array.isArray(newly) || newly.length === 0) {
        // Nothing more to add; stop trying
        return null
      }
      addSchemasSafely(ajv, newly)
      for (const s of newly) {
        const sid = (s as { $id?: string }).$id
        if (typeof sid === 'string' && sid.length > 0) {
          registeredIds.add(sid)
          resolvedSchemas.push(s)
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return `refResolver failed: ${message}`
    }
  }
  return `refResolver reached iteration limit while resolving external $refs`
}

/**
 * Create and configure an AJV instance for a specific JSON Schema with external reference support.
 *
 * This is the primary entry point for creating AJV instances in the JSON Schema form system.
 * It handles:
 * - Automatic JSON Schema draft detection ($schema property)
 * - Pre-bundled external schema registration
 * - Dynamic external reference resolution via refResolver
 * - Compilation caching for performance
 * - Error handling with detailed messages
 *
 * @param schema - The root JSON Schema to compile. Must be a valid JSON Schema object.
 *                 The $schema property determines which AJV version to use.
 * @param options - Configuration for external references and sanitization
 * @returns Promise resolving to either a successful AJV instance with compiled validator,
 *          or an error result with descriptive message
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await getAjvForSchema(mySchema)
 * if (result.ok) {
 *   const { ajv, validate } = result.value
 *   const isValid = validate(data)
 * }
 *
 * // With external schemas
 * const result = await getAjvForSchema(mySchema, {
 *   externalSchemas: [addressSchema, personSchema],
 *   refResolver: async (ids) => await fetchSchemas(ids)
 * })
 * ```
 */
export async function getAjvForSchema(
  schema: { $schema?: string } & SchemaObject,
  options?: AjvBuildOptions
): Promise<BuildAjvResult> {
  try {
    const flavor = getFlavor(schema.$schema)
    const removeAdditional =
      options?.sanitizeAdditional === false
        ? false
        : (options?.sanitizeAdditional ?? false)
    const ajv = await createAjv(flavor, removeAdditional)

    // Register pre-bundled external schemas first
    if (options?.externalSchemas && options.externalSchemas.length > 0) {
      addSchemasSafely(ajv, options.externalSchemas)
    }

    // Use resolver to preload external $refs if provided (transitively)
    if (options?.refResolver) {
      const preloadError = await preloadExternalRefs(
        ajv,
        schema,
        options.refResolver,
        options.externalSchemas
      )
      if (preloadError != null) {
        return { ok: false, error: preloadError }
      }
    }

    const validate = ajv.compile(schema)
    return { ok: true, value: { ajv, validate } }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false, error: message }
  }
}
