import { aria, attr, Fragment, TNode, Value } from '@tempots/dom'
import { ControlSize } from '../../theme'
import { Merge } from '@tempots/std'

export type CommonInputOptions = {
  autocomplete?: Value<string>
  autofocus?: Value<boolean>
  class?: Value<string>
  disabled?: Value<boolean>
  hasError?: Value<boolean>
  name?: Value<string>
  placeholder?: Value<string>
  id?: Value<string>
  required?: Value<boolean>
  /**
   * Visual size of the control, aligned with Button sizes.
   * Defaults to 'md' when omitted.
   */
  size?: Value<ControlSize>
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
  required,
  hasError,
}: CommonInputOptions) => {
  return Fragment(
    attr.autocomplete(autocomplete),
    attr.autofocus(autofocus),
    attr.class(cls),
    attr.disabled(disabled),
    attr.name(name ?? id),
    attr.placeholder(placeholder),
    attr.id(id),
    aria.required(required),
    hasError != null
      ? aria.invalid(
          (hasError ?? false) as Value<
            boolean | 'true' | 'false' | 'grammar' | 'spelling'
          >
        )
      : null
  )
}
