import type Ajv from 'ajv'

/**
 * Universal JSON Schema type identifiers that work across draft-07, 2019-09, and 2020-12.
 *
 * These represent the fundamental data types recognized by all JSON Schema drafts.
 *
 * @example
 * ```ts
 * const schema: JSONSchema = { type: 'string' }
 * const multiType: JSONSchema = { type: ['string', 'null'] }
 * ```
 */
export type JSONSchemaType =
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'
  | 'number'
  | 'string'
  | 'integer'

/**
 * A JSON Schema definition, which can be either a full schema object or a boolean.
 *
 * When `true`, it accepts any value. When `false`, it rejects all values.
 * This is used in subschema positions like `additionalProperties`, `items`, etc.
 */
export type JSONSchemaDefinition = JSONSchema | boolean

/**
 * Represents a complete JSON Schema object supporting draft-07, 2019-09, and 2020-12 keywords.
 *
 * This interface provides a unified type covering all standard JSON Schema keywords across
 * multiple specification drafts. It serves as the primary schema representation used throughout
 * the BeatUI JSON Schema form generation system.
 *
 * @example
 * ```ts
 * const userSchema: JSONSchema = {
 *   type: 'object',
 *   title: 'User',
 *   properties: {
 *     name: { type: 'string', minLength: 1 },
 *     age: { type: 'integer', minimum: 0 },
 *   },
 *   required: ['name'],
 * }
 * ```
 */
export interface JSONSchema {
  // Core keywords (all drafts)
  /** Unique identifier for the schema */
  $id?: string
  /** URI identifying the JSON Schema draft version */
  $schema?: string
  /** Reference to another schema by URI */
  $ref?: string
  /** Human-readable comment for schema maintainers */
  $comment?: string

  // Meta-data keywords (all drafts)
  /** Human-readable title for the schema */
  title?: string
  /** Human-readable description of the schema's purpose */
  description?: string
  /** Default value for the schema */
  default?: unknown
  /** Example values conforming to this schema */
  examples?: unknown[]
  /** Whether the value is read-only (informational, not enforced) */
  readOnly?: boolean
  /** Whether the value is write-only (e.g., passwords) */
  writeOnly?: boolean
  /** Whether the schema is deprecated */
  deprecated?: boolean

  // Type keywords (all drafts)
  /** The data type(s) allowed by this schema */
  type?: JSONSchemaType | JSONSchemaType[]
  /** Array of allowed values */
  enum?: unknown[]
  /** The exact value required */
  const?: unknown

  // Number keywords (all drafts)
  /** Number must be a multiple of this value */
  multipleOf?: number
  /** Maximum allowed value (inclusive) */
  maximum?: number
  /** Maximum allowed value (exclusive) */
  exclusiveMaximum?: number
  /** Minimum allowed value (inclusive) */
  minimum?: number
  /** Minimum allowed value (exclusive) */
  exclusiveMinimum?: number

  // String keywords (all drafts)
  /** Maximum allowed string length */
  maxLength?: number
  /** Minimum required string length */
  minLength?: number
  /** Regular expression pattern the string must match */
  pattern?: string
  /** Semantic format identifier (e.g., 'email', 'date-time', 'uri') */
  format?: string

  // Array keywords (all drafts)
  /** Schema(s) for array items; a single schema applies to all items */
  items?: JSONSchemaDefinition | JSONSchemaDefinition[]
  /** Schema for items beyond those specified in tuple-style `items` */
  additionalItems?: JSONSchemaDefinition
  /** Maximum allowed array length */
  maxItems?: number
  /** Minimum required array length */
  minItems?: number
  /** Whether all array items must be unique */
  uniqueItems?: boolean
  /** Schema that at least one array item must match */
  contains?: JSONSchemaDefinition
  /** Minimum number of items matching `contains` (2019-09+) */
  minContains?: number
  /** Maximum number of items matching `contains` (2019-09+) */
  maxContains?: number

  // Object keywords (all drafts)
  /** Maximum allowed number of properties */
  maxProperties?: number
  /** Minimum required number of properties */
  minProperties?: number
  /** List of required property names */
  required?: string[]
  /** Schemas for known properties by name */
  properties?: Record<string, JSONSchemaDefinition>
  /** Schemas for properties matching regex patterns */
  patternProperties?: Record<string, JSONSchemaDefinition>
  /** Schema for properties not covered by `properties` or `patternProperties` */
  additionalProperties?: JSONSchemaDefinition
  /** Property dependencies (draft-07): maps property name to required properties or subschema */
  dependencies?: Record<string, JSONSchemaDefinition | string[]>
  /** Schema that property names must conform to */
  propertyNames?: JSONSchemaDefinition

