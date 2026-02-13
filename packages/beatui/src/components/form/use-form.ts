import {
  attr,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
  Signal,
  Value,
} from '@tempots/dom'
import { StandardSchemaV1 } from './schema/standard-schema-v1'
import {
  ControllerValidation,
  Controller,
  ControllerError,
  ObjectController,
  ValidationMode,
} from './controller'
import { convertStandardSchemaIssues } from './schema'
import { Validation, strictEqual } from '@tempots/std'

/**
 * Configuration options for creating a form with useForm.
 *
 * @template T - The form data type (must be an object)
 */
export interface UseFormOptions<T> {
  /** Optional schema for validation (supports Standard Schema v1, including Zod schemas). */
  schema?: StandardSchemaV1<T, T>
  /** Initial form values (can be a static value or a reactive Signal). */
  initialValue?: Value<T>
  /** Optional async submit handler that can return validation errors. */
  onSubmit?: (value: T) => Promise<ControllerValidation>
  /** When to show validation errors: 'onSubmit' (default), 'eager' (immediately), or 'onTouched' (after blur). */
  validationMode?: 'onSubmit' | 'eager' | 'onTouched'
  /** Debounce delay in milliseconds for validation (useful for 'eager' mode). */
  validateDebounceMs?: number
}

/**
 * Configuration options for creating a standalone controller with useController.
 *
 * @template T - The controller value type
 */
export interface UseControllerOptions<T> {
  /** Initial controller value (can be a static value or a reactive Signal). */
  initialValue: Value<T>
  /** Optional callback invoked when the value changes. */
  onChange?: (value: T) => void
  /** Optional validation function (sync or async). */
  validate?: (value: T) => Promise<ControllerValidation> | ControllerValidation
  /** Equality function for dirty tracking (defaults to strictEqual). */
  equals?: (a: T, b: T) => boolean
  /** When to show validation errors: 'onSubmit', 'eager', or 'onTouched' (default). */
  validationMode?: 'onSubmit' | 'eager' | 'onTouched'
  /** Debounce delay in milliseconds for validation. */
  validateDebounceMs?: number
}

/**
 * Creates a standalone reactive controller for managing a single form field or value.
 * Provides reactive state management, validation, and touched/dirty tracking.
 *
 * @template T - The value type managed by the controller
 * @param options - Controller configuration options
 * @returns An object with the controller instance and a setStatus function for manual validation updates
 *
 * @example
 * ```typescript
 * import { useController, Control, TextInput } from '@tempots/beatui'
 * import { html } from '@tempots/dom'
 * import { z } from 'zod'
 * import { Validation } from '@tempots/std'
 *
 * const emailSchema = z.string().email()
 *
 * const { controller } = useController({
 *   initialValue: '',
 *   validate: async (value) => {
 *     const result = emailSchema.safeParse(value)
 *     return result.success
 *       ? Validation.valid
 *       : Validation.invalid({ message: result.error.errors[0].message })
 *   },
 *   validationMode: 'onTouched',
 * })
 *
 * const emailInput = Control(TextInput, {
 *   controller,
 *   label: 'Email',
 *   placeholder: 'you@example.com',
 * })
 * ```
 */
export function useController<T>({
  initialValue,
  onChange,
  validate,
  equals,
  validationMode,
  validateDebounceMs,
}: UseControllerOptions<T>) {
  const value = Value.deriveProp(initialValue)
  const status = prop<ControllerValidation>(Validation.valid)
  const disabledSignal = prop(false)
  const modeSignal = prop<ValidationMode>(validationMode ?? 'onTouched')

  const setStatus = (result: ControllerValidation) => {
    status.set(result)
  }

  let validateTimer: ReturnType<typeof setTimeout> | undefined
  const runValidate = async (v: T) => {
    if (validate != null) {
      const result = await validate(v)
      setStatus(result)
    }
  }

  const change = async (v: T) => {
    value.set(v)
    onChange?.(v)
    const mode = modeSignal.value
    if (validate != null) {
      if (mode === 'onSubmit') {
        // skip validation on change
        return
      }
      const delay = validateDebounceMs ?? 0
      if (delay > 0) {
        if (validateTimer) clearTimeout(validateTimer)
        validateTimer = setTimeout(() => {
          runValidate(v)
        }, delay)
      } else {
        await runValidate(v)
      }
    }
  }

  const controller = new Controller<T>(
    [],
    change,
    value,
    status,
    {
      disabled: disabledSignal,
      validationMode: modeSignal,
    },
    equals ?? (strictEqual as (a: T, b: T) => boolean)
  )

  // Add disposal logic for the signals we created
  controller.onDispose(() => {
    disabledSignal.dispose()
    value.dispose()
    status.dispose()
    modeSignal.dispose()
    if (validateTimer) clearTimeout(validateTimer)
  })

  return { controller, setStatus }
}

