import { humanize, upperCaseFirst } from '@tempots/std'
import type Ajv from 'ajv'

// Universal JSON Schema types that work across draft-07, 2019-09, and 2020-12
export type JSONSchemaType =
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'
  | 'number'
  | 'string'
  | 'integer'

export type JSONSchemaDefinition = JSONSchema | boolean

export interface JSONSchema {
  // Core keywords (all drafts)
  $id?: string
  $schema?: string
  $ref?: string
  $comment?: string

  // Meta-data keywords (all drafts)
  title?: string
  description?: string
  default?: unknown
  examples?: unknown[]
  readOnly?: boolean
  writeOnly?: boolean
  deprecated?: boolean

  // Type keywords (all drafts)
  type?: JSONSchemaType | JSONSchemaType[]
  enum?: unknown[]
  const?: unknown

  // Number keywords (all drafts)
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: number
  minimum?: number
  exclusiveMinimum?: number

  // String keywords (all drafts)
  maxLength?: number
  minLength?: number
  pattern?: string
  format?: string

  // Array keywords (all drafts)
  items?: JSONSchemaDefinition | JSONSchemaDefinition[]
  additionalItems?: JSONSchemaDefinition
  maxItems?: number
  minItems?: number
  uniqueItems?: boolean
  contains?: JSONSchemaDefinition
  minContains?: number
  maxContains?: number

  // Object keywords (all drafts)
  maxProperties?: number
  minProperties?: number
  required?: string[]
  properties?: Record<string, JSONSchemaDefinition>
  patternProperties?: Record<string, JSONSchemaDefinition>
  additionalProperties?: JSONSchemaDefinition
  dependencies?: Record<string, JSONSchemaDefinition | string[]>
  propertyNames?: JSONSchemaDefinition

  // Conditional keywords (draft-07+)
  if?: JSONSchemaDefinition
  then?: JSONSchemaDefinition
  else?: JSONSchemaDefinition

  // Composition keywords (all drafts)
  allOf?: JSONSchemaDefinition[]
  anyOf?: JSONSchemaDefinition[]
  oneOf?: JSONSchemaDefinition[]
  not?: JSONSchemaDefinition

  // Draft 2019-09+ keywords
  dependentRequired?: Record<string, string[]>
  dependentSchemas?: Record<string, JSONSchemaDefinition>
  unevaluatedItems?: JSONSchemaDefinition
  unevaluatedProperties?: JSONSchemaDefinition

  // Draft 2020-12+ keywords
  prefixItems?: JSONSchemaDefinition[]

  // Content keywords (draft-07+)
  contentEncoding?: string
  contentMediaType?: string
  contentSchema?: JSONSchemaDefinition

  // Definitions (all drafts, different locations)
  definitions?: Record<string, JSONSchemaDefinition>
  $defs?: Record<string, JSONSchemaDefinition>

  // Extension point for custom keywords
  [key: string]: unknown
}

export type SchemaConflict = {
  readonly path: ReadonlyArray<PropertyKey>
  readonly message: string
  readonly conflictingValues: readonly unknown[]
}

export type AllOfMergeResult = {
  readonly mergedSchema: JSONSchema
  readonly conflicts: readonly SchemaConflict[]
}

export type NotViolation = {
  readonly path: ReadonlyArray<PropertyKey>
  readonly message: string
  readonly notSchema: JSONSchema
}

export type SchemaContextOptions = {
  schema: JSONSchemaDefinition
  definition: JSONSchemaDefinition
  horizontal: boolean
  path: ReadonlyArray<PropertyKey>
  ajv?: Ajv
  isPropertyRequired?: boolean
  suppressLabel?: boolean
  schemaConflicts?: readonly SchemaConflict[]
  notViolations?: readonly NotViolation[]
}

export class SchemaContext {
  readonly schema: JSONSchemaDefinition
  readonly definition: JSONSchemaDefinition
  readonly horizontal: boolean
  readonly path: ReadonlyArray<PropertyKey>
  readonly ajv: Ajv | undefined
  readonly isPropertyRequired: boolean
  readonly suppressLabel: boolean
  readonly schemaConflicts: readonly SchemaConflict[]
  readonly notViolations: readonly NotViolation[]
  constructor(options: SchemaContextOptions) {
    const {
      schema,
      definition,
      horizontal,
      path,
      ajv,
      isPropertyRequired,
      suppressLabel,
      schemaConflicts,
      notViolations,
    } = options
    this.schema = schema
    this.definition = definition
    this.horizontal = horizontal
    this.path = path
    this.ajv = ajv
    this.isPropertyRequired = isPropertyRequired ?? false
    this.suppressLabel = suppressLabel ?? false
    this.schemaConflicts = schemaConflicts ?? []
    this.notViolations = notViolations ?? []
  }