  // Conditional keywords (draft-07+)
  /** Conditional schema: if the value matches this, apply `then`; otherwise apply `else` */
  if?: JSONSchemaDefinition
  /** Schema applied when `if` matches */
  then?: JSONSchemaDefinition
  /** Schema applied when `if` does not match */
  else?: JSONSchemaDefinition

  // Composition keywords (all drafts)
  /** Value must match all of these schemas */
  allOf?: JSONSchemaDefinition[]
  /** Value must match at least one of these schemas */
  anyOf?: JSONSchemaDefinition[]
  /** Value must match exactly one of these schemas */
  oneOf?: JSONSchemaDefinition[]
  /** Value must not match this schema */
  not?: JSONSchemaDefinition

  // Draft 2019-09+ keywords
  /** Maps property name to list of other required properties when that property is present */
  dependentRequired?: Record<string, string[]>
  /** Maps property name to additional schema applied when that property is present */
  dependentSchemas?: Record<string, JSONSchemaDefinition>
  /** Schema for items not evaluated by other keywords (2019-09+) */
  unevaluatedItems?: JSONSchemaDefinition
  /** Schema for properties not evaluated by other keywords (2019-09+) */
  unevaluatedProperties?: JSONSchemaDefinition

  // Draft 2020-12+ keywords
  /** Tuple-style item schemas for array positions (2020-12; replaces tuple-style `items`) */
  prefixItems?: JSONSchemaDefinition[]

  // Content keywords (draft-07+)
  /** Encoding used for content (e.g., 'base64') */
  contentEncoding?: string
  /** MIME type of the content */
  contentMediaType?: string
  /** Schema describing the decoded content */
  contentSchema?: JSONSchemaDefinition

  // Definitions (all drafts, different locations)
  /** Reusable schema definitions (draft-07: `definitions`) */
  definitions?: Record<string, JSONSchemaDefinition>
  /** Reusable schema definitions (2019-09+: `$defs`) */
  $defs?: Record<string, JSONSchemaDefinition>

  /** Extension point for custom keywords */
  [key: string]: unknown
}

/**
 * Represents a conflict discovered when merging schemas in an `allOf` composition.
 *
 * Schema conflicts occur when two or more subschemas in an `allOf` specify
 * incompatible constraints for the same property or keyword.
 */
export type SchemaConflict = {
  /** JSON path segments identifying the location of the conflict */
  readonly path: ReadonlyArray<PropertyKey>
  /** Human-readable description of the conflict */
  readonly message: string
  /** The conflicting values from different subschemas */
  readonly conflictingValues: readonly unknown[]
}

/**
 * Result of merging multiple schemas via `allOf` composition.
 *
 * Contains the successfully merged schema along with any conflicts
 * that were encountered during the merge process.
 */
export type AllOfMergeResult = {
  /** The merged schema combining all `allOf` subschemas */
  readonly mergedSchema: JSONSchema
  /** Any conflicts discovered during the merge */
  readonly conflicts: readonly SchemaConflict[]
}

/**
 * Represents a violation of a `not` schema constraint.
 *
 * A not violation occurs when the current value matches a schema
 * specified in the `not` keyword, meaning the value is disallowed.
 */
export type NotViolation = {
  /** JSON path segments identifying the location of the violation */
  readonly path: ReadonlyArray<PropertyKey>
  /** Human-readable description of the violation */
  readonly message: string
  /** The `not` schema that the value incorrectly matches */
  readonly notSchema: JSONSchema
}

/**
 * Configuration options for creating a {@link SchemaContext}.
 *
 * These options define the complete state needed to render a JSON Schema form control,
 * including the root schema, current definition, navigation path, and validation support.
 */
export type SchemaContextOptions = {
  /** The root JSON Schema document */
  schema: JSONSchemaDefinition
  /** The current schema definition being rendered */
  definition: JSONSchemaDefinition
  /** Path segments from root to the current position in the schema tree */
  path: ReadonlyArray<PropertyKey>
  /** Path segments for the parent of the current position */
  parentPath: ReadonlyArray<PropertyKey>
  /** Name of the current property (if inside an object) */
  propertyName: PropertyKey | undefined
  /** Whether the current field is required */
  required: boolean
  /** AJV instance for schema compilation and validation */
  ajv: Ajv | undefined
}