/**
 * Connects common HTML attributes (disabled, name) from a controller to a DOM element.
 * This is a lower-level utility; most users should use Control/BaseControl instead.
 *
 * @template T - The controller value type
 * @param value - The controller to connect
 * @returns A Fragment with attribute bindings
 */
export function connectCommonAttributes<T>(value: Controller<T>) {
  return Fragment(attr.disabled(value.disabled), attr.name(value.name))
}

/**
 * Connects a string controller to a text input element with value binding and event handlers.
 * This is a lower-level utility; most users should use Control/BaseControl instead.
 *
 * @param value - The string controller to connect
 * @param options - Configuration for when to trigger updates
 * @returns A Fragment with attribute and event bindings
 */
export function connectStringInput(
  value: Controller<string>,
  {
    triggerOn = 'change',
  }: {
    triggerOn?: 'change' | 'input'
  } = {}
) {
  return Fragment(
    connectCommonAttributes(value),
    attr.value(value.signal),
    (triggerOn === 'input' ? on.input : on.change)(emitValue(value.change))
  )
}

/**
 * Connects a number controller to a number input element with value binding and event handlers.
 * This is a lower-level utility; most users should use Control/BaseControl instead.
 *
 * @param value - The number controller to connect
 * @param options - Configuration for when to trigger updates
 * @returns A Fragment with attribute and event bindings
 */
export function connectNumberInput(
  value: Controller<number>,
  {
    triggerOn = 'change',
  }: {
    triggerOn?: 'change' | 'input'
  } = {}
) {
  return Fragment(
    connectCommonAttributes(value),
    attr.valueAsNumber(value.signal),
    (triggerOn === 'input' ? on.input : on.change)(
      emitValueAsNumber(value.change)
    )
  )
}

/**
 * Converts a Standard Schema v1 validation result into a ControllerValidation.
 * Used internally to integrate Standard Schema validators (including Zod) with the form system.
 *
 * @template Out - The validated output type
 * @param result - The Standard Schema validation result
 * @returns A ControllerValidation representing the result
 */
export function standardSchemaResultToValidation<Out>(
  result: StandardSchemaV1.Result<Out>
): ControllerValidation {
  if (result.issues != null) {
    return Validation.invalid(convertStandardSchemaIssues(result.issues))
  } else {
    return Validation.valid
  }
}

/**
 * Wraps an async operation and converts any thrown errors into a ControllerValidation.
 * This is useful for form submission handlers that need to convert async operations
 * into the ControllerValidation format expected by the form system.
 *
 * @param task - The async operation to execute
 * @param errorMessage - Optional custom error message. If not provided, uses the error's message or a default message
 * @param errorPath - Optional path for the error. Defaults to ['root']
 * @returns A Promise that resolves to a ControllerValidation
 *
 * @example
 * ```typescript
 * const result = await taskToValidation(
 *   () => signUpUser(userData),
 *   'Sign up failed'
 * )
 * ```
 */
export async function taskToValidation<T>({
  task,
  errorMessage,
  errorPath = ['root'],
  validation,
}: {
  task: () => Promise<T>
  errorMessage?: string
  errorPath?: string[]
  validation?: (result: T) => ControllerValidation
}): Promise<ControllerValidation> {
  try {
    const result = await task()
    if (validation != null) {
      return validation(result)
    }
    return Validation.valid
  } catch (err) {
    const message =
      errorMessage ?? (err instanceof Error ? err.message : 'Operation failed')

    if (errorPath.length === 1 && errorPath[0] === 'root') {
      // Simple root-level error
      return Validation.invalid({
        message: message,
      })
    } else {
      // Nested error structure
      return Validation.invalid({
        dependencies: createNestedDependencies(errorPath, message),
      })
    }
  }
}

