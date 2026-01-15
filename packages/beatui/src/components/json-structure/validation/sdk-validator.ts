/**
 * SDK Validator Wrapper
 *
 * Wraps the JSON Structure SDK validator (when available)
 * or provides a basic fallback validator.
 *
 * Note: This is a placeholder implementation. When @json-structure/sdk
 * becomes available, this should be updated to use the official validator.
 */

import type {
  JSONStructureSchema,
  TypeDefinition,
  IntegerType,
  TypeKeyword,
} from '../structure-types'
import {
  isIntegerType,
  isFloatType,
  isTemporalType,
  INTEGER_BOUNDS,
  isObjectTypeDefinition,
  isArrayTypeDefinition,
  isSetTypeDefinition,
  isMapTypeDefinition,
  isTupleTypeDefinition,
  isChoiceTypeDefinition,
} from '../structure-types'
import type { RawValidationError } from './error-transform'

/**
 * Validation result
 */
export interface ValidationResult {
  /** Overall validity */
  isValid: boolean
  /** List of validation errors */
  errors: RawValidationError[]
}

/**
 * Validator options
 */
export interface ValidatorOptions {
  /** Stop at first error */
  stopOnFirstError?: boolean
  /** Coerce types where possible */
  coerceTypes?: boolean
}

/**
 * JSON Structure validator
 */
export interface StructureValidator {
  /** Validate a value against the schema */
  validate(value: unknown): ValidationResult
  /** Validate a value at a specific path */
  validateAt(value: unknown, path: string): ValidationResult
}

/**
 * Create a validator for a schema
 */
export function createValidator(
  schema: JSONStructureSchema,
  options?: ValidatorOptions
): StructureValidator {
  return new BasicValidator(schema, options)
}

/**
 * Basic validator implementation
 *
 * This is a fallback validator that provides basic type checking.
 * It should be replaced with the official SDK validator when available.
 */
class BasicValidator implements StructureValidator {
  private readonly schema: JSONStructureSchema
  private readonly options: ValidatorOptions

  constructor(schema: JSONStructureSchema, options?: ValidatorOptions) {
    this.schema = schema
    this.options = options ?? {}
  }

  validate(value: unknown): ValidationResult {
    const errors: RawValidationError[] = []
    this.validateValue(
      value,
      this.schema as unknown as TypeDefinition,
      '',
      errors
    )
    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  validateAt(value: unknown, _path: string): ValidationResult {
    // For now, just validate the entire value
    // A full implementation would navigate to the path first
    // _path is reserved for future partial validation
    return this.validate(value)
  }

  private validateValue(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): void {
    if (this.options.stopOnFirstError && errors.length > 0) {
      return
    }

    // Handle null
    if (value === null) {
      // Check if null is allowed
      const typeSpec = definition.type
      if (typeSpec === 'null') return
      if (Array.isArray(typeSpec) && typeSpec.includes('null')) return

      errors.push({
        path,
        type: 'type',
        expected: typeSpec,
        actual: 'null',
      })
      return
    }

    // Handle enum
    if ('enum' in definition && Array.isArray(definition.enum)) {
      if (!definition.enum.includes(value)) {
        errors.push({
          path,
          type: 'enum',
          expected: definition.enum,
          actual: value,
        })
      }
      return
    }

    // Handle const
    if ('const' in definition) {
      if (value !== (definition as { const: unknown }).const) {
        errors.push({
          path,
          type: 'const',
          expected: (definition as { const: unknown }).const,
          actual: value,
        })
      }
      return
    }

    // Get the primary type
    const typeSpec = definition.type
    if (!typeSpec) return // No type constraint

    // Handle type as array or single value, excluding TypeReference
    const typeArray = Array.isArray(typeSpec) ? typeSpec : [typeSpec]
    // Filter out TypeReference objects (which have $ref) - they need resolution first
    const types = typeArray.filter(
      (t): t is TypeKeyword => typeof t === 'string'
    )
    const validType = types.some(type =>
      this.checkType(value, type, definition, path, errors)
    )

    if (!validType && types.length > 0) {
      errors.push({
        path,
        type: 'type',
        expected: typeSpec,
        actual: typeof value,
      })
    }
  }

  private checkType(
    value: unknown,
    type: string,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    switch (type) {
      case 'string':
        return this.validateString(value, definition, path, errors)
      case 'boolean':
        return typeof value === 'boolean'
      case 'null':
        return value === null
      case 'object':
        return this.validateObject(value, definition, path, errors)
      case 'array':
        return this.validateArray(value, definition, path, errors)
      case 'set':
        return this.validateSet(value, definition, path, errors)
      case 'map':
        return this.validateMap(value, definition, path, errors)
      case 'tuple':
        return this.validateTuple(value, definition, path, errors)
      case 'choice':
        return this.validateChoice(value, definition, path, errors)
      case 'any':
        return true
      default:
        if (isIntegerType(type)) {
          return this.validateInteger(value, type, definition, path, errors)
        }
        if (isFloatType(type)) {
          return this.validateFloat(value, definition, path, errors)
        }
        if (isTemporalType(type)) {
          return this.validateTemporal(value, type, path, errors)
        }
        if (type === 'uuid') {
          return this.validateUuid(value, path, errors)
        }
        if (type === 'uri') {
          return this.validateUri(value, path, errors)
        }
        if (type === 'binary') {
          return this.validateBinary(value, path, errors)
        }
        return false
    }
  }

  private validateString(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'string') return false

    const def = definition as {
      minLength?: number
      maxLength?: number
      pattern?: string
      format?: string
    }

    if (def.minLength !== undefined && value.length < def.minLength) {
      errors.push({
        path,
        type: 'minLength',
        expected: def.minLength,
        actual: value.length,
      })
    }

    if (def.maxLength !== undefined && value.length > def.maxLength) {
      errors.push({
        path,
        type: 'maxLength',
        expected: def.maxLength,
        actual: value.length,
      })
    }

    if (def.pattern !== undefined) {
      try {
        const regex = new RegExp(def.pattern)
        if (!regex.test(value)) {
          errors.push({
            path,
            type: 'pattern',
            expected: def.pattern,
            actual: value,
          })
        }
      } catch {
        // Invalid regex pattern
      }
    }

    return true
  }

