/**
 * JSON Structure Form Component
 *
 * Main form component for JSON Structure schema-based forms.
 * Provides validation, error handling, and form state management.
 */

import {
  Value,
  Renderable,
  Fragment,
  OnDispose,
} from '@tempots/dom'
import { Validation } from '@tempots/std'
import { Controller, ControllerValidation, ControllerError, useController } from '../form'
import { createValidator, ValidationResult } from './validation/sdk-validator'
import { formatValidationErrors, FormattedValidationError } from './validation/error-transform'
import { StructureControl } from './controls/generic-control'
import type { JSONStructureSchema } from './structure-types'
import type { WidgetRegistry } from './widgets/widget-registry'

/**
 * Validation mode for the form
 * - 'onSubmit': Validate only when form is submitted
 * - 'onTouched': Validate fields after they are touched
 * - 'eager': Validate fields as they change
 */
export type ValidationMode = 'onSubmit' | 'onTouched' | 'eager'

/**
 * Props for JSONStructureForm component
 */
export interface JSONStructureFormProps<T> {
  /** The JSON Structure schema to render as a form */
  schema: JSONStructureSchema
  /** Reactive value containing the form data */
  initialValue: Value<T>
  /** Validation behavior - when to validate the form */
  validationMode?: ValidationMode
  /** Debounce delay in milliseconds for validation */
  validateDebounceMs?: number
  /** Optional widget registry for custom widgets */
  widgetRegistry?: WidgetRegistry
  /** Make all fields read-only */
  readOnly?: boolean
  /** Locale for internationalization */
  locale?: string
  /** Called when form value changes */
  onChange?: (value: T) => void
  /** Called when validation runs */
  onValidate?: (errors: FormattedValidationError[]) => void
}

/**
 * Transform validation result to controller validation
 */
function validationResultToControllerValidation(
  result: ValidationResult
): ControllerValidation {
  if (result.isValid) {
    return Validation.valid
  }

  // Format errors
  const formatted = formatValidationErrors(result.errors)

  // Group errors by path
  const errorsByPath = new Map<string, FormattedValidationError[]>()
  for (const error of formatted) {
    const existing = errorsByPath.get(error.path) || []
    existing.push(error)
    errorsByPath.set(error.path, existing)
  }

  // Build nested error structure for controller
  const buildNestedError = (
    pathParts: string[],
    errors: FormattedValidationError[]
  ): ControllerError => {
    if (pathParts.length === 0) {
      return {
        message: errors.map(e => e.message).join('; '),
      }
    }

    const [first, ...rest] = pathParts
    const childError = buildNestedError(rest, errors)

    return {
      dependencies: {
        [first]: childError,
      },
    }
  }

  // Convert errors to nested structure
  const rootError: ControllerError = {}
  const dependencies: Record<string, ControllerError> = {}

  for (const [path, errors] of errorsByPath.entries()) {
    if (path === '' || path === '/') {
      // Root level errors
      rootError.message = errors.map(e => e.message).join('; ')
    } else {
      // Parse path and create nested structure
      const pathParts = path.split('/').filter(p => p !== '')

      if (pathParts.length === 1) {
        // Single level path
        dependencies[pathParts[0]] = {
          message: errors.map(e => e.message).join('; '),
        }
      } else {
        // Multi-level path
        const [first, ...rest] = pathParts
        dependencies[first] = buildNestedError(rest, errors)
      }
    }
  }

  // Combine root error with dependencies if any
  if (Object.keys(dependencies).length > 0) {
    rootError.dependencies = dependencies
  }

  return Validation.invalid(rootError)
}

/**
 * JSON Structure Form Component
 *
 * Renders a complete form based on a JSON Structure schema with validation.
 *
 * @example
 * ```typescript
 * JSONStructureForm(
 *   {
 *     schema: mySchema,
 *     initialValue: prop(initialData),
 *     validationMode: 'onTouched',
 *   },
 *   ({ Form, controller, setStatus }) => {
 *     return html.form(
 *       on.submit(async (e) => {
 *         e.preventDefault()
 *         // Validate and submit
 *         const value = controller.signal.value
 *         // ... handle submission
 *       }),
 *       Form,
 *       html.button(
 *         attr.type('submit'),
 *         'Submit'
 *       )
 *     )
 *   }
 * )
 * ```
 */
export function JSONStructureForm<T>(
  {
    schema,
    initialValue,
    validationMode,
    validateDebounceMs,
    widgetRegistry,
    readOnly,
    locale,
    onChange,
    onValidate,
  }: JSONStructureFormProps<T>,
  fn: ({
    Form,
    controller,
    setStatus,
  }: {
    Form: Renderable
    controller: Controller<T>
    setStatus: (result: ControllerValidation) => void
  }) => Renderable
): Renderable {
  // Create validator
  const validator = createValidator(schema)

  const mode = validationMode ?? 'onTouched'

  // Validation function
  const validateFn = (value: T): ControllerValidation => {
    const result = validator.validate(value)

    // Call onValidate callback if provided
    if (onValidate && !result.isValid) {
      const formatted = formatValidationErrors(result.errors)
      onValidate(formatted)
    }

    return validationResultToControllerValidation(result)
  }

  // Create controller
  const { controller, setStatus } = useController({
    initialValue,
    validationMode: mode,
    validateDebounceMs,
    validate: mode === 'onSubmit' ? undefined : validateFn,
    onChange,
  })

  // Cleanup function
  const cleanup = () => {
    controller.dispose()
  }

  // Render form control
  const Form = Fragment(
    OnDispose(cleanup),
    StructureControl({
      schema,
      controller,
      widgetRegistry,
      readOnly,
      locale,
    })
  )

  return fn({ Form, controller, setStatus })
}
