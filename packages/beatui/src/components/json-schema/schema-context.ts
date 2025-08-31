import { humanize, upperCaseFirst } from '@tempots/std'
import type {
  JSONSchema7Definition,
  JSONSchema7Type,
  JSONSchema7TypeName,
  JSONSchema7,
} from 'json-schema'
import type Ajv from 'ajv'

export type SchemaConflict = {
  readonly path: ReadonlyArray<PropertyKey>
  readonly message: string
  readonly conflictingValues: readonly unknown[]
}

export type AllOfMergeResult = {
  readonly mergedSchema: JSONSchema7
  readonly conflicts: readonly SchemaConflict[]
}

export type SchemaContextOptions = {
  schema: JSONSchema7Definition
  definition: JSONSchema7Definition
  horizontal: boolean
  path: ReadonlyArray<PropertyKey>
  ajv?: Ajv
  isPropertyRequired?: boolean
  suppressLabel?: boolean
  schemaConflicts?: readonly SchemaConflict[]
}

export class SchemaContext {
  readonly schema: JSONSchema7Definition
  readonly definition: JSONSchema7Definition
  readonly horizontal: boolean
  readonly path: ReadonlyArray<PropertyKey>
  readonly ajv: Ajv | undefined
  readonly isPropertyRequired: boolean
  readonly suppressLabel: boolean
  readonly schemaConflicts: readonly SchemaConflict[]
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
    } = options
    this.schema = schema
    this.definition = definition
    this.horizontal = horizontal
    this.path = path
    this.ajv = ajv
    this.isPropertyRequired = isPropertyRequired ?? false
    this.suppressLabel = suppressLabel ?? false
    this.schemaConflicts = schemaConflicts ?? []
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
      this.nullable ??
      (this.hasType('null') ||
        this.hasEnumValue(null) ||
        this.hasConstValue(null) ||
        this.anyOf?.some(ctx => ctx.isNullable) ||
        this.oneOf?.some(ctx => ctx.isNullable))
    )
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

  readonly hasType = (type: JSONSchema7TypeName) => {
    if (this.definition === true) return true
    if (this.definition === false) return false
    return Array.isArray(this.definition.type)
      ? this.definition.type.includes(type)
      : this.definition.type === type
  }

  readonly hasEnumValue = (value: JSONSchema7Type) => {
    if (typeof this.definition === 'boolean') return false
    return Array.isArray(this.definition.enum)
      ? this.definition.enum.includes(value)
      : false
  }

  readonly hasConstValue = (value: JSONSchema7Type) => {
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
  allOfSchemas: readonly JSONSchema7[],
  basePath: ReadonlyArray<PropertyKey> = []
): AllOfMergeResult {
  const conflicts: SchemaConflict[] = []
  const merged: JSONSchema7 = {}

  // Collect all types from all schemas
  const allTypes: JSONSchema7TypeName[] = []
  const allRequired: string[] = []
  const allProperties: Record<string, JSONSchema7Definition> = {}

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
