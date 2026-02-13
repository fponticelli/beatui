/**
 * JSON Structure Schema Type Definitions
 *
 * Based on JSON Structure Core specification.
 * Provides TypeScript types, interfaces, and type guard functions for working
 * with JSON Structure schemas, including primitive types (string, boolean, integers,
 * floats, temporal, uuid, uri, binary), compound types (object, array, set, map,
 * tuple, choice), validation constraints, and schema documents.
 *
 * @see https://json-structure.org/
 *
 * @example
 * ```ts
 * import { isIntegerType, INTEGER_BOUNDS } from '@tempots/beatui/json-structure'
 *
 * if (isIntegerType('int32')) {
 *   const bounds = INTEGER_BOUNDS['int32']
 *   console.log(bounds.min, bounds.max) // -2147483648n, 2147483647n
 * }
 * ```
 */

// =============================================================================
// Primitive Type Keywords
// =============================================================================

/**
 * All primitive type keywords supported by JSON Structure.
 *
 * Includes string, boolean, null, signed/unsigned integers of various sizes,
 * floating-point types, temporal types, UUID, URI, and binary.
 */
export type PrimitiveType =
  | 'string'
  | 'boolean'
  | 'null'
  | 'int8'
  | 'int16'
  | 'int32'
  | 'int64'
  | 'int128'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'float'
  | 'double'
  | 'decimal'
  | 'date'
  | 'datetime'
  | 'time'
  | 'duration'
  | 'uuid'
  | 'uri'
  | 'binary'

/**
 * Compound (complex) type keywords supported by JSON Structure.
 *
 * These types contain or compose other types: objects, arrays, sets (unique arrays),
 * maps (key-value pairs), tuples (fixed-length ordered elements), choices (tagged unions),
 * and the `any` type.
 */
export type CompoundType =
  | 'object'
  | 'array'
  | 'set'
  | 'map'
  | 'tuple'
  | 'choice'
  | 'any'

/**
 * Union of all type keywords (primitive and compound) in JSON Structure.
 */
export type TypeKeyword = PrimitiveType | CompoundType

/**
 * Integer types that require BigInt for full precision.
 *
 * These types exceed the safe integer range of JavaScript's `number` type
 * and must be represented as `bigint` values.
 */
export type BigIntType = 'int64' | 'int128' | 'uint64' | 'uint128'

/**
 * Check if a type keyword requires BigInt handling for full precision.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is int64, int128, uint64, or uint128
 *
 * @example
 * ```ts
 * isBigIntType('int64')  // true
 * isBigIntType('int32')  // false
 * ```
 */
export function isBigIntType(type: string): type is BigIntType {
  return (
    type === 'int64' ||
    type === 'int128' ||
    type === 'uint64' ||
    type === 'uint128'
  )
}

/**
 * All signed integer type keywords (int8 through int128).
 */
export type SignedIntegerType = 'int8' | 'int16' | 'int32' | 'int64' | 'int128'

/**
 * All unsigned integer type keywords (uint8 through uint128).
 */
export type UnsignedIntegerType =
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'

/**
 * Union of all integer type keywords (signed and unsigned).
 */
export type IntegerType = SignedIntegerType | UnsignedIntegerType

/**
 * Check if a type keyword represents an integer type.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is any signed or unsigned integer type
 *
 * @example
 * ```ts
 * isIntegerType('int32')   // true
 * isIntegerType('uint8')   // true
 * isIntegerType('float')   // false
 * isIntegerType('string')  // false
 * ```
 */
export function isIntegerType(type: string): type is IntegerType {
  return (
    type === 'int8' ||
    type === 'int16' ||
    type === 'int32' ||
    type === 'int64' ||
    type === 'int128' ||
    type === 'uint8' ||
    type === 'uint16' ||
    type === 'uint32' ||
    type === 'uint64' ||
    type === 'uint128'
  )
}

/**
 * All floating-point type keywords.
 *
 * - `float` - IEEE 754 single-precision (32-bit)
 * - `double` - IEEE 754 double-precision (64-bit)
 * - `decimal` - Arbitrary-precision decimal
 */
