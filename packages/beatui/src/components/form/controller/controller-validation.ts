import { Validation } from '@tempots/std'
import { PathSegment } from './path'

export type ControllerError = {
  message?: string
  dependencies?: Record<PathSegment, ControllerError>
}

export type ControllerValidation = Validation<ControllerError>

/**
 * Helper object for creating ControllerValidation instances.
 *
 * @example
 * ```typescript
 * // Valid state
 * ControllerValidation.valid
 *
 * // Invalid with a message
 * ControllerValidation.invalid('Something went wrong')
 *
 * // Invalid with field-specific errors
 * ControllerValidation.invalidFields({
 *   email: 'Invalid email format',
 *   password: 'Password too short',
 * })
 *
 * // Invalid from a ControllerError object
 * ControllerValidation.fromError({
 *   message: 'Form has errors',
 *   dependencies: { field: { message: 'Error' } }
 * })
 * ```
 */
export const ControllerValidation = {
  /** A valid validation result */
  valid: Validation.valid as ControllerValidation,

  /**
   * Create an invalid validation with a message
   */
  invalid(message: string): ControllerValidation {
    return Validation.invalid({ message })
  },

  /**
   * Create an invalid validation with field-specific errors.
   * Values can be error messages (strings) or full ControllerError objects.
   */
  invalidFields(
    fields: Record<PathSegment, string | ControllerError>
  ): ControllerValidation {
    const dependencies: Record<PathSegment, ControllerError> = {}
    for (const [key, value] of Object.entries(fields)) {
      dependencies[key] = typeof value === 'string' ? { message: value } : value
    }
    return Validation.invalid({ dependencies })
  },

  /**
   * Create an invalid validation from a ControllerError object
   */
  fromError(error: ControllerError): ControllerValidation {
    return Validation.invalid(error)
  },
} as const

export function makeMapValidation(fields: PathSegment[]) {
  return function mapValidation(
    status: ControllerValidation
  ): ControllerValidation {
    if (status.type === 'valid') return status
    // Walk down to the error node for the given subpath
    let node = status.error as ControllerError | undefined
    for (const field of fields) {
      node = node?.dependencies?.[field]
      if (node == null) return Validation.valid
    }
    // At this point, `node` is the error object for the sub-controller
    return Validation.invalid(node as ControllerError)
  }
}
