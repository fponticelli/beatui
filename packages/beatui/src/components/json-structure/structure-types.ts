/**
 * JSON Structure Schema Type Definitions
 *
 * Based on JSON Structure Core specification
 * https://json-structure.org/
 */

// =============================================================================
// Primitive Type Keywords
// =============================================================================

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

export type CompoundType =
  | 'object'
  | 'array'
  | 'set'
  | 'map'
  | 'tuple'
  | 'choice'
  | 'any'

export type TypeKeyword = PrimitiveType | CompoundType

/** Integer types that require BigInt for full precision */
export type BigIntType = 'int64' | 'int128' | 'uint64' | 'uint128'

/** Check if a type requires BigInt handling */
export function isBigIntType(type: string): type is BigIntType {
  return type === 'int64' || type === 'int128' || type === 'uint64' || type === 'uint128'
}

/** All signed integer types */
export type SignedIntegerType = 'int8' | 'int16' | 'int32' | 'int64' | 'int128'

/** All unsigned integer types */
export type UnsignedIntegerType = 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128'

/** All integer types */
export type IntegerType = SignedIntegerType | UnsignedIntegerType

/** Check if a type is an integer type */
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

/** All floating-point types */
export type FloatType = 'float' | 'double' | 'decimal'

/** Check if a type is a floating-point type */
export function isFloatType(type: string): type is FloatType {
  return type === 'float' || type === 'double' || type === 'decimal'
}

/** All numeric types */
export type NumericType = IntegerType | FloatType

/** Check if a type is numeric */
export function isNumericType(type: string): type is NumericType {
  return isIntegerType(type) || isFloatType(type)
}

/** All temporal types */
export type TemporalType = 'date' | 'datetime' | 'time' | 'duration'

/** Check if a type is temporal */
export function isTemporalType(type: string): type is TemporalType {
  return type === 'date' || type === 'datetime' || type === 'time' || type === 'duration'
}

/** Check if a type is primitive */
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

/** Check if a type is compound/complex */
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

export interface TypeReference {
  $ref: string
}

export type TypeSpecifier = TypeKeyword | TypeKeyword[] | TypeReference

/** Check if a value is a type reference */
export function isTypeReference(value: unknown): value is TypeReference {
  return typeof value === 'object' && value !== null && '$ref' in value
}

// =============================================================================
// Validation Constraints (from Validation Extension)
// =============================================================================

export interface StringValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
}

export interface NumericValidation {
  minimum?: number | string // string for BigInt
  maximum?: number | string
  exclusiveMinimum?: number | string
  exclusiveMaximum?: number | string
  multipleOf?: number
}

export interface ArrayValidation {
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
  contains?: TypeDefinition
  minContains?: number
  maxContains?: number
}

export interface ObjectValidation {
  minProperties?: number
  maxProperties?: number
  dependentRequired?: Record<string, string[]>
}

// =============================================================================
// Metadata
// =============================================================================

export interface Altnames {
  json?: string
  [key: `lang:${string}`]: string | undefined
}

export interface TypeMetadata {
  name?: string
  description?: string
  examples?: unknown[]
  deprecated?: boolean
  abstract?: boolean
  altnames?: Altnames
  unit?: string
  currency?: string
  default?: unknown
}

// =============================================================================
// Type Definitions
// =============================================================================

export interface BaseTypeDefinition extends TypeMetadata {
  type?: TypeSpecifier
  $extends?: string | string[]
  enum?: unknown[]
  const?: unknown
}

export interface ObjectTypeDefinition extends BaseTypeDefinition, ObjectValidation {
  type: 'object'
  properties: Record<string, TypeDefinition>
  required?: string[] | string[][]
  additionalProperties?: boolean | TypeDefinition
}

export interface ArrayTypeDefinition extends BaseTypeDefinition, ArrayValidation {
  type: 'array'
  items: TypeDefinition
}

export interface SetTypeDefinition extends BaseTypeDefinition, ArrayValidation {
  type: 'set'
  items: TypeDefinition
}

export interface MapTypeDefinition extends BaseTypeDefinition, ObjectValidation {
  type: 'map'
  values: TypeDefinition
}

export interface TupleTypeDefinition extends BaseTypeDefinition {
  type: 'tuple'
  properties: Record<string, TypeDefinition>
  tuple: string[]
}

export interface ChoiceTypeDefinition extends BaseTypeDefinition {
  type: 'choice'
  choices: Record<string, TypeDefinition>
  selector?: string
}

export interface DecimalTypeDefinition extends BaseTypeDefinition, NumericValidation {
  type: 'decimal'
  precision?: number
  scale?: number
}

export interface StringTypeDefinition extends BaseTypeDefinition, StringValidation {
  type: 'string'
}

export interface IntegerTypeDefinition extends BaseTypeDefinition, NumericValidation {
  type: IntegerType
}

export interface FloatTypeDefinition extends BaseTypeDefinition, NumericValidation {
  type: 'float' | 'double'
}

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

export interface JSONStructureSchema extends BaseTypeDefinition, ObjectValidation {
  $schema: string
  $id: string
  name: string
  $root?: string
  definitions?: Record<string, TypeDefinition | Namespace>
  $uses?: string[]
  // Root-level properties if type is object
  properties?: Record<string, TypeDefinition>
  required?: string[] | string[][]
}

// =============================================================================
// Namespace (for definitions hierarchy)
// =============================================================================

export interface Namespace {
  [key: string]: TypeDefinition | Namespace
}

/** Check if a value is a namespace (contains nested definitions but isn't a type itself) */
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

/** Check if a value is a type definition */
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

export function isObjectTypeDefinition(def: TypeDefinition): def is ObjectTypeDefinition {
  return def.type === 'object' && 'properties' in def
}

export function isArrayTypeDefinition(def: TypeDefinition): def is ArrayTypeDefinition {
  return def.type === 'array' && 'items' in def
}

export function isSetTypeDefinition(def: TypeDefinition): def is SetTypeDefinition {
  return def.type === 'set' && 'items' in def
}

export function isMapTypeDefinition(def: TypeDefinition): def is MapTypeDefinition {
  return def.type === 'map' && 'values' in def
}

export function isTupleTypeDefinition(def: TypeDefinition): def is TupleTypeDefinition {
  return def.type === 'tuple' && 'tuple' in def
}

export function isChoiceTypeDefinition(def: TypeDefinition): def is ChoiceTypeDefinition {
  return def.type === 'choice' && 'choices' in def
}

export function hasEnumValue(def: TypeDefinition): def is TypeDefinition & { enum: unknown[] } {
  return 'enum' in def && Array.isArray(def.enum)
}

export function hasConstValue(def: TypeDefinition): def is TypeDefinition & { const: unknown } {
  return 'const' in def
}

// =============================================================================
// Utility Functions
// =============================================================================

/** Get the resolved type from a type specifier, handling arrays and references */
export function getResolvedType(specifier: TypeSpecifier | undefined): string | string[] | null {
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
  if (typeof specifier === 'string') return specifier === 'null' ? [] : [specifier]
  if (Array.isArray(specifier)) return specifier.filter((t): t is TypeKeyword => t !== 'null')
  return []
}

/** Integer type bounds */
export const INTEGER_BOUNDS: Record<IntegerType, { min: bigint; max: bigint }> = {
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
