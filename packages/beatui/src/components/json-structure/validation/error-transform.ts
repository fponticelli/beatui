/**
 * Validation Error Transformation
 *
 * Transforms raw validation errors into user-friendly messages.
 */

import type { TypeDefinition, IntegerType } from '../structure-types'
import { INTEGER_BOUNDS, isIntegerType } from '../structure-types'

/**
 * Validation error from the JSON Structure validator
 */
export interface RawValidationError {
  /** JSON Pointer path to error location */
  path: string
  /** Error type/code */
  type: string
  /** Expected value/constraint */
  expected?: unknown
  /** Actual value */
  actual?: unknown
  /** Additional context */
  context?: Record<string, unknown>
}

/**
 * User-friendly validation error
 */
export interface FormattedValidationError {
  /** JSON Pointer path to error location */
  path: string
  /** Human-readable error message */
  message: string
  /** Original error type for programmatic handling */
  code: string
}

/**
 * Transform a raw validation error into a user-friendly message
 */
export function formatValidationError(
  error: RawValidationError,
  definition?: TypeDefinition
): FormattedValidationError {
  const message = getErrorMessage(error, definition)
  return {
    path: error.path,
    message,
    code: error.type,
  }
}

/**
 * Transform multiple validation errors
 */
export function formatValidationErrors(
  errors: RawValidationError[],
  definitions?: Map<string, TypeDefinition>
): FormattedValidationError[] {
  return errors.map(error => {
    const definition = definitions?.get(error.path)
    return formatValidationError(error, definition)
  })
}

/**
 * Generate a user-friendly error message
 */
function getErrorMessage(
  error: RawValidationError,
  definition?: TypeDefinition
): string {
  switch (error.type) {
    // Type errors
    case 'type':
      return `Expected ${formatTypeExpected(error.expected)}, got ${formatTypeActual(error.actual)}`

    case 'type_mismatch':
      return `Value must be of type ${formatTypeExpected(error.expected)}`

    // String validation
    case 'minLength':
      return `Must be at least ${error.expected} characters`

    case 'maxLength':
      return `Must be no more than ${error.expected} characters`

    case 'pattern':
      return formatPatternError(error, definition)

    case 'format':
      return formatFormatError(error)

    // Numeric validation
    case 'minimum':
      return `Must be at least ${error.expected}`

    case 'maximum':
      return `Must be at most ${error.expected}`

    case 'exclusiveMinimum':
      return `Must be greater than ${error.expected}`

    case 'exclusiveMaximum':
      return `Must be less than ${error.expected}`

    case 'multipleOf':
      return `Must be a multiple of ${error.expected}`

    case 'integer_bounds':
      return formatIntegerBoundsError(error)

    // Array/Set validation
    case 'minItems':
      return `Must have at least ${error.expected} items`

    case 'maxItems':
      return `Must have no more than ${error.expected} items`

    case 'uniqueItems':
      return 'All items must be unique'

    case 'contains':
      return `Must contain at least one matching item`

    case 'minContains':
      return `Must contain at least ${error.expected} matching items`

    case 'maxContains':
      return `Must contain no more than ${error.expected} matching items`

    // Object validation
    case 'required':
      return 'This field is required'

    case 'minProperties':
      return `Must have at least ${error.expected} properties`

    case 'maxProperties':
      return `Must have no more than ${error.expected} properties`

    case 'additionalProperties':
      return `Unknown property: ${error.actual}`

    case 'dependentRequired':
      return formatDependentRequiredError(error)

    // Enum/Const validation
    case 'enum':
      return formatEnumError(error)

    case 'const':
      return `Must be exactly ${JSON.stringify(error.expected)}`

    // Reference errors
    case 'ref_not_found':
      return `Invalid reference: ${error.expected}`

    case 'circular_ref':
      return 'Circular reference detected'

    // Generic
    case 'invalid':
      return 'Invalid value'

    default:
      return (
        (error.context?.message as string) ?? `Validation error: ${error.type}`
      )
  }
}

/**
 * Format the expected type for display
 */
function formatTypeExpected(expected: unknown): string {
  if (typeof expected === 'string') {
    return formatTypeName(expected)
  }
  if (Array.isArray(expected)) {
    return expected.map(formatTypeName).join(' or ')
  }
  return String(expected)
}

/**
 * Format the actual type for display
 */
function formatTypeActual(actual: unknown): string {
  if (actual === null) return 'null'
  if (actual === undefined) return 'undefined'
  return typeof actual
}

/**
 * Format a type name for display
 */
