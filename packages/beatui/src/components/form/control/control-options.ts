import { TNode, Value } from '@tempots/dom'
import { Merge } from '@tempots/std'
import { Controller } from '../controller/controller'

export type ControlWrapperOptions<S> = {
  controller: Controller<S>
  required?: Value<boolean>
  label?: TNode
  context?: TNode
  description?: TNode
  horizontal?: Value<boolean>
}

export type ControlOptions<S> = Merge<
  ControlWrapperOptions<S>,
  {
    onBlur?: () => void
    onChange?: (value: S) => void
    placeholder?: Value<string>
    autofocus?: Value<boolean>
    name?: Value<string>
    autocomplete?: Value<string>
    class?: Value<string>
  }
>
