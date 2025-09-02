import type { JSONSchema } from '../schema-context'
import { computedOf, type Signal } from '@tempots/dom'

/**
 * Visibility condition configuration
 */
export interface VisibilityCondition {
  /** Field path to watch (relative to current context) */
  field: string
  /** Comparison operator */
  operator:
    | 'equals'
    | 'notEquals'
    | 'truthy'
    | 'falsy'
    | 'contains'
    | 'notContains'
    | 'greaterThan'
    | 'lessThan'
    | 'greaterThanOrEqual'
    | 'lessThanOrEqual'
    | 'in'
    | 'notIn'
  /** Value to compare against (not needed for truthy/falsy) */
  value?: unknown
  /** Multiple values for 'in'/'notIn' operators */
  values?: unknown[]
}

/**
 * Complex visibility expression
 */
export interface VisibilityExpression {
  /** Logical operator */
  operator: 'and' | 'or' | 'not'
  /** Child conditions or expressions */
  conditions: (VisibilityCondition | VisibilityExpression)[]
}

/**
 * Visibility configuration from x:ui
 */
export type VisibilityConfig =
  | VisibilityCondition
  | VisibilityExpression
  | string

/**
 * Extract visibility configuration from schema x:ui
 */
export function getVisibilityConfig(
  schema: JSONSchema
): VisibilityConfig | undefined {
  if (typeof schema === 'boolean') return undefined

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui || !xui.visibleIf) return undefined

  const visibleIf = xui.visibleIf

  // Handle string expressions (simple field references)
  if (typeof visibleIf === 'string') {
    return visibleIf
  }

  // Handle object expressions
  if (typeof visibleIf === 'object' && visibleIf !== null) {
    return visibleIf as VisibilityCondition | VisibilityExpression
  }

  return undefined
}

/**
 * Parse simple string expressions into visibility conditions
 */
function parseStringExpression(expression: string): VisibilityCondition {
  // Handle simple patterns like "field", "!field", "field=value", "field!=value"

  // Negation
  if (expression.startsWith('!')) {
    return {
      field: expression.slice(1),
      operator: 'falsy',
    }
  }

  // Equality checks
  if (expression.includes('!=')) {
    const [field, value] = expression.split('!=', 2)
    return {
      field: field.trim(),
      operator: 'notEquals',
      value: parseValue(value.trim()),
    }
  }

  if (expression.includes('=')) {
    const [field, value] = expression.split('=', 2)
    return {
      field: field.trim(),
      operator: 'equals',
      value: parseValue(value.trim()),
    }
  }

  // Simple field reference (truthy check)
  return {
    field: expression.trim(),
    operator: 'truthy',
  }
}

/**
 * Parse string values into appropriate types
 */
function parseValue(value: string): unknown {
  // Remove quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1)
  }

  // Boolean values
  if (value === 'true') return true
  if (value === 'false') return false

  // Null/undefined
  if (value === 'null') return null
  if (value === 'undefined') return undefined

  // Numbers
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value)
  }

  // Default to string
  return value
}

/**
 * Get field value from form data using dot notation
 */
function getFieldValue(formData: unknown, fieldPath: string): unknown {
  if (formData == null || typeof formData !== 'object') {
    return undefined
  }

  const segments = fieldPath.split('.')
  let current = formData

  for (const segment of segments) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10)
      if (!isNaN(index)) {
        current = current[index]
      } else {
        return undefined
      }
    } else {
      current = (current as Record<string, unknown>)[segment] as object
    }
  }

  return current
}

/**
 * Evaluate a single visibility condition
 */