  readonly with = (options: Partial<SchemaContextOptions>) => {
    return new SchemaContext({
      schema: options.schema ?? this.schema,
      definition: options.definition ?? this.definition,
      horizontal: options.horizontal ?? this.horizontal,
      path: options.path ?? this.path,
      ajv: options.ajv ?? this.ajv,
      isPropertyRequired: options.isPropertyRequired ?? this.isPropertyRequired,
      suppressLabel: options.suppressLabel ?? this.suppressLabel,
      schemaConflicts: options.schemaConflicts ?? this.schemaConflicts,
      notViolations: options.notViolations ?? this.notViolations,
    })
  }

  readonly append = (segment: PropertyKey) => {
    return this.with({ path: [...this.path, segment] })
  }

  get isRoot() {
    return this.path.length === 0
  }

  get name(): string | undefined {
    const last = this.path[this.path.length - 1]
    if (typeof last === 'string') {
      return last
    }
    return undefined
  }

  get widgetName(): string {
    return this.path.map(String).join('.')
  }

  get widgetLabel(): string | undefined {
    if (typeof this.definition === 'boolean') return undefined
    return (
      this.definition.title ??
      (this.name != null ? upperCaseFirst(humanize(this.name!)) : undefined)
    )
  }

  readonly hasRequiredProperty = (name: string) => {
    if (typeof this.definition === 'boolean') return false
    return (
      this.definition.required != null &&
      this.definition.required.includes(name)
    )
  }

  get nullable() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.definition as any).nullable ?? false
  }

  get isNullable(): boolean {
    return (
      this.nullable ||
      this.hasType('null') ||
      this.hasEnumValue(null) ||
      this.hasConstValue(null) ||
      (this.anyOf?.some(ctx => ctx.isNullable) ?? false) ||
      (this.oneOf?.some(ctx => ctx.isNullable) ?? false)
    )
  }

  /**
   * Determines if this property is optional (can be absent from parent object).
   * This is different from nullable - optional means the key can be missing,
   * while nullable means the value can be explicitly null.
   */
  get isOptional(): boolean {
    return !this.isPropertyRequired
  }

  /**
   * Determines if this property should show a presence toggle.
   * Optional properties that are not at the root level should have presence toggles,
   * but primitive values that allow null should use nullable controls instead.
   */
  get shouldShowPresenceToggle(): boolean {
    if (!this.isOptional || this.isRoot) {
      return false
    }

    // For primitive values that are nullable, use nullable controls instead of presence toggles
    if ((this.isNullable || this.isOptional) && this.isPrimitive) {
      return false
    }

    return true
  }

  /**
   * Determines if this schema represents a primitive type (string, number, boolean, null).
   */
  get isPrimitive(): boolean {
    if (typeof this.definition === 'boolean') {
      return false
    }

    const def = this.definition

    // If no type is specified but has const or enum, consider it primitive
    if (def.const !== undefined || def.enum !== undefined) {
      return true
    }

    if (def.type) {
      const types = Array.isArray(def.type) ? def.type : [def.type]
      const primitiveTypes = ['string', 'number', 'integer', 'boolean']
      return types.every(type => primitiveTypes.includes(type))
    }

    return false
  }

  /**
   * Determines if this property is marked as readOnly.
   */
  get isReadOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(this.definition.readOnly)
  }

  /**
   * Determines if this property is marked as writeOnly.
   */
  get isWriteOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(this.definition.writeOnly)
  }

  /**
   * Determines if this property is marked as deprecated.
   */
  get isDeprecated(): boolean {
    if (typeof this.definition === 'boolean') return false
    return Boolean(
      (this.definition as unknown as Record<string, unknown>).deprecated
    )
  }

  /**
   * Checks if readOnly should be ignored based on x:ui.ignoreReadOnly.
   */
  get shouldIgnoreReadOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    const xuiRaw = (this.definition as unknown as Record<string, unknown>)[
      'x:ui'
    ]
    if (xuiRaw && typeof xuiRaw === 'object') {
      return Boolean((xuiRaw as Record<string, unknown>)['ignoreReadOnly'])
    }
    return false
  }

  /**
   * Checks if writeOnly should be shown based on x:ui.showWriteOnly.
   */
  get shouldShowWriteOnly(): boolean {
    if (typeof this.definition === 'boolean') return false
    const xuiRaw = (this.definition as unknown as Record<string, unknown>)[
      'x:ui'
    ]
    if (xuiRaw && typeof xuiRaw === 'object') {
      return Boolean((xuiRaw as Record<string, unknown>)['showWriteOnly'])
    }
    return false
  }

  get anyOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.anyOf)
      ? this.definition.anyOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  get oneOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.oneOf)
      ? this.definition.oneOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  get allOf() {
    if (typeof this.definition === 'boolean') return undefined
    return Array.isArray(this.definition.allOf)
      ? this.definition.allOf.map(definition => {
          return this.with({ definition })
        })
      : undefined
  }

  readonly hasType = (type: JSONSchemaType) => {
    if (this.definition === true) return true
    if (this.definition === false) return false
    return Array.isArray(this.definition.type)
      ? this.definition.type.includes(type)
      : this.definition.type === type
  }

  readonly hasEnumValue = (value: unknown) => {
    if (typeof this.definition === 'boolean') return false
    return Array.isArray(this.definition.enum)
      ? this.definition.enum.includes(value)
      : false
  }

  readonly hasConstValue = (value: unknown) => {
    if (typeof this.definition === 'boolean') return false
    return this.definition.const === value
  }

  get description() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.description
  }

  get examples() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.examples
  }

  get default() {
    if (typeof this.definition === 'boolean') return undefined
    return this.definition.default
  }
}

