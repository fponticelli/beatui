import type { ErrorObject } from 'ajv'
import type { JSONSchema } from '../schema-context'
import { Validation } from '@tempots/std'
import { ajvErrorsToControllerValidation } from '../ajv-utils'
import { ControllerValidation } from '@/components/form'

/**
 * Cross-field validation rule configuration
 */
export interface CrossFieldValidationRule {
  /** Unique identifier for the rule */
  id: string
  /** Fields involved in the validation */
  fields: string[]
  /** Validation function that receives field values */
  validate: (
    fieldValues: Record<string, unknown>,
    formData: unknown
  ) => CrossFieldValidationResult
  /** Error message template with field placeholders */
  message?: string
  /** Which field(s) to attach the error to */
  targets?: string[]
  /** Priority for rule execution (higher numbers run first) */
  priority?: number
  /** Whether this rule should run only on form submission */
  onSubmitOnly?: boolean
}

/**
 * Result of cross-field validation
 */
export interface CrossFieldValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Error message if validation failed */
  message?: string
  /** Specific field errors */
  fieldErrors?: Record<string, string>
  /** Additional context for error reporting */
  context?: Record<string, unknown>
}

/**
 * Built-in cross-field validation rules
 */
export const BUILTIN_CROSS_FIELD_RULES = {
  /**
   * Ensure two fields have the same value (e.g., password confirmation)
   */
  fieldMatch: (
    field1: string,
    field2: string,
    message?: string
  ): CrossFieldValidationRule => ({
    id: `fieldMatch_${field1}_${field2}`,
    fields: [field1, field2],
    validate: fieldValues => {
      const value1 = fieldValues[field1]
      const value2 = fieldValues[field2]

      if (value1 !== value2) {
        return {
          valid: false,
          message: message || `${field2} must match ${field1}`,
          fieldErrors: {
            [field2]: message || `Must match ${field1}`,
          },
        }
      }

      return { valid: true }
    },
    targets: [field2],
  }),

  /**
   * Ensure date range is valid (start <= end)
   */
  dateRange: (
    startField: string,
    endField: string,
    message?: string
  ): CrossFieldValidationRule => ({
    id: `dateRange_${startField}_${endField}`,
    fields: [startField, endField],
    validate: fieldValues => {
      const startDate = fieldValues[startField]
      const endDate = fieldValues[endField]

      if (startDate && endDate) {
        const start = new Date(startDate as string)
        const end = new Date(endDate as string)

        if (start > end) {
          return {
            valid: false,
            message: message || `${endField} must be after ${startField}`,
            fieldErrors: {
              [endField]: message || `Must be after ${startField}`,
            },
          }
        }
      }

      return { valid: true }
    },
    targets: [endField],
  }),

  /**
   * Ensure numeric range is valid (min <= max)
   */
  numericRange: (
    minField: string,
    maxField: string,
    message?: string
  ): CrossFieldValidationRule => ({
    id: `numericRange_${minField}_${maxField}`,
    fields: [minField, maxField],
    validate: fieldValues => {
      const minValue = fieldValues[minField]
      const maxValue = fieldValues[maxField]

      if (typeof minValue === 'number' && typeof maxValue === 'number') {
        if (minValue > maxValue) {
          return {
            valid: false,
            message:
              message ||
              `${maxField} must be greater than or equal to ${minField}`,
            fieldErrors: {
              [maxField]: message || `Must be >= ${minField}`,
            },
          }
        }
      }

      return { valid: true }
    },
    targets: [maxField],
  }),

  /**
   * Conditional required field (field is required if condition field has specific value)
   */
  conditionalRequired: (
    targetField: string,
    conditionField: string,
    conditionValue: unknown,
    message?: string
  ): CrossFieldValidationRule => ({
    id: `conditionalRequired_${targetField}_${conditionField}`,
    fields: [targetField, conditionField],
    validate: fieldValues => {
      const conditionFieldValue = fieldValues[conditionField]
      const targetFieldValue = fieldValues[targetField]

      if (
        conditionFieldValue === conditionValue &&
        (targetFieldValue == null || targetFieldValue === '')
      ) {
        return {
          valid: false,
          message:
            message ||
            `${targetField} is required when ${conditionField} is ${conditionValue}`,
          fieldErrors: {
            [targetField]: message || 'This field is required',
          },
        }
      }

      return { valid: true }
    },
    targets: [targetField],
  }),

  /**
   * Mutual exclusion (only one of the fields can have a value)
   */
  mutuallyExclusive: (
    fields: string[],
    message?: string
  ): CrossFieldValidationRule => ({
    id: `mutuallyExclusive_${fields.join('_')}`,
    fields,
    validate: fieldValues => {
      const nonEmptyFields = fields.filter(field => {
        const value = fieldValues[field]
        return value != null && value !== ''
      })

      if (nonEmptyFields.length > 1) {
        const fieldErrors: Record<string, string> = {}
        nonEmptyFields.forEach(field => {
          fieldErrors[field] =
            message || `Only one of ${fields.join(', ')} can be specified`
        })

        return {
          valid: false,
          message:
            message || `Only one of ${fields.join(', ')} can be specified`,
          fieldErrors,
        }
      }

      return { valid: true }
    },
    targets: fields,
  }),

  /**
   * At least one required (at least one of the fields must have a value)
   */
  atLeastOneRequired: (
    fields: string[],
    message?: string
  ): CrossFieldValidationRule => ({
    id: `atLeastOneRequired_${fields.join('_')}`,
    fields,
    validate: fieldValues => {
      const hasValue = fields.some(field => {
        const value = fieldValues[field]
        return value != null && value !== ''
      })

      if (!hasValue) {
        const fieldErrors: Record<string, string> = {}
        fields.forEach(field => {
          fieldErrors[field] =
            message || `At least one of ${fields.join(', ')} is required`
        })

        return {
          valid: false,
          message:
            message || `At least one of ${fields.join(', ')} is required`,
          fieldErrors,
        }
      }

      return { valid: true }
    },
    targets: fields,
  }),
}