function evaluateCondition(
  condition: VisibilityCondition,
  formData: unknown
): boolean {
  const fieldValue = getFieldValue(formData, condition.field)

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value

    case 'notEquals':
      return fieldValue !== condition.value

    case 'truthy':
      return Boolean(fieldValue)

    case 'falsy':
      return !fieldValue

    case 'contains':
      if (
        typeof fieldValue === 'string' &&
        typeof condition.value === 'string'
      ) {
        return fieldValue.includes(condition.value)
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(condition.value)
      }
      return false

    case 'notContains':
      if (
        typeof fieldValue === 'string' &&
        typeof condition.value === 'string'
      ) {
        return !fieldValue.includes(condition.value)
      }
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(condition.value)
      }
      return true

    case 'greaterThan':
      return (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number' &&
        fieldValue > condition.value
      )

    case 'lessThan':
      return (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number' &&
        fieldValue < condition.value
      )

    case 'greaterThanOrEqual':
      return (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number' &&
        fieldValue >= condition.value
      )

    case 'lessThanOrEqual':
      return (
        typeof fieldValue === 'number' &&
        typeof condition.value === 'number' &&
        fieldValue <= condition.value
      )

    case 'in':
      return (
        Array.isArray(condition.values) && condition.values.includes(fieldValue)
      )

    case 'notIn':
      return (
        !Array.isArray(condition.values) ||
        !condition.values.includes(fieldValue)
      )

    default:
      return false
  }
}

/**
 * Evaluate a visibility expression
 */
function evaluateExpression(
  expression: VisibilityExpression,
  formData: unknown
): boolean {
  const results = expression.conditions.map(condition => {
    if (
      'operator' in condition &&
      ['and', 'or', 'not'].includes(condition.operator)
    ) {
      return evaluateExpression(condition as VisibilityExpression, formData)
    } else {
      return evaluateCondition(condition as VisibilityCondition, formData)
    }
  })

  switch (expression.operator) {
    case 'and':
      return results.every(Boolean)

    case 'or':
      return results.some(Boolean)

    case 'not':
      // For 'not', we expect exactly one condition
      return !results[0]

    default:
      return false
  }
}

/**
 * Evaluate visibility configuration against form data
 */
export function evaluateVisibility(
  config: VisibilityConfig,
  formData: unknown
): boolean {
  try {
    if (typeof config === 'string') {
      const condition = parseStringExpression(config)
      return evaluateCondition(condition, formData)
    }

    if (
      'operator' in config &&
      ['and', 'or', 'not'].includes(config.operator)
    ) {
      return evaluateExpression(config as VisibilityExpression, formData)
    } else {
      return evaluateCondition(config as VisibilityCondition, formData)
    }
  } catch (error) {
    console.warn('Error evaluating visibility condition:', error)
    return true // Default to visible on error
  }
}

/**
 * Create a reactive visibility signal based on form data
 */
export function createVisibilitySignal(
  config: VisibilityConfig,
  formDataSignal: Signal<unknown>
): Signal<boolean> {
  return computedOf(formDataSignal)(formData =>
    evaluateVisibility(config, formData)
  )
}

/**
 * Get all field paths referenced in a visibility configuration
 */
export function getReferencedFields(config: VisibilityConfig): string[] {
  const fields = new Set<string>()

  function collectFields(item: VisibilityConfig): void {
    if (typeof item === 'string') {
      const condition = parseStringExpression(item)
      fields.add(condition.field)
    } else if ('field' in item) {
      fields.add(item.field)
    } else if ('conditions' in item) {
      item.conditions.forEach(collectFields)
    }
  }

  collectFields(config)
  return Array.from(fields)
}

/**
 * Helper to create common visibility conditions
 */
export const VisibilityConditions = {
  /**
   * Field equals specific value
   */
  equals: (field: string, value: unknown): VisibilityCondition => ({
    field,
    operator: 'equals',
    value,
  }),

  /**
   * Field is truthy
   */
  truthy: (field: string): VisibilityCondition => ({
    field,
    operator: 'truthy',
  }),

  /**
   * Field is falsy
   */
  falsy: (field: string): VisibilityCondition => ({
    field,
    operator: 'falsy',
  }),

  /**
   * Field value is in array
   */
  in: (field: string, values: unknown[]): VisibilityCondition => ({
    field,
    operator: 'in',
    values,
  }),

  /**
   * Combine conditions with AND
   */
  and: (
    ...conditions: (VisibilityCondition | VisibilityExpression)[]
  ): VisibilityExpression => ({
    operator: 'and',
    conditions,
  }),

  /**
   * Combine conditions with OR
   */
  or: (
    ...conditions: (VisibilityCondition | VisibilityExpression)[]
  ): VisibilityExpression => ({
    operator: 'or',
    conditions,
  }),

  /**
   * Negate condition
   */
  not: (
    condition: VisibilityCondition | VisibilityExpression
  ): VisibilityExpression => ({
    operator: 'not',
    conditions: [condition],
  }),
}