function formatTypeName(type: string): string {
  // Map technical type names to user-friendly names
  const typeNames: Record<string, string> = {
    string: 'text',
    boolean: 'true/false',
    int8: 'integer (-128 to 127)',
    int16: 'integer (-32768 to 32767)',
    int32: 'integer',
    int64: 'large integer',
    int128: 'very large integer',
    uint8: 'positive integer (0 to 255)',
    uint16: 'positive integer (0 to 65535)',
    uint32: 'positive integer',
    uint64: 'large positive integer',
    uint128: 'very large positive integer',
    float: 'decimal number',
    double: 'decimal number',
    decimal: 'decimal number',
    date: 'date',
    datetime: 'date and time',
    time: 'time',
    duration: 'duration',
    uuid: 'UUID',
    uri: 'URL',
    binary: 'binary data',
    object: 'object',
    array: 'list',
    set: 'unique list',
    map: 'key-value pairs',
    tuple: 'ordered list',
    choice: 'one of multiple options',
    any: 'any value',
    null: 'empty',
  }

  return typeNames[type] ?? type
}

/**
 * Format a pattern error with context
 */
function formatPatternError(
  error: RawValidationError,
  definition?: TypeDefinition
): string {
  // Check for custom pattern description in definition
  const patternDescription = definition?.description
  if (patternDescription && error.type === 'pattern') {
    return `Does not match required format: ${patternDescription}`
  }

  // Try to provide helpful message for common patterns
  const pattern = error.expected as string
  if (pattern) {
    const knownPatterns: Record<string, string> = {
      '^[a-zA-Z]+$': 'letters only',
      '^[0-9]+$': 'numbers only',
      '^[a-zA-Z0-9]+$': 'letters and numbers only',
      '^\\S+$': 'no spaces allowed',
      '^[a-z]+$': 'lowercase letters only',
      '^[A-Z]+$': 'uppercase letters only',
    }

    const description = knownPatterns[pattern]
    if (description) {
      return `Must be ${description}`
    }
  }

  return 'Does not match required format'
}

/**
 * Format a format error
 */
function formatFormatError(error: RawValidationError): string {
  const format = error.expected as string
  const formatMessages: Record<string, string> = {
    email: 'Must be a valid email address',
    'date-time': 'Must be a valid date and time',
    date: 'Must be a valid date',
    time: 'Must be a valid time',
    uri: 'Must be a valid URL',
    'uri-reference': 'Must be a valid URL or relative path',
    uuid: 'Must be a valid UUID',
    hostname: 'Must be a valid hostname',
    ipv4: 'Must be a valid IPv4 address',
    ipv6: 'Must be a valid IPv6 address',
    regex: 'Must be a valid regular expression',
    'json-pointer': 'Must be a valid JSON pointer',
  }

  return formatMessages[format] ?? `Must be a valid ${format}`
}

/**
 * Format an integer bounds error
 */
function formatIntegerBoundsError(error: RawValidationError): string {
  const intType = error.context?.type as string
  if (intType && isIntegerType(intType)) {
    const bounds = INTEGER_BOUNDS[intType as IntegerType]
    return `Must be between ${bounds.min} and ${bounds.max}`
  }
  return 'Value is out of range for this integer type'
}

/**
 * Format a dependent required error
 */
function formatDependentRequiredError(error: RawValidationError): string {
  const dependent = error.context?.dependent as string
  const required = error.context?.required as string[]
  if (dependent && required?.length) {
    return `When "${dependent}" is present, "${required.join('", "')}" must also be provided`
  }
  return 'Missing required dependent fields'
}

/**
 * Format an enum error
 */
function formatEnumError(error: RawValidationError): string {
  const allowed = error.expected as unknown[]
  if (allowed && allowed.length <= 5) {
    const formatted = allowed.map(v => JSON.stringify(v)).join(', ')
    return `Must be one of: ${formatted}`
  }
  return 'Invalid value'
}

/**
 * Group errors by path for display
 */
export function groupErrorsByPath(
  errors: FormattedValidationError[]
): Map<string, FormattedValidationError[]> {
  const grouped = new Map<string, FormattedValidationError[]>()

  for (const error of errors) {
    const existing = grouped.get(error.path) ?? []
    existing.push(error)
    grouped.set(error.path, existing)
  }

  return grouped
}

/**
 * Get errors for a specific path
 */
export function getErrorsForPath(
  errors: FormattedValidationError[],
  path: string
): FormattedValidationError[] {
  return errors.filter(e => e.path === path)
}

/**
 * Check if a path has errors
 */
export function hasErrorsAtPath(
  errors: FormattedValidationError[],
  path: string
): boolean {
  return errors.some(e => e.path === path)
}

/**
 * Get child errors for a path (errors with paths that start with the given path)
 */
export function getChildErrors(
  errors: FormattedValidationError[],
  parentPath: string
): FormattedValidationError[] {
  const prefix = parentPath === '' ? '/' : `${parentPath}/`
  return errors.filter(e => e.path.startsWith(prefix))
}
