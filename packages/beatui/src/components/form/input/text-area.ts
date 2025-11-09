import {
  attr,
  computedOf,
  emitValue,
  Empty,
  html,
  on,
  Value,
} from '@tempots/dom'
import {
  generateInputContainerInputClasses,
  InputContainer,
} from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { Merge } from '@tempots/std'
import { ControlSize } from '../../theme'

export type TextAreaOptions = Merge<
  InputOptions<string>,
  {
    rows?: Value<number>
  }
>

export const TextArea = (options: TextAreaOptions) => {
  const { value, onBlur, onChange, onInput, rows } = options

  return InputContainer({
    baseContainer: true,
    ...options,
    input: html.textarea(
      attr.class(
        computedOf(options.size ?? 'md')(size =>
          generateInputContainerInputClasses(
            false,
            (size ?? 'md') as ControlSize
          )
        )
      ),
      CommonInputAttributes(options),
      attr.rows(rows ?? 3),
      attr.value(value),
      attr.class('bc-input'),
      onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
      onChange != null ? on.change(emitValue(onChange)) : Empty,
      onInput != null ? on.input(emitValue(onInput)) : Empty
    ),
  })
}
