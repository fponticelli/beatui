/**
 * Status indicating the form is being filled out by the user.
 */
export type FormFilling = { type: 'filling' }

/**
 * Status indicating the form is currently being submitted.
 */
export type FormSubmitting = { type: 'submitting' }

/**
 * Status indicating the form submission encountered an error.
 */
export type FormError = {
  /** Discriminant for the error status */
  type: 'error'
  /** The error message describing what went wrong */
  error: string
}

/**
 * Status indicating the form was submitted successfully.
 */
export type FormSuccess = { type: 'success' }

/**
 * Discriminated union representing the current state of a form.
 *
 * The form progresses through these states during its lifecycle:
 * 1. `'filling'` - User is entering data
 * 2. `'submitting'` - Form is being submitted (e.g., API call in progress)
 * 3. `'success'` or `'error'` - Submission result
 *
 * Use the `type` discriminant to narrow the union in conditional logic.
 *
 * @example
 * ```typescript
 * import { FormStatus } from '@tempots/beatui'
 *
 * const status: FormStatus = FormStatus.filling
 *
 * switch (status.type) {
 *   case 'filling': // show form
 *   case 'submitting': // show spinner
 *   case 'success': // show success message
 *   case 'error': // show error: status.error
 * }
 * ```
 */
export type FormStatus = FormFilling | FormSubmitting | FormError | FormSuccess

/**
 * Factory object for creating {@link FormStatus} values.
 *
 * Provides pre-built instances for `filling`, `submitting`, and `success`,
 * and a factory function for creating `error` statuses with a message.
 *
 * @example
 * ```typescript
 * import { FormStatus } from '@tempots/beatui'
 *
 * const initial = FormStatus.filling
 * const loading = FormStatus.submitting
 * const done = FormStatus.success
 * const failed = FormStatus.error('Network timeout')
 * ```
 */
export const FormStatus = {
  /** A pre-built `FormFilling` status instance */
  filling: { type: 'filling' } as FormStatus,
  /** A pre-built `FormSubmitting` status instance */
  submitting: { type: 'submitting' } as FormStatus,
  /**
   * Creates a `FormError` status with the given error message.
   *
   * @param error - The error message describing what went wrong
   * @returns A `FormStatus` of type `'error'`
   */
  error: (error: string) => ({ type: 'error', error }) as FormStatus,
  /** A pre-built `FormSuccess` status instance */
  success: { type: 'success' } as FormStatus,
}