export type FloatType = 'float' | 'double' | 'decimal'

/**
 * Check if a type keyword represents a floating-point type.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is float, double, or decimal
 *
 * @example
 * ```ts
 * isFloatType('double')  // true
 * isFloatType('decimal') // true
 * isFloatType('int32')   // false
 * ```
 */
export function isFloatType(type: string): type is FloatType {
  return type === 'float' || type === 'double' || type === 'decimal'
}

/**
 * Union of all numeric type keywords (integer and floating-point).
 */
export type NumericType = IntegerType | FloatType

/**
 * Check if a type keyword represents any numeric type (integer or floating-point).
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is any integer or float type
 *
 * @example
 * ```ts
 * isNumericType('int32')   // true
 * isNumericType('double')  // true
 * isNumericType('string')  // false
 * ```
 */
export function isNumericType(type: string): type is NumericType {
  return isIntegerType(type) || isFloatType(type)
}

/**
 * All temporal (date/time) type keywords.
 *
 * - `date` - Calendar date (ISO 8601 `YYYY-MM-DD`)
 * - `datetime` - Date with time (ISO 8601 `YYYY-MM-DDTHH:MM:SS`)
 * - `time` - Time of day (ISO 8601 `HH:MM:SS`)
 * - `duration` - Time duration (ISO 8601 `P...T...`)
 */
export type TemporalType = 'date' | 'datetime' | 'time' | 'duration'

/**
 * Check if a type keyword represents a temporal type.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is date, datetime, time, or duration
 *
 * @example
 * ```ts
 * isTemporalType('date')      // true
 * isTemporalType('duration')  // true
 * isTemporalType('string')    // false
 * ```
 */
export function isTemporalType(type: string): type is TemporalType {
  return (
    type === 'date' ||
    type === 'datetime' ||
    type === 'time' ||
    type === 'duration'
  )
}

/**
 * Check if a type keyword represents a primitive (non-compound) type.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is string, boolean, null, numeric, temporal, uuid, uri, or binary
 *
 * @example
 * ```ts
 * isPrimitiveType('string')  // true
 * isPrimitiveType('uuid')    // true
 * isPrimitiveType('object')  // false
 * isPrimitiveType('array')   // false
 * ```
 */
export function isPrimitiveType(type: string): type is PrimitiveType {
  return (
    type === 'string' ||
    type === 'boolean' ||
    type === 'null' ||
    isNumericType(type) ||
    isTemporalType(type) ||
    type === 'uuid' ||
    type === 'uri' ||
    type === 'binary'
  )
}

/**
 * Check if a type keyword represents a compound (complex) type.
 *
 * @param type - The type keyword string to check
 * @returns `true` if the type is object, array, set, map, tuple, choice, or any
 *
 * @example
 * ```ts
 * isCompoundType('object')  // true
 * isCompoundType('array')   // true
 * isCompoundType('string')  // false
 * ```
 */
export function isCompoundType(type: string): type is CompoundType {
  return (
    type === 'object' ||
    type === 'array' ||
    type === 'set' ||
    type === 'map' ||
    type === 'tuple' ||
    type === 'choice' ||
    type === 'any'
  )
}

// =============================================================================
// Type Reference
// =============================================================================

/**
 * A reference to a type definition defined elsewhere in the schema.
 *
 * Uses the `$ref` keyword to point to a named type in the `definitions` section.
 *
 * @example
 * ```ts
 * const ref: TypeReference = { $ref: 'Address' }
 * ```
 */
export interface TypeReference {
  /** Path or name pointing to the referenced type definition */
  $ref: string
}

/**
 * Specifies a type as a keyword, array of keywords (union), or a reference.
 *
 * - A single `TypeKeyword` for a simple type
 * - An array of `TypeKeyword` for union types (e.g., `['string', 'null']`)
 * - A `TypeReference` for referencing a named definition
 */
export type TypeSpecifier = TypeKeyword | TypeKeyword[] | TypeReference

/**
 * Check if a value is a `TypeReference` (an object with a `$ref` property).
 *
 * @param value - The value to check
 * @returns `true` if the value is a TypeReference object
 *
 * @example
 * ```ts
 * isTypeReference({ $ref: 'Address' })   // true
 * isTypeReference({ type: 'string' })     // false
 * isTypeReference('string')               // false
 * ```
 */
