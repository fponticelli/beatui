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
      attr.class('bc-checkbox-input'),
      input.checkbox(
        CommonInputAttributes(options),
        attr.checked(value),
        attr.class('bc-checkbox-input__checkbox'),
        onBlur != null ? on.blur(emitValue(onBlur)) : Empty,
        onChange != null ? on.change(emitChecked(onChange)) : Empty
      ),
      placeholder != null
        ? html.span(
            attr.class('bc-checkbox-input__label'),
            MutedLabel(placeholder)
          )
        : Empty
    ),
  })
}
