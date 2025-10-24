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

export interface UseFormOptions<T> {
  schema?: StandardSchemaV1<T, T>
  initialValue?: Value<T>
  onSubmit?: (value: T) => Promise<ControllerValidation>
  validationMode?: 'onSubmit' | 'continuous' | 'touchedOrSubmit'
  validateDebounceMs?: number
}

export interface UseControllerOptions<T> {
  initialValue: Value<T>
  onChange?: (value: T) => void
  validate?: (value: T) => Promise<ControllerValidation> | ControllerValidation
  equals?: (a: T, b: T) => boolean
  validationMode?: 'onSubmit' | 'continuous' | 'touchedOrSubmit'
  validateDebounceMs?: number
}

/**
 * Creates a Controller instance with automatic resource cleanup.
 * The controller will be automatically disposed when the component unmounts.
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
  const modeSignal = prop<ValidationMode>(validationMode ?? 'touchedOrSubmit')

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

export function connectCommonAttributes<T>(value: Controller<T>) {
  return Fragment(attr.disabled(value.disabled), attr.name(value.name))
}

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
 * Helper function to create nested dependencies structure for field paths
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

export type UseFormResult<T extends object> = {
  controller: ObjectController<T>
  setStatus: (result: ControllerValidation) => void
  submit: (e?: Event) => Promise<void>
  submitting: Signal<boolean>
}

export function useForm<T extends object>({
  initialValue = {} as Value<T>,
  schema,
  onSubmit = async () => Validation.valid,
  validationMode,
  validateDebounceMs,
}: UseFormOptions<T>): UseFormResult<T> {
  const { controller: baseController, setStatus } = useController({
    initialValue,
    validationMode: validationMode ?? 'touchedOrSubmit',
    validateDebounceMs,
    validate:
      (validationMode ?? 'touchedOrSubmit') === 'onSubmit' || schema == null
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
    if ((validationMode ?? 'touchedOrSubmit') === 'onSubmit') {
      const v = controller.signal.value
      const validate = schema?.['~standard'].validate
      if (validate == null) {
        submitting.set(false)
        return
      }
      const result = standardSchemaResultToValidation(await validate(v))
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
