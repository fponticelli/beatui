import type Ajv from 'ajv'
import { compileWithCache } from './ajv-utils'
import { mergeAllOf } from './schema-merge'
import type { JSONSchema, SchemaConflict, NotViolation } from './schema-types'

/**
 * Evaluate `not` subschema against the current value using AJV.
 * Returns a NotViolation if the value matches the disallowed schema.
 */
export function evaluateNotViolation(
  notSchema: JSONSchema,
  value: unknown,
  ajv: Ajv | undefined,
  basePath: ReadonlyArray<PropertyKey> = []
): NotViolation | null {
  if (!ajv) {
    // Cannot evaluate without AJV instance
    return null
  }

  try {
    const validate = compileWithCache(ajv, notSchema)
    const isValid = validate(value)

    if (isValid) {
      // Value matches the disallowed schema - this is a violation
      const title = notSchema.title || 'disallowed schema'
      return {
        path: basePath,
        message: `Value matches ${title}`,
        notSchema,
      }
    }

    return null
  } catch (_error) {
    // If compilation fails, we can't evaluate - return null
    return null
  }
}

/**
 * Evaluate if/then/else and dependencies overlays for an object schema without
 * mutating the base definition. Returns a new effective schema plus any merge
 * conflicts discovered while composing overlays.
 */
export function composeEffectiveObjectSchema(
  baseDef: JSONSchema,
  value: unknown,
  ajv: Ajv | undefined,
  basePath: ReadonlyArray<PropertyKey> = []
): { effective: JSONSchema; conflicts: readonly SchemaConflict[] } {
  const overlays: JSONSchema[] = []
  const conflicts: SchemaConflict[] = []

  // 1) Conditional overlay from if/then/else
  const cond = evaluateIfThenElseOverlay(baseDef, value, ajv)
  if (cond) overlays.push(cond)

  // Prepare working required/properties from base to fold dependentRequired into
  const baseRequired = Array.isArray(baseDef.required)
    ? [...baseDef.required]
    : []

  // 2) dependentRequired (2020-12) and draft-07 dependencies: string[]
  if (typeof value === 'object' && value != null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>

    // dependentRequired
    const dr = (
      baseDef as unknown as { dependentRequired?: Record<string, string[]> }
    ).dependentRequired
    if (dr) {
      for (const [k, deps] of Object.entries(dr)) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          for (const dep of deps) baseRequired.push(dep)
        }
      }
    }

    // draft-07 dependencies: map entries to depRequired/depSchemas
    const deps = (
      baseDef as unknown as {
        dependencies?: Record<string, JSONSchema | string[]>
      }
    ).dependencies
    if (deps) {
      for (const [k, spec] of Object.entries(deps)) {
        if (!Object.prototype.hasOwnProperty.call(obj, k)) continue
        if (Array.isArray(spec)) {
          for (const dep of spec) baseRequired.push(dep)
        } else if (typeof spec === 'object' && spec) {
          overlays.push(spec as JSONSchema)
        }
      }
    }

    // dependentSchemas
    const ds = (
      baseDef as unknown as { dependentSchemas?: Record<string, JSONSchema> }
    ).dependentSchemas
    if (ds) {
      for (const [k, schema] of Object.entries(ds)) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) overlays.push(schema)
      }
    }
  }

  // Merge base with overlays (if any) using same deep-merge rules as allOf
  const toMerge: JSONSchema[] = [baseDef, ...overlays]
  const { mergedSchema, conflicts: mergeConflicts } = mergeAllOf(
    toMerge,
    basePath
  )

  // Ensure required from dependentRequired/dependencies are preserved (mergeAllOf
  // already unions required, but in case base had none and overlays did not include
  // required keyword we still need to apply baseRequired)
  if (baseRequired.length > 0) {
    const req = new Set([...(mergedSchema.required ?? []), ...baseRequired])
    mergedSchema.required = [...req]
  }

  conflicts.push(...mergeConflicts)

  return { effective: mergedSchema, conflicts }
}

/**
 * Returns the overlay schema coming from if/then/else for the given value or
 * null if no overlay applies or no AJV instance is available.
 */
