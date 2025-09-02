import type { ErrorObject, ValidateFunction } from 'ajv'
import type { JSONSchema } from '../schema-context'
import { Validation } from '@tempots/std'
import { ajvErrorsToControllerValidation } from '../ajv-utils'
import {
  getCrossFieldValidationRules,
  applyCrossFieldValidation,
  type CrossFieldValidationRule,
} from './cross-field-validation'
import type { ControllerValidation } from '@/components/form'

/**
 * Conditional validation configuration from x:ui
 */
export interface ConditionalValidationConfig {
  /** Validation rules that apply conditionally */
  when?: ConditionalRule[]
  /** Cross-field validation rules (legacy - use cross-field-validation.ts) */
  crossField?: CrossFieldRule[]
  /** Async validation rules */
  async?: AsyncValidationRule[]
  /** Modern cross-field validation rules */
  crossFieldRules?: CrossFieldValidationRule[]
}

/**
 * A conditional validation rule
 */
export interface ConditionalRule {
  /** JSONPath or property name to watch */
  watch: string | string[]
  /** Condition to evaluate (JSONPath expression or function) */
  condition: string | ((value: unknown, formData: unknown) => boolean)
  /** Schema to apply when condition is true */
  then?: JSONSchema
  /** Schema to apply when condition is false */
  else?: JSONSchema
  /** Additional validation function */
  validate?: (value: unknown, formData: unknown) => string | null
}

/**
 * Cross-field validation rule
 */
export interface CrossFieldRule {
  /** Fields involved in the validation */
  fields: string[]
  /** Validation function */
  validate: (
    values: Record<string, unknown>,
    formData: unknown
  ) => string | null
  /** Error message template */
  message?: string
  /** Which field to attach the error to (defaults to first field) */
  target?: string
}

/**
 * Async validation rule
 */
export interface AsyncValidationRule {
  /** Debounce delay in milliseconds */
  debounce?: number
  /** Validation function */
  validate: (value: unknown, formData: unknown) => Promise<string | null>
  /** Loading message */
  loadingMessage?: string
}

/**
 * Extract conditional validation configuration from schema x:ui
 */
export function getConditionalValidation(
  schema: JSONSchema
): ConditionalValidationConfig | undefined {
  if (typeof schema === 'boolean') return undefined

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui) return undefined

  const config: ConditionalValidationConfig = {}

  // Extract conditional rules
  if (Array.isArray(xui.when)) {
    config.when = xui.when.filter(
      (rule): rule is ConditionalRule =>
        typeof rule === 'object' &&
        rule != null &&
        'watch' in rule &&
        'condition' in rule
    )
  }

  // Extract legacy cross-field rules
  if (Array.isArray(xui.crossField)) {
    config.crossField = xui.crossField.filter(
      (rule): rule is CrossFieldRule =>
        typeof rule === 'object' &&
        rule != null &&
        Array.isArray(rule.fields) &&
        typeof rule.validate === 'function'
    )
  }

  // Extract modern cross-field validation rules
  const crossFieldRules = getCrossFieldValidationRules(schema)
  if (crossFieldRules.length > 0) {
    config.crossFieldRules = crossFieldRules
  }

  // Extract async rules
  if (Array.isArray(xui.async)) {
    config.async = xui.async.filter(
      (rule): rule is AsyncValidationRule =>
        typeof rule === 'object' &&
        rule != null &&
        typeof rule.validate === 'function'
    )
  }

  return Object.keys(config).length > 0 ? config : undefined
}

/**
 * Evaluate a JSONPath expression against form data
 */