export function isTypeReference(value: unknown): value is TypeReference {
  return typeof value === 'object' && value !== null && '$ref' in value
}

// =============================================================================
// Validation Constraints (from Validation Extension)
// =============================================================================

/**
 * Validation constraints for string types.
 */
export interface StringValidation {
  /** Minimum required string length */
  minLength?: number
  /** Maximum allowed string length */
  maxLength?: number
  /** Regular expression pattern the string must match */
  pattern?: string
  /** Semantic format identifier (e.g., 'email', 'hostname') */
  format?: string
}

/**
 * Validation constraints for numeric types (integers and floats).
 *
 * Values can be specified as `number` or `string` (the latter for BigInt precision).
 */
export interface NumericValidation {
  /** Minimum allowed value (inclusive); string representation for BigInt precision */
  minimum?: number | string
  /** Maximum allowed value (inclusive); string representation for BigInt precision */
  maximum?: number | string
  /** Minimum allowed value (exclusive); string representation for BigInt precision */
  exclusiveMinimum?: number | string
  /** Maximum allowed value (exclusive); string representation for BigInt precision */
  exclusiveMaximum?: number | string
  /** Value must be a multiple of this number */
  multipleOf?: number
}

/**
 * Validation constraints for array and set types.
 */
export interface ArrayValidation {
  /** Minimum required number of items */
  minItems?: number
  /** Maximum allowed number of items */
  maxItems?: number
  /** Whether all items must be unique (always true for set types) */
  uniqueItems?: boolean
  /** Schema that at least one item must match */
  contains?: TypeDefinition
  /** Minimum number of items matching `contains` */
  minContains?: number
  /** Maximum number of items matching `contains` */
  maxContains?: number
}

/**
 * Validation constraints for object and map types.
 */
export interface ObjectValidation {
  /** Minimum required number of properties */
  minProperties?: number
  /** Maximum allowed number of properties */
  maxProperties?: number
  /** Maps property name to list of other required properties when that property is present */
  dependentRequired?: Record<string, string[]>
}

// =============================================================================
// Metadata
// =============================================================================

/**
 * Alternative names for a type definition, supporting language-specific labels.
 *
 * @example
 * ```ts
 * const names: Altnames = {
 *   json: 'user_name',
 *   'lang:es': 'nombre_de_usuario',
 *   'lang:fr': "nom_d'utilisateur",
 * }
 * ```
 */
export interface Altnames {
  /** Alternative name used in JSON serialization */
  json?: string
  /** Language-specific alternative names keyed by `lang:<locale>` */
  [key: `lang:${string}`]: string | undefined
}

/**
 * Metadata annotations for a type definition.
 *
 * These properties provide human-readable information and hints
 * for documentation, UI rendering, and deprecation tracking.
 */
export interface TypeMetadata {
  /** Human-readable name for the type */
  name?: string
  /** Human-readable description of the type's purpose */
  description?: string
  /** Example values conforming to this type */
  examples?: unknown[]
  /** Whether this type is deprecated */
  deprecated?: boolean
  /** Whether this type is abstract (cannot be instantiated directly) */
  abstract?: boolean
  /** Alternative names for different contexts and languages */
  altnames?: Altnames
  /** Unit of measurement (e.g., 'kg', 'meters', 'seconds') */
  unit?: string
  /** Currency code (e.g., 'USD', 'EUR') for monetary values */
  currency?: string
  /** Default value for this type */
  default?: unknown
}

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Base type definition shared by all JSON Structure types.
 *
 * Extends {@link TypeMetadata} with type specification, inheritance, enum, and const support.
 *
 * @example
 * ```ts
 * const def: BaseTypeDefinition = {
 *   type: 'string',
 *   name: 'Email',
 *   description: 'An email address',
 * }
 * ```
 */
