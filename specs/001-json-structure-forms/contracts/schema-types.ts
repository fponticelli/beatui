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

export type CompoundType = 'object' | 'array' | 'set' | 'map' | 'tuple' | 'choice' | 'any'

export type TypeKeyword = PrimitiveType | CompoundType

// =============================================================================
// Type Reference
// =============================================================================

export interface TypeReference {
  $ref: string
}

export type TypeSpecifier = TypeKeyword | TypeKeyword[] | TypeReference

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
  [key: `lang:${string}`]: string
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
  type: TypeSpecifier
  $extends?: string | string[]
}

export interface ObjectTypeDefinition extends BaseTypeDefinition {
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
  type: 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128'
}

export interface FloatTypeDefinition extends BaseTypeDefinition, NumericValidation {
  type: 'float' | 'double'
}

export interface EnumTypeDefinition extends BaseTypeDefinition {
  enum: unknown[]
}

export interface ConstTypeDefinition extends BaseTypeDefinition {
  const: unknown
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
  | EnumTypeDefinition
  | ConstTypeDefinition

// =============================================================================
// Schema Document
// =============================================================================

export interface JSONStructureSchema {
  $schema: string
  $id: string
  name: string
  $root?: string
  type?: TypeSpecifier
  definitions?: Record<string, TypeDefinition | Record<string, TypeDefinition>>
  $uses?: string[]
  // Root-level properties if type is object
  properties?: Record<string, TypeDefinition>
  required?: string[] | string[][]
}

// =============================================================================
// Namespace (for definitions hierarchy)
// =============================================================================

export type Namespace = Record<string, TypeDefinition | Namespace>

export function isNamespace(value: TypeDefinition | Namespace): value is Namespace {
  return typeof value === 'object' && !('type' in value) && !('$ref' in value)
}

export function isTypeDefinition(value: TypeDefinition | Namespace): value is TypeDefinition {
  return typeof value === 'object' && ('type' in value || '$ref' in value || 'enum' in value || 'const' in value)
}