export function evaluateIfThenElseOverlay(
  def: JSONSchema,
  value: unknown,
  ajv: Ajv | undefined
): JSONSchema | null {
  if (!ajv) return null
  if (!def.if || typeof def.if !== 'object') return null

  try {
    const validate = compileWithCache(ajv, def.if as JSONSchema)
    const matches = validate(value)
    if (matches) {
      const thenSchema = def.then
      if (thenSchema && typeof thenSchema === 'object')
        return thenSchema as JSONSchema
    } else {
      const elseSchema = def.else
      if (elseSchema && typeof elseSchema === 'object')
        return elseSchema as JSONSchema
    }
  } catch {
    // ignore compile errors and treat as no overlay
  }
  return null
}

/**
 * Tracks which properties have been evaluated by various JSON Schema keywords.
 * This is used to implement unevaluatedProperties semantics for 2019-09/2020-12.
 */
export function getEvaluatedProperties(
  schema: JSONSchema,
  value: Record<string, unknown> | undefined,
  ajv: Ajv | undefined
): Set<string> {
  const evaluated = new Set<string>()

  if (!value || typeof value !== 'object') {
    return evaluated
  }

  // Properties from 'properties' keyword
  if (schema.properties) {
    Object.keys(schema.properties).forEach(key => {
      if (key in value) {
        evaluated.add(key)
      }
    })
  }

  // Properties from 'patternProperties' keyword
  if (schema.patternProperties) {
    Object.keys(value).forEach(key => {
      Object.keys(schema.patternProperties!).forEach(pattern => {
        try {
          if (new RegExp(pattern).test(key)) {
            evaluated.add(key)
          }
        } catch {
          // ignore invalid regex patterns
        }
      })
    })
  }

  // Properties from 'additionalProperties' (if explicitly true or a schema, additional properties are evaluated)
  if (
    schema.additionalProperties === true ||
    (schema.additionalProperties &&
      typeof schema.additionalProperties === 'object')
  ) {
    // Get properties already covered by 'properties' and 'patternProperties'
    const coveredByProperties = new Set<string>()
    if (schema.properties) {
      Object.keys(schema.properties).forEach(key => {
        if (key in value) {
          coveredByProperties.add(key)
        }
      })
    }

    if (schema.patternProperties) {
      Object.keys(value).forEach(key => {
        Object.keys(schema.patternProperties!).forEach(pattern => {
          try {
            if (new RegExp(pattern).test(key)) {
              coveredByProperties.add(key)
            }
          } catch {
            // ignore invalid regex patterns
          }
        })
      })
    }

    // All properties not covered by 'properties' or 'patternProperties' are evaluated by additionalProperties
    Object.keys(value).forEach(key => {
      if (!coveredByProperties.has(key)) {
        evaluated.add(key)
      }
    })
  }

  // Properties from allOf branches
  if (schema.allOf) {
    schema.allOf.forEach(subschema => {
      if (typeof subschema === 'object') {
        const subEvaluated = getEvaluatedProperties(subschema, value, ajv)
        subEvaluated.forEach(key => evaluated.add(key))
      }
    })
  }

  // Properties from if/then/else overlays
  const overlay = evaluateIfThenElseOverlay(schema, value, ajv)
  if (overlay) {
    const overlayEvaluated = getEvaluatedProperties(overlay, value, ajv)
    overlayEvaluated.forEach(key => evaluated.add(key))
  }

  // Properties from dependentSchemas
  const dependentSchemas = (schema as unknown as Record<string, unknown>)
    .dependentSchemas as Record<string, JSONSchema> | undefined
  if (dependentSchemas) {
    Object.keys(dependentSchemas).forEach(dependentKey => {
      if (dependentKey in value) {
        const dependentSchema = dependentSchemas[dependentKey]
        if (typeof dependentSchema === 'object') {
          const depEvaluated = getEvaluatedProperties(
            dependentSchema,
            value,
            ajv
          )
          depEvaluated.forEach(key => evaluated.add(key))
        }
      }
    })
  }

  // Properties from draft-07 dependencies (schema form)
  if (schema.dependencies) {
    Object.keys(schema.dependencies).forEach(dependentKey => {
      if (dependentKey in value) {
        const dependency = schema.dependencies![dependentKey]
        if (typeof dependency === 'object' && !Array.isArray(dependency)) {
          const depEvaluated = getEvaluatedProperties(dependency, value, ajv)
          depEvaluated.forEach(key => evaluated.add(key))
        }
      }
    })
  }

  return evaluated
}