export interface BaseTypeDefinition extends TypeMetadata {
  /** The type specifier: a keyword, array of keywords (union), or reference */
  type?: TypeSpecifier
  /** Type(s) this definition extends (inheritance) */
  $extends?: string | string[]
  /** Array of allowed values (enumeration constraint) */
  enum?: unknown[]
  /** The exact value required (constant constraint) */
  const?: unknown
}

/**
 * Type definition for object types with named properties.
 *
 * @example
 * ```ts
 * const userDef: ObjectTypeDefinition = {
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string' },
 *     age: { type: 'int32' },
 *   },
 *   required: ['name'],
 * }
 * ```
 */
export interface ObjectTypeDefinition
  extends BaseTypeDefinition,
    ObjectValidation {
  /** Must be 'object' */
  type: 'object'
  /** Map of property names to their type definitions */
  properties: Record<string, TypeDefinition>
  /** Required property names; supports flat list or grouped requirements */
  required?: string[] | string[][]
  /** Schema for properties not listed in `properties`; `false` disallows them */
  additionalProperties?: boolean | TypeDefinition
}

/**
 * Type definition for ordered, variable-length array types.
 *
 * @example
 * ```ts
 * const tagsDef: ArrayTypeDefinition = {
 *   type: 'array',
 *   items: { type: 'string' },
 *   minItems: 1,
 *   maxItems: 10,
 * }
 * ```
 */
export interface ArrayTypeDefinition
  extends BaseTypeDefinition,
    ArrayValidation {
  /** Must be 'array' */
  type: 'array'
  /** Type definition for each item in the array */
  items: TypeDefinition
}

/**
 * Type definition for set types (arrays with unique items).
 *
 * Semantically equivalent to an array with `uniqueItems: true`,
 * but explicitly typed as 'set' for clarity.
 */
export interface SetTypeDefinition extends BaseTypeDefinition, ArrayValidation {
  /** Must be 'set' */
  type: 'set'
  /** Type definition for each item in the set */
  items: TypeDefinition
}

/**
 * Type definition for map types (key-value pairs).
 *
 * Keys are always strings; the `values` property defines the type for all values.
 *
 * @example
 * ```ts
 * const configDef: MapTypeDefinition = {
 *   type: 'map',
 *   values: { type: 'string' },
 * }
 * ```
 */
export interface MapTypeDefinition
  extends BaseTypeDefinition,
    ObjectValidation {
  /** Must be 'map' */
  type: 'map'
  /** Type definition for all map values */
  values: TypeDefinition
}

/**
 * Type definition for tuple types (fixed-length ordered elements).
 *
 * The `tuple` array defines the order of elements by referencing keys in `properties`.
 * Each element has a named definition, but serializes to a JSON array in the specified order.
 *
 * @example
 * ```ts
 * const pointDef: TupleTypeDefinition = {
 *   type: 'tuple',
 *   properties: {
 *     x: { type: 'float' },
 *     y: { type: 'float' },
 *   },
 *   tuple: ['x', 'y'],
 * }
 * ```
 */
export interface TupleTypeDefinition extends BaseTypeDefinition {
  /** Must be 'tuple' */
  type: 'tuple'
  /** Named type definitions for each tuple element */
  properties: Record<string, TypeDefinition>
  /** Ordered list of property keys defining the element order */
  tuple: string[]
}

/**
 * Type definition for choice types (tagged unions / discriminated unions).
 *
 * Each choice variant has a name and a type definition. An optional `selector`
 * property specifies the discriminator field name.
 *
 * @example
 * ```ts
 * const contactDef: ChoiceTypeDefinition = {
 *   type: 'choice',
 *   choices: {
 *     email: { type: 'string' },
 *     phone: { type: 'string' },
 *   },
 *   selector: 'method',
 * }
 * ```
 */
export interface ChoiceTypeDefinition extends BaseTypeDefinition {
  /** Must be 'choice' */
  type: 'choice'
  /** Map of variant names to their type definitions */
  choices: Record<string, TypeDefinition>
  /** Optional discriminator property name for discriminated unions */
  selector?: string
}

/**
 * Type definition for arbitrary-precision decimal types.
 *
 * Extends numeric validation with `precision` and `scale` for fixed-point decimals.
 *
 * @example
 * ```ts
 * const priceDef: DecimalTypeDefinition = {
 *   type: 'decimal',
 *   precision: 10,
 *   scale: 2,
 *   minimum: 0,
 * }
 * ```
 */