/**
 * Deep merge allOf branches into a single effective schema.
 * - Intersects types (detects conflicts like string ∧ number)
 * - Unions required arrays
 * - Deep merges properties objects
 * - Detects and reports conflicts as non-blocking schema errors
 */
export function mergeAllOf(
  allOfSchemas: readonly JSONSchema[],
  basePath: ReadonlyArray<PropertyKey> = []
): AllOfMergeResult {
  const conflicts: SchemaConflict[] = []
  const merged: JSONSchema = {}

  // Collect all types from all schemas
  const allTypes: JSONSchemaType[] = []
  const allRequired: string[] = []
  const allProperties: Record<string, JSONSchemaDefinition> = {}

  for (const schema of allOfSchemas) {
    // Handle type intersection
    if (schema.type != null) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type]
      allTypes.push(...types)
    }

    // Union required arrays
    if (Array.isArray(schema.required)) {
      allRequired.push(...schema.required)
    }

    // Deep merge properties
    if (schema.properties != null) {
      for (const [key, propDef] of Object.entries(schema.properties)) {
        if (allProperties[key] != null && allProperties[key] !== propDef) {
          // Property conflict detected
          conflicts.push({
            path: [...basePath, 'properties', key],
            message: `Property "${key}" has conflicting definitions in allOf branches`,
            conflictingValues: [allProperties[key], propDef],
          })
        }
        allProperties[key] = propDef
      }
    }

    // Copy other schema properties (shallow merge, later wins)
    const {
      type: _type,
      required: _required,
      properties: _properties,
      allOf: _allOf,
      ...otherProps
    } = schema
    Object.assign(merged, otherProps)
  }

  // Handle type intersection conflicts
  const uniqueTypes = [...new Set(allTypes)]
  if (uniqueTypes.length > 1) {
    // Check for incompatible type combinations
    const hasString = uniqueTypes.includes('string')
    const hasNumber =
      uniqueTypes.includes('number') || uniqueTypes.includes('integer')
    const hasBoolean = uniqueTypes.includes('boolean')
    const hasObject = uniqueTypes.includes('object')
    const hasArray = uniqueTypes.includes('array')

    const primitiveCount = [hasString, hasNumber, hasBoolean].filter(
      Boolean
    ).length
    const structuralCount = [hasObject, hasArray].filter(Boolean).length

    if (primitiveCount > 1 || (primitiveCount > 0 && structuralCount > 0)) {
      conflicts.push({
        path: [...basePath, 'type'],
        message: `Incompatible types in allOf: ${uniqueTypes.join(', ')}`,
        conflictingValues: uniqueTypes,
      })
    }
  }

  // Set merged properties
  if (uniqueTypes.length === 1) {
    merged.type = uniqueTypes[0]
  } else if (uniqueTypes.length > 1) {
    merged.type = uniqueTypes
  }

  if (allRequired.length > 0) {
    merged.required = [...new Set(allRequired)]
  }

  if (Object.keys(allProperties).length > 0) {
    merged.properties = allProperties
  }

  return {
    mergedSchema: merged,
    conflicts,
  }
}

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
    const validate = ajv.compile(notSchema)
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
    const validate = ajv.compile(def.if as JSONSchema)
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