  private validateInteger(
    value: unknown,
    type: string,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    // Accept number or bigint
    if (typeof value !== 'number' && typeof value !== 'bigint') return false

    // Check if it's a whole number
    if (typeof value === 'number' && !Number.isInteger(value)) {
      errors.push({ path, type: 'type', expected: type, actual: 'float' })
      return false
    }

    // Check bounds for the specific integer type
    if (isIntegerType(type)) {
      const bounds = INTEGER_BOUNDS[type as IntegerType]
      const bigValue =
        typeof value === 'bigint' ? value : BigInt(Math.round(value as number))

      if (bigValue < bounds.min || bigValue > bounds.max) {
        errors.push({
          path,
          type: 'integer_bounds',
          expected: { min: bounds.min.toString(), max: bounds.max.toString() },
          actual: bigValue.toString(),
          context: { type },
        })
      }
    }

    // Check numeric constraints
    this.validateNumericConstraints(value, definition, path, errors)

    return true
  }

  private validateFloat(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'number') return false

    this.validateNumericConstraints(value, definition, path, errors)

    return true
  }

  private validateNumericConstraints(
    value: number | bigint,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): void {
    const def = definition as {
      minimum?: number | string
      maximum?: number | string
      exclusiveMinimum?: number | string
      exclusiveMaximum?: number | string
      multipleOf?: number
    }

    const numValue = typeof value === 'bigint' ? Number(value) : value

    if (def.minimum !== undefined) {
      const min =
        typeof def.minimum === 'string' ? Number(def.minimum) : def.minimum
      if (numValue < min) {
        errors.push({ path, type: 'minimum', expected: min, actual: numValue })
      }
    }

    if (def.maximum !== undefined) {
      const max =
        typeof def.maximum === 'string' ? Number(def.maximum) : def.maximum
      if (numValue > max) {
        errors.push({ path, type: 'maximum', expected: max, actual: numValue })
      }
    }

    if (def.exclusiveMinimum !== undefined) {
      const min =
        typeof def.exclusiveMinimum === 'string'
          ? Number(def.exclusiveMinimum)
          : def.exclusiveMinimum
      if (numValue <= min) {
        errors.push({
          path,
          type: 'exclusiveMinimum',
          expected: min,
          actual: numValue,
        })
      }
    }

    if (def.exclusiveMaximum !== undefined) {
      const max =
        typeof def.exclusiveMaximum === 'string'
          ? Number(def.exclusiveMaximum)
          : def.exclusiveMaximum
      if (numValue >= max) {
        errors.push({
          path,
          type: 'exclusiveMaximum',
          expected: max,
          actual: numValue,
        })
      }
    }

    if (def.multipleOf !== undefined && typeof value === 'number') {
      if (value % def.multipleOf !== 0) {
        errors.push({
          path,
          type: 'multipleOf',
          expected: def.multipleOf,
          actual: value,
        })
      }
    }
  }

  private validateTemporal(
    value: unknown,
    type: string,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'string') return false

    // Basic ISO format validation
    const patterns: Record<string, RegExp> = {
      date: /^\d{4}-\d{2}-\d{2}$/,
      datetime:
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/,
      time: /^\d{2}:\d{2}:\d{2}(\.\d+)?$/,
      duration: /^P(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(\d+H)?(\d+M)?(\d+S)?)?$/,
    }

    const pattern = patterns[type]
    if (pattern && !pattern.test(value)) {
      errors.push({ path, type: 'format', expected: type, actual: value })
      return false
    }

    return true
  }

  private validateUuid(
    value: unknown,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'string') return false

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(value)) {
      errors.push({ path, type: 'format', expected: 'uuid', actual: value })
      return false
    }

    return true
  }

  private validateUri(
    value: unknown,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'string') return false

    try {
      new URL(value)
      return true
    } catch {
      errors.push({ path, type: 'format', expected: 'uri', actual: value })
      return false
    }
  }

  private validateBinary(
    value: unknown,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    // Accept base64 string or Uint8Array
    if (value instanceof Uint8Array) return true
    if (typeof value !== 'string') return false

    // Basic base64 validation
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/
    if (!base64Pattern.test(value)) {
      errors.push({ path, type: 'format', expected: 'binary', actual: value })
      return false
    }

    return true
  }

  private validateObject(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }

    if (!isObjectTypeDefinition(definition)) return true

    const obj = value as Record<string, unknown>

    // Validate required properties
    const required = definition.required
    if (required) {
      const requiredProps = Array.isArray(required[0])
        ? (required as string[][]).flat()
        : (required as string[])

      for (const prop of requiredProps) {
        if (!(prop in obj)) {
          errors.push({
            path: path ? `${path}/${prop}` : `/${prop}`,
            type: 'required',
            expected: prop,
          })
        }
      }
    }

    // Validate each property
    for (const [key, propValue] of Object.entries(obj)) {
      const propDef = definition.properties?.[key]
      if (propDef) {
        const propPath = path ? `${path}/${key}` : `/${key}`
        this.validateValue(propValue, propDef, propPath, errors)
      } else if (definition.additionalProperties === false) {
        errors.push({
          path: path ? `${path}/${key}` : `/${key}`,
          type: 'additionalProperties',
          actual: key,
        })
      } else if (typeof definition.additionalProperties === 'object') {
        const propPath = path ? `${path}/${key}` : `/${key}`
        this.validateValue(
          propValue,
          definition.additionalProperties,
          propPath,
          errors
        )
      }
    }

    return true
  }

  private validateArray(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (!Array.isArray(value)) return false

    if (!isArrayTypeDefinition(definition)) return true

    // Check array constraints
    const def = definition as {
      minItems?: number
      maxItems?: number
      uniqueItems?: boolean
    }

    if (def.minItems !== undefined && value.length < def.minItems) {
      errors.push({
        path,
        type: 'minItems',
        expected: def.minItems,
        actual: value.length,
      })
    }

    if (def.maxItems !== undefined && value.length > def.maxItems) {
      errors.push({
        path,
        type: 'maxItems',
        expected: def.maxItems,
        actual: value.length,
      })
    }

    // Validate each item
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${path}/${i}`
      this.validateValue(value[i], definition.items, itemPath, errors)
    }

    return true
  }

  private validateSet(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (!Array.isArray(value)) return false

    if (!isSetTypeDefinition(definition)) return true

    // Check for uniqueness
    const seen = new Set<string>()
    for (let i = 0; i < value.length; i++) {
      const key = JSON.stringify(value[i])
      if (seen.has(key)) {
        errors.push({
          path: `${path}/${i}`,
          type: 'uniqueItems',
          actual: value[i],
        })
      }
      seen.add(key)
    }

    // Validate items as array
    return this.validateArray(value, definition, path, errors)
  }

  private validateMap(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }

    if (!isMapTypeDefinition(definition)) return true

    const obj = value as Record<string, unknown>

    // Validate each value
    for (const [key, propValue] of Object.entries(obj)) {
      const propPath = `${path}/${key}`
      this.validateValue(propValue, definition.values, propPath, errors)
    }

    return true
  }

  private validateTuple(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (!Array.isArray(value)) return false

    if (!isTupleTypeDefinition(definition)) return true

    // Check tuple length
    const expectedLength = definition.tuple.length
    if (value.length !== expectedLength) {
      errors.push({
        path,
        type: 'tuple_length',
        expected: expectedLength,
        actual: value.length,
      })
    }

    // Validate each element
    for (let i = 0; i < definition.tuple.length; i++) {
      const propName = definition.tuple[i]
      const propDef = definition.properties?.[propName]
      if (propDef && i < value.length) {
        this.validateValue(value[i], propDef, `${path}/${i}`, errors)
      }
    }

    return true
  }

  private validateChoice(
    value: unknown,
    definition: TypeDefinition,
    path: string,
    errors: RawValidationError[]
  ): boolean {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }

    if (!isChoiceTypeDefinition(definition)) return true

    const obj = value as Record<string, unknown>
    const choices = Object.keys(definition.choices)

    // Find which choice this matches
    const choiceKey = Object.keys(obj).find(k => choices.includes(k))

    if (!choiceKey) {
      errors.push({
        path,
        type: 'choice',
        expected: choices,
        actual: Object.keys(obj),
      })
      return false
    }

    // Validate the chosen variant
    const choiceDef = definition.choices[choiceKey]
    if (choiceDef) {
      this.validateValue(
        obj[choiceKey],
        choiceDef,
        `${path}/${choiceKey}`,
        errors
      )
    }

    return true
  }
}

/**
 * Validate a value against a schema (convenience function)
 */
export function validate(
  schema: JSONStructureSchema,
  value: unknown,
  options?: ValidatorOptions
): ValidationResult {
  const validator = createValidator(schema, options)
  return validator.validate(value)
}
