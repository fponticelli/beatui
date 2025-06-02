import { attr, Fragment, TNode, Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { ValueController } from '../controller/value-controller'

export type CommonInputOptions = {
  autocomplete?: Value<string>
  autofocus?: Value<boolean>
  class?: Value<string>
  disabled?: Value<boolean>
  hasError?: Value<boolean>
  name?: Value<string>
  placeholder?: Value<string>
  id?: Value<string>
}

export type InputOptions<V> = Merge<
  CommonInputOptions,
  {
    value: Value<V>
    before?: TNode
    after?: TNode
    onChange?: (value: V) => void
    onInput?: (value: V) => void
    onBlur?: () => void
  }
>

export const CommonInputAttributes = ({
  autocomplete,
  autofocus,
  class: cls,
  disabled,
  name,
  placeholder,
  id,
}: CommonInputOptions) => {
  return Fragment(
    attr.autocomplete(autocomplete),
    attr.autofocus(autofocus),
    attr.class(cls),
    attr.disabled(disabled),
    attr.name(name ?? id),
    attr.placeholder(placeholder),
    attr.id(id)
  )
}

export const inputOptionsFromController = <T>(
  controller: ValueController<T>
) => {
  return {
    id: controller.name,
    disabled: controller.disabled,
    value: controller.value,
    hasError: controller.hasError,
  }
}

export const inputOptionsFromMappedController = <T, U>(
  controller: ValueController<U>,
  map: (value: U) => T
) => {
  return {
    ...inputOptionsFromController(controller),
    value: controller.value.map(map),
  }
}
