import {
  attr,
  emitChecked,
  emitValue,
  Empty,
  html,
  input,
  on,
} from '@tempots/dom'
import { InputContainer } from './input-container'
import { CommonInputAttributes, InputOptions } from './input-options'
import { MutedLabel } from '../../typography/label'

export const CheckboxInput = (options: InputOptions<boolean>) => {
  const { value, onBlur, onChange, placeholder } = options

  return InputContainer({
    growInput: false,
    ...options,
    input: html.span(
      attr.class('flex flex-row items-center gap-2'),
      input.checkbox(
        CommonInputAttributes(options),
        attr.checked(value),
        attr.class(
          'h-5 w-5 border-gray-300 text-indigo-600 focus:ring-indigo-600'
        ),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitChecked(onChange)) : Empty
      ),
      placeholder != null ? MutedLabel(placeholder) : Empty
    ),
  })
}
