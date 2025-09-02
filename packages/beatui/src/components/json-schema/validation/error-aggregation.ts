import type { ErrorObject } from 'ajv'
import type { ControllerValidation } from '../../form/controller/controller-validation'
import { Validation } from '@tempots/std'

/**
 * Aggregated validation error information
 */
export interface AggregatedError {
  /** Field path where the error occurred */
  path: string
  /** Human-readable field name */
  fieldName: string
  /** Error message */
  message: string
  /** Error severity level */
  severity: 'error' | 'warning' | 'info'
  /** Error source/type */
  source: 'schema' | 'conditional' | 'crossField' | 'async' | 'custom'
  /** Additional context */
  context?: Record<string, unknown>
  /** Original error object */
  originalError?: ErrorObject
}

/**
 * Error aggregation configuration
 */
export interface ErrorAggregationConfig {
  /** Whether to include warnings in aggregation */
  includeWarnings?: boolean
  /** Whether to include info messages */
  includeInfo?: boolean
  /** Maximum number of errors to aggregate per field */
  maxErrorsPerField?: number
  /** Custom field name resolver */
  fieldNameResolver?: (path: string) => string
  /** Custom error message formatter */
  messageFormatter?: (error: AggregatedError) => string
  /** Error priority resolver (higher numbers = higher priority) */
  priorityResolver?: (error: AggregatedError) => number
}

/**
 * Error aggregation result
 */
export interface ErrorAggregationResult {
  /** All aggregated errors */
  errors: AggregatedError[]
  /** Errors grouped by field path */
  errorsByField: Record<string, AggregatedError[]>
  /** Error summary statistics */
  summary: {
    totalErrors: number
    errorCount: number
    warningCount: number
    infoCount: number
    fieldsWithErrors: number
  }
  /** Whether the form has any validation errors */
  hasErrors: boolean
  /** Whether the form has any warnings */
  hasWarnings: boolean
}

/**
 * Default field name resolver - converts path to human-readable name
 */
function defaultFieldNameResolver(path: string): string {
  if (!path || path === '/') return 'Form'

  // Remove leading slash and convert to readable format
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  // Split by / and . to handle nested paths
  const segments = cleanPath.split(/[/.]/g)

  // Convert camelCase/snake_case to Title Case
  return segments
    .map(segment => {
      // Handle array indices
      if (/^\d+$/.test(segment)) {
        return `Item ${parseInt(segment, 10) + 1}`
      }

      // Convert camelCase to Title Case
      const titleCase = segment
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      return titleCase
    })
    .join(' → ')
}

/**
 * Default error message formatter
 */
function defaultMessageFormatter(error: AggregatedError): string {
  const prefix =
    error.severity === 'warning'
      ? 'Warning: '
      : error.severity === 'info'
        ? 'Info: '
        : ''

  return `${prefix}${error.message}`
}

/**
 * Default priority resolver
 */
function defaultPriorityResolver(error: AggregatedError): number {
  // Higher priority for errors vs warnings/info
  const severityPriority = {
    error: 100,
    warning: 50,
    info: 10,
  }

  // Higher priority for certain error sources
  const sourcePriority = {
    schema: 90,
    crossField: 80,
    conditional: 70,
    async: 60,
    custom: 50,
  }

  return severityPriority[error.severity] + sourcePriority[error.source]
}

/**
 * Extract errors from AJV ErrorObject array
 */
function extractFromAjvErrors(
  errors: ErrorObject[],
  config: ErrorAggregationConfig
): AggregatedError[] {
  const aggregated: AggregatedError[] = []

  for (const error of errors) {
    const path = error.instancePath || '/'
    const fieldName = (config.fieldNameResolver || defaultFieldNameResolver)(
      path
    )

    // Determine error source based on keyword
    let source: AggregatedError['source'] = 'schema'
    if (error.keyword === 'crossField') source = 'crossField'
    else if (error.keyword === 'conditional') source = 'conditional'
    else if (error.keyword === 'async') source = 'async'

    aggregated.push({
      path,
      fieldName,
      message: error.message || 'Validation failed',
      severity: 'error',
      source,
      context: error.params,
      originalError: error,
    })
  }

  return aggregated
}

/**
 * Extract errors from ControllerValidation recursively
 */