/**
 * Extract cross-field validation rules from schema x:ui
 */
export function getCrossFieldValidationRules(
  schema: JSONSchema
): CrossFieldValidationRule[] {
  if (typeof schema === 'boolean') return []

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui || !Array.isArray(xui.crossField)) return []

  return xui.crossField.filter(
    (rule): rule is CrossFieldValidationRule =>
      typeof rule === 'object' &&
      rule != null &&
      typeof rule.id === 'string' &&
      Array.isArray(rule.fields) &&
      typeof rule.validate === 'function'
  )
}

/**
 * Apply cross-field validation rules to form data
 */
export function applyCrossFieldValidation(
  formData: unknown,
  rules: CrossFieldValidationRule[],
  onSubmitOnly = false
): ControllerValidation {
  const errors: ErrorObject[] = []

  // Sort rules by priority (higher priority first)
  const sortedRules = [...rules].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  )

  for (const rule of sortedRules) {
    // Skip rules that should only run on submit if we're not in submit mode
    if (rule.onSubmitOnly && !onSubmitOnly) {
      continue
    }

    try {
      // Extract field values
      const fieldValues: Record<string, unknown> = {}
      for (const field of rule.fields) {
        fieldValues[field] = getFieldValue(formData, field)
      }

      // Run validation
      const result = rule.validate(fieldValues, formData)

      if (!result.valid) {
        // Create errors for target fields
        const targets = rule.targets || rule.fields

        if (result.fieldErrors) {
          // Use specific field errors
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            errors.push({
              instancePath: `/${field}`,
              schemaPath: `#/x:ui/crossField/${rule.id}`,
              keyword: 'crossField',
              params: {
                ruleId: rule.id,
                fields: rule.fields,
                context: result.context,
              },
              message,
            })
          }
        } else {
          // Use general error for all target fields
          const message =
            result.message || rule.message || 'Cross-field validation failed'
          for (const field of targets) {
            errors.push({
              instancePath: `/${field}`,
              schemaPath: `#/x:ui/crossField/${rule.id}`,
              keyword: 'crossField',
              params: {
                ruleId: rule.id,
                fields: rule.fields,
                context: result.context,
              },
              message,
            })
          }
        }
      }
    } catch (err) {
      console.warn(`Error in cross-field validation rule ${rule.id}:`, err)

      // Add error for the first target field
      const target = rule.targets?.[0] || rule.fields[0]
      errors.push({
        instancePath: `/${target}`,
        schemaPath: `#/x:ui/crossField/${rule.id}`,
        keyword: 'crossField',
        params: { ruleId: rule.id, fields: rule.fields },
        message: 'Cross-field validation error',
      })
    }
  }

  if (errors.length > 0) {
    return ajvErrorsToControllerValidation(errors)
  }

  return Validation.valid
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
