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
  path: ReadonlyArray<PropertyKey>
  parentPath: ReadonlyArray<PropertyKey>
  propertyName: PropertyKey | undefined
  required: boolean
  ajv: Ajv | undefined
}

