import {
  attr,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
} from '@tempots/dom'
import { StandardSchemaV1 } from './schema/standard-schema-v1'
import {
  ControllerValidation,
  Controller,
  ControllerError,
  ObjectController,
} from './controller'
import { convertStandardSchemaIssues } from './schema'
import { Validation } from '@tempots/std'

export interface UseFormOptions<T> {
  schema: StandardSchemaV1<T, T>
  defaultValue?: T
  submit?: (value: T) => Promise<ControllerValidation>
}

export interface UseControllerOptions<T> {
  defaultValue: T
  onChange?: (value: T) => void
  validate?: (value: T) => Promise<ControllerValidation> | ControllerValidation
}

/**
 * Creates a Controller instance with automatic resource cleanup.
 * The controller will be automatically disposed when the component unmounts.
 */
export function useController<T>({
  defaultValue,
  onChange,
  validate,
}: UseControllerOptions<T>) {
  const value = prop(defaultValue)
  const status = prop<ControllerValidation>(Validation.valid)
  const disabledSignal = prop(false)

  const setStatus = (result: ControllerValidation) => {
    status.set(result)
  }

  const change = async (v: T) => {
    value.set(v)
    onChange?.(v)
    if (validate != null) {
      const result = await validate(v)
      setStatus(result)
    }
  }

  const controller = new Controller<T>([], change, value, status, {
    disabled: disabledSignal,
  })

  // Add disposal logic for the signals we created
  controller.onDispose(() => {
    disabledSignal.dispose()
    value.dispose()
    status.dispose()
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
    attr.value(value.value),
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
    attr.valueAsNumber(value.value),
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

export type UseFormResult<T> = {
  controller: ObjectController<T>
  setStatus: (result: ControllerValidation) => void
  onSubmit: (e: Event) => Promise<void>
}

export function useForm<T>({
  defaultValue = {} as T,
  schema,
  submit = async () => Validation.valid,
}: UseFormOptions<T>): UseFormResult<T> {
  const { controller: baseController, setStatus } = useController({
    defaultValue,
    validate: async v =>
      standardSchemaResultToValidation(await schema['~standard'].validate(v)),
  })
  const controller = baseController.object()
  const onSubmit = async (e: Event) => {
    e.preventDefault()
    const result = await submit(controller.value.value)
    if (result.type === 'invalid') {
      setStatus(result)
    }
  }
  return {
    controller: controller as unknown as ObjectController<T>,
    setStatus,
    onSubmit,
  }
}
