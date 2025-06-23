import {
  attr,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
} from '@tempots/dom'
import { StandardSchemaV1 } from './schema/standard-schema-v1'
import { ValidationResult, Controller } from './controller'
import { convertStandardSchemaIssues } from './schema'

export interface UseFormOptions<In, Out = In> {
  schema: StandardSchemaV1<In, Out>
  defaultValue?: In
}

export interface UseControllerOptions<In> {
  defaultValue: In
  onChange?: (value: In) => void
  validate?: (value: In) => Promise<ValidationResult> | ValidationResult
}

/**
 * Creates a Controller instance with automatic resource cleanup.
 * The controller will be automatically disposed when the component unmounts.
 */
export function useController<In>({
  defaultValue,
  onChange,
  validate,
}: UseControllerOptions<In>) {
  const value = prop(defaultValue)
  const status = prop<ValidationResult>({ type: 'Valid' })
  const disabledSignal = prop(false)

  const change = async (v: In) => {
    value.set(v)
    onChange?.(v)
    if (validate != null) {
      const result = await validate(v)
      status.set(result)
    }
  }

  const controller = new Controller<In>([], change, value, status, {
    disabled: disabledSignal,
  })

  // Add disposal logic for the signals we created
  controller.onDispose(() => {
    disabledSignal.dispose()
    value.dispose()
    status.dispose()
  })

  return controller
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

export function standardSchemaResultToValidationResult<Out>(
  result: StandardSchemaV1.Result<Out>
): ValidationResult {
  if (result.issues != null) {
    return {
      type: 'Invalid',
      ...convertStandardSchemaIssues(result.issues),
    }
  } else {
    return { type: 'Valid' }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<In extends Record<string, any>, Out = In>({
  defaultValue = {} as In,
  schema,
}: UseFormOptions<In, Out>) {
  return useController({
    defaultValue,
    validate: async v =>
      standardSchemaResultToValidationResult(
        await schema['~standard'].validate(v)
      ),
  })
}