function extractFromControllerValidation(
  validation: ControllerValidation,
  basePath = '',
  config: ErrorAggregationConfig
): AggregatedError[] {
  if (validation.type === 'valid') return []

  const aggregated: AggregatedError[] = []
  const error = validation.error

  // Add root-level error if present
  if (error.message) {
    const path = basePath || '/'
    const fieldName = (config.fieldNameResolver || defaultFieldNameResolver)(
      path
    )

    aggregated.push({
      path,
      fieldName,
      message: error.message,
      severity: 'error',
      source: 'custom',
    })
  }

  // Recursively extract from dependencies
  if (error.dependencies) {
    for (const [key, nestedError] of Object.entries(error.dependencies)) {
      const nestedPath = basePath ? `${basePath}/${key}` : `/${key}`
      const nestedValidation = Validation.invalid(nestedError)

      aggregated.push(
        ...extractFromControllerValidation(nestedValidation, nestedPath, config)
      )
    }
  }

  return aggregated
}

/**
 * Aggregate validation errors from multiple sources
 */
export function aggregateValidationErrors(
  sources: {
    ajvErrors?: ErrorObject[]
    controllerValidation?: ControllerValidation
    asyncErrors?: Record<string, ControllerValidation>
    customErrors?: AggregatedError[]
  },
  config: ErrorAggregationConfig = {}
): ErrorAggregationResult {
  const allErrors: AggregatedError[] = []

  // Extract from AJV errors
  if (sources.ajvErrors && sources.ajvErrors.length > 0) {
    allErrors.push(...extractFromAjvErrors(sources.ajvErrors, config))
  }

  // Extract from controller validation
  if (sources.controllerValidation) {
    allErrors.push(
      ...extractFromControllerValidation(
        sources.controllerValidation,
        '',
        config
      )
    )
  }

  // Extract from async validation errors
  if (sources.asyncErrors) {
    for (const [fieldPath, validation] of Object.entries(sources.asyncErrors)) {
      const asyncErrors = extractFromControllerValidation(
        validation,
        fieldPath,
        config
      )
      // Mark as async source
      asyncErrors.forEach(error => {
        error.source = 'async'
      })
      allErrors.push(...asyncErrors)
    }
  }

  // Add custom errors
  if (sources.customErrors) {
    allErrors.push(...sources.customErrors)
  }

  // Filter by severity if configured
  const filteredErrors = allErrors.filter(error => {
    if (error.severity === 'warning' && !config.includeWarnings) return false
    if (error.severity === 'info' && !config.includeInfo) return false
    return true
  })

  // Sort by priority (highest first)
  const priorityResolver = config.priorityResolver || defaultPriorityResolver
  filteredErrors.sort((a, b) => priorityResolver(b) - priorityResolver(a))

  // Group by field and limit per field if configured
  const errorsByField: Record<string, AggregatedError[]> = {}
  const maxPerField = config.maxErrorsPerField || Infinity

  for (const error of filteredErrors) {
    if (!errorsByField[error.path]) {
      errorsByField[error.path] = []
    }

    if (errorsByField[error.path].length < maxPerField) {
      errorsByField[error.path].push(error)
    }
  }

  // Flatten back to single array (respecting field limits)
  const finalErrors = Object.values(errorsByField).flat()

  // Calculate summary statistics
  const errorCount = finalErrors.filter(e => e.severity === 'error').length
  const warningCount = finalErrors.filter(e => e.severity === 'warning').length
  const infoCount = finalErrors.filter(e => e.severity === 'info').length

  return {
    errors: finalErrors,
    errorsByField,
    summary: {
      totalErrors: finalErrors.length,
      errorCount,
      warningCount,
      infoCount,
      fieldsWithErrors: Object.keys(errorsByField).length,
    },
    hasErrors: errorCount > 0,
    hasWarnings: warningCount > 0,
  }
}

/**
 * Create a formatted error summary for display
 */
export function formatErrorSummary(
  result: ErrorAggregationResult,
  config: ErrorAggregationConfig = {}
): string[] {
  const formatter = config.messageFormatter || defaultMessageFormatter

  return result.errors.map(error => {
    const formattedMessage = formatter(error)
    return `${error.fieldName}: ${formattedMessage}`
  })
}

/**
 * Get the first error for each field (useful for inline validation display)
 */
export function getFirstErrorPerField(
  result: ErrorAggregationResult
): Record<string, AggregatedError> {
  const firstErrors: Record<string, AggregatedError> = {}

  for (const [path, errors] of Object.entries(result.errorsByField)) {
    if (errors.length > 0) {
      firstErrors[path] = errors[0]
    }
  }

  return firstErrors
}

/**
 * Check if a specific field has errors
 */
export function fieldHasErrors(
  result: ErrorAggregationResult,
  fieldPath: string
): boolean {
  return result.errorsByField[fieldPath]?.length > 0 || false
}

/**
 * Get errors for a specific field
 */
export function getFieldErrors(
  result: ErrorAggregationResult,
  fieldPath: string
): AggregatedError[] {
  return result.errorsByField[fieldPath] || []
}