function evaluateJSONPath(path: string, data: unknown): unknown {
  // Simple JSONPath implementation for basic property access
  // Supports: $.property, $.nested.property, $.array[0], etc.
  if (!path.startsWith('$.')) {
    throw new Error(`Invalid JSONPath: ${path}. Must start with '$.'.`)
  }

  const segments = path
    .slice(2)
    .split(/[.\[\]]/)
    .filter(Boolean)
  let current = data

  for (const segment of segments) {
    if (current == null) return undefined

    if (typeof current === 'object' && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[segment]
    } else if (Array.isArray(current)) {
      const index = parseInt(segment, 10)
      if (!isNaN(index)) {
        current = current[index]
      } else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Evaluate a conditional rule against form data
 */
function evaluateCondition(rule: ConditionalRule, formData: unknown): boolean {
  try {
    if (typeof rule.condition === 'function') {
      const watchPaths = Array.isArray(rule.watch) ? rule.watch : [rule.watch]
      const watchValues = watchPaths.map(path =>
        evaluateJSONPath(path, formData)
      )
      return rule.condition(
        watchValues.length === 1 ? watchValues[0] : watchValues,
        formData
      )
    }

    if (typeof rule.condition === 'string') {
      const result = evaluateJSONPath(rule.condition, formData)
      return Boolean(result)
    }

    return false
  } catch (error) {
    console.warn('Error evaluating conditional validation:', error)
    return false
  }
}

/**
 * Apply conditional validation rules to a value
 */
export function applyConditionalValidation(
  value: unknown,
  formData: unknown,
  config: ConditionalValidationConfig,
  baseValidate?: ValidateFunction
): ControllerValidation {
  const errors: ErrorObject[] = []

  // Apply base validation first
  if (baseValidate) {
    const isValid = baseValidate(value)
    if (!isValid && baseValidate.errors) {
      errors.push(...baseValidate.errors)
    }
  }

  // Apply conditional rules
  if (config.when) {
    for (const rule of config.when) {
      const conditionMet = evaluateCondition(rule, formData)
      const schemaToApply = conditionMet ? rule.then : rule.else

      if (schemaToApply) {
        // TODO: Compile and validate against conditional schema
        // This would require creating a temporary AJV validator
        // For now, we'll focus on the custom validate function
      }

      if (rule.validate) {
        try {
          const error = rule.validate(value, formData)
          if (error) {
            errors.push({
              instancePath: '',
              schemaPath: '#/x:ui/when',
              keyword: 'conditional',
              params: {},
              message: error,
            })
          }
        } catch (err) {
          console.warn('Error in conditional validation:', err)
        }
      }
    }
  }

  // Apply legacy cross-field rules
  if (config.crossField) {
    for (const rule of config.crossField) {
      try {
        const fieldValues: Record<string, unknown> = {}
        for (const field of rule.fields) {
          fieldValues[field] = evaluateJSONPath(`$.${field}`, formData)
        }

        const error = rule.validate(fieldValues, formData)
        if (error) {
          const target = rule.target || rule.fields[0]
          errors.push({
            instancePath: `/${target}`,
            schemaPath: '#/x:ui/crossField',
            keyword: 'crossField',
            params: { fields: rule.fields },
            message: rule.message || error,
          })
        }
      } catch (err) {
        console.warn('Error in cross-field validation:', err)
      }
    }
  }

  // Apply modern cross-field validation rules
  if (config.crossFieldRules && config.crossFieldRules.length > 0) {
    const crossFieldValidation = applyCrossFieldValidation(
      formData,
      config.crossFieldRules
    )
    if (crossFieldValidation.type === 'invalid') {
      // Extract errors from the cross-field validation result
      const crossFieldErrors = extractErrorsFromValidation(crossFieldValidation)
      errors.push(...crossFieldErrors)
    }
  }

  // Async validation would be handled separately with debouncing
  // and would update the validation state asynchronously

  if (errors.length > 0) {
    return ajvErrorsToControllerValidation(errors)
  }

  return Validation.valid
}

/**
 * Extract ErrorObject array from ControllerValidation
 */
function extractErrorsFromValidation(
  validation: ControllerValidation
): ErrorObject[] {
  if (validation.type === 'valid') return []

  const errors: ErrorObject[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractFromError(error: any, basePath = ''): void {
    if (error.message) {
      errors.push({
        instancePath: basePath,
        schemaPath: '#/crossField',
        keyword: 'crossField',
        params: {},
        message: error.message,
      })
    }

    if (error.dependencies) {
      for (const [key, nestedError] of Object.entries(error.dependencies)) {
        const newPath = basePath ? `${basePath}/${key}` : `/${key}`
        extractFromError(nestedError, newPath)
      }
    }
  }

  extractFromError(validation.error)
  return errors
}

/**
 * Create a debounced async validator
 */
export function createAsyncValidator(
  rule: AsyncValidationRule,
  onValidation: (result: ControllerValidation) => void
): (value: unknown, formData: unknown) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let isValidating = false

  return (value: unknown, formData: unknown) => {
    // Clear existing timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }

    // Set loading state if not already validating
    if (!isValidating && rule.loadingMessage) {
      onValidation(
        Validation.invalid({
          message: rule.loadingMessage,
        })
      )
    }

    timeoutId = setTimeout(async () => {
      isValidating = true
      try {
        const error = await rule.validate(value, formData)
        if (error) {
          onValidation(
            Validation.invalid({
              message: error,
            })
          )
        } else {
          onValidation(Validation.valid)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Async validation failed'
        onValidation(
          Validation.invalid({
            message,
          })
        )
      } finally {
        isValidating = false
      }
    }, rule.debounce || 300)
  }
}

/**
 * Watch for changes in conditional validation dependencies
 */
export function createConditionalWatcher(
  config: ConditionalValidationConfig,
  _onRevalidate: () => void
): {
  watchedPaths: string[]
  shouldRevalidate: (changedPath: string) => boolean
} {
  const watchedPaths = new Set<string>()

  // Collect all watched paths from conditional rules
  if (config.when) {
    for (const rule of config.when) {
      const paths = Array.isArray(rule.watch) ? rule.watch : [rule.watch]
      paths.forEach(path => watchedPaths.add(path))
    }
  }

  // Collect paths from cross-field rules
  if (config.crossField) {
    for (const rule of config.crossField) {
      rule.fields.forEach(field => watchedPaths.add(field))
    }
  }

  return {
    watchedPaths: Array.from(watchedPaths),
    shouldRevalidate: (changedPath: string) => {
      // Check if the changed path affects any watched paths
      return Array.from(watchedPaths).some(watchedPath => {
        // Simple path matching - could be enhanced with more sophisticated logic
        return (
          changedPath.startsWith(watchedPath) ||
          watchedPath.startsWith(changedPath)
        )
      })
    },
  }
}
