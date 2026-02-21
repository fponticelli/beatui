import type { JSONSchema } from '../schema-context'
import { Validation } from '@tempots/std'
import { Prop, prop } from '@tempots/dom'
import { ControllerValidation } from '../../form'

/**
 * Async validation rule configuration
 */
export interface AsyncValidationRule {
  /** Unique identifier for the rule */
  id: string
  /** Field path to validate */
  field: string
  /** Debounce delay in milliseconds (default: 300) */
  debounce?: number
  /** Validation function */
  validate: (
    value: unknown,
    formData: unknown
  ) => Promise<AsyncValidationResult>
  /** Loading message to show during validation */
  loadingMessage?: string
  /** Whether to validate on blur only (default: false) */
  validateOnBlurOnly?: boolean
  /** Minimum value length to trigger validation */
  minLength?: number
  /** Dependencies that should trigger revalidation */
  dependencies?: string[]
}

/**
 * Result of async validation
 */
export interface AsyncValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Error message if validation failed */
  message?: string
  /** Additional context for error reporting */
  context?: Record<string, unknown>
}

/**
 * Async validation state
 */
export interface AsyncValidationState {
  /** Whether validation is currently running */
  isValidating: boolean
  /** Current validation result */
  result: ControllerValidation
  /** Last validated value */
  lastValidatedValue: unknown
  /** Timestamp of last validation */
  lastValidatedAt: number
}

/**
 * Built-in async validation rules
 */
export const BUILTIN_ASYNC_RULES = {
  /**
   * Check if username is available (example)
   */
  usernameAvailable: (
    field: string,
    checkAvailability: (username: string) => Promise<boolean>,
    options?: { minLength?: number; debounce?: number }
  ): AsyncValidationRule => ({
    id: `usernameAvailable_${field}`,
    field,
    debounce: options?.debounce || 500,
    minLength: options?.minLength || 3,
    loadingMessage: 'Checking availability...',
    validate: async (value: unknown) => {
      if (
        typeof value !== 'string' ||
        value.length < (options?.minLength || 3)
      ) {
        return { valid: true } // Skip validation for short values
      }

      try {
        const isAvailable = await checkAvailability(value)
        return {
          valid: isAvailable,
          message: isAvailable ? undefined : 'Username is already taken',
        }
      } catch (_error) {
        return {
          valid: false,
          message: 'Unable to check username availability',
        }
      }
    },
  }),

  /**
   * Validate email format and check if it exists
   */
  emailExists: (
    field: string,
    checkExists: (email: string) => Promise<boolean>,
    options?: { debounce?: number }
  ): AsyncValidationRule => ({
    id: `emailExists_${field}`,
    field,
    debounce: options?.debounce || 400,
    loadingMessage: 'Verifying email...',
    validate: async (value: unknown) => {
      if (typeof value !== 'string' || !value.includes('@')) {
        return { valid: true } // Skip validation for invalid email format
      }

      try {
        const exists = await checkExists(value)
        return {
          valid: exists,
          message: exists ? undefined : 'Email address not found',
        }
      } catch (_error) {
        return {
          valid: false,
          message: 'Unable to verify email address',
        }
      }
    },
  }),

  /**
   * Custom API validation
   */
  apiValidation: (
    field: string,
    apiCall: (
      value: unknown,
      formData: unknown
    ) => Promise<{ valid: boolean; message?: string }>,
    options?: { debounce?: number; minLength?: number; loadingMessage?: string }
  ): AsyncValidationRule => ({
    id: `apiValidation_${field}`,
    field,
    debounce: options?.debounce || 300,
    minLength: options?.minLength,
    loadingMessage: options?.loadingMessage || 'Validating...',
    validate: async (value: unknown, formData: unknown) => {
      if (
        options?.minLength &&
        typeof value === 'string' &&
        value.length < options.minLength
      ) {
        return { valid: true } // Skip validation for short values
      }

      try {
        return await apiCall(value, formData)
      } catch (error) {
        return {
          valid: false,
          message: error instanceof Error ? error.message : 'Validation failed',
        }
      }
    },
  }),
}

/**
 * Extract async validation rules from schema x:ui
 */
export function getAsyncValidationRules(
  schema: JSONSchema
): AsyncValidationRule[] {
  if (typeof schema === 'boolean') return []

  const xui = schema['x:ui'] as Record<string, unknown> | undefined
  if (!xui || !Array.isArray(xui.async)) return []

  return xui.async.filter(
    (rule): rule is AsyncValidationRule =>
      typeof rule === 'object' &&
      rule != null &&
      typeof rule.id === 'string' &&
      typeof rule.field === 'string' &&
      typeof rule.validate === 'function'
  )
}

