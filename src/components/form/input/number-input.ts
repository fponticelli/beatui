import {
  attr,
  emitValue,
  emitValueAsNumber,
  Empty,
  input,
  on,
  Value,
  Use,
  computedOf,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { Theme } from '../../theme'

export type NumberInputOptions = Merge<
  InputOptions<number>,
  {
    step?: Value<number>
    min?: Value<number>
    max?: Value<number>
  }
>

export const NumberInput = (options: NumberInputOptions) => {
  const { value, step, min, max, onBlur, onChange, onInput, disabled } = options

  return Use(Theme, theme => {
    return InputContainer({
      ...options,
      input: input.number(
        CommonInputAttributes(options),
        attr.valueAsNumber(value),
        attr.step(step),
        attr.min(min),
        attr.max(max),
        attr.class('bc-input'),
        attr.class(
          computedOf(
            theme,
            disabled ?? false
          )(({ theme }, disabled) =>
            theme.numberInput({
              disabled,
            })
          )
        ),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitValueAsNumber(onChange)) : Empty,
        onInput != null ? on.input(emitValueAsNumber(onInput)) : Empty
      ),
    })
  })
}