export interface DecimalTypeDefinition
  extends BaseTypeDefinition,
    NumericValidation {
  /** Must be 'decimal' */
  type: 'decimal'
  /** Total number of significant digits */
  precision?: number
  /** Number of digits after the decimal point */
  scale?: number
}

/**
 * Type definition for string types with optional validation constraints.
 */
export interface StringTypeDefinition
  extends BaseTypeDefinition,
    StringValidation {
  /** Must be 'string' */
  type: 'string'
}

/**
 * Type definition for integer types (int8 through uint128) with optional numeric validation.
 */
export interface IntegerTypeDefinition
  extends BaseTypeDefinition,
    NumericValidation {
  /** The specific integer type keyword */
  type: IntegerType
}

/**
 * Type definition for floating-point types (float, double) with optional numeric validation.
 */
export interface FloatTypeDefinition
  extends BaseTypeDefinition,
    NumericValidation {
  /** The specific float type keyword */
  type: 'float' | 'double'
}

/**
 * Union of all possible type definitions in a JSON Structure schema.
 *
 * This is the primary type used to represent any field or property definition.
 */
export type TypeDefinition =
  | BaseTypeDefinition
  | ObjectTypeDefinition
  | ArrayTypeDefinition
  | SetTypeDefinition
  | MapTypeDefinition
  | TupleTypeDefinition
  | ChoiceTypeDefinition
  | DecimalTypeDefinition
  | StringTypeDefinition
  | IntegerTypeDefinition
  | FloatTypeDefinition

// =============================================================================
// Schema Document
// =============================================================================

/**
 * Root document type for a JSON Structure schema.
 *
 * Represents a complete schema document with metadata, definitions, and optional
 * root-level object properties. This is the top-level type passed to
 * {@link JSONStructureForm} for form generation.
 *
 * @example
 * ```ts
 * const schema: JSONStructureSchema = {
 *   $schema: 'https://json-structure.org/schema/v0',
 *   $id: 'https://example.com/user',
 *   name: 'User',
 *   type: 'object',
 *   properties: {
 *     name: { type: 'string', name: 'Name' },
 *     email: { type: 'string', name: 'Email' },
 *   },
 *   required: ['name', 'email'],
 * }
 * ```
 */
export interface JSONStructureSchema
  extends BaseTypeDefinition,
    ObjectValidation {
  /** URI identifying the JSON Structure specification version */
  $schema: string
  /** Unique identifier for this schema document */
  $id: string
  /** Human-readable name for the schema */
  name: string
  /** Reference to the root type definition (if not inline) */
  $root?: string
  /** Named type definitions and namespaces available for `$ref` references */
  definitions?: Record<string, TypeDefinition | Namespace>
  /** External schema URIs this schema depends on */
  $uses?: string[]
  /** Root-level properties when the schema type is 'object' */
  properties?: Record<string, TypeDefinition>
  /** Required property names at the root level */
  required?: string[] | string[][]
}

// =============================================================================
// Namespace (for definitions hierarchy)
// =============================================================================

/**
 * A namespace object for organizing type definitions hierarchically.
 *
 * Namespaces can contain type definitions or nested namespaces,
 * but are not types themselves (they have no `type`, `$ref`, `enum`, or `const` property).
 */
export interface Namespace {
  /** Named entries that are either type definitions or nested namespaces */
  [key: string]: TypeDefinition | Namespace
}

/**
 * Check if a value is a namespace (contains nested definitions but is not a type itself).
 *
 * A namespace is distinguished from a type definition by the absence of
 * `type`, `$ref`, `enum`, and `const` properties.
 *
 * @param value - The value to check
 * @returns `true` if the value is a namespace object
 *
 * @example
 * ```ts
 * isNamespace({ User: { type: 'object', properties: {} } })  // true
 * isNamespace({ type: 'string' })                              // false
 * ```
 */