/**
 * Helper function to create nested dependencies structure for field paths.
 * Used internally by taskToValidation to construct proper error hierarchies.
 *
 * @param path - Array of field names representing the error path
 * @param message - The error message to attach at the leaf
 * @returns A nested Record structure with ControllerErrors
 */
function createNestedDependencies(
  path: string[],
  message: string
): Record<string, ControllerError> {
  if (path.length === 1) {
    return {
      [path[0]]: { message },
    }
  }

  const [first, ...rest] = path
  return {
    [first]: {
      dependencies: createNestedDependencies(rest, message),
    },
  }
}

/**
 * The result returned by useForm, providing form state management and submission handling.
 *
 * @template T - The form data type
 */
export type UseFormResult<T extends object> = {
  /** The root ObjectController for accessing form fields via controller.field(). */
  controller: ObjectController<T>
  /** Manually set the form's validation status (useful for server-side errors). */
  setStatus: (result: ControllerValidation) => void
  /** Submit handler to attach to form onSubmit event. */
  submit: (e?: Event) => Promise<void>
  /** Reactive signal indicating whether the form is currently submitting. */
  submitting: Signal<boolean>
}

/**
 * Creates a complete form with validation, submission handling, and reactive state management.
 * Returns an ObjectController that provides field-level access and form-wide operations.
 *
 * @template T - The form data type (must be an object)
 * @param options - Form configuration options
 * @returns An object with controller, setStatus, submit handler, and submitting signal
 *
 * @example
 * ```typescript
 * import { useForm, Control, TextInput, Button } from '@tempots/beatui'
 * import { html, on } from '@tempots/dom'
 * import { z } from 'zod'
 *
 * const loginSchema = z.object({
 *   email: z.string().email('Invalid email address'),
 *   password: z.string().min(8, 'Password must be at least 8 characters'),
 * })
 *
 * const { controller, submit, submitting } = useForm({
 *   initialValue: { email: '', password: '' },
 *   schema: loginSchema,
 *   validationMode: 'onTouched',
 *   onSubmit: async (data) => {
 *     const response = await fetch('/api/login', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     })
 *     if (!response.ok) {
 *       return Validation.invalid({ message: 'Login failed' })
 *     }
 *     return Validation.valid
 *   },
 * })
 *
 * const loginForm = html.form(
 *   on.submit(submit),
 *   Control(TextInput, {
 *     controller: controller.field('email'),
 *     label: 'Email',
 *     type: 'email',
 *   }),
 *   Control(TextInput, {
 *     controller: controller.field('password'),
 *     label: 'Password',
 *     type: 'password',
 *   }),
 *   Button({ type: 'submit', disabled: submitting }, 'Sign In')
 * )
 * ```
 */
export function useForm<T extends object>({
  initialValue = {} as Value<T>,
  schema,
  onSubmit = async () => Validation.valid,
  validationMode,
  validateDebounceMs,
}: UseFormOptions<T>): UseFormResult<T> {
  const { controller: baseController, setStatus } = useController({
    initialValue,
    validationMode: validationMode ?? 'onTouched',
    validateDebounceMs,
    validate:
      (validationMode ?? 'onTouched') === 'onSubmit' || schema == null
        ? undefined
        : async v =>
            standardSchemaResultToValidation(
              await schema['~standard'].validate(v)
            ),
  })
  const submitting = prop(false)
  const controller = baseController.object()
  controller.onDispose(submitting.dispose)
  const submitHandler = async (e?: Event) => {
    submitting.set(true)
    e?.preventDefault()
    controller.markAllTouched()
    // Always validate on submit if there's a schema, regardless of validation mode.
    // This ensures untouched fields are validated even in 'eager' or 'onTouched' modes.
    if (schema != null) {
      const v = controller.signal.value
      const result = standardSchemaResultToValidation(
        await schema['~standard'].validate(v)
      )
      setStatus(result)
      if (result.type === 'invalid') {
        submitting.set(false)
        return
      }
    }
    const result = await onSubmit(controller.signal.value)
    submitting.set(false)
    if (result.type === 'invalid') {
      setStatus(result)
    }
  }
  return {
    controller: controller as unknown as ObjectController<T>,
    setStatus,
    submit: submitHandler,
    submitting,
  }
}