/**
 * Async validator class that manages debouncing and state
 */
export class AsyncValidator {
  private timeouts = new Map<string, ReturnType<typeof setTimeout>>()
  private validationStates = new Map<string, Prop<AsyncValidationState>>()
  private abortControllers = new Map<string, AbortController>()

  /**
   * Create or get validation state signal for a field
   */
  getValidationState(fieldId: string): Prop<AsyncValidationState> {
    if (!this.validationStates.has(fieldId)) {
      this.validationStates.set(
        fieldId,
        prop({
          isValidating: false,
          result: Validation.valid,
          lastValidatedValue: undefined,
          lastValidatedAt: 0,
        } as AsyncValidationState)
      )
    }
    return this.validationStates.get(fieldId)!
  }

  /**
   * Validate a field with debouncing
   */
  async validateField(
    rule: AsyncValidationRule,
    value: unknown,
    formData: unknown,
    force = false
  ): Promise<void> {
    const fieldId = `${rule.field}_${rule.id}`
    // eslint-disable-next-line tempots/require-async-signal-disposal -- state is retrieved from a class-managed map, not created here; disposal is handled by AsyncValidationManager.dispose()
    const state = this.getValidationState(fieldId)

    // Clear existing timeout
    const existingTimeout = this.timeouts.get(fieldId)
    if (existingTimeout !== undefined) {
      clearTimeout(existingTimeout)
    }

    // Cancel existing validation
    const existingController = this.abortControllers.get(fieldId)
    if (existingController) {
      existingController.abort()
    }

    // Skip validation if value hasn't changed and not forced
    if (!force && state.value.lastValidatedValue === value) {
      return
    }

    // Skip validation for short values if minLength is specified
    if (
      rule.minLength &&
      typeof value === 'string' &&
      value.length < rule.minLength
    ) {
      state.set({
        ...state.value,
        result: Validation.valid,
        isValidating: false,
      })
      return
    }

    // Set up debounced validation
    const timeoutId = setTimeout(
      async () => {
        const controller = new AbortController()
        this.abortControllers.set(fieldId, controller)

        // Set loading state
        state.set({
          ...state.value,
          isValidating: true,
          result: rule.loadingMessage
            ? Validation.invalid({ message: rule.loadingMessage })
            : state.value.result,
        })

        try {
          const result = await rule.validate(value, formData)

          // Check if validation was aborted
          if (controller.signal.aborted) {
            return
          }

          // Update state with result
          const validation = result.valid
            ? Validation.valid
            : Validation.invalid({
                message: result.message || 'Async validation failed',
                context: result.context,
              })

          state.set({
            isValidating: false,
            result: validation,
            lastValidatedValue: value,
            lastValidatedAt: Date.now(),
          })
        } catch (error) {
          // Check if validation was aborted
          if (controller.signal.aborted) {
            return
          }

          const message =
            error instanceof Error ? error.message : 'Async validation error'
          state.set({
            isValidating: false,
            result: Validation.invalid({ message }),
            lastValidatedValue: value,
            lastValidatedAt: Date.now(),
          })
        } finally {
          this.abortControllers.delete(fieldId)
          this.timeouts.delete(fieldId)
        }
      },
      force ? 0 : rule.debounce || 300
    )

    this.timeouts.set(fieldId, timeoutId)
  }

  /**
   * Cancel all pending validations
   */
  cancelAll(): void {
    // Clear all timeouts
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId)
    }
    this.timeouts.clear()

    // Abort all ongoing validations
    for (const controller of this.abortControllers.values()) {
      controller.abort()
    }
    this.abortControllers.clear()
  }

  /**
   * Get current validation results for all fields
   */
  getAllValidationResults(): Record<string, ControllerValidation> {
    const results: Record<string, ControllerValidation> = {}

    for (const [fieldId, state] of this.validationStates.entries()) {
      const currentState = state.value
      if (
        !currentState.isValidating &&
        currentState.result.type === 'invalid'
      ) {
        results[fieldId] = currentState.result
      }
    }

    return results
  }

  /**
   * Check if any validations are currently running
   */
  isValidating(): boolean {
    for (const state of this.validationStates.values()) {
      if (state.value.isValidating) {
        return true
      }
    }
    return false
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.cancelAll()

    // Dispose all state signals
    for (const state of this.validationStates.values()) {
      state.dispose()
    }
    this.validationStates.clear()
  }
}