export function isNamespace(value: unknown): value is Namespace {
  return (
    typeof value === 'object' &&
    value !== null &&
    !('type' in value) &&
    !('$ref' in value) &&
    !('enum' in value) &&
    !('const' in value)
  )
}

/**
 * Check if a value is a type definition (has `type`, `$ref`, `enum`, or `const`).
 *
 * @param value - The value to check
 * @returns `true` if the value is a TypeDefinition object
 *
 * @example
 * ```ts
 * isTypeDefinition({ type: 'string' })  // true
 * isTypeDefinition({ $ref: 'User' })    // true
 * isTypeDefinition({ name: 'ns' })      // false (namespace)
 * ```
 */
export function isTypeDefinition(value: unknown): value is TypeDefinition {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('type' in value || '$ref' in value || 'enum' in value || 'const' in value)
  )
}

// =============================================================================
// Type Guards for Specific Definitions
// =============================================================================

/**
 * Check if a type definition is an {@link ObjectTypeDefinition}.
 *
 * @param def - The type definition to check
 * @returns `true` if the definition has `type: 'object'` and a `properties` map
 */
export function isObjectTypeDefinition(
  def: TypeDefinition
): def is ObjectTypeDefinition {
  return def.type === 'object' && 'properties' in def
}

export function isArrayTypeDefinition(
  def: TypeDefinition
): def is ArrayTypeDefinition {
  return def.type === 'array' && 'items' in def
}

export function isSetTypeDefinition(
  def: TypeDefinition
): def is SetTypeDefinition {
  return def.type === 'set' && 'items' in def
}

export function isMapTypeDefinition(
  def: TypeDefinition
): def is MapTypeDefinition {
  return def.type === 'map' && 'values' in def
}

export function isTupleTypeDefinition(
  def: TypeDefinition
): def is TupleTypeDefinition {
  return def.type === 'tuple' && 'tuple' in def
}

export function isChoiceTypeDefinition(
  def: TypeDefinition
): def is ChoiceTypeDefinition {
  return def.type === 'choice' && 'choices' in def
}

export function hasEnumValue(
  def: TypeDefinition
): def is TypeDefinition & { enum: unknown[] } {
  return 'enum' in def && Array.isArray(def.enum)
}

export function hasConstValue(
  def: TypeDefinition
): def is TypeDefinition & { const: unknown } {
  return 'const' in def
}

// =============================================================================
// Utility Functions
// =============================================================================

/** Get the resolved type from a type specifier, handling arrays and references */
export function getResolvedType(
  specifier: TypeSpecifier | undefined
): string | string[] | null {
  if (specifier === undefined) return null
  if (typeof specifier === 'string') return specifier
  if (Array.isArray(specifier)) return specifier
  if (isTypeReference(specifier)) return null // Needs resolution
  return null
}

/** Check if a type specifier includes null (making the type nullable) */
export function isNullableType(specifier: TypeSpecifier | undefined): boolean {
  if (specifier === undefined) return false
  if (specifier === 'null') return true
  if (Array.isArray(specifier)) return specifier.includes('null')
  return false
}

/** Get non-null types from a type specifier array */
export function getNonNullTypes(specifier: TypeSpecifier): TypeKeyword[] {
  if (typeof specifier === 'string')
    return specifier === 'null' ? [] : [specifier]
  if (Array.isArray(specifier))
    return specifier.filter((t): t is TypeKeyword => t !== 'null')
  return []
}

/** Integer type bounds */
export const INTEGER_BOUNDS: Record<IntegerType, { min: bigint; max: bigint }> =
  {
    int8: { min: -128n, max: 127n },
    int16: { min: -32768n, max: 32767n },
    int32: { min: -2147483648n, max: 2147483647n },
    int64: { min: -9223372036854775808n, max: 9223372036854775807n },
    int128: {
      min: -170141183460469231731687303715884105728n,
      max: 170141183460469231731687303715884105727n,
    },
    uint8: { min: 0n, max: 255n },
    uint16: { min: 0n, max: 65535n },
    uint32: { min: 0n, max: 4294967295n },
    uint64: { min: 0n, max: 18446744073709551615n },
    uint128: { min: 0n, max: 340282366920938463463374607431768211455n },
  }
