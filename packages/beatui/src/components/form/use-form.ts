import {
  attr,
  emitValue,
  emitValueAsNumber,
  Fragment,
  on,
  prop,
} from '@tempots/dom'
import { StandardSchemaV1 } from './schema/standard-schema-v1'
import { FormController, ValidationResult, ValueController } from './controller'
import { convertStandardSchemaIssues } from './schema'
import { strictEqual } from '@tempots/std'

export interface UseFormOptions<In, Out = In> {
  schema: StandardSchemaV1<In, Out>
  defaultValue?: In
}

export function connectCommonAttributes<T>(value: ValueController<T>) {
  return Fragment(attr.disabled(value.disabled), attr.name(value.name))
}

export function connectStringInput(
  value: ValueController<string>,
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
  value: ValueController<number>,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useForm<In extends Record<string, any>, Out = In>({
  defaultValue = {} as In,
  schema,
}: UseFormOptions<In, Out>) {
  // TODO
  // - [ ] submitting
  // - [ ] validation strategy
  //   - [ ] validate on submit
  //   - [ ] continuous validation
  //   - [ ] validate touched and on submit
  // - [ ] dirty
  // - [ ] touched
  // - [ ] file support
  // - [ ] date support
  // - [ ] boolean support
  // - [x] array
  // - [x] unions
  // - [x] disabled

  const value = prop(defaultValue)
  const status = prop<ValidationResult>({ type: 'Valid' })
  const disabled = prop(false)
  const change = async (v: In) => {
    value.set(v)
    const result = await schema['~standard'].validate(v)
    if (result.issues != null) {
      status.set({
        type: 'Invalid',
        ...convertStandardSchemaIssues(result.issues),
      })
    } else {
      status.set({ type: 'Valid' })
    }
  }
  const controller = new FormController<In>(
    [],
    change,
    value,
    status,
    {
      disabled,
    },
    strictEqual
  )
  return controller
}
